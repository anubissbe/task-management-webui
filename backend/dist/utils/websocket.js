"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupWebSocket = setupWebSocket;
exports.emitProjectUpdate = emitProjectUpdate;
exports.emitTaskUpdate = emitTaskUpdate;
exports.emitTaskCreated = emitTaskCreated;
exports.emitTaskDeleted = emitTaskDeleted;
exports.emitTestResultAdded = emitTestResultAdded;
const socket_io_1 = require("socket.io");
function setupWebSocket(httpServer) {
    const io = new socket_io_1.Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            methods: ['GET', 'POST']
        }
    });
    io.on('connection', (socket) => {
        console.log('Client connected:', socket.id);
        socket.on('join-project', (projectId) => {
            socket.join(`project-${projectId}`);
            console.log(`Client ${socket.id} joined project ${projectId}`);
        });
        socket.on('leave-project', (projectId) => {
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
function emitProjectUpdate(io, projectId, data) {
    io.to(`project-${projectId}`).emit('project-updated', data);
}
function emitTaskUpdate(io, projectId, data) {
    io.to(`project-${projectId}`).emit('task-updated', data);
}
function emitTaskCreated(io, projectId, data) {
    io.to(`project-${projectId}`).emit('task-created', data);
}
function emitTaskDeleted(io, projectId, taskId) {
    io.to(`project-${projectId}`).emit('task-deleted', { taskId });
}
function emitTestResultAdded(io, projectId, data) {
    io.to(`project-${projectId}`).emit('test-result-added', data);
}
