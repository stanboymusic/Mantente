import React, { useState } from "react";

const CalculadoraPrecios = () => {
  const [valores, setValores] = useState({
    costo: "",
    margen: "",
    iva: "",
  });

  const [resultado, setResultado] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // Manejar cambios
  const handleChange = (e) => {
    const { name, value } = e.target;
    setValores((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Calcular precios
  const calcularPrecio = (e) => {
    e.preventDefault();
    setMensaje(null);

    const costo = parseFloat(valores.costo) || 0;
    const margen = parseFloat(valores.margen) || 0;
    const iva = parseFloat(valores.iva) || 0;

    if (costo <= 0) {
      setMensaje({
        tipo: "error",
        texto: "Debes ingresar un costo válido mayor a 0.",
      });
      setResultado(null);
      return;
    }

    // Calcular utilidad y precio base
    const utilidad = (costo * margen) / 100;
    const precioBase = costo + utilidad;

    // Calcular IVA y precio final
    const montoIVA = (precioBase * iva) / 100;
    const precioFinal = precioBase + montoIVA;

    setResultado({
      utilidad,
      precioBase,
      montoIVA,
      precioFinal,
    });

    setMensaje({
      tipo: "exito",
      texto: "Cálculo realizado correctamente.",
    });
  };

  // Función segura para formatear valores numéricos
  const formatoMoneda = (num) =>
    isNaN(num) || num === null
      ? "$0.00"
      : `$${num.toLocaleString("es-ES", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

  return (
    <div className="container py-4">
      <h2 className="text-center fw-bold mb-4">🧮 Calculadora de Precios</h2>

      <div className="card shadow-sm mx-auto" style={{ maxWidth: "600px" }}>
        <div className="card-body">
          <form onSubmit={calcularPrecio}>
            <div className="mb-3">
              <label className="form-label fw-semibold">Costo del producto ($)</label>
              <input
                type="number"
                name="costo"
                className="form-control"
                value={valores.costo}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Margen de ganancia (%)</label>
              <input
                type="number"
                name="margen"
                className="form-control"
                value={valores.margen}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">IVA (%)</label>
              <input
                type="number"
                name="iva"
                className="form-control"
                value={valores.iva}
                onChange={handleChange}
                step="0.01"
                min="0"
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

            <div className="text-center">
              <button type="submit" className="btn btn-primary px-5 fw-semibold">
                Calcular
              </button>
            </div>
          </form>
        </div>
      </div>

      {resultado && (
        <div className="card shadow-sm mt-4 mx-auto" style={{ maxWidth: "600px" }}>
          <div className="card-body">
            <h5 className="card-title text-center mb-3">💰 Resultados del Cálculo</h5>
            <ul className="list-group">
              <li className="list-group-item d-flex justify-content-between">
                <strong>Utilidad:</strong> <span>{formatoMoneda(resultado.utilidad)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <strong>Precio base:</strong> <span>{formatoMoneda(resultado.precioBase)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <strong>IVA:</strong> <span>{formatoMoneda(resultado.montoIVA)}</span>
              </li>
              <li className="list-group-item d-flex justify-content-between">
                <strong>Precio final sugerido:</strong>{" "}
                <span className="fw-bold text-success">
                  {formatoMoneda(resultado.precioFinal)}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CalculadoraPrecios;
