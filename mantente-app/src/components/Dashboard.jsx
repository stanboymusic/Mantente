// src/components/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { useAppContext } from '../context/AppContext';
import Anuncios from './Anuncios'; 

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Definición del componente principal
const Dashboard = () => {
  const { 
    calcularBalance, 
    historialMeses, 
    cerrarMes, 
    isPremium, 
    inventario, 
    mesActual, // ✅ mesActual ya se está exportando y se usa aquí
    gastosFijos,
    actualizarSettings,
  } = useAppContext();

  // Inicializa el estado con el balance actual
  const [balance, setBalance] = useState(calcularBalance());
  const [gastosFijosInput, setGastosFijosInput] = useState(gastosFijos);

  // --- 1. Sincroniza el balance cuando cambian los datos ---
  useEffect(() => {
    // Si la aplicación se carga con datos, recalcula
    setBalance(calcularBalance());
  }, [inventario, mesActual, gastosFijos, calcularBalance]);
  
  // --- 2. Sincroniza el input de Gastos Fijos ---
  useEffect(() => {
    setGastosFijosInput(gastosFijos);
  }, [gastosFijos]);

  // --- 3. Manejadores de Eventos ---

  const handleUpdateGastosFijos = async () => {
    const nuevoValor = parseFloat(gastosFijosInput) || 0;
    await actualizarSettings({ gastosFijos: nuevoValor });
    alert("Gastos fijos actualizados.");
  };

  const handleCerrarMes = async () => {
    if (window.confirm('¿Estás seguro de cerrar el mes actual? Esto registrará la utilidad y borrará las ventas del mes.')) {
        const success = await cerrarMes(balance);

        if (success) {
            alert(`Mes de ${mesActual?.mes} cerrado con éxito. Historial guardado.`);
        } else {
            // El error de permisos ya está gestionado dentro de la función cerrarMes
        }
    }
  };

  // --- 4. Lógica del Gráfico (CORREGIDA) ---
  // ✅ CORRECCIÓN DE SEGURIDAD: Usar (historialMeses || []) para prevenir el error 'slice'
  const historialSeguro = historialMeses || [];

  const data = {
    // Línea 63 corregida
    labels: historialSeguro.slice(-5).reverse().map(m => `Mes ${m.mes.slice(5, 7)}`),
    datasets: [
      {
        label: 'Ventas Totales',
        data: historialSeguro.slice(-5).reverse().map(m => m.ventas),
        backgroundColor: 'rgba(0, 123, 255, 0.5)', // Azul
      },
      {
        label: 'Utilidad Neta',
        data: historialSeguro.slice(-5).reverse().map(m => m.utilidad),
        backgroundColor: 'rgba(40, 167, 69, 0.5)', // Verde
      },
    ],
  };

  // --- 5. Renderizado ---
  
  // Función de formato seguro (soluciona el error de toLocaleString)
  const formatCurrency = (value) => {
    // Si el valor es null o undefined, usa 0 (coalescencia nula)
    const safeValue = value ?? 0; 
    // Usamos el locale de España (es-ES) para formato de moneda
    return safeValue.toLocaleString('es-ES', { minimumFractionDigits: 2 });
  };

  // Si los datos iniciales no están cargados, muestra un mensaje
  if (!mesActual || !balance) {
    return <div className="p-4">Cargando datos del Dashboard...</div>;
  }
  
  return (
    <div className="p-4">
      <h1 className="mb-4">Dashboard</h1>
      
      {/* --- Indicadores Financieros --- */}
      <div className="row mb-4">
        {/* Card 1: Total Ventas del Mes */}
        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">
                Ventas Mes ({mesActual?.mes}) 
              </h6>
              <h3 className="card-title text-success">
                ${formatCurrency(balance?.totalVentas)} 
              </h3>
            </div>
          </div>
        </div>

        {/* Card 2: Valor de Inventario */}
        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Valor de Inventario</h6>
              <h3 className="card-title text-primary">
                ${formatCurrency(balance?.valorInventario)}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Card 3: Utilidad Neta del Mes */}
        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Utilidad Neta</h6>
              <h3 className={`card-title ${((balance?.utilidadNeta ?? 0) >= 0) ? 'text-success' : 'text-danger'}`}>
                ${formatCurrency(balance?.utilidadNeta)}
              </h3>
            </div>
          </div>
        </div>
        
        {/* Card 4: Gastos Fijos Configurados */}
        <div className="col-md-3">
          <div className="card text-center h-100">
            <div className="card-body">
              <h6 className="card-subtitle mb-2 text-muted">Gastos Fijos/Mes</h6>
              <h3 className="card-title text-secondary">
                ${formatCurrency(gastosFijos)}
              </h3>
            </div>
          </div>
        </div>
      </div>
      
      {/* --- Sección de Acciones y Configuración --- */}
      <div className="card mb-4">
        <div className="card-body">
            <h5 className="mb-3">Configuración y Acciones</h5>
            <div className="row align-items-end">
                {/* Gastos Fijos */}
                <div className="col-md-5 mb-3">
                    <label className="form-label">Actualizar Gastos Fijos Mensuales</label>
                    <div className="input-group">
                        <span className="input-group-text">$</span>
                        <input
                            type="number"
                            className="form-control"
                            value={gastosFijosInput}
                            onChange={(e) => setGastosFijosInput(e.target.value)}
                            min="0"
                        />
                        <button className="btn btn-outline-primary" onClick={handleUpdateGastosFijos}>Guardar</button>
                    </div>
                </div>

                {/* Cerrar Mes */}
                <div className="col-md-3 mb-3">
                    <button className="btn btn-warning w-100" onClick={handleCerrarMes}>
                        Cerrar Mes ({mesActual?.mes})
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* Gráfico e Historial */}
      <div className="row mb-4">
        <div className="col-md-8">
          <div className="card h-100">
            <div className="card-body">
              <h5>Gráfico: Utilidad y Ventas (Últimos 5 Meses)</h5>
              {historialSeguro.length > 0 ? (
                <Bar data={data} options={{ responsive: true, scales: { y: { beginAtZero: true } } }} />
              ) : (
                 <p className="text-muted text-center py-5">Cierra tu primer mes para ver el historial.</p>
              )}
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card h-100">
            <div className="card-body">
              <h5>Historial de Meses Cerrados ({historialSeguro.length})</h5>
              {historialSeguro.length > 0 ? (
                <ul className="list-unstyled small">
                  {historialSeguro.slice(-5).reverse().map((m, i) => (
                    <li key={i} className="border-bottom py-1">
                      <strong>Mes {m.mes.slice(5,7)} ({m.mes.slice(0,4)}):</strong> Utilidad ${formatCurrency(m.utilidad)}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted">No hay meses cerrados.</p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Anuncio inferior si no es Premium */}
      {!isPremium && <Anuncios position="footer" />} 

    </div>
  );
};

export default Dashboard;