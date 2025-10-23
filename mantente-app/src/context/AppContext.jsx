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

  // -------------------------
  // 💎 Premium (Suscripciones) - DEFINIR PRIMERO
  // -------------------------
  const checkPremiumStatus = useCallback(async (userId) => {
    try {
      if (!userId) {
        setIsPremium(false);
        setPremiumData(null);
        return { success: false, isPremium: false };
      }

      const { data, error } = await supabase
        .from("premium_subscriptions")
        .select("*")
        .eq("user_id", userId)
        .eq("status", "active")
        .maybeSingle();

      if (error) throw error;

      if (data) {
        // Verificar que no haya expirado
        const now = new Date();
        const expiresAt = new Date(data.current_period_end);
        const isActive = now < expiresAt;

        setIsPremium(isActive);
        setPremiumData(isActive ? data : null);
        return { success: true, isPremium: isActive, data };
      } else {
        setIsPremium(false);
        setPremiumData(null);
        return { success: true, isPremium: false };
      }
    } catch (error) {
      console.error("Error al verificar estado premium:", error.message);
      setIsPremium(false);
      setPremiumData(null);
      return { success: false, message: error.message, isPremium: false };
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
            price: 70.00,
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
  const registrarVenta = async (venta) => {
    try {
      if (!venta.producto || !venta.monto) {
        console.error("Datos incompletos:", venta);
        return { success: false, message: "Faltan datos requeridos para registrar la venta." };
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

      // Insertar en Supabase
      const { data, error } = await supabase
        .from("ventas")
        .insert([
          {
            producto: venta.producto,
            cantidad: venta.cantidad || 1,
            monto: venta.monto,
            metodo_pago: venta.metodo_pago || "Efectivo",
            cliente: venta.cliente || "No especificado",
            descuento: venta.descuento || 0,
            fecha: fechaFinal,
            mes_cierre: mesCierreFinal,
            owner: user?.id || null,
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
      await obtenerInventario();
      await obtenerVentas();
      setLoading(false);
    })();
  }, []);

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
  // 💰 Gastos fijos mensuales
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
      if (!factura.cliente_id || !factura.numero_factura) {
        return { success: false, message: "Cliente y número de factura son requeridos." };
      }

      const { data, error } = await supabase
        .from("facturas")
        .insert([
          {
            owner: user?.id,
            numero_factura: factura.numero_factura,
            cliente_id: factura.cliente_id,
            fecha: factura.fecha || new Date().toISOString().split("T")[0],
            venta_id: factura.venta_id || null,
            subtotal: factura.subtotal || 0,
            descuento: factura.descuento || 0,
            impuesto: factura.impuesto || 0,
            total: factura.total || 0,
            estado: factura.estado || "pendiente",
            metodo_pago: factura.metodo_pago || "Efectivo",
            notas: factura.notas || "",
          },
        ])
        .select()
        .single();

      if (error) throw error;
      setFacturas((prev) => [data, ...prev]);
      console.log("✅ Factura creada:", data);
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

      // Insertar resumen en historialMeses
      const { data, error } = await supabase
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
            ganancia_neta: totalFinal - totalEgresos - gastosFijosGuardados,
            cantidad_transacciones: ventasDelMes.length,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      console.log("✅ Mes cerrado correctamente:", data);
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
        return { success: false, message: "Usuario no autenticado" };
      }

      const { data, error } = await supabase
        .from("empresa_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setPerfilEmpresa(data || null);
      return { success: true, data };
    } catch (error) {
      console.error("Error al obtener perfil de empresa:", error.message);
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
  // 💼 Contexto compartido
  // -------------------------
  useEffect(() => {
    if (user?.id) {
      obtenerClientes();
      obtenerFacturas();
      obtenerEgresos();
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
        guardarPerfilEmpresa,
        obtenerPerfilEmpresa,
        actualizarProducto,
        eliminarProducto,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
