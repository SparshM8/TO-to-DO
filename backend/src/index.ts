import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import authRoutes from './routes/auth';

const fastify = Fastify({ logger: true });

// Register plugins
fastify.register(cors, {
  origin: true, // Allow all origins for development
});

// Register routes
fastify.register(authRoutes);

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