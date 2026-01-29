import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: number;
  color?: string;
  fullPage?: boolean;
  background?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Cargando...',
  size = 40,
  color = '#F1842D',
  fullPage = false,
  background
}) => {
  const spinnerContent = (
    <div style={{ textAlign: 'center', padding: fullPage ? 0 : 60, background: fullPage ? 'transparent' : (background || '#fff'), borderRadius: 14, border: fullPage ? 'none' : (background ? 'none' : '1px solid #E5E7EB') }}>
      <div style={{ 
        display: 'inline-block',
        animation: 'spin 1s linear infinite',
        marginBottom: 16,
        color: color
      }}>
        <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </div>
      <div style={{ color: background ? '#fff' : '#6B7280', fontWeight: 600, fontSize: fullPage ? 16 : 14 }}>{message}</div>
    </div>
  );

  if (fullPage) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: background || '#fff',
        zIndex: 9999
      }}>
        {spinnerContent}
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 16, padding: '32px' }}>
      {spinnerContent}
    </div>
  );
};
