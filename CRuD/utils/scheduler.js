import { checkOverdueRentals } from './rentalUtils.js';

export const startScheduler = () => {
    // Check overdue rentals every hour
    setInterval(async () => {
        try {
            console.log('Running scheduled overdue rentals check...');
            const result = await checkOverdueRentals();
            console.log('Overdue check completed:', result);
        } catch (error) {
            console.error('Scheduled task error:', error);
        }
    }, 60 * 60 * 1000); // 1 hour

    console.log('Rental scheduler started');
};