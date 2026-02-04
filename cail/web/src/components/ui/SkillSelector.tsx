import { useState, useEffect, useRef } from 'react';
import { catalogsService, CatalogItem } from '../../services/catalogs.service';
import { Chip } from './Chip';
import { FiSearch, FiPlus, FiHash, FiLoader } from 'react-icons/fi';

interface SkillSelectorProps {
    selectedSkills: string[];
    onChange: (skills: string[]) => void;
    maxSkills?: number;
    label?: string;
    placeholder?: string;
    chipVariant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray';
    customChipBg?: string;
    customChipText?: string;
}

export function SkillSelector({
    selectedSkills,
    onChange,
    maxSkills = 15,
    label = 'Habilidades',
    placeholder = 'Buscar habilidades...',
    chipVariant = 'gray',
    customChipBg,
    customChipText
}: SkillSelectorProps) {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState<CatalogItem[]>([]);
    const [loading, setLoading] = useState(false);
    const searchTimeout = useRef<number | null>(null);
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
            let results: CatalogItem[] = [];
            try {
                results = await catalogsService.searchSkills(query);
            } catch (error) {
                console.warn('Error fetching skills catalog, using local input only', error);
                results = [];
            } finally {
                // Filtramos las que ya están seleccionadas
                const filtered = results.filter(s => !selectedSkills.includes(s.name));

                // Verificamos si hay match exacto (case insensitive)
                const exactMatch = results.find(s => s.name.toLowerCase() === query.toLowerCase().trim());

                // Si no hay match exacto y hay texto, permitimos crear nueva
                const queryTrimmed = query.trim();
                const isAlreadySelected = selectedSkills.some(s => s.toLowerCase() === queryTrimmed.toLowerCase());

                if (!exactMatch && !isAlreadySelected && queryTrimmed.length > 0) {
                    filtered.push({ id: 'new', name: queryTrimmed, type: 'HARD' });
                }

                setSuggestions(filtered);
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', position: 'relative', width: '100%' }}>
            <label style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>{label}</label>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                {selectedSkills.map(skill => (
                    <Chip
                        key={skill}
                        label={skill}
                        variant={chipVariant}
                        customBg={customChipBg}
                        customText={customChipText}
                        onRemove={() => handleRemove(skill)}
                    />
                ))}
            </div>

            <div style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '1px solid #E5E7EB',
                borderRadius: '12px',
                padding: '10px 14px',
                background: '#FFFFFF',
                transition: 'border-color 0.2s',
            }}>
                <FiSearch color="#9CA3AF" size={18} />
                <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={selectedSkills.length >= maxSkills ? `Límite alcanzado (${maxSkills})` : placeholder}
                    disabled={selectedSkills.length >= maxSkills}
                    style={{
                        border: 'none',
                        outline: 'none',
                        width: '100%',
                        fontSize: '14px',
                        color: '#1F2937'
                    }}
                />
                {loading && (
                    <div style={{ animation: 'spin 1s linear infinite' }}>
                        <FiLoader color="#4B5563" />
                    </div>
                )}
            </div>

            {showSuggestions && suggestions.length > 0 && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: '4px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                    zIndex: 50,
                    maxHeight: '240px',
                    overflowY: 'auto'
                }}>
                    {suggestions.map((item) => (
                        <button
                            key={item.id === 'new' ? `new-${item.name}` : item.id}
                            onClick={() => handleSelect(item.name)}
                            type="button"
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                width: '100%',
                                padding: '12px 14px',
                                border: 'none',
                                background: 'transparent',
                                textAlign: 'left',
                                cursor: 'pointer',
                                fontSize: '14px',
                                color: '#374151',
                                borderBottom: '1px solid #F3F4F6'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                            {item.id === 'new' ? <FiPlus color="#4F46E5" size={16} /> : <FiHash color="#9CA3AF" size={16} />}
                            <span style={item.id === 'new' ? { color: '#4F46E5', fontWeight: 600 } : {}}>
                                {item.id === 'new' ? `Agregar "${item.name}"` : item.name}
                            </span>
                        </button>
                    ))}
                </div>
            )}
            <style>{`
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
