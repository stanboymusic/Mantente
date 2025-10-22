// src/components/Inventario.jsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const Inventario = () => {
  const { 
    inventario, 
    crearProducto, 
    actualizarProducto, 
    eliminarProducto, 
    loading 
  } = useAppContext();

  const [formState, setFormState] = useState({
    nombre: '',
    precio: '',
    costo: '', // ✅ AÑADIDO
    stock: '',
    categoria: '', 
  });

  const [editandoId, setEditandoId] = useState(null);

  // --- Manejo del Estado del Formulario ---

  const handleInputChange = (e) => {
    setFormState({ 
      ...formState, 
      [e.target.name]: e.target.value 
    });
  };

  // --- Lógica de Edición y Cancelación ---

  const iniciarEdicion = (producto) => {
    setFormState({
      nombre: producto.nombre,
      precio: producto.precio,
      costo: producto.costo || '', // ✅ AÑADIDO
      stock: producto.stock,
      categoria: producto.categoria || '', 
    });
    setEditandoId(producto.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setFormState({
      nombre: '',
      precio: '',
      costo: '', // ✅ AÑADIDO
      stock: '',
      categoria: '',
    });
    setEditandoId(null);
  };
  
  // Limpia el formulario si la lista de inventario cambia (ej: después de eliminar)
  // (Este efecto es un poco agresivo, pero mantiene la lógica original)
  useEffect(() => {
    if (!editandoId) {
        cancelarEdicion();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventario]);


  // --- Función de Envío del Formulario (Crear/Actualizar) ---

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    
    // ✅ Validamos costo también
    if (!formState.nombre || formState.precio === '' || formState.costo === '' || formState.stock === '') {
        alert("Por favor, llena todos los campos: Nombre, Precio, Costo y Stock.");
        return;
    }

    const data = {
        nombre: formState.nombre,
        categoria: formState.categoria || '', 
        precio: parseFloat(formState.precio) || 0, 
        costo: parseFloat(formState.costo) || 0, // ✅ AÑADIDO
        stock: parseInt(formState.stock, 10) || 0, 
    };

    let success = false;
    
    if (editandoId) {
       // ✅ CORRECCIÓN CRÍTICA: Pasar el ID dentro del objeto 'data'
       // 'actualizarProducto' apunta a 'upsertProducto' que espera el ID en 'data.id'
       success = await actualizarProducto({ ...data, id: editandoId });
    } else {
       success = await crearProducto(data); 
    }
    
    if (success) {
        cancelarEdicion(); 
    }
  };
  
  const formatCurrency = (value) => {
    const safeValue = parseFloat(value) || 0;
    return safeValue.toLocaleString('es-ES', { minimumFractionDigits: 2 });
  };

  // --- Renderizado ---

  if (loading) {
    return <div className="p-4 text-center">Cargando inventario...</div>;
  }

  return (
    <div className="p-4">
      <h1 className="mb-4">Gestión de Inventario</h1>

      {/* --- Formulario de Producto --- */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editandoId ? 'Editar Producto' : 'Agregar Nuevo Producto'}</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            
            {/* Nombre */}
            <div className="col-md-4">
              <label className="form-label">Nombre del Producto</label>
              <input 
                type="text" 
                className="form-control" 
                name="nombre" 
                value={formState.nombre} 
                onChange={handleInputChange} 
                required 
              />
            </div>
            
            {/* Costo */}
            <div className="col-md-2">
              <label className="form-label">Costo ($)</label>
              <input 
                type="number" 
                className="form-control" 
                name="costo" // ✅ AÑADIDO
                value={formState.costo} // ✅ AÑADIDO
                onChange={handleInputChange} 
                min="0"
                step="0.01" 
                required 
              />
            </div>
            
            {/* Precio */}
            <div className="col-md-2">
              <label className="form-label">Precio Venta ($)</label>
              <input 
                type="number" 
                className="form-control" 
                name="precio" 
                value={formState.precio} 
                onChange={handleInputChange} 
                min="0.01"
                step="0.01" 
                required 
              />
            </div>

            {/* Stock */}
            <div className="col-md-2">
              <label className="form-label">Stock</label>
              <input 
                type="number" 
                className="form-control" 
                name="stock" 
                value={formState.stock} 
                onChange={handleInputChange} 
                min="0"
                required 
              />
            </div>
            
            {/* Botón */}
            <div className="col-md-2 d-flex align-items-end">
              <button type="submit" className={`btn w-100 ${editandoId ? 'btn-warning' : 'btn-primary'}`}>
                {editandoId ? 'Guardar Cambios' : 'Agregar'}
              </button>
            </div>
            
            {/* Botón de Cancelar Edición (solo si editando) */}
            {editandoId && (
                <div className="col-12">
                    <button type="button" className="btn btn-outline-secondary btn-sm" onClick={cancelarEdicion}>
                        Cancelar Edición
                    </button>
                </div>
            )}
          </form>
        </div>
      </div>

      {/* --- Listado de Inventario --- */}
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Stock Actual ({inventario.length} Productos)</h5>
          
          <div className="table-responsive">
            <table className="table table-striped table-hover small">
              <thead className="table-dark">
                <tr>
                  <th>Nombre</th>
                  <th>Costo Unit.</th>
                  <th>Precio Venta</th>
                  <th>Stock</th>
                  <th>Valor Total (Costo * Stock)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventario.length > 0 ? (
                  inventario.map(p => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>${formatCurrency(p.costo)}</td> {/* ✅ AÑADIDO */}
                      <td>${formatCurrency(p.precio)}</td>
                      <td className={p.stock < 5 ? 'text-danger fw-bold' : ''}>
                        {p.stock}
                      </td>
                       {/* ✅ CORRECCIÓN: Valor de inventario basado en COSTO */}
                      <td>${formatCurrency(p.stock * p.costo)}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-info me-2" 
                          onClick={() => iniciarEdicion(p)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          onClick={() => eliminarProducto(p.id)}
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted">No hay productos en el inventario.</td>
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

export default Inventario;