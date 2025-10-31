import { FastifyInstance } from 'fastify';
import { parseTask } from '../controllers/ai';

export default async function aiRoutes(fastify: FastifyInstance) {
  fastify.post('/ai/parse-task', parseTask);
}