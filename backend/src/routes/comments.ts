import { FastifyInstance } from 'fastify';
import {
  createComment,
  getComments,
  deleteComment,
} from '../controllers/comments';

export default async function commentsRoutes(fastify: FastifyInstance) {
  fastify.post('/tasks/:taskId/comments', createComment);
  fastify.get('/tasks/:taskId/comments', getComments);
  fastify.delete('/comments/:id', deleteComment);
}