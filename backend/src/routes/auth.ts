import { FastifyInstance } from 'fastify';
import { signup, login, getMe } from '../controllers/auth';
import { authenticate } from '../middlewares/auth';

export default async function authRoutes(fastify: FastifyInstance) {
  fastify.post('/api/auth/signup', signup);
  fastify.post('/api/auth/login', login);
  fastify.get('/api/users/me', { preHandler: authenticate }, getMe);
}