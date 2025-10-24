import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Inicializar EmailJS
  useEffect(() => {
    // Reemplaza con tu Public Key de EmailJS
    emailjs.init("8EhCmrJV31v0aWiAq"); // Se puede obtener de https://dashboard.emailjs.com/
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Preparar el mensaje con todos los datos del usuario
      const messageWithDetails = `
Mensaje de: ${formData.name}
Email: ${formData.email}
Asunto: ${formData.subject}

Mensaje:
${formData.message}

---
Este mensaje fue enviado desde el formulario de contacto de Mantente App.
      `;

      // Enviar email usando EmailJS
      const response = await emailjs.send(
        "service_w43cj1f", // Service ID
        "template_h8ltrwm", // Template ID
        {
          to_name: "Soporte Mantente",
          to_email: "mantenteapp@gmail.com", // Destinatario: correo de la app
          from_name: "Formulario de Contacto Mantente",
          from_email: "no-reply@mantente.com", // Usar un correo fijo de la aplicación
          subject: `Nuevo contacto: ${formData.subject}`,
          message: messageWithDetails,
          reply_to: formData.email, // Para responder al usuario
          user_email: formData.email, // Guardar el email del usuario
          user_name: formData.name, // Guardar el nombre del usuario
        }
      );

      if (response.status === 200) {
        console.log("✅ Mensaje enviado exitosamente:", response);
        setSubmitted(true);
        setFormData({ name: "", email: "", subject: "", message: "" });

        // Ocultar el mensaje después de 5 segundos
        setTimeout(() => setSubmitted(false), 5000);
      }
    } catch (err) {
      console.error("❌ Error al enviar mensaje:", err);
      setError("Error al enviar el mensaje. Por favor, intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mt-5 mb-5">
      <h1>Contacto</h1>
      <p className="text-muted">Ponte en contacto con nosotros si tienes dudas, sugerencias o reportes.</p>

      <div className="row mt-4">
        <div className="col-md-8">
          {submitted && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              ✅ Gracias por tu mensaje. Nos pondremos en contacto pronto.
              <button type="button" className="btn-close" onClick={() => setSubmitted(false)}></button>
            </div>
          )}
          
          {error && (
            <div className="alert alert-danger alert-dismissible fade show" role="alert">
              ❌ {error}
              <button type="button" className="btn-close" onClick={() => setError(null)}></button>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="name" className="form-label">Nombre</label>
              <input
                type="text"
                className="form-control"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="email" className="form-label">Correo Electrónico</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="subject" className="form-label">Asunto</label>
              <input
                type="text"
                className="form-control"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="message" className="form-label">Mensaje</label>
              <textarea
                className="form-control"
                id="message"
                name="message"
                rows="5"
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "📤 Enviando..." : "✉️ Enviar Mensaje"}
            </button>
          </form>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Información de Contacto</h5>
              <p className="card-text">
                <strong>Email:</strong><br />
                mantenteapp@gmail.com
                <p className="card-text"></p>
                 <strong>Telefono:</strong><br />
                +58 04141773879 

              </p>
              <p className="card-text">
                <strong>Ubicación:</strong><br />
                Disponible en línea 24/7
              </p>
              <hr />
              <p className="card-text text-muted small">
                Responderemos tus mensajes lo antes posible.
              </p>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-body">
              <h5 className="card-title">Enlaces Útiles</h5>
              <ul className="list-unstyled">
                <li><a href="/privacy">Política de Privacidad</a></li>
                <li><a href="/cookies">Política de Cookies</a></li>
                <li><a href="/">Inicio</a></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;