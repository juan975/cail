import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

// Simple helper to share breakpoints between mobile and web layouts.
export function useResponsiveLayout() {
  const { width } = useWindowDimensions();

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
