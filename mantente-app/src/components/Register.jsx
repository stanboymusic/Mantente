import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { pb } from "../pocketbase";
import AuthNavbar from "./AuthNavbar";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await pb.collection("users").create({
        email: form.email,
        password: form.password,
        passwordConfirm: form.password,
      });

      alert("✅ Registro exitoso. Redirigiendo al login...");
      navigate("/login");
    } catch (err) {
      console.error("Error al registrar usuario:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthNavbar />
      <div className="d-flex justify-content-center align-items-center min-vh-100" style={{ background: "#f8f9fa" }}>
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
        <h2 className="text-center fw-bold mb-4">Crear Cuenta</h2>

        {error && (
          <div className="alert alert-danger text-center" role="alert">
            {error}
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="mb-3">
            <label htmlFor="register-email" className="form-label fw-semibold">Correo electrónico</label>
            <input
              type="email"
              name="email"
              id="register-email"
              value={form.email}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="ejemplo@correo.com"
              autoComplete="email"
            />
          </div>

          <div className="mb-3">
            <label htmlFor="register-password" className="form-label fw-semibold">Contraseña</label>
            <input
              type="password"
              name="password"
              id="register-password"
              value={form.password}
              onChange={handleChange}
              required
              className="form-control"
              placeholder="••••••••"
              autoComplete="new-password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-100 fw-semibold"
          >
            {loading ? "Creando cuenta..." : "Registrarme"}
          </button>
        </form>

        <hr className="my-3" />

        <p className="text-center mb-0">
          ¿Ya tienes una cuenta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="btn btn-link btn-sm p-0"
            style={{ textDecoration: "none" }}
          >
            Inicia sesión
          </button>
        </p>
      </div>
      </div>
    </>
  );
};

export default Register;
