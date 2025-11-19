import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { pb } from "../pocketbase.js";
import { retryWithExponentialBackoff, isConnectionError } from "../lib/retryUtils.js";

const AppContext = createContext();
export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [ventas, setVentas] = useState([]);
  const [inventario, setInventario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumData, setPremiumData] = useState(null);
  const [perfilEmpresa, setPerfilEmpresa] = useState(null);
  const [devoluciones, setDevoluciones] = useState([]);
  const [lastKnownPremium, setLastKnownPremium] = useState(false);
  const [clientes, setClientes] = useState([]);
  const [egreso, setEgreso] = useState([]);
  const [historialMeses, setHistorialMeses] = useState([]);
  const [facturas, setFacturas] = useState([]);
  const [presupuestos, setPresupuestos] = useState([]);
  const [notasEntrega, setNotasEntrega] = useState([]);
  const [error, setError] = useState(null);

  const checkPremiumStatus = useCallback(async (userId) => {
    try {
      if (!userId) {
        console.warn("⚠️ No hay userId para verificar premium");
        return { success: false, isPremium: null, message: "No userId" };
      }

      const record = await retryWithExponentialBackoff(
        () => pb.collection("premium_subscriptions").getFirstListItem(`user_id="${userId}" && status="active"`),
        2
      );

      if (record) {
        const now = new Date();
        let isActive = false;

        try {
          const expiresAt = new Date(record.current_period_end);
          isActive = !isNaN(expiresAt.getTime()) && now < expiresAt;
        } catch (e) {
          console.warn("⚠️ Fecha de expiración inválida:", record.current_period_end);
          isActive = false;
        }

        setIsPremium(isActive);
        setPremiumData(isActive ? record : null);
        if (isActive) {
          setLastKnownPremium(true);
        }
        console.log("✅ Estado premium verificado:", { isActive });
        return { success: true, isPremium: isActive, data: record };
      } else {
        console.log("ℹ️ Usuario no tiene suscripción premium activa");
        setIsPremium(false);
        setPremiumData(null);
        setLastKnownPremium(false);
        return { success: true, isPremium: false };
      }
    } catch (error) {
      console.warn("⚠️ Error al verificar premium:", error.message);
      return { success: false, message: error.message, isPremium: null, useLastKnown: true };
    }
  }, []);

  const purchasePremium = async (paypalTransactionId, paypalData) => {
    try {
      if (!user?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      const now = new Date();
      const nextMonth = new Date(now);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const data = await pb.collection("premium_subscriptions").create({
        user_id: user.id,
        status: "active",
        payment_method: "paypal",
        transaction_id: paypalTransactionId,
        price: 20.0,
        billing_cycle_anchor: now.toISOString(),
        current_period_start: now.toISOString(),
        current_period_end: nextMonth.toISOString(),
      });

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
      if (!user?.id || !premiumData?.id) {
        return { success: false, message: "Usuario no autenticado" };
      }

      await pb.collection("premium_subscriptions").update(premiumData.id, {
        status: "cancelled",
      });

      setIsPremium(false);
      setPremiumData(null);
      console.log("✅ Suscripción premium cancelada");
      return { success: true, message: "Suscripción cancelada" };
    } catch (error) {
      console.error("Error al cancelar premium:", error.message);
      return { success: false, message: error.message };
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const isValid = pb.authStore.isValid;
        if (isValid) {
          setUser(pb.authStore.model);
        }
      } catch (err) {
        console.error("Error inicializando auth:", err);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.model || null);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user?.id) return;

    console.log("🔄 Usuario autenticado, verificando premium:", user.id);
    let isMounted = true;

    const timer = setTimeout(() => {
      if (isMounted) {
        checkPremiumStatus(user.id).catch((err) => {
          console.warn("Error verificando premium:", err.message);
        });
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user?.id, checkPremiumStatus]);

  const fetchPerfilEmpresa = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("perfil_empresa").getFullList({
        filter: `user_id="${user.id}"`,
      });

      if (records.length > 0) {
        setPerfilEmpresa(records[0]);
      }
    } catch (error) {
      console.error("Error al cargar perfil empresa:", error.message);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchPerfilEmpresa();
    }
  }, [user?.id, fetchPerfilEmpresa]);

  const fetchVentas = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("ventas").getFullList({
        filter: `user_id="${user.id}"`,
        sort: "-created_at",
      });

      setVentas(records);
    } catch (error) {
      console.error("Error al cargar ventas:", error.message);
    }
  }, [user?.id]);

  const fetchInventario = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("inventario").getFullList({
        filter: `user_id="${user.id}"`,
      });

      setInventario(records);
    } catch (error) {
      console.error("Error al cargar inventario:", error.message);
    }
  }, [user?.id]);

  const fetchClientes = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("clientes").getFullList({
        filter: `user_id="${user.id}"`,
      });

      setClientes(records);
    } catch (error) {
      console.error("Error al cargar clientes:", error.message);
    }
  }, [user?.id]);

  const fetchDevoluciones = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("devoluciones").getFullList({
        filter: `user_id="${user.id}"`,
        sort: "-created_at",
      });

      setDevoluciones(records);
    } catch (error) {
      console.error("Error al cargar devoluciones:", error.message);
    }
  }, [user?.id]);

  const fetchEgreso = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("egreso").getFullList({
        filter: `user_id="${user.id}"`,
        sort: "-fecha",
      });

      setEgreso(records);
    } catch (error) {
      console.error("Error al cargar egresos:", error.message);
    }
  }, [user?.id]);

  const fetchHistorialMeses = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("historialMeses").getFullList({
        filter: `user_id="${user.id}"`,
        sort: "-mes",
      });

      setHistorialMeses(records);
    } catch (error) {
      console.error("Error al cargar historial de meses:", error.message);
    }
  }, [user?.id]);

  const fetchFacturas = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("facturas").getFullList({
        filter: `user_id="${user.id}"`,
        sort: "-fecha",
      });

      setFacturas(records);
    } catch (error) {
      console.error("Error al cargar facturas:", error.message);
    }
  }, [user?.id]);

  const fetchPresupuestos = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("presupuestos").getFullList({
        filter: `user_id="${user.id}"`,
        sort: "-fecha_creacion",
      });

      setPresupuestos(records);
    } catch (error) {
      console.error("Error al cargar presupuestos:", error.message);
    }
  }, [user?.id]);

  const fetchNotasEntrega = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("notas_entrega").getFullList({
        filter: `user_id="${user.id}"`,
        sort: "-fecha_entrega",
      });

      setNotasEntrega(records);
    } catch (error) {
      console.error("Error al cargar notas de entrega:", error.message);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        fetchVentas(),
        fetchInventario(),
        fetchClientes(),
        fetchDevoluciones(),
        fetchEgreso(),
        fetchHistorialMeses(),
        fetchFacturas(),
        fetchPresupuestos(),
        fetchNotasEntrega(),
      ]);
    }
  }, [user?.id]);

  const createVenta = async (ventaData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const newVenta = await pb.collection("ventas").create({
        ...ventaData,
        user_id: user.id,
      });

      setVentas((prev) => [newVenta, ...prev]);
      return { success: true, data: newVenta };
    } catch (error) {
      console.error("Error creando venta:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updateVenta = async (ventaId, ventaData) => {
    try {
      const updated = await pb.collection("ventas").update(ventaId, ventaData);
      setVentas((prev) =>
        prev.map((v) => (v.id === ventaId ? updated : v))
      );
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando venta:", error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteVenta = async (ventaId) => {
    try {
      await pb.collection("ventas").delete(ventaId);
      setVentas((prev) => prev.filter((v) => v.id !== ventaId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando venta:", error.message);
      return { success: false, error: error.message };
    }
  };

  const createCliente = async (clienteData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const newCliente = await pb.collection("clientes").create({
        ...clienteData,
        user_id: user.id,
      });

      setClientes((prev) => [newCliente, ...prev]);
      return { success: true, data: newCliente };
    } catch (error) {
      console.error("Error creando cliente:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updateCliente = async (clienteId, clienteData) => {
    try {
      const updated = await pb.collection("clientes").update(clienteId, clienteData);
      setClientes((prev) =>
        prev.map((c) => (c.id === clienteId ? updated : c))
      );
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando cliente:", error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteCliente = async (clienteId) => {
    try {
      await pb.collection("clientes").delete(clienteId);
      setClientes((prev) => prev.filter((c) => c.id !== clienteId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando cliente:", error.message);
      return { success: false, error: error.message };
    }
  };

  const createInventario = async (inventarioData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const newItem = await pb.collection("inventario").create({
        ...inventarioData,
        user_id: user.id,
      });

      setInventario((prev) => [newItem, ...prev]);
      return { success: true, data: newItem };
    } catch (error) {
      console.error("Error creando inventario:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updateInventario = async (inventarioId, inventarioData) => {
    try {
      const updated = await pb.collection("inventario").update(inventarioId, inventarioData);
      setInventario((prev) =>
        prev.map((i) => (i.id === inventarioId ? updated : i))
      );
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando inventario:", error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteInventario = async (inventarioId) => {
    try {
      await pb.collection("inventario").delete(inventarioId);
      setInventario((prev) => prev.filter((i) => i.id !== inventarioId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando inventario:", error.message);
      return { success: false, error: error.message };
    }
  };

  const createDevolucion = async (devolucionData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const newDevolucion = await pb.collection("devoluciones").create({
        ...devolucionData,
        user_id: user.id,
      });

      setDevoluciones((prev) => [newDevolucion, ...prev]);
      return { success: true, data: newDevolucion };
    } catch (error) {
      console.error("Error creando devolución:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updateDevolucion = async (devolucionId, devolucionData) => {
    try {
      const updated = await pb.collection("devoluciones").update(devolucionId, devolucionData);
      setDevoluciones((prev) =>
        prev.map((d) => (d.id === devolucionId ? updated : d))
      );
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando devolución:", error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteDevolucion = async (devolucionId) => {
    try {
      await pb.collection("devoluciones").delete(devolucionId);
      setDevoluciones((prev) => prev.filter((d) => d.id !== devolucionId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando devolución:", error.message);
      return { success: false, error: error.message };
    }
  };

  const createEgreso = async (egresoData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const newEgreso = await pb.collection("egreso").create({
        ...egresoData,
        user_id: user.id,
      });

      setEgreso((prev) => [newEgreso, ...prev]);
      return { success: true, data: newEgreso };
    } catch (error) {
      console.error("Error creando egreso:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updateEgreso = async (egresoId, egresoData) => {
    try {
      const updated = await pb.collection("egreso").update(egresoId, egresoData);
      setEgreso((prev) =>
        prev.map((e) => (e.id === egresoId ? updated : e))
      );
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando egreso:", error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteEgreso = async (egresoId) => {
    try {
      await pb.collection("egreso").delete(egresoId);
      setEgreso((prev) => prev.filter((e) => e.id !== egresoId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando egreso:", error.message);
      return { success: false, error: error.message };
    }
  };

  const createFactura = async (facturaData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const newFactura = await pb.collection("facturas").create({
        ...facturaData,
        user_id: user.id,
      });

      setFacturas((prev) => [newFactura, ...prev]);
      return { success: true, data: newFactura };
    } catch (error) {
      console.error("Error creando factura:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updateFactura = async (facturaId, facturaData) => {
    try {
      const updated = await pb.collection("facturas").update(facturaId, facturaData);
      setFacturas((prev) =>
        prev.map((f) => (f.id === facturaId ? updated : f))
      );
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando factura:", error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteFactura = async (facturaId) => {
    try {
      await pb.collection("facturas").delete(facturaId);
      setFacturas((prev) => prev.filter((f) => f.id !== facturaId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando factura:", error.message);
      return { success: false, error: error.message };
    }
  };

  const createPresupuesto = async (presupuestoData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const newPresupuesto = await pb.collection("presupuestos").create({
        ...presupuestoData,
        user_id: user.id,
      });

      setPresupuestos((prev) => [newPresupuesto, ...prev]);
      return { success: true, data: newPresupuesto };
    } catch (error) {
      console.error("Error creando presupuesto:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updatePresupuesto = async (presupuestoId, presupuestoData) => {
    try {
      const updated = await pb.collection("presupuestos").update(presupuestoId, presupuestoData);
      setPresupuestos((prev) =>
        prev.map((p) => (p.id === presupuestoId ? updated : p))
      );
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando presupuesto:", error.message);
      return { success: false, error: error.message };
    }
  };

  const deletePresupuesto = async (presupuestoId) => {
    try {
      await pb.collection("presupuestos").delete(presupuestoId);
      setPresupuestos((prev) => prev.filter((p) => p.id !== presupuestoId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando presupuesto:", error.message);
      return { success: false, error: error.message };
    }
  };

  const createNotaEntrega = async (notaData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const newNota = await pb.collection("notas_entrega").create({
        ...notaData,
        user_id: user.id,
      });

      setNotasEntrega((prev) => [newNota, ...prev]);
      return { success: true, data: newNota };
    } catch (error) {
      console.error("Error creando nota de entrega:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updateNotaEntrega = async (notaId, notaData) => {
    try {
      const updated = await pb.collection("notas_entrega").update(notaId, notaData);
      setNotasEntrega((prev) =>
        prev.map((n) => (n.id === notaId ? updated : n))
      );
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando nota de entrega:", error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteNotaEntrega = async (notaId) => {
    try {
      await pb.collection("notas_entrega").delete(notaId);
      setNotasEntrega((prev) => prev.filter((n) => n.id !== notaId));
      return { success: true };
    } catch (error) {
      console.error("Error eliminando nota de entrega:", error.message);
      return { success: false, error: error.message };
    }
  };

  const updatePerfilEmpresa = async (perfilData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      let updated;
      if (perfilEmpresa?.id) {
        updated = await pb.collection("perfil_empresa").update(perfilEmpresa.id, perfilData);
      } else {
        updated = await pb.collection("perfil_empresa").create({
          ...perfilData,
          user_id: user.id,
        });
      }

      setPerfilEmpresa(updated);
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando perfil empresa:", error.message);
      return { success: false, error: error.message };
    }
  };

  const value = {
    user,
    loading,
    error,
    isPremium,
    premiumData,
    perfilEmpresa,
    ventas,
    inventario,
    clientes,
    devoluciones,
    egreso,
    historialMeses,
    facturas,
    presupuestos,
    notasEntrega,
    checkPremiumStatus,
    purchasePremium,
    cancelPremium,
    createVenta,
    updateVenta,
    deleteVenta,
    createCliente,
    updateCliente,
    deleteCliente,
    createInventario,
    updateInventario,
    deleteInventario,
    createDevolucion,
    updateDevolucion,
    deleteDevolucion,
    createEgreso,
    updateEgreso,
    deleteEgreso,
    createFactura,
    updateFactura,
    deleteFactura,
    createPresupuesto,
    updatePresupuesto,
    deletePresupuesto,
    createNotaEntrega,
    updateNotaEntrega,
    deleteNotaEntrega,
    updatePerfilEmpresa,
    fetchVentas,
    fetchInventario,
    fetchClientes,
    fetchDevoluciones,
    fetchEgreso,
    fetchHistorialMeses,
    fetchFacturas,
    fetchPresupuestos,
    fetchNotasEntrega,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
