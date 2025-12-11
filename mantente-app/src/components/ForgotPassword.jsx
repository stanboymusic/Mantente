import React, { useState } from "react";
import { pb } from "../pocketbase";

const ForgotPassword = ({ onBack }) => {
  const [email, setEmail] = useState("");
  const [mensaje, setMensaje] = useState(null);
  const [cargando, setCargando] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCargando(true);
    setMensaje(null);

    try {
      await pb.collection("users").requestPasswordReset(email);
      setMensaje({
        tipo: "exito",
        texto: "Se ha enviado un enlace de restablecimiento a tu correo electrónico.",
      });
    } catch (err) {
      console.error("Error solicitando reset:", err.message);
      setMensaje({ tipo: "error", texto: err.message });
    }

    setCargando(false);
  };

  return (
    <div className="container py-5 d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#f8f9fa" }}>
      <div className="card shadow-lg p-4" style={{ maxWidth: "400px", width: "100%", border: "2px solid var(--mantente-gold)" }}>
        <div className="text-center mb-4">
          <img
            src="/material visual/logo.png"
            alt="Mantente Logo"
            style={{ height: "80px", width: "auto" }}
            className="mb-3"
          />
          <h3 className="text-center fw-bold mb-4">Restablecer Contraseña</h3>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="reset-email" className="form-label fw-semibold">Correo electrónico</label>
            <input
              type="email"
              name="email"
              id="reset-email"
              className="form-control"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {mensaje && (
            <div className={`alert ${mensaje.tipo === "exito" ? "alert-success" : "alert-danger"}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="d-grid mb-3">
            <button type="submit" className="btn btn-primary fw-semibold" disabled={cargando}>
              {cargando ? "Enviando..." : "Enviar Enlace de Restablecimiento"}
            </button>
          </div>
        </form>

        <div className="text-center">
          <button className="btn btn-outline-primary btn-sm" onClick={onBack}>
            Volver al Inicio de Sesión
          </button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;