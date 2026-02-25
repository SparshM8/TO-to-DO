import { FastifyInstance } from 'fastify';
import { parseTask } from '../controllers/ai';
import { authenticate } from '../middlewares/auth';

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.post('/api/ai/parse-task', { preHandler: authenticate }, parseTask);
}