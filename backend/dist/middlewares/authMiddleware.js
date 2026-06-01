"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = require("../config/db");
const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: 'Access denied. No token provided.',
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        const jwtSecret = process.env.JWT_SECRET || 'super-secret-key-for-primetrade-assignment-development';
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        // Validate that the user still exists in the database
        const user = await db_1.prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, email: true, role: true },
        });
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid session. User no longer exists.',
            });
            return;
        }
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        next();
    }
    catch (error) {
        res.status(401).json({
            success: false,
            message: 'Invalid or expired authentication token.',
        });
    }
};
exports.authenticate = authenticate;
