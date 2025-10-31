import { FastifyInstance } from 'fastify';
import {
  createAttachment,
  getAttachments,
  deleteAttachment,
} from '../controllers/attachments';

export default async function attachmentsRoutes(fastify: FastifyInstance) {
  fastify.post('/tasks/:taskId/attachments', createAttachment);
  fastify.get('/tasks/:taskId/attachments', getAttachments);
  fastify.delete('/attachments/:id', deleteAttachment);
}