import React, { useState, useEffect } from "react";
import { pb } from "../pocketbase";
import { toast } from "react-toastify";

const SystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const records = await pb.collection("system_settings").getFullList();
      const settingsObj = {};
      records.forEach(record => {
        settingsObj[record.key] = record.value;
      });
      setSettings(settingsObj);
    } catch (error) {
      toast.error("Error cargando configuración");
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key, value) => {
    setSaving(true);
    try {
      const existing = await pb.collection("system_settings").getFirstListItem(`key='${key}'`).catch(() => null);

      if (existing) {
        await pb.collection("system_settings").update(existing.id, { value });
      } else {
        await pb.collection("system_settings").create({ key, value });
      }

      setSettings({ ...settings, [key]: value });
      toast.success("Configuración guardada");
    } catch (error) {
      toast.error("Error guardando configuración");
    } finally {
      setSaving(false);
    }
  };

  const handleFileUpload = async (key, file) => {
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append(key, file);

      // Upload to PocketBase files
      const uploaded = await pb.collection("system_settings").create(formData);
      const fileUrl = pb.files.getUrl(uploaded, uploaded[key]);

      await saveSetting(key, fileUrl);
    } catch (error) {
      toast.error("Error subiendo archivo");
    }
  };

  if (loading) return <div className="text-center p-4">Cargando configuración...</div>;

  return (
    <div className="container-fluid p-4">
      <h2>Configuración del Sistema</h2>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5>Información General</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label>Nombre del Sitio</label>
                <input
                  type="text"
                  className="form-control"
                  value={settings.site_name || ""}
                  onChange={(e) => setSettings({ ...settings, site_name: e.target.value })}
                  onBlur={(e) => saveSetting("site_name", e.target.value)}
                />
              </div>

              <div className="mb-3">
                <label>Logo del Sitio</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => handleFileUpload("site_logo", e.target.files[0])}
                />
                {settings.site_logo && (
                  <img src={settings.site_logo} alt="Logo" className="mt-2" style={{ maxHeight: "100px" }} />
                )}
              </div>

              <div className="mb-3">
                <label>Zona Horaria</label>
                <select
                  className="form-control"
                  value={settings.timezone || "America/Caracas"}
                  onChange={(e) => {
                    setSettings({ ...settings, timezone: e.target.value });
                    saveSetting("timezone", e.target.value);
                  }}
                >
                  <option value="America/Caracas">America/Caracas (UTC-4)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                  <option value="Europe/Madrid">Europe/Madrid (UTC+1)</option>
                  <option value="Asia/Dubai">Asia/Dubai (UTC+4)</option>
                </select>
              </div>

              <div className="mb-3">
                <label>Moneda</label>
                <select
                  className="form-control"
                  value={settings.currency || "VES"}
                  onChange={(e) => {
                    setSettings({ ...settings, currency: e.target.value });
                    saveSetting("currency", e.target.value);
                  }}
                >
                  <option value="VES">Bolívar Venezolano (VES)</option>
                  <option value="USD">Dólar Estadounidense (USD)</option>
                  <option value="EUR">Euro (EUR)</option>
                </select>
              </div>

              <div className="mb-3">
                <label>Idioma por Defecto</label>
                <select
                  className="form-control"
                  value={settings.language || "es"}
                  onChange={(e) => {
                    setSettings({ ...settings, language: e.target.value });
                    saveSetting("language", e.target.value);
                  }}
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="ar">العربية</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="col-md-6">
          <div className="card mb-4">
            <div className="card-header">
              <h5>Seguridad</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={settings.email_verification === "true" || settings.email_verification === true}
                    onChange={(e) => {
                      const value = e.target.checked.toString();
                      setSettings({ ...settings, email_verification: value });
                      saveSetting("email_verification", value);
                    }}
                  />
                  Verificación de Email Requerida
                </label>
              </div>

              <div className="mb-3">
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={settings.twofa_enabled === "true" || settings.twofa_enabled === true}
                    onChange={(e) => {
                      const value = e.target.checked.toString();
                      setSettings({ ...settings, twofa_enabled: value });
                      saveSetting("twofa_enabled", value);
                    }}
                  />
                  2FA Habilitado Globalmente
                </label>
              </div>

              <div className="mb-3">
                <label className="form-check-label">
                  <input
                    type="checkbox"
                    className="form-check-input me-2"
                    checked={settings.maintenance_mode === "true" || settings.maintenance_mode === true}
                    onChange={(e) => {
                      const value = e.target.checked.toString();
                      setSettings({ ...settings, maintenance_mode: value });
                      saveSetting("maintenance_mode", value);
                    }}
                  />
                  Modo Mantenimiento
                </label>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h5>Mantenimiento</h5>
            </div>
            <div className="card-body">
              <button
                className="btn btn-warning me-2"
                onClick={async () => {
                  if (confirm("¿Crear backup de base de datos?")) {
                    try {
                      // This would require backend implementation
                      toast.info("Funcionalidad de backup requiere implementación backend");
                    } catch (error) {
                      toast.error("Error creando backup");
                    }
                  }
                }}
              >
                Crear Backup
              </button>

              <button
                className="btn btn-danger"
                onClick={async () => {
                  if (confirm("¿Limpiar caché del sistema?")) {
                    try {
                      localStorage.clear();
                      sessionStorage.clear();
                      toast.success("Caché limpiado");
                    } catch (error) {
                      toast.error("Error limpiando caché");
                    }
                  }
                }}
              >
                Limpiar Caché
              </button>
            </div>
          </div>
        </div>
      </div>

      {saving && (
        <div className="text-center mt-3">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Guardando...</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default SystemSettings;