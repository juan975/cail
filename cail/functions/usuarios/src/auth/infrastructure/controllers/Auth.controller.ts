import { Request, Response } from 'express';
import { RegisterUserUseCase } from '../../application/use-cases/RegisterUser.usecase';
import { LoginUserUseCase } from '../../application/use-cases/LoginUser.usecase';
import { ChangePasswordUseCase } from '../../application/use-cases/ChangePassword.usecase';
import { FirestoreAccountRepository } from '../repositories/FirestoreAccountRepository';
import { FirestoreEmpresaRepository } from '../repositories/FirestoreEmpresaRepository';
import { ApiResponse } from '../../../shared/utils/response.util';
import { asyncHandler, AppError } from '../../../shared/middleware/error.middleware';
import { AuthRequest } from '../../../shared/middleware/auth.middleware';

/**
 * Controlador de autenticación con Firebase Auth
 * 
 * Cambios respecto a la versión anterior (JWT custom):
 * - /auth/login ya no valida contraseñas (eso lo hace Firebase Auth en el frontend)
 * - /auth/register para candidatos espera firebaseUid del frontend
 * - /auth/register para empleadores crea el usuario en Firebase Auth con contraseña temporal
 * - /auth/register valida RUC de reclutadores contra colección empresas
 * - /auth/password-changed solo actualiza el flag en Firestore
 */
export class AuthController {
    private registerUseCase: RegisterUserUseCase;
    private loginUseCase: LoginUserUseCase;
    private changePasswordUseCase: ChangePasswordUseCase;

    constructor() {
        const accountRepository = new FirestoreAccountRepository();
        const empresaRepository = new FirestoreEmpresaRepository();
        this.registerUseCase = new RegisterUserUseCase(accountRepository, empresaRepository);
        this.loginUseCase = new LoginUserUseCase(accountRepository);
        this.changePasswordUseCase = new ChangePasswordUseCase(accountRepository);
    }

    /**
     * POST /auth/register
     * Registra un nuevo usuario
     * 
     * Para CANDIDATOS: Requiere firebaseUid (frontend ya creó el usuario en Firebase Auth)
     * Para EMPLEADORES: Crea usuario en Firebase Auth y envía contraseña temporal por email
     */
    register = asyncHandler(async (req: Request, res: Response) => {
        const result = await this.registerUseCase.execute(req.body);
        ApiResponse.created(res, result, 'User registered successfully');
    });

    /**
     * GET /auth/companies
     * Obtiene lista de empresas validadas para el registro
     */
    getCompanies = asyncHandler(async (req: Request, res: Response) => {
        const empresaRepository = new FirestoreEmpresaRepository();
        const companies = await empresaRepository.getAll();
        ApiResponse.success(res, companies, 'Companies retrieved successfully');
    });

    /**
     * GET /auth/profile (requiere autenticación)
     * Obtiene el perfil del usuario autenticado
     * 
     * Este endpoint reemplaza al antiguo /auth/login para obtener datos del usuario
     * El login real ocurre en el frontend con Firebase Auth
     */
    getProfile = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            throw new AppError(401, 'Unauthorized');
        }
        const result = await this.loginUseCase.getProfileByUid(userId);
        ApiResponse.success(res, result, 'Profile retrieved successfully');
    });

    /**
     * POST /auth/password-changed
     * Confirma que el usuario cambió su contraseña en Firebase Auth
     * 
     * El cambio de contraseña real ocurre en el frontend usando Firebase Auth SDK.
     * Este endpoint solo actualiza needsPasswordChange: false en Firestore.
     */
    confirmPasswordChanged = asyncHandler(async (req: AuthRequest, res: Response) => {
        const userId = req.user?.uid;
        if (!userId) {
            throw new AppError(401, 'Unauthorized');
        }
        await this.changePasswordUseCase.confirmPasswordChanged(userId);
        ApiResponse.success(res, null, 'Password change confirmed');
    });

    /**
     * POST /auth/validate-token
     * Valida un Firebase ID Token (para comunicación entre servicios)
     * 
     * Si el middleware de autenticación deja pasar la petición,
     * el token es válido.
     */
    validateToken = asyncHandler(async (req: AuthRequest, res: Response) => {
        if (!req.user) {
            throw new AppError(401, 'Invalid token');
        }

        // Obtener perfil completo para incluir tipoUsuario
        const profile = await this.loginUseCase.getProfileByUid(req.user.uid);

        ApiResponse.success(res, {
            valid: true,
            user: {
                uid: req.user.uid,
                email: req.user.email,
                tipoUsuario: profile.tipoUsuario,
            }
        }, 'Token is valid');
    });

    // =========================================
    // DEPRECATED ENDPOINTS (mantener por compatibilidad temporal)
    // =========================================

    /**
     * @deprecated Use Firebase Auth SDK for login, then call /auth/profile
     * POST /auth/login - Mantener por compatibilidad
     */
    login = asyncHandler(async (req: AuthRequest, res: Response) => {
        // Este endpoint ya no hace autenticación real
        // Solo retorna error indicando el nuevo flujo
        throw new AppError(400,
            'Login endpoint deprecated. Use Firebase Auth SDK for authentication, ' +
            'then call GET /auth/profile with the Firebase ID Token.'
        );
    });

    /**
     * @deprecated Use Firebase Auth SDK for password change
     * POST /auth/change-password - Mantener para mensajes de migración
     */
    changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
        throw new AppError(400,
            'Password change via backend deprecated. Use Firebase Auth SDK ' +
            '(updatePassword), then call POST /auth/password-changed'
        );
    });

    /**
     * GET /auth/verify-email?token=xxx
     * Verifica el email de un reclutador usando el Magic Link
     * 
     * Al hacer clic en el enlace del email:
     * 1. Valida que el token existe y no ha expirado
     * 2. Marca emailVerified: true en el perfil del usuario
     * 3. Redirige a una página de éxito
     */
    verifyEmail = asyncHandler(async (req: Request, res: Response) => {
        const { token } = req.query;

        if (!token || typeof token !== 'string') {
            return res.status(400).send(this.getVerificationErrorPage('Token de verificación no proporcionado'));
        }

        const accountRepository = new FirestoreAccountRepository();

        // Buscar usuario por token de verificación
        const account = await accountRepository.findByVerificationToken(token);

        if (!account) {
            return res.status(400).send(this.getVerificationErrorPage('Token de verificación inválido o ya utilizado'));
        }

        // Verificar que el token no ha expirado
        const tokenExpiry = account.employerProfile?.emailVerificationExpiry;
        if (tokenExpiry && new Date() > new Date(tokenExpiry)) {
            return res.status(400).send(this.getVerificationErrorPage('El enlace de verificación ha expirado. Por favor solicita uno nuevo.'));
        }

        // Marcar email como verificado
        await accountRepository.markEmailAsVerified(account.idCuenta.getValue());

        console.log('✅ Email verified for:', account.email.getValue());

        // Redirigir a página de éxito
        return res.send(this.getVerificationSuccessPage(account.nombreCompleto));
    });

    /**
     * GET /auth/test-email?email=xxx
     * Endpoint de prueba para verificar envío de correos
     */
    testEmail = asyncHandler(async (req: Request, res: Response) => {
        const email = req.query.email as string;
        if (!email) {
            throw new AppError(400, 'Query param email is required');
        }

        try {
            // Importar emailService localmente para este test si es necesario, 
            // pero mejor usar el import global
            const { emailService } = require('../../../shared/services/email.service');

            console.log('🧪 Attempting to send test email to:', email);

            await emailService.sendAuthorizationRequest(
                email,
                'TEST RECRUITER',
                'TEST COMPANY',
                '1234567890001',
                'test_token_123'
            );

            res.status(200).json({
                status: 'success',
                message: 'Test email sent successfully',
                data: { sentTo: email }
            });
        } catch (error: any) {
            console.error('🧪 Test email failed:', error);
            res.status(500).json({
                status: 'error',
                message: 'Test email failed',
                error: error.message,
                details: error,
                env: {
                    userConfigured: !!process.env.GMAIL_USER,
                    passConfigured: !!process.env.GMAIL_APP_PASSWORD,
                    userLen: process.env.GMAIL_USER?.length,
                }
            });
        }
    });

    /**
     * Genera página HTML de éxito de verificación
     */
    private getVerificationSuccessPage(name: string): string {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Verificado - CAIL</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            background: white;
            border-radius: 20px;
            padding: 48px;
            max-width: 480px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .icon { font-size: 64px; margin-bottom: 24px; }
        h1 { color: #1e293b; font-size: 28px; margin-bottom: 16px; }
        p { color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
        .name { color: #10b981; font-weight: 600; }
        .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
            color: white;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 12px;
            font-weight: 600;
            font-size: 16px;
            transition: transform 0.2s;
        }
        .button:hover { transform: translateY(-2px); }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">✅</div>
        <h1>¡Email Verificado!</h1>
        <p>Hola <span class="name">${name}</span>, tu correo electrónico ha sido verificado exitosamente.</p>
        <p>Ya puedes iniciar sesión en la aplicación CAIL con tus credenciales.</p>
        <a href="#" class="button">Ir a CAIL</a>
    </div>
</body>
</html>`;
    }

    /**
     * Genera página HTML de error de verificación
     */
    private getVerificationErrorPage(message: string): string {
        return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Error de Verificación - CAIL</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .card {
            background: white;
            border-radius: 20px;
            padding: 48px;
            max-width: 480px;
            text-align: center;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .icon { font-size: 64px; margin-bottom: 24px; }
        h1 { color: #1e293b; font-size: 28px; margin-bottom: 16px; }
        p { color: #64748b; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
        .error { color: #ef4444; }
    </style>
</head>
<body>
    <div class="card">
        <div class="icon">❌</div>
        <h1>Error de Verificación</h1>
        <p class="error">${message}</p>
        <p>Si el problema persiste, contacta a soporte.</p>
    </div>
</body>
</html>`;
    }
}
