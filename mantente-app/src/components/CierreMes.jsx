import React, { useState, useEffect, useMemo } from "react";
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
  const { cerrarMes, obtenerHistorialMeses, ventas, obtenerGastosFijos } = useApp();
  const [historial, setHistorial] = useState([]);
  const [alerta, setAlerta] = useState(null);
  // Asegurarnos de que la fecha sea correcta
  const getFechaActual = () => {
    const hoy = new Date();
    // Verificar si la fecha del sistema es válida (no futura)
    const añoActual = new Date().getFullYear();
    if (hoy.getFullYear() > añoActual + 1) {
      // Si la fecha es muy futura, usar una fecha fija actual
      console.warn("⚠️ Fecha del sistema incorrecta, usando fecha actual fija");
      return `${añoActual}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`;
    }
    return hoy.toISOString().slice(0, 7) + "-01";
  };
  
  const [mesCierre, setMesCierre] = useState(getFechaActual());
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
    try {
      // Validar el formato de la fecha
      if (!mesActual || !mesActual.match(/^\d{4}-\d{2}-\d{2}$/)) {
        console.error("⚠️ Formato de fecha inválido:", mesActual);
        // Usar fecha actual como fallback
        const hoy = new Date();
        const añoActual = hoy.getFullYear();
        const mesActualNum = hoy.getMonth() + 1;
        mesActual = `${añoActual}-${String(mesActualNum).padStart(2, "0")}-01`;
      }
      
      // Extraer año y mes del formato YYYY-MM-DD
      const [año, mes] = mesActual.split("-").slice(0, 2);
      let mesNum = parseInt(mes) - 1;
      let añoNum = parseInt(año);
      
      // Validar que el año y mes sean números válidos
      if (isNaN(mesNum) || isNaN(añoNum) || añoNum < 2000 || añoNum > 2100 || mesNum < 0 || mesNum > 11) {
        console.error("⚠️ Valores de fecha inválidos:", { año, mes, mesNum, añoNum });
        // Usar fecha actual como fallback
        const hoy = new Date();
        añoNum = hoy.getFullYear();
        mesNum = hoy.getMonth();
      }
      
      // Si es enero, ir al diciembre del año anterior
      if (mesNum === 0) {
        mesNum = 12;
        añoNum -= 1;
      }
      
      const mesPadded = String(mesNum).padStart(2, "0");
      return `${añoNum}-${mesPadded}-01`;
    } catch (error) {
      console.error("❌ Error al calcular mes anterior:", error);
      // Fallback a un mes anterior seguro
      const hoy = new Date();
      hoy.setMonth(hoy.getMonth() - 1);
      return `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, "0")}-01`;
    }
  };

  const obtenerDeudaAnterior = () => {
    try {
      const mesAnterior = getMesAnterior(mesCierre);
      
      // Verificar si el historial está cargado
      if (!historial || historial.length === 0) {
        return 0;
      }
      
      // Buscar el registro del mes anterior exacto
      let registroAnterior = historial.find((h) => h.mes === mesAnterior);
      
      // Si no se encuentra, buscar el mes más reciente anterior a la fecha actual
      if (!registroAnterior) {
        const mesesAnteriores = historial
          .filter(h => h.mes < mesCierre)
          .sort((a, b) => b.mes.localeCompare(a.mes));
        
        if (mesesAnteriores.length > 0) {
          registroAnterior = mesesAnteriores[0]; // El mes más reciente
        }
      }
      
      return registroAnterior?.deuda_pendiente || 0;
    } catch (error) {
      console.error("❌ Error al obtener deuda anterior:", error);
      return 0;
    }
  };

  // ✅ Cachear el resultado de deuda anterior para evitar recálculos
  const deudaAnterior = useMemo(() => obtenerDeudaAnterior(), [historial, mesCierre]);
  
  // ✅ Obtener gastos fijos para cálculo correcto de deuda resultante
  const gastosFijos = obtenerGastosFijos() || 0;

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
      setMesCierre(getFechaActual());
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
            <Card.Header className="mantente-bg-taupe text-white fw-bold">
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
                    ${deudaAnterior.toFixed(2)}
                  </strong>
                </div>
                <div className="d-flex justify-content-between mb-2" style={{ backgroundColor: "#e7f3ff", padding: "8px", borderRadius: "4px" }}>
                  <span>💰 Gastos Fijos del Mes:</span>
                  <strong className="text-info">
                    ${gastosFijos.toFixed(2)}
                  </strong>
                </div>
                <div className="d-flex justify-content-between" style={{ backgroundColor: resumenActual.totalFinal < (deudaAnterior + gastosFijos) ? "#f8d7da" : "#d4edda", padding: "8px", borderRadius: "4px" }}>
                  <span>📊 Deuda Resultante:</span>
                  <strong className={resumenActual.totalFinal < (deudaAnterior + gastosFijos) ? "text-danger" : "text-success"}>
                    ${Math.max(0, deudaAnterior + gastosFijos - resumenActual.totalFinal).toFixed(2)}
                  </strong>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="shadow-lg border-0">
        <Card.Header className="mantente-bg-blue text-white fw-bold">
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