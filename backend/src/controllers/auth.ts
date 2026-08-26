import { FastifyRequest, FastifyReply } from 'fastify';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '../generated/prisma/client';
import { getJwtSecret } from '../config';

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

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizedCredentials(body: Partial<SignupBody | LoginBody> | undefined) {
  return {
    email: typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '',
    password: typeof body?.password === 'string' ? body.password : '',
  };
}

function safeUser(user: { id: string; email: string; name: string | null }) {
  return { id: user.id, email: user.email, name: user.name };
}

export const signup = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = (request.body ?? {}) as Partial<SignupBody>;
  const { email, password } = normalizedCredentials(body);
  const name = typeof body.name === 'string' ? body.name.trim() : '';

  if (!EMAIL_PATTERN.test(email) || password.length < 8) {
    return reply.code(400).send({ error: 'A valid email and password of at least 8 characters are required' });
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    return reply.code(400).send({ error: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name || null,
    },
  });

  const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });
  return reply.send({ token, user: safeUser(user) });
};

export const login = async (request: FastifyRequest, reply: FastifyReply) => {
  const body = (request.body ?? {}) as Partial<LoginBody>;
  const { email, password } = normalizedCredentials(body);

  if (!email || !password) {
    return reply.code(400).send({ error: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return reply.code(401).send({ error: 'Invalid credentials' });
  }

  const token = jwt.sign({ userId: user.id }, getJwtSecret(), { expiresIn: '7d' });
  return reply.send({ token, user: safeUser(user) });
};

export const getMe = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user as { id: string; email: string; name: string | null };
  return reply.send({ user: safeUser(user) });
};
