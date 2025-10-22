import React, { createContext, useContext, useState, useEffect } from "react";
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

  // -------------------------
  // 🔐 Autenticación
  // -------------------------
  useEffect(() => {
    const session = supabase.auth.getSession().then(({ data }) => {
      setUser(data?.session?.user || null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => listener?.subscription?.unsubscribe();
  }, []);

  // -------------------------
  // 📦 Inventario
  // -------------------------
  const obtenerInventario = async () => {
    try {
      const { data, error } = await supabase
        .from("inventario")
        .select("*")
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
      const { data, error } = await supabase
        .from("ventas")
        .select("*")
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
  // 📉 Egresos (placeholder)
  // -------------------------
  const obtenerEgresos = async () => {
    try {
      // Si tienes una tabla de egresos en Supabase, úsala
      // Por ahora devolvemos un array vacío
      return [];
    } catch (error) {
      console.error("Error al obtener egresos:", error.message);
      return [];
    }
  };

  // -------------------------
  // 💾 Actualizar inventario después de venta
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
  // 💼 Contexto compartido
  // -------------------------
  return (
    <AppContext.Provider
      value={{
        user,
        ventas,
        inventario,
        loading,
        crearProducto,
        obtenerInventario,
        registrarVenta,
        obtenerVentas,
        calcularBalance,
        logout,
        obtenerEgresos,
        actualizarInventario,
        guardarGastosFijos,
        obtenerGastosFijos,
        calcularValorInventario,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
