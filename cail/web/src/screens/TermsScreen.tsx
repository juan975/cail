interface TermsScreenProps {
  onClose: () => void;
}

export function TermsScreen({ onClose }: TermsScreenProps) {
  return (
    <div className="container">
      <section className="page">
        <div className="page-inner stack">
          <div className="card pad-md stack">
            <h2>Terminos y condiciones</h2>
            <p className="section-subtitle">
              Este es un resumen de las politicas de uso y proteccion de datos de la bolsa de empleo
              CAIL.
            </p>
            <div className="list">
              <div className="list-item">
                <strong>Uso responsable</strong>
                <p className="section-subtitle">
                  La informacion compartida debe ser veridica y actualizada para garantizar procesos
                  transparentes.
                </p>
              </div>
              <div className="list-item">
                <strong>Privacidad</strong>
                <p className="section-subtitle">
                  Tus datos se usan unicamente para procesos de seleccion y comunicacion.
                </p>
              </div>
              <div className="list-item">
                <strong>Seguridad</strong>
                <p className="section-subtitle">
                  Mantenemos medidas de seguridad para proteger la plataforma.
                </p>
              </div>
            </div>
            <button className="btn btn-primary" onClick={onClose}>
              Volver al acceso
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
