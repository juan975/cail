import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';
import { catalogsService, CatalogItem } from '@/services/catalogs.service';
import { Chip } from './Chip';

interface SkillSelectorProps {
    selectedSkills: string[];
    onChange: (skills: string[]) => void;
    maxSkills?: number;
    label?: string;
    placeholder?: string;
}

export function SkillSelector({
    selectedSkills,
    onChange,
    maxSkills = 15,
    label = 'Habilidades',
    placeholder = 'Buscar habilidades (ej: React, Python...)',
    chipColor
}: SkillSelectorProps & { chipColor?: string }) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(false);
    const searchTimeout = useRef<NodeJS.Timeout | null>(null);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        if (query.trim().length === 0) {
            setSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        setLoading(true);
        setShowSuggestions(true);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        searchTimeout.current = setTimeout(async () => {
            try {
                const results = await catalogsService.searchSkills(query);
                // Filtrar las que ya están seleccionadas
                const filtered = results.filter(s => !selectedSkills.includes(s.name));

                // Agregar opción de crear si no existe exacta
                const exactMatch = results.find(s => s.name.toLowerCase() === query.toLowerCase());
                if (!exactMatch && query.trim().length > 1) {
                    filtered.push({ id: 'new', name: query.trim(), type: 'HARD' });
                }

                setSuggestions(filtered);
            } catch (error) {
                console.error('Error buscando skills:', error);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => {
            if (searchTimeout.current) clearTimeout(searchTimeout.current);
        };
    }, [query, selectedSkills]);

    const handleSelect = (skillName: string) => {
        if (selectedSkills.includes(skillName)) return;
        if (selectedSkills.length >= maxSkills) return;

        onChange([...selectedSkills, skillName]);
        setQuery('');
        setSuggestions([]);
        setShowSuggestions(false);
    };

    const handleRemove = (skillName: string) => {
        onChange(selectedSkills.filter(s => s !== skillName));
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>{label}</Text>

            <View style={styles.chipsContainer}>
                {selectedSkills.map(skill => (
                    <Chip
                        key={skill}
                        label={skill}
                        active={true}
                        color={chipColor || colors.candidate}
                        onPress={() => handleRemove(skill)}
                        icon={<Feather name="x" size={14} color={chipColor || colors.candidate} />}
                    />
                ))}
            </View>

            <View style={styles.inputContainer}>
                <Feather name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    value={query}
                    onChangeText={setQuery}
                    placeholder={selectedSkills.length >= maxSkills ? `Límite alcanzado (${maxSkills})` : placeholder}
                    placeholderTextColor={colors.muted}
                    editable={selectedSkills.length < maxSkills}
                />
                {loading && <ActivityIndicator size="small" color={chipColor || colors.candidate} style={styles.loader} />}
            </View>

            {showSuggestions && suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item) => item.id === 'new' ? `new-${item.name}` : item.id}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.suggestionItem}
                                onPress={() => handleSelect(item.name)}
                            >
                                <Feather
                                    name={item.id === 'new' ? "plus" : "hash"}
                                    size={16}
                                    color={item.id === 'new' ? colors.accent : colors.textSecondary}
                                />
                                <Text style={[
                                    styles.suggestionText,
                                    item.id === 'new' && styles.newSkillText
                                ]}>
                                    {item.id === 'new' ? `Agregar "${item.name}"` : item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                        keyboardShouldPersistTaps="always"
                        style={styles.list}
                        nestedScrollEnabled={true}
                    />
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 12,
        zIndex: 10, // Para que las sugerencias floten sobre lo siguiente
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 48,
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: colors.textPrimary,
    },
    loader: {
        marginLeft: 8,
    },
    suggestionsContainer: {
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 12,
        maxHeight: 200,
        marginTop: 4,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    list: {
        maxHeight: 200,
    },
    suggestionItem: {
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: colors.border,
    },
    suggestionText: {
        fontSize: 14,
        color: colors.textPrimary,
    },
    newSkillText: {
        color: colors.accent,
        fontWeight: '600',
    },
});
