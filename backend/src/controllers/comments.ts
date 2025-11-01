import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

interface CreateCommentRequest {
  content: string;
}

export const createComment = async (
  request: FastifyRequest<{ Params: { taskId: string }; Body: CreateCommentRequest }>,
  reply: FastifyReply
) => {
  const { taskId } = request.params;
  const { content } = request.body;
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

    const comment = await prisma.comment.create({
      data: {
        taskId,
        authorId: userId,
        content,
      },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    reply.send(comment);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to create comment' });
  }
};

export const getComments = async (
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

    const comments = await prisma.comment.findMany({
      where: { taskId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    reply.send(comments);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to fetch comments' });
  }
};

export const deleteComment = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const userId = (request as any).user.id;

  try {
    // Verify comment ownership
    const comment = await prisma.comment.findFirst({
      where: { id },
      include: { task: { include: { list: true } } },
    });

    if (!comment || comment.task.list.ownerId !== userId) {
      return reply.code(403).send({ error: 'Access denied' });
    }

    await prisma.comment.delete({
      where: { id },
    });

    reply.send({ message: 'Comment deleted' });
  } catch (error) {
    reply.code(500).send({ error: 'Failed to delete comment' });
  }
};