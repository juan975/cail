import { useState, useCallback } from 'react';
import { colors } from '../theme/colors';

interface CvUploadDropzoneProps {
    cvUrl: string | null;
    onUpload: (file: File) => Promise<void>;
    onDelete: () => Promise<void>;
    uploading: boolean;
}

export function CvUploadDropzone({ cvUrl, onUpload, onDelete, uploading }: CvUploadDropzoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const files = e.dataTransfer.files;
        if (files.length === 0) return;

        const file = files[0];
        if (file.type !== 'application/pdf') {
            setError('Solo se permiten archivos PDF');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('El archivo no puede superar 5MB');
            return;
        }

        await onUpload(file);
    }, [onUpload]);

    const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];
        if (file.type !== 'application/pdf') {
            setError('Solo se permiten archivos PDF');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('El archivo no puede superar 5MB');
            return;
        }

        await onUpload(file);
    }, [onUpload]);

    const getFileName = (url: string) => {
        try {
            const parts = url.split('/');
            return parts[parts.length - 1];
        } catch {
            return 'CV subido';
        }
    };

    if (cvUrl) {
        return (
            <div style={styles.uploadedContainer}>
                <div style={styles.fileIcon}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14,2 14,8 20,8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10,9 9,9 8,9" />
                    </svg>
                </div>
                <div style={styles.fileInfo}>
                    <span style={styles.fileName}>{getFileName(cvUrl)}</span>
                    <a href={cvUrl} target="_blank" rel="noopener noreferrer" style={styles.viewLink}>
                        Ver CV
                    </a>
                </div>
                <button onClick={onDelete} disabled={uploading} style={styles.deleteButton}>
                    {uploading ? '...' : '✕'}
                </button>
            </div>
        );
    }

    return (
        <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
                ...styles.dropzone,
                ...(isDragging ? styles.dropzoneActive : {}),
                ...(uploading ? styles.dropzoneDisabled : {}),
            }}
        >
            <input
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                style={styles.fileInput}
                id="cv-upload"
                disabled={uploading}
            />
            <label htmlFor="cv-upload" style={styles.dropzoneLabel}>
                <div style={styles.uploadIcon}>
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17,8 12,3 7,8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                </div>
                <span style={styles.dropzoneText}>
                    {uploading ? 'Subiendo...' : 'Arrastra tu CV aquí o haz clic para seleccionar'}
                </span>
                <span style={styles.dropzoneSubtext}>PDF • Máximo 5MB</span>
            </label>
            {error && <div style={styles.error}>{error}</div>}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    dropzone: {
        border: '2px dashed #E5E7EB',
        borderRadius: 12,
        padding: 32,
        textAlign: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: '#FAFAFA',
    },
    dropzoneActive: {
        borderColor: '#0B7A4D',
        backgroundColor: '#F0FDF4',
    },
    dropzoneDisabled: {
        opacity: 0.6,
        cursor: 'not-allowed',
    },
    dropzoneLabel: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
        cursor: 'pointer',
    },
    uploadIcon: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#F3F4F6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    dropzoneText: {
        fontSize: 14,
        fontWeight: 600,
        color: colors.textPrimary,
    },
    dropzoneSubtext: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    fileInput: {
        display: 'none',
    },
    uploadedContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: 16,
        backgroundColor: '#FEF2F2',
        borderRadius: 12,
        border: '1px solid #FECACA',
    },
    fileIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#FEE2E2',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    fileInfo: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
    },
    fileName: {
        fontSize: 14,
        fontWeight: 600,
        color: colors.textPrimary,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    viewLink: {
        fontSize: 12,
        color: '#0B7A4D',
        textDecoration: 'none',
    },
    deleteButton: {
        width: 32,
        height: 32,
        borderRadius: 8,
        border: 'none',
        backgroundColor: '#DC2626',
        color: '#FFFFFF',
        cursor: 'pointer',
        fontSize: 16,
        fontWeight: 600,
    },
    error: {
        marginTop: 12,
        padding: '8px 12px',
        backgroundColor: '#FEE2E2',
        color: '#DC2626',
        borderRadius: 8,
        fontSize: 13,
    },
};
