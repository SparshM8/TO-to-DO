import { FastifyInstance } from 'fastify';
import {
  createSubtask,
  getSubtasks,
  updateSubtask,
  deleteSubtask,
} from '../controllers/subtasks';

export default async function subtasksRoutes(fastify: FastifyInstance) {
  fastify.post('/tasks/:taskId/subtasks', createSubtask);
  fastify.get('/tasks/:taskId/subtasks', getSubtasks);
  fastify.patch('/subtasks/:id', updateSubtask);
  fastify.delete('/subtasks/:id', deleteSubtask);
}