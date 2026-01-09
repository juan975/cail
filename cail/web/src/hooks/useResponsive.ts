import { useEffect, useMemo, useState } from 'react';

export function useResponsiveLayout() {
  const [width, setWidth] = useState<number>(() => (typeof window === 'undefined' ? 1200 : window.innerWidth));

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return useMemo(() => {
    const isTablet = width >= 768;
    const isDesktop = width >= 1024;
    const contentWidth = Math.min(width, isDesktop ? 1180 : isTablet ? 900 : width);
    const horizontalGutter = isDesktop ? 32 : isTablet ? 22 : 16;

    return {
      isTablet,
      isDesktop,
      contentWidth,
      horizontalGutter,
    };
  }, [width]);
}
