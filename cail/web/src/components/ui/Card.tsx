import { ReactNode } from 'react';

export type CardVariant = 'default' | 'sm' | 'lg';

interface CardProps {
  children: ReactNode;
  variant?: CardVariant;
  hoverable?: boolean;
  style?: React.CSSProperties;
  onClick?: () => void;
}

export function Card({
  children,
  variant = 'default',
  hoverable = false,
  style,
  onClick,
}: CardProps) {
  const getClassName = () => {
    let className = 'card';
    if (variant === 'sm') className += ' card-sm';
    if (variant === 'lg') className += ' card-lg';
    return className;
  };

  return (
    <div
      className={getClassName()}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {children}
    </div>
  );
}
