"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-primetrade-assignment-development';
class AuthService {
    static async register(input) {
        const existingUser = await db_1.prisma.user.findUnique({
            where: { email: input.email },
        });
        if (existingUser) {
            const err = new Error('Email is already registered');
            err.statusCode = 400;
            throw err;
        }
        const passwordHash = await bcryptjs_1.default.hash(input.password, 10);
        const user = await db_1.prisma.user.create({
            data: {
                email: input.email,
                passwordHash,
                name: input.name,
                role: input.role,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                createdAt: true,
            },
        });
        const token = this.generateToken(user.id, user.email, user.role);
        return { user, token };
    }
    static async login(input) {
        const user = await db_1.prisma.user.findUnique({
            where: { email: input.email },
        });
        if (!user) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            throw err;
        }
        const isPasswordValid = await bcryptjs_1.default.compare(input.password, user.passwordHash);
        if (!isPasswordValid) {
            const err = new Error('Invalid email or password');
            err.statusCode = 401;
            throw err;
        }
        const token = this.generateToken(user.id, user.email, user.role);
        return {
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                createdAt: user.createdAt,
            },
            token,
        };
    }
    static generateToken(id, email, role) {
        return jsonwebtoken_1.default.sign({ id, email, role }, JWT_SECRET, {
            expiresIn: '24h',
        });
    }
}
exports.AuthService = AuthService;
