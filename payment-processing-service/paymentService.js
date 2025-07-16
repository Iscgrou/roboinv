import {
    PaymentDao
} from '../payment-processing-service/paymentDao.js';
import {
    RepresentativeDao
} from '../representative-management-service/representativeDao.js';
import {
    EventDao
} from '../shared/eventDao.js';
import {
    AdminUserDao
} from '../shared/adminUserDao.js'; // Assuming AdminUserDao is in shared
import {
    NotificationService
} from '../notification-service/notificationService.js'; // Import NotificationService

class PaymentService {
    constructor(paymentDao, representativeDao, eventDao, adminUserDao) {
        if (!(paymentDao instanceof PaymentDao)) {
            throw new Error('Invalid PaymentDao instance provided.');
        }
        if (!(representativeDao instanceof RepresentativeDao)) {
            throw new Error('Invalid RepresentativeDao instance provided.');
        }
        if (!(eventDao instanceof EventDao)) {
            throw new Error('Invalid EventDao instance provided.');
        }
        if (!(adminUserDao instanceof AdminUserDao)) {
            throw new Error('Invalid AdminUserDao instance provided.');
        }

        this.paymentDao = paymentDao;
        this.representativeDao = representativeDao;
        this.eventDao = eventDao;
        this.notificationService = new NotificationService(); // Initialize NotificationService
        this.adminUserDao = adminUserDao;
    }

    /**
     * Records a payment received from a representative.
     * @param {object} paymentData - Details of the payment (representativeId, amount, paymentDate, paymentMethod, notes).
     * @param {string} adminUserId - The ID of the administrator recording the payment.
     * @returns {Promise<object>} The recorded payment record.
     */
    async recordPayment(paymentData, adminUserId) {
        // Input Validation
        if (!paymentData || typeof paymentData !== 'object') {
            throw new Error('Invalid payment data provided.');
        }
        if (!paymentData.representativeId) {
            throw new Error('Representative ID is required.');
        }
        if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
            throw new Error('Valid payment amount is required.');
        }
        if (!adminUserId) {
            throw new Error('Admin user ID is required.');
        }

        const representative = await this.representativeDao.getRepresentative(paymentData.representativeId);
        if (!representative) {
            throw new Error(`Representative with ID ${paymentData.representativeId} not found.`);
        }
        const adminUser = await this.adminUserDao.getAdminUserById(adminUserId);
        if (!adminUser) {
            throw new Error(`Admin user with ID ${adminUserId} not found.`);
        }


        try {
            // 1. Record the payment in the payments table
            const paymentRecord = await this.paymentDao.createPayment({
                ...paymentData,
                recorded_by: adminUserId
            });

            // 2. Create and save a PaymentReceived event
            const paymentEvent = {
                entity_type: 'representative',
                entity_id: paymentData.representativeId,
                event_type: 'PaymentReceived',
                event_data: {
                    amount: paymentData.amount,
                    payment_id: paymentRecord.id, // Link event to payment record
                    notes: paymentData.notes,
                    payment_method: paymentData.payment_method
                },
                user_id: adminUserId,
                timestamp: paymentRecord.payment_date // Use payment date as event timestamp
            };
            await this.eventDao.appendEvent(paymentEvent);

            // 3. Apply the event to the representative's state (updates balance)
            // Note: The applyEvent method in RepresentativeDao needs to handle 'PaymentReceived' events
            await this.representativeDao.applyEvent(paymentEvent);

            // Ideally, re-fetch or reconstruct the representative's state here to return the updated state,
            // but for now, we'll just return the payment record.
            // const updatedRepresentative = await this.representativeDao.getRepresentativeState(paymentData.representativeId);

            // 4. Send confirmation notification to the administrator
            const confirmationMessage = `Payment of ${paymentData.amount} recorded for representative ${representative.name}.`;
            try {
                await this.notificationService.sendTelegramMessage(adminUserId, confirmationMessage);
                console.log(`Payment confirmation sent to admin user ${adminUserId}.`);
            } catch (notificationError) {
                console.error(`Failed to send payment confirmation notification to admin ${adminUserId}:`, notificationError);
                // Continue processing even if notification fails, but log the error.
            }

            return paymentRecord;

        } catch (error) {
            console.error('Error recording payment:', error);
            // Depending on your transaction strategy, you might need to handle rollbacks here.
            throw new Error('Failed to record payment.');
        }
    }

    /**
     * Retrieves payment history for a specific representative.
     * @param {string} representativeId - The ID of the representative.
     * @returns {Promise<Array<object>>} A list of payment records.
     */
    async getPaymentsByRepresentative(representativeId) {
        if (!representativeId) {
            throw new Error('Representative ID is required.');
        }

        try {
            return await this.paymentDao.getPaymentsByRepresentativeId(representativeId);
        } catch (error) {
            console.error(`Error retrieving payments for representative ${representativeId}:`, error);
            throw new Error('Failed to retrieve payments.');
        }
    }

    // Other payment-related methods can be added here (e.g., getPaymentDetails, updatePayment, deletePayment)
}

// Export the class
export {
    PaymentService
};