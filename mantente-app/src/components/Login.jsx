import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const Login = () => {
  const navigate = useNavigate();

  const [modoRegistro, setModoRegistro] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    const { email, password } = formData;
    if (!email || !password) {
      setMensaje({ tipo: "error", texto: "Por favor, completa todos los campos." });
      setCargando(false);
      return;
    }

    try {
      if (modoRegistro) {
        // 🔹 Crear usuario nuevo
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        setMensaje({
          tipo: "exito",
          texto: "Cuenta creada exitosamente. Revisa tu correo para confirmar.",
        });
      } else {
        // 🔹 Iniciar sesión
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        setMensaje({
          tipo: "exito",
          texto: "Inicio de sesión exitoso. Redirigiendo...",
        });

        // Esperar un poco y redirigir
        setTimeout(() => navigate("/"), 1200);
      }
    } catch (err) {
      console.error("Error en autenticación:", err.message);
      setMensaje({ tipo: "error", texto: err.message });
    }

    setCargando(false);
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100">
      <div className="card shadow-sm p-4" style={{ maxWidth: "400px", width: "100%" }}>
        <h3 className="text-center fw-bold mb-4">
          {modoRegistro ? "Crear Cuenta" : "Iniciar Sesión"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Correo electrónico</label>
            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Contraseña</label>
            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>

          {mensaje && (
            <div
              className={`alert ${
                mensaje.tipo === "exito" ? "alert-success" : "alert-danger"
              }`}
            >
              {mensaje.texto}
            </div>
          )}

          <div className="d-grid">
            <button
              type="submit"
              className="btn btn-primary fw-semibold"
              disabled={cargando}
            >
              {cargando
                ? "Procesando..."
                : modoRegistro
                ? "Crear Cuenta"
                : "Iniciar Sesión"}
            </button>
          </div>
        </form>

        <hr className="my-4" />

        <div className="text-center">
          {modoRegistro ? (
            <>
              <p>¿Ya tienes una cuenta?</p>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setModoRegistro(false)}
              >
                Iniciar sesión
              </button>
            </>
          ) : (
            <>
              <p>¿No tienes una cuenta?</p>
              <button
                className="btn btn-outline-primary btn-sm"
                onClick={() => setModoRegistro(true)}
              >
                Crear cuenta
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
