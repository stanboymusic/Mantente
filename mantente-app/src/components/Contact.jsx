import React, { useState } from "react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Aquí podrías enviar el mensaje a un servidor
    // Por ahora, mostramos un mensaje de confirmación
    console.log("Formulario enviado:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    
    // Ocultar el mensaje después de 5 segundos
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="container mt-5 mb-5">
      <h1>Contacto</h1>
      <p className="text-muted">Ponte en contacto con nosotros si tienes dudas, sugerencias o reportes.</p>

      <div className="row mt-4">
        <div className="col-md-8">
          {submitted && (
            <div className="alert alert-success alert-dismissible fade show" role="alert">
              ✓ Gracias por tu mensaje. Nos pondremos en contacto pronto.
              <button type="button" className="btn-close" onClick={() => setSubmitted(false)}></button>
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

            <button type="submit" className="btn btn-primary">Enviar Mensaje</button>
          </form>
        </div>

        <div className="col-md-4">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Información de Contacto</h5>
              <p className="card-text">
                <strong>Email:</strong><br />
                soporte@mantente.com
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