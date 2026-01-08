import { Resend } from 'resend';
import { config } from '../config/env.config';

class EmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(config.email.apiKey);
    }

    async sendTemporaryPassword(email: string, password: string, name: string): Promise<void> {
        await this.resend.emails.send({
            from: 'CAIL <onboarding@resend.dev>',
            to: email,
            subject: 'Tu contraseña temporal de CAIL',
            html: `
                <h1>Hola ${name},</h1>
                <p>Te damos la bienvenida a CAIL. Tu cuenta de empleador ha sido creada satisfatoriamente.</p>
                <p>Tu contraseña temporal es: <strong>${password}</strong></p>
                <p>Por favor, cámbiala después de iniciar sesión por primera vez.</p>
            `,
        });
    }
}

export const emailService = new EmailService();
