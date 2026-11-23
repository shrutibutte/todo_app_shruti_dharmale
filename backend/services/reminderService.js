const cron = require('node-cron');
const Todo = require('../models/Todo');

const startReminderService = () => {
  // Run every minute
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();

      const dueTodos = await Todo.find({
        reminderAt: { $lte: now },
        reminderSent: false
      });

      if (dueTodos.length > 0) {
        for (const todo of dueTodos) {
          todo.reminderSent = true;
          await todo.save();
        }
        console.log(`Processed ${dueTodos.length} reminder(s)`);
      }
    } catch (error) {
      console.error('Reminder service error:', error.message);
    }
  });

  console.log('Reminder service started');
};

module.exports = { startReminderService };
