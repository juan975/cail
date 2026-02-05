/**
 * Replacement for moti's MotiView - simple View wrapper
 * Use this until the Expo Go Worklets bug is fixed
 */
import * as React from 'react';
import { View, ViewProps } from 'react-native';

interface MotiViewProps extends ViewProps {
    from?: Record<string, unknown>;
    animate?: Record<string, unknown>;
    exit?: Record<string, unknown>;
    transition?: Record<string, unknown>;
    delay?: number;
    children?: React.ReactNode;
}

export const MotiView: React.FC<MotiViewProps> = ({
    from: _from,
    animate: _animate,
    exit: _exit,
    transition: _transition,
    delay: _delay,
    children,
    ...props
}) => {
    // Simple View without animations
    return <View {...props}>{children}</View>;
};

interface AnimatePresenceProps {
    children: React.ReactNode;
    exitBeforeEnter?: boolean;
}

export const AnimatePresence: React.FC<AnimatePresenceProps> = ({ children }) => {
    return <>{children}</>;
};

export default MotiView;
