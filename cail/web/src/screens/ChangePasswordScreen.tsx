interface ChangePasswordScreenProps {
  company: string;
  onPasswordChanged: () => void;
  onLogout: () => void;
}

export function ChangePasswordScreen({ company, onPasswordChanged, onLogout }: ChangePasswordScreenProps) {
  return (
    <div className="container">
      <section className="page">
        <div className="page-inner">
          <div className="card pad-md stack">
            <div>
              <p className="kicker">Seguridad</p>
              <h2>Cambio de contrasena obligatorio</h2>
              <p className="section-subtitle">
                {company} requiere actualizar la contrasena antes de continuar.
              </p>
            </div>
            <div className="stack">
              <label className="stack">
                <span>Nueva contrasena</span>
                <input className="input" type="password" placeholder="Minimo 12 caracteres" />
              </label>
              <label className="stack">
                <span>Confirmar contrasena</span>
                <input className="input" type="password" placeholder="Repite la contrasena" />
              </label>
            </div>
            <div className="grid-2">
              <button className="btn btn-secondary" onClick={onLogout}>
                Cerrar sesion
              </button>
              <button className="btn btn-primary" onClick={onPasswordChanged}>
                Actualizar y continuar
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
