import React, { useState, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import migrationService from '../services/migrationService'
import './MigrationPage.css'

export default function MigrationPage() {
  const { user } = useAuthStore()
  const [migrating, setMigrating] = useState(false)
  const [results, setResults] = useState(null)
  const [logs, setLogs] = useState([])
  const [error, setError] = useState(null)

  // Capturar logs de console
  useEffect(() => {
    const originalLog = console.log
    const originalError = console.error

    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      setLogs(prev => [...prev, { type: 'log', message, time: new Date().toLocaleTimeString() }])
      originalLog(...args)
    }

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      setLogs(prev => [...prev, { type: 'error', message, time: new Date().toLocaleTimeString() }])
      originalError(...args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
    }
  }, [])

  const handleMigrate = async () => {
    setMigrating(true)
    setError(null)
    setLogs([])
    setResults(null)

    try {
      if (!user?.id) {
        throw new Error('Usuario no autenticado')
      }

      console.log('🚀 INICIANDO MIGRACIÓN DE DATOS')
      console.log(`👤 Usuario: ${user.email}`)
      console.log(`🔑 ID: ${user.id}\n`)

      const result = await migrationService.migrateAllData(user.id)

      if (result.success) {
        setResults(result.results)
        console.log('✅ Migración completada exitosamente')
      } else {
        setError(result.message)
        console.error('❌ Error en migración:', result.message)
      }
    } catch (err) {
      setError(err.message)
      console.error('❌ Error:', err.message)
    } finally {
      setMigrating(false)
    }
  }

  return (
    <div className="migration-container">
      <div className="migration-card">
        {/* Header */}
        <div className="migration-header">
          <h1>🔄 Migración de Datos</h1>
          <p>Traslada tus datos de Mantente a Mantente Connect</p>
        </div>

        {/* Usuario Info */}
        <div className="user-info">
          <div className="info-item">
            <span className="label">Usuario:</span>
            <span className="value">{user?.email}</span>
          </div>
        </div>

        {/* Descripción */}
        <div className="migration-description">
          <h3>¿Qué se migrar?</h3>
          <div className="items-list">
            <div className="item">
              <span className="icon">📦</span>
              <div>
                <strong>Productos</strong>
                <p>De la tabla "inventario" a "products"</p>
              </div>
            </div>
            <div className="item">
              <span className="icon">👥</span>
              <div>
                <strong>Clientes</strong>
                <p>De la tabla "clientes" a "customers"</p>
              </div>
            </div>
            <div className="item">
              <span className="icon">🛒</span>
              <div>
                <strong>Ventas</strong>
                <p>De la tabla "ventas" a "orders"</p>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de Migración */}
        {!results && (
          <button
            className="btn-migrate"
            onClick={handleMigrate}
            disabled={migrating}
          >
            {migrating ? (
              <>
                <span className="spinner"></span>
                Migrando...
              </>
            ) : (
              <>
                🚀 Iniciar Migración
              </>
            )}
          </button>
        )}

        {/* Error */}
        {error && (
          <div className="error-box">
            <h4>❌ Error</h4>
            <p>{error}</p>
            <button
              className="btn-retry"
              onClick={() => {
                setError(null)
                setLogs([])
              }}
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Resultados */}
        {results && (
          <div className="results-box">
            <h3>✅ Migración Completada</h3>
            <div className="results-grid">
              <div className="result-item success">
                <span className="icon">📦</span>
                <div>
                  <strong>Productos</strong>
                  <p>{results.products.migrated} / {results.products.total}</p>
                </div>
              </div>
              <div className="result-item success">
                <span className="icon">👥</span>
                <div>
                  <strong>Clientes</strong>
                  <p>{results.customers.migrated} / {results.customers.total}</p>
                </div>
              </div>
              <div className="result-item success">
                <span className="icon">🛒</span>
                <div>
                  <strong>Ventas</strong>
                  <p>{results.orders.migrated} / {results.orders.total}</p>
                </div>
              </div>
            </div>
            <button
              className="btn-close"
              onClick={() => {
                setResults(null)
                setLogs([])
              }}
            >
              Cerrar
            </button>
          </div>
        )}

        {/* Logs */}
        {logs.length > 0 && (
          <div className="logs-box">
            <h4>📋 Detalles de la Migración</h4>
            <div className="logs-container">
              {logs.map((log, idx) => (
                <div key={idx} className={`log-line ${log.type}`}>
                  <span className="time">{log.time}</span>
                  <span className="message">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}