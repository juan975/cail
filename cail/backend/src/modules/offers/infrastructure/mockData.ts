
export const MOCK_OFFERS = [
    {
        idOferta: 1,
        titulo: "Desarrollador Backend Senior",
        empresa: {
            id: 1,
            nombre: "Tech Solutions",
            logoUrl: "https://via.placeholder.com/150",
            ubicacion: "Loja, Ecuador"
        },
        descripcion: "Expert Node.js developer needed.",
        modalidad: "Remoto",
        ciudad: "Loja",
        salario: 2500,
        estado: "ACTIVA",
        fechaPublicacion: new Date().toISOString()
    },
    {
        idOferta: 2,
        titulo: "Desarrollador Frontend React",
        empresa: {
            id: 2,
            nombre: "Creative Agency",
            logoUrl: "https://via.placeholder.com/150",
            ubicacion: "Quito, Ecuador"
        },
        descripcion: "React Native specialist.",
        modalidad: "Presencial",
        ciudad: "Quito",
        salario: 1800,
        estado: "ACTIVA",
        fechaPublicacion: new Date().toISOString()
    }
];
