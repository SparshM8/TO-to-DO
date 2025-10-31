import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateTaskBody {
  listId: string;
  title: string;
  description?: string;
  dueAt?: string;
  priority?: number;
}

interface UpdateTaskBody {
  title?: string;
  description?: string;
  status?: string;
  dueAt?: string;
  priority?: number;
}

export const getTasks = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { listId } = request.query as { listId?: string };

  const tasks = await prisma.task.findMany({
    where: {
      list: { ownerId: user.id },
      ...(listId && { listId }),
    },
    include: {
      subtasks: true,
      comments: {
        include: {
          author: {
            select: { id: true, name: true, email: true },
          },
        },
      },
      tags: {
        include: {
          tag: true,
        },
      },
      attachments: true,
    },
  });
  reply.send(tasks);
};

export const createTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { listId, title, description, dueAt, priority } = request.body as CreateTaskBody;

  // Verify list ownership
  const list = await prisma.list.findFirst({
    where: { id: listId, ownerId: user.id },
  });

  if (!list) {
    return reply.code(404).send({ error: 'List not found' });
  }

  const task = await prisma.task.create({
    data: {
      listId,
      title,
      description,
      dueAt: dueAt ? new Date(dueAt) : null,
      priority: priority || 3,
    },
  });
  reply.code(201).send(task);
};

export const getTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { taskId } = request.params as { taskId: string };

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      list: { ownerId: user.id },
    },
  });

  if (!task) {
    return reply.code(404).send({ error: 'Task not found' });
  }

  reply.send(task);
};

export const updateTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { taskId } = request.params as { taskId: string };
  const { title, description, status, dueAt, priority } = request.body as UpdateTaskBody;

  const task = await prisma.task.updateMany({
    where: {
      id: taskId,
      list: { ownerId: user.id },
    },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(dueAt !== undefined && { dueAt: dueAt ? new Date(dueAt) : null }),
      ...(priority !== undefined && { priority }),
    },
  });

  if (task.count === 0) {
    return reply.code(404).send({ error: 'Task not found' });
  }

  reply.send({ message: 'Task updated' });
};

export const deleteTask = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { taskId } = request.params as { taskId: string };

  const task = await prisma.task.deleteMany({
    where: {
      id: taskId,
      list: { ownerId: user.id },
    },
  });

  if (task.count === 0) {
    return reply.code(404).send({ error: 'Task not found' });
  }

  reply.send({ message: 'Task deleted' });
};