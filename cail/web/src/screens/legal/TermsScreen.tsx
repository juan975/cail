import { useResponsiveLayout } from '../../hooks/useResponsive';
import { colors } from '../../theme/colors';

interface TermsScreenProps {
  onClose: () => void;
}

export function TermsScreen({ onClose }: TermsScreenProps) {
  const { contentWidth, horizontalGutter } = useResponsiveLayout();

  return (
    <div style={{ minHeight: '100vh', background: '#F5F7FA', padding: `24px ${horizontalGutter}px` }}>
      <div style={{ maxWidth: contentWidth, margin: '0 auto', display: 'grid', gap: 16 }}>
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 24,
            boxShadow: '0 18px 30px rgba(15, 23, 42, 0.12)',
            display: 'grid',
            gap: 12,
          }}
        >
          <h2 style={{ margin: 0 }}>Términos y condiciones</h2>
          <p style={{ margin: 0, color: colors.textSecondary }}>
            Este es un resumen de las políticas de uso y protección de datos de la bolsa de empleo CAIL.
          </p>
          <div style={{ display: 'grid', gap: 10 }}>
            <div style={{ padding: 12, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E5E7EB' }}>
              <strong>Uso responsable</strong>
              <p style={{ margin: '6px 0 0', color: colors.textSecondary, fontSize: 13 }}>
                La información compartida debe ser verídica y actualizada.
              </p>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E5E7EB' }}>
              <strong>Privacidad</strong>
              <p style={{ margin: '6px 0 0', color: colors.textSecondary, fontSize: 13 }}>
                Tus datos se utilizan únicamente para procesos de selección y comunicación.
              </p>
            </div>
            <div style={{ padding: 12, borderRadius: 12, background: '#F8FAFC', border: '1px solid #E5E7EB' }}>
              <strong>Seguridad</strong>
              <p style={{ margin: '6px 0 0', color: colors.textSecondary, fontSize: 13 }}>
                Mantenemos medidas de seguridad para proteger la plataforma.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '12px 16px',
              borderRadius: 12,
              border: 'none',
              background: colors.candidate,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            Volver al acceso
          </button>
        </div>
      </div>
    </div>
  );
}
