import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase.js";

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
        // ✅ ARREGLO: Solo cambiar a free si es logout explícito
        return { success: false, isPremium: null, message: "No userId" };
      }

      const { data, error } = await supabase
        .from("premium_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      // ✅ ARREGLO CRÍTICO: Si hay error de conexión, MANTENER el estado anterior
      // Esto evita que errores temporales degraden el usuario a Free
      if (error) {
        console.warn("⚠️ Error temporal al verificar premium (conexión):", error.message);
        console.warn("   → Manteniendo estado premium actual para proteger usuario");
        // NO cambiar el estado, devolver el último estado conocido
        return { success: false, message: error.message, isPremium: null, useLastKnown: true };
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
    const session = supabase.auth.getSession().then(({ data }) => {
      const currentUser = data?.session?.user || null;
      setUser(currentUser);
      if (currentUser?.id) {
        checkPremiumStatus(currentUser.id);
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser?.id) {
        checkPremiumStatus(currentUser.id);
      }
    });

    return () => listener?.subscription?.unsubscribe();
  }, [checkPremiumStatus]);

  // ✅ LISTENER EN TIEMPO REAL para cambios en premium_subscriptions
  useEffect(() => {
    if (!user?.id) return;

    console.log("🔄 Iniciando listener de premium para usuario:", user.id);

    // Escuchar cambios en tiempo real
    const subscription = supabase
      .channel(`premium-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "premium_subscriptions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          console.log("📢 Cambio en premium detectado:", payload);
          checkPremiumStatus(user.id);
        }
      )
      .subscribe();

    // ✅ ARREGLO CRÍTICO: Función wrapper que maneja useLastKnown
    const checkWithFallback = async (userId) => {
      const result = await checkPremiumStatus(userId);
      // Si hay error de conexión, mantener el último estado conocido
      if (result?.useLastKnown && lastKnownPremium) {
        console.log("🛡️ Error de conexión detectado. Manteniendo Premium:", lastKnownPremium);
        setIsPremium(lastKnownPremium);
      }
    };

    // ✅ ARREGLO: Verificación periódica cada 30 minutos en lugar de 10 para evitar overhead
    // y verificar premium al montar el componente
    checkWithFallback(user.id);
    
    const interval = setInterval(() => {
      checkWithFallback(user.id);
    }, 1800000); // 30 minutos

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
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

      const { data, error } = await supabase
        .from("inventario")
        .select("*")
        .eq("owner", user.id)
        .order("id", { ascending: false });

      if (error) throw error;
      setInventario(data || []);
      return { success: true, data };
    } catch (error) {
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
  
  // 🔖 Generar código único para cada venta (VTA-YYYY-NNNNN)
  const generarCodigoVenta = async () => {
    try {
      if (!user?.id) {
        return null;
      }

      const hoy = new Date();
      const year = hoy.getFullYear();
      const prefijo = `VTA-${year}`;

      // Obtener la cantidad de ventas registradas en el año
      const { data: ventasAño, error: errorCount } = await supabase
        .from("ventas")
        .select("codigo_venta", { count: "exact" })
        .eq("owner", user.id)
        .ilike("codigo_venta", `${prefijo}-%`)
        .order("codigo_venta", { ascending: false })
        .limit(1);

      if (errorCount && errorCount.code !== "PGRST116") throw errorCount;

      // Obtener número secuencial
      let nuevoNumero = 1;
      if (ventasAño && ventasAño.length > 0) {
        const ultimoCodigo = ventasAño[0].codigo_venta;
        const numero = parseInt(ultimoCodigo.split("-")[2], 10);
        nuevoNumero = numero + 1;
      }

      const codigoVenta = `${prefijo}-${String(nuevoNumero).padStart(5, "0")}`;
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
      const codigoVenta = await generarCodigoVenta();

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

      const { data, error } = await supabase
        .from("ventas")
        .select("*")
        .eq("owner", user.id)
        .order("fecha", { ascending: false });

      if (error) throw error;
      setVentas(data || []);
      return { success: true, data };
    } catch (error) {
      console.error("Error al obtener ventas:", error.message);
      return { success: false, message: error.message };
    }
  };

  // ✅ NUEVO: Obtener ventas sin facturar de un cliente específico
  const obtenerVentasSinFacturar = async (clienteId) => {
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
      
      // ✅ ARREGLO: Primero obtener TODAS las ventas del usuario para debug
      const { data: ventasDebug, error: errorDebug } = await supabase
        .from("ventas")
        .select("id, cliente_id, cliente, facturado, fecha")
        .eq("owner", user.id)
        .order("fecha", { ascending: false });
      
      if (!errorDebug) {
        console.log(`📊 Total de ventas del usuario: ${ventasDebug?.length || 0}`, {
          conClienteId: ventasDebug?.filter(v => v.cliente_id === clienteIdNum).length || 0,
          sinFacturar: ventasDebug?.filter(v => !v.facturado).length || 0,
          conClienteIdYSinFacturar: ventasDebug?.filter(v => v.cliente_id === clienteIdNum && !v.facturado).length || 0,
          ejemplos: ventasDebug?.slice(0, 3).map(v => ({ id: v.id, cliente_id: v.cliente_id, cliente: v.cliente, facturado: v.facturado }))
        });
      }
      
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
  };

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
      }
      setLoading(false);
    })();
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

  // Obtener deuda acumulada del mes anterior
  const obtenerDeudaAcumulada = async () => {
    try {
      if (!user?.id) {
        return { success: false, deuda: 0 };
      }

      const mesActual = new Date().toISOString().slice(0, 7) + "-01";

      // Obtener el mes anterior
      const fechaHoy = new Date();
      fechaHoy.setMonth(fechaHoy.getMonth() - 1);
      const mesPasado = fechaHoy.toISOString().slice(0, 7) + "-01";

      // Buscar el registro del mes pasado
      const { data, error } = await supabase
        .from("historialMeses")
        .select("deuda_pendiente")
        .eq("owner", user.id)
        .eq("mes", mesPasado)
        .maybeSingle();

      if (error) throw error;
      return { success: true, deuda: data?.deuda_pendiente || 0 };
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

      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("owner", user.id)
        .order("fecha_creacion", { ascending: false });

      if (error) throw error;
      setClientes(data || []);
      return { success: true, data };
    } catch (error) {
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
            fecha_creacion: new Date().toISOString(),
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

  const obtenerFacturas = async () => {
    try {
      if (!user?.id) {
        setFacturas([]);
        return { success: true, data: [] };
      }

      const { data, error } = await supabase
        .from("facturas")
        .select("*, clientes(nombre, email)")
        .eq("owner", user.id)
        .order("fecha_creacion", { ascending: false });

      if (error) throw error;
      setFacturas(data || []);
      return { success: true, data };
    } catch (error) {
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
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setFacturas((prev) => [data, ...prev]);
      console.log("✅ Factura creada con información completa + productos:", data);
      return { success: true, message: "Factura creada con éxito.", data };
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
      setFacturas((prev) => prev.map((f) => (f.id === id ? data : f)));
      console.log("✅ Factura actualizada:", data);
      return { success: true, message: "Factura actualizada con éxito.", data };
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

      // Calcular totales
      const totalVentas = ventasDelMes.reduce((acc, v) => acc + Number(v.monto || 0), 0);
      const totalDescuentos = ventasDelMes.reduce((acc, v) => acc + Number(v.descuento || 0), 0);
      const totalFinal = totalVentas - totalDescuentos;

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
      // Luego los ingresos se restan para ver cuánto queda sin pagar
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

      const { data, error } = await supabase
        .from("egreso")
        .select("*")
        .eq("owner", user.id)
        .order("fecha", { ascending: false });

      if (error) throw error;
      setEgresos(data || []);
      return { success: true, data };
    } catch (error) {
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
            owner: user.id,
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

      const { data, error } = await supabase
        .from("devoluciones")
        .select("*")
        .eq("owner", user.id)
        .order("fecha", { ascending: false });

      if (error) throw error;
      setDevoluciones(data || []);
      return { success: true, data };
    } catch (error) {
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

  // Buscar venta por código
  const buscarVentaPorCodigo = (codigoVenta) => {
    return ventas.find((v) => v.codigo_venta === codigoVenta) || null;
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
        .eq("owner", user.id)
        .order("fecha_creacion", { ascending: false });

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
        .from("presupuestos") // Usando presupuestos como tabla de pedidos por ahora
        .select("*")
        .eq("owner", user.id)
        .order("fecha_creacion", { ascending: false });

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
        .from("presupuestos")
        .insert([
          {
            owner: user.id,
            numero_presupuesto: pedido.numero_pedido || `PED-${Date.now()}`,
            cliente: pedido.cliente,
            items: pedido.items || [],
            subtotal: pedido.items?.reduce((sum, item) => sum + (item.cantidad * item.precio_unitario), 0) || 0,
            total: pedido.total || 0,
            estado: pedido.estado || "pendiente",
            notas: pedido.observaciones || "",
            fecha_vencimiento: pedido.fecha_entrega_estimada || null,
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

  // -------------------------
  // 💼 Contexto compartido
  // -------------------------
  useEffect(() => {
    if (user?.id) {
      obtenerClientes();
      obtenerFacturas();
      obtenerEgresos();
      obtenerDevoluciones();
      obtenerPresupuestos();
      obtenerNotasEntrega();
      obtenerPedidos();
      obtenerPerfilEmpresa();
    }
  }, [user?.id]);

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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
