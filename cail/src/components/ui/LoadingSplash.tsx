import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface LoadingSplashProps {
    visible: boolean;
    message?: string;
    variant?: 'candidate' | 'employer';
    showSuccess?: boolean;
    onSuccessComplete?: () => void;
}

export function LoadingSplash({
    visible,
    message = 'Cargando...',
    variant = 'candidate',
    showSuccess = false,
    onSuccessComplete,
}: LoadingSplashProps) {
    const scaleAnim = useRef(new Animated.Value(0.8)).current;
    const opacityAnim = useRef(new Animated.Value(0)).current;
    const successScale = useRef(new Animated.Value(0)).current;
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [internalSuccess, setInternalSuccess] = useState(false);

    const accentColor = variant === 'candidate' ? '#0B7A4D' : '#F59E0B';
    const accentLight = variant === 'candidate' ? '#ECFDF5' : '#FEF3C7';

    useEffect(() => {
        if (visible) {
            setInternalSuccess(false);
            // Fade in and scale up
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    tension: 50,
                    friction: 7,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true,
                }),
            ]).start();

            // Start pulse animation for logo - more noticeable effect
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1.15,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0.95,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            // Fade out
            Animated.parallel([
                Animated.timing(scaleAnim, {
                    toValue: 0.8,
                    duration: 150,
                    useNativeDriver: true,
                }),
                Animated.timing(opacityAnim, {
                    toValue: 0,
                    duration: 150,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [visible]);

    useEffect(() => {
        if (showSuccess && visible) {
            setInternalSuccess(true);
            // Stop pulse, show success checkmark
            pulseAnim.stopAnimation();

            Animated.sequence([
                Animated.spring(successScale, {
                    toValue: 1.2,
                    tension: 100,
                    friction: 5,
                    useNativeDriver: true,
                }),
                Animated.spring(successScale, {
                    toValue: 1,
                    tension: 100,
                    friction: 10,
                    useNativeDriver: true,
                }),
                Animated.delay(600),
            ]).start(() => {
                onSuccessComplete?.();
            });
        } else {
            successScale.setValue(0);
        }
    }, [showSuccess]);

    if (!visible) return null;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
        >
            <View style={styles.overlay}>
                <Animated.View
                    style={[
                        styles.container,
                        {
                            opacity: opacityAnim,
                            transform: [{ scale: scaleAnim }],
                        },
                    ]}
                >
                    {/* Logo Circle */}
                    <View style={[styles.logoCircle, { backgroundColor: accentLight }]}>
                        {internalSuccess ? (
                            <View style={[styles.successCircle, { backgroundColor: '#10B981' }]}>
                                <Animated.View style={{ transform: [{ scale: successScale }] }}>
                                    <Feather name="check" size={40} color="#FFFFFF" />
                                </Animated.View>
                            </View>
                        ) : (
                            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                                <Image
                                    source={require('@/assets/logo.png')}
                                    style={styles.logoImage}
                                    resizeMode="contain"
                                />
                            </Animated.View>
                        )}
                    </View>

                    {/* Brand Name */}
                    <Text style={styles.brandName}>CAIL</Text>

                    {/* Message */}
                    <Text style={[styles.message, { color: accentColor }]}>
                        {internalSuccess ? '¡Listo!' : message}
                    </Text>

                    {/* Loading dots animation */}
                    {!internalSuccess && (
                        <View style={styles.dotsContainer}>
                            <LoadingDot delay={0} color={accentColor} />
                            <LoadingDot delay={150} color={accentColor} />
                            <LoadingDot delay={300} color={accentColor} />
                        </View>
                    )}
                </Animated.View>
            </View>
        </Modal>
    );
}

function LoadingDot({ delay, color }: { delay: number; color: string }) {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        const animation = Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true,
                }),
                Animated.timing(opacity, {
                    toValue: 0.3,
                    duration: 400,
                    useNativeDriver: true,
                }),
            ])
        );
        animation.start();
        return () => animation.stop();
    }, []);

    return (
        <Animated.View
            style={[
                styles.dot,
                { backgroundColor: color, opacity },
            ]}
        />
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        alignItems: 'center',
        padding: 40,
    },
    logoCircle: {
        width: 140,
        height: 140,
        borderRadius: 70,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 24,
    },
    successCircle: {
        width: 88,
        height: 88,
        borderRadius: 44,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    logoImage: {
        width: 100,
        height: 100,
    },
    brandName: {
        fontSize: 36,
        fontWeight: '800',
        color: '#1F2937',
        letterSpacing: 4,
        marginBottom: 12,
    },
    message: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 20,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
});
