import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import pb from '../lib/pocketbase';

const AppContext = createContext();

export const useAppContext = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(pb.authStore.model);
  const [inventario, setInventario] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [settings, setSettings] = useState(null);
  const [historialMeses, setHistorialMeses] = useState([]); // <-- Siempre estará vacía
  const [loading, setLoading] = useState(true);

  // --- Definición de Mes Actual ---
  const mesActualStr = new Date().toISOString().slice(0, 7);
  const ventasMesActual = ventas.filter(v => v.fecha?.startsWith(mesActualStr));
  const egresosMesActual = []; 
  
  const mesActual = { 
    mes: mesActualStr, 
    ventasMes: ventasMesActual, 
    egresosMes: egresosMesActual 
  };
  
  // --- OBTENER DATOS DEL BACKEND (IGNORANDO HISTORIAL) ---
  const fetchData = useCallback(async (abortSignal = null) => { 
    if (!pb.authStore.model) return;
    setLoading(true);
    
    const options = { 
        filter: `owner = "${pb.authStore.model.id}"`, 
        sort: '-created', 
        signal: abortSignal 
    };
    
    try {
      const userId = pb.authStore.model.id;
      
      const [inventarioRes, ventasRes, settingsRes /*, historialRes */] = await Promise.all([
        pb.collection('inventario').getFullList(options),
        pb.collection('ventas').getFullList(options),
        pb.collection('settings').getFirstListItem(`owner = "${userId}"`, { signal: abortSignal }).catch(() => null),
        
        // 🚨 IGNORANDO HISTORIAL: Esta línea causaba el error 400 y se reemplaza con un array vacío.
        // pb.collection('historialMeses').getFullList({ 
        //     filter: `owner = "${userId}"`, 
        //     sort: '-mes', 
        //     signal: abortSignal 
        // }),
        Promise.resolve([]) // Sustitución segura para la Promise.all
      ]);

      setInventario(inventarioRes);
      setVentas(ventasRes);
      
      // Ya que no lo cargamos, lo inicializamos como vacío.
      setHistorialMeses([]); 
      
      if (settingsRes) {
        settingsRes.gastosFijos = parseFloat(settingsRes.gastosFijos) || 0; 
        setSettings(settingsRes);
      } else {
        const newSettings = await pb.collection('settings').create({ owner: userId, gastosFijos: 0, isPremium: false });
        setSettings(newSettings);
      }

    } catch (error) {
      if (error.name === 'AbortError' || error.message.includes('autocancelled')) {
          console.log("PocketBase fetch aborted cleanly or autocancelled.");
          return; 
      }
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // --- Manejo de Efectos y Cancelación ---
  useEffect(() => {
    const controller = new AbortController();
    const updateUser = () => setUser(pb.authStore.model);
    const unsubscribe = pb.authStore.onChange(updateUser, true);

    if (pb.authStore.isValid) {
      fetchData(controller.signal); 
    } else {
      setLoading(false);
    }

    return () => {
      unsubscribe();
      controller.abort(); 
    };
  }, [fetchData]);

  // --- LÓGICA DE NEGOCIO ---
  const calcularBalance = useCallback(() => {
    
    const totalVentas = ventasMesActual.reduce((sum, v) => sum + (parseFloat(v.total) || 0), 0); 
    
    const valorInventario = inventario.reduce((sum, p) => sum + (p.precio * p.stock), 0);
    const totalEgresos = egresosMesActual.reduce((sum, e) => sum + e.monto, 0);
    
    const gastosFijosNum = parseFloat(settings?.gastosFijos) || 0; 
    
    const utilidadNeta = totalVentas - totalEgresos - gastosFijosNum; 
    
    return { totalVentas, valorInventario, totalEgresos, utilidadNeta }; 
  }, [ventasMesActual, inventario, egresosMesActual, settings]);
  
  // --- FUNCIONES ASÍNCRONAS (CRUD) ---

  const login = async (email, password) => {
    try {
      await pb.collection('users').authWithPassword(email, password);
      await fetchData();
      return true;
    } catch (error) {
      console.error("Error de login:", error);
      return false;
    }
  };

  const logout = () => {
    pb.authStore.clear();
    setUser(null);
    setInventario([]);
    setVentas([]);
    setSettings(null);
    setHistorialMeses([]); 
  };
  
  const agregarProducto = async (productoData) => {
    if (!pb.authStore.model) return null;
    try {
      const dataToSend = {
          ...productoData,
          precio: parseFloat(productoData.precio) || 0,
          stock: parseInt(productoData.stock, 10) || 0,
          owner: pb.authStore.model.id,
      };

      const newRecord = await pb.collection('inventario').create(dataToSend);
      setInventario(prev => [newRecord, ...prev]);
      return newRecord;
    } catch (e) {
      console.error("Error al agregar producto:", e);
      return null;
    }
  };


  const editarProducto = async (id, productoData) => {
    try {
      const dataToSend = {
        ...productoData,
        precio: parseFloat(productoData.precio) || 0,
        stock: parseInt(productoData.stock, 10) || 0,
      };

      const updatedRecord = await pb.collection('inventario').update(id, dataToSend);
      setInventario(prev => prev.map(p => p.id === id ? updatedRecord : p));
      return updatedRecord;
    } catch (e) {
      console.error("Error al editar producto:", e);
      return null;
    }
  };

  const eliminarProducto = async (id) => {
    try {
      await pb.collection('inventario').delete(id);
      setInventario(prev => prev.filter(p => p.id !== id));
      return true;
    } catch (e) {
      console.error("Error al eliminar producto:", e);
      return false;
    }
  };
  
  const crearProducto = async (data) => await agregarProducto(data);
  const actualizarProducto = async (id, data) => await editarProducto(id, data);

  const registrarVenta = async (ventaData) => {
    if (!pb.authStore.model) return false;
    const producto = inventario.find(p => p.id === ventaData.productoId);
    if (!producto || producto.stock < ventaData.cantidad) {
      alert("Stock insuficiente.");
      return false;
    }

    try {
      const precioUnitario = parseFloat(producto.precio) || 0;
      const cantidad = parseInt(ventaData.cantidad, 10);
      const descuentoAplicado = parseFloat(ventaData.descuento) || 0; 
      
      const subtotal = precioUnitario * cantidad;
      const totalVenta = subtotal - descuentoAplicado; 
      
      const dataToSend = {
        productoId: ventaData.productoId,
        cantidad: cantidad,
        cliente: ventaData.cliente || '',
        descuento: descuentoAplicado,
        total: totalVenta, 
        fecha: new Date().toISOString(),
        owner: pb.authStore.model.id,
      };

      const nuevaVenta = await pb.collection('ventas').create(dataToSend);
      
      const nuevoStock = producto.stock - cantidad;
      const updatedProducto = await pb.collection('inventario').update(producto.id, { stock: nuevoStock });

      setVentas(prev => [nuevaVenta, ...prev]);
      setInventario(prev => prev.map(p => p.id === producto.id ? updatedProducto : p));
      
      return true;
    } catch (e) {
      console.error("Error al registrar la venta:", e);
      return false;
    }
  };

  const actualizarSettings = async (nuevosSettings) => {
    if (!settings) return;
    
    const dataToSend = {
      ...nuevosSettings,
      gastosFijos: parseFloat(nuevosSettings.gastosFijos) || 0,
    };

    try {
      const updatedSettings = await pb.collection('settings').update(settings.id, dataToSend);
      updatedSettings.gastosFijos = parseFloat(updatedSettings.gastosFijos) || 0;
      setSettings(updatedSettings);
      return true;
    } catch (e) {
      console.error("Error al actualizar settings:", e);
      return false;
    }
  };
  
  const cerrarMes = async (balanceMes) => {
    if (!pb.authStore.model) return false;
    const mes = new Date().toISOString().slice(0, 7);

    // 🚨 IGNORANDO HISTORIAL: Las variables de balance ya no se usan, solo se limpia.
    
    try {
        // 🚨 COMENTAR ESTA SECCIÓN: Ignoramos la creación del registro en la colección rota.
        /*
        const newRecord = await pb.collection('historialMeses').create({
            mes: mes,
            utilidad: utilidadNeta.toFixed(2), 
            ventas: totalVentas.toFixed(2),
            egresos: totalEgresos.toFixed(2),
            gastosFijos: gastosFijos, 
            owner: pb.authStore.model.id, 
        });

        setHistorialMeses(prev => [{
            ...newRecord,
            utilidad: parseFloat(newRecord.utilidad),
            ventas: parseFloat(newRecord.ventas),
            egresos: parseFloat(newRecord.egresos),
            gastosFijos: parseFloat(newRecord.gastosFijos),
        }, ...prev]);
        */
        
        // Mantener la limpieza de ventas
        await Promise.all(ventasMesActual.map(v => pb.collection('ventas').delete(v.id)));
        setVentas(prev => prev.filter(v => v.fecha?.slice(0, 7) !== mes)); 
        
        alert("Mes cerrado exitosamente. Las ventas han sido borradas. (El historial se ignoró temporalmente)");
        return true;
    } catch (e) {
        console.error("Error al cerrar el mes:", e);
        alert(`Error al cerrar el mes. Error: ${e.message}`);
        return false;
    }
  };


  const value = {
    user,
    login,
    logout,
    loading,
    inventario,
    ventas: ventasMesActual, 
    allVentas: ventas, 
    settings,
    historialMeses, 
    isPremium: settings?.isPremium ?? false,
    gastosFijos: parseFloat(settings?.gastosFijos) || 0, 
    mesActual, 
    // Funciones
    calcularBalance,
    agregarProducto,
    editarProducto,
    eliminarProducto,
    crearProducto,
    actualizarProducto,
    registrarVenta,
    actualizarSettings,
    cerrarMes,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};