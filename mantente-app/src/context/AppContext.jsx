import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase.js";
import { retryWithExponentialBackoff, isConnectionError } from "../lib/retryUtils.js";

// Crear el contexto global
const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  // Estados globales
  const [user, setUser] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumData, setPremiumData] = useState(null);
  const [perfilEmpresa, setPerfilEmpresa] = useState(null);
  const [devoluciones, setDevoluciones] = useState([]);
  // ✅ ARREGLO: Track el último estado conocido de Premium para evitar degradación involuntaria
  const [lastKnownPremium, setLastKnownPremium] = useState(false);

  // -------------------------
  // 💎 Premium (Suscripciones) - DEFINIR PRIMERO
  // -------------------------
  const checkPremiumStatus = useCallback(async (userId) => {
    try {
      if (!userId) {
        console.warn("⚠️ No hay userId para verificar premium");
        return { success: false, isPremium: null, message: "No userId" };
      }

      const { data, error } = await retryWithExponentialBackoff(
        () => supabase
          .from("premium_subscriptions")
          .select("*")
          .eq("user_id", userId)
          .eq("status", "active")
          .maybeSingle(),
        2
      );

      if (error) {
        if (isConnectionError(error)) {
          console.warn("⚠️ Error de conexión al verificar premium. Manteniendo estado actual:", error.message);
          return { success: false, message: error.message, isPremium: null, useLastKnown: true };
        }
        throw error;
      }

      if (data) {
        // Verificar que no haya expirado
        const now = new Date();
        let isActive = false;
        
        try {
          const expiresAt = new Date(data.current_period_end);
          isActive = !isNaN(expiresAt.getTime()) && now < expiresAt;
        } catch (e) {
          console.warn("⚠️ Fecha de expiración inválida:", data.current_period_end);
          isActive = false;
        }

        setIsPremium(isActive);
        setPremiumData(isActive ? data : null);
        // ✅ ARREGLO: Guardar el último estado conocido exitoso
        if (isActive) {
          setLastKnownPremium(true);
        }
        console.log("✅ Estado premium verificado:", { 
          isActive, 
          expiresAt: data.current_period_end,
          now: now.toISOString()
        });
        return { success: true, isPremium: isActive, data };
      } else {
        // Solo cambiar a false si REALMENTE no hay suscripción (no hay error)
        console.log("ℹ️ Usuario no tiene suscripción premium activa (búsqueda exitosa pero sin resultados)");
        setIsPremium(false);
        setPremiumData(null);
        // ✅ ARREGLO: El usuario NO tiene premium después de búsqueda exitosa
        setLastKnownPremium(false);
        return { success: true, isPremium: false };
      }
    } catch (error) {
      console.warn("⚠️ Error inesperado al verificar premium:", error.message);
      // ✅ ARREGLO CRÍTICO: No cambiar el estado si hay error inesperado
      // Solo loguear para debug, mantener estado anterior
      console.warn("   → Manteniendo estado premium actual para proteger usuario");
      return { success: false, message: error.message, isPremium: null, useLastKnown: true };
    }
  }, []);

  const purchasePremium = async (paypalTransactionId, paypalData) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      // Calcular fechas de suscripción
      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const { data, error } = await supabase
        .from("premium_subscriptions")
        .upsert(
          {
            user_id: user.id,
            status: "active",
            payment_method: "paypal",
            transaction_id: paypalTransactionId,
            price: 20.00,
            billing_cycle_anchor: now.toISOString(),
            current_period_start: now.toISOString(),
            current_period_end: nextMonth.toISOString(),
            updated_at: now.toISOString(),
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;

      setIsPremium(true);
      setPremiumData(data);
      console.log("✅ Suscripción premium registrada:", data);
      return { success: true, message: "¡Bienvenido a Premium!", data };
    } catch (error) {
      console.error("Error al procesar compra premium:", error.message);
      return { success: false, message: error.message };
    }
  };

  const cancelPremium = async () => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("premium_subscriptions")
        .update({
          status: "cancelled",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;

      setIsPremium(false);
      setPremiumData(null);
      console.log("✅ Suscripción premium cancelada");
      return { success: true, message: "Suscripción cancelada" };
    } catch (error) {
      console.error("Error al cancelar premium:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 🔐 Autenticación
  // -------------------------
  useEffect(() => {
    // 🔴 SIMPLIFICADO: Solo obtener sesión, sin verificar premium para evitar loops
    supabase.auth.getSession().then(({ data }) => {
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      // NO llamar checkPremiumStatus aquí para evitar loops infinitos
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      // NO llamar checkPremiumStatus aquí para evitar loops infinitos
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  // ✅ LISTENER EN TIEMPO REAL para cambios en premium_subscriptions
  // 🔴 SIMPLIFICADO: Una sola verificación sin listeners para evitar loops
  useEffect(() => {
    if (!user?.id) return;

    console.log("🔄 Usuario autenticado, verificando premium:", user.id);

    // Verificación única de premium solo para usuarios autenticados
    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted) {
        checkPremiumStatus(user.id).catch(err => {
          console.warn("Error verificando premium:", err.message);
        });
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user?.id]);

  // -------------------------
  // 📦 Inventario
  // -------------------------
  const obtenerInventario = async () => {
    try {
      if (!user?.id) {
        setInventario([]);
        return { success: true, data: [] };
      }

      const { data, error } = await retryWithExponentialBackoff(
        () => supabase
          .from("inventario")
          .select("*")
          .eq("owner", user.id)
          .order("id", { ascending: false })
      );

      if (error) throw error;
      setInventario(data || []);
      return { success: true, data };
    } catch (error) {
      if (isConnectionError(error)) {
        console.warn("⚠️ Error de conexión al obtener inventario (reintentando):", error.message);
        return { success: false, message: "Error de conexión temporal", isConnectionError: true };
      }
      console.error("Error al obtener inventario:", error.message);
      return { success: false, message: error.message };
    }
  };

  const crearProducto = async (producto) => {
    try {
      if (!producto.nombre || !producto.precio) {
        return { success: false, message: "El producto debe tener nombre y precio." };
      }

      const { data, error } = await supabase
        .from("inventario")
        .insert([
          {
            nombre: producto.nombre,
            descripcion: producto.descripcion || "",
            precio: producto.precio,
            cantidad: producto.cantidad || 0,
            categoria: producto.categoria || "General",
            fecha_agregado: new Date().toISOString().slice(0, 10),
            owner: user?.id || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setInventario((prev) => [data, ...prev]);
      console.log("✅ Producto creado:", data);
      return { success: true, message: "Producto agregado con éxito.", data };
    } catch (error) {
      console.error("❌ Error al crear producto:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 💰 Ventas
  // -------------------------
  
  // 🔖 Generar código único para cada venta (VTA-YYYY-TIMESTAMP-RANDOM)
  // ✅ ARREGLO: Usar timestamp + random para evitar race conditions y duplicados
  const generarCodigoVenta = () => {
    try {
      const hoy = new Date();
      const year = hoy.getFullYear();
      
      // Usar timestamp + números aleatorios para garantizar unicidad
      // Esto evita race conditions que ocurrían con números secuenciales
      const timestamp = Date.now().toString().slice(-5); // últimos 5 dígitos
      const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
      
      const codigoVenta = `VTA-${year}-${timestamp}${random}`;
      console.log("✅ Código de venta generado:", codigoVenta);
      return codigoVenta;
    } catch (error) {
      console.error("❌ Error al generar código de venta:", error.message);
      return null;
    }
  };

  const registrarVenta = async (venta) => {
    try {
      if (!venta.monto) {
        console.error("Datos incompletos:", venta);
        return { success: false, message: "El monto es requerido para registrar la venta." };
      }

      // --- Normalizar la fecha ---
      let fechaStr = venta.fecha || "";
      if (/^\d{4}-\d{2}$/.test(fechaStr)) fechaStr += "-01";
      if (/^\d{4}$/.test(fechaStr)) fechaStr += "-01-01";
      if (!fechaStr) fechaStr = new Date().toISOString().slice(0, 10);

      // Usa formato tipo 'date' (YYYY-MM-DD)
      const fechaFinal = fechaStr;

      // Calcular mes de cierre (primer día del mes)
      let mesCierreFinal =
        venta.mes_cierre ||
        (fechaStr.length >= 7
          ? fechaStr.slice(0, 7) + "-01"
          : new Date().toISOString().slice(0, 7) + "-01");

      // Asegurarse de que tiene formato completo YYYY-MM-DD
      if (/^\d{4}-\d{2}$/.test(mesCierreFinal)) {
        mesCierreFinal += "-01";
      }

      // 🔖 Generar código único de venta
      const codigoVenta = generarCodigoVenta();

      // Insertar en Supabase
      const { data, error } = await supabase
        .from("ventas")
        .insert([
          {
            // ✅ NUEVO: Aceptar producto individual O múltiples productos
            producto: venta.producto || "",
            cantidad: venta.cantidad || 1,
            monto: venta.monto,
            metodo_pago: venta.metodo_pago || "Efectivo",
            cliente: venta.cliente || "No especificado",
            // ✅ NUEVO: cliente_id para relación con tabla clientes
            cliente_id: venta.cliente_id || null,
            descuento: venta.descuento || 0,
            fecha: fechaFinal,
            mes_cierre: mesCierreFinal,
            codigo_venta: codigoVenta,
            owner: user?.id || null,
            // ✅ NUEVO: Productos en formato JSON para múltiples productos
            productos_json: venta.productos_json || [],
            // ✅ NUEVO: Flag para indicar si está facturada
            facturado: venta.facturado || false,
            // ✅ NUEVO: Cantidad de productos en la venta
            cantidad_productos: venta.productos_json ? venta.productos_json.length : 1,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      setVentas((prev) => [data, ...prev]);
      console.log("✅ Venta registrada correctamente:", data);
      return { success: true, message: "Venta registrada con éxito.", data };
    } catch (err) {
      console.error("❌ Error al registrar venta:", err);
      return { success: false, message: err.message || "Error desconocido." };
    }
  };

  const obtenerVentas = async () => {
    try {
      if (!user?.id) {
        setVentas([]);
        return { success: true, data: [] };
      }

      const { data, error } = await retryWithExponentialBackoff(
        () => supabase
          .from("ventas")
          .select("*")
          .eq("owner", user.id)
          .order("fecha", { ascending: false })
      );

      if (error) throw error;
      setVentas(data || []);
      return { success: true, data };
    } catch (error) {
      if (isConnectionError(error)) {
        console.warn("⚠️ Error de conexión al obtener ventas (reintentando):", error.message);
        return { success: false, message: "Error de conexión temporal", isConnectionError: true };
      }
      console.error("Error al obtener ventas:", error.message);
      return { success: false, message: error.message };
    }
  };

  // ✅ NUEVO: Obtener ventas sin facturar de un cliente específico
  const obtenerVentasSinFacturar = useCallback(async (clienteId) => {
    try {
      if (!user?.id) {
        console.error("❌ obtenerVentasSinFacturar: Usuario no autenticado");
        return { success: false, data: [], message: "Usuario no autenticado" };
      }
      
      if (!clienteId && clienteId !== 0) {
        console.error("❌ obtenerVentasSinFacturar: Cliente no especificado", { clienteId });
        return { success: false, data: [], message: "Cliente no especificado" };
      }

      // ✅ ARREGLO CRÍTICO: Convertir clienteId a número y validar
      const clienteIdNum = parseInt(clienteId);
      if (isNaN(clienteIdNum)) {
        console.error("❌ obtenerVentasSinFacturar: cliente_id inválido", { clienteId, parsed: clienteIdNum });
        return { success: false, data: [], message: "Cliente ID inválido" };
      }
      
      console.log(`🔍 Buscando ventas sin facturar para cliente ${clienteIdNum}...`);
      
      const { data, error } = await supabase
        .from("ventas")
        .select("*")
        .eq("owner", user.id)
        .eq("cliente_id", clienteIdNum)
        .eq("facturado", false)
        .order("fecha", { ascending: false });

      if (error) throw error;
      console.log(`✅ Ventas sin facturar encontradas para cliente ${clienteIdNum}: ${data?.length || 0}`, data);
      return { success: true, data: data || [] };
    } catch (error) {
      console.error("❌ Error al obtener ventas sin facturar:", error.message);
      return { success: false, data: [], message: error.message };
    }
  }, [user?.id]);

  // ✅ NUEVO: Marcar una o más ventas como facturadas
  const marcarVentasFacturadas = async (ventasIds) => {
    try {
      if (!user?.id || !ventasIds || ventasIds.length === 0) {
        return { success: false, message: "Usuario o ventas no especificadas" };
      }

      const { error } = await supabase
        .from("ventas")
        .update({ facturado: true })
        .eq("owner", user.id)
        .in("id", ventasIds);

      if (error) throw error;
      console.log("✅ Ventas marcadas como facturadas:", ventasIds);
      
      // Actualizar estado local
      setVentas((prev) =>
        prev.map((v) => (ventasIds.includes(v.id) ? { ...v, facturado: true } : v))
      );

      return { success: true, message: "Ventas marcadas como facturadas" };
    } catch (error) {
      console.error("❌ Error al marcar ventas como facturadas:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 📊 Cálculo de balance
  // -------------------------
  const calcularBalance = () => {
    const totalVentas = ventas.reduce((acc, v) => acc + Number(v.monto || 0), 0);
    const totalDescuentos = ventas.reduce((acc, v) => acc + Number(v.descuento || 0), 0);
    const totalFinal = totalVentas - totalDescuentos;
    return { totalVentas, totalDescuentos, totalFinal };
  };

  // -------------------------
  // 🔁 Inicialización
  // -------------------------
  useEffect(() => {
    (async () => {
      // Esperar a que el usuario esté autenticado antes de cargar datos
      if (user?.id) {
        await obtenerInventario();
        await obtenerVentas();
        await obtenerClientes();
        await obtenerFacturas();
        await obtenerEgresos();
        await obtenerPerfilEmpresa();
        await obtenerAverias();
        await obtenerDevoluciones();
        await obtenerPresupuestos();
      }
      setLoading(false);
    })();
  }, [user?.id]);

  // ✅ LISTENERS EN TIEMPO REAL para sincronización de datos (optimizado para evitar sobrecarga)
  useEffect(() => {
    if (!user?.id) return;

    console.log("🔄 Configurando listener combinado para usuario:", user.id);

    const subscriptions = [];
    let refreshTimeout;

    const debouncedRefresh = () => {
      clearTimeout(refreshTimeout);
      refreshTimeout = setTimeout(() => {
        console.log("📢 Actualizando datos después de cambios detectados");
        obtenerVentas();
        obtenerEgresos();
        obtenerInventario();
        obtenerDevoluciones();
      }, 1000);
    };

    const createTableListener = (tableName, filter) => {
      return supabase
        .channel(`${tableName}-${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: tableName,
            filter,
          },
          (payload) => {
            console.log(`📢 Cambio en ${tableName} detectado`);
            debouncedRefresh();
          }
        )
        .subscribe((status) => {
          if (status === "CLOSED") {
            console.warn(`⚠️ Listener de ${tableName} cerrado`);
          }
        });
    };

    const ventasChannel = createTableListener("ventas", `owner=eq.${user.id}`);
    const egresosChannel = createTableListener("egreso", `owner=eq.${user.id}`);
    const devolucionesChannel = createTableListener("devoluciones", `owner=eq.${user.id}`);
    const inventarioChannel = createTableListener("inventario", `owner=eq.${user.id}`);

    subscriptions.push(ventasChannel, egresosChannel, devolucionesChannel, inventarioChannel);

    return () => {
      clearTimeout(refreshTimeout);
      subscriptions.forEach((sub) => {
        if (sub?.unsubscribe) {
          sub.unsubscribe();
        }
      });
    };
  }, [user?.id]);

  // -------------------------
  // 🔓 Logout
  // -------------------------
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      console.log("✅ Sesión cerrada");
    } catch (error) {
      console.error("❌ Error al cerrar sesión:", error.message);
    }
  };

  // -------------------------
  //  Actualizar inventario después de venta
  // -------------------------
  const actualizarInventario = async (productoNombre, cantidadVendida) => {
    try {
      const producto = inventario.find(p => p.nombre.toLowerCase() === productoNombre.toLowerCase());
      
      if (!producto) {
        return { success: false, message: "Producto no encontrado en inventario." };
      }

      const nuevaCantidad = Math.max(0, producto.cantidad - cantidadVendida);

      const { data, error } = await supabase
        .from("inventario")
        .update({ cantidad: nuevaCantidad })
        .eq("id", producto.id)
        .select()
        .single();

      if (error) throw error;

      setInventario((prev) =>
        prev.map((p) => (p.id === producto.id ? data : p))
      );

      console.log(`✅ Inventario actualizado: ${productoNombre} - Nueva cantidad: ${nuevaCantidad}`);
      return { success: true, data };
    } catch (error) {
      console.error("❌ Error al actualizar inventario:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 💰 Gastos fijos mensuales + Deuda acumulativa
  // -------------------------
  const guardarGastosFijos = (monto) => {
    try {
      localStorage.setItem("gastosFijos", JSON.stringify(monto));
      console.log("✅ Gastos fijos guardados:", monto);
      return { success: true };
    } catch (error) {
      console.error("❌ Error al guardar gastos fijos:", error.message);
      return { success: false, message: error.message };
    }
  };

  const obtenerGastosFijos = () => {
    try {
      const gastos = localStorage.getItem("gastosFijos");
      return gastos ? parseFloat(gastos) : 0;
    } catch (error) {
      console.error("Error al obtener gastos fijos:", error.message);
      return 0;
    }
  };

  // ✅ ERROR 6 CORREGIDO: Obtener deuda acumulada del mes ANTERIOR (no del mes actual)
  // Esta función se usa en Dashboard para mostrar la deuda pendiente a recuperar
  // Debería traer la deuda_pendiente del mes anterior que quedó sin pagar
  const obtenerDeudaAcumulada = async () => {
    try {
      if (!user?.id) {
        return { success: false, deuda: 0 };
      }

      // Calcular el mes anterior
      const fechaHoy = new Date();
      fechaHoy.setMonth(fechaHoy.getMonth() - 1);
      const mesPasado = fechaHoy.toISOString().slice(0, 7) + "-01";

      // ✅ Buscar el registro del mes pasado (deuda que quedó sin pagar el mes anterior)
      const { data, error } = await supabase
        .from("historialMeses")
        .select("deuda_pendiente")
        .eq("owner", user.id)
        .eq("mes", mesPasado)
        .maybeSingle();

      if (error) throw error;
      
      // Si existe deuda pendiente del mes anterior, retornarla
      if (data?.deuda_pendiente) {
        console.log(`✅ Deuda acumulada del mes anterior (${mesPasado}): $${data.deuda_pendiente}`);
        return { success: true, deuda: data.deuda_pendiente };
      }
      
      // Si no existe deuda, buscar el mes cerrado más reciente anterior
      const { data: mesesAnteriores, error: errorBusqueda } = await supabase
        .from("historialMeses")
        .select("deuda_pendiente, mes")
        .eq("owner", user.id)
        .lt("mes", mesPasado)
        .order("mes", { ascending: false })
        .limit(1);
      
      if (errorBusqueda) throw errorBusqueda;
      
      if (mesesAnteriores && mesesAnteriores.length > 0) {
        const deudaUltimaMes = mesesAnteriores[0].deuda_pendiente || 0;
        console.log(`⚠️ Usando deuda del mes más reciente (${mesesAnteriores[0].mes}): $${deudaUltimaMes}`);
        return { success: true, deuda: deudaUltimaMes };
      }
      
      return { success: true, deuda: 0 };
    } catch (error) {
      console.error("Error al obtener deuda acumulada:", error.message);
      return { success: false, deuda: 0 };
    }
  };

  // Calcular deuda no recuperada
  const calcularDeudaPendiente = (totalFinal, gastosFijos) => {
    // Si los ingresos son menores a los gastos fijos, hay deuda
    if (totalFinal < gastosFijos) {
      return gastosFijos - totalFinal;
    }
    return 0;
  };

  // -------------------------
  // 📦 Calcular valor total del inventario
  // -------------------------
  const calcularValorInventario = () => {
    const totalValor = inventario.reduce((acc, p) => {
      const cantidad = Number(p.cantidad || 0);
      const precio = Number(p.precio || 0);
      return acc + (cantidad * precio);
    }, 0);
    return totalValor;
  };

  // -------------------------
  // 👥 Clientes
  // -------------------------
  const [clientes, setClientes] = useState([]);

  const obtenerClientes = async () => {
    try {
      if (!user?.id) {
        setClientes([]);
        return { success: true, data: [] };
      }

      const { data, error } = await retryWithExponentialBackoff(
        () => supabase
          .from("clientes")
          .select("*")
          .eq("owner", user.id)
      );

      if (error) throw error;
      setClientes(data || []);
      return { success: true, data };
    } catch (error) {
      if (isConnectionError(error)) {
        console.warn("⚠️ Error de conexión al obtener clientes:", error.message);
        return { success: false, message: "Error de conexión temporal", isConnectionError: true };
      }
      console.error("Error al obtener clientes:", error.message);
      return { success: false, message: error.message };
    }
  };

  const crearCliente = async (cliente) => {
    try {
      if (!cliente.nombre || !cliente.email) {
        return { success: false, message: "Nombre y email son requeridos." };
      }

      const { data, error } = await supabase
        .from("clientes")
        .insert([
          {
            owner: user?.id,
            nombre: cliente.nombre,
            email: cliente.email,
            telefono: cliente.telefono || "",
            direccion: cliente.direccion || "",
            ruc: cliente.ruc || "",
            razon_social: cliente.razon_social || "",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setClientes((prev) => [data, ...prev]);
      console.log("✅ Cliente creado:", data);
      return { success: true, message: "Cliente agregado con éxito.", data };
    } catch (error) {
      console.error("❌ Error al crear cliente:", error.message);
      return { success: false, message: error.message };
    }
  };

  const actualizarCliente = async (id, cliente) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("clientes")
        .update({
          nombre: cliente.nombre,
          email: cliente.email,
          telefono: cliente.telefono || "",
          direccion: cliente.direccion || "",
          ruc: cliente.ruc || "",
          razon_social: cliente.razon_social || "",
        })
        .eq("id", id)
        .eq("owner", user.id)
        .select()
        .single();

      if (error) throw error;
      setClientes((prev) => prev.map((c) => (c.id === id ? data : c)));
      console.log("✅ Cliente actualizado:", data);
      return { success: true, message: "Cliente actualizado con éxito.", data };
    } catch (error) {
      console.error("❌ Error al actualizar cliente:", error.message);
      return { success: false, message: error.message };
    }
  };

  const eliminarCliente = async (id) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { error } = await supabase
        .from("clientes")
        .delete()
        .eq("id", id)
        .eq("owner", user.id);

      if (error) throw error;
      setClientes((prev) => prev.filter((c) => c.id !== id));
      console.log("✅ Cliente eliminado");
      return { success: true, message: "Cliente eliminado con éxito." };
    } catch (error) {
      console.error("❌ Error al eliminar cliente:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 📄 Facturas
  // -------------------------
  const [facturas, setFacturas] = useState([]);

  // -------------------------
  // 💸 Egresos
  // -------------------------
  const [egresos, setEgresos] = useState([]);

  // -------------------------
  // 🔧 Averías
  // -------------------------
  const [averias, setAverias] = useState([]);

  const obtenerFacturas = async () => {
    try {
      if (!user?.id) {
        setFacturas([]);
        return { success: true, data: [] };
      }

      const { data, error } = await retryWithExponentialBackoff(
        () => supabase
          .from("facturas")
          .select("*")
          .eq("owner", user.id)
      );

      if (error) throw error;
      
      const facturasConJSON = (data || []).map(factura => {
        try {
          return {
            ...factura,
            productos_json: typeof factura.productos_json === 'string' 
              ? JSON.parse(factura.productos_json || '[]')
              : Array.isArray(factura.productos_json) ? factura.productos_json : [],
            codigos_venta_json: typeof factura.codigos_venta_json === 'string'
              ? JSON.parse(factura.codigos_venta_json || '[]')
              : Array.isArray(factura.codigos_venta_json) ? factura.codigos_venta_json : []
          };
        } catch (parseError) {
          console.warn("⚠️ Error al parsear JSON de factura:", factura.id, parseError);
          return {
            ...factura,
            productos_json: [],
            codigos_venta_json: []
          };
        }
      });
      
      setFacturas(facturasConJSON);
      return { success: true, data: facturasConJSON };
    } catch (error) {
      if (isConnectionError(error)) {
        console.warn("⚠️ Error de conexión al obtener facturas:", error.message);
        return { success: false, message: "Error de conexión temporal", isConnectionError: true };
      }
      console.error("Error al obtener facturas:", error.message);
      return { success: false, message: error.message };
    }
  };

  const crearFactura = async (factura) => {
    try {
      if (!factura.cliente || !factura.numero_factura) {
        return { success: false, message: "Cliente y número de factura son requeridos." };
      }

      const { data, error } = await supabase
        .from("facturas")
        .insert([
          {
            owner: user?.id,
            numero_factura: factura.numero_factura,
            // ✅ INFORMACIÓN DEL CLIENTE - COMPLETA
            cliente_id: factura.cliente_id || null,
            cliente: factura.cliente,
            cliente_email: factura.cliente_email || "",
            cliente_telefono: factura.cliente_telefono || "",
            cliente_ruc: factura.cliente_ruc || "",
            cliente_direccion: factura.cliente_direccion || "",
            // ✅ INFORMACIÓN DE LA EMPRESA - COMPLETA
            empresa_nombre: factura.empresa_nombre || "",
            empresa_ruc: factura.empresa_ruc || "",
            empresa_email: factura.empresa_email || "",
            empresa_telefono: factura.empresa_telefono || "",
            empresa_direccion: factura.empresa_direccion || "",
            empresa_logo_url: factura.empresa_logo_url || "",
            // ✅ DATOS DE LA FACTURA
            fecha: factura.fecha || new Date().toISOString().split("T")[0],
            venta_id: factura.venta_id || null,
            subtotal: factura.subtotal || 0,
            descuento: factura.descuento || 0,
            impuesto: factura.impuesto || 0,
            total: factura.total || 0,
            estado: factura.estado || "pendiente",
            metodo_pago: factura.metodo_pago || "Efectivo",
            notas: factura.notas || "",
            // ✅ PRODUCTOS - ARRAY JSON CON TODOS LOS PRODUCTOS
            productos_json: factura.productos_json || [],
            // ✅ CÓDIGOS DE VENTA - PARA TRAZABILIDAD
            codigos_venta_json: factura.codigos_venta_json || [],
          },
        ])
        .select()
        .single();

      if (error) throw error;
      
      // Parsear campos JSON antes de agregar al estado
      let facturaParsed = data;
      try {
        facturaParsed = {
          ...data,
          productos_json: typeof data.productos_json === 'string' 
            ? JSON.parse(data.productos_json || '[]')
            : Array.isArray(data.productos_json) ? data.productos_json : [],
          codigos_venta_json: typeof data.codigos_venta_json === 'string'
            ? JSON.parse(data.codigos_venta_json || '[]')
            : Array.isArray(data.codigos_venta_json) ? data.codigos_venta_json : []
        };
      } catch (parseError) {
        console.warn("⚠️ Error al parsear JSON de factura creada:", parseError);
      }
      
      setFacturas((prev) => [facturaParsed, ...prev]);
      console.log("✅ Factura creada con información completa + productos:", facturaParsed);
      return { success: true, message: "Factura creada con éxito.", data: facturaParsed };
    } catch (error) {
      console.error("❌ Error al crear factura:", error.message);
      return { success: false, message: error.message };
    }
  };

  const actualizarFactura = async (id, factura) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("facturas")
        .update({
          estado: factura.estado,
          metodo_pago: factura.metodo_pago,
          notas: factura.notas,
          fecha_pago: factura.fecha_pago || null,
        })
        .eq("id", id)
        .eq("owner", user.id)
        .select()
        .single();

      if (error) throw error;
      
      // Parsear campos JSON antes de actualizar estado
      let facturaParsed = data;
      try {
        facturaParsed = {
          ...data,
          productos_json: typeof data.productos_json === 'string' 
            ? JSON.parse(data.productos_json || '[]')
            : Array.isArray(data.productos_json) ? data.productos_json : [],
          codigos_venta_json: typeof data.codigos_venta_json === 'string'
            ? JSON.parse(data.codigos_venta_json || '[]')
            : Array.isArray(data.codigos_venta_json) ? data.codigos_venta_json : []
        };
      } catch (parseError) {
        console.warn("⚠️ Error al parsear JSON de factura actualizada:", parseError);
      }
      
      setFacturas((prev) => prev.map((f) => (f.id === id ? facturaParsed : f)));
      console.log("✅ Factura actualizada:", facturaParsed);
      return { success: true, message: "Factura actualizada con éxito.", data: facturaParsed };
    } catch (error) {
      console.error("❌ Error al actualizar factura:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 📊 Cierre de Mes
  // -------------------------
  const cerrarMes = async (mesCierre) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      // Obtener todas las ventas del mes para este usuario
      const { data: ventasDelMes, error: errorVentas } = await supabase
        .from("ventas")
        .select("*")
        .eq("mes_cierre", mesCierre)
        .eq("owner", user.id);

      if (errorVentas) throw errorVentas;

      // ✅ ERROR 3 CORREGIDO: El monto YA tiene descuento aplicado, NO restar dos veces
      // El campo 'monto' es = precio_total - descuento
      // Por lo tanto: totalVentas = suma de montos (que ya están con descuento aplicado)
      const totalVentas = ventasDelMes.reduce((acc, v) => acc + Number(v.monto || 0), 0);
      const totalDescuentos = ventasDelMes.reduce((acc, v) => acc + Number(v.descuento || 0), 0);
      
      // ✅ ERROR 4 CORREGIDO: Obtener devoluciones aprobadas del mes y restarlas
      const { data: devolucionesDelMes, error: errorDevoluciones } = await supabase
        .from("devoluciones")
        .select("*")
        .eq("owner", user.id)
        .eq("estado", "Aprobada");
        // Nota: No filtramos por mes porque las devoluciones pueden referirse a ventas de otros meses
        // Pero si tienen campo mes_cierre, usarlo; si no, incluir todas las aprobadas
      
      if (errorDevoluciones) console.warn("⚠️ Error al obtener devoluciones:", errorDevoluciones);
      
      // Calcular total de devoluciones aprobadas (estas restan del ingreso final)
      const totalDevolucionesAprobadas = (devolucionesDelMes || [])
        .reduce((acc, d) => acc + Number(d.monto || 0), 0);

      // ✅ totalFinal = ingresos sin descuentos contados dos veces, SIN devoluciones aún
      // Luego se restan las devoluciones para calcular deuda
      const totalFinal = totalVentas - totalDevolucionesAprobadas;

      // Obtener egresos del mes para este usuario
      const { data: egresosDelMes, error: errorEgresos } = await supabase
        .from("egreso")
        .select("*")
        .eq("mes_cierre", mesCierre)
        .eq("owner", user.id);

      if (errorEgresos) throw errorEgresos;
      const totalEgresos = egresosDelMes.reduce((acc, e) => acc + Number(e.monto || 0), 0);

      // Obtener gastos fijos guardados
      const gastosFijosGuardados = obtenerGastosFijos() || 0;

      // Obtener deuda del mes anterior
      const deudaResultado = await obtenerDeudaAcumulada();
      const deudaAnterior = deudaResultado.deuda || 0;

      // Calcular deuda acumulada
      // La deuda acumulada = Deuda Anterior + Gastos Fijos del mes
      // Luego los ingresos (ya con devoluciones restadas) se restan para ver cuánto queda sin pagar
      const deudaQueAcumular = deudaAnterior + gastosFijosGuardados;
      const deudaAcumulada = Math.max(0, deudaQueAcumular - totalFinal);

      // Buscar si el registro ya existe
      const { data: registroExistente, error: errorCheck } = await supabase
        .from("historialMeses")
        .select("id")
        .eq("owner", user?.id)
        .eq("mes", mesCierre)
        .maybeSingle();

      if (errorCheck) throw errorCheck;

      let data, error;
      
      if (registroExistente) {
        // Si existe, actualizar
        const { data: updateData, error: updateError } = await supabase
          .from("historialMeses")
          .update({
            total_ventas: totalVentas,
            total_descuentos: totalDescuentos,
            total_final: totalFinal,
            total_egresos: totalEgresos,
            gastos_fijos: gastosFijosGuardados,
            deuda_anterior: deudaAnterior,
            deuda_pendiente: deudaAcumulada,
            ganancia_neta: totalFinal - totalEgresos - gastosFijosGuardados,
            cantidad_transacciones: ventasDelMes.length,
            is_closed: true,
          })
          .eq("id", registroExistente.id)
          .select()
          .single();
        data = updateData;
        error = updateError;
      } else {
        // Si no existe, insertar
        const { data: insertData, error: insertError } = await supabase
          .from("historialMeses")
          .insert([
            {
              owner: user?.id,
              mes: mesCierre,
              total_ventas: totalVentas,
              total_descuentos: totalDescuentos,
              total_final: totalFinal,
              total_egresos: totalEgresos,
              gastos_fijos: gastosFijosGuardados,
              deuda_anterior: deudaAnterior,
              deuda_pendiente: deudaAcumulada,
              ganancia_neta: totalFinal - totalEgresos - gastosFijosGuardados,
              cantidad_transacciones: ventasDelMes.length,
              is_closed: true,
            },
          ])
          .select()
          .single();
        data = insertData;
        error = insertError;
      }

      if (error) throw error;
      console.log("✅ Mes cerrado correctamente:", data);
      console.log(`📊 Resumen: Deuda anterior: $${deudaAnterior.toFixed(2)}, Deuda nueva: $${deudaAcumulada.toFixed(2)}`);
      return { success: true, message: "Mes cerrado con éxito.", data };
    } catch (error) {
      console.error("❌ Error al cerrar mes:", error.message);
      return { success: false, message: error.message };
    }
  };

  const obtenerHistorialMeses = async () => {
    try {
      if (!user?.id) {
        return { success: true, data: [] };
      }

      const { data, error } = await supabase
        .from("historialMeses")
        .select("*")
        .eq("owner", user.id)
        .order("mes", { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error("Error al obtener historial de meses:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 🎯 Apertura de Mes
  // -------------------------
  const abrirMes = async (mesApertura) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      // Verificar si el mes ya existe
      const { data: mesExistente, error: errorCheck } = await supabase
        .from("historialMeses")
        .select("id")
        .eq("owner", user.id)
        .eq("mes", mesApertura)
        .maybeSingle();

      if (errorCheck) throw errorCheck;

      if (mesExistente) {
        return { 
          success: false, 
          message: `El mes ${mesApertura} ya está aperturado o cerrado.` 
        };
      }

      // Obtener deuda acumulada del mes anterior
      const [año, mes] = mesApertura.split("-").slice(0, 2);
      let mesAnteriorNum = parseInt(mes) - 1;
      let añoAnterior = parseInt(año);
      
      if (mesAnteriorNum === 0) {
        mesAnteriorNum = 12;
        añoAnterior -= 1;
      }
      
      const mesAnteriorPadded = String(mesAnteriorNum).padStart(2, "0");
      const mesAnterior = `${añoAnterior}-${mesAnteriorPadded}-01`;

      let deudaAnterior = 0;
      
      console.log(`🔍 Buscando deuda del mes anterior: ${mesAnterior}`);
      
      // Buscar si existe registro del mes anterior
      const { data: registroAnterior, error: errorAnterior } = await supabase
        .from("historialMeses")
        .select("deuda_pendiente, mes, deuda_anterior, is_closed")
        .eq("owner", user.id)
        .eq("mes", mesAnterior)
        .maybeSingle();

      if (errorAnterior) {
        console.warn("⚠️ Error al buscar mes anterior:", errorAnterior);
        throw errorAnterior;
      }
      
      if (registroAnterior) {
        deudaAnterior = registroAnterior.deuda_pendiente || 0;
        console.log(`✅ Mes anterior encontrado (${mesAnterior}): deuda_pendiente = $${deudaAnterior}`);
        console.log(`📋 Detalles del mes anterior:`, registroAnterior);
      } else {
        console.warn(`⚠️ No se encontró registro para el mes ${mesAnterior}`);
        
        // Si no existe el mes anterior exacto, buscar el más reciente anterior
        const { data: mesesAnteriores, error: errorBusqueda } = await supabase
          .from("historialMeses")
          .select("deuda_pendiente, mes, is_closed")
          .eq("owner", user.id)
          .lt("mes", mesApertura)
          .order("mes", { ascending: false })
          .limit(1);
          
        if (errorBusqueda) {
          console.warn("⚠️ Error en búsqueda alternativa:", errorBusqueda);
        } else if (mesesAnteriores && mesesAnteriores.length > 0) {
          deudaAnterior = mesesAnteriores[0].deuda_pendiente || 0;
          console.log(`⚠️ Usando mes más reciente encontrado (${mesesAnteriores[0].mes}): deuda_pendiente = $${deudaAnterior}`);
        }
      }
      
      console.log(`📊 Deuda anterior a transferir: $${deudaAnterior}`);

      // Crear nuevo registro con estado abierto
      const { data, error } = await supabase
        .from("historialMeses")
        .insert([
          {
            owner: user.id,
            mes: mesApertura,
            total_ventas: 0,
            total_descuentos: 0,
            total_final: 0,
            total_egresos: 0,
            gastos_fijos: obtenerGastosFijos() || 0,
            deuda_anterior: deudaAnterior,
            deuda_pendiente: deudaAnterior, // Al inicio, solo hay deuda anterior
            ganancia_neta: 0,
            cantidad_transacciones: 0,
            is_closed: false,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      console.log("✅ Mes aperturado correctamente:", data);
      console.log(`📊 Deuda acumulada transferida: $${deudaAnterior.toFixed(2)}`);
      return { 
        success: true, 
        message: `Mes ${mesApertura} aperturado correctamente.`, 
        data 
      };
    } catch (error) {
      console.error("❌ Error al aperturar mes:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // ✅ Garantizar que el mes actual esté abierto
  // -------------------------
  const garantizarMesAbierto = async (mesTarget) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const mesActual = mesTarget || new Date().toISOString().slice(0, 7) + "-01";

      // Verificar si el mes ya existe
      const { data: mesExistente, error: errorCheck } = await supabase
        .from("historialMeses")
        .select("id, is_closed")
        .eq("owner", user.id)
        .eq("mes", mesActual)
        .maybeSingle();

      if (errorCheck) throw errorCheck;

      // Si el mes ya existe, retornar éxito
      if (mesExistente) {
        if (mesExistente.is_closed) {
          return { 
            success: false, 
            message: `El mes ${mesActual} ya está cerrado. No se puede registrar ventas.` 
          };
        }
        console.log(`✅ El mes ${mesActual} ya estaba abierto`);
        return { success: true, message: "Mes ya abierto", alreadyOpen: true };
      }

      // Si no existe, abrirlo automáticamente
      console.log(`🔄 Abriendo automáticamente el mes ${mesActual}...`);
      const resultado = await abrirMes(mesActual);
      
      if (resultado.success) {
        console.log(`✅ Mes ${mesActual} abierto automáticamente`);
        return { 
          success: true, 
          message: `Período ${mesActual} abierto automáticamente`, 
          autoOpened: true,
          data: resultado.data
        };
      } else {
        return resultado;
      }
    } catch (error) {
      console.error("❌ Error al garantizar mes abierto:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 💸 Egresos
  // -------------------------
  const obtenerEgresos = async () => {
    try {
      if (!user?.id) {
        setEgresos([]);
        return { success: true, data: [] };
      }

      const { data, error } = await retryWithExponentialBackoff(
        () => supabase
          .from("egreso")
          .select("*")
          .eq("owner", user.id)
          .order("fecha", { ascending: false })
      );

      if (error) throw error;
      setEgresos(data || []);
      return { success: true, data };
    } catch (error) {
      if (isConnectionError(error)) {
        console.warn("⚠️ Error de conexión al obtener egresos (reintentando):", error.message);
        return { success: false, message: "Error de conexión temporal", isConnectionError: true };
      }
      console.error("Error al obtener egresos:", error.message);
      return { success: false, message: error.message };
    }
  };

  const crearEgreso = async (egreso) => {
    try {
      if (!egreso.descripcion || !egreso.monto) {
        return { success: false, message: "Descripción y monto son requeridos." };
      }

      const { data, error } = await supabase
        .from("egreso")
        .insert([
          {
            owner: user?.id,
            descripcion: egreso.descripcion,
            monto: egreso.monto,
            categoria: egreso.categoria || "general",
            fecha: egreso.fecha || new Date().toISOString().split("T")[0],
            mes_cierre: egreso.mes_cierre || new Date().toISOString().slice(0, 7) + "-01",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setEgresos((prev) => [data, ...prev]);
      console.log("✅ Egreso creado:", data);
      return { success: true, message: "Egreso registrado con éxito.", data };
    } catch (error) {
      console.error("❌ Error al crear egreso:", error.message);
      return { success: false, message: error.message };
    }
  };

  const eliminarEgreso = async (id) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { error } = await supabase
        .from("egreso")
        .delete()
        .eq("id", id)
        .eq("owner", user.id);

      if (error) throw error;
      setEgresos((prev) => prev.filter((e) => e.id !== id));
      console.log("✅ Egreso eliminado");
      return { success: true, message: "Egreso eliminado con éxito." };
    } catch (error) {
      console.error("❌ Error al eliminar egreso:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // ↩️ Devoluciones - PREMIUM
  // -------------------------
  const registrarDevolucion = async (devolucion) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      if (!devolucion.codigo_venta || !devolucion.monto) {
        return { success: false, message: "Faltan datos requeridos (código venta y monto)" };
      }

      const { data, error } = await supabase
        .from("devoluciones")
        .insert([
          {
            codigo_venta: devolucion.codigo_venta,
            monto: parseFloat(devolucion.monto),
            cantidad: devolucion.cantidad || 1,
            razon: devolucion.razon || "",
            cliente: devolucion.cliente || "",
            producto: devolucion.producto || "",
            fecha: new Date().toISOString().split('T')[0],
            estado: "Pendiente Revisión",
            owner: user?.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setDevoluciones((prev) => [data, ...prev]);
      console.log("✅ Devolución registrada:", data);
      return { success: true, message: "Devolución registrada con éxito.", data };
    } catch (error) {
      console.error("❌ Error al registrar devolución:", error.message);
      return { success: false, message: error.message };
    }
  };

  const obtenerDevoluciones = async () => {
    try {
      if (!user?.id) {
        setDevoluciones([]);
        return { success: true, data: [] };
      }

      const { data, error } = await retryWithExponentialBackoff(
        () => supabase
          .from("devoluciones")
          .select("*")
          .eq("owner", user.id)
          .order("fecha", { ascending: false })
      );

      if (error) throw error;
      setDevoluciones(data || []);
      return { success: true, data };
    } catch (error) {
      if (isConnectionError(error)) {
        console.warn("⚠️ Error de conexión al obtener devoluciones:", error.message);
        return { success: false, message: "Error de conexión temporal", isConnectionError: true };
      }
      console.error("Error al obtener devoluciones:", error.message);
      return { success: false, message: error.message };
    }
  };

  const actualizarEstadoDevolucion = async (id, nuevoEstado) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("devoluciones")
        .update({ estado: nuevoEstado })
        .eq("id", id)
        .eq("owner", user.id)
        .select()
        .single();

      if (error) throw error;
      setDevoluciones((prev) => prev.map((d) => (d.id === id ? data : d)));
      console.log("✅ Estado de devolución actualizado:", data);
      return { success: true, message: "Estado actualizado con éxito.", data };
    } catch (error) {
      console.error("❌ Error al actualizar devolución:", error.message);
      return { success: false, message: error.message };
    }
  };

  // ===============================================
  // 🚀 SISTEMA INTELIGENTE DE DEVOLUCIONES - PASO 2
  // ===============================================

  /**
   * ✅ FUNCIÓN PRINCIPAL: Procesa devoluciones inteligentes
   * Maneja 7 tipos automáticamente:
   * 1. Reembolso - Sin costo a cliente
   * 2. Cambio +Caro - Cliente paga diferencia
   * 3. Cambio -Caro - Negocio devuelve diferencia
   * 4. Cambio Igual - Sin impacto financiero
   * 5. Cambio 2x1 - Devuelve 1, toma 2
   * 6. Canje Proveedor - Daño, proveedor acepta
   * 7. Pérdida Total - Daño sin opciones
   */
  const procesarDevolucion = async (datosDevolucion) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const {
        venta_id,
        codigo_venta,
        cantidad_devuelta,
        precio_unitario,  // ✅ NUEVO: Parámetro opcional para usar precio específico del producto
        tipo_resolucion, // "Reembolso", "Cambio", "Canje Proveedor", "Pérdida"
        estado_producto, // "Buen estado", "Dañado", "Parcialmente dañado"
        producto_nuevo,
        cantidad_nueva,
        precio_nuevo,
        tiene_cambio_proveedor = false,
        referencia_canje = null,
        notas_adicionales = "",
      } = datosDevolucion;

      // 1️⃣ VALIDAR QUE EXISTA LA VENTA
      const ventaOriginal = ventas.find((v) => v.id === venta_id || v.codigo_venta === codigo_venta);
      if (!ventaOriginal) {
        return { success: false, message: "Venta original no encontrada" };
      }

      // 2️⃣ VALIDAR CANTIDAD DEVUELTA (contra la cantidad total de productos en la venta, no cantidad de ventas)
      // Calcular cantidad total de productos en la venta
      let cantidadTotalProductos = 0;
      if (ventaOriginal.productos_json && Array.isArray(ventaOriginal.productos_json)) {
        cantidadTotalProductos = ventaOriginal.productos_json.reduce((sum, p) => sum + (p.cantidad || 1), 0);
      } else {
        // Si no hay productos_json, usar cantidad de la venta (para compatibilidad)
        cantidadTotalProductos = ventaOriginal.cantidad || 1;
      }
      
      if (cantidad_devuelta > cantidadTotalProductos) {
        return { success: false, message: `Cantidad devuelta (${cantidad_devuelta}) no puede ser mayor a la cantidad total de productos en la venta (${cantidadTotalProductos})` };
      }

      // 3️⃣ CALCULAR DIFERENCIA DE PRECIO (AUTOMÁTICO)
      // ✅ Usar precio_unitario pasado como parámetro o fallback a ventaOriginal.precio_unitario
      const precioUnitarioFinal = precio_unitario || ventaOriginal.precio_unitario || 0;
      
      let diferencia_precio = 0;

      if (tipo_resolucion === "Cambio" && producto_nuevo && cantidad_nueva && precio_nuevo) {
        // Fórmula: (precio_nuevo × cantidad_nueva) - (precio_original × cantidad_devuelta)
        diferencia_precio = (precio_nuevo * cantidad_nueva) - (precioUnitarioFinal * cantidad_devuelta);
        
        // Convertir a positivo para storage (el tipo_resolucion indica si es ingreso/egreso)
        if (diferencia_precio < 0) {
          diferencia_precio = Math.abs(diferencia_precio);
        }
      } else if (tipo_resolucion === "Reembolso" && estado_producto === "Buen estado") {
        // Reembolso completo
        diferencia_precio = precioUnitarioFinal * cantidad_devuelta;
      } else if (tipo_resolucion === "Pérdida" && estado_producto === "Dañado") {
        // Pérdida total
        diferencia_precio = precioUnitarioFinal * cantidad_devuelta;
      }

      // ⏸️ MOVIMIENTOS FINANCIEROS: Se crearán solo cuando se APRUEBE la devolución
      // Por ahora solo guardamos la solicitud como "Pendiente Revisión"

      // 6️⃣ GUARDAR DEVOLUCIÓN EN BD (Estado: Pendiente Revisión)
      const { data: devolucionGuardada, error: errorDev } = await supabase
        .from("devoluciones")
        .insert({
          owner: user.id,
          venta_id,
          codigo_venta,
          monto: cantidad_devuelta > 0 ? precioUnitarioFinal * cantidad_devuelta : 0,
          cantidad: cantidad_devuelta,
          cliente: ventaOriginal.cliente,
          producto: ventaOriginal.producto,
          estado: "Pendiente Revisión",
          razon: `${tipo_resolucion} - ${estado_producto}${notas_adicionales ? ' - ' + notas_adicionales : ''}`,
          fecha: new Date().toISOString().split('T')[0],
          // ✅ Campos adicionales del schema mejorado
          tipo_resolucion,
          estado_producto,
          producto_nuevo,
          cantidad_nueva,
          precio_nuevo,
          diferencia_precio: diferencia_precio || 0,
          tiene_cambio_proveedor,
          referencia_canje,
          id_ingreso: null, // ⏸️ Se asignará cuando se APRUEBE
          id_egreso: null,  // ⏸️ Se asignará cuando se APRUEBE
          fecha_procesada: null, // ⏸️ Se completará en aprobación
          procesada_por: null,   // ⏸️ Se asignará en aprobación
          notas_adicionales,
        })
        .select()
        .single();

      if (errorDev) throw errorDev;

      // 7️⃣ ACTUALIZAR ESTADO LOCAL
      setDevoluciones((prev) => [devolucionGuardada, ...prev]);

      console.log("✅ Devolución procesada exitosamente:", devolucionGuardada);
      return {
        success: true,
        message: `Devolución procesada como ${tipo_resolucion}`,
        data: devolucionGuardada,
      };
    } catch (error) {
      console.error("❌ Error al procesar devolución:", error.message);
      return { success: false, message: error.message };
    }
  };

  /**
   * ✅ APROBAR DEVOLUCIÓN - Crea movimientos financieros e actualiza inventario
   * Se ejecuta cuando el administrador APRUEBA una devolución "Pendiente Revisión"
   */
  const aprobarDevolucion = async (devolucionId) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      // 1️⃣ OBTENER LOS DATOS DE LA DEVOLUCIÓN
      const devolucion = devoluciones.find((d) => d.id === devolucionId);
      if (!devolucion) {
        return { success: false, message: "Devolución no encontrada" };
      }

      if (devolucion.estado !== "Pendiente Revisión") {
        return { success: false, message: "Solo se pueden aprobar devoluciones en estado 'Pendiente Revisión'" };
      }

      // 2️⃣ OBTENER VENTA ORIGINAL (desde Supabase para mayor fiabilidad)
      let ventaOriginal = ventas.find((v) => v.id === devolucion.venta_id);
      if (!ventaOriginal) {
        // Si no está en el array local, buscar en Supabase directamente
        const { data: ventaDB, error: errorVenta } = await supabase
          .from("ventas")
          .select("*")
          .eq("id", devolucion.venta_id)
          .single();
        
        if (errorVenta || !ventaDB) {
          return { success: false, message: "Venta original no encontrada en la base de datos" };
        }
        ventaOriginal = ventaDB;
      }

      let id_ingreso = null;
      let id_egreso = null;

      // 3️⃣ CREAR MOVIMIENTOS FINANCIEROS según el tipo de resolución
      if (devolucion.tipo_resolucion === "Reembolso" && devolucion.estado_producto === "Buen estado") {
        // Reembolso completo
        const movEgreso = await crearMovimientoFinanciero(
          "egreso",
          devolucion.diferencia_precio,
          `Reembolso Aprobado - Devolucion venta ${devolucion.codigo_venta}`
        );
        if (movEgreso.success) id_egreso = movEgreso.data.id;
      } else if (devolucion.tipo_resolucion === "Cambio") {
        // Cambio: puede ser ingreso (cliente paga más) o egreso (cliente paga menos)
        const esIngreso = devolucion.producto_nuevo && devolucion.precio_nuevo > (devolucion.monto / devolucion.cantidad);
        
        if (esIngreso) {
          const movIngreso = await crearMovimientoFinanciero(
            "ingreso",
            devolucion.diferencia_precio,
            `Cambio Aprobado (Ingreso) - Venta ${devolucion.codigo_venta}`
          );
          if (movIngreso.success) id_ingreso = movIngreso.data.id;
        } else {
          const movEgreso = await crearMovimientoFinanciero(
            "egreso",
            devolucion.diferencia_precio,
            `Cambio Aprobado (Egreso) - Venta ${devolucion.codigo_venta}`
          );
          if (movEgreso.success) id_egreso = movEgreso.data.id;
        }
      } else if (devolucion.tipo_resolucion === "Pérdida" && devolucion.estado_producto === "Dañado") {
        // Pérdida total: registrar como egreso (pérdida de producto, dinero se queda)
        const movEgreso = await crearMovimientoFinanciero(
          "egreso",
          devolucion.diferencia_precio,
          `Pérdida Total Aprobada - Venta ${devolucion.codigo_venta}`
        );
        if (movEgreso.success) id_egreso = movEgreso.data.id;
      }

      // 4️⃣ ACTUALIZAR INVENTARIO según el tipo de resolución
      if (devolucion.tipo_resolucion === "Cambio") {
        // Para cambio: descontar original y agregar nuevo
        const productoOriginal = inventario.find(
          (p) => p.nombre.toLowerCase() === ventaOriginal.producto.toLowerCase()
        );
        const productoNuevo = inventario.find(
          (p) => p.nombre.toLowerCase() === (devolucion.producto_nuevo || "").toLowerCase()
        );

        // Descontar producto original del que se devuelve
        if (productoOriginal) {
          const { error: errorInv } = await supabase
            .from("inventario")
            .update({ cantidad: Math.max(0, productoOriginal.cantidad - devolucion.cantidad) })
            .eq("id", productoOriginal.id);
          if (errorInv) console.warn("⚠️ Error al descontar producto original:", errorInv.message);
        }

        // Agregar producto nuevo al que recibe
        if (productoNuevo && devolucion.cantidad_nueva) {
          const { error: errorInv } = await supabase
            .from("inventario")
            .update({ cantidad: productoNuevo.cantidad + devolucion.cantidad_nueva })
            .eq("id", productoNuevo.id);
          if (errorInv) console.warn("⚠️ Error al añadir producto nuevo:", errorInv.message);
        }
      } else if (devolucion.tipo_resolucion !== "Pérdida") {
        // Para reembolso y canje proveedor: devolver al stock
        const productoOriginal = inventario.find(
          (p) => p.nombre.toLowerCase() === ventaOriginal.producto.toLowerCase()
        );
        if (productoOriginal) {
          const { error: errorInv } = await supabase
            .from("inventario")
            .update({ cantidad: productoOriginal.cantidad + devolucion.cantidad })
            .eq("id", productoOriginal.id);
          if (errorInv) console.warn("⚠️ Error al actualizar inventario:", errorInv.message);
        }
      }

      // 5️⃣ ACTUALIZAR ESTADO DE LA DEVOLUCIÓN A "APROBADA"
      const { data: devolucionActualizada, error: errorUpdate } = await supabase
        .from("devoluciones")
        .update({
          estado: "Aprobada",
          id_ingreso,
          id_egreso,
          fecha_procesada: new Date().toISOString(),
          procesada_por: user.id,
        })
        .eq("id", devolucionId)
        .select()
        .single();

      if (errorUpdate) throw errorUpdate;

      // 6️⃣ ACTUALIZAR ESTADO LOCAL
      setDevoluciones((prev) =>
        prev.map((d) => (d.id === devolucionId ? devolucionActualizada : d))
      );

      console.log("✅ Devolución APROBADA:", devolucionActualizada);
      return {
        success: true,
        message: "Devolución aprobada exitosamente",
        data: devolucionActualizada,
      };
    } catch (error) {
      console.error("❌ Error al aprobar devolución:", error.message);
      return { success: false, message: error.message };
    }
  };

  /**
   * ❌ RECHAZAR DEVOLUCIÓN - Solo cambia estado a "Rechazada"
   * Se ejecuta cuando el administrador RECHAZA una devolución "Pendiente Revisión"
   */
  const rechazarDevolucion = async (devolucionId) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      // 1️⃣ OBTENER LOS DATOS DE LA DEVOLUCIÓN
      const devolucion = devoluciones.find((d) => d.id === devolucionId);
      if (!devolucion) {
        return { success: false, message: "Devolución no encontrada" };
      }

      if (devolucion.estado !== "Pendiente Revisión") {
        return { success: false, message: "Solo se pueden rechazar devoluciones en estado 'Pendiente Revisión'" };
      }

      // 2️⃣ ACTUALIZAR ESTADO A "RECHAZADA"
      const { data: devolucionActualizada, error: errorUpdate } = await supabase
        .from("devoluciones")
        .update({
          estado: "Rechazada",
          fecha_procesada: new Date().toISOString(),
          procesada_por: user.id,
        })
        .eq("id", devolucionId)
        .select()
        .single();

      if (errorUpdate) throw errorUpdate;

      // 3️⃣ ACTUALIZAR ESTADO LOCAL
      setDevoluciones((prev) =>
        prev.map((d) => (d.id === devolucionId ? devolucionActualizada : d))
      );

      console.log("❌ Devolución RECHAZADA:", devolucionActualizada);
      return {
        success: true,
        message: "Devolución rechazada",
        data: devolucionActualizada,
      };
    } catch (error) {
      console.error("❌ Error al rechazar devolución:", error.message);
      return { success: false, message: error.message };
    }
  };

  /**
   * ✅ FUNCIÓN HELPER: Crear movimiento financiero (ingreso o egreso)
   */
  const crearMovimientoFinanciero = async (tipo, monto, concepto) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      // ✅ VALIDACIÓN: Asegurar que monto sea un número válido
      const montoValidado = parseFloat(monto) || 0;
      if (montoValidado <= 0) {
        return { success: false, message: `Monto inválido: ${monto}` };
      }

      const tabla = tipo === "ingreso" ? "ingresos" : "egreso";
      const { data, error } = await supabase
        .from(tabla)
        .insert({
          owner: user.id,  // ✅ CORRECCIÓN: Usar user.id (UUID) en lugar de user.email
          monto: montoValidado,  // ✅ CORRECCIÓN: Usar monto validado
          descripcion: concepto,  // ✅ Campo correcto para tabla egreso
          categoria: "Devolucion",
          fecha: new Date().toISOString().split('T')[0],  // Solo la fecha
        })
        .select()
        .single();

      if (error) throw error;

      // Actualizar estado local
      if (tipo === "ingreso") {
        // No hay estado para ingresos en el contexto actual, pero podrías agregarlo
      } else if (tipo === "egreso") {
        setEgresos((prev) => [data, ...prev]);
      }

      console.log(`✅ ${tipo.toUpperCase()} creado:`, data);
      return { success: true, data };
    } catch (error) {
      console.error(`❌ Error al crear ${tipo}:`, error.message);
      return { success: false, message: error.message };
    }
  };

  /**
   * ✅ FUNCIÓN: Crear registro de avería (producto dañado)
   */
  const obtenerAverias = async () => {
    try {
      if (!user?.id) {
        setAverias([]);
        return { success: true, data: [] };
      }

      const { data, error } = await supabase
        .from("averias")
        .select("*")
        .eq("owner", user.id)
        .order("fecha", { ascending: false });

      if (error) throw error;
      setAverias(data || []);
      return { success: true, data };
    } catch (error) {
      console.error("Error al obtener averías:", error.message);
      return { success: false, message: error.message };
    }
  };

  const crearAveria = async (datosAveria) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const {
        producto,
        cantidad,
        razon_dano,
        tiene_cambio_proveedor = false,
        referencia_canje = null,
        nombre_proveedor = null,
        notas = "",
      } = datosAveria;

      // Validar producto en inventario
      const prodInventario = inventario.find(
        (p) => p.nombre.toLowerCase() === producto.toLowerCase()
      );
      if (!prodInventario) {
        return { success: false, message: "Producto no encontrado en inventario" };
      }

      // Crear avería en BD
      const { data, error } = await supabase
        .from("averias")
        .insert({
          owner: user?.id,
          producto,
          cantidad,
          precio_unitario: prodInventario.precio_costo || 0,
          razon_dano,
          estado: tiene_cambio_proveedor ? "canjeada" : "desechada",
          tiene_cambio_proveedor,
          referencia_canje: referencia_canje || null,
          nombre_proveedor: nombre_proveedor || null,
          fecha: new Date().toISOString(),
          registrada_por: user.email,
          notas,
        })
        .select()
        .single();

      if (error) throw error;

      // Agregar a estado local
      setAverias((prev) => [data, ...prev]);

      // Si no hay cambio con proveedor, crear egreso por pérdida
      if (!tiene_cambio_proveedor) {
        const monto = cantidad * (prodInventario.precio_costo || 0);
        await crearMovimientoFinanciero(
          "egreso",
          monto,
          `Pérdida por avería - ${producto}`
        );
      }

      console.log("✅ Avería registrada:", data);
      return { success: true, message: "Avería registrada exitosamente", data };
    } catch (error) {
      console.error("❌ Error al registrar avería:", error.message);
      return { success: false, message: error.message };
    }
  };

  // Buscar venta por código
  const buscarVentaPorCodigo = (codigoVenta) => {
    return ventas.find((v) => v.codigo_venta === codigoVenta) || null;
  };

  // ✅ NUEVO: Buscar factura por número de factura
  const buscarFacturaPorNumero = (numeroFactura) => {
    return facturas.find((f) => f.numero_factura === numeroFactura) || null;
  };

  // ✅ NUEVO: Obtener productos de una factura para devoluciones
  const obtenerProductosFacturaParaDevoluciones = (numeroFactura) => {
    const factura = buscarFacturaPorNumero(numeroFactura);
    if (!factura) return [];

    // Obtener los códigos de venta de la factura
    const codigosVenta = factura.codigos_venta_json || [];
    
    // Buscar todas las ventas relacionadas a esta factura
    const ventasRelacionadas = ventas.filter((v) => 
      codigosVenta.includes(v.codigo_venta) || v.id === factura.venta_id
    );

    // Transformar productos de ventas a formato de devolución
    const productosParaDevoluciones = [];
    ventasRelacionadas.forEach((venta) => {
      if (venta.productos_json && Array.isArray(venta.productos_json)) {
        venta.productos_json.forEach((prod) => {
          productosParaDevoluciones.push({
            ...prod,
            venta_id: venta.id,
            codigo_venta: venta.codigo_venta,
            numero_factura: numeroFactura,
            cliente: factura.cliente,
            cliente_id: factura.cliente_id,
          });
        });
      }
    });

    return productosParaDevoluciones;
  };

  // Obtener ventas del período seleccionado
  const obtenerVentasPorPeriodo = (mesInicio, mesFin) => {
    return ventas.filter((v) => {
      const mesCierre = v.mes_cierre || new Date().toISOString().slice(0, 7);
      return mesCierre >= mesInicio && mesCierre <= mesFin;
    });
  };

  // Calcular total de devoluciones aprobadas
  const calcularTotalDevolucionesAprobadas = () => {
    return devoluciones
      .filter((d) => d.estado === "Aprobada")
      .reduce((acc, d) => acc + (d.monto || 0), 0);
  };

  // -------------------------
  // 🏢 Perfil de Empresa
  // -------------------------
  const guardarPerfilEmpresa = async (empresa) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("empresa_profiles")
        .upsert(
          {
            user_id: user.id,
            nombre: empresa.nombre,
            direccion: empresa.direccion || "",
            telefono: empresa.telefono || "",
            email: empresa.email || "",
            identificacion_fiscal: empresa.identificacion_fiscal || "",
            logo_url: empresa.logo_url || "",
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" }
        )
        .select()
        .single();

      if (error) throw error;
      setPerfilEmpresa(data);
      console.log("✅ Perfil de empresa guardado:", data);
      return { success: true, message: "Perfil de empresa guardado con éxito", data };
    } catch (error) {
      console.error("❌ Error al guardar perfil de empresa:", error.message);
      return { success: false, message: error.message };
    }
  };

  const obtenerPerfilEmpresa = async () => {
    try {
      if (!user?.id) {
        console.warn("⚠️ obtenerPerfilEmpresa: Usuario no autenticado");
        return { success: false, message: "Usuario no autenticado" };
      }

      console.log("🔍 Cargando perfil de empresa para usuario:", user.id);
      const { data, error } = await supabase
        .from("empresa_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        console.log("✅ Perfil de empresa cargado:", {
          nombre: data.nombre,
          razon_social: data.razon_social,
          email: data.email,
          completo: !!(data.nombre && data.razon_social && data.email)
        });
      } else {
        console.warn("⚠️ No se encontró perfil de empresa para este usuario");
      }
      
      setPerfilEmpresa(data || null);
      return { success: true, data };
    } catch (error) {
      console.error("❌ Error al obtener perfil de empresa:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 📦 Actualizar Producto (Inventario)
  // -------------------------
  const actualizarProducto = async (id, datos) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("inventario")
        .update(datos)
        .eq("id", id)
        .eq("owner", user.id)
        .select()
        .single();

      if (error) throw error;
      setInventario((prev) => prev.map((p) => (p.id === id ? data : p)));
      console.log("✅ Producto actualizado:", data);
      return { success: true, message: "Producto actualizado con éxito", data };
    } catch (error) {
      console.error("❌ Error al actualizar producto:", error.message);
      return { success: false, message: error.message };
    }
  };

  const eliminarProducto = async (id) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { error } = await supabase
        .from("inventario")
        .delete()
        .eq("id", id)
        .eq("owner", user.id);

      if (error) throw error;
      setInventario((prev) => prev.filter((p) => p.id !== id));
      console.log("✅ Producto eliminado");
      return { success: true, message: "Producto eliminado con éxito" };
    } catch (error) {
      console.error("❌ Error al eliminar producto:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 💼 Presupuestos (Premium)
  // -------------------------
  const [presupuestos, setPresupuestos] = useState([]);

  const obtenerPresupuestos = async () => {
    try {
      if (!user?.id) {
        setPresupuestos([]);
        return { success: true, data: [] };
      }

      const { data, error } = await supabase
        .from("presupuestos")
        .select("*")
        .eq("owner", user.id);

      if (error) throw error;
      setPresupuestos(data || []);
      return { success: true, data };
    } catch (error) {
      console.error("Error al obtener presupuestos:", error.message);
      return { success: false, message: error.message };
    }
  };

  const crearPresupuesto = async (presupuesto) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("presupuestos")
        .insert([
          {
            owner: user.id,
            numero_presupuesto: presupuesto.numero_presupuesto || `PRES-${Date.now()}`,
            cliente: presupuesto.cliente,
            items: presupuesto.items || [],
            subtotal: presupuesto.subtotal || 0,
            descuento: presupuesto.descuento || 0,
            impuestos: presupuesto.impuestos || 0,
            total: presupuesto.total || 0,
            estado: presupuesto.estado || "pendiente",
            notas: presupuesto.notas || "",
            vigencia_dias: presupuesto.vigencia_dias || 7,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setPresupuestos((prev) => [data, ...prev]);
      console.log("✅ Presupuesto creado:", data);
      return { success: true, message: "Presupuesto creado con éxito", data };
    } catch (error) {
      console.error("❌ Error al crear presupuesto:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 📦 Notas de Entrega (Premium)
  // -------------------------
  const [notasEntrega, setNotasEntrega] = useState([]);

  const obtenerNotasEntrega = async () => {
    try {
      if (!user?.id) {
        setNotasEntrega([]);
        return { success: true, data: [] };
      }

      const { data, error } = await supabase
        .from("notas_entrega")
        .select("*")
        .eq("owner", user.id)
        .order("fecha_entrega", { ascending: false });

      if (error) throw error;
      setNotasEntrega(data || []);
      return { success: true, data };
    } catch (error) {
      console.error("Error al obtener notas:", error.message);
      return { success: false, message: error.message };
    }
  };

  const crearNotaEntrega = async (nota) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("notas_entrega")
        .insert([
          {
            owner: user.id,
            numero_nota: nota.numero_nota || `NOTA-${Date.now()}`,
            cliente: nota.cliente,
            items: nota.items || [],
            observaciones: nota.observaciones || "",
            fecha_entrega: nota.fecha_entrega || new Date().toISOString().split('T')[0],
            estado: nota.estado || "pendiente",
            empresa_nombre: nota.empresa_nombre || "",
            empresa_ruc: nota.empresa_ruc || "",
            empresa_email: nota.empresa_email || "",
            empresa_telefono: nota.empresa_telefono || "",
            empresa_direccion: nota.empresa_direccion || "",
            empresa_logo_url: nota.empresa_logo_url || "",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setNotasEntrega((prev) => [data, ...prev]);
      console.log("✅ Nota de entrega creada:", data);
      return { success: true, message: "Nota de entrega creada con éxito", data };
    } catch (error) {
      console.error("❌ Error al crear nota:", error.message);
      return { success: false, message: error.message };
    }
  };

  // -------------------------
  // 🛒 Pedidos (Premium)
  // -------------------------
  const [pedidos, setPedidos] = useState([]);

  const obtenerPedidos = async () => {
    try {
      if (!user?.id) {
        setPedidos([]);
        return { success: true, data: [] };
      }

      const { data, error } = await supabase
        .from("pedidos")
        .select("*")
        .eq("owner", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
      return { success: true, data };
    } catch (error) {
      console.error("Error al obtener pedidos:", error.message);
      return { success: false, message: error.message };
    }
  };

  const crearPedido = async (pedido) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("pedidos")
        .insert([
          {
            owner: user.id,
            numero_pedido: pedido.numero_pedido || `PED-${Date.now()}`,
            cliente: pedido.cliente,
            items: pedido.items || [],
            total: pedido.total || 0,
            estado: pedido.estado || "pendiente",
            observaciones: pedido.observaciones || "",
            fecha_entrega_estimada: pedido.fecha_entrega_estimada || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setPedidos((prev) => [data, ...prev]);
      console.log("✅ Pedido creado:", data);
      return { success: true, message: "Pedido creado con éxito", data };
    } catch (error) {
      console.error("❌ Error al crear pedido:", error.message);
      return { success: false, message: error.message };
    }
  };

  // ✅ NOTA: Los datos ya se cargan en el useEffect anterior (línea 504)
  // No duplicamos las llamadas para evitar congelamiento del navbar
  // El useEffect anterior ya llama: obtenerInventario, obtenerVentas, obtenerClientes, etc.

  return (
    <AppContext.Provider
      value={{
        user,
        ventas,
        inventario,
        clientes,
        facturas,
        egresos,
        loading,
        isPremium,
        premiumData,
        perfilEmpresa,
        crearProducto,
        obtenerInventario,
        registrarVenta,
        obtenerVentas,
        calcularBalance,
        logout,
        obtenerEgresos,
        crearEgreso,
        eliminarEgreso,
        actualizarInventario,
        guardarGastosFijos,
        obtenerGastosFijos,
        calcularValorInventario,
        checkPremiumStatus,
        purchasePremium,
        cancelPremium,
        obtenerClientes,
        crearCliente,
        actualizarCliente,
        eliminarCliente,
        obtenerFacturas,
        crearFactura,
        actualizarFactura,
        cerrarMes,
        obtenerHistorialMeses,
        abrirMes,
        garantizarMesAbierto,
        guardarPerfilEmpresa,
        obtenerPerfilEmpresa,
        actualizarProducto,
        eliminarProducto,
        obtenerDeudaAcumulada,
        calcularDeudaPendiente,
        generarCodigoVenta,
        registrarDevolucion,
        obtenerDevoluciones,
        actualizarEstadoDevolucion,
        buscarVentaPorCodigo,
        obtenerVentasPorPeriodo,
        calcularTotalDevolucionesAprobadas,
        devoluciones,
        presupuestos,
        obtenerPresupuestos,
        crearPresupuesto,
        notasEntrega,
        obtenerNotasEntrega,
        crearNotaEntrega,
        pedidos,
        obtenerPedidos,
        crearPedido,
        // ✅ NUEVAS FUNCIONES PARA MÚLTIPLES PRODUCTOS EN VENTAS
        obtenerVentasSinFacturar,
        marcarVentasFacturadas,
        // 🚀 PASO 2 - SISTEMA INTELIGENTE DE DEVOLUCIONES
        procesarDevolucion,
        aprobarDevolucion,  // ✅ NUEVO: Aprobar devoluciones pendientes
        rechazarDevolucion, // ✅ NUEVO: Rechazar devoluciones pendientes
        crearAveria,
        crearMovimientoFinanciero,
        // 🎯 CÓDIGOS VENTA EN FACTURAS Y DEVOLUCIONES POR FACTURA
        buscarFacturaPorNumero,
        obtenerProductosFacturaParaDevoluciones,
        // 🔧 AVERÍAS
        averias,
        obtenerAverias,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
