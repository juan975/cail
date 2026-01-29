import crypto from 'crypto';

/**
 * Genera una contraseña aleatoria segura
 * Usa crypto.randomBytes() que es criptográficamente seguro
 * (Math.random() NO es seguro para generar contraseñas)
 */
export const generatePassword = (length: number = 12): string => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+';
    const randomBytes = crypto.randomBytes(length);
    let retVal = '';
    for (let i = 0; i < length; i++) {
        retVal += charset.charAt(randomBytes[i] % charset.length);
    }
    return retVal;
};
