import React, { useState, useEffect } from "react";
import { pb } from "../pocketbase";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const AdvancedReports = () => {
  const [reportType, setReportType] = useState("ventas");
  const [filters, setFilters] = useState({
    fechaDesde: "",
    fechaHasta: "",
    cliente: "",
    estado: "",
  });
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  const reportTypes = {
    ventas: { label: "Ventas", collection: "ventas" },
    facturas: { label: "Facturas", collection: "facturas" },
    clientes: { label: "Clientes", collection: "clientes" },
    egresos: { label: "Egresos", collection: "egreso" },
    devoluciones: { label: "Devoluciones", collection: "devoluciones" },
  };

  const generateReport = async () => {
    setLoading(true);
    try {
      let filterStr = `user_id='${pb.authStore.model.id}'`;

      if (filters.fechaDesde) {
        filterStr += ` && fecha >= '${filters.fechaDesde}'`;
      }
      if (filters.fechaHasta) {
        filterStr += ` && fecha <= '${filters.fechaHasta}'`;
      }
      if (filters.cliente) {
        filterStr += ` && cliente ~ '${filters.cliente}'`;
      }
      if (filters.estado) {
        filterStr += ` && estado = '${filters.estado}'`;
      }

      const records = await pb.collection(reportTypes[reportType].collection).getFullList({
        filter: filterStr,
      });

      setData(records);
    } catch (error) {
      toast.error("Error generando reporte");
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, reportTypes[reportType].label);
    XLSX.writeFile(wb, `${reportTypes[reportType].label}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const exportToPDF = async () => {
    const element = document.getElementById("report-table");
    const canvas = await html2canvas(element);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${reportTypes[reportType].label}_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const calculateTotals = () => {
    if (reportType === "ventas" || reportType === "facturas") {
      const total = data.reduce((sum, item) => sum + (item.total || item.monto || 0), 0);
      return { total: total.toFixed(2) };
    }
    return {};
  };

  return (
    <div className="container-fluid p-4">
      <h2>Reportes Avanzados</h2>

      <div className="row mb-4">
        <div className="col-md-3">
          <label>Tipo de Reporte</label>
          <select
            className="form-control"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
          >
            {Object.entries(reportTypes).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-md-2">
          <label>Desde</label>
          <input
            type="date"
            className="form-control"
            value={filters.fechaDesde}
            onChange={(e) => setFilters({ ...filters, fechaDesde: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <label>Hasta</label>
          <input
            type="date"
            className="form-control"
            value={filters.fechaHasta}
            onChange={(e) => setFilters({ ...filters, fechaHasta: e.target.value })}
          />
        </div>
        <div className="col-md-3">
          <label>Cliente/Buscar</label>
          <input
            type="text"
            className="form-control"
            placeholder="Buscar..."
            value={filters.cliente}
            onChange={(e) => setFilters({ ...filters, cliente: e.target.value })}
          />
        </div>
        <div className="col-md-2">
          <label>Estado</label>
          <select
            className="form-control"
            value={filters.estado}
            onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
          >
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
            <option value="pendiente">Pendiente</option>
            <option value="aprobado">Aprobado</option>
          </select>
        </div>
      </div>

      <div className="mb-3">
        <button className="btn btn-primary me-2" onClick={generateReport} disabled={loading}>
          {loading ? "Generando..." : "Generar Reporte"}
        </button>
        {data.length > 0 && (
          <>
            <button className="btn btn-success me-2" onClick={exportToExcel}>
              Exportar Excel
            </button>
            <button className="btn btn-danger" onClick={exportToPDF}>
              Exportar PDF
            </button>
          </>
        )}
      </div>

      {data.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h5>{reportTypes[reportType].label} - {data.length} registros</h5>
            {calculateTotals().total && (
              <p className="mb-0">Total: ${calculateTotals().total}</p>
            )}
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table id="report-table" className="table table-striped">
                <thead>
                  <tr>
                    {reportType === "ventas" && (
                      <>
                        <th>Código</th>
                        <th>Cliente</th>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Monto</th>
                        <th>Total</th>
                        <th>Fecha</th>
                      </>
                    )}
                    {reportType === "facturas" && (
                      <>
                        <th>Número</th>
                        <th>Cliente</th>
                        <th>Subtotal</th>
                        <th>Impuestos</th>
                        <th>Total</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </>
                    )}
                    {reportType === "clientes" && (
                      <>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Ciudad</th>
                        <th>Estado</th>
                      </>
                    )}
                    {reportType === "egresos" && (
                      <>
                        <th>Descripción</th>
                        <th>Categoría</th>
                        <th>Monto</th>
                        <th>Fecha</th>
                      </>
                    )}
                    {reportType === "devoluciones" && (
                      <>
                        <th>Cliente</th>
                        <th>Producto</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Fecha</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {data.map((item, index) => (
                    <tr key={item.id || index}>
                      {reportType === "ventas" && (
                        <>
                          <td>{item.codigo_venta}</td>
                          <td>{item.cliente}</td>
                          <td>{item.producto}</td>
                          <td>{item.cantidad}</td>
                          <td>${item.monto}</td>
                          <td>${item.total}</td>
                          <td>{item.fecha ? new Date(item.fecha).toLocaleDateString() : ""}</td>
                        </>
                      )}
                      {reportType === "facturas" && (
                        <>
                          <td>{item.numero_factura}</td>
                          <td>{item.cliente}</td>
                          <td>${item.subtotal}</td>
                          <td>${item.impuesto}</td>
                          <td>${item.total}</td>
                          <td>{item.estado}</td>
                          <td>{item.fecha ? new Date(item.fecha).toLocaleDateString() : ""}</td>
                        </>
                      )}
                      {reportType === "clientes" && (
                        <>
                          <td>{item.nombre}</td>
                          <td>{item.email}</td>
                          <td>{item.telefono}</td>
                          <td>{item.ciudad}</td>
                          <td>{item.estado}</td>
                        </>
                      )}
                      {reportType === "egresos" && (
                        <>
                          <td>{item.descripcion}</td>
                          <td>{item.categoria}</td>
                          <td>${item.monto}</td>
                          <td>{item.fecha ? new Date(item.fecha).toLocaleDateString() : ""}</td>
                        </>
                      )}
                      {reportType === "devoluciones" && (
                        <>
                          <td>{item.cliente}</td>
                          <td>{item.producto}</td>
                          <td>${item.monto}</td>
                          <td>{item.estado}</td>
                          <td>{item.fecha ? new Date(item.fecha).toLocaleDateString() : ""}</td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedReports;