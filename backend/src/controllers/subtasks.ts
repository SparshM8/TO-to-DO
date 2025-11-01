import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

interface CreateSubtaskRequest {
  title: string;
}

interface UpdateSubtaskRequest {
  title?: string;
  status?: string;
}

export const createSubtask = async (
  request: FastifyRequest<{ Params: { taskId: string }; Body: CreateSubtaskRequest }>,
  reply: FastifyReply
) => {
  const { taskId } = request.params;
  const { title } = request.body;
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

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title,
      },
    });

    reply.send(subtask);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to create subtask' });
  }
};

export const getSubtasks = async (
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

    const subtasks = await prisma.subtask.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });

    reply.send(subtasks);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to fetch subtasks' });
  }
};

export const updateSubtask = async (
  request: FastifyRequest<{ Params: { id: string }; Body: UpdateSubtaskRequest }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const { title, status } = request.body;
  const userId = (request as any).user.id;

  try {
    // Verify subtask ownership through task
    const subtask = await prisma.subtask.findFirst({
      where: { id },
      include: { task: { include: { list: true } } },
    });

    if (!subtask || subtask.task.list.ownerId !== userId) {
      return reply.code(403).send({ error: 'Access denied' });
    }

    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;

    const updatedSubtask = await prisma.subtask.update({
      where: { id },
      data: updateData,
    });

    reply.send(updatedSubtask);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to update subtask' });
  }
};

export const deleteSubtask = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const userId = (request as any).user.id;

  try {
    // Verify subtask ownership through task
    const subtask = await prisma.subtask.findFirst({
      where: { id },
      include: { task: { include: { list: true } } },
    });

    if (!subtask || subtask.task.list.ownerId !== userId) {
      return reply.code(403).send({ error: 'Access denied' });
    }

    await prisma.subtask.delete({
      where: { id },
    });

    reply.send({ message: 'Subtask deleted' });
  } catch (error) {
    reply.code(500).send({ error: 'Failed to delete subtask' });
  }
};