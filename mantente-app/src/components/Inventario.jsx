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
    stock: '',
    categoria: '', // Asume que este campo existe en el esquema de PocketBase
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
      stock: producto.stock,
      categoria: producto.categoria || '', // Inicializa seguro
    });
    setEditandoId(producto.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelarEdicion = () => {
    setFormState({
      nombre: '',
      precio: '',
      stock: '',
      categoria: '',
    });
    setEditandoId(null);
  };
  
  useEffect(() => {
    if (!editandoId) {
        cancelarEdicion();
    }
  }, [inventario]);


  // --- Función de Envío del Formulario (Crear/Actualizar) ---

  const handleSubmit = async (e) => { 
    e.preventDefault(); 
    
    if (!formState.nombre || formState.precio === '' || formState.stock === '') {
        alert("Por favor, llena todos los campos: Nombre, Precio y Stock.");
        return;
    }

    const data = {
        nombre: formState.nombre,
        // ✅ CORRECCIÓN 1: Si no usas categoría en el formulario, al menos envíala como '' para evitar Bad Request.
        categoria: formState.categoria || '', 
        precio: parseFloat(formState.precio) || 0, 
        stock: parseInt(formState.stock, 10) || 0, 
    };

    if (editandoId) {
      await actualizarProducto(editandoId, data);
    } else {
      await crearProducto(data); // El error 400 se debe a los datos aquí
    }
    
    cancelarEdicion(); 
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
            <div className="col-md-5">
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
            
            {/* Precio */}
            <div className="col-md-3">
              <label className="form-label">Precio de Venta</label>
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
                  <th>Precio Venta</th>
                  <th>Stock</th>
                  <th>Valor Total (Stock * Precio)</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {inventario.length > 0 ? (
                  inventario.map(p => (
                    <tr key={p.id}>
                      <td>{p.nombre}</td>
                      <td>${formatCurrency(p.precio)}</td>
                      <td className={p.stock < 5 ? 'text-danger fw-bold' : ''}>
                        {p.stock}
                      </td>
                      <td>${formatCurrency(p.stock * p.precio)}</td>
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
                    <td colSpan="5" className="text-center text-muted">No hay productos en el inventario.</td>
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