"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = exports.pool = void 0;
exports.testConnection = testConnection;
const pg_1 = require("pg");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});
exports.pool.on('error', (err) => {
    console.error('Unexpected error on idle client', err);
    process.exit(-1);
});
class DatabaseService {
    pool;
    constructor() {
        this.pool = exports.pool;
    }
    async query(text, params) {
        try {
            const client = await this.pool.connect();
            const result = await client.query(text, params);
            client.release();
            return result;
        }
        catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    }
}
exports.DatabaseService = DatabaseService;
async function testConnection() {
    try {
        const client = await exports.pool.connect();
        const result = await client.query('SELECT NOW()');
        console.log('Database connected at:', result.rows[0].now);
        client.release();
    }
    catch (err) {
        console.error('Database connection error:', err);
        throw err;
    }
}
