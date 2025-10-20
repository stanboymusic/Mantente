// src/components/CalculadoraPrecios.jsx

import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext'; 

const CalculadoraPrecios = () => {
  // OBTENER GASTOS FIJOS DEL CONTEXTO
  const { gastosFijos } = useAppContext(); 

  const [costo, setCosto] = useState('');
  const [gananciaDeseada, setGananciaDeseada] = useState(30);
  const [impuestos, setImpuestos] = useState(16);
  // AÑADIR NUEVO ESTADO PARA UNIDADES ESTIMADAS
  const [unidadesEstimadas, setUnidadesEstimadas] = useState(100); 

  const [precioFinal, setPrecioFinal] = useState(0);
  const [gananciaNeta, setGananciaNeta] = useState(0);
  const [costoFijoUnitario, setCostoFijoUnitario] = useState(0);

  useEffect(() => {
    const costoNum = parseFloat(costo) || 0;
    const gananciaNum = parseFloat(gananciaDeseada) || 0;
    const impuestosNum = parseFloat(impuestos) || 0;
    const unidadesNum = parseInt(unidadesEstimadas) || 0;
    const gastosFijosNum = parseFloat(gastosFijos) || 0;

    if (costoNum > 0) {
      // LÓGICA DE CÁLCULO
      const costoFijoPorUnidad = unidadesNum > 0 ? gastosFijosNum / unidadesNum : 0;
      const costoTotalUnitario = costoNum + costoFijoPorUnidad;
      
      const montoGanancia = costoTotalUnitario * (gananciaNum / 100);
      const precioSinImpuestos = costoTotalUnitario + montoGanancia;
      const montoImpuestos = precioSinImpuestos * (impuestosNum / 100);
      const precioVenta = precioSinImpuestos + montoImpuestos;

      setCostoFijoUnitario(costoFijoPorUnidad.toFixed(2));
      setPrecioFinal(precioVenta.toFixed(2));
      setGananciaNeta(montoGanancia.toFixed(2));
    } else {
      setPrecioFinal(0);
      setGananciaNeta(0);
      setCostoFijoUnitario(0);
    }
  }, [costo, gananciaDeseada, impuestos, unidadesEstimadas, gastosFijos]);

  return (
    <div className="p-4">
      <h2>Calculadora de Precios Sugeridos</h2>
      <p className="lead">Utiliza tus gastos fijos y la ganancia deseada para estimar un precio de venta rentable.</p>

      <div className="card mb-4 shadow-sm">
        <div className="card-body">
          <div className="row">
            {/* Formularios de Input */}
            <div className="col-md-6">
              <div className="card p-3 shadow-sm">
                <h5 className="card-title">Entradas</h5>
                <p className="text-muted small">Gastos Fijos Actuales: ${gastosFijos.toLocaleString()}</p>
                
                <div className="mb-3">
                    {/* CORRECCIÓN: htmlFor = id */}
                  <label htmlFor="calcCosto" className="form-label">Costo del Producto ($)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="calcCosto" // Añadido ID
                    value={costo}
                    onChange={(e) => setCosto(e.target.value)}
                    min="0"
                    placeholder="Ej: 15.00"
                  />
                </div>
                <div className="mb-3">
                    {/* CORRECCIÓN: htmlFor = id */}
                  <label htmlFor="calcGanancia" className="form-label">Ganancia Deseada (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="calcGanancia" // Añadido ID
                    value={gananciaDeseada}
                    onChange={(e) => setGananciaDeseada(e.target.value)}
                    min="0"
                    placeholder="Ej: 30"
                  />
                </div>
                {/* CAMPO PARA UNIDADES ESTIMADAS */}
                <div className="mb-3">
                    {/* CORRECCIÓN: htmlFor = id */}
                  <label htmlFor="calcUnidades" className="form-label">Unidades Estimadas de Venta (Mensual)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="calcUnidades" // Añadido ID
                    value={unidadesEstimadas}
                    onChange={(e) => setUnidadesEstimadas(e.target.value)}
                    min="1"
                    placeholder="Ej: 100"
                  />
                </div>
                <div className="mb-3">
                    {/* CORRECCIÓN: htmlFor = id */}
                  <label htmlFor="calcImpuestos" className="form-label">Impuestos / Comisiones (%)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="calcImpuestos" // Añadido ID
                    value={impuestos}
                    onChange={(e) => setImpuestos(e.target.value)}
                    min="0"
                    placeholder="Ej: 16"
                  />
                </div>
              </div>
            </div>
            
            {/* Resultados */}
            <div className="col-md-6 text-center">
                <div className="card bg-light p-3">
                    <h5 className="text-muted">Precio de Venta Sugerido</h5>
                    <h1 className="display-4 text-success">${precioFinal}</h1>
                    <hr />
                    <div className="row">
                        <div className='col-6'>
                            <h6 className="text-muted">Ganancia Neta</h6>
                            <h4 className="text-primary">${gananciaNeta}</h4>
                        </div>
                        <div className='col-6'>
                            <h6 className="text-muted">Costo Fijo Asignado</h6>
                            <h4 className="text-secondary">-${costoFijoUnitario}</h4>
                        </div>
                    </div>
                     <p className='text-muted small mt-3'>*El costo fijo asignado es la porción de tus gastos fijos mensuales (${gastosFijos.toLocaleString()}) que esta unidad debe cubrir, basado en la estimación de **{unidadesEstimadas}** unidades de venta.</p>
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculadoraPrecios;