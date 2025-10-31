import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import authRoutes from './routes/auth';
import listRoutes from './routes/lists';
import taskRoutes from './routes/tasks';
import subtaskRoutes from './routes/subtasks';
import commentRoutes from './routes/comments';
import tagRoutes from './routes/tags';
import attachmentRoutes from './routes/attachments';

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(cors, {
  origin: true, // Allow all origins for development
});

// Register routes
fastify.register(authRoutes);
fastify.register(listRoutes);
fastify.register(taskRoutes);
fastify.register(subtaskRoutes);
fastify.register(commentRoutes);
fastify.register(tagRoutes);
fastify.register(attachmentRoutes);

// Basic route
fastify.get('/', async (request, reply) => {
  return { hello: 'world' };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server listening on http://localhost:3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();