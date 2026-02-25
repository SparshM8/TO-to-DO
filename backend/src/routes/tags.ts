import { FastifyInstance } from 'fastify';
import {
  createTag,
  getTags,
  addTagToTask,
  removeTagFromTask,
  getTaskTags,
} from '../controllers/tags';
import { authenticate } from '../middlewares/auth';

export default async function tagsRoutes(fastify: FastifyInstance) {
  fastify.post('/api/tags', { preHandler: authenticate }, createTag);
  fastify.get('/api/tags', { preHandler: authenticate }, getTags);
  fastify.post('/api/tasks/:taskId/tags/:tagId', { preHandler: authenticate }, addTagToTask);
  fastify.delete('/api/tasks/:taskId/tags/:tagId', { preHandler: authenticate }, removeTagFromTask);
  fastify.get('/api/tasks/:taskId/tags', { preHandler: authenticate }, getTaskTags);
}