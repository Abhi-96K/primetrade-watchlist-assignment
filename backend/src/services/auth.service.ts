import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-for-primetrade-assignment-development';

export class AuthService {
  static async register(input: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existingUser) {
      const err = new Error('Email is already registered') as any;
      err.statusCode = 400;
      throw err;
    }

    const passwordHash = await bcrypt.hash(input.password, 10);

    const user = await prisma.user.create({
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

  static async login(input: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      const err = new Error('Invalid email or password') as any;
      err.statusCode = 401;
      throw err;
    }

    const isPasswordValid = await bcrypt.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      const err = new Error('Invalid email or password') as any;
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

  private static generateToken(id: string, email: string, role: string): string {
    return jwt.sign({ id, email, role }, JWT_SECRET, {
      expiresIn: '24h',
    });
  }
}
