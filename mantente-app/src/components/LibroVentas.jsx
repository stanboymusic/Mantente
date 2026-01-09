import React, { useMemo, useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Alert, Button, Table, Card, Row, Col, Tabs, Tab } from 'react-bootstrap';
import jsPDF from 'jspdf';
import { Modal, Form } from 'react-bootstrap';

const LibroVentas = () => {
  const { user, isPremium, ventas, perfilEmpresa, obtenerEgresos, obtenerDevoluciones, inventario, obtenerHistorialMeses, obtenerGastosFijos } = useApp();
  const [egresos, setEgresos] = useState([]);
  const [devoluciones, setDevoluciones] = useState([]);
  const [historialMeses, setHistorialMeses] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportConfig, setExportConfig] = useState({ tipo: 'general', mes: '' });
  const [expandedRows, setExpandedRows] = useState(new Set());

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

  // Formatear mes de YYYY-MM-DD a "NombreMes YYYY"
  const formatearMes = (mesString) => {
    if (!mesString) return 'Mes Desconocido';
    try {
      const [year, month] = mesString.split('-');
      const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
      ];
      return `${meses[parseInt(month) - 1]} ${year}`;
    } catch (e) {
      return mesString;
    }
  };


  const empresa = {
    nombre: perfilEmpresa?.nombre || 'Tu Empresa',
    identificacion_fiscal: perfilEmpresa?.identificacion_fiscal || '',
    email: perfilEmpresa?.email || '',
    telefono: perfilEmpresa?.telefono || '',
    direccion: perfilEmpresa?.direccion || '',
  };

  // Agrupar ventas, egresos y devoluciones por mes
  const ventasPorMes = useMemo(() => {
    const agrupadas = {};
    ventas.forEach(venta => {
      const mes = venta.mes_cierre || (new Date().toISOString().slice(0, 7) + "-01");
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
      const mes = egreso.mes_cierre || (new Date().toISOString().slice(0, 7) + "-01");
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
      const mes = dev.mes_cierre || (new Date().toISOString().slice(0, 7) + "-01");
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

  // Exportar a PDF Overhauled with Brand Guidelines
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

    // Pre-cargar logo de la marca (de la carpeta material visual)
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
      // Header: Logo Mantente (Esquina superior izquierda)
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
      
      // Nombre de la Empresa y Datos (Derecha)
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

      // Footer: Slogan y Branding
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
        
        // Line separator
        doc.setDrawColor(245, 245, 245);
        doc.line(10, y + 1, pageWidth - 10, y + 1);
        y += 6;
      });
      y += 5;
    };

    const config = exportConfig;
    const mesSeleccionado = config.tipo === 'mes' ? config.mes : null;
    const tituloReporte = mesSeleccionado ? `REPORTE MENSUAL - ${formatearMes(mesSeleccionado)}` : 'REPORTE GENERAL HISTÓRICO';

    // Initial Decoration
    drawPageDecoration();
    doc.setFontSize(18);
    doc.setTextColor(brand.dark[0], brand.dark[1], brand.dark[2]);
    doc.text(tituloReporte, pageWidth / 2, 40, null, null, 'center');

    // 1. SECCION INGRESOS
    drawSectionTitle('INGRESOS (VENTAS)', brand.gold);
    const mesesParaExportar = mesSeleccionado ? [mesSeleccionado] : Object.keys(ventasPorMes).sort().reverse();
    
    // [Codigo, Fecha, Producto, Cant, Monto, Neto]
    const salesWidths = [45, 35, 50, 15, 22, 23]; 

    mesesParaExportar.forEach(mes => {
      const ventasMes = ventasPorMes[mes] || [];
      if (ventasMes.length > 0) {
        checkPage(15);
        doc.setFontSize(11);
        doc.setTextColor(brand.brown[0], brand.brown[1], brand.brown[2]);
        doc.text(`Mes: ${formatearMes(mes)}`, 10, y);
        y += 7;

        const headers = ['Código', 'Fecha', 'Producto', 'Cant.', 'Monto', 'Neto'];
        const rows = ventasMes.map(v => [
          v.codigo_venta || 'N/A',
          v.fecha ? v.fecha.split('T')[0] : '',
          v.producto || '',
          v.cantidad || 0,
          `$${(v.monto || 0).toFixed(2)}`,
          `$${((v.monto || 0) - (v.descuento || 0)).toFixed(2)}`
        ]);
        
        drawTable(headers, rows, y, salesWidths);
        
        const totales = calcularTotalesMes(ventasMes);
        doc.setFontSize(10);
        doc.setTextColor(brand.gold[0], brand.gold[1], brand.gold[2]);
        doc.text(`TOTAL MES: $${totales.neto.toFixed(2)}`, pageWidth - 10, y, null, null, 'right');
        y += 12;
      }
    });

    // 2. SECCION EGRESOS
    doc.addPage();
    drawPageDecoration();
    y = 40;
    drawSectionTitle('EGRESOS', brand.brown);
    const mesesEgresos = mesSeleccionado ? [mesSeleccionado] : Object.keys(egresosPorMes).sort().reverse();
    const expenseWidths = [110, 40, 40];

    mesesEgresos.forEach(mes => {
      const eMes = egresosPorMes[mes] || [];
      if (eMes.length > 0) {
        checkPage(15);
        doc.setFontSize(11);
        doc.setTextColor(brand.brown[0], brand.brown[1], brand.brown[2]);
        doc.text(`Mes: ${formatearMes(mes)}`, 10, y);
        y += 7;

        const headers = ['Descripción', 'Monto', 'Fecha'];
        const rows = eMes.map(e => [
          e.descripcion || '',
          `$${(e.monto || 0).toFixed(2)}`,
          e.fecha ? e.fecha.split('T')[0] : ''
        ]);
        drawTable(headers, rows, y, expenseWidths);
        const total = calcularTotalesEgresosMes(eMes);
        doc.setTextColor(brand.brown[0], brand.brown[1], brand.brown[2]);
        doc.text(`TOTAL EGRESOS: $${total.toFixed(2)}`, pageWidth - 10, y, null, null, 'right');
        y += 12;
      }
    });

    // 3. SECCION BALANCE
    doc.addPage();
    drawPageDecoration();
    y = 40;
    drawSectionTitle('BALANCE FINAL', brand.dark);
    const mesesBalance = mesSeleccionado ? [mesSeleccionado] : todosLosMeses;
    mesesBalance.forEach(mes => {
      const balance = calcularBalanceFinalMes(mes);
      checkPage(30);
      doc.setFontSize(11);
      doc.setTextColor(brand.brown[0], brand.brown[1], brand.brown[2]);
      doc.text(`Mes: ${formatearMes(mes)}`, 10, y);
      y += 7;
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.text(`Ingresos: $${balance.ingresos.toFixed(2)} | Egresos: -$${balance.egresos.toFixed(2)} | Fijos: -$${balance.gastosFijos.toFixed(2)}`, 15, y);
      y += 5;
      doc.setFontSize(10);
      doc.setTextColor(brand.gold[0], brand.gold[1], brand.gold[2]);
      doc.text(`BALANCE: $${balance.balanceFinal.toFixed(2)}`, 15, y);
      y += 12;
    });

    // 4. SECCION DEVOLUCIONES (Solo Premium)
    if (isPremium) {
      doc.addPage();
      drawPageDecoration();
      y = 40;
      drawSectionTitle('DEVOLUCIONES APROBADAS', brand.gold);
      const mesesDev = mesSeleccionado ? [mesSeleccionado] : Object.keys(devolucionesPorMes).sort().reverse();
      const devWidths = [40, 45, 25, 45, 35];

      mesesDev.forEach(mes => {
        const dMes = devolucionesPorMes[mes] || [];
        if (dMes.length > 0) {
          checkPage(15);
          doc.setFontSize(11);
          doc.setTextColor(brand.brown[0], brand.brown[1], brand.brown[2]);
          doc.text(`Mes: ${formatearMes(mes)}`, 10, y);
          y += 7;

          const headers = ['Código', 'Producto', 'Monto', 'Motivo', 'Fecha'];
          const rows = dMes.map(d => [
            d.codigo || 'N/A',
            d.producto || '',
            `$${(d.monto || 0).toFixed(2)}`,
            d.motivo || '',
            d.fecha ? d.fecha.split('T')[0] : ''
          ]);
          drawTable(headers, rows, y, devWidths);
          const total = calcularTotalesDevolucionesMes(dMes);
          doc.setTextColor(brand.gold[0], brand.gold[1], brand.gold[2]);
          doc.text(`TOTAL DEVOLUCIONES: $${total.toFixed(2)}`, pageWidth - 10, y, null, null, 'right');
          y += 12;
        }
      });
    }

    // 5. SECCION INVENTARIO
    doc.addPage();
    drawPageDecoration();
    y = 40;
    drawSectionTitle('ESTADO DEL INVENTARIO ACTUAL', brand.brown);
    if (inventario && inventario.length > 0) {
      const invWidths = [35, 55, 20, 25, 25, 30];
      const headers = ['Código', 'Producto', 'Cant.', 'Costo', 'Venta', 'Total'];
      const rows = inventario.map(item => [
        item.codigo || 'N/A',
        item.nombre || '',
        item.cantidad || 0,
        `$${(item.precio_compra || 0).toFixed(2)}`,
        `$${(item.precio || 0).toFixed(2)}`,
        `$${((item.cantidad || 0) * (item.precio || 0)).toFixed(2)}`
      ]);
      drawTable(headers, rows, y, invWidths);
      const totalInv = inventario.reduce((acc, item) => acc + ((item.cantidad || 0) * (item.precio || 0)), 0);
      doc.setFontSize(10);
      doc.setTextColor(brand.gold[0], brand.gold[1], brand.gold[2]);
      doc.text(`VALOR TOTAL INVENTARIO: $${totalInv.toFixed(2)}`, pageWidth - 10, y, null, null, 'right');
    }

    const fileName = mesSeleccionado ? `Libro_Ventas_${mesSeleccionado}.pdf` : 'Libro_Ventas_General.pdf';
    doc.save(fileName);
    setShowExportModal(false);
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
            onClick={() => setShowExportModal(true)}
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
                      <h5 className="mb-0 mantente-text-brown">📋 Mes: {formatearMes(mes)} | {totales.cantidad_transacciones} transacciones | Neto: ${totales.neto.toFixed(2)}</h5>
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
                              {ventasMes.flatMap((venta) => {
                                const isExpanded = expandedRows.has(venta.id);
                                const hasMultipleProducts = venta.productos_json && Array.isArray(venta.productos_json) && venta.productos_json.length > 1;
                                const rows = [
                                  <tr key={venta.id} onClick={() => {
                                    const newExpanded = new Set(expandedRows);
                                    if (newExpanded.has(venta.id)) {
                                      newExpanded.delete(venta.id);
                                    } else {
                                      newExpanded.add(venta.id);
                                    }
                                    setExpandedRows(newExpanded);
                                  }} style={{ cursor: hasMultipleProducts ? 'pointer' : 'default' }}>
                                    <td><strong style={{ color: 'var(--mantente-gold)' }}>{venta.codigo_venta || 'N/A'}</strong></td>
                                    <td>{new Date(venta.fecha || venta.created).toLocaleDateString('es-ES')}</td>
                                    <td>
                                      {hasMultipleProducts ? 'varios' : venta.producto}
                                      {hasMultipleProducts && (isExpanded ? ' ▲' : ' ▼')}
                                    </td>
                                    <td>{venta.cantidad}</td>
                                    <td>${venta.monto?.toFixed(2) || '0.00'}</td>
                                    <td>${venta.descuento?.toFixed(2) || '0.00'}</td>
                                    <td>${((venta.monto || 0) - (venta.descuento || 0)).toFixed(2)}</td>
                                    <td>{venta.cliente}</td>
                                  </tr>
                                ];
                                if (isExpanded && hasMultipleProducts) {
                                  venta.productos_json.forEach((prod, idx) => {
                                    rows.push(
                                      <tr key={`${venta.id}-prod-${idx}`} style={{ backgroundColor: '#f8f9fa' }}>
                                        <td></td>
                                        <td></td>
                                        <td>{prod.nombre}</td>
                                        <td>{prod.cantidad}</td>
                                        <td>${(prod.precio_unitario || 0).toFixed(2)}</td>
                                        <td></td>
                                        <td>${(prod.subtotal || 0).toFixed(2)}</td>
                                        <td></td>
                                      </tr>
                                    );
                                  });
                                }
                                return rows;
                              })}
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
                      <h5 className="mb-0 mantente-text-brown">📋 Mes: {formatearMes(mes)} | Total: ${totalEgresos.toFixed(2)}</h5>
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
                                <td>{new Date(egreso.fecha || egreso.created).toLocaleDateString('es-ES')}</td>
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
                    <h5 className="mb-0 mantente-text-brown">📋 Mes: {formatearMes(mes)}</h5>
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
          {isPremium && (
            <Tab eventKey="devoluciones" title="🔄 Devoluciones Aprobadas">
              {Object.keys(devolucionesPorMes).length > 0 ? (
                Object.keys(devolucionesPorMes).sort().reverse().map(mes => {
                  const devolucionesMes = devolucionesPorMes[mes] || [];
                  const totalDevoluciones = calcularTotalesDevolucionesMes(devolucionesMes);
                  return (
                    <Card key={mes} className="mb-4">
                      <Card.Header style={{ backgroundColor: 'rgba(33, 150, 243, 0.1)' }}>
                        <h5 className="mb-0 mantente-text-brown">📋 Mes: {formatearMes(mes)} | Total: ${totalDevoluciones.toFixed(2)}</h5>
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
                                  <td>{new Date(dev.fecha || dev.created).toLocaleDateString('es-ES')}</td>
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
          )}

          <Tab eventKey="inventario" title="📦 Estado del Inventario">
            <div className="row mb-4">
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm bg-primary text-white p-3">
                  <h6 className="opacity-75">Inversión (Costo)</h6>
                  <h3 className="fw-bold mb-0">${inventario.reduce((acc, p) => acc + (Number(p.precio_compra || 0) * Number(p.cantidad || 0)), 0).toLocaleString()}</h3>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm bg-success text-white p-3">
                  <h6 className="opacity-75">Valor de Venta (Potencial)</h6>
                  <h3 className="fw-bold mb-0">${inventario.reduce((acc, p) => acc + (Number(p.precio || 0) * Number(p.cantidad || 0)), 0).toLocaleString()}</h3>
                </div>
              </div>
              <div className="col-md-4 mb-3">
                <div className="card border-0 shadow-sm bg-info text-white p-3">
                  <h6 className="opacity-75">Ganancia Estimada</h6>
                  <h3 className="fw-bold mb-0">${(inventario.reduce((acc, p) => acc + (Number(p.precio || 0) * Number(p.cantidad || 0)), 0) - inventario.reduce((acc, p) => acc + (Number(p.precio_compra || 0) * Number(p.cantidad || 0)), 0)).toLocaleString()}</h3>
                </div>
              </div>
            </div>
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
                          <th>Código</th>
                          <th>Producto</th>
                          <th>Cantidad</th>
                          <th>Precio Compra</th>
                          <th>Precio Venta</th>
                          <th>Valor Total (Venta)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inventario.map((item, idx) => (
                          <tr key={idx}>
                            <td className="text-muted small">{item.codigo || 'N/A'}</td>
                            <td>{item.nombre}</td>
                            <td className="fw-bold">{item.cantidad}</td>
                            <td>${item.precio_compra?.toFixed(2) || '0.00'}</td>
                            <td>${item.precio?.toFixed(2) || '0.00'}</td>
                            <td className="text-success fw-bold">${((item.cantidad || 0) * (item.precio || 0)).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ backgroundColor: 'rgba(226, 181, 78, 0.1)' }}>
                        <tr>
                          <th colSpan="5">VALOR TOTAL DEL INVENTARIO (POTENCIAL VENTA)</th>
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

      {/* Modal de Configuración de Exportación */}
      <Modal show={showExportModal} onHide={() => setShowExportModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Configurar Exportación PDF</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>¿Qué desea exportar?</Form.Label>
              <Form.Check 
                type="radio" 
                label="Libro general (todos los tiempos)" 
                name="exportType" 
                checked={exportConfig.tipo === 'general'}
                onChange={() => setExportConfig({ ...exportConfig, tipo: 'general' })}
              />
              <Form.Check 
                type="radio" 
                label="Solo un mes específico" 
                name="exportType"
                checked={exportConfig.tipo === 'mes'}
                onChange={() => setExportConfig({ ...exportConfig, tipo: 'mes' })}
              />
            </Form.Group>

            {exportConfig.tipo === 'mes' && (
              <Form.Group className="mb-3">
                <Form.Label>Seleccione el mes</Form.Label>
                {todosLosMeses.length > 0 ? (
                  <Form.Select 
                    value={exportConfig.mes} 
                    onChange={(e) => setExportConfig({ ...exportConfig, mes: e.target.value })}
                  >
                    <option value="">Seleccione un mes...</option>
                    {todosLosMeses.map(mes => (
                      <option key={mes} value={mes}>{formatearMes(mes)}</option>
                    ))}
                  </Form.Select>
                ) : (
                  <Alert variant="warning" className="py-2 small">No hay meses con registros para exportar.</Alert>
                )}
              </Form.Group>
            )}
            <Alert variant="info" className="small">
              El reporte incluirá todas las secciones: Ingresos, Egresos, Balance y Estado de Inventario.
            </Alert>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowExportModal(false)}>
            Cancelar
          </Button>
          <Button 
            variant="success" 
            onClick={handleExportarPDF}
            disabled={exportConfig.tipo === 'mes' && !exportConfig.mes}
          >
            Generar PDF
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default LibroVentas;