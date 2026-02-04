import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    FlatList,
    ViewStyle,
    TextStyle,
    ScrollView
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { colors } from '@/theme/colors';

// Lista predefinida de habilidades técnicas comunes
export const COMMON_TECHNICAL_SKILLS = [
    // Programación y desarrollo
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'PHP', 'Ruby', 'Go', 'Rust', 'Swift', 'Kotlin',
    // Frameworks y librerías
    'React', 'React Native', 'Angular', 'Vue.js', 'Next.js', 'Node.js', 'Express.js', 'Django', 'Flask', 'Spring Boot', '.NET',
    // Bases de datos
    'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Redis', 'Oracle', 'SQL Server',
    // Cloud y DevOps
    'AWS', 'Google Cloud', 'Azure', 'Docker', 'Kubernetes', 'CI/CD', 'Jenkins', 'GitHub Actions', 'Terraform',
    // Herramientas
    'Git', 'GitHub', 'GitLab', 'Jira', 'Trello', 'Figma', 'Adobe XD',
    // Web
    'HTML', 'CSS', 'SASS', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'Responsive Design',
    // APIs y arquitectura
    'REST API', 'GraphQL', 'Microservicios', 'API Design', 'WebSockets',
    // Data y AI
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Data Science', 'Big Data', 'Pandas', 'NumPy',
    // Office y productividad
    'Excel', 'Excel Avanzado', 'Power BI', 'Tableau', 'Google Sheets', 'Microsoft Office',
    // Diseño
    'Diseño Gráfico', 'UI/UX', 'Adobe Photoshop', 'Adobe Illustrator', 'Canva',
    // Otros
    'SAP', 'ERP', 'CRM', 'Salesforce', 'SEO', 'SEM', 'Google Analytics', 'Marketing Digital',
    'AutoCAD', 'SolidWorks', 'MATLAB', 'R', 'SPSS', 'Contabilidad', 'Finanzas',
];

// Lista de soft skills comunes
export const COMMON_SOFT_SKILLS = [
    'Comunicación efectiva', 'Trabajo en equipo', 'Liderazgo', 'Resolución de problemas',
    'Pensamiento crítico', 'Creatividad', 'Adaptabilidad', 'Gestión del tiempo',
    'Negociación', 'Presentaciones', 'Atención al cliente', 'Empatía',
    'Toma de decisiones', 'Organización', 'Proactividad', 'Orientación a resultados',
    'Inteligencia emocional', 'Colaboración', 'Flexibilidad', 'Autodisciplina',
];

interface AutocompleteInputProps {
    selectedItems: string[];
    onChange: (items: string[]) => void;
    suggestions: string[];
    maxItems?: number;
    label?: string;
    placeholder?: string;
    chipColor?: string;
    addButtonColor?: string;
    allowCustom?: boolean;
    containerStyle?: ViewStyle;
}

export function AutocompleteInput({
    selectedItems,
    onChange,
    suggestions,
    maxItems = 15,
    label = 'Habilidades',
    placeholder = 'Buscar o escribir...',
    chipColor = '#3B82F6',
    addButtonColor = '#3B82F6',
    allowCustom = true,
    containerStyle,
}: AutocompleteInputProps) {
    const [query, setQuery] = useState('');
    const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const inputRef = useRef<TextInput>(null);

    // Filtrar sugerencias basadas en el query
    useEffect(() => {
        if (query.trim().length === 0) {
            setFilteredSuggestions([]);
            setShowSuggestions(false);
            return;
        }

        const q = query.toLowerCase().trim();
        const filtered = suggestions
            .filter(s =>
                s.toLowerCase().includes(q) &&
                !selectedItems.includes(s)
            )
            .slice(0, 8); // Limitar a 8 sugerencias

        setFilteredSuggestions(filtered);
        setShowSuggestions(filtered.length > 0 || (allowCustom && query.trim().length > 1));
    }, [query, suggestions, selectedItems, allowCustom]);

    const handleSelect = useCallback((item: string) => {
        if (selectedItems.includes(item)) return;
        if (selectedItems.length >= maxItems) return;

        onChange([...selectedItems, item]);
        setQuery('');
        setFilteredSuggestions([]);
        setShowSuggestions(false);
    }, [selectedItems, maxItems, onChange]);

    const handleAddCustom = useCallback(() => {
        const customItem = query.trim();
        if (!customItem || selectedItems.includes(customItem)) return;
        if (selectedItems.length >= maxItems) return;

        onChange([...selectedItems, customItem]);
        setQuery('');
        setFilteredSuggestions([]);
        setShowSuggestions(false);
    }, [query, selectedItems, maxItems, onChange]);

    const handleRemove = useCallback((item: string) => {
        onChange(selectedItems.filter(s => s !== item));
    }, [selectedItems, onChange]);

    const showAddCustomButton = allowCustom &&
        query.trim().length > 1 &&
        !filteredSuggestions.map(s => s.toLowerCase()).includes(query.toLowerCase().trim()) &&
        !selectedItems.includes(query.trim());

    return (
        <View style={[styles.container, containerStyle]}>
            {label && <Text style={styles.label}>{label}</Text>}

            {/* Chips de items seleccionados */}
            {selectedItems.length > 0 && (
                <View style={styles.chipsContainer}>
                    {selectedItems.map((item, index) => (
                        <View
                            key={`${item}-${index}`}
                            style={[styles.chip, { backgroundColor: `${chipColor}15` }]}
                        >
                            <Text style={[styles.chipText, { color: chipColor }]}>{item}</Text>
                            <TouchableOpacity
                                onPress={() => handleRemove(item)}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Feather name="x" size={14} color={chipColor} />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {/* Input y botón de agregar */}
            <View style={styles.inputRow}>
                <TextInput
                    ref={inputRef}
                    style={styles.input}
                    value={query}
                    onChangeText={setQuery}
                    placeholder={
                        selectedItems.length >= maxItems
                            ? `Límite alcanzado (${maxItems})`
                            : placeholder
                    }
                    placeholderTextColor="#9CA3AF"
                    editable={selectedItems.length < maxItems}
                    onFocus={() => {
                        if (query.length > 0 && (filteredSuggestions.length > 0 || showAddCustomButton)) {
                            setShowSuggestions(true);
                        }
                    }}
                />
                <TouchableOpacity
                    style={[
                        styles.addButton,
                        { backgroundColor: addButtonColor },
                        (!query.trim() || selectedItems.length >= maxItems) && styles.addButtonDisabled
                    ]}
                    onPress={handleAddCustom}
                    disabled={!query.trim() || selectedItems.length >= maxItems}
                >
                    <Feather name="plus" size={20} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Dropdown de sugerencias */}
            {showSuggestions && (
                <View style={styles.suggestionsContainer}>
                    <ScrollView
                        style={styles.suggestionsList}
                        keyboardShouldPersistTaps="always"
                        nestedScrollEnabled={true}
                    >
                        {filteredSuggestions.map((item, index) => (
                            <TouchableOpacity
                                key={`${item}-${index}`}
                                style={styles.suggestionItem}
                                onPress={() => handleSelect(item)}
                            >
                                <Feather name="hash" size={16} color={colors.textSecondary} />
                                <Text style={styles.suggestionText}>{item}</Text>
                            </TouchableOpacity>
                        ))}
                        {showAddCustomButton && (
                            <TouchableOpacity
                                style={styles.suggestionItem}
                                onPress={handleAddCustom}
                            >
                                <Feather name="plus" size={16} color={addButtonColor} />
                                <Text style={[styles.suggestionText, { color: addButtonColor, fontWeight: '600' }]}>
                                    Agregar "{query.trim()}"
                                </Text>
                            </TouchableOpacity>
                        )}
                    </ScrollView>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        gap: 10,
        zIndex: 100,
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#374151',
    },
    chipsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    chipText: {
        fontSize: 12,
        fontWeight: '500',
    },
    inputRow: {
        flexDirection: 'row',
        gap: 8,
    },
    input: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1F2937',
    },
    addButton: {
        width: 44,
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    addButtonDisabled: {
        opacity: 0.5,
    },
    suggestionsContainer: {
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: 10,
        maxHeight: 200,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    suggestionsList: {
        maxHeight: 200,
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: '#E5E7EB',
    },
    suggestionText: {
        fontSize: 14,
        color: '#374151',
    },
});
