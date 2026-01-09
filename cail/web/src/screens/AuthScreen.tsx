import { useState } from 'react';
import logo from '../assets/logo.png';
import { UserRole } from '../types';

interface AuthScreenProps {
  onAuthSuccess: (role: UserRole) => void;
  onShowTerms: () => void;
}

type AuthMode = 'select' | 'login';

export function AuthScreen({ onAuthSuccess, onShowTerms }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>('select');
  const [role, setRole] = useState<UserRole>('candidate');

  const handleSelect = (selected: UserRole) => {
    setRole(selected);
    setMode('login');
  };

  return (
    <div className="container">
      <section className="page">
        <div className="page-inner">
          <div className="gradient-panel hero">
            <div className="stack">
              <div className="logo">
                <img src={logo} alt="CAIL" />
              </div>
              <div>
                <div className="hero-badge">CAIL Bolsa de Empleo</div>
                <h1 className="hero-title">Conectamos talento con oportunidades</h1>
                <p className="hero-subtitle">Cámara de Industrias de Loja</p>
              </div>
            </div>
            <div className="stack">
              {mode === 'select' ? (
                <div className="grid-2">
                  <div className="card pad-md stack">
                    <p className="kicker">Soy candidato</p>
                    <h3>Busco nuevas vacantes</h3>
                    <button className="btn btn-primary" onClick={() => handleSelect('candidate')}>
                      Ingresar como candidato
                    </button>
                  </div>
                  <div className="card pad-md stack">
                    <p className="kicker">Soy empleador</p>
                    <h3>Busco talento para mi empresa</h3>
                    <button className="btn btn-warning" onClick={() => handleSelect('employer')}>
                      Ingresar como empleador
                    </button>
                  </div>
                </div>
              ) : (
                <div className="card pad-md stack">
                  <p className="kicker">Acceso rapido</p>
                  <h2>{role === 'candidate' ? 'Acceso candidato' : 'Acceso empleador'}</h2>
                  <label className="stack">
                    <span>Correo</span>
                    <input className="input" placeholder="correo@cail.ec" />
                  </label>
                  <label className="stack">
                    <span>Contrasena</span>
                    <input className="input" placeholder="••••••••" type="password" />
                  </label>
                  <div className="grid-2">
                    <button className="btn btn-secondary" onClick={() => setMode('select')}>
                      Volver
                    </button>
                    <button className="btn btn-primary" onClick={() => onAuthSuccess(role)}>
                      Continuar
                    </button>
                  </div>
                </div>
              )}
              <button className="btn btn-outline" onClick={onShowTerms}>
                Ver terminos y condiciones
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
