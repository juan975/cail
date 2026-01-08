import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface PasswordStrengthProps {
    password: string;
    variant?: 'candidate' | 'employer';
}

interface Requirement {
    label: string;
    met: boolean;
    check: (password: string) => boolean;
}

const requirements: Omit<Requirement, 'met'>[] = [
    {
        label: 'Al menos 12 caracteres',
        check: (password) => password.length >= 12,
    },
    {
        label: 'Una letra mayúscula',
        check: (password) => /[A-Z]/.test(password),
    },
    {
        label: 'Un número',
        check: (password) => /[0-9]/.test(password),
    },
    {
        label: 'Un carácter especial (!@#$%^&*)',
        check: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
    },
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
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
        errors.push('La contraseña debe tener al menos un carácter especial');
    }

    return { isValid: errors.length === 0, errors };
}

export function PasswordStrength({ password, variant = 'candidate' }: PasswordStrengthProps) {
    const checkedRequirements = requirements.map((req) => ({
        ...req,
        met: req.check(password),
    }));

    const metCount = checkedRequirements.filter((r) => r.met).length;
    const strength = metCount / requirements.length;

    const accentColor = variant === 'candidate' ? '#0B7A4D' : '#F59E0B';

    const getStrengthColor = () => {
        if (strength === 0) return '#E5E7EB';
        if (strength <= 0.25) return '#EF4444';
        if (strength <= 0.5) return '#F59E0B';
        if (strength <= 0.75) return '#F59E0B';
        return '#10B981';
    };

    const getStrengthLabel = () => {
        if (strength === 0) return '';
        if (strength <= 0.25) return 'Muy débil';
        if (strength <= 0.5) return 'Débil';
        if (strength <= 0.75) return 'Aceptable';
        return 'Fuerte';
    };

    if (!password) return null;

    return (
        <View style={styles.container}>
            {/* Strength Bar */}
            <View style={styles.barContainer}>
                <View style={styles.barBackground}>
                    <Animated.View
                        style={[
                            styles.barFill,
                            {
                                width: `${strength * 100}%`,
                                backgroundColor: getStrengthColor(),
                            },
                        ]}
                    />
                </View>
                {getStrengthLabel() && (
                    <Text style={[styles.strengthLabel, { color: getStrengthColor() }]}>
                        {getStrengthLabel()}
                    </Text>
                )}
            </View>

            {/* Requirements List */}
            <View style={styles.requirementsList}>
                {checkedRequirements.map((req, index) => (
                    <RequirementItem
                        key={index}
                        label={req.label}
                        met={req.met}
                        accentColor={accentColor}
                    />
                ))}
            </View>
        </View>
    );
}

function RequirementItem({
    label,
    met,
    accentColor,
}: {
    label: string;
    met: boolean;
    accentColor: string;
}) {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        if (met) {
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.15,
                    duration: 100,
                    useNativeDriver: true,
                }),
                Animated.spring(scaleAnim, {
                    toValue: 1,
                    friction: 4,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [met]);

    return (
        <View style={styles.requirementItem}>
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
                <View
                    style={[
                        styles.iconCircle,
                        met
                            ? { backgroundColor: '#10B981' }
                            : { backgroundColor: '#E5E7EB' },
                    ]}
                >
                    <Feather
                        name={met ? 'check' : 'circle'}
                        size={10}
                        color={met ? '#FFFFFF' : '#9CA3AF'}
                    />
                </View>
            </Animated.View>
            <Text
                style={[
                    styles.requirementText,
                    met ? styles.requirementMet : styles.requirementUnmet,
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 8,
        marginBottom: 4,
    },
    barContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },
    barBackground: {
        flex: 1,
        height: 6,
        backgroundColor: '#E5E7EB',
        borderRadius: 3,
        overflow: 'hidden',
    },
    barFill: {
        height: '100%',
        borderRadius: 3,
    },
    strengthLabel: {
        fontSize: 12,
        fontWeight: '600',
        minWidth: 70,
        textAlign: 'right',
    },
    requirementsList: {
        gap: 6,
    },
    requirementItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    iconCircle: {
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
    },
    requirementText: {
        fontSize: 13,
        flex: 1,
    },
    requirementMet: {
        color: '#10B981',
        textDecorationLine: 'line-through',
    },
    requirementUnmet: {
        color: '#6B7280',
    },
});
