import { FastifyInstance } from 'fastify';
import {
  createComment,
  getComments,
  deleteComment,
} from '../controllers/comments';
import { authenticate } from '../middlewares/auth';

export default async function commentsRoutes(fastify: FastifyInstance) {
  fastify.post('/api/tasks/:taskId/comments', { preHandler: authenticate }, createComment);
  fastify.get('/api/tasks/:taskId/comments', { preHandler: authenticate }, getComments);
  fastify.delete('/api/comments/:id', { preHandler: authenticate }, deleteComment);
}