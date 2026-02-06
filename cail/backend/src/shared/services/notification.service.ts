
import admin from '../infrastructure/config/firebase.config';

export class NotificationService {
    async sendNotification(token: string, title: string, body: string, data?: any): Promise<void> {
        if (!token) {
            console.warn('Attempted to send notification without a token');
            return;
        }

        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            token: token,
        };

        try {
            await admin.messaging().send(message);
            console.log(`Notification sent to ${token}`);
        } catch (error) {
            console.error('Error sending notification:', error);
            if ((error as any).errorInfo?.code === 'messaging/registration-token-not-registered') {
                console.warn('Token invalid, should remove from user');
                // TODO: Handle token removal if possible
            }
        }
    }

    async sendMulticastNotification(tokens: string[], title: string, body: string, data?: any): Promise<void> {
        if (!tokens.length) return;

        const message = {
            notification: {
                title,
                body,
            },
            data: data || {},
            tokens: tokens,
        };

        try {
            const response = await admin.messaging().sendMulticast(message);
            console.log(`${response.successCount} messages were sent successfully`);
        } catch (error) {
            console.error('Error sending multicast notifications:', error);
        }
    }
}
