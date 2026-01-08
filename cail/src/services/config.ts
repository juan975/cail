export const API_CONFIG = {
    // URLs de Microservicios en Producción (GCP)
    SERVICES: {
        USUARIOS: 'https://us-central1-cail-backend-prod.cloudfunctions.net/usuarios',
        OFERTAS: 'https://us-central1-cail-backend-prod.cloudfunctions.net/ofertas',
        MATCHING: 'https://us-central1-cail-backend-prod.cloudfunctions.net/matching',
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
