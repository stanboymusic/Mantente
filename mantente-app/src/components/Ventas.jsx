// src/components/Ventas.jsx

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '../context/AppContext';

const Ventas = () => {
  // ✅ Usamos allVentas (historial completo) e inventarioMap
  const { 
    inventario, 
    allVentas, 
    mesActual, 
    registrarVenta, 
    calcularBalance,
    inventarioMap // ✅ Usamos el mapa del contexto
  } = useAppContext();
  
  // --- Estados y Hooks ---
  const [balance, setBalance] = useState(calcularBalance());

  const formatCurrency = useCallback((value) => {
    const safeValue = parseFloat(value) || 0;
    return safeValue.toLocaleString('es-ES', { minimumFractionDigits: 2 });
  }, []);

  // Recalcula el balance (ventas del mes actual)
  useEffect(() => {
    setBalance(calcularBalance());
  }, [allVentas, inventario, calcularBalance]); 

  // --- Formulario de Registro de Venta ---
  const [ventaActual, setVentaActual] = useState({ 
    productoId: '', 
    cantidad: 1, 
    cliente: '', 
    descuento: 0 
  });
  const [filtroFecha, setFiltroFecha] = useState('');
  
  const productoSeleccionado = useMemo(() => {
    return inventario.find(p => p.id === ventaActual.productoId);
  }, [ventaActual.productoId, inventario]);

  const handleVentaChange = (e) => {
    let { name, value, type } = e.target;
    
    if (type === 'number') {
        // Permitir valores decimales para descuento, enteros para cantidad
        value = name === 'cantidad' ? parseInt(value, 10) : parseFloat(value);
        if (isNaN(value)) {
            value = 0;
        }
    }
    
    setVentaActual(prev => ({ ...prev, [name]: value }));
  };

  // Lógica para registrar la venta
  const handleRegistroVenta = async (e) => {
    e.preventDefault();
    
    if (!productoSeleccionado || ventaActual.cantidad <= 0) {
      alert('Selecciona un producto y una cantidad válida.');
      return;
    }

    // ✅ CORRECCIÓN: El costo se calcula en AppContext
    // Solo necesitamos enviar los datos del formulario
    const dataVenta = {
      productoId: productoSeleccionado.id, // ✅ CORREGIDO a camelCase
      cantidad: ventaActual.cantidad,
      cliente: ventaActual.cliente,
      descuento: ventaActual.descuento,
    };

    const success = await registrarVenta(dataVenta);
    
    if (success) {
      alert(`Venta de ${ventaActual.cantidad} x ${productoSeleccionado.nombre} registrada.`);
      setVentaActual({ productoId: '', cantidad: 1, cliente: '', descuento: 0 });
    }
  };


  // --- Filtrado y Cálculos para la Visualización ---

  const ventasFiltradas = useMemo(() => {
    const listToFilter = allVentas || []; 

    let filteredList = listToFilter;

    if (filtroFecha) {
      filteredList = filteredList.filter(v => v.fecha?.startsWith(filtroFecha));
    }
    
    filteredList.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    return filteredList;
  }, [allVentas, filtroFecha]); 
  
  // Total de ventas del mes (del balance)
  const totalVentasMes = balance.totalVentas;

  // --- Renderizado ---

  return (
    <div className="p-4">
      <h1 className="mb-4">Registro y Historial de Ventas</h1>

      {/* --- Indicadores Clave del Mes Actual --- */}
      <div className="row mb-4">
        <div className="col-md-4">
          <div className="card bg-success text-white">
            <div className="card-body">
              <h5 className="card-title">Ventas del Mes ({mesActual.mes.slice(5, 7)})</h5>
              <p className="card-text display-4">${formatCurrency(totalVentasMes)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-info text-white">
            <div className="card-body">
              <h5 className="card-title">Utilidad Bruta</h5>
              {/* Utilidad Bruta = Ventas - Costo de Ventas */}
              <p className="card-text display-4">${formatCurrency(balance.utilidadBruta)}</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card bg-primary text-white">
            <div className="card-body">
              <h5 className="card-title">Utilidad Neta</h5>
               {/* Utilidad Neta = Utilidad Bruta - Gastos Fijos */}
              <p className="card-text display-4">${formatCurrency(balance.utilidadNeta)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Formulario de Venta --- */}
      <div className="card mb-5">
        <div className="card-body">
          <h5 className="card-title">Registrar Nueva Venta</h5>
          <form onSubmit={handleRegistroVenta} className="row g-3">
            
            <div className="col-md-4">
              <label htmlFor="productoId" className="form-label">Producto</label>
              <select 
                id="productoId" 
                name="productoId" 
                className="form-select" 
                value={ventaActual.productoId} 
                onChange={handleVentaChange}
                required
              >
                <option value="">Selecciona un producto...</option>
                {(inventario || []).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} (${formatCurrency(p.precio)}) (Stock: {p.stock})
                  </option>
                ))}
              </select>
            </div>

            <div className="col-md-2">
              <label htmlFor="cantidad" className="form-label">Cantidad</label>
              <input 
                type="number" 
                id="cantidad" 
                name="cantidad" 
                className="form-control" 
                value={ventaActual.cantidad} 
                onChange={handleVentaChange} 
                min="1"
                step="1"
                required
              />
            </div>
            
            <div className="col-md-3">
              <label htmlFor="cliente" className="form-label">Cliente (Opcional)</label>
              <input 
                type="text" 
                id="cliente" 
                name="cliente" 
                className="form-control" 
                value={ventaActual.cliente} 
                onChange={handleVentaChange} 
                placeholder="Nombre del cliente"
              />
            </div>
            
            <div className="col-md-2">
              <label htmlFor="descuento" className="form-label">Descuento ($)</label>
              <input 
                type="number" 
                id="descuento" 
                name="descuento" 
                className="form-control" 
                value={ventaActual.descuento} 
                onChange={handleVentaChange} 
                min="0"
                step="0.01"
              />
            </div>

            <div className="col-md-1 d-flex align-items-end">
              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={!productoSeleccionado || ventaActual.cantidad <= 0 || ventaActual.cantidad > (productoSeleccionado?.stock || 0)}
              >
                Vender
              </button>
            </div>
          </form>

          {/* Indicador de Total de Venta */}
          {productoSeleccionado && (
            <div className="mt-3 text-end">
              {ventaActual.cantidad > productoSeleccionado.stock && (
                <p className='text-danger fw-bold'>Stock insuficiente (Stock: {productoSeleccionado.stock})</p>
              )}
              **Total a Pagar:** <span className="text-success fs-4">
                ${formatCurrency((parseFloat(productoSeleccionado.precio) || 0) * (ventaActual.cantidad || 0) - (parseFloat(ventaActual.descuento) || 0))}
              </span>
            </div>
          )}

        </div>
      </div>

      {/* --- Historial de Ventas --- */}
      <div className="card">
        <div className="card-body">
          
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Historial de Ventas</h5>
            <div className="col-md-3">
              <input 
                type="month" 
                className="form-control" 
                value={filtroFecha} 
                onChange={(e) => setFiltroFecha(e.target.value)}
              />
            </div>
          </div>

          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle">
              <thead className="table-dark">
                <tr>
                  <th>Fecha</th>
                  <th>Producto</th>
                  <th>Cantidad</th>
                  <th>Total Venta</th>
                  <th>Costo Total</th>
                  <th>Cliente</th>
                  <th>Descuento</th>
                </tr>
              </thead>
              <tbody>
                {(ventasFiltradas.length > 0) ? (
                  ventasFiltradas.map(v => {
                    // ✅ CORRECCIÓN: Usar 'v.productoId' y el 'inventarioMap'
                    const producto = inventarioMap[v.productoId]; 
                    
                    return (
                      <tr key={v.id}>
                        <td>{v.fecha ? new Date(v.fecha).toLocaleDateString('es-ES') : 'N/A'}</td>
                        
                        <td>{producto ? producto.nombre : 'Producto Eliminado'}</td>
                        
                        <td>{v.cantidad || 'N/A'}</td>
                        
                        <td className="text-success">**${formatCurrency(v.total)}**</td>
                        
                        {/* ✅ AÑADIDO: Costo de la venta */}
                        <td className="text-danger">(${formatCurrency(v.costoTotal)})</td>

                        <td>{v.cliente || 'N/A'}</td>
                        
                        <td>${formatCurrency(v.descuento)}</td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-muted">No hay registros de ventas para mostrar en este período.</td>
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