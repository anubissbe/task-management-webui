import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';

export function setupWebSocket(httpServer: HttpServer): SocketIOServer {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-project', (projectId: string) => {
      socket.join(`project-${projectId}`);
      console.log(`Client ${socket.id} joined project ${projectId}`);
    });

    socket.on('leave-project', (projectId: string) => {
      socket.leave(`project-${projectId}`);
      console.log(`Client ${socket.id} left project ${projectId}`);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  return io;
}

// Helper functions to emit events
export function emitProjectUpdate(io: SocketIOServer, projectId: string, data: any): void {
  io.to(`project-${projectId}`).emit('project-updated', data);
}

export function emitTaskUpdate(io: SocketIOServer, projectId: string, data: any): void {
  io.to(`project-${projectId}`).emit('task-updated', data);
}

export function emitTaskCreated(io: SocketIOServer, projectId: string, data: any): void {
  io.to(`project-${projectId}`).emit('task-created', data);
}

export function emitTaskDeleted(io: SocketIOServer, projectId: string, taskId: string): void {
  io.to(`project-${projectId}`).emit('task-deleted', { taskId });
}

export function emitTestResultAdded(io: SocketIOServer, projectId: string, data: any): void {
  io.to(`project-${projectId}`).emit('test-result-added', data);
}