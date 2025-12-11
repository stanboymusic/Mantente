import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "../pocketbase";
import AuthNavbar from "./AuthNavbar";
import ForgotPassword from "./ForgotPassword";

const Login = () => {
  const navigate = useNavigate();

  const [modoRegistro, setModoRegistro] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
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
        await pb.collection("users").create({
          email,
          password,
          passwordConfirm: password,
        });
        setMensaje({
          tipo: "exito",
          texto: "Cuenta creada exitosamente. Iniciando sesión...",
        });
        
        await pb.collection("users").authWithPassword(email, password);
        setTimeout(() => navigate("/"), 1200);
      } else {
        await pb.collection("users").authWithPassword(email, password);
        setMensaje({
          tipo: "exito",
          texto: "Inicio de sesión exitoso. Redirigiendo...",
        });
        setTimeout(() => navigate("/"), 1200);
      }
    } catch (err) {
      console.error("Error en autenticación:", err.message);
      setMensaje({ tipo: "error", texto: err.message });
    }

    setCargando(false);
  };

  if (showForgotPassword) {
    return <ForgotPassword onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <>
      <AuthNavbar />
      <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#f8f9fa" }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%", border: "2px solid var(--mantente-gold)" }}>
        <div className="text-center mb-4">
          <img 
            src="/material visual/logo.png" 
            alt="Mantente Logo" 
            style={{ height: "80px", width: "auto" }} 
            className="mb-3" 
          />
          <p style={{ color: 'var(--mantente-gold)', fontStyle: 'italic', fontSize: '1rem', fontWeight: '500' }}>
            "Decisiones claras, negocios rentables"
          </p>
        </div>
        <h3 className="text-center fw-bold mb-4">
          {modoRegistro ? "Crear Cuenta" : "Iniciar Sesión"}
        </h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="login-email" className="form-label fw-semibold">Correo electrónico</label>
            <input
              type="email"
              name="email"
              id="login-email"
              className="form-control"
              placeholder="ejemplo@correo.com"
              value={formData.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="login-password" className="form-label fw-semibold">Contraseña</label>
            <input
              type="password"
              name="password"
              id="login-password"
              className="form-control"
              placeholder="********"
              value={formData.password}
              onChange={handleChange}
              required
              autoComplete="current-password"
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

        {!modoRegistro && (
          <div className="text-center mb-3">
            <button
              className="btn btn-link p-0"
              onClick={() => setShowForgotPassword(true)}
            >
              ¿Olvidaste la contraseña?
            </button>
          </div>
        )}

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
    </>
  );
};

export default Login;
