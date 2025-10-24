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
} from "react-bootstrap";

const AperturaMes = () => {
  const { abrirMes, obtenerHistorialMeses, obtenerGastosFijos } = useApp();
  const [historial, setHistorial] = useState([]);
  const [alerta, setAlerta] = useState(null);
  const [mesApertura, setMesApertura] = useState(
    new Date().toISOString().slice(0, 7) + "-01"
  );
  const [deudaAnterior, setDeudaAnterior] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    cargarHistorial();
  }, [mesApertura]);

  useEffect(() => {
    cargarDeudaAnterior();
  }, [mesApertura, historial]);

  const cargarHistorial = async () => {
    const resultado = await obtenerHistorialMeses();
    if (resultado.success) {
      setHistorial(resultado.data);
    }
  };

  const cargarDeudaAnterior = () => {
    // Calcular mes anterior
    const [año, mes] = mesApertura.split("-").slice(0, 2);
    let mesAnteriorNum = parseInt(mes) - 1;
    let añoAnterior = parseInt(año);

    if (mesAnteriorNum === 0) {
      mesAnteriorNum = 12;
      añoAnterior -= 1;
    }

    const mesAnteriorPadded = String(mesAnteriorNum).padStart(2, "0");
    const mesAnterior = `${añoAnterior}-${mesAnteriorPadded}-01`;

    // Buscar en el historial
    const registroAnterior = historial.find((h) => h.mes === mesAnterior);
    setDeudaAnterior(registroAnterior?.deuda_pendiente || 0);
  };

  const handleAbrirMes = async () => {
    if (
      !window.confirm(
        `¿Quieres aperturar el mes ${mesApertura}? ${
          deudaAnterior > 0
            ? `\n\nDeuda acumulada a transferir: $${deudaAnterior.toFixed(2)}`
            : ""
        }`
      )
    ) {
      return;
    }

    setLoading(true);
    const resultado = await abrirMes(mesApertura);
    setLoading(false);

    if (resultado.success) {
      setAlerta({
        type: "success",
        message: `✅ ${resultado.message}`,
      });
      cargarHistorial();
      // Cambiar a próximo mes si se aperturó correctamente
      const [año, mes] = mesApertura.split("-").slice(0, 2);
      let mesProximo = parseInt(mes) + 1;
      let añoProximo = parseInt(año);

      if (mesProximo === 13) {
        mesProximo = 1;
        añoProximo += 1;
      }

      const mesProximoPadded = String(mesProximo).padStart(2, "0");
      setMesApertura(`${añoProximo}-${mesProximoPadded}-01`);
    } else {
      setAlerta({
        type: "danger",
        message: `❌ ${resultado.message}`,
      });
    }
  };

  const gastosFijos = obtenerGastosFijos() || 0;

  return (
    <div className="container py-4">
      <h1 className="mb-4">
        <span style={{ fontSize: "1.5em" }}>🎯</span> Aperturar Mes
      </h1>

      {alerta && (
        <Alert
          variant={alerta.type}
          onClose={() => setAlerta(null)}
          dismissible
          className="mb-3"
        >
          {alerta.message}
        </Alert>
      )}

      <Row>
        <Col lg={6}>
          <Card className="mb-4 shadow-sm">
            <Card.Header className="mantente-bg-blue text-white">
              <Card.Title className="mb-0">📅 Aperturar Nuevo Mes</Card.Title>
            </Card.Header>
            <Card.Body>
              <Form>
                <Form.Group className="mb-3">
                  <Form.Label>Selecciona el mes a aperturar:</Form.Label>
                  <Form.Control
                    type="month"
                    value={mesApertura.slice(0, 7)}
                    onChange={(e) =>
                      setMesApertura(e.target.value + "-01")
                    }
                  />
                  <Form.Text className="text-muted">
                    Formato: YYYY-MM (ej: 2024-01)
                  </Form.Text>
                </Form.Group>

                <Card className="bg-light border-0 mb-3">
                  <Card.Body>
                    <div className="mb-2">
                      <strong>Gastos Fijos del Mes:</strong>
                      <div className="text-primary fs-5">
                        ${gastosFijos.toFixed(2)}
                      </div>
                    </div>

                    {deudaAnterior > 0 && (
                      <div className="border-top pt-2">
                        <strong>Deuda Acumulada a Transferir:</strong>
                        <div className="text-warning fs-5">
                          ${deudaAnterior.toFixed(2)}
                        </div>
                        <small className="text-muted">
                          Esta deuda se trasladará al nuevo mes que estás
                          aperturando.
                        </small>
                      </div>
                    )}
                  </Card.Body>
                </Card>

                <Button
                  variant="success"
                  size="lg"
                  onClick={handleAbrirMes}
                  disabled={loading}
                  className="w-100"
                >
                  {loading ? "Abriendo mes..." : "✅ Aperturar Mes"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={6}>
          <Card className="shadow-sm">
            <Card.Header className="bg-info text-white">
              <Card.Title className="mb-0">📊 Historial de Meses</Card.Title>
            </Card.Header>
            <Card.Body style={{ maxHeight: "400px", overflowY: "auto" }}>
              {historial.length === 0 ? (
                <p className="text-muted">No hay meses registrados aún.</p>
              ) : (
                <Table striped bordered hover size="sm">
                  <thead>
                    <tr>
                      <th>Mes</th>
                      <th>Ingresos</th>
                      <th>Deuda</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historial.map((mes) => (
                      <tr key={mes.id}>
                        <td>{mes.mes}</td>
                        <td>${(mes.total_final || 0).toFixed(2)}</td>
                        <td>
                          {mes.deuda_pendiente > 0 ? (
                            <span className="badge" style={{ backgroundColor: 'var(--mantente-dark-gray)', color: 'white' }}>
                              ${mes.deuda_pendiente.toFixed(2)}
                            </span>
                          ) : (
                            <span className="badge" style={{ backgroundColor: 'var(--mantente-taupe)', color: 'white' }}>Pagado</span>
                          )}
                        </td>
                        <td>
                          {mes.total_transacciones > 0 ||
                          mes.total_final > 0 ? (
                            <span className="badge" style={{ backgroundColor: 'var(--mantente-gold)', color: 'var(--mantente-dark-gray)' }}>Cerrado</span>
                          ) : (
                            <span className="badge bg-secondary">Abierto</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4 bg-info bg-opacity-10 border-info">
        <Card.Body>
          <h5 className="text-info">
            <span style={{ fontSize: "1.3em" }}>ℹ️</span> ¿Cómo funciona?
          </h5>
          <ul className="mb-0 ms-3">
            <li>
              Al aperturar un mes, se crea un nuevo período de registro de
              ventas
            </li>
            <li>
              Si existe deuda del mes anterior, se transferirá automáticamente
            </li>
            <li>El mes debe aperturarse antes de registrar ventas en él</li>
            <li>
              Una vez registres ventas, podrás cerrar el mes para finalizar el
              período
            </li>
          </ul>
        </Card.Body>
      </Card>
    </div>
  );
};

export default AperturaMes;