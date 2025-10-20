// src/components/Login.jsx
import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const Login = () => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.debug('[Login] submitting', { email });
    const success = await login(email, password);
    if (!success) {
      setError('Credenciales inválidas. Por favor, intenta de nuevo.');
    }
    // La redirección se manejará en App.jsx
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card">
            <div className="card-body">
              <h2 className="card-title text-center">Iniciar Sesión en Mantente</h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  {/* CORRECCIÓN: Se añaden id y htmlFor */}
                  <label className="form-label" htmlFor="loginEmail">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    id="loginEmail" // ID añadido
                    name="email" // NAME añadido (aunque no es estrictamente necesario aquí)
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
                <div className="mb-3">
                  {/* CORRECCIÓN: Se añaden id y htmlFor */}
                  <label className="form-label" htmlFor="loginPassword">Contraseña</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    id="loginPassword" // ID añadido
                    name="password" // NAME añadido
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
                {error && <div className="alert alert-danger">{error}</div>}
                <button type="submit" className="btn btn-primary w-100">Entrar</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;