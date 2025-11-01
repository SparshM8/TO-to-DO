import { FastifyRequest, FastifyReply } from 'fastify';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

interface SignupBody {
  email: string;
  password: string;
  name?: string;
}

interface LoginBody {
  email: string;
  password: string;
}

export const signup = async (request: FastifyRequest<{ Body: SignupBody }>, reply: FastifyReply) => {
  const { email, password, name } = request.body;

  // Basic validation
  if (!email || !password) {
    return reply.code(400).send({ error: 'Email and password are required' });
  }

  // Check if user exists
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return reply.code(400).send({ error: 'User already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
    },
  });

  // Generate JWT
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

  reply.send({ token, user: { id: user.id, email: user.email, name: user.name } });
};

export const login = async (request: FastifyRequest<{ Body: LoginBody }>, reply: FastifyReply) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return reply.code(400).send({ error: 'Email and password are required' });
  }

  // Find user
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return reply.code(400).send({ error: 'Invalid credentials' });
  }

  // Check password
  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return reply.code(400).send({ error: 'Invalid credentials' });
  }

  // Generate JWT
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', { expiresIn: '7d' });

  reply.send({ token, user: { id: user.id, email: user.email, name: user.name } });
};

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  reply.send({ user });
};