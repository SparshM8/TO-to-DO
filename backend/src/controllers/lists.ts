import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateListBody {
  name: string;
}

export const getLists = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const lists = await prisma.list.findMany({
    where: { ownerId: user.id },
  });
  reply.send(lists);
};

export const createList = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { name } = request.body as CreateListBody;

  const list = await prisma.list.create({
    data: {
      name,
      ownerId: user.id,
    },
  });
  reply.code(201).send(list);
};

export const getList = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { listId } = request.params as { listId: string };

  const list = await prisma.list.findFirst({
    where: { id: listId, ownerId: user.id },
  });

  if (!list) {
    return reply.code(404).send({ error: 'List not found' });
  }

  reply.send(list);
};

export const updateList = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { listId } = request.params as { listId: string };
  const { name } = request.body as CreateListBody;

  const list = await prisma.list.updateMany({
    where: { id: listId, ownerId: user.id },
    data: { name },
  });

  if (list.count === 0) {
    return reply.code(404).send({ error: 'List not found' });
  }

  reply.send({ message: 'List updated' });
};

export const deleteList = async (request: FastifyRequest, reply: FastifyReply) => {
  const user = (request as any).user;
  const { listId } = request.params as { listId: string };

  const list = await prisma.list.deleteMany({
    where: { id: listId, ownerId: user.id },
  });

  if (list.count === 0) {
    return reply.code(404).send({ error: 'List not found' });
  }

  reply.send({ message: 'List deleted' });
};