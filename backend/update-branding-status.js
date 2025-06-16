const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function updateTasks() {
  try {
    // Update branding consistency task
    const task1 = await prisma.task.updateMany({
      where: {
        title: 'Improve branding consistency - ensure all UI elements use the black (#0a0a0a) and orange (#ff6500) color scheme throughout the application'
      },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });
    console.log('Updated branding consistency task:', task1.count);

    // Update logo navigation task
    const task2 = await prisma.task.updateMany({
      where: {
        title: 'Make top logo clickable to navigate back to home page (/) of the task manager'
      },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });
    console.log('Updated logo navigation task:', task2.count);

    // Update GitHub link task
    const task3 = await prisma.task.updateMany({
      where: {
        title: 'Add GitHub logo/link in footer that opens https://github.com/anubissbe/ProjectHub-Mcp in new tab'
      },
      data: {
        status: 'completed',
        completedAt: new Date()
      }
    });
    console.log('Updated GitHub link task:', task3.count);

    console.log('All tasks updated successfully');
  } catch (error) {
    console.error('Error updating tasks:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateTasks();