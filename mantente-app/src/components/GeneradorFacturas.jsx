import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import {
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Table,
  Modal,
} from "react-bootstrap";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const GeneradorFacturas = () => {
  const {
    facturas,
    clientes,
    ventas,
    crearFactura,
    actualizarFactura,
    perfilEmpresa,
  } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [showEstadoModal, setShowEstadoModal] = useState(false);
  const [facturaEditando, setFacturaEditando] = useState(null);
  const [alerta, setAlerta] = useState(null);
  const [formData, setFormData] = useState({
    numero_factura: "",
    cliente_id: "",
    venta_id: "",
    subtotal: 0,
    descuento: 0,
    impuesto: 0,
    metodo_pago: "Efectivo",
  });
  const [estadoFormData, setEstadoFormData] = useState({
    estado: "pendiente",
    fecha_pago: "",
  });

  // Generar número de factura automático
  useEffect(() => {
    const maxNumero = facturas.length > 0
      ? Math.max(...facturas.map((f) => {
          const match = f.numero_factura.match(/\d+/);
          return parseInt(match?.[0]) || 0;
        }))
      : 0;
    const nuevoNumero = String(maxNumero + 1).padStart(6, "0");
    const timestamp = Date.now().toString().slice(-3); // Últimos 3 dígitos del timestamp
    setFormData((prev) => ({
      ...prev,
      numero_factura: `FAC-${nuevoNumero}-${timestamp}`,
    }));
  }, [facturas]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const calcularTotal = () => {
    const subtotal = parseFloat(formData.subtotal) || 0;
    const descuento = parseFloat(formData.descuento) || 0;
    const impuesto = parseFloat(formData.impuesto) || 0;
    return subtotal - descuento + impuesto;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const clienteSeleccionado = clientes.find(
      (c) => c.id === formData.cliente_id
    );
    if (!clienteSeleccionado) {
      setAlerta({ type: "danger", message: "❌ Debes seleccionar un cliente" });
      return;
    }

    const resultado = await crearFactura({
      numero_factura: formData.numero_factura,
      cliente_id: formData.cliente_id,
      venta_id: formData.venta_id || null,
      subtotal: parseFloat(formData.subtotal) || 0,
      descuento: parseFloat(formData.descuento) || 0,
      impuesto: parseFloat(formData.impuesto) || 0,
      total: calcularTotal(),
      metodo_pago: formData.metodo_pago,
    });

    if (resultado.success) {
      setAlerta({
        type: "success",
        message: "✅ Factura creada exitosamente",
      });
      setShowModal(false);
      setFormData({
        numero_factura: "",
        cliente_id: "",
        venta_id: "",
        subtotal: 0,
        descuento: 0,
        impuesto: 0,
        metodo_pago: "Efectivo",
      });
    } else {
      setAlerta({
        type: "danger",
        message: "❌ " + resultado.message,
      });
    }
  };

  const descargarPDF = async (factura) => {
    try {
      setAlerta({
        type: "info",
        message: "📄 Generando PDF...",
      });

      const element = document.getElementById(`factura-${factura.id}`);
      if (!element) {
        setAlerta({
          type: "danger",
          message: "❌ No se pudo encontrar la factura para generar PDF",
        });
        return;
      }

      // Cambiar display a visible temporalmente para capturar
      const originalDisplay = element.style.display;
      element.style.display = "block";
      element.style.position = "fixed";
      element.style.top = "-9999px";

      // Convertir el elemento a imagen con mejor configuración
      const canvas = await html2canvas(element, { 
        scale: 2, 
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: "#ffffff",
        windowWidth: 800,
        windowHeight: 1000,
      });
      
      // Restaurar el display original
      element.style.display = originalDisplay;
      
      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("El canvas generado está vacío");
      }

      const imgData = canvas.toDataURL("image/png");
      
      if (!imgData || imgData.length < 100) {
        throw new Error("La imagen del PDF no se generó correctamente");
      }
      
      // Crear PDF con dimensiones A4 en mm
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210; // Ancho A4 en mm
      const pageHeight = 297; // Alto A4 en mm
      
      // Calcular altura de la imagen en mm
      const imgHeight = (canvas.height * pageWidth) / canvas.width;
      
      if (imgHeight <= pageHeight) {
        // Una sola página
        pdf.addImage(imgData, "PNG", 0, 0, pageWidth, imgHeight);
      } else {
        // Múltiples páginas
        let yPosition = 0;
        let remainingHeight = imgHeight;

        while (remainingHeight > 0) {
          if (yPosition > 0) {
            pdf.addPage();
          }
          
          // Calcular qué parte de la imagen va en esta página
          const heightToAdd = Math.min(pageHeight, remainingHeight);
          pdf.addImage(
            imgData, 
            "PNG", 
            0, 
            -yPosition, 
            pageWidth, 
            imgHeight
          );
          
          yPosition += pageHeight;
          remainingHeight -= pageHeight;
        }
      }

      // Generar nombre de archivo válido
      const nombreArchivo = `Factura_${factura.numero_factura.replace(/[^a-zA-Z0-9-]/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`;
      pdf.save(nombreArchivo);
      
      setAlerta({
        type: "success",
        message: "✅ PDF descargado exitosamente",
      });
    } catch (error) {
      console.error("Error al generar PDF:", error);
      setAlerta({
        type: "danger",
        message: "❌ Error al descargar PDF: " + error.message,
      });
    }
  };

  const handleCambiarEstado = (factura) => {
    setFacturaEditando(factura);
    setEstadoFormData({
      estado: factura.estado || "pendiente",
      fecha_pago: factura.fecha_pago || "",
    });
    setShowEstadoModal(true);
  };

  const handleGuardarEstado = async (e) => {
    e.preventDefault();
    const resultado = await actualizarFactura(facturaEditando.id, {
      estado: estadoFormData.estado,
      metodo_pago: facturaEditando.metodo_pago,
      notas: facturaEditando.notas,
      fecha_pago: estadoFormData.estado === "pagada" ? estadoFormData.fecha_pago : null,
    });

    if (resultado.success) {
      setAlerta({
        type: "success",
        message: "✅ Estado de factura actualizado",
      });
      setShowEstadoModal(false);
    } else {
      setAlerta({
        type: "danger",
        message: "❌ " + resultado.message,
      });
    }
  };

  return (
    <div className="container mt-4">
      {alerta && (
        <Alert variant={alerta.type} onClose={() => setAlerta(null)} dismissible>
          {alerta.message}
        </Alert>
      )}

      <Card className="shadow-lg border-0 mb-4">
        <Card.Header className="bg-success text-white fw-bold d-flex justify-content-between align-items-center">
          <span>📄 Generador de Facturas</span>
          <Button
            variant="light"
            size="sm"
            onClick={() => setShowModal(true)}
          >
            + Nueva Factura
          </Button>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-light">
                <tr>
                  <th>Número</th>
                  <th>Cliente</th>
                  <th>Subtotal</th>
                  <th>Descuento</th>
                  <th>Impuesto</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {facturas.length > 0 ? (
                  facturas.map((factura) => (
                    <tr key={factura.id}>
                      <td>{factura.numero_factura}</td>
                      <td>
                        {clientes.find((c) => c.id === factura.cliente_id)
                          ?.nombre || "Cliente desconocido"}
                      </td>
                      <td>${factura.subtotal.toFixed(2)}</td>
                      <td>${factura.descuento.toFixed(2)}</td>
                      <td>${factura.impuesto.toFixed(2)}</td>
                      <td className="fw-bold">${factura.total.toFixed(2)}</td>
                      <td>
                        <span
                          className={`badge bg-${
                            factura.estado === "pagada"
                              ? "success"
                              : "warning"
                          }`}
                        >
                          {factura.estado}
                        </span>
                      </td>
                      <td>
                        <Button
                          variant="outline-info"
                          size="sm"
                          className="me-2"
                          onClick={() => handleCambiarEstado(factura)}
                        >
                          🔄 Estado
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => descargarPDF(factura)}
                        >
                          📥 PDF
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center text-muted">
                      No hay facturas registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Crear Nueva Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Número de Factura</Form.Label>
                  <Form.Control
                    type="text"
                    name="numero_factura"
                    value={formData.numero_factura}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Cliente *</Form.Label>
                  <Form.Select
                    name="cliente_id"
                    value={formData.cliente_id}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Selecciona un cliente --</option>
                    {clientes.map((cliente) => (
                      <option key={cliente.id} value={cliente.id}>
                        {cliente.nombre} ({cliente.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Venta (Opcional)</Form.Label>
                  <Form.Select
                    name="venta_id"
                    value={formData.venta_id}
                    onChange={handleChange}
                  >
                    <option value="">-- Sin venta asociada --</option>
                    {ventas.map((venta) => (
                      <option key={venta.id} value={venta.id}>
                        {venta.producto} - ${venta.monto}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Método de Pago</Form.Label>
                  <Form.Select
                    name="metodo_pago"
                    value={formData.metodo_pago}
                    onChange={handleChange}
                  >
                    <option>Efectivo</option>
                    <option>Tarjeta</option>
                    <option>Transferencia</option>
                    <option>Cheque</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Subtotal *</Form.Label>
                  <Form.Control
                    type="number"
                    name="subtotal"
                    value={formData.subtotal}
                    onChange={handleChange}
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Descuento</Form.Label>
                  <Form.Control
                    type="number"
                    name="descuento"
                    value={formData.descuento}
                    onChange={handleChange}
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Impuesto</Form.Label>
                  <Form.Control
                    type="number"
                    name="impuesto"
                    value={formData.impuesto}
                    onChange={handleChange}
                    step="0.01"
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Total</Form.Label>
                  <Form.Control
                    type="number"
                    value={calcularTotal().toFixed(2)}
                    readOnly
                    className="bg-light fw-bold"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Button variant="primary" type="submit" className="w-100">
              Crear Factura
            </Button>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Modal para cambiar estado de factura */}
      <Modal show={showEstadoModal} onHide={() => setShowEstadoModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Cambiar Estado de Factura</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleGuardarEstado}>
            <Form.Group className="mb-3">
              <Form.Label>Estado *</Form.Label>
              <Form.Select
                name="estado"
                value={estadoFormData.estado}
                onChange={(e) => setEstadoFormData({
                  ...estadoFormData,
                  estado: e.target.value
                })}
                required
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagada">Pagada</option>
              </Form.Select>
            </Form.Group>

            {estadoFormData.estado === "pagada" && (
              <Form.Group className="mb-3">
                <Form.Label>Fecha de Pago *</Form.Label>
                <Form.Control
                  type="date"
                  value={estadoFormData.fecha_pago}
                  onChange={(e) => setEstadoFormData({
                    ...estadoFormData,
                    fecha_pago: e.target.value
                  })}
                  required
                />
              </Form.Group>
            )}

            <div className="d-flex gap-2">
              <Button variant="secondary" onClick={() => setShowEstadoModal(false)}>
                Cancelar
              </Button>
              <Button variant="primary" type="submit">
                Guardar Cambios
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>

      {/* Templates para PDF */}
      {facturas.map((factura) => (
        <div key={factura.id} id={`factura-${factura.id}`} style={{ display: "none" }}>
          <FacturaTemplate factura={factura} cliente={clientes.find(c => c.id === factura.cliente_id)} perfilEmpresa={perfilEmpresa} />
        </div>
      ))}
    </div>
  );
};

const FacturaTemplate = ({ factura, cliente, perfilEmpresa }) => {
  return (
    <div style={{ 
      padding: "40px", 
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#ffffff",
      width: "800px",
      margin: "0 auto"
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "40px", borderBottom: "2px solid #333", paddingBottom: "20px" }}>
        {perfilEmpresa?.logo_url && (
          <img
            src={perfilEmpresa.logo_url}
            alt="Logo"
            style={{ maxHeight: "60px", marginBottom: "15px", display: "block" }}
          />
        )}
        <h1 style={{ margin: "10px 0 5px 0", fontSize: "32px", fontWeight: "bold" }}>FACTURA</h1>
        <p style={{ margin: "5px 0", fontSize: "16px", color: "#333", fontWeight: "600" }}>
          {factura.numero_factura}
        </p>
        <p style={{ margin: "5px 0", fontSize: "12px", color: "#666" }}>
          Fecha: {factura.fecha_creacion ? new Date(factura.fecha_creacion).toLocaleDateString() : new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Datos De y Para */}
      <table style={{ width: "100%", marginBottom: "30px", borderCollapse: "collapse" }}>
        <tbody>
          <tr>
            <td style={{ width: "50%", verticalAlign: "top", paddingRight: "20px" }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#333" }}>DE:</p>
              <p style={{ margin: "0 0 5px 0", fontSize: "13px", fontWeight: "bold" }}>
                {perfilEmpresa?.nombre || "Tu Empresa"}
              </p>
              {perfilEmpresa?.identificacion_fiscal && (
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                  Identificación: {perfilEmpresa.identificacion_fiscal}
                </p>
              )}
              {perfilEmpresa?.email && (
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                  Email: {perfilEmpresa.email}
                </p>
              )}
              {perfilEmpresa?.telefono && (
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                  Tel: {perfilEmpresa.telefono}
                </p>
              )}
              {perfilEmpresa?.direccion && (
                <p style={{ margin: "0", fontSize: "11px", color: "#555" }}>
                  {perfilEmpresa.direccion}
                </p>
              )}
            </td>
            <td style={{ width: "50%", verticalAlign: "top" }}>
              <p style={{ margin: "0 0 10px 0", fontSize: "12px", fontWeight: "bold", textTransform: "uppercase", color: "#333" }}>PARA:</p>
              <p style={{ margin: "0 0 5px 0", fontSize: "13px", fontWeight: "bold" }}>
                {cliente?.nombre || "Cliente"}
              </p>
              <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                Email: {cliente?.email || "No especificado"}
              </p>
              {cliente?.ruc && (
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                  Identificación: {cliente.ruc}
                </p>
              )}
              {cliente?.telefono && (
                <p style={{ margin: "0 0 3px 0", fontSize: "11px", color: "#555" }}>
                  Tel: {cliente.telefono}
                </p>
              )}
              {cliente?.direccion && (
                <p style={{ margin: "0", fontSize: "11px", color: "#555" }}>
                  {cliente.direccion}
                </p>
              )}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Tabla de detalles */}
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "30px", border: "1px solid #333" }}>
        <thead>
          <tr style={{ backgroundColor: "#f5f5f5", borderBottom: "2px solid #333" }}>
            <th style={{ textAlign: "left", padding: "12px", fontSize: "12px", fontWeight: "bold" }}>Descripción</th>
            <th style={{ textAlign: "right", padding: "12px", fontSize: "12px", fontWeight: "bold" }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: "12px", fontSize: "12px" }}>Producto/Servicio</td>
            <td style={{ textAlign: "right", padding: "12px", fontSize: "12px" }}>
              ${factura.subtotal.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Resumen totales */}
      <div style={{ marginBottom: "30px", display: "flex", justifyContent: "flex-end" }}>
        <div style={{ width: "250px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", borderBottom: "1px solid #ddd", marginBottom: "8px" }}>
            <span style={{ fontSize: "12px", fontWeight: "600" }}>Subtotal:</span>
            <span style={{ fontSize: "12px" }}>${factura.subtotal.toFixed(2)}</span>
          </div>
          {factura.descuento > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", marginBottom: "8px", color: "#d9534f" }}>
              <span style={{ fontSize: "12px", fontWeight: "600" }}>Descuento:</span>
              <span style={{ fontSize: "12px" }}>-${factura.descuento.toFixed(2)}</span>
            </div>
          )}
          {factura.impuesto > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", paddingBottom: "8px", marginBottom: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "600" }}>Impuesto:</span>
              <span style={{ fontSize: "12px" }}>+${factura.impuesto.toFixed(2)}</span>
            </div>
          )}
          <div style={{ 
            display: "flex", 
            justifyContent: "space-between", 
            paddingTop: "12px", 
            borderTop: "2px solid #333",
            borderBottom: "2px solid #333",
            paddingBottom: "12px",
            marginBottom: "8px"
          }}>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>TOTAL:</span>
            <span style={{ fontSize: "14px", fontWeight: "bold" }}>${factura.total.toFixed(2)}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666" }}>
            <span>Método pago:</span>
            <span>{factura.metodo_pago || "No especificado"}</span>
          </div>
          {factura.estado && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#666", marginTop: "5px" }}>
              <span>Estado:</span>
              <span style={{ textTransform: "uppercase", fontWeight: "bold", color: factura.estado === "pagada" ? "#5cb85c" : "#f0ad4e" }}>
                {factura.estado}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div style={{ fontSize: "11px", color: "#666", textAlign: "center", borderTop: "1px solid #ddd", paddingTop: "20px" }}>
        <p style={{ margin: "5px 0" }}>¡Gracias por su compra!</p>
        <p style={{ margin: "5px 0" }}>Factura generada el {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default GeneradorFacturas;