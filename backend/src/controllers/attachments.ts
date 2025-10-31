import { FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../generated/prisma';
import * as fs from 'fs';
import * as path from 'path';

interface CreateAttachmentRequest {
  filename: string;
  url: string;
  size?: number;
  mimeType?: string;
}

export const createAttachment = async (
  request: FastifyRequest<{ Params: { taskId: string }; Body: CreateAttachmentRequest }>,
  reply: FastifyReply
) => {
  const { taskId } = request.params;
  const { filename, url, size, mimeType } = request.body;
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

    const attachment = await prisma.attachment.create({
      data: {
        taskId,
        filename,
        url,
        size,
        mimeType,
      },
    });

    reply.send(attachment);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to create attachment' });
  }
};

export const getAttachments = async (
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

    const attachments = await prisma.attachment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
    });

    reply.send(attachments);
  } catch (error) {
    reply.code(500).send({ error: 'Failed to fetch attachments' });
  }
};

export const deleteAttachment = async (
  request: FastifyRequest<{ Params: { id: string } }>,
  reply: FastifyReply
) => {
  const { id } = request.params;
  const userId = (request as any).user.id;

  try {
    // Verify attachment ownership through task
    const attachment = await prisma.attachment.findFirst({
      where: { id },
      include: { task: { include: { list: true } } },
    });

    if (!attachment || attachment.task.list.ownerId !== userId) {
      return reply.code(403).send({ error: 'Access denied' });
    }

    // Optionally delete file from storage
    // fs.unlinkSync(path.join(uploadDir, attachment.filename));

    await prisma.attachment.delete({
      where: { id },
    });

    reply.send({ message: 'Attachment deleted' });
  } catch (error) {
    reply.code(500).send({ error: 'Failed to delete attachment' });
  }
};