import { apiService } from './api.service';
import { API_CONFIG } from './config';
import {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse,
} from '../types/auth.types';

class AuthService {
    /**
     * Login user
     */
    async login(email: string, password: string): Promise<LoginResponse> {
        const request: LoginRequest = { email, password };
        const response = await apiService.post<{ status: string; message: string; data: LoginResponse }>(
            API_CONFIG.ENDPOINTS.LOGIN,
            request
        );

        // Save token from data wrapper
        await apiService.saveToken(response.data.token);

        return response.data;
    }

    /**
     * Register new user
     */
    async register(data: RegisterRequest): Promise<RegisterResponse> {
        const response = await apiService.post<{ status: string; message: string; data: RegisterResponse }>(
            API_CONFIG.ENDPOINTS.REGISTER,
            data
        );

        // Save token from data wrapper
        await apiService.saveToken(response.data.token);

        return response.data;
    }

    /**
     * Change password
     */
    async changePassword(currentPassword: string, newPassword: string): Promise<void> {
        await apiService.post('/auth/change-password', {
            currentPassword,
            newPassword,
        });
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        await apiService.removeToken();
    }

    /**
     * Get stored token
     */
    async getStoredToken(): Promise<string | null> {
        return await apiService.getToken();
    }

    /**
     * Check if user is authenticated
     */
    async isAuthenticated(): Promise<boolean> {
        const token = await this.getStoredToken();
        return token !== null;
    }
}

export const authService = new AuthService();
