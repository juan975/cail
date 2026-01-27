export const API_CONFIG = {
    // URLs de Microservicios en Producción (GCP)
    SERVICES: {
        USUARIOS: '/api/usuarios',
        OFERTAS: '/api/ofertas',
        MATCHING: '/api', // Routes already include /matching prefix
    },
    TIMEOUT: 15000,
    ENDPOINTS: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        PROFILE: '/users/profile',
        OFFERS: '/offers',
        MATCHING: '/matching',
    },
};
