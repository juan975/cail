import { ReactNode } from 'react';

interface SidebarProps {
  children?: ReactNode;
  collapsed?: boolean;
  onToggle?: () => void;
}

interface SidebarHeaderProps {
  children: ReactNode;
}

interface SidebarNavProps {
  children: ReactNode;
}

interface SidebarNavItemProps {
  icon?: ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

interface SidebarFooterProps {
  children: ReactNode;
}

export function Sidebar({ children, collapsed = false }: SidebarProps) {
  return (
    <aside className={`app-sidebar ${collapsed ? 'collapsed' : ''}`}>
      {children}
    </aside>
  );
}

export function SidebarHeader({ children }: SidebarHeaderProps) {
  return <div className="sidebar-header">{children}</div>;
}

export function SidebarNav({ children }: SidebarNavProps) {
  return <nav className="sidebar-nav">{children}</nav>;
}

export function SidebarNavItem({ icon, label, active = false, onClick }: SidebarNavItemProps) {
  return (
    <div
      className={`sidebar-nav-item ${active ? 'active' : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {icon && <span className="sidebar-nav-icon">{icon}</span>}
      <span className="sidebar-nav-label">{label}</span>
    </div>
  );
}

export function SidebarFooter({ children }: SidebarFooterProps) {
  return <div className="sidebar-footer">{children}</div>;
}

// Logo component
interface SidebarLogoProps {
  src?: string;
  alt?: string;
  text?: string;
}

export function SidebarLogo({ src, alt = 'Logo', text }: SidebarLogoProps) {
  return (
    <div className="sidebar-logo">
      {src ? <img src={src} alt={alt} style={{ width: '100%', height: '100%' }} /> : text || 'C'}
    </div>
  );
}
