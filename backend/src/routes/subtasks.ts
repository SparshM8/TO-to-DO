import { FastifyInstance } from 'fastify';
import {
  createSubtask,
  getSubtasks,
  updateSubtask,
  deleteSubtask,
} from '../controllers/subtasks';
import { authenticate } from '../middlewares/auth';

export default async function subtasksRoutes(fastify: FastifyInstance) {
  fastify.post('/api/tasks/:taskId/subtasks', { preHandler: authenticate }, createSubtask);
  fastify.get('/api/tasks/:taskId/subtasks', { preHandler: authenticate }, getSubtasks);
  fastify.patch('/api/subtasks/:id', { preHandler: authenticate }, updateSubtask);
  fastify.delete('/api/subtasks/:id', { preHandler: authenticate }, deleteSubtask);
}