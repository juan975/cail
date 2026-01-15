import nodemailer from 'nodemailer';
import { config } from '../../config/env.config';

/**
 * Servicio de envío de emails usando Nodemailer con Gmail SMTP
 * En desarrollo sin credenciales, solo loggea los emails
 */
class EmailService {
    private transporter: nodemailer.Transporter | null = null;
    private isDevelopment: boolean;
    private fromEmail: string;

    // Colores corporativos CAIL
    private readonly brandColors = {
        primary: '#2563eb',      // Azul principal
        primaryDark: '#1d4ed8',  // Azul oscuro
        secondary: '#0f172a',    // Negro/gris oscuro
        background: '#f8fafc',   // Gris claro de fondo
        white: '#ffffff',
        textPrimary: '#1e293b',
        textSecondary: '#64748b',
        success: '#10b981',
        warning: '#f59e0b',
    };

    constructor() {
        this.isDevelopment = config.nodeEnv === 'development';
        this.fromEmail = config.email.gmailUser;

        // Solo inicializar transporter si hay credenciales de Gmail
        if (config.email.gmailUser && config.email.gmailAppPassword) {
            this.transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: config.email.gmailUser,
                    pass: config.email.gmailAppPassword,
                },
            });
            console.log('✅ Gmail SMTP configured successfully');
        } else {
            console.warn('⚠️ Gmail credentials not configured. Emails will be logged to console.');
        }
    }

    /**
     * Genera el template base del email con estilos profesionales
     */
    private getBaseTemplate(content: string): string {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CAIL</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: ${this.brandColors.background};">
    <table role="presentation" style="width: 100%; border-collapse: collapse;">
        <tr>
            <td align="center" style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: ${this.brandColors.white}; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); overflow: hidden;">
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.primaryDark} 100%); padding: 32px 40px; text-align: center;">
                            <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: ${this.brandColors.white}; letter-spacing: -0.5px;">CAIL</h1>
                            <p style="margin: 8px 0 0 0; font-size: 14px; color: rgba(255,255,255,0.85); font-weight: 400;">Sistema de Reclutamiento Inteligente</p>
                        </td>
                    </tr>
                    
                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px;">
                            ${content}
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="background-color: ${this.brandColors.background}; padding: 24px 40px; border-top: 1px solid #e2e8f0;">
                            <p style="margin: 0 0 8px 0; font-size: 12px; color: ${this.brandColors.textSecondary}; text-align: center;">
                                Este es un correo automático, por favor no responda a este mensaje.
                            </p>
                            <p style="margin: 0; font-size: 12px; color: ${this.brandColors.textSecondary}; text-align: center;">
                                © ${new Date().getFullYear()} CAIL - Todos los derechos reservados
                            </p>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
    </table>
</body>
</html>`;
    }

    /**
     * Envía email con enlace para establecer contraseña (Password Reset Link)
     */
    async sendPasswordResetLink(email: string, link: string, name: string): Promise<void> {
        const content = `
            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${this.brandColors.textPrimary};">
                ¡Hola ${name}! 👋
            </h2>
            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${this.brandColors.textSecondary};">
                Te damos la bienvenida a <strong style="color: ${this.brandColors.primary};">CAIL</strong>. Tu cuenta de empleador ha sido creada satisfactoriamente.
            </p>
            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${this.brandColors.textSecondary};">
                Para completar la configuración de tu cuenta y acceder a la plataforma, por favor establece tu contraseña segura haciendo clic en el siguiente botón:
            </p>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="${link}" style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.primaryDark} 100%); color: ${this.brandColors.white}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);">
                    Establecer Contraseña
                </a>
            </div>
            
            <p style="margin: 24px 0 0 0; font-size: 14px; color: ${this.brandColors.textSecondary}; text-align: center;">
                Si el botón no funciona, copia y pega el siguiente enlace en tu navegador:<br>
                <a href="${link}" style="color: ${this.brandColors.primary}; word-break: break-all;">${link}</a>
            </p>
            
             <div style="background-color: #fef2f2; border-radius: 8px; padding: 16px; margin: 24px 0;">
                <p style="margin: 0; font-size: 14px; color: #991b1b;">
                    ⚠️ <strong>Nota:</strong> Este enlace expirará en 24 horas por seguridad.
                </p>
            </div>
        `;

        const mailOptions = {
            from: `CAIL <${this.fromEmail}>`,
            to: email,
            subject: '🔐 Configura tu contraseña de CAIL',
            html: this.getBaseTemplate(content),
        };

        if (this.transporter) {
            try {
                await this.transporter.sendMail(mailOptions);
                console.log(`✅ Password reset email sent to: ${email}`);
            } catch (error) {
                console.error('❌ Error sending reset email:', error);
                throw new Error('Error enviando el correo de restablecimiento');
            }
        } else {
            console.log('📧 [DEV] Reset link would be sent:', {
                to: email,
                link: link
            });
        }
    }

    /**
     * Envía email con contraseña temporal a empleadores
     */
    async sendTemporaryPassword(email: string, password: string, name: string): Promise<void> {
        const content = `
            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${this.brandColors.textPrimary};">
                ¡Hola ${name}! 👋
            </h2>
            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${this.brandColors.textSecondary};">
                Te damos la bienvenida a <strong style="color: ${this.brandColors.primary};">CAIL</strong>. Tu cuenta de empleador ha sido creada satisfactoriamente.
            </p>
            <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 1.6; color: ${this.brandColors.textSecondary};">
                Para acceder a tu cuenta, utiliza la siguiente contraseña temporal:
            </p>
            
            <!-- Contraseña Temporal Box -->
            <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 24px; margin: 24px 0; text-align: center; border: 2px dashed ${this.brandColors.primary};">
                <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; color: ${this.brandColors.textSecondary}; text-transform: uppercase; letter-spacing: 1px;">
                    Tu contraseña temporal
                </p>
                <p style="margin: 0; font-size: 24px; font-weight: 700; color: ${this.brandColors.primary}; font-family: 'Courier New', monospace; letter-spacing: 2px;">
                    ${password}
                </p>
            </div>
            
            <div style="background-color: #fef3c7; border-radius: 8px; padding: 16px; margin: 24px 0; border-left: 4px solid #f59e0b;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                    <strong>⚠️ Importante:</strong> Al iniciar sesión, se te pedirá que cambies esta contraseña temporal por una contraseña segura de tu elección.
                </p>
            </div>
            
            <p style="margin: 24px 0 0 0; font-size: 14px; color: ${this.brandColors.textSecondary};">
                <strong>Pasos a seguir:</strong>
            </p>
            <ol style="margin: 8px 0 0 0; padding-left: 20px; color: ${this.brandColors.textSecondary}; font-size: 14px; line-height: 2;">
                <li>Abre la aplicación CAIL</li>
                <li>Selecciona "Empleador" e "Iniciar Sesión"</li>
                <li>Ingresa tu correo y la contraseña temporal</li>
                <li>Crea tu nueva contraseña segura</li>
            </ol>
        `;

        const mailOptions = {
            from: `CAIL <${this.fromEmail}>`,
            to: email,
            subject: '🔐 Tu contraseña temporal de CAIL',
            html: this.getBaseTemplate(content),
        };

        if (this.transporter) {
            try {
                await this.transporter.sendMail(mailOptions);
                console.log(`✅ Temporary password email sent to: ${email}`);
            } catch (error) {
                console.error('❌ Error sending temporary password email:', error);
                throw new Error('Error enviando el correo con contraseña temporal');
            }
        } else {
            console.log('📧 [DEV] Temporary password email would be sent:', {
                to: email,
                password: password
            });
        }
    }

    /**
     * Envía email de bienvenida a nuevos usuarios
     */
    async sendWelcomeEmail(email: string, name: string): Promise<void> {
        const content = `
            <div style="text-align: center; margin-bottom: 24px;">
                <span style="font-size: 48px;">🎉</span>
            </div>
            
            <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: ${this.brandColors.textPrimary}; text-align: center;">
                ¡Bienvenido ${name}!
            </h2>
            
            <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 1.6; color: ${this.brandColors.textSecondary}; text-align: center;">
                Tu cuenta en <strong style="color: ${this.brandColors.primary};">CAIL</strong> ha sido creada exitosamente. Ya eres parte de nuestra comunidad de profesionales.
            </p>
            
            <!-- Features -->
            <div style="background-color: ${this.brandColors.background}; border-radius: 12px; padding: 24px; margin: 24px 0;">
                <p style="margin: 0 0 16px 0; font-size: 14px; font-weight: 600; color: ${this.brandColors.textPrimary};">
                    ✨ Con CAIL podrás:
                </p>
                <ul style="margin: 0; padding-left: 20px; color: ${this.brandColors.textSecondary}; font-size: 14px; line-height: 2;">
                    <li>Explorar ofertas laborales que coincidan con tu perfil</li>
                    <li>Recibir recomendaciones personalizadas</li>
                    <li>Aplicar a posiciones con un solo clic</li>
                    <li>Seguir el estado de tus postulaciones</li>
                </ul>
            </div>
            
            <!-- Success Badge -->
            <div style="background: linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%); border-radius: 8px; padding: 16px; margin: 24px 0; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #065f46;">
                    ✅ Tu cuenta está activa y lista para usar
                </p>
            </div>
            
            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, ${this.brandColors.primary} 0%, ${this.brandColors.primaryDark} 100%); color: ${this.brandColors.white}; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 14px 0 rgba(37, 99, 235, 0.4);">
                    Explorar Ofertas
                </a>
            </div>
            
            <p style="margin: 24px 0 0 0; font-size: 14px; color: ${this.brandColors.textSecondary}; text-align: center;">
                ¿Tienes preguntas? Estamos aquí para ayudarte.
            </p>
        `;

        const mailOptions = {
            from: `CAIL <${this.fromEmail}>`,
            to: email,
            subject: '🎉 ¡Bienvenido a CAIL!',
            html: this.getBaseTemplate(content),
        };

        if (this.transporter) {
            try {
                await this.transporter.sendMail(mailOptions);
                console.log(`✅ Welcome email sent to: ${email}`);
            } catch (error) {
                console.error('❌ Error sending welcome email:', error);
                throw new Error('Error enviando el correo de bienvenida');
            }
        } else {
            console.log('📧 [DEV] Welcome email would be sent:', {
                to: email,
                subject: mailOptions.subject
            });
        }
    }
}

export const emailService = new EmailService();
