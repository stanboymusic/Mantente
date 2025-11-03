import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, Button, Table, Card, Row, Col, Tabs, Tab } from 'react-bootstrap';
import jsPDF from 'jspdf';

const LibroVentas = () => {
  const { user, isPremium, ventas, perfilEmpresa, obtenerEgresos, obtenerDevoluciones, inventario, obtenerHistorialMeses, obtenerGastosFijos } = useApp();
  const [egresos, setEgresos] = useState([]);
  const [devoluciones, setDevoluciones] = useState([]);
  const [historialMeses, setHistorialMeses] = useState([]);

  useEffect(() => {
    const cargarDatos = async () => {
      const egresosData = await obtenerEgresos();
      setEgresos(Array.isArray(egresosData?.data) ? egresosData.data : Array.isArray(egresosData) ? egresosData : []);
      
      const devolucionesData = await obtenerDevoluciones();
      setDevoluciones(Array.isArray(devolucionesData?.data) ? devolucionesData.data : Array.isArray(devolucionesData) ? devolucionesData : []);
      
      const historialData = await obtenerHistorialMeses();
      setHistorialMeses(historialData.data || []);
    };
    cargarDatos();
  }, []);

  const empresa = {
    nombre: perfilEmpresa?.nombre || 'Tu Empresa',
    identificacion_fiscal: perfilEmpresa?.identificacion_fiscal || '',
    email: perfilEmpresa?.email || '',
    telefono: perfilEmpresa?.telefono || '',
    direccion: perfilEmpresa?.direccion || '',
  };

  if (!isPremium) {
    return (
      <Alert variant="warning" className="m-4">
        <strong>🔒 Funcionalidad Premium</strong>
        <p>El libro de ventas está disponible solo para usuarios Premium.</p>
      </Alert>
    );
  }

  // Agrupar ventas, egresos y devoluciones por mes
  const ventasPorMes = useMemo(() => {
    const agrupadas = {};
    ventas.forEach(venta => {
      const mes = venta.mes_cierre || new Date().toISOString().slice(0, 7);
      if (!agrupadas[mes]) {
        agrupadas[mes] = [];
      }
      agrupadas[mes].push(venta);
    });
    return agrupadas;
  }, [ventas]);

  const egresosPorMes = useMemo(() => {
    const agrupadas = {};
    egresos.forEach(egreso => {
      const mes = egreso.mes_cierre || new Date().toISOString().slice(0, 7);
      if (!agrupadas[mes]) {
        agrupadas[mes] = [];
      }
      agrupadas[mes].push(egreso);
    });
    return agrupadas;
  }, [egresos]);

  const devolucionesPorMes = useMemo(() => {
    const agrupadas = {};
    devoluciones.filter(d => d.estado === 'Aprobada').forEach(dev => {
      const mes = dev.mes_cierre || new Date().toISOString().slice(0, 7);
      if (!agrupadas[mes]) {
        agrupadas[mes] = [];
      }
      agrupadas[mes].push(dev);
    });
    return agrupadas;
  }, [devoluciones]);

  const calcularTotalesMes = (ventasMes) => {
    return {
      cantidad_transacciones: ventasMes.length,
      monto_total: ventasMes.reduce((acc, v) => acc + (v.monto || 0), 0),
      descuentos_total: ventasMes.reduce((acc, v) => acc + (v.descuento || 0), 0),
      neto: ventasMes.reduce((acc, v) => acc + ((v.monto || 0) - (v.descuento || 0)), 0)
    };
  };

  const calcularTotalesEgresosMes = (egresosMes) => {
    return egresosMes.reduce((acc, e) => acc + (e.monto || 0), 0);
  };

  const calcularTotalesDevolucionesMes = (devolucionesMes) => {
    return devolucionesMes.reduce((acc, d) => acc + (d.monto || 0), 0);
  };

  const calcularBalanceFinalMes = (mes) => {
    const historialMes = historialMeses.find(h => h.mes === mes);
    if (historialMes) {
      return {
        ingresos: historialMes.total_final || 0,
        egresos: historialMes.total_egresos || 0,
        gastosFijos: historialMes.gastos_fijos || 0,
        deudaAnterior: historialMes.deuda_anterior || 0,
        deudaPendiente: historialMes.deuda_pendiente || 0,
        balanceFinal: (historialMes.total_final || 0) - (historialMes.total_egresos || 0) - (historialMes.gastos_fijos || 0) - (historialMes.deuda_anterior || 0)
      };
    }
    return {
      ingresos: 0,
      egresos: 0,
      gastosFijos: 0,
      deudaAnterior: 0,
      deudaPendiente: 0,
      balanceFinal: 0
    };
  };

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;

    // Encabezado con información de la empresa
    doc.setFontSize(14);
    doc.text(empresa.nombre.toUpperCase(), 10, yPosition);
    yPosition += 6;
    
    doc.setFontSize(9);
    if (empresa.identificacion_fiscal) {
      doc.text(`Identificación Fiscal: ${empresa.identificacion_fiscal}`, 10, yPosition);
      yPosition += 4;
    }
    if (empresa.direccion) {
      doc.text(`Dirección: ${empresa.direccion}`, 10, yPosition);
      yPosition += 4;
    }
    if (empresa.telefono) {
      doc.text(`Teléfono: ${empresa.telefono}`, 10, yPosition);
      yPosition += 4;
    }
    if (empresa.email) {
      doc.text(`Email: ${empresa.email}`, 10, yPosition);
      yPosition += 4;
    }
    yPosition += 6;

    // Título del documento
    doc.setFontSize(16);
    doc.text('LIBRO DE VENTAS', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;

    doc.setFontSize(10);
    doc.text(`Período: ${Object.keys(ventasPorMes).join(', ')}`, 10, yPosition);
    yPosition += 7;

    // Resumen general
    const totalGeneral = Object.values(ventasPorMes).flat().reduce((acc, v) => acc + (v.monto || 0), 0);
    const descuentosGeneral = Object.values(ventasPorMes).flat().reduce((acc, v) => acc + (v.descuento || 0), 0);

    doc.text(`Total Ventas: $${totalGeneral.toFixed(2)}`, 10, yPosition);
    yPosition += 7;
    doc.text(`Total Descuentos: $${descuentosGeneral.toFixed(2)}`, 10, yPosition);
    yPosition += 10;

    // Tabla por mes
    Object.keys(ventasPorMes)
      .sort()
      .reverse()
      .forEach(mes => {
        const ventasMes = ventasPorMes[mes];
        const totales = calcularTotalesMes(ventasMes);

        if (yPosition > pageHeight - 50) {
          doc.addPage();
          yPosition = 10;
        }

        doc.setFontSize(11);
        doc.text(`Mes: ${mes}`, 10, yPosition);
        yPosition += 7;

        // Datos del mes
        doc.setFontSize(9);
        doc.text(`Transacciones: ${totales.cantidad_transacciones}`, 10, yPosition);
        yPosition += 5;
        doc.text(`Monto Total: $${totales.monto_total.toFixed(2)}`, 10, yPosition);
        yPosition += 5;
        doc.text(`Descuentos: $${totales.descuentos_total.toFixed(2)}`, 10, yPosition);
        yPosition += 5;
        doc.text(`Neto: $${totales.neto.toFixed(2)}`, 10, yPosition);
        yPosition += 10;
      });

    doc.save('libro-ventas.pdf');
  };

  // Exportar a CSV
  const exportarCSV = () => {
    let csv = 'Código Venta,Fecha,Producto,Cantidad,Monto,Descuento,Neto,Cliente,Método Pago,Mes\n';
    
    ventas.forEach(venta => {
      const neto = (venta.monto || 0) - (venta.descuento || 0);
      csv += `"${venta.codigo_venta || 'N/A'}","${venta.fecha}","${venta.producto}",${venta.cantidad},$${venta.monto},$${venta.descuento},$${neto},"${venta.cliente}","${venta.metodo_pago}","${venta.mes_cierre}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'libro-ventas.csv';
    a.click();
  };

  const mesesOrdenados = Object.keys(ventasPorMes).sort().reverse();
  const todosLosMeses = [...new Set([...Object.keys(ventasPorMes), ...Object.keys(egresosPorMes)])].sort().reverse();

  return (
    <div className="container mt-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mantente-text-brown">📊 Informe de Cierre de Mes</h2>
        <div>
          <Button 
            variant="success"
            size="sm"
            onClick={exportarPDF}
            className="me-2"
          >
            📥 Exportar PDF
          </Button>
          <Button 
            variant="info"
            size="sm"
            onClick={exportarCSV}
          >
            📥 Exportar CSV
          </Button>
        </div>
      </div>

      {todosLosMeses.length === 0 ? (
        <Alert variant="info">
          No hay registros aún.
        </Alert>
      ) : (
        <Tabs defaultActiveKey="ventas" className="mb-4">
          <Tab eventKey="ventas" title="💰 Ingresos (Ventas)">
            {mesesOrdenados.length > 0 ? (
              mesesOrdenados.map(mes => {
                const ventasMes = ventasPorMes[mes] || [];
                const totales = calcularTotalesMes(ventasMes);
                return (
                  <Card key={mes} className="mb-4">
                    <Card.Header style={{ backgroundColor: 'rgba(76, 175, 80, 0.1)' }}>
                      <h5 className="mb-0 mantente-text-brown">📋 Mes: {mes} | {totales.cantidad_transacciones} transacciones | Neto: ${totales.neto.toFixed(2)}</h5>
                    </Card.Header>
                    <Card.Body>
                      {ventasMes.length > 0 ? (
                        <div className="table-responsive">
                          <Table striped hover size="sm">
                            <thead>
                              <tr>
                                <th>Código Venta</th>
                                <th>Fecha</th>
                                <th>Producto</th>
                                <th>Cantidad</th>
                                <th>Monto</th>
                                <th>Descuento</th>
                                <th>Neto</th>
                                <th>Cliente</th>
                              </tr>
                            </thead>
                            <tbody>
                              {ventasMes.map((venta, idx) => (
                                <tr key={idx}>
                                  <td><strong style={{ color: 'var(--mantente-gold)' }}>{venta.codigo_venta || 'N/A'}</strong></td>
                                  <td>{venta.fecha}</td>
                                  <td>{venta.producto}</td>
                                  <td>{venta.cantidad}</td>
                                  <td>${venta.monto?.toFixed(2) || '0.00'}</td>
                                  <td>${venta.descuento?.toFixed(2) || '0.00'}</td>
                                  <td>${((venta.monto || 0) - (venta.descuento || 0)).toFixed(2)}</td>
                                  <td>{venta.cliente}</td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot style={{ backgroundColor: 'rgba(226, 181, 78, 0.1)' }}>
                              <tr>
                                <th colSpan="4">TOTALES DEL MES</th>
                                <th>${totales.monto_total.toFixed(2)}</th>
                                <th>${totales.descuentos_total.toFixed(2)}</th>
                                <th>${totales.neto.toFixed(2)}</th>
                                <th></th>
                              </tr>
                            </tfoot>
                          </Table>
                        </div>
                      ) : (
                        <Alert variant="warning">No hay ventas registradas en este mes</Alert>
                      )}
                    </Card.Body>
                  </Card>
                );
              })
            ) : (
              <Alert variant="warning">No hay ventas registradas</Alert>
            )}
          </Tab>

          <Tab eventKey="egresos" title="📉 Egresos">
            {Object.keys(egresosPorMes).length > 0 ? (
              Object.keys(egresosPorMes).sort().reverse().map(mes => {
                const egresosMes = egresosPorMes[mes] || [];
                const totalEgresos = calcularTotalesEgresosMes(egresosMes);
                return (
                  <Card key={mes} className="mb-4">
                    <Card.Header style={{ backgroundColor: 'rgba(244, 67, 54, 0.1)' }}>
                      <h5 className="mb-0 mantente-text-brown">📋 Mes: {mes} | Total: ${totalEgresos.toFixed(2)}</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="table-responsive">
                        <Table striped hover size="sm">
                          <thead>
                            <tr>
                              <th>Descripción</th>
                              <th>Monto</th>
                              <th>Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {egresosMes.map((egreso, idx) => (
                              <tr key={idx}>
                                <td>{egreso.descripcion}</td>
                                <td>${egreso.monto?.toFixed(2) || '0.00'}</td>
                                <td>{egreso.fecha}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot style={{ backgroundColor: 'rgba(226, 181, 78, 0.1)' }}>
                            <tr>
                              <th>TOTAL EGRESOS</th>
                              <th>${totalEgresos.toFixed(2)}</th>
                              <th></th>
                            </tr>
                          </tfoot>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })
            ) : (
              <Alert variant="warning">No hay egresos registrados</Alert>
            )}
          </Tab>

          <Tab eventKey="balance" title="📊 Balance Final">
            {todosLosMeses.map(mes => {
              const balance = calcularBalanceFinalMes(mes);
              const estaEnDeuda = balance.balanceFinal < 0;
              return (
                <Card key={mes} className="mb-4">
                  <Card.Header style={{ backgroundColor: estaEnDeuda ? 'rgba(244, 67, 54, 0.1)' : 'rgba(76, 175, 80, 0.1)' }}>
                    <h5 className="mb-0 mantente-text-brown">📋 Mes: {mes}</h5>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong>Ingresos Netos:</strong> <span className="text-success">${balance.ingresos.toFixed(2)}</span>
                        </div>
                        <div className="mb-3">
                          <strong>Egresos:</strong> <span className="text-danger">-${balance.egresos.toFixed(2)}</span>
                        </div>
                        <div className="mb-3">
                          <strong>Gastos Fijos Mensuales:</strong> <span className="text-warning">-${balance.gastosFijos.toFixed(2)}</span>
                        </div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-3">
                          <strong>Deuda Anterior:</strong> <span className="text-muted">-${balance.deudaAnterior.toFixed(2)}</span>
                        </div>
                        <hr />
                        <div className={`p-3 rounded ${estaEnDeuda ? 'bg-danger bg-opacity-10' : 'bg-success bg-opacity-10'}`}>
                          <strong>BALANCE FINAL:</strong> <span className={estaEnDeuda ? 'text-danger fw-bold' : 'text-success fw-bold'}>
                            ${balance.balanceFinal.toFixed(2)}
                          </span>
                        </div>
                        {balance.deudaPendiente > 0 && (
                          <div className="mt-3 p-3 bg-warning bg-opacity-10 rounded">
                            <strong>Deuda Pendiente:</strong> <span className="text-warning fw-bold">${balance.deudaPendiente.toFixed(2)}</span>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </Tab>

          <Tab eventKey="devoluciones" title="🔄 Devoluciones Aprobadas">
            {Object.keys(devolucionesPorMes).length > 0 ? (
              Object.keys(devolucionesPorMes).sort().reverse().map(mes => {
                const devolucionesMes = devolucionesPorMes[mes] || [];
                const totalDevoluciones = calcularTotalesDevolucionesMes(devolucionesMes);
                return (
                  <Card key={mes} className="mb-4">
                    <Card.Header style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                      <h5 className="mb-0 mantente-text-brown">📋 Mes: {mes} | Total: ${totalDevoluciones.toFixed(2)}</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="table-responsive">
                        <Table striped hover size="sm">
                          <thead>
                            <tr>
                              <th>Código</th>
                              <th>Tipo</th>
                              <th>Producto</th>
                              <th>Monto</th>
                              <th>Motivo</th>
                              <th>Fecha</th>
                            </tr>
                          </thead>
                          <tbody>
                            {devolucionesMes.map((dev, idx) => (
                              <tr key={idx}>
                                <td><strong>{dev.codigo || 'N/A'}</strong></td>
                                <td>{dev.tipo}</td>
                                <td>{dev.producto}</td>
                                <td>${dev.monto?.toFixed(2) || '0.00'}</td>
                                <td>{dev.motivo}</td>
                                <td>{dev.fecha}</td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot style={{ backgroundColor: 'rgba(226, 181, 78, 0.1)' }}>
                            <tr>
                              <th colSpan="3">TOTAL DEVOLUCIONES</th>
                              <th>${totalDevoluciones.toFixed(2)}</th>
                              <th colSpan="2"></th>
                            </tr>
                          </tfoot>
                        </Table>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })
            ) : (
              <Alert variant="warning">No hay devoluciones aprobadas</Alert>
            )}
          </Tab>

          <Tab eventKey="inventario" title="📦 Estado del Inventario">
            <Card>
              <Card.Header style={{ backgroundColor: 'rgba(156, 39, 176, 0.1)' }}>
                <h5 className="mb-0 mantente-text-brown">📊 Inventario Actual</h5>
              </Card.Header>
              <Card.Body>
                {inventario && inventario.length > 0 ? (
                  <div className="table-responsive">
                    <Table striped hover size="sm">
                      <thead>
                        <tr>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Unitario</th>
                          <th>Valor Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventario.map((item, idx) => (
                          <tr key={idx}>
                            <td>{item.nombre}</td>
                            <td className="fw-bold">{item.cantidad}</td>
                            <td>${item.precio?.toFixed(2) || '0.00'}</td>
                            <td className="text-success fw-bold">${((item.cantidad || 0) * (item.precio || 0)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ backgroundColor: 'rgba(226, 181, 78, 0.1)' }}>
                        <tr>
                          <th colSpan="3">VALOR TOTAL DEL INVENTARIO</th>
                          <th className="text-success fw-bold">
                            ${inventario.reduce((acc, item) => acc + ((item.cantidad || 0) * (item.precio || 0)), 0).toFixed(2)}
                          </th>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                ) : (
                  <Alert variant="warning">No hay productos en el inventario</Alert>
                )}
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      )}
    </div>
  );
};

export default LibroVentas;