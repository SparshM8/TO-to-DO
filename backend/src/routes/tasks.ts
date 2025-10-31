import { FastifyInstance } from 'fastify';
import { getTasks, createTask, getTask, updateTask, deleteTask } from '../controllers/tasks';
import { authenticate } from '../middlewares/auth';

export default async function taskRoutes(fastify: FastifyInstance) {
  fastify.get('/api/tasks', { preHandler: authenticate }, getTasks);
  fastify.post('/api/tasks', { preHandler: authenticate }, createTask);
  fastify.get('/api/tasks/:taskId', { preHandler: authenticate }, getTask);
  fastify.patch('/api/tasks/:taskId', { preHandler: authenticate }, updateTask);
  fastify.delete('/api/tasks/:taskId', { preHandler: authenticate }, deleteTask);
}