import React, { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import diagnosticService from '../services/diagnosticService'
import './DiagnosticPage.css'

export default function DiagnosticPage() {
  const { user } = useAuthStore()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(false)
  const [legacyOwner, setLegacyOwner] = useState('')
  const [mappingDone, setMappingDone] = useState(false)
  const logsEndRef = useRef(null)

  const scrollToBottom = () => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [logs])

  // Capturar console.log
  useEffect(() => {
    const originalLog = console.log
    const originalError = console.error

    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      setLogs(prev => [...prev, { type: 'log', message }])
      originalLog(...args)
    }

    console.error = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      setLogs(prev => [...prev, { type: 'error', message }])
      originalError(...args)
    }

    return () => {
      console.log = originalLog
      console.error = originalError
    }
  }, [])

  const handleRunDiagnostic = async () => {
    setLogs([])
    setLoading(true)
    
    try {
      const userEmail = user?.email || 'unknown@example.com'
      const userId = user?.id || 'unknown'
      
      console.log('👤 INFORMACIÓN DEL USUARIO ACTUAL:')
      console.log(`   Email: ${userEmail}`)
      console.log(`   User ID (Mantente Connect): ${userId}`)
      console.log('')
      
      await diagnosticService.scanLegacyTables(userEmail)
    } catch (error) {
      console.error('Error ejecutando diagnóstico:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAnalyzeFields = async () => {
    setLogs([])
    setLoading(true)
    
    try {
      await diagnosticService.analyzeFieldStructure()
    } catch (error) {
      console.error('Error analizando campos:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveMapping = async () => {
    if (!legacyOwner.trim()) {
      alert('Por favor ingresa el owner del sistema antiguo')
      return
    }

    try {
      // Guardar en localStorage como referencia
      const mapping = {
        currentUserId: user?.id,
        currentEmail: user?.email,
        legacyOwner: legacyOwner,
        savedAt: new Date().toISOString(),
      }

      localStorage.setItem('userMapping', JSON.stringify(mapping))
      
      console.log('✅ MAPEO GUARDADO EXITOSAMENTE')
      console.log(`   Usuario Actual (ID): ${user?.id}`)
      console.log(`   Usuario Antiguo (Owner): ${legacyOwner}`)
      console.log('')
      console.log('El sistema ahora puede migrar los datos usando este mapeo.')
      
      setMappingDone(true)
    } catch (error) {
      console.error('Error guardando mapeo:', error)
    }
  }

  return (
    <div className="diagnostic-page">
      <div className="diagnostic-container">
        <div className="diagnostic-header">
          <h1>🔍 Herramienta de Diagnóstico</h1>
          <p className="user-info">
            📧 Usuario: <strong>{user?.email}</strong>
            <br />
            🆔 ID: <strong>{user?.id}</strong>
          </p>
        </div>

        <div className="diagnostic-controls">
          <button
            onClick={handleRunDiagnostic}
            disabled={loading}
            className="btn-diagnostic"
          >
            {loading ? '⏳ Escaneando...' : '🔍 Ejecutar Diagnóstico'}
          </button>
          <button
            onClick={handleAnalyzeFields}
            disabled={loading}
            className="btn-diagnostic btn-secondary"
          >
            {loading ? '⏳ Analizando...' : '🔬 Analizar Campos'}
          </button>
        </div>

        <div className="console-container">
          <div className="console-header">
            <span>📋 Salida del Diagnóstico</span>
            <span className="record-count">{logs.length} líneas</span>
          </div>
          <div className="console-output">
            {logs.length === 0 ? (
              <div className="empty-state">
                <p>Haz clic en "Ejecutar Diagnóstico" para comenzar...</p>
              </div>
            ) : (
              logs.map((log, idx) => (
                <div key={idx} className={`log-line log-${log.type}`}>
                  <span className="log-prefix">&gt;</span>
                  <span className="log-text">{log.message}</span>
                </div>
              ))
            )}
            <div ref={logsEndRef} />
          </div>
        </div>

        <div className="mapping-section">
          <h3>🔗 Mapeo de Usuario</h3>
          <p>
            Para migrar los datos, necesitamos vincular tu usuario actual con el ID del sistema antiguo.
          </p>
          
          <div className="mapping-info">
            <div className="info-box">
              <strong>📱 Usuario Actual (Mantente Connect):</strong>
              <code>{user?.id}</code>
            </div>
            
            <div className="info-box">
              <strong>🕐 Usuario Antiguo (Mantente):</strong>
              <p>Del diagnóstico anterior, el owner encontrado es:</p>
              <code>40adba89-fbfb-4b92-b14b-6c0cda93c58e</code>
            </div>
          </div>

          <div className="mapping-input-group">
            <label htmlFor="legacy-owner">
              🔑 Owner del Sistema Antiguo:
            </label>
            <input
              id="legacy-owner"
              type="text"
              value={legacyOwner}
              onChange={(e) => setLegacyOwner(e.target.value)}
              placeholder="Ej: 40adba89-fbfb-4b92-b14b-6c0cda93c58e"
              className="mapping-input"
            />
            <button
              onClick={handleSaveMapping}
              className="btn-save-mapping"
              disabled={!legacyOwner.trim()}
            >
              💾 Guardar Mapeo
            </button>
          </div>

          {mappingDone && (
            <div className="success-message">
              ✅ Mapeo guardado. Ahora puedes ejecutar la migración.
            </div>
          )}
        </div>

        <div className="diagnostic-info">
          <h3>ℹ️ Información</h3>
          <p>
            Esta herramienta te ayuda a preparar la migración:
          </p>
          <ul>
            <li>✅ Escanea las tablas antiguas sin filtros</li>
            <li>✅ Muestra cuántos registros hay</li>
            <li>✅ Identifica el "owner" del usuario antiguo</li>
            <li>✅ Mapea el usuario antiguo al nuevo sistema</li>
            <li>✅ Prepara los datos para migración</li>
          </ul>
        </div>
      </div>
    </div>
  )
}