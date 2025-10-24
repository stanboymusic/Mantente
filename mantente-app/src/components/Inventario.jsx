import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Modal, Button } from "react-bootstrap";

const Inventario = () => {
  const { inventario, crearProducto, actualizarProducto, eliminarProducto, obtenerInventario, loading } = useApp();

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    cantidad: "",
    categoria: "",
  });

  const [mensaje, setMensaje] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [showModal, setShowModal] = useState(false);

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

    let resultado;
    if (editandoId) {
      resultado = await actualizarProducto(editandoId, nuevoProducto);
    } else {
      resultado = await crearProducto(nuevoProducto);
    }

    const { success, message } = resultado;

    if (success) {
      setMensaje({ tipo: "exito", texto: message });
      setNuevoProducto({
        nombre: "",
        descripcion: "",
        precio: "",
        cantidad: "",
        categoria: "",
      });
      setEditandoId(null);
      setShowModal(false);
      await obtenerInventario();
    } else {
      setMensaje({ tipo: "error", texto: message });
    }

    setEnviando(false);
  };

  const handleEditar = (producto) => {
    setNuevoProducto(producto);
    setEditandoId(producto.id);
    setShowModal(true);
  };

  const handleEliminar = async (id) => {
    if (window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      const { success, message } = await eliminarProducto(id);
      if (success) {
        setMensaje({ tipo: "exito", texto: message });
        await obtenerInventario();
      } else {
        setMensaje({ tipo: "error", texto: message });
      }
    }
  };

  const handleCerrarModal = () => {
    setShowModal(false);
    setEditandoId(null);
    setNuevoProducto({
      nombre: "",
      descripcion: "",
      precio: "",
      cantidad: "",
      categoria: "",
    });
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">📦 Gestión de Inventario</h2>
        <button
          className="btn btn-success"
          onClick={() => setShowModal(true)}
        >
          + Nuevo Producto
        </button>
      </div>

      {/* Modal para agregar/editar producto */}
      <Modal show={showModal} onHide={handleCerrarModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editandoId ? "✏️ Editar Producto" : "➕ Agregar Nuevo Producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="row mb-3">
              <div className="col-md-6">
                <label htmlFor="inv-nombre" className="form-label fw-semibold">Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  id="inv-nombre"
                  className="form-control"
                  value={nuevoProducto.nombre}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                />
              </div>
              <div className="col-md-6">
                <label htmlFor="inv-categoria" className="form-label fw-semibold">Categoría</label>
                <input
                  type="text"
                  name="categoria"
                  id="inv-categoria"
                  className="form-control"
                  value={nuevoProducto.categoria}
                  onChange={handleChange}
                  placeholder="Opcional"
                  autoComplete="off"
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
            <div className="d-flex gap-2">
              <button
                type="submit"
                className="btn btn-success flex-grow-1"
                disabled={enviando}
              >
                {enviando ? "Guardando..." : editandoId ? "✏️ Actualizar" : "➕ Agregar"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCerrarModal}
              >
                Cancelar
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

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
                    <th>Acciones</th>
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
                      <td>
                        <Button
                          variant="outline-warning"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditar(p)}
                        >
                          ✏️
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleEliminar(p.id)}
                        >
                          🗑️
                        </Button>
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
