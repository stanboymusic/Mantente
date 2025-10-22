// src/context/AppContext.jsx
import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
// Importación corregida para Supabase.js
import pb from '../lib/supabase.js'; 

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

// Función auxiliar para obtener el usuario de Supabase
const getSupabaseUser = async () => {
    // Supabase usa `auth.getUser()` para verificar la sesión
    const { data: { user } } = await pb.auth.getUser();
    return user;
};

export const AppProvider = ({ children }) => {
    // Inicializamos el estado del usuario a null y lo cargamos en el useEffect
    const [user, setUser] = useState(null); 
    const [inventario, setInventario] = useState([]);
    const [ventas, setVentas] = useState([]);
    const [settings, setSettings] = useState(null);
    const [historialMeses, setHistorialMeses] = useState([]); 
    const [loading, setLoading] = useState(true);

    // --- Definición de Mes Actual (Lógica local) ---
    const mesActualStr = new Date().toISOString().slice(0, 7);
    const ventasMesActual = ventas.filter(v => v.fecha?.startsWith(mesActualStr));
    const egresosMesActual = []; // Aún no se usa, pero está listo

    const mesActual = { 
        mes: mesActualStr, 
        ventasMes: ventasMesActual, 
        egresosMes: egresosMesActual 
    };
    
    // --- Mapa de Inventario (para cálculos de costo) ---
    // Un objeto para buscar productos por ID rápidamente
    const inventarioMap = React.useMemo(() => {
        return inventario.reduce((acc, item) => {
            acc[item.id] = item;
            return acc;
        }, {});
    }, [inventario]);

    // --- OBTENER DATOS DEL BACKEND (fetchData) ---
    const fetchData = useCallback(async (abortSignal = null) => { 
        const currentUser = await getSupabaseUser();
        if (!currentUser) {
             setLoading(false);
             return;
        }

        setLoading(true);

        try {
            // 1. OBTENER INVENTARIO
            // SINTAXIS SUPABASE: pb.from('tabla').select().eq('columna', valor)
            const { data: invData, error: invError } = await pb
                .from('inventario')
                .select('*')
                .eq('owner', currentUser.id); // Filtrar por 'owner'

            if (invError) throw invError;
            // ✅ CORRECCIÓN: Parsear números al cargar
            const safeInv = (invData || []).map(p => ({
                ...p,
                precio: parseFloat(p.precio) || 0,
                costo: parseFloat(p.costo) || 0,
                stock: parseInt(p.stock) || 0,
            }));
            setInventario(safeInv);
            
            // 2. OBTENER VENTAS
            const { data: ventasData, error: ventasError } = await pb
                .from('ventas')
                .select('*')
                .eq('owner', currentUser.id); 
                
            if (ventasError) throw ventasError;
            const safeVentas = (ventasData || []).map(v => ({
                ...v,
                cantidad: parseFloat(v.cantidad) || 0,
                total: parseFloat(v.total) || 0,
                costoTotal: parseFloat(v.costoTotal) || 0, // ✅ Costo de la venta
                descuento: parseFloat(v.descuento) || 0,
            }));
            setVentas(safeVentas);


            // 3. OBTENER SETTINGS (configuración)
            const { data: settingsData, error: settingsError } = await pb
                .from('settings')
                .select('*')
                .eq('owner', currentUser.id) 
                .single(); 

            if (settingsError && settingsError.code !== 'PGRST116') { 
                console.warn("Settings no encontrado, se usará valor predeterminado.");
            }
            
            const safeSettings = settingsData ? {
                ...settingsData,
                gastosFijos: parseFloat(settingsData.gastosFijos) || 0,
                isPremium: settingsData.isPremium || false,
            } : null;
            setSettings(safeSettings);
            
            // ✅ CORRECCIÓN: Cargar el historial de meses
            const { data: histData, error: histError } = await pb
                .from('historial')
                .select('*')
                .eq('owner', currentUser.id)
                .order('mes', { ascending: false }); // Ordenar por mes

            if (histError) {
                console.warn("Error al cargar historial (¿La tabla 'historial' existe?)", histError);
            }
            setHistorialMeses(histData || []); 

        } catch (e) {
            console.error("Error al cargar datos:", e);
        } finally {
            setLoading(false);
        }
    }, []); // Dependencias: [] (solo se crea una vez)

    // --- AUTENTICACIÓN (LOGIN) ---
    const login = useCallback(async (email, password) => {
        try {
            const { data, error } = await pb.auth.signInWithPassword({ 
                email, 
                password 
            });

            if (error) {
                console.error("Supabase Login Error:", error);
                return false;
            }

            setUser(data.user);
            await fetchData(); 

            return true;
        } catch (e) {
            console.error("Error en login:", e);
            return false;
        }
    }, [fetchData]);

    // --- AUTENTICACIÓN (LOGOUT) ---
    const logout = useCallback(async () => {
        try {
            const { error } = await pb.auth.signOut();
            if (error) throw error;
            
            setUser(null);
            setInventario([]);
            setVentas([]);
            setSettings(null);
            setHistorialMeses([]);
            setLoading(false);
        } catch (e) {
            console.error("Error en logout:", e);
        }
    }, []);
    
    // --- EFECTO DE Carga Inicial y Auth Change Listener ---
    useEffect(() => {
        let isMounted = true;
        
        getSupabaseUser().then(u => {
            if (isMounted) {
                setUser(u);
                if (u) {
                    fetchData();
                } else {
                    setLoading(false); 
                }
            }
        });
        
        const { data: listener } = pb.auth.onAuthStateChange(
            (event, session) => {
                if (isMounted) {
                    if (event === 'SIGNED_IN' && session?.user) {
                        setUser(session.user);
                        fetchData();
                    } else if (event === 'SIGNED_OUT') {
                        setUser(null);
                        setInventario([]);
                        setVentas([]);
                        setSettings(null);
                        setHistorialMeses([]);
                        setLoading(false);
                    }
                }
            }
        );

        return () => {
            isMounted = false;
            if (listener && typeof listener.unsubscribe === 'function') {
                listener.unsubscribe();
            }
        };
    }, [fetchData]);

    // --- OPERACIONES CRUD (Supabase) ---

    // Crear/Actualizar Producto
    const upsertProducto = useCallback(async (data) => {
        if (!user) return;
        
        try {
            // ✅ CORRECCIÓN: 'isUpdate' se basa en si 'data.id' existe
            const isUpdate = !!data.id;
            
            const dataToSave = {
                nombre: data.nombre,
                precio: parseFloat(data.precio) || 0,
                costo: parseFloat(data.costo) || 0, // ✅ AÑADIDO
                stock: parseInt(data.stock) || 0,
                categoria: data.categoria || '',
                owner: user.id, // Asegurar el dueño
            };
            
            // Si es 'update', quitamos 'owner' para no cambiarlo (aunque RLS lo protege)
            if (isUpdate) {
                delete dataToSave.owner;
            }

            const query = pb.from('inventario');
            let response;
            
            if (isUpdate) {
                // SINTAXIS SUPABASE: Actualizar
                const { data: updatedData, error } = await query
                    .update(dataToSave)
                    .eq('id', data.id) // ✅ Usa el ID de la data
                    .eq('owner', user.id) // Doble seguridad
                    .select() 
                    .single(); 

                if (error) throw error;
                response = updatedData;

            } else {
                // SINTAXIS SUPABASE: Insertar
                const { data: insertedData, error } = await query
                    .insert(dataToSave)
                    .select()
                    .single();

                if (error) throw error;
                response = insertedData;
            }
            
            // Parsear números antes de actualizar estado
            const safeResponse = {
                 ...response,
                precio: parseFloat(response.precio) || 0,
                costo: parseFloat(response.costo) || 0,
                stock: parseInt(response.stock) || 0,
            };

            // Actualizar estado local
            if (isUpdate) {
                setInventario(prev => prev.map(p => p.id === safeResponse.id ? safeResponse : p));
            } else {
                setInventario(prev => [safeResponse, ...prev]);
            }
            return true;

        } catch (e) {
            console.error("Error al guardar producto:", e);
            alert(`Error al guardar producto: ${e.message}`);
            return false;
        }
    }, [user]);

    // Eliminar Producto
    const eliminarProducto = useCallback(async (id) => {
        if (!user) return;
        try {
            const { error } = await pb
                .from('inventario')
                .delete()
                .eq('id', id)
                .eq('owner', user.id); 

            if (error) throw error;

            setInventario(prev => prev.filter(p => p.id !== id));
            return true;
        } catch (e) {
            console.error("Error al eliminar producto:", e);
            alert(`Error al eliminar producto: ${e.message}`);
            return false;
        }
    }, [user]);

    // Registrar Venta
    const registrarVenta = useCallback(async (ventaData) => {
        if (!user) return false;
        
        // ✅ CORRECCIÓN: 'ventaData' debe venir con 'productoId' (camelCase)
        const producto = inventario.find(p => p.id === ventaData.productoId);
        
        if (!producto) {
            alert("Producto no encontrado. El ID buscado era: " + ventaData.productoId);
            return false;
        }
        
        const cantidadNum = parseInt(ventaData.cantidad);
        const descuentoNum = parseFloat(ventaData.descuento) || 0;
        const totalVenta = (producto.precio * cantidadNum) - descuentoNum;
        // ✅ CÁLCULO DE COSTO REAL
        const costoTotalVenta = (producto.costo * cantidadNum); 

        // 1. Preparar datos de venta
        const dataToSave = {
            productoId: ventaData.productoId, // ✅ Estandarizado a camelCase
            cantidad: cantidadNum,
            total: totalVenta,
            costoTotal: costoTotalVenta, // ✅ Guardamos el costo
            descuento: descuentoNum,
            cliente: ventaData.cliente || 'Consumidor Final',
            fecha: new Date().toISOString(),
            owner: user.id,
        };

        try {
            // SINTAXIS SUPABASE: Insertar Venta
            const { data: newVenta, error: ventaError } = await pb
                .from('ventas')
                .insert(dataToSave)
                .select()
                .single();

            if (ventaError) throw ventaError;

            // 2. Actualizar stock del producto 
            const nuevoStock = producto.stock - cantidadNum;
            const updatedProduct = { 
                ...producto, 
                stock: nuevoStock 
            };
            
            // Usamos upsertProducto (que ya está definido) para actualizar
            const success = await upsertProducto(updatedProduct);
            
            if (!success) throw new Error("Fallo al actualizar stock.");
            
            // 3. Actualizar estado local (parseando números)
            setVentas(prev => [{
                ...newVenta, 
                cantidad: parseFloat(newVenta.cantidad) || 0, 
                total: parseFloat(newVenta.total) || 0, 
                costoTotal: parseFloat(newVenta.costoTotal) || 0,
                descuento: parseFloat(newVenta.descuento) || 0
            }, ...prev]);

            return true;
        } catch (e) {
            console.error("Error al registrar venta:", e);
            alert(`Error al registrar venta: ${e.message}`);
            return false;
        }
    }, [user, inventario, upsertProducto]);
    
    // Actualizar Settings (isPremium y gastosFijos)
    const actualizarSettings = useCallback(async (newSettings) => {
        if (!user) return false;
        
        try {
            const isUpdate = settings?.id;
            
            const dataToSave = {
                // ✅ CORRECCIÓN: Usar ?? para permitir 'false'
                isPremium: newSettings.isPremium ?? settings?.isPremium ?? false,
                gastosFijos: parseFloat(newSettings.gastosFijos) ?? settings?.gastosFijos ?? 0,
                owner: user.id, 
            };
            
            const query = pb.from('settings');
            let response;
            
            if (isUpdate) {
                // Actualizar Settings
                delete dataToSave.owner; // No cambiar el dueño
                const { data: updatedData, error } = await query
                    .update(dataToSave)
                    .eq('id', settings.id)
                    .select()
                    .single();
                    
                if (error) throw error;
                response = updatedData;
            } else {
                // Insertar Settings (Si no existe, se crea)
                const { data: insertedData, error } = await query
                    .insert(dataToSave)
                    .select()
                    .single();
                    
                if (error) throw error;
                response = insertedData;
            }
            
            setSettings({
                ...response,
                gastosFijos: parseFloat(response.gastosFijos) || 0,
            });
            return true;
        } catch (e) {
            console.error("Error al actualizar settings:", e);
            alert(`Error al actualizar settings: ${e.message}`);
            return false;
        }
    }, [user, settings]);
    
    // --- CÁLCULOS ---
    
    const calcularBalance = useCallback(() => {
        const totalVentas = ventasMesActual.reduce((sum, v) => sum + (v.total || 0), 0);
        // ✅ CORRECCIÓN: Calcular utilidad bruta usando el costo guardado
        const totalCostoVentas = ventasMesActual.reduce((sum, v) => sum + (v.costoTotal || 0), 0);
        
        const totalEgresos = egresosMesActual.reduce((sum, e) => sum + (e.monto || 0), 0);
        
        // Utilidad Bruta = Ventas - Costo de Ventas - Otros Egresos
        const utilidadBruta = totalVentas - totalCostoVentas - totalEgresos;
        
        // Utilidad Neta = Utilidad Bruta - Gastos Fijos
        const utilidadNeta = utilidadBruta - (parseFloat(settings?.gastosFijos) || 0);

        // ✅ CÁLCULO: Valor total del inventario (Costo)
        const valorInventario = inventario.reduce((sum, p) => sum + ((p.costo || 0) * (p.stock || 0)), 0);

        return {
            totalVentas,
            totalCostoVentas, // Exportamos esto
            totalEgresos,
            gastosFijos: parseFloat(settings?.gastosFijos) || 0,
            utilidadBruta,
            utilidadNeta,
            valorInventario, // Exportamos esto
        };
    }, [ventasMesActual, egresosMesActual, settings, inventario]);

    const cerrarMes = useCallback(async () => {
        if (!user) return false;
        
        const mes = mesActual.mes;
        const ventasDelMes = mesActual.ventasMes; // Ventas a eliminar
        const balance = calcularBalance();
        
        try {
            // ** 1. REGISTRAR HISTORIAL **
            const newRecordData = {
                mes,
                ventas: balance.totalVentas,
                egresos: balance.totalEgresos, // Aún es 0, pero está listo
                costos: balance.totalCostoVentas, // ✅ Guardamos costos
                gastosFijos: balance.gastosFijos,
                utilidad: balance.utilidadNeta,
                owner: user.id,
            };

            const { data: newRecord, error: histError } = await pb
                .from('historial')
                .insert(newRecordData)
                .select()
                .single();

            if (histError) {
                 console.error("Error al guardar historial.", histError);
                 throw histError; // Detener si falla
            } else {
                 setHistorialMeses(prev => [newRecord, ...prev]);
            }
            
            // ** 2. ELIMINAR VENTAS DEL MES CERRADO **
            const idsToDelete = ventasDelMes.map(v => v.id);

            if (idsToDelete.length > 0) {
                const { error: deleteError } = await pb
                    .from('ventas')
                    .delete()
                    .in('id', idsToDelete) 
                    .eq('owner', user.id); 
                    
                if (deleteError) throw deleteError;
            }
            
            // Actualizar estado local de ventas (quitando las borradas)
            setVentas(prev => prev.filter(v => !idsToDelete.includes(v.id))); 
            
            alert("Mes cerrado exitosamente. Las ventas han sido archivadas en el historial.");
            return true;
        } catch (e) {
            console.error("Error al cerrar el mes:", e);
            alert(`Error al cerrar el mes. Error: ${e.message}`);
            return false;
        }
    }, [user, mesActual, calcularBalance]);


    // --- Context Value ---
    const value = {
        user,
        login,
        logout,
        loading,
        inventario,
        ventas: ventasMesActual, // Solo ventas del mes
        allVentas: ventas, // Todas las ventas cargadas
        settings,
        historialMeses, 
        isPremium: settings?.isPremium ?? false,
        gastosFijos: parseFloat(settings?.gastosFijos) || 0, 
        mesActual, 
        inventarioMap, // Exponemos el mapa
        // Funciones
        calcularBalance,
        cerrarMes,
        crearProducto: upsertProducto, 
        actualizarProducto: upsertProducto, // Apunta a la misma función
        eliminarProducto,
        registrarVenta,
        actualizarSettings,
        // Helper
        setIsPremium: (isPremium) => actualizarSettings({ isPremium }),
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};