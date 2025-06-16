"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = require("http");
const routes_1 = __importDefault(require("./routes"));
const errorHandler_1 = require("./middleware/errorHandler");
const database_1 = require("./config/database");
const websocket_1 = require("./utils/websocket");
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
const io = (0, websocket_1.setupWebSocket)(httpServer);
// Make io available to routes
app.set('io', io);
// Security middleware
app.disable('x-powered-by'); // Remove x-powered-by header
// Set security headers and fix content types
app.use((req, res, next) => {
    // Set proper content types for ALL file types
    if (req.path.endsWith('.js')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    else if (req.path.endsWith('.mjs')) {
        res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    }
    else if (req.path.endsWith('.css')) {
        res.setHeader('Content-Type', 'text/css; charset=utf-8');
    }
    else if (req.path.endsWith('.ts')) {
        res.setHeader('Content-Type', 'text/x-typescript; charset=utf-8');
    }
    else if (req.path.endsWith('.tsx')) {
        res.setHeader('Content-Type', 'text/x-typescript; charset=utf-8');
    }
    // Remove unnecessary headers that cause warnings
    res.removeHeader('content-security-policy');
    res.removeHeader('Content-Security-Policy');
    res.removeHeader('x-content-security-policy');
    next();
});
// CORS middleware
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        const allowedOrigins = [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://localhost:5175',
            'http://localhost:5176',
            'http://192.168.1.25:5173',
            'https://192.168.1.25:5173',
            'http://127.0.0.1:5173'
        ];
        // Add CORS_ORIGIN from environment if specified
        if (process.env.CORS_ORIGIN) {
            allowedOrigins.push(process.env.CORS_ORIGIN);
        }
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Routes
app.use('/api', routes_1.default);
// Error handling
app.use(errorHandler_1.errorHandler);
// Start server
const PORT = process.env.PORT || 3001;
async function startServer() {
    try {
        // Test database connection (bypass for now)
        try {
            await (0, database_1.testConnection)();
            console.log('Database connected successfully');
        }
        catch (dbError) {
            console.warn('Database connection failed, starting server anyway:', dbError.message || dbError);
        }
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}
startServer();
// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
