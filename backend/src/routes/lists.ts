import { FastifyInstance } from 'fastify';
import { getLists, createList, getList, updateList, deleteList } from '../controllers/lists';
import { authenticate } from '../middlewares/auth';

export default async function listRoutes(fastify: FastifyInstance) {
  fastify.get('/api/lists', { preHandler: authenticate }, getLists);
  fastify.post('/api/lists', { preHandler: authenticate }, createList);
  fastify.get('/api/lists/:listId', { preHandler: authenticate }, getList);
  fastify.patch('/api/lists/:listId', { preHandler: authenticate }, updateList);
  fastify.delete('/api/lists/:listId', { preHandler: authenticate }, deleteList);
}