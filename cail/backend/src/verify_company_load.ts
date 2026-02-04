
import axios from 'axios';

async function verify() {
    try {
        const response = await axios.get('http://localhost:8080/api/v1/offers');
        console.log('✅ Offers loaded:', response.data.data.length);
        console.log('🏢 Companies found:', response.data.data.map((o: any) => o.empresa.nombre));
    } catch (error: any) {
        console.error('❌ Failed to load offers:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        }
    }
}

verify();
