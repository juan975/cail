
import admin from '../src/shared/infrastructure/config/firebase.config';
import { NotificationService } from '../src/shared/services/notification.service';

async function main() {
    process.env.FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'cail-backend-prod';

    console.log('🚀 Starting Push Notification Test...');

    const db = admin.firestore();
    const notificationService = new NotificationService();

    try {
        // 1. Debug: List all users to verify connection
        console.log('🔎 Debugging: Listing first 5 users in DB (usuarios)...');
        const allUsers = await db.collection('usuarios').limit(5).get();

        if (allUsers.empty) {
            console.log('⚠️ The "usuarios" collection is EMPTY.');
        } else {
            console.log(`✅ Found ${allUsers.size} users in collection.`);
            allUsers.docs.forEach(doc => {
                const data = doc.data();
                console.log(`- User: ${data.email}, PushToken: ${data.pushToken ? '✅ YES' : '❌ NO'}`);
            });
        }

        // 2. Find a user with a pushToken
        console.log('\n🔎 Searching for a user with a pushToken...');
        const usersSnapshot = await db.collection('usuarios')
            .where('pushToken', '!=', null)
            .limit(1)
            .get();

        if (usersSnapshot.empty) {
            console.error('❌ No users found with a pushToken.');
            console.log('👉 Possible reasons:');
            console.log('   1. The App on your phone has not yet obtained a token (Permissions not granted?).');
            console.log('   2. The App failed to send it to the backend.');
            console.log('   3. You are logged in with a different user than the one you are checking.');
            process.exit(1);
        }

        const userDoc = usersSnapshot.docs[0];
        const userData = userDoc.data();
        const token = userData.pushToken;
        const email = userData.email;

        console.log(`✅ Found user: ${email}`);
        console.log(`📱 Token: ${token.substring(0, 20)}...`);

        // 3. Send Notification
        console.log('📨 Sending test notification...');
        await notificationService.sendNotification(
            token,
            "Prueba desde Backend 🚀",
            "Si estás viendo esto, ¡las notificaciones funcionan correctamente!",
            { test: 'true', timestamp: new Date().toISOString() }
        );

        console.log('✨ Notification sent successfully!');

    } catch (error) {
        console.error('❌ Error testing notifications:', error);
    } finally {
        process.exit();
    }
}

main();
