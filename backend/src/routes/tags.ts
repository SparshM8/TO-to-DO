import { FastifyInstance } from 'fastify';
import {
  createTag,
  getTags,
  addTagToTask,
  removeTagFromTask,
  getTaskTags,
} from '../controllers/tags';

export default async function tagsRoutes(fastify: FastifyInstance) {
  fastify.post('/tags', createTag);
  fastify.get('/tags', getTags);
  fastify.post('/tasks/:taskId/tags/:tagId', addTagToTask);
  fastify.delete('/tasks/:taskId/tags/:tagId', removeTagFromTask);
  fastify.get('/tasks/:taskId/tags', getTaskTags);
}