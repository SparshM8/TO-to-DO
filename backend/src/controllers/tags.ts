import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../generated/prisma';

interface CreateTagRequest {
  name: string;
  color?: string;
}

export const createTag = async (
  request: FastifyRequest<{ Body: CreateTagRequest }>,
  reply: FastifyReply
) => {
  const { name, color } = request.body;
  const userId = (request as any).user.id;

  try {
    const tag = await prisma.tag.create({
      data: {
        name,
        color,
      },
    });

    reply.send(tag);
  } catch (error) {
    if ((error as any).code === 'P2002') {
      reply.code(409).send({ error: 'Tag name already exists' });
    } else {
      reply.code(500).send({ error: 'Failed to create tag' });
    }
  }
};

export const getTags = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const tags = await prisma.tag.findMany({
      orderBy: { name: 'asc' },
    });

    reply.send(tags);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to fetch tags' });
  }
};

export const addTagToTask = async (
  request: FastifyRequest<{ Params: { taskId: string; tagId: string } }>,
  reply: FastifyReply
) => {
  const { taskId, tagId } = request.params;
  const userId = (request as any).user.id;

  try {
    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId },
      include: { list: true },
    });

    if (!task || task.list.ownerId !== userId) {
      return reply.code(403).send({ error: 'Access denied' });
    }

    const taskTag = await prisma.taskTag.create({
      data: {
        taskId,
        tagId,
      },
      include: {
        tag: true,
      },
    });

    reply.send(taskTag);
  } catch (error) {
    if ((error as any).code === 'P2002') {
      reply.code(409).send({ error: 'Tag already added to task' });
    } else {
      reply.code(500).send({ error: 'Failed to add tag to task' });
    }
  }
};

export const removeTagFromTask = async (
  request: FastifyRequest<{ Params: { taskId: string; tagId: string } }>,
  reply: FastifyReply
) => {
  const { taskId, tagId } = request.params;
  const userId = (request as any).user.id;

  try {
    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId },
      include: { list: true },
    });

    if (!task || task.list.ownerId !== userId) {
      return reply.code(403).send({ error: 'Access denied' });
    }

    await prisma.taskTag.delete({
      where: {
        taskId_tagId: {
          taskId,
          tagId,
        },
      },
    });

    reply.send({ message: 'Tag removed from task' });
  } catch (error) {
    reply.code(500).send({ error: 'Failed to remove tag from task' });
  }
};

export const getTaskTags = async (
  request: FastifyRequest<{ Params: { taskId: string } }>,
  reply: FastifyReply
) => {
  const { taskId } = request.params;
  const userId = (request as any).user.id;

  try {
    // Verify task ownership
    const task = await prisma.task.findFirst({
      where: { id: taskId },
      include: { list: true },
    });

    if (!task || task.list.ownerId !== userId) {
      return reply.code(403).send({ error: 'Access denied' });
    }

    const taskTags = await prisma.taskTag.findMany({
      where: { taskId },
      include: {
        tag: true,
      },
    });

    reply.send(taskTags.map(tt => tt.tag));
  } catch (error) {
    reply.code(500).send({ error: 'Failed to fetch task tags' });
  }
};