import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { pb } from "../pocketbase.js";
import { retryWithExponentialBackoff, isConnectionError, createThrottler } from "../lib/retryUtils.js";

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
  const [averias, setAverias] = useState([]);
  const [pedidos, setPedidos] = useState([]);
  const [error, setError] = useState(null);
  const [tutorialCompleted, setTutorialCompleted] = useState(false);


  const checkPremiumStatus = useCallback(async (userId) => {
    try {
      if (!userId) {
        console.warn("⚠️ No hay userId para verificar premium");
        return { success: false, isPremium: null, message: "No userId" };
      }

      const records = await retryWithExponentialBackoff(
        () => pb.collection("premium_subscriptions").getFullList({
          filter: `user_id="${userId}" && status="active"`,
          requestKey: 'checkPremiumStatus'
        }),
        2
      );

      const record = records[0];

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

  const checkTutorialStatus = useCallback(async (userId) => {
    try {
      // Verificar localStorage primero
      const localStatus = localStorage.getItem(`tutorial_completed_${userId}`);
      if (localStatus === 'true') {
        setTutorialCompleted(true);
        return true;
      }

      // Verificar base de datos
      const records = await pb.collection('tutorial_completado').getFullList({
        filter: `user_id="${userId}"`,
        requestKey: 'checkTutorialStatus'
      });
      const record = records[0];
      if (record?.completado) {
        setTutorialCompleted(true);
        localStorage.setItem(`tutorial_completed_${userId}`, 'true');
        return true;
      }

      return false;
    } catch (error) {
      console.warn('Error verificando tutorial:', error);
      return false;
    }
  }, []);

  const markTutorialCompleted = useCallback(async (userId) => {
    try {
      // Marcar en base de datos
      const existing = await pb.collection('tutorial_completado').getFirstListItem(`user_id="${userId}"`).catch(() => null);

      if (existing) {
        await pb.collection('tutorial_completado').update(existing.id, {
          completado: true,
          fecha_completado: new Date().toISOString()
        });
      } else {
        await pb.collection('tutorial_completado').create({
          user_id: userId,
          tutorial_version: '1.0',
          completado: true,
          fecha_completado: new Date().toISOString()
        });
      }

      // Marcar en localStorage
      localStorage.setItem(`tutorial_completed_${userId}`, 'true');

      // Actualizar estado
      setTutorialCompleted(true);

      return true;
    } catch (error) {
      console.warn('Error marcando tutorial como completado:', error);
      // Fallback a localStorage
      localStorage.setItem(`tutorial_completed_${userId}`, 'true');
      setTutorialCompleted(true);
      return false;
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

  const logout = async () => {
    try {
      pb.authStore.clear();
      setUser(null);
      setIsPremium(false);
      setPremiumData(null);
      setVentas([]);
      setInventario([]);
      setClientes([]);
      setDevoluciones([]);
      setEgreso([]);
      setHistorialMeses([]);
      setFacturas([]);
      setPresupuestos([]);
      setNotasEntrega([]);
      setAverias([]);
      setPedidos([]);
      console.log("✅ Sesión cerrada");
      return { success: true, message: "Sesión cerrada" };
    } catch (error) {
      console.error("Error al cerrar sesión:", error.message);
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

  // Función de migración para actualizar registros existentes sin user_id
  const migrateExistingData = useCallback(async () => {
    if (!user?.id) return;
    
    // Evitar múltiples migraciones simultáneas
    if (window._isMigrating) return;
    window._isMigrating = true;

    try {
      console.log("🔄 Verificando migración de datos existentes...");

      const collectionsToMigrate = [
        'ventas', 'clientes', 'inventario', 'devoluciones', 'egreso',
        'facturas', 'presupuestos', 'notas_entrega', 'perfil_empresa',
        'historialMeses', 'premium_subscriptions'
      ];

      for (const collectionName of collectionsToMigrate) {
        try {
          // Obtener solo los que NO tienen user_id si es posible, o usar requestKey: null para evitar cancelaciones
          const allRecords = await pb.collection(collectionName).getFullList({
            fields: 'id,user_id',
            perPage: 100, // Menos registros para no saturar
            requestKey: `migrate_${collectionName}`
          });

          const recordsWithoutUserId = allRecords.filter(record =>
            !record.user_id || record.user_id === ""
          );

          if (recordsWithoutUserId.length > 0) {
            console.log(`📝 Migrando ${recordsWithoutUserId.length} registros en ${collectionName}...`);

            // Usar Promise.all con un límite para no saturar
            const updates = recordsWithoutUserId.map(record => 
              pb.collection(collectionName).update(record.id, { user_id: user.id }, { requestKey: null })
            );
            
            await Promise.all(updates);
            console.log(`✅ Migrados ${recordsWithoutUserId.length} registros en ${collectionName}`);
          }
        } catch (error) {
          // Silenciar errores de "columna no encontrada" (400) o "no encontrado" (404)
          if (error.status !== 400 && error.status !== 404) {
            console.warn(`⚠️ Error migrando ${collectionName}:`, error.message);
          }
        }
      }

      console.log("✅ Migración de datos completada");
    } catch (error) {
      console.warn("⚠️ Error en migración de datos:", error.message);
    } finally {
      window._isMigrating = false;
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;

    console.log("🔄 Usuario autenticado, verificando premium:", user.id);
    let isMounted = true;

    const timer = setTimeout(async () => {
      if (isMounted) {
        // Ejecutar migración de datos primero
        await migrateExistingData();

        // Luego verificar premium
        checkPremiumStatus(user.id).catch((err) => {
          console.warn("Error verificando premium:", err.message);
        });
      }
    }, 300);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [user?.id, checkPremiumStatus, migrateExistingData]);

  // Helpers para mapear keys de UI <-> PocketBase
  const mapPerfilToPB = (perfil = {}) => ({
    // aceptar múltiples variantes de nombres del formulario
    nombre_negocio: perfil.nombre_negocio ?? perfil.nombreEmpresa ?? perfil.nombre_empresa ?? perfil.name ?? "",
    nit: perfil.nit ?? perfil.identificacionFiscal ?? perfil.identificacion_fiscal ?? perfil.identification ?? "",
    razon_social: perfil.razon_social ?? perfil.razonSocial ?? "",
    email: perfil.email ?? perfil.correo ?? "",
    telefono: perfil.telefono ?? perfil.phone ?? "",
    ciudad: perfil.ciudad ?? perfil.city ?? "",
    departamento: perfil.departamento ?? perfil.state ?? "",
    direccion: perfil.direccion ?? perfil.address ?? "",
    logo_url: perfil.logo_url ?? perfil.logoUrl ?? perfil.logo ?? "",
    user_id: user?.id ?? perfil.user_id,
    owner: user?.id ?? perfil.owner
  });

  const mapPBToPerfil = (pbRecord = {}) => ({
    id: pbRecord?.id,
    nombre: pbRecord?.nombre_negocio ?? "",
    nombre_negocio: pbRecord?.nombre_negocio ?? "",
    identificacion_fiscal: pbRecord?.nit ?? "",
    nit: pbRecord?.nit ?? "",
    razon_social: pbRecord?.razon_social ?? "",
    email: pbRecord?.email ?? "",
    telefono: pbRecord?.telefono ?? "",
    ciudad: pbRecord?.ciudad ?? "",
    departamento: pbRecord?.departamento ?? "",
    direccion: pbRecord?.direccion ?? "",
    logo_url: pbRecord?.logo_url ?? "",
    user_id: pbRecord?.user_id ?? pbRecord?.owner ?? ""
  });

  // Guardar/actualizar perfil mapeando campos al esquema de PB
  const savePerfilEmpresa = async (perfilData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");
      const payload = mapPerfilToPB(perfilData);
      console.debug("savePerfilEmpresa -> payload PB:", payload);

      const existing = perfilEmpresa?.id
        ? perfilEmpresa
        : await pb.collection('perfil_empresa').getFirstListItem(`user_id="${user.id}"`).catch(() => null);

      const record = existing?.id
        ? await pb.collection('perfil_empresa').update(existing.id, payload)
        : await pb.collection('perfil_empresa').create(payload);

      setPerfilEmpresa(mapPBToPerfil(record));
      console.debug("savePerfilEmpresa: éxito:", record);
      return { success: true, record };
    } catch (err) {
      console.error("Error guardando perfilEmpresa:", err);
      return { success: false, message: err?.message ?? "Error desconocido", details: err?.data ?? null };
    }
  };

  // Fetch perfil (asegurar mapeo a UI shape)
  const fetchPerfilEmpresa = useCallback(async () => {
    try {
      if (!user?.id) return;
      console.log("🔍 DEBUG fetchPerfilEmpresa: Buscando perfil para user:", user.id);
      const rec = await pb.collection('perfil_empresa').getFirstListItem(`user_id="${user.id}"`).catch(() => null);
      console.log("📊 DEBUG fetchPerfilEmpresa: Registro encontrado en PB:", rec);

      if (rec) {
        const mapped = mapPBToPerfil(rec);
        console.log("🔄 DEBUG fetchPerfilEmpresa: Registro mapeado:", mapped);
        setPerfilEmpresa(mapped);
      } else {
        console.log("⚠️ DEBUG fetchPerfilEmpresa: No se encontró registro de perfil");
        setPerfilEmpresa(null);
      }
    } catch (err) {
      console.error("❌ DEBUG fetchPerfilEmpresa: Error cargando perfilEmpresa:", err);
      setPerfilEmpresa(null);
    }
  }, [user?.id]);

  // Validación para permitir crear facturas
  const validatePerfilParaFactura = () => {
    const missing = [];
    const nombre = perfilEmpresa?.nombre_negocio;
    const nit = perfilEmpresa?.nit;
    if (!nombre || nombre.trim() === "") missing.push("nombre_negocio");
    if (!nit || nit.trim() === "") missing.push("nit");
    return { ok: missing.length === 0, missing };
  };

  const registrarVenta = async (ventaData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");
      // Enviar ambos campos por compatibilidad: owner / user_id
      const payload = { ...ventaData, owner: user.id, user_id: user.id };
      console.debug("registrarVenta payload:", payload);

      const record = await pb.collection('ventas').create(payload);
      setVentas(prev => [record, ...prev]);
      console.debug("registrarVenta: éxito:", record);
      return { success: true, record };
    } catch (err) {
      console.error("Error registrando venta:", err);
      console.error("err.response:", err?.response || null);
      console.error("err.data:", err?.data || null);
      return { success: false, message: err?.message || 'Error desconocido', details: err?.data || null };
    }
  };

  const registrarEgreso = async (egresoData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");
      const payload = { ...egresoData, owner: user.id, user_id: user.id };
      console.debug("registrarEgreso payload:", payload);
      const record = await pb.collection('egreso').create(payload);
      setEgreso((prev) => [record, ...prev]);
      console.debug("registrarEgreso: éxito:", record);
      return { success: true, record };
    } catch (err) {
      console.error("Error registrando egreso:", err);
      console.error("err.response:", err?.response || null);
      console.error("err.data:", err?.data || null);
      return { success: false, message: err?.message || 'Error desconocido', details: err?.data || null };
    }
  };

  const fetchVentas = useCallback(createThrottler(async () => {
    try {
      if (!user?.id) return;
      console.debug("fetchVentas: iniciando para user:", user.id);

      const ventasRes = await retryWithExponentialBackoff(
        () => pb.collection('ventas').getFullList({
          filter: `user_id="${user.id}"`, // ajusta a tu campo real (owner/user_id)
          requestKey: null
        }),
        2
      );

      setVentas(Array.isArray(ventasRes) ? ventasRes : []);
      console.debug("fetchVentas: cargadas ventas:", (ventasRes || []).length);
    } catch (err) {
      console.error("Error al cargar ventas:", err);
      console.error("err.response:", err?.response || null);
      console.error("err.data:", err?.data || null);
      if ((err?.message || '').toLowerCase().includes('autocancel')) {
        console.warn("Petición autocancelada: evita abort controllers o peticiones repetidas durante reintentos.");
      }
    }
  }, 2000), [user?.id]);

  const fetchInventario = useCallback(async () => {
    try {
      if (!user?.id) return;

      console.log("🔄 fetchInventario: Iniciando carga...");
      const records = await retryWithExponentialBackoff(
        () => pb.collection("inventario").getFullList({
          filter: `user_id="${user.id}"`,
        }),
        2 // Retry up to 2 times
      );

      console.log(`✅ fetchInventario: ${records.length} productos cargados`);
      setInventario(records);
    } catch (error) {
      console.error("❌ Error al cargar inventario:", error.message);
      // Don't clear existing inventory on error - keep what we have
      // setInventario([]); // Commented out to preserve existing data
    }
  }, [user?.id]);

  const fetchClientes = useCallback(async () => {
    try {
      if (!user?.id) return;

      console.log("🔄 fetchClientes: Iniciando carga...");
      const records = await retryWithExponentialBackoff(
        () => pb.collection("clientes").getFullList({
          filter: `user_id="${user.id}"`,
        }),
        2 // Retry up to 2 times
      );

      console.log(`✅ fetchClientes: ${records.length} clientes cargados`);
      setClientes(records);
    } catch (error) {
      console.error("❌ Error al cargar clientes:", error.message);
      // Don't clear existing clients on error - keep what we have
      // setClientes([]); // Commented out to preserve existing data
    }
  }, [user?.id]);

  const fetchDevoluciones = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("devoluciones").getFullList({
        filter: `user_id="${user.id}"`,
      });

      const sorted = records.sort((a, b) => new Date(b.created) - new Date(a.created));
      setDevoluciones(sorted);
    } catch (error) {
      console.error("Error al cargar devoluciones:", error.message);
    }
  }, [user?.id]);

  const fetchEgreso = useCallback(createThrottler(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("egreso").getFullList({
        filter: `user_id="${user.id}"`,
      });

      const sorted = records.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setEgreso(sorted);
    } catch (error) {
      console.error("Error al cargar egresos:", error.message);
    }
  }, 2000), [user?.id]);

  const fetchHistorialMeses = useCallback(createThrottler(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("historialMeses").getFullList({
        filter: `user_id="${user.id}"`,
      });

      const sorted = records.sort((a, b) => new Date(b.mes) - new Date(a.mes));
      setHistorialMeses(sorted);
    } catch (error) {
      console.error("Error al cargar historial de meses:", error.message);
    }
  }, 2000), [user?.id]);

  const fetchFacturas = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("facturas").getFullList({
        filter: `user_id="${user.id}"`,
      });

      const sorted = records.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setFacturas(sorted);
    } catch (error) {
      console.error("Error al cargar facturas:", error.message);
    }
  }, [user?.id]);

  const fetchPresupuestos = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("presupuestos").getFullList({
        filter: `user_id="${user.id}"`,
      });

      const sorted = records.sort((a, b) => new Date(b.fecha_creacion) - new Date(a.fecha_creacion));
      setPresupuestos(sorted);
    } catch (error) {
      console.error("Error al cargar presupuestos:", error.message);
    }
  }, [user?.id]);

  const fetchNotasEntrega = useCallback(async () => {
    try {
      if (!user?.id) return;

      const records = await pb.collection("notas_entrega").getFullList({
        filter: `user_id="${user.id}"`,
      });

      const sorted = records.sort((a, b) => new Date(b.fecha_entrega) - new Date(a.fecha_entrega));
      setNotasEntrega(sorted);
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
      console.log("🔍 DEBUG createEgreso: Iniciando creación con data:", egresoData);
      if (!user?.id) throw new Error("Usuario no autenticado");

      const payload = {
        ...egresoData,
        user_id: user.id,
      };
      console.log("📤 DEBUG createEgreso: Payload a enviar:", payload);

      const newEgreso = await pb.collection("egreso").create(payload);
      console.log("✅ DEBUG createEgreso: Egreso creado en DB:", newEgreso);

      setEgreso((prev) => [newEgreso, ...prev]);
      console.log("🔄 DEBUG createEgreso: Estado local actualizado");

      return { success: true, data: newEgreso };
    } catch (error) {
      console.error("❌ DEBUG createEgreso: Error creando egreso:", error);
      console.error("❌ DEBUG createEgreso: Error details:", error.message, error.data);
      return { success: false, error: error.message, details: error.data };
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

      // Usar el mapeo correcto para asegurar consistencia
      const pbData = mapPerfilToPB(perfilData);

      let updated;
      if (perfilEmpresa?.id) {
        updated = await pb.collection("perfil_empresa").update(perfilEmpresa.id, pbData);
      } else {
        updated = await pb.collection("perfil_empresa").create({
          ...pbData,
          user_id: user.id,
        });
      }

      // Actualizar el estado con el registro mapeado de vuelta
      setPerfilEmpresa(mapPBToPerfil(updated));
      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando perfil empresa:", error.message);
      return { success: false, error: error.message };
    }
  };

  const obtenerVentas = useCallback(async () => {
    try {
      if (!user?.id) return { success: true, data: ventas };
      // Si ya tenemos ventas en el contexto, podemos retornarlas
      if (ventas.length > 0) return { success: true, data: ventas };
      
      const records = await pb.collection("ventas").getFullList({
        filter: `user_id="${user.id}"`,
        requestKey: null
      });
      const sorted = records.sort((a, b) => new Date(b.created) - new Date(a.created));
      return { success: true, data: sorted };
    } catch (error) {
      if (error.isAbort) return { success: true, data: ventas };
      console.error("Error al cargar ventas:", error.message);
      return { success: false, data: ventas, error: error.message };
    }
  }, [user?.id, ventas]);

  const obtenerDevoluciones = useCallback(async () => {
    try {
      if (!user?.id) return { success: true, data: devoluciones };
      if (devoluciones.length > 0) return { success: true, data: devoluciones };

      const records = await pb.collection("devoluciones").getFullList({
        filter: `user_id="${user.id}"`,
        requestKey: 'obtenerDevoluciones'
      });
      const sorted = records.sort((a, b) => new Date(b.created) - new Date(a.created));
      return { success: true, data: sorted };
    } catch (error) {
      if (error.isAbort) return { success: true, data: devoluciones };
      console.error("Error al cargar devoluciones:", error.message);
      return { success: false, data: [], error: error.message };
    }
  }, [user?.id, devoluciones]);

  const obtenerEgresos = useCallback(async () => {
    try {
      console.log("🔍 obtenerEgresos: Iniciando carga");
      if (!user?.id) return { success: true, data: egreso };
      if (egreso.length > 0) return { success: true, data: egreso };

      console.log("✅ obtenerEgresos: Consultando PocketBase para user:", user.id);
      const records = await pb.collection("egreso").getFullList({
        filter: `user_id="${user.id}"`,
        requestKey: 'obtenerEgresos'
      });
      const sorted = records.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      return { success: true, data: sorted };
    } catch (error) {
      if (error.isAbort) return { success: true, data: egreso };
      console.error("❌ obtenerEgresos: Error al cargar egresos:", error.message);
      return { success: false, data: egreso, error: error.message };
    }
  }, [user?.id, egreso]);

  const calcularValorInventario = () => {
    return inventario.reduce((total, item) => {
      return total + (item.cantidad * item.precio || 0);
    }, 0);
  };

  const obtenerGastosFijos = () => {
    try {
      const gastos = localStorage.getItem(`gastosFijos_${user?.id}`);
      return gastos ? parseFloat(gastos) : 0;
    } catch (error) {
      console.warn("Error al obtener gastos fijos:", error);
      return 0;
    }
  };

  const guardarGastosFijos = (monto) => {
    try {
      if (!user?.id) return false;
      localStorage.setItem(`gastosFijos_${user?.id}`, monto.toString());
      return true;
    } catch (error) {
      console.error("Error al guardar gastos fijos:", error);
      return false;
    }
  };

  const obtenerDeudaAcumulada = useCallback(async () => {
    try {
      console.log("🔍 DEBUG obtenerDeudaAcumulada: Iniciando cálculo de deuda");
      if (!user?.id) {
        console.log("❌ DEBUG obtenerDeudaAcumulada: No hay user.id");
        return { success: false, deuda: 0 };
      }

      // Usar datos del contexto si están disponibles para evitar peticiones
      const meses = historialMeses;
      console.log("📊 DEBUG obtenerDeudaAcumulada: Meses encontrados en contexto:", meses.length);

      if (meses.length === 0) {
        console.log("📊 DEBUG obtenerDeudaAcumulada: No hay meses, usando datos de contexto");
        
        const totalVentas = ventas.reduce((acc, v) => acc + (v.monto || 0), 0);
        const totalDevoluciones = devoluciones
          .filter(d => d.estado === 'Aprobada')
          .reduce((acc, d) => acc + (d.monto || 0), 0);
        
        const ingresosTotales = totalVentas - totalDevoluciones;
        const egresosTotales = egreso.reduce((acc, e) => acc + (e.monto || 0), 0);
        const gastosFijos = obtenerGastosFijos();

        const balanceActual = ingresosTotales - egresosTotales - gastosFijos;
        const deudaActual = Math.max(0, -balanceActual);

        return { success: true, deuda: deudaActual };
      }

      const mesMasReciente = meses[0];
      console.log("📊 DEBUG obtenerDeudaAcumulada: mes más reciente:", mesMasReciente.mes, "is_closed:", mesMasReciente.is_closed);

      if (mesMasReciente.is_closed) {
        return { success: true, deuda: mesMasReciente.deuda_pendiente || 0 };
      } else {
        console.log("🔄 DEBUG obtenerDeudaAcumulada: Mes abierto, calculando con datos de contexto...");
        const mesNormalizado = mesMasReciente.mes.slice(0, 7);

        const ventasDelMes = ventas.filter(v => v.mes_cierre && v.mes_cierre.startsWith(mesNormalizado));
        const egresosDelMes = egreso.filter(e => e.mes_cierre && e.mes_cierre.startsWith(mesNormalizado));
        const devolucionesDelMes = devoluciones.filter(d => 
          d.estado === 'Aprobada' && d.created && d.created.startsWith(mesNormalizado)
        );

        const totalVentas = ventasDelMes.reduce((acc, v) => acc + (v.monto || 0), 0);
        const totalDevoluciones = devolucionesDelMes.reduce((acc, d) => acc + (d.monto || 0), 0);
        const ingresosTotales = totalVentas - totalDevoluciones;
        const egresosTotales = egresosDelMes.reduce((acc, e) => acc + (e.monto || 0), 0);
        const gastosFijos = obtenerGastosFijos();
        const deudaAnterior = mesMasReciente.deuda_anterior || 0;

        const deudaActualMes = Math.max(0, deudaAnterior + gastosFijos + egresosTotales - ingresosTotales);

        return { success: true, deuda: deudaActualMes };
      }
    } catch (error) {
      console.error("❌ DEBUG obtenerDeudaAcumulada: Error:", error.message);
      return { success: false, deuda: 0 };
    }
  }, [user?.id, historialMeses, ventas, egreso, devoluciones, obtenerGastosFijos]);

  const calcularTotalDevolucionesAprobadas = () => {
    return devoluciones
      .filter((d) => d.estado === "aprobada")
      .reduce((total, d) => total + (d.monto || 0), 0);
  };

  const actualizarInventario = async (nombreProducto, cantidadVendida) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      const producto = inventario.find(
        (p) => p.nombre.toLowerCase() === nombreProducto.toLowerCase()
      );

      if (!producto) {
        return { success: false, error: "Producto no encontrado" };
      }

      const nuevaCantidad = Math.max(0, producto.cantidad - cantidadVendida);
      const updated = await pb.collection("inventario").update(producto.id, {
        cantidad: nuevaCantidad,
      });

      setInventario((prev) =>
        prev.map((p) => (p.id === producto.id ? updated : p))
      );

      return { success: true, data: updated };
    } catch (error) {
      console.error("Error actualizando inventario:", error.message);
      return { success: false, error: error.message };
    }
  };

  const crearFactura = async (facturaData) => {
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

  const normalizeMesKey = (value = "") => {
    if (!value) return null;
    if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
    try {
      const parsed = new Date(value);
      if (!Number.isNaN(parsed.getTime())) {
        const month = String(parsed.getMonth() + 1).padStart(2, "0");
        return `${parsed.getFullYear()}-${month}-01`;
      }
    } catch (err) {
      return null;
    }
    return null;
  };

  const garantizarMesAbierto = async (mesCierre, options = {}) => {
    try {
      console.log("🔓 DEBUG garantizarMesAbierto: Iniciando apertura de mes:", mesCierre);
      if (!user?.id) {
        console.log("❌ DEBUG garantizarMesAbierto: Usuario no autenticado");
        return { success: false, message: "Usuario no autenticado" };
      }

      // Determine mesCierre: use provided, or latestOpenMonth if exists, otherwise current month
      if (!mesCierre) {
        const latestOpen = historialMeses.find(h => !h.is_closed);
        if (latestOpen) {
          mesCierre = latestOpen.mes;
          console.log("📅 DEBUG garantizarMesAbierto: Usando latestOpenMonth:", mesCierre);
        } else {
          const now = new Date();
          mesCierre = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
          console.log("📅 DEBUG garantizarMesAbierto: Usando current month:", mesCierre);
        }
      } else {
        console.log("📅 DEBUG garantizarMesAbierto: Mes proporcionado:", mesCierre);
      }

      const mesNormalizado = normalizeMesKey(mesCierre);
      if (!mesNormalizado) {
        console.log("❌ DEBUG garantizarMesAbierto: Mes inválido:", mesCierre);
        return { success: false, message: "Mes inválido" };
      }
      console.log("📅 DEBUG garantizarMesAbierto: Mes normalizado:", mesNormalizado);

      const existenteLocal = historialMeses.find((h) => h.mes === mesNormalizado);
      const existenteRemoto = existenteLocal
        ? existenteLocal
        : await pb
            .collection("historialMeses")
            .getFirstListItem(`user_id="${user.id}" && mes="${mesNormalizado}"`)
            .catch(() => null);

      if (existenteRemoto) {
        console.log("📋 DEBUG garantizarMesAbierto: Mes ya existe:", existenteRemoto.is_closed ? "cerrado" : "abierto");
        if (existenteRemoto.is_closed) {
          if (!options.allowReopen) {
            console.log("❌ DEBUG garantizarMesAbierto: Mes cerrado, no se permite reabrir");
            return { success: false, message: "Este mes ya está cerrado" };
          }
          const reabierto = await pb
            .collection("historialMeses")
            .update(existenteRemoto.id, { is_closed: false });
          setHistorialMeses((prev) => {
            const filtrados = prev.filter((h) => h.id !== reabierto.id);
            return [reabierto, ...filtrados];
          });
          console.log("✅ DEBUG garantizarMesAbierto: Mes reabierto");
          return { success: true, message: "Mes reabierto", data: reabierto, reopened: true };
        }
        if (!existenteLocal) {
          setHistorialMeses((prev) => {
            const filtrados = prev.filter((h) => h.id !== existenteRemoto.id);
            return [existenteRemoto, ...filtrados];
          });
        }
        console.log("✅ DEBUG garantizarMesAbierto: Mes ya abierto");
        return { success: true, message: "Mes ya existe y está abierto", data: existenteRemoto };
      }

      // Calculate deuda_anterior using obtenerDeudaAcumulada
      console.log("💰 DEBUG garantizarMesAbierto: Calculando deuda anterior...");
      let deudaAnterior = 0;
      try {
        const deudaResult = await obtenerDeudaAcumulada();
        deudaAnterior = deudaResult.deuda || 0;
        console.log("💰 DEBUG garantizarMesAbierto: Deuda anterior calculada:", deudaAnterior);
      } catch (error) {
        console.warn("⚠️ DEBUG garantizarMesAbierto: Error calculando deuda anterior:", error.message);
      }

      const gastosFijos = obtenerGastosFijos() || 0;
      const deudaTransferida = Math.max(0, deudaAnterior);
      const balanceInicial = -(deudaTransferida + gastosFijos);

      console.log("💰 DEBUG garantizarMesAbierto: Transferencia - gastosFijos:", gastosFijos, "deudaTransferida:", deudaTransferida, "balanceInicial:", balanceInicial);

      const newMes = await pb.collection("historialMeses").create({
        user_id: user.id,
        mes: mesNormalizado,
        total_ventas: 0,
        total_descuentos: 0,
        total_final: 0,
        total_egresos: 0,
        egresos: 0,
        ingresos: 0,
        gastos_fijos: gastosFijos,
        deuda_anterior: deudaTransferida,
        deuda_pendiente: deudaTransferida,
        ganancia_neta: balanceInicial,
        balance_final: balanceInicial,
        cantidad_transacciones: 0,
        is_closed: false,
      });

      setHistorialMeses((prev) => [newMes, ...prev]);
      console.log("✅ DEBUG garantizarMesAbierto: Nuevo mes creado con deuda transferida:", newMes);
      return { success: true, message: "Mes abierto", data: newMes, autoOpened: true };
    } catch (error) {
      console.error("❌ DEBUG garantizarMesAbierto: Error abriendo mes:", error.message);
      return { success: false, message: error.message };
    }
  };

  const cerrarMes = async (mesCierre) => {
    try {
      console.log("🔒 DEBUG cerrarMes: Iniciando cierre de mes:", mesCierre);
      if (!user?.id) {
        console.log("❌ DEBUG cerrarMes: Usuario no autenticado");
        return { success: false, message: "Usuario no autenticado" };
      }

      const mesRegistro = historialMeses.find((h) => h.mes === mesCierre);
      console.log("📋 DEBUG cerrarMes: Registro del mes encontrado:", mesRegistro);
      if (!mesRegistro) {
        console.log("❌ DEBUG cerrarMes: No hay registro de este mes");
        return { success: false, message: "No hay registro de este mes" };
      }

      // Normalizar mes_cierre para comparación robusta
      const normalizeMes = (mes) => {
        if (!mes) return null;
        if (typeof mes === 'string' && mes.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return mes.slice(0, 7); // YYYY-MM
        }
        if (mes instanceof Date) {
          return mes.toISOString().slice(0, 7);
        }
        return String(mes).slice(0, 7);
      };

      const mesNormalizado = normalizeMes(mesCierre);
      console.log("📅 DEBUG cerrarMes: Mes normalizado para filtro:", mesNormalizado);

      const ventasDelMes = ventas.filter((v) => {
        const vMes = normalizeMes(v.mes_cierre);
        return vMes === mesNormalizado;
      });
      console.log("💰 DEBUG cerrarMes: Ventas del mes filtradas:", ventasDelMes.length, "ventas");
      console.log("💰 DEBUG cerrarMes: Ventas detalladas:", ventasDelMes.map(v => ({ id: v.id, mes_cierre: v.mes_cierre, monto: v.monto })));

      // Also filter egresos for the month
      const egresosDelMes = egreso.filter((e) => {
        const eMes = normalizeMes(e.mes_cierre);
        return eMes === mesNormalizado;
      });
      console.log("💸 DEBUG cerrarMes: Egresos del mes filtrados:", egresosDelMes.length, "egresos");
      console.log("💸 DEBUG cerrarMes: Egresos detallados:", egresosDelMes.map(e => ({ id: e.id, mes_cierre: e.mes_cierre, monto: e.monto })));

      const totalVentas = ventasDelMes.reduce((acc, v) => acc + Number(v.monto || 0), 0);
      const totalDescuentos = ventasDelMes.reduce((acc, v) => acc + Number(v.descuento || 0), 0);
      const totalFinal = totalVentas - totalDescuentos;
      const totalEgresos = egresosDelMes.reduce((acc, e) => acc + Number(e.monto || 0), 0);

      console.log("📊 DEBUG cerrarMes: Cálculos - totalVentas:", totalVentas, "totalDescuentos:", totalDescuentos, "totalFinal:", totalFinal, "totalEgresos:", totalEgresos);

      const gastosFijos = obtenerGastosFijos();
      const deudaAnterior = mesRegistro.deuda_anterior || 0;
      const deudaResultante = Math.max(0, deudaAnterior + gastosFijos + totalEgresos - totalFinal);
      const balanceFinal = totalFinal - totalEgresos - gastosFijos - deudaAnterior;
      const gananciaNeta = balanceFinal;

      console.log("💸 DEBUG cerrarMes: Deudas - gastosFijos:", gastosFijos, "deudaAnterior:", deudaAnterior, "totalEgresos:", totalEgresos, "deudaPendiente:", deudaResultante, "gananciaNeta:", gananciaNeta, "balanceFinal:", balanceFinal);

      const updateData = {
        total_ventas: totalVentas,
        total_descuentos: totalDescuentos,
        total_final: totalFinal,
        total_egresos: totalEgresos,
        egresos: totalEgresos,
        ingresos: totalFinal,
        gastos_fijos: gastosFijos,
        deuda_pendiente: deudaResultante,
        ganancia_neta: gananciaNeta,
        balance_final: balanceFinal,
        cantidad_transacciones: ventasDelMes.length + egresosDelMes.length,
        is_closed: true,
      };
      console.log("📝 DEBUG cerrarMes: Datos a actualizar:", updateData);

      const updated = await pb.collection("historialMeses").update(mesRegistro.id, updateData);
      console.log("✅ DEBUG cerrarMes: Registro actualizado en DB:", updated);

      setHistorialMeses((prev) =>
        prev.map((m) => (m.id === mesRegistro.id ? updated : m))
      );

      console.log("🎉 DEBUG cerrarMes: Mes cerrado exitosamente");
      return { success: true, message: "Mes cerrado exitosamente", data: updated };
    } catch (error) {
      console.error("❌ DEBUG cerrarMes: Error cerrando mes:", error.message);
      console.error("❌ DEBUG cerrarMes: Error details:", error);
      return { success: false, message: error.message };
    }
  };

  const obtenerHistorialMeses = async () => {
    try {
      if (!user?.id) return { success: false, data: [] };

      const records = await pb.collection("historialMeses").getFullList({
        filter: `user_id="${user.id}"`,
      });

      const sorted = records.sort((a, b) => new Date(b.mes) - new Date(a.mes));
      return { success: true, data: sorted };
    } catch (error) {
      console.error("Error al cargar historial de meses:", error.message);
      return { success: false, data: [], error: error.message };
    }
  };

  const obtenerInventario = async () => {
    try {
      if (!user?.id) return { success: false, data: [] };
      const records = await pb.collection("inventario").getFullList({
        filter: `user_id="${user.id}"`,
      });
      return { success: true, data: records };
    } catch (error) {
      console.error("Error al obtener inventario:", error.message);
      return { success: false, data: [] };
    }
  };

  const obtenerClientes = async () => {
    try {
      if (!user?.id) return { success: false, data: [] };
      const records = await pb.collection("clientes").getFullList({
        filter: `user_id="${user.id}"`,
      });
      return { success: true, data: records };
    } catch (error) {
      console.error("Error al obtener clientes:", error.message);
      return { success: false, data: [] };
    }
  };

  const obtenerPerfilEmpresa = async () => {
    try {
      console.log("🔍 obtenerPerfilEmpresa: Iniciando carga de perfil empresa");
      if (!user?.id) {
        console.log("❌ obtenerPerfilEmpresa: No hay user.id");
        return { success: false, data: null };
      }
      console.log("✅ obtenerPerfilEmpresa: Usuario autenticado:", user.id);

      if (perfilEmpresa) {
        console.log("✅ obtenerPerfilEmpresa: Usando perfilEmpresa del estado:", perfilEmpresa);
        return { success: true, data: perfilEmpresa };
      }

      console.log("🔄 obtenerPerfilEmpresa: Consultando PocketBase...");
      const records = await pb.collection("perfil_empresa").getFullList({
        filter: `user_id="${user.id}"`,
      });
      console.log("📊 obtenerPerfilEmpresa: Registros encontrados:", records.length);

      if (records.length > 0) {
        const mappedRecord = mapPBToPerfil(records[0]);
        console.log("✅ obtenerPerfilEmpresa: Retornando registro mapeado:", mappedRecord);
        return { success: true, data: mappedRecord };
      }

      console.log("⚠️ obtenerPerfilEmpresa: No se encontraron registros");
      return { success: false, data: null };
    } catch (error) {
      console.error("❌ obtenerPerfilEmpresa: Error al obtener perfil empresa:", error.message);
      console.error("❌ obtenerPerfilEmpresa: Error details:", error);
      return { success: false, data: null };
    }
  };

  const guardarPerfilEmpresa = async (perfilData) => {
    try {
      if (!user?.id) throw new Error("Usuario no autenticado");

      console.log("🔍 DEBUG guardarPerfilEmpresa: Datos recibidos:", perfilData);

      // Usar el mapeo correcto para asegurar que nombre_negocio y nit se guarden
      const pbData = mapPerfilToPB(perfilData);
      console.log("📤 DEBUG guardarPerfilEmpresa: Datos mapeados para PB:", pbData);

      let updated;
      if (perfilEmpresa?.id) {
        console.log("🔄 DEBUG guardarPerfilEmpresa: Actualizando registro existente:", perfilEmpresa.id);
        updated = await pb.collection("perfil_empresa").update(perfilEmpresa.id, pbData);
      } else {
        console.log("➕ DEBUG guardarPerfilEmpresa: Creando nuevo registro");
        updated = await pb.collection("perfil_empresa").create({
          ...pbData,
          user_id: user.id,
        });
      }

      console.log("✅ DEBUG guardarPerfilEmpresa: Registro guardado en PB:", updated);

      // Actualizar el estado con el registro mapeado de vuelta
      const mappedBack = mapPBToPerfil(updated);
      console.log("🔄 DEBUG guardarPerfilEmpresa: Datos mapeados de vuelta:", mappedBack);
      setPerfilEmpresa(mappedBack);

      return { success: true, data: updated };
    } catch (error) {
      console.error("❌ DEBUG guardarPerfilEmpresa: Error guardando perfil empresa:", error.message);
      console.error("❌ DEBUG guardarPerfilEmpresa: Error details:", error);
      return { success: false, message: error.message };
    }
  };
const buscarVentaPorCodigo = (codigo) => ventas.find(v => v.codigo_venta === codigo);
const buscarFacturaPorNumero = (numero) => facturas.find(f => f.numero_factura === numero);
const obtenerProductosFacturaParaDevoluciones = (facturaId) => {
  const factura = facturas.find(f => f.id === facturaId);
  return factura?.productos_json || [];
};
const abrirMes = (mes) => garantizarMesAbierto(mes, { allowReopen: true });
const crearProducto = createInventario;
const actualizarProducto = updateInventario;
const eliminarProducto = deleteInventario;


const aprobarDevolucion = async (devolucionId) => {
  try {
    if (!user?.id) throw new Error("Usuario no autenticado");
    const updated = await pb.collection("devoluciones").update(devolucionId, { estado: "Aprobada" });
    setDevoluciones((prev) => prev.map((d) => (d.id === devolucionId ? updated : d)));
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error aprobando devolución:", error.message);
    return { success: false, message: error.message };
  }
};

const rechazarDevolucion = async (devolucionId) => {
  try {
    if (!user?.id) throw new Error("Usuario no autenticado");
    const updated = await pb.collection("devoluciones").update(devolucionId, { estado: "Rechazada" });
    setDevoluciones((prev) => prev.map((d) => (d.id === devolucionId ? updated : d)));
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error rechazando devolución:", error.message);
    return { success: false, message: error.message };
  }
};

const procesarDevolucion = async (devolucionData) => {
  try {
    if (!user?.id) throw new Error("Usuario no autenticado");
    const newDevolucion = await pb.collection("devoluciones").create({ ...devolucionData, user_id: user.id, estado: "Pendiente Revisión" });
    setDevoluciones((prev) => [newDevolucion, ...prev]);
    return { success: true, data: newDevolucion };
  } catch (error) {
    console.error("Error procesando devolución:", error.message);
    return { success: false, error: error.message };
  }
};

const crearAveria = async (averiaData) => {
  try {
    if (!user?.id) throw new Error("Usuario no autenticado");
    const newAveria = await pb.collection("averias").create({ ...averiaData, user_id: user.id });
    return { success: true, data: newAveria };
  } catch (error) {
    console.error("Error creando avería:", error.message);
    return { success: false, error: error.message };
  }
};

const obtenerPresupuestos = async () => {
  try {
    if (!user?.id) return { success: false, data: [] };
    await fetchPresupuestos();
    return { success: true, data: presupuestos };
  } catch (error) {
    console.error("Error al obtener presupuestos:", error.message);
    return { success: false, data: [] };
  }
};

const crearPedido = async (pedidoData) => {
  try {
    if (!user?.id) throw new Error("Usuario no autenticado");
    const newPedido = await pb.collection("pedidos").create({ ...pedidoData, user_id: user.id });
    return { success: true, data: newPedido };
  } catch (error) {
    console.error("Error creando pedido:", error.message);
    return { success: false, error: error.message };
  }
};

const obtenerPedidos = async () => {
  try {
    if (!user?.id) return { success: false, data: [] };
    const records = await pb.collection("pedidos").getFullList({ filter: `user_id="${user.id}"` });
    const sorted = records.sort((a, b) => new Date(b.created) - new Date(a.created));
    return { success: true, data: sorted };
  } catch (error) {
    console.error("Error al obtener pedidos:", error.message);
    return { success: false, data: [] };
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
    egresos: egreso, // Alias for compatibility
    historialMeses,
    facturas,
    presupuestos,
    notasEntrega,
    tutorialCompleted,
    checkTutorialStatus,
    markTutorialCompleted,
    checkPremiumStatus,
    purchasePremium,
    cancelPremium,
    logout,
    createVenta,
    updateVenta,
    deleteVenta,
    createCliente,
    crearCliente: createCliente,
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
    registrarVenta,
    registrarEgreso,
    savePerfilEmpresa,
    fetchInventario,
    fetchClientes,
    fetchDevoluciones,
    fetchEgreso,
    fetchHistorialMeses,
    fetchFacturas,
    fetchPresupuestos,
    fetchNotasEntrega,
    obtenerVentas,
    obtenerDevoluciones,
    obtenerEgresos,
    calcularValorInventario,
    obtenerGastosFijos,
    guardarGastosFijos,
    obtenerDeudaAcumulada,
    calcularTotalDevolucionesAprobadas,
    actualizarInventario,
    crearFactura,
    garantizarMesAbierto,
    cerrarMes,
    obtenerHistorialMeses,
    obtenerInventario,
    obtenerClientes,
    obtenerPerfilEmpresa,
    guardarPerfilEmpresa,
    buscarVentaPorCodigo,
buscarFacturaPorNumero,
obtenerProductosFacturaParaDevoluciones,
abrirMes,
crearProducto,
actualizarProducto,
eliminarProducto,
aprobarDevolucion,
rechazarDevolucion,
procesarDevolucion,
crearAveria,
obtenerPresupuestos,
crearPedido,
obtenerPedidos,
averias,
pedidos,

  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
