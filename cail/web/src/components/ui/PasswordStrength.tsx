import { useEffect, useMemo, useState } from 'react';
import { colors } from '../../theme/colors';

interface PasswordStrengthProps {
  password: string;
  variant?: 'candidate' | 'employer';
}

interface Requirement {
  label: string;
  met: boolean;
  check: (password: string) => boolean;
}

const baseRequirements: Omit<Requirement, 'met'>[] = [
  { label: 'Al menos 12 caracteres', check: (password) => password.length >= 12 },
  { label: 'Una letra mayuscula', check: (password) => /[A-Z]/.test(password) },
  { label: 'Un numero', check: (password) => /\d/.test(password) },
  { label: 'Un simbolo especial', check: (password) => /[^A-Za-z0-9]/.test(password) },
];

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 12) {
    errors.push('La contraseña debe tener al menos 12 caracteres');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('La contraseña debe tener al menos una mayúscula');
  }
  if (!/[0-9]/.test(password)) {
    errors.push('La contraseña debe tener al menos un número');
  }
  const specialCharRegex = new RegExp("[!@#$%^&*()_+\\-=\\[\\]{};':\"\\\\|,.<>/?]");
  if (!specialCharRegex.test(password)) {
    errors.push('La contraseña debe tener al menos un carácter especial');
  }

  return { isValid: errors.length === 0, errors };
}

export function PasswordStrength({ password, variant = 'candidate' }: PasswordStrengthProps) {
  if (!password) return null;
  const [animateKey, setAnimateKey] = useState(0);

  const requirements = useMemo<Requirement[]>(
    () => baseRequirements.map((req) => ({ ...req, met: req.check(password) })),
    [password]
  );

  useEffect(() => {
    setAnimateKey((prev) => prev + 1);
  }, [password]);

  const metCount = requirements.filter((r) => r.met).length;
  const progress = metCount / requirements.length;
  const toneColor = variant === 'employer' ? colors.employer : colors.candidate;

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: colors.textSecondary }}>
        Seguridad de contrasena
      </div>
      <div style={{ height: 6, background: colors.surfaceMuted, borderRadius: 999, overflow: 'hidden' }}>
        <div
          key={animateKey}
          style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: toneColor,
            transition: 'width 0.3s ease',
          }}
        />
      </div>
      <div style={{ display: 'grid', gap: 6 }}>
        {requirements.map((req) => (
          <div
            key={req.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: req.met ? colors.success : colors.textSecondary,
            }}
          >
            <span
              style={{
                width: 18,
                height: 18,
                borderRadius: 6,
                background: req.met ? `${colors.success}22` : colors.surfaceMuted,
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
              }}
            >
              {req.met ? '✓' : '•'}
            </span>
            {req.label}
          </div>
        ))}
      </div>
    </div>
  );
}
