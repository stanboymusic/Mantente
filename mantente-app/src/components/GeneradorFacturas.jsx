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
      const element = document.getElementById(`factura-${factura.id}`);
      if (!element) {
        setAlerta({
          type: "danger",
          message: "❌ No se pudo encontrar la factura para generar PDF",
        });
        return;
      }

      const canvas = await html2canvas(element, { scale: 2, allowTaint: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`${factura.numero_factura}.pdf`);
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
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        {perfilEmpresa?.logo_url && (
          <img
            src={perfilEmpresa.logo_url}
            alt="Logo"
            style={{ maxHeight: "50px", marginBottom: "10px" }}
          />
        )}
        <h1 style={{ margin: "0", fontSize: "28px" }}>FACTURA</h1>
        <h2 style={{ margin: "5px 0", fontSize: "14px", color: "#666" }}>
          {factura.numero_factura}
        </h2>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "30px" }}>
        <div>
          <h4 style={{ margin: "0 0 5px 0" }}>De:</h4>
          <p style={{ margin: "0", fontSize: "12px", fontWeight: "bold" }}>
            {perfilEmpresa?.nombre || "Tu Empresa"}
          </p>
          {perfilEmpresa?.identificacion_fiscal && (
            <p style={{ margin: "0", fontSize: "12px" }}>
              Identificación: {perfilEmpresa.identificacion_fiscal}
            </p>
          )}
          {perfilEmpresa?.email && (
            <p style={{ margin: "0", fontSize: "12px" }}>Email: {perfilEmpresa.email}</p>
          )}
          {perfilEmpresa?.telefono && (
            <p style={{ margin: "0", fontSize: "12px" }}>Tel: {perfilEmpresa.telefono}</p>
          )}
          {perfilEmpresa?.direccion && (
            <p style={{ margin: "0", fontSize: "12px" }}>{perfilEmpresa.direccion}</p>
          )}
        </div>
        <div>
          <h4 style={{ margin: "0 0 5px 0" }}>Para:</h4>
          <p style={{ margin: "0", fontSize: "12px", fontWeight: "bold" }}>{cliente?.nombre}</p>
          <p style={{ margin: "0", fontSize: "12px" }}>Email: {cliente?.email}</p>
          {cliente?.ruc && (
            <p style={{ margin: "0", fontSize: "12px" }}>
              Identificación: {cliente.ruc}
            </p>
          )}
        </div>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr style={{ borderBottom: "2px solid #333" }}>
            <th style={{ textAlign: "left", padding: "8px", fontSize: "12px" }}>Descripción</th>
            <th style={{ textAlign: "right", padding: "8px", fontSize: "12px" }}>Monto</th>
          </tr>
        </thead>
        <tbody>
          <tr style={{ borderBottom: "1px solid #ddd" }}>
            <td style={{ padding: "8px", fontSize: "11px" }}>Concepto</td>
            <td style={{ textAlign: "right", padding: "8px", fontSize: "11px" }}>
              ${factura.subtotal.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "20px", fontSize: "12px" }}>
        <div style={{ width: "200px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #ddd", paddingTop: "5px" }}>
            <span>Subtotal:</span>
            <span>${factura.subtotal.toFixed(2)}</span>
          </div>
          {factura.descuento > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Descuento:</span>
              <span>-${factura.descuento.toFixed(2)}</span>
            </div>
          )}
          {factura.impuesto > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Impuesto:</span>
              <span>+${factura.impuesto.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #333", paddingTop: "5px", fontWeight: "bold" }}>
            <span>Total:</span>
            <span>${factura.total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      <div style={{ fontSize: "11px", color: "#666", textAlign: "center" }}>
        <p style={{ margin: "0" }}>Gracias por su compra</p>
        <p style={{ margin: "0" }}>Fecha: {new Date(factura.fecha_creacion).toLocaleDateString()}</p>
      </div>
    </div>
  );
};

export default GeneradorFacturas;