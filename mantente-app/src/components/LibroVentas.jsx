import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, Button, Table, Card, Row, Col } from 'react-bootstrap';
import jsPDF from 'jspdf';

const LibroVentas = () => {
  const { user, isPremium, ventas } = useApp();

  if (!isPremium) {
    return (
      <Alert variant="warning" className="m-4">
        <strong>🔒 Funcionalidad Premium</strong>
        <p>El libro de ventas está disponible solo para usuarios Premium.</p>
      </Alert>
    );
  }

  // Agrupar ventas por mes
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

  // Calcular totales
  const calcularTotalesMes = (ventasMes) => {
    return {
      cantidad_transacciones: ventasMes.length,
      monto_total: ventasMes.reduce((acc, v) => acc + (v.monto || 0), 0),
      descuentos_total: ventasMes.reduce((acc, v) => acc + (v.descuento || 0), 0),
      neto: ventasMes.reduce((acc, v) => acc + ((v.monto || 0) - (v.descuento || 0)), 0)
    };
  };

  // Exportar a PDF
  const exportarPDF = () => {
    const doc = new jsPDF();
    const pageHeight = doc.internal.pageSize.getHeight();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 10;

    // Título
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

  return (
    <div className="container mt-4 mb-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mantente-text-brown">📊 Libro de Ventas</h2>
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

      {ventas.length === 0 ? (
        <Alert variant="info">
          No hay ventas registradas aún.
        </Alert>
      ) : (
        <>
          {/* Resumen General */}
          <Row className="mb-4">
            <Col md={3}>
              <Card>
                <Card.Body>
                  <Card.Title className="mantente-text-brown">Total Ventas</Card.Title>
                  <h4 className="mantente-text-gold">
                    ${Object.values(ventasPorMes)
                      .flat()
                      .reduce((acc, v) => acc + (v.monto || 0), 0)
                      .toFixed(2)}
                  </h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <Card.Title className="mantente-text-brown">Descuentos</Card.Title>
                  <h4 className="mantente-text-gold">
                    ${Object.values(ventasPorMes)
                      .flat()
                      .reduce((acc, v) => acc + (v.descuento || 0), 0)
                      .toFixed(2)}
                  </h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <Card.Title className="mantente-text-brown">Neto</Card.Title>
                  <h4 className="mantente-text-gold">
                    ${Object.values(ventasPorMes)
                      .flat()
                      .reduce((acc, v) => acc + ((v.monto || 0) - (v.descuento || 0)), 0)
                      .toFixed(2)}
                  </h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card>
                <Card.Body>
                  <Card.Title className="mantente-text-brown">Transacciones</Card.Title>
                  <h4 className="mantente-text-gold">{ventas.length}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Tablas por mes */}
          {mesesOrdenados.map(mes => {
            const ventasMes = ventasPorMes[mes];
            const totales = calcularTotalesMes(ventasMes);
            return (
              <Card key={mes} className="mb-4">
                <Card.Header style={{ backgroundColor: 'rgba(166, 119, 41, 0.1)' }}>
                  <div className="d-flex justify-content-between">
                    <h5 className="mb-0 mantente-text-brown">Mes: {mes}</h5>
                    <small className="text-muted">
                      {totales.cantidad_transacciones} transacciones • Neto: ${totales.neto.toFixed(2)}
                    </small>
                  </div>
                </Card.Header>
                <Card.Body>
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
                          <th>Método</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ventasMes.map((venta, idx) => (
                          <tr key={idx}>
                            <td>
                              <strong style={{ color: 'var(--mantente-gold)' }}>
                                {venta.codigo_venta || 'N/A'}
                              </strong>
                            </td>
                            <td>{venta.fecha}</td>
                            <td>{venta.producto}</td>
                            <td>{venta.cantidad}</td>
                            <td>${venta.monto?.toFixed(2) || '0.00'}</td>
                            <td>${venta.descuento?.toFixed(2) || '0.00'}</td>
                            <td>${((venta.monto || 0) - (venta.descuento || 0)).toFixed(2)}</td>
                            <td>{venta.cliente}</td>
                            <td><small>{venta.metodo_pago}</small></td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ backgroundColor: 'rgba(226, 181, 78, 0.1)' }}>
                        <tr>
                          <th colSpan="4">Totales del mes</th>
                          <th>${totales.monto_total.toFixed(2)}</th>
                          <th>${totales.descuentos_total.toFixed(2)}</th>
                          <th>${totales.neto.toFixed(2)}</th>
                          <th colSpan="2"></th>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            );
          })}
        </>
      )}
    </div>
  );
};

export default LibroVentas;