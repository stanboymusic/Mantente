import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Modal, Button } from "react-bootstrap";

const Inventario = () => {
  const { inventario, crearProducto, actualizarProducto, eliminarProducto, obtenerInventario, loading, user } = useApp();

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

  useEffect(() => {
    if (!user?.id) return;

    obtenerInventario();
    
    const autoRefreshInterval = setInterval(() => {
      obtenerInventario();
    }, 15000);

    return () => clearInterval(autoRefreshInterval);
  }, [user?.id]);

  useEffect(() => {
    if (inventario.length > 0) {
      setMensaje(null);
    }
  }, [inventario]);

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

    // Validaciones más estrictas
    if (!nuevoProducto.nombre?.trim()) {
      setMensaje({ tipo: "error", texto: "El nombre del producto es obligatorio." });
      setEnviando(false);
      return;
    }

    if (!nuevoProducto.precio || parseFloat(nuevoProducto.precio) <= 0) {
      setMensaje({ tipo: "error", texto: "El precio debe ser mayor a 0." });
      setEnviando(false);
      return;
    }

    try {
      let resultado;
      if (editandoId) {
        // Filtrar solo los campos que cambiaron
        const datosActualizacion = {
          nombre: nuevoProducto.nombre.trim(),
          descripcion: nuevoProducto.descripcion?.trim() || "",
          precio: parseFloat(nuevoProducto.precio),
          cantidad: parseInt(nuevoProducto.cantidad) || 0,
          categoria: nuevoProducto.categoria?.trim() || "General",
        };
        resultado = await actualizarProducto(editandoId, datosActualizacion);
      } else {
        const nuevoProductoLimpio = {
          nombre: nuevoProducto.nombre.trim(),
          descripcion: nuevoProducto.descripcion?.trim() || "",
          precio: parseFloat(nuevoProducto.precio),
          cantidad: parseInt(nuevoProducto.cantidad) || 0,
          categoria: nuevoProducto.categoria?.trim() || "General",
        };
        resultado = await crearProducto(nuevoProductoLimpio);
      }

      const { success, message } = resultado;

      if (success) {
        setMensaje({ tipo: "exito", texto: message });
        
        // Limpiar el formulario inmediatamente
        setNuevoProducto({
          nombre: "",
          descripcion: "",
          precio: "",
          cantidad: "",
          categoria: "",
        });
        setEditandoId(null);
        
        // Cerrar modal después de mostrar el mensaje
        setTimeout(() => {
          setShowModal(false);
        }, 500);
        
        // Recargar inventario con mayor espera en móvil
        setTimeout(async () => {
          await obtenerInventario();
        }, 1000);
      } else {
        setMensaje({ tipo: "error", texto: message || "Error desconocido al guardar el producto." });
      }
    } catch (error) {
      console.error("Error en handleSubmit:", error);
      setMensaje({ tipo: "error", texto: "Error inesperado: " + error.message });
    } finally {
      setEnviando(false);
    }
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
      <Modal
        show={showModal}
        onHide={handleCerrarModal}
        size="lg"
        centered
        backdrop="static"
        className="inventory-modal elegant-modal"
        style={{
          maxHeight: "100vh",
          overflowY: "auto"
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">
            <span className="elegant-icon">{editandoId ? "✏️" : "➕"}</span> {editandoId ? "Editar Producto" : "Agregar Nuevo Producto"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
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
                {enviando ? "Guardando..." : <><span className="elegant-icon">{editandoId ? "✏️" : "➕"}</span> {editandoId ? "Actualizar" : "Agregar"}</>}
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
            <div className="table-responsive" style={{ fontSize: "0.9rem" }}>
              <table className="table table-striped table-hover mb-0">
                <thead style={{ backgroundColor: "#f8f9fa", position: "sticky", top: 0 }}>
                  <tr>
                    <th style={{ minWidth: "100px" }}>Nombre</th>
                    <th style={{ minWidth: "80px" }} className="d-none d-sm-table-cell">Categoría</th>
                    <th style={{ minWidth: "70px" }}>Cant.</th>
                    <th style={{ minWidth: "70px" }}>Precio</th>
                    <th style={{ minWidth: "80px" }} className="d-none d-md-table-cell">Fecha</th>
                    <th style={{ minWidth: "80px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map((p) => (
                    <tr key={p.id} style={{ verticalAlign: "middle" }}>
                      <td className="fw-semibold">{p.nombre}</td>
                      <td className="d-none d-sm-table-cell text-muted" style={{ fontSize: "0.85rem" }}>
                        {p.categoria || "General"}
                      </td>
                      <td>
                        <span className="badge bg-info">{p.cantidad || 0}</span>
                      </td>
                      <td className="text-success fw-bold">${Number(p.precio || 0).toLocaleString("es-ES")}</td>
                      <td className="d-none d-md-table-cell" style={{ fontSize: "0.85rem" }}>
                        {p.fecha_agregado
                          ? new Date(p.fecha_agregado).toLocaleDateString("es-ES")
                          : "—"}
                      </td>
                      <td>
                        <div className="d-flex gap-1">
                          <Button
                            variant="outline-warning"
                            size="sm"
                            className="p-1"
                            onClick={() => handleEditar(p)}
                            title="Editar"
                            style={{ minWidth: "32px" }}
                          >
                            ✏️
                          </Button>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="p-1"
                            onClick={() => handleEliminar(p.id)}
                            title="Eliminar"
                            style={{ minWidth: "32px" }}
                          >
                            🗑️
                          </Button>
                        </div>
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
