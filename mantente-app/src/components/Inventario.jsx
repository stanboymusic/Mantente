import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";

const Inventario = () => {
  const { inventario, crearProducto, obtenerInventario, loading } = useApp();

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoria: "",
  });

  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);

  // Cargar inventario al montar el componente
  useEffect(() => {
    obtenerInventario();
  }, []);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProducto((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setMensaje(null);

    if (!nuevoProducto.nombre || !nuevoProducto.precio) {
      setMensaje({ tipo: "error", texto: "El nombre y precio son obligatorios." });
      setEnviando(false);
      return;
    }

    const { success, message } = await crearProducto(nuevoProducto);

    if (success) {
      setMensaje({ tipo: "exito", texto: message });
      setNuevoProducto({
        nombre: "",
        descripcion: "",
        precio: "",
        cantidad: "",
        categoria: "",
      });
      await obtenerInventario();
    } else {
      setMensaje({ tipo: "error", texto: message });
    }

    setEnviando(false);
  };

  return (
    <div className="container py-4">
      <h2 className="text-center fw-bold mb-4">📦 Gestión de Inventario</h2>

      {/* Formulario para agregar producto */}
      <div className="card shadow-sm mb-4 mx-auto" style={{ maxWidth: "700px" }}>
        <div className="card-body">
          <h5 className="card-title text-center mb-3">➕ Agregar Nuevo Producto</h5>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  className="form-control"
                  value={nuevoProducto.nombre}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Categoría</label>
                <input
                  type="text"
                  name="categoria"
                  className="form-control"
                  value={nuevoProducto.categoria}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Precio ($)</label>
                <input
                  type="number"
                  name="precio"
                  className="form-control"
                  step="0.01"
                  value={nuevoProducto.precio}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label fw-semibold">Cantidad</label>
                <input
                  type="number"
                  name="cantidad"
                  className="form-control"
                  min="0"
                  value={nuevoProducto.cantidad}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Descripción</label>
              <textarea
                name="descripcion"
                className="form-control"
                rows="2"
                value={nuevoProducto.descripcion}
                onChange={handleChange}
                placeholder="Opcional"
              />
            </div>

            {/* Mensaje */}
            {mensaje && (
              <div
                className={`alert ${
                  mensaje.tipo === "exito" ? "alert-success" : "alert-danger"
                }`}
              >
                {mensaje.texto}
              </div>
            )}

            {/* Botón */}
            <div className="text-center">
              <button
                type="submit"
                className="btn btn-success px-5 fw-semibold"
                disabled={enviando}
              >
                {enviando ? "Guardando..." : "Agregar Producto"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Tabla de productos */}
      <div className="card shadow-sm">
        <div className="card-body">
          <h5 className="card-title text-center mb-3">📋 Lista de Productos</h5>
          {loading ? (
            <p className="text-center">Cargando inventario...</p>
          ) : inventario.length > 0 ? (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Cantidad</th>
                    <th>Precio</th>
                    <th>Fecha Agregado</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map((p) => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>{p.categoria || "General"}</td>
                      <td>{p.cantidad || 0}</td>
                      <td>${Number(p.precio || 0).toLocaleString("es-ES")}</td>
                      <td>
                        {p.fecha_agregado
                          ? new Date(p.fecha_agregado).toLocaleDateString("es-ES")
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-center text-muted">
              No hay productos registrados en el inventario.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventario;
