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
import aiRoutes from './routes/ai';

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
fastify.register(aiRoutes);

// API info endpoint
fastify.get('/', async (request, reply) => {
  return {
    message: 'TO2DO API Server is running!',
    version: '1.0.0',
    status: '✅ Active',
    docs: 'Visit /api/docs for full API documentation',
    endpoints: [
      'POST /auth/signup - User registration',
      'POST /auth/login - User login', 
      'GET /auth/me - Get current user',
      'GET /lists - Get user lists',
      'POST /lists - Create list',
      'GET /tasks - Get tasks',
      'POST /tasks - Create task',
      'POST /ai/parse - AI task parsing'
    ]
  };
});

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('Server listening on http://localhost:3001');
  } catch (err) {
    console.error('Server startup error:', err);
    process.exit(1);
  }
};

start();