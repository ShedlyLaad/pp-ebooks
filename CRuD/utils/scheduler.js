import { checkOverdueRentals, checkDueRentals } from './rentalUtils.js';
import { checkUpcomingDueRentals } from './scheduledTasks.js';

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

    // Check upcoming due rentals every 30 minutes
    setInterval(async () => {
        try {
            console.log('Running scheduled due rentals check...');
            const result = await checkUpcomingDueRentals();
            console.log('Due rentals check completed:', result);
        } catch (error) {
            console.error('Due rentals check error:', error);
        }
    }, 30 * 60 * 1000); // 30 minutes

    console.log('Rental scheduler started');
};