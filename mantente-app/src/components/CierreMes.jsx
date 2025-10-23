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

const CierreMes = () => {
  const { cerrarMes, obtenerHistorialMeses, ventas } = useApp();
  const [historial, setHistorial] = useState([]);
  const [alerta, setAlerta] = useState(null);
  const [mesCierre, setMesCierre] = useState(
    new Date().toISOString().slice(0, 7) + "-01"
  );
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    const resultado = await obtenerHistorialMeses();
    if (resultado.success) {
      setHistorial(resultado.data);
      console.log("📋 Historial cargado:", resultado.data);
    }
  };

  const calcularResumenMes = () => {
    const ventasDelMes = ventas.filter((v) => v.mes_cierre === mesCierre);
    const totalVentas = ventasDelMes.reduce(
      (acc, v) => acc + Number(v.monto || 0),
      0
    );
    const totalDescuentos = ventasDelMes.reduce(
      (acc, v) => acc + Number(v.descuento || 0),
      0
    );
    const totalFinal = totalVentas - totalDescuentos;

    return {
      totalVentas,
      totalDescuentos,
      totalFinal,
      cantidadTransacciones: ventasDelMes.length,
    };
  };

  const getMesAnterior = (mesActual) => {
    // Extraer año y mes del formato YYYY-MM-DD
    const [año, mes] = mesActual.split("-").slice(0, 2);
    let mesNum = parseInt(mes) - 1;
    let añoNum = parseInt(año);
    
    // Si es enero, ir al diciembre del año anterior
    if (mesNum === 0) {
      mesNum = 12;
      añoNum -= 1;
    }
    
    const mesPadded = String(mesNum).padStart(2, "0");
    return `${añoNum}-${mesPadded}-01`;
  };

  const obtenerDeudaAnterior = () => {
    const mesAnterior = getMesAnterior(mesCierre);
    console.log(`🔍 Buscando deuda para mes anterior: ${mesAnterior}`);
    console.log(`📋 Meses disponibles en historial:`, historial.map(h => h.mes));
    
    const registroAnterior = historial.find((h) => h.mes === mesAnterior);
    const deuda = registroAnterior?.deuda_pendiente || 0;
    
    if (registroAnterior) {
      console.log(`✅ Mes anterior encontrado: deuda_pendiente = $${deuda}`);
    } else {
      console.warn(`⚠️ No se encontró registro para mes anterior (${mesAnterior})`);
    }
    
    return deuda;
  };

  const handleVerResumen = () => {
    const resumen = calcularResumenMes();
    setResumen(resumen);
  };

  const handleCerrarMes = async () => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres cerrar este mes? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    setLoading(true);
    const resultado = await cerrarMes(mesCierre);
    setLoading(false);

    if (resultado.success) {
      setAlerta({
        type: "success",
        message: "✅ Mes cerrado exitosamente",
      });
      setResumen(null);
      setMesCierre(new Date().toISOString().slice(0, 7) + "-01");
      cargarHistorial();
    } else {
      setAlerta({
        type: "danger",
        message: "❌ " + resultado.message,
      });
    }
  };

  const resumenActual = resumen || calcularResumenMes();
  const mesCierreCerrado = historial.some((h) => h.mes === mesCierre && h.is_closed);

  return (
    <div className="container mt-4">
      {alerta && (
        <Alert variant={alerta.type} onClose={() => setAlerta(null)} dismissible>
          {alerta.message}
        </Alert>
      )}

      <Row className="mb-4">
        <Col md={6}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-warning text-dark fw-bold">
              📊 Cierre de Mes
            </Card.Header>
            <Card.Body>
              <Form.Group className="mb-3">
                <Form.Label>Selecciona el mes a cerrar</Form.Label>
                <Form.Control
                  type="date"
                  value={mesCierre.slice(0, 10)}
                  onChange={(e) => {
                    const fecha = e.target.value;
                    setMesCierre(fecha + "-01");
                    setResumen(null);
                  }}
                />
              </Form.Group>

              <Button
                variant="info"
                className="w-100 mb-2"
                onClick={handleVerResumen}
              >
                👁️ Ver Resumen
              </Button>

              {!mesCierreCerrado ? (
                <Button
                  variant="warning"
                  className="w-100"
                  onClick={handleCerrarMes}
                  disabled={loading}
                >
                  {loading ? "Cerrando..." : "🔒 Cerrar Mes"}
                </Button>
              ) : (
                <Alert variant="warning" className="mb-0">
                  ⚠️ Este mes ya ha sido cerrado
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col md={6}>
          <Card className="shadow-lg border-0">
            <Card.Header className="bg-success text-white fw-bold">
              📈 Resumen del Mes
            </Card.Header>
            <Card.Body>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span>Transacciones:</span>
                  <strong>{resumenActual.cantidadTransacciones}</strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Ventas:</span>
                  <strong className="text-success">
                    ${resumenActual.totalVentas.toFixed(2)}
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Descuentos:</span>
                  <strong className="text-danger">
                    -${resumenActual.totalDescuentos.toFixed(2)}
                  </strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-3">
                  <span style={{ fontSize: "16px" }}>Total Ingresos:</span>
                  <strong style={{ fontSize: "16px" }} className="text-primary">
                    ${resumenActual.totalFinal.toFixed(2)}
                  </strong>
                </div>
                <hr />
                <div className="d-flex justify-content-between mb-2" style={{ backgroundColor: "#fff3cd", padding: "8px", borderRadius: "4px" }}>
                  <span>⚠️ Deuda Anterior:</span>
                  <strong className="text-warning">
                    ${obtenerDeudaAnterior().toFixed(2)}
                  </strong>
                </div>
                <div className="d-flex justify-content-between" style={{ backgroundColor: resumenActual.totalFinal < obtenerDeudaAnterior() ? "#f8d7da" : "#d4edda", padding: "8px", borderRadius: "4px" }}>
                  <span>📊 Deuda Resultante:</span>
                  <strong className={resumenActual.totalFinal < obtenerDeudaAnterior() ? "text-danger" : "text-success"}>
                    ${Math.max(0, obtenerDeudaAnterior() - resumenActual.totalFinal).toFixed(2)}
                  </strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-lg border-0">
        <Card.Header className="bg-primary text-white fw-bold">
          📅 Historial de Meses Cerrados
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table striped bordered hover>
              <thead className="table-light">
                <tr>
                  <th>Mes</th>
                  <th>Total Ventas</th>
                  <th>Descuentos</th>
                  <th>Total Final</th>
                  <th>Gastos Fijos</th>
                  <th>Deuda Anterior</th>
                  <th>Deuda Pendiente</th>
                  <th>Ganancia Neta</th>
                  <th>Transacciones</th>
                </tr>
              </thead>
              <tbody>
                {historial.length > 0 ? (
                  historial.map((registro) => (
                    <tr key={registro.id}>
                      <td className="fw-bold">{registro.mes}</td>
                      <td className="text-success">
                        ${registro.total_ventas.toFixed(2)}
                      </td>
                      <td className="text-danger">
                        -${registro.total_descuentos.toFixed(2)}
                      </td>
                      <td className="text-primary">
                        ${registro.total_final.toFixed(2)}
                      </td>
                      <td className="text-warning">
                        ${registro.gastos_fijos?.toFixed(2) || "0.00"}
                      </td>
                      <td className={`${registro.deuda_anterior > 0 ? "text-warning fw-bold" : "text-muted"}`}>
                        ${registro.deuda_anterior?.toFixed(2) || "0.00"}
                      </td>
                      <td className={`${registro.deuda_pendiente > 0 ? "text-danger fw-bold" : "text-success"}`}>
                        ${registro.deuda_pendiente?.toFixed(2) || "0.00"}
                      </td>
                      <td className={`fw-bold ${registro.ganancia_neta >= 0 ? "text-success" : "text-danger"}`}>
                        ${registro.ganancia_neta.toFixed(2)}
                      </td>
                      <td>{registro.cantidad_transacciones}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center text-muted">
                      No hay meses cerrados
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CierreMes;