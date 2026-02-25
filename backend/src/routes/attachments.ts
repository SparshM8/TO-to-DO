import { FastifyInstance } from 'fastify';
import {
  createAttachment,
  getAttachments,
  deleteAttachment,
} from '../controllers/attachments';
import { authenticate } from '../middlewares/auth';

export default async function attachmentsRoutes(fastify: FastifyInstance) {
  fastify.post('/api/tasks/:taskId/attachments', { preHandler: authenticate }, createAttachment);
  fastify.get('/api/tasks/:taskId/attachments', { preHandler: authenticate }, getAttachments);
  fastify.delete('/api/attachments/:id', { preHandler: authenticate }, deleteAttachment);
}