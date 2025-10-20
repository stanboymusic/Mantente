import React, { useState, useEffect, useMemo } from 'react';
import { useAppContext } from '../context/AppContext';

const Ventas = () => {
  // ✅ Usamos allVentas (historial completo)
  const { inventario, allVentas, mesActual, registrarVenta, calcularBalance } = useAppContext();
  
  // --- Estados y Hooks ---
  const [balance, setBalance] = useState(calcularBalance());

  // Función de ayuda para el formato de moneda
  const formatCurrency = (value) => {
    // Garantizamos que el valor es un número antes de formatear
    const safeValue = parseFloat(value) || 0;
    return safeValue.toLocaleString('es-ES', { minimumFractionDigits: 2 });
  };

  useEffect(() => {
    // Recalcula el balance (ventas del mes actual) cuando allVentas cambia
    setBalance(calcularBalance());
  }, [allVentas, inventario, calcularBalance]); 

  const [ventaActual, setVentaActual] = useState({ productoId: '', cantidad: 1, cliente: '', descuento: 0 });
  const [filtroFecha, setFiltroFecha] = useState('');
  
  // Filtrado: Usa 'allVentas' (historial completo) para la tabla.
  const ventasFiltradas = useMemo(() => {
    const listToFilter = allVentas || [];

    let filteredList = listToFilter;

    if (filtroFecha) {
      filteredList = filteredList.filter(v => v.fecha?.startsWith(filtroFecha));
    }

    // Siempre ordenar por fecha descendente
    return filteredList.sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); 
  }, [allVentas, filtroFecha]);


  // Calculamos el total de descuentos (solo ventas del mes actual)
  // Utilizamos la función formatCurrency para mostrar valores seguros en el resumen
  const totalDescuentosMes = mesActual.ventasMes.reduce((sum, v) => sum + (parseFloat(v.descuento) || 0), 0);
  const gananciaNetaMes = balance.utilidadNeta;

  // --- Manejadores de Eventos ---

  const handleInputChange = (e) => {
    setVentaActual({ ...ventaActual, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ventaActual.productoId || !ventaActual.cantidad || parseInt(ventaActual.cantidad) <= 0) {
      alert("Selecciona un producto y una cantidad válida.");
      return;
    }

    const success = await registrarVenta(ventaActual);
    if (success) {
      setVentaActual({ productoId: '', cantidad: 1, cliente: '', descuento: 0 });
    }
  };
  
  // --- Renderizado ---

  return (
    <div className="p-4">
      <h1 className="mb-4">Registro de Ventas</h1>

      {/* --- Formulario de Nueva Venta --- */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Registrar Nueva Venta</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            
            {/* Producto */}
            <div className="col-md-4">
              <label className="form-label">Producto</label>
              <select 
                className="form-select" 
                name="productoId" 
                value={ventaActual.productoId} 
                onChange={handleInputChange} 
                required
              >
                <option value="">Selecciona un producto...</option>
                {inventario.map(p => (
                  <option key={p.id} value={p.id} disabled={p.stock <= 0}>
                    {p.nombre} (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            {/* Cantidad */}
            <div className="col-md-2">
              <label className="form-label">Cantidad</label>
              <input 
                type="number" 
                className="form-control" 
                name="cantidad" 
                value={ventaActual.cantidad} 
                onChange={handleInputChange} 
                min="1" 
                required 
              />
            </div>
            
            {/* Cliente */}
            <div className="col-md-3">
              <label className="form-label">Cliente (Opcional)</label>
              <input 
                type="text" 
                className="form-control" 
                name="cliente" 
                value={ventaActual.cliente} 
                onChange={handleInputChange} 
              />
            </div>
            
            {/* Descuento */}
            <div className="col-md-2">
              <label className="form-label">Descuento ($)</label>
              <input 
                type="number" 
                className="form-control" 
                name="descuento" 
                value={ventaActual.descuento} 
                onChange={handleInputChange} 
                min="0" 
              />
            </div>

            {/* Botón */}
            <div className="col-md-1 d-flex align-items-end">
              <button type="submit" className="btn btn-success w-100">Vender</button>
            </div>

          </form>
        </div>
      </div>
      
      {/* --- Resumen Financiero del Mes Actual --- */}
      <div className="mb-4">
        <div className="card">
          <div className="card-body">
            <h5>Resumen Financiero del Mes Actual ({mesActual.mes})</h5>
            <div className="row text-center">
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6>Total Ventas</h6>
                    <h3 className="text-success">${formatCurrency(balance?.totalVentas)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6>Total Descuentos</h6>
                    <h3 className="text-warning">-${formatCurrency(totalDescuentosMes)}</h3>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card bg-light">
                  <div className="card-body">
                    <h6>Utilidad Neta</h6>
                    <h3 className={gananciaNetaMes >= 0 ? 'text-success' : 'text-danger'}>
                      ${formatCurrency(gananciaNetaMes)}
                    </h3>
                  </div>
                </div>
              </div>
            </div>
            <button className="btn btn-secondary mt-3" onClick={() => window.location.href = '/'}>Ver Dashboard para Cerrar Mes</button>
          </div>
        </div>
      </div>

      {/* --- Historial de Ventas --- */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Historial de Ventas ({ventasFiltradas.length} registros)</h5>
          
          <div className="row mb-3">
            <div className="col-md-4">
              <label className="form-label">Filtrar por Fecha (YYYY-MM-DD)</label>
              <input 
                type="date" 
                className="form-control" 
                value={filtroFecha} 
                onChange={(e) => setFiltroFecha(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="table-responsive">
            <table className="table table-striped table-hover small">
              <thead className="table-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Total</th>
                  <th>Cliente</th>
                  <th>Descuento</th>
                </tr>
              </thead>
              <tbody>
                {ventasFiltradas.length > 0 ? (
                  ventasFiltradas.map(v => {
                    // Usamos v.productoId de la venta para encontrar el producto en inventario
                    const producto = inventario.find(p => p.id === v.productoId);
                    return (
                      <tr key={v.id}>
                        {/* ✅ Fecha: Manejar si es null/undefined */}
                        <td>{v.fecha ? new Date(v.fecha).toLocaleDateString('es-ES') : 'N/A'}</td>
                        
                        {/* ✅ Producto: Mostrar nombre o mensaje de "Eliminado" */}
                        <td>{producto ? producto.nombre : 'Producto Eliminado'}</td>
                        
                        {/* ✅ Cantidad: Aseguramos que sea un número visible, si no, N/A */}
                        <td>{v.cantidad || 'N/A'}</td>
                        
                        {/* Total */}
                        <td className="text-success">**${formatCurrency(v.total)}**</td>
                        
                        {/* ✅ Cliente: Manejar si es null/undefined */}
                        <td>{v.cliente || 'N/A'}</td>
                        
                        {/* Descuento: Usamos formatCurrency */}
                        <td>${formatCurrency(v.descuento)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">No hay registros de ventas para mostrar.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </div>
      </div>
      
    </div>
  );
};

export default Ventas;