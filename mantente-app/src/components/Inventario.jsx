import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { Modal, Button } from "react-bootstrap";
import jsPDF from 'jspdf';

const Inventario = () => {
  const { inventario, crearProducto, actualizarProducto, eliminarProducto, obtenerInventario, loading, user, perfilEmpresa } = useApp();

  const [nuevoProducto, setNuevoProducto] = useState({
    nombre: "",
    descripcion: "",
    precio: "",
    precio_compra: "",
    cantidad: "",
    categoria: "",
    codigo: "",
  });

  const [filtro, setFiltro] = useState("");
  const [categoriaFiltro, setCategoriaFiltro] = useState("");

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
          precio_compra: parseFloat(nuevoProducto.precio_compra) || 0,
          cantidad: parseInt(nuevoProducto.cantidad) || 0,
          categoria: nuevoProducto.categoria?.trim() || "General",
          codigo: nuevoProducto.codigo?.trim() || "",
          user_id: user.id
        };
        resultado = await actualizarProducto(editandoId, datosActualizacion);
      } else {
        const nuevoProductoLimpio = {
          nombre: nuevoProducto.nombre.trim(),
          descripcion: nuevoProducto.descripcion?.trim() || "",
          precio: parseFloat(nuevoProducto.precio),
          precio_compra: parseFloat(nuevoProducto.precio_compra) || 0,
          cantidad: parseInt(nuevoProducto.cantidad) || 0,
          categoria: nuevoProducto.categoria?.trim() || "General",
          codigo: nuevoProducto.codigo?.trim() || "",
          user_id: user.id
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
          precio_compra: "",
          cantidad: "",
          categoria: "",
          codigo: "",
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
    setNuevoProducto({
      nombre: producto.nombre || "",
      descripcion: producto.descripcion || "",
      precio: producto.precio || "",
      precio_compra: producto.precio_compra || "",
      cantidad: producto.cantidad || "",
      categoria: producto.categoria || "",
      codigo: producto.codigo || "",
      id: producto.id
    });
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
      precio_compra: "",
      cantidad: "",
      categoria: "",
      codigo: "",
    });
  };

  // Filtrar inventario
  const inventarioFiltrado = inventario.filter((p) => {
    const matchesSearch = 
      p.nombre.toLowerCase().includes(filtro.toLowerCase()) || 
      (p.codigo && p.codigo.toLowerCase().includes(filtro.toLowerCase()));
    
    const matchesCategory = categoriaFiltro === "" || p.categoria === categoriaFiltro;
    
    return matchesSearch && matchesCategory;
  });

  // Calcular valorización
  const inversionTotal = inventario.reduce((acc, p) => acc + (Number(p.precio_compra || 0) * Number(p.cantidad || 0)), 0);
  const ventaTotalPotencial = inventario.reduce((acc, p) => acc + (Number(p.precio || 0) * Number(p.cantidad || 0)), 0);
  const gananciaPotencial = ventaTotalPotencial - inversionTotal;

  // Obtener categorías únicas
  const categorias = [...new Set(inventario.map(p => p.categoria || "General"))];

  const empresa = {
    nombre: perfilEmpresa?.nombre || 'Tu Empresa',
    identificacion_fiscal: perfilEmpresa?.identificacion_fiscal || '',
    email: perfilEmpresa?.email || '',
    telefono: perfilEmpresa?.telefono || '',
    direccion: perfilEmpresa?.direccion || '',
  };

  const handleExportarPDF = async () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 50;

    // Paleta de colores de la marca
    const brand = {
      dark: [49, 50, 49],      // #313231
      brown: [102, 86, 68],    // #665644
      gold: [166, 120, 41],    // #A67829
      lightGold: [225, 180, 76] // #E1B44C
    };

    // Pre-cargar logo de la marca
    let brandLogoData = null;
    try {
      const response = await fetch('/material visual/logo.png');
      if (response.ok) {
        const blob = await response.blob();
        brandLogoData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });
      }
    } catch (err) {
      console.warn("No se pudo cargar el logo de la marca:", err);
    }

    const drawPageDecoration = () => {
      // Header: Logo Mantente
      if (brandLogoData) {
        try {
          doc.addImage(brandLogoData, 'PNG', 10, 8, 18, 18);
        } catch (e) {
          doc.setFillColor(brand.gold[0], brand.gold[1], brand.gold[2]);
          doc.rect(10, 10, 30, 12, 'F');
          doc.setFontSize(8);
          doc.setTextColor(255);
          doc.text('MANTENTE', 12, 18);
        }
      } else {
        doc.setFillColor(brand.gold[0], brand.gold[1], brand.gold[2]);
        doc.rect(10, 10, 30, 12, 'F');
        doc.setFontSize(8);
        doc.setTextColor(255);
        doc.text('MANTENTE', 12, 18);
      }
      
      // Nombre de la Empresa y Datos
      doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
      doc.setFontSize(14);
      doc.text(empresa.nombre.toUpperCase(), pageWidth - 10, 18, null, null, 'right');
      
      doc.setFontSize(8);
      doc.setTextColor(brand.brown[0], brand.brown[1], brand.brown[2]);
      let infoY = 23;
      if (empresa.identificacion_fiscal) {
        doc.text(`RIF/NIT: ${empresa.identificacion_fiscal}`, pageWidth - 10, infoY, null, null, 'right');
        infoY += 4;
      }
      if (empresa.direccion) {
        const dir = empresa.direccion.length > 50 ? empresa.direccion.substring(0, 47) + '...' : empresa.direccion;
        doc.text(dir, pageWidth - 10, infoY, null, null, 'right');
        infoY += 4;
      }

      // Footer
      doc.setDrawColor(224, 224, 224);
      doc.line(10, pageHeight - 15, pageWidth - 10, pageHeight - 15);
      
      doc.setFontSize(9);
      doc.setTextColor(brand.gold[0], brand.gold[1], brand.gold[2]);
      doc.text('"Decisiones claras, negocios rentables"', pageWidth / 2, pageHeight - 10, null, null, 'center');
      
      doc.setTextColor(150);
      doc.setFontSize(8);
      doc.text(`Página ${doc.internal.getNumberOfPages()}`, 10, pageHeight - 10);
      doc.text(`Generado: ${new Date().toLocaleDateString()}`, pageWidth - 10, pageHeight - 10, null, null, 'right');
    };

    const checkPage = (heightNeeded = 10) => {
      if (y + heightNeeded > pageHeight - 25) {
        doc.addPage();
        drawPageDecoration();
        y = 40;
        return true;
      }
      return false;
    };

    const drawSectionTitle = (title, color = brand.brown) => {
      checkPage(15);
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(10, y - 5, 5, 10, 'F');
      doc.setFontSize(14);
      doc.setTextColor(color[0], color[1], color[2]);
      doc.text(title, 20, y + 2);
      y += 12;
    };

    const drawTable = (headers, rows, startY, customWidths = null) => {
      doc.setFontSize(8.5);
      doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
      let currentX = 10;
      
      const widths = customWidths || headers.map(() => (pageWidth - 20) / headers.length);

      // Header background
      doc.setFillColor(248, 248, 248);
      doc.rect(10, startY - 5, pageWidth - 20, 7, 'F');
      doc.setDrawColor(220, 220, 220);
      doc.rect(10, startY - 5, pageWidth - 20, 7, 'S');
      
      // Header text
      doc.setTextColor(brand.brown[0], brand.brown[1], brand.brown[2]);
      headers.forEach((h, i) => {
        doc.text(h, currentX + 2, startY);
        currentX += widths[i];
      });
      
      y = startY + 7;
      
      // Table rows
      rows.forEach(row => {
        checkPage(7);
        currentX = 10;
        doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
        
        row.forEach((cell, i) => {
          let text = String(cell || '');
          const maxChars = Math.floor(widths[i] / 2); 
          if (text.length > maxChars && i < headers.length - 1) {
            text = text.substring(0, Math.max(0, maxChars - 2)) + '..';
          }
          
          doc.text(text, currentX + 2, y);
          currentX += widths[i];
        });
        
        doc.setDrawColor(245, 245, 245);
        doc.line(10, y + 1, pageWidth - 10, y + 1);
        y += 6;
      });
      y += 5;
    };

    drawPageDecoration();
    doc.setFontSize(18);
    doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
    doc.text('REPORTE DE INVENTARIO', pageWidth / 2, 40, null, null, 'center');

    // 1. Resumen de valorización
    drawSectionTitle('RESUMEN DE VALORIZACIÓN', brand.gold);
    doc.setFontSize(10);
    doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
    doc.text(`Inversión Total (Costo): $${inversionTotal.toLocaleString("es-ES")}`, 15, y);
    y += 6;
    doc.text(`Valor de Venta Potencial: $${ventaTotalPotencial.toLocaleString("es-ES")}`, 15, y);
    y += 6;
    doc.setTextColor(brand.gold[0], brand.gold[1], brand.gold[2]);
    doc.text(`Ganancia Estimada: $${gananciaPotencial.toLocaleString("es-ES")}`, 15, y);
    y += 15;

    // 2. Tabla de productos
    drawSectionTitle('LISTADO DE PRODUCTOS', brand.brown);
    const headers = ['Código', 'Nombre', 'Categoría', 'Cant.', 'Costo', 'Venta'];
    const inventarioExport = inventarioFiltrado.length > 0 ? inventarioFiltrado : inventario;
    const rows = inventarioExport.map(p => [
      p.codigo || 'N/A',
      p.nombre || '',
      p.categoria || 'General',
      p.cantidad || 0,
      `$${Number(p.precio_compra || 0).toFixed(2)}`,
      `$${Number(p.precio || 0).toFixed(2)}`
    ]);

    const inventoryWidths = [35, 60, 35, 20, 20, 20];
    drawTable(headers, rows, y, inventoryWidths);

    doc.save(`Inventario_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold m-0">📦 Gestión de Inventario</h2>
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-danger"
            onClick={handleExportarPDF}
            title="Exportar a PDF"
          >
            📄 PDF
          </button>
          <button
            className="btn btn-success"
            onClick={() => setShowModal(true)}
          >
            + Nuevo Producto
          </button>
        </div>
      </div>

      {/* Resumen de Inversión */}
      <div className="row mb-4">
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm bg-primary text-white h-100">
            <div className="card-body py-3">
              <h6 className="card-title mb-1 opacity-75">Inversión (Costo)</h6>
              <h3 className="fw-bold mb-0">${inversionTotal.toLocaleString("es-ES")}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4 mb-3 mb-md-0">
          <div className="card border-0 shadow-sm bg-success text-white h-100">
            <div className="card-body py-3">
              <h6 className="card-title mb-1 opacity-75">Valor de Venta (Potencial)</h6>
              <h3 className="fw-bold mb-0">${ventaTotalPotencial.toLocaleString("es-ES")}</h3>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card border-0 shadow-sm bg-info text-white h-100">
            <div className="card-body py-3">
              <h6 className="card-title mb-1 opacity-75">Ganancia Estimada</h6>
              <h3 className="fw-bold mb-0">${gananciaPotencial.toLocaleString("es-ES")}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros y Búsqueda */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-8">
              <div className="input-group">
                <span className="input-group-text bg-white border-end-0">
                  🔍
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Buscar por nombre o por código de barras/producto..."
                  value={filtro}
                  onChange={(e) => setFiltro(e.target.value)}
                />
              </div>
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={categoriaFiltro}
                onChange={(e) => setCategoriaFiltro(e.target.value)}
              >
                <option value="">Todas las categorías</option>
                {categorias.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
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
              <div className="col-md-4">
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
              <div className="col-md-4">
                <label htmlFor="inv-codigo" className="form-label fw-semibold">Código</label>
                <input
                  type="text"
                  name="codigo"
                  id="inv-codigo"
                  className="form-control"
                  value={nuevoProducto.codigo}
                  onChange={handleChange}
                  placeholder="Opcional"
                  autoComplete="off"
                />
              </div>
              <div className="col-md-4">
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
              <div className="col-md-4">
                <label className="form-label fw-semibold">Precio Venta ($)</label>
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
              <div className="col-md-4">
                <label className="form-label fw-semibold">Precio Compra ($)</label>
                <input
                  type="number"
                  name="precio_compra"
                  className="form-control"
                  step="0.01"
                  value={nuevoProducto.precio_compra}
                  onChange={handleChange}
                  placeholder="Opcional"
                />
              </div>
              <div className="col-md-4">
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
          ) : inventarioFiltrado.length > 0 ? (
            <div className="table-responsive" style={{ fontSize: "0.9rem" }}>
              <table className="table table-striped table-hover mb-0">
                <thead style={{ backgroundColor: "#f8f9fa", position: "sticky", top: 0 }}>
                  <tr>
                    <th style={{ minWidth: "100px" }}>Nombre/Código</th>
                    <th style={{ minWidth: "80px" }} className="d-none d-sm-table-cell">Categoría</th>
                    <th style={{ minWidth: "70px" }}>Cant.</th>
                    <th style={{ minWidth: "70px" }}>Costo</th>
                    <th style={{ minWidth: "70px" }}>Venta</th>
                    <th style={{ minWidth: "80px" }} className="d-none d-md-table-cell">Fecha</th>
                    <th style={{ minWidth: "80px" }}>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioFiltrado.map((p) => (
                    <tr key={p.id} style={{ verticalAlign: "middle" }}>
                      <td>
                        <div className="fw-semibold">{p.nombre}</div>
                        {p.codigo && <small className="text-muted">Cód: {p.codigo}</small>}
                      </td>
                      <td className="d-none d-sm-table-cell text-muted" style={{ fontSize: "0.85rem" }}>
                        {p.categoria || "General"}
                      </td>
                      <td>
                        <span className="badge bg-info">{p.cantidad || 0}</span>
                      </td>
                      <td className="text-primary fw-bold">${Number(p.precio_compra || 0).toLocaleString("es-ES")}</td>
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
