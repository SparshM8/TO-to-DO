import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '../generated/prisma/client';

const prisma = new PrismaClient();

interface ParseTaskRequest {
  text: string;
  listId?: string;
}

interface ParsedTask {
  title: string;
  description?: string | undefined;
  priority?: number | undefined;
  dueAt?: string | undefined;
  tags?: string[] | undefined;
  subtasks?: string[] | undefined;
}

// Simple AI-powered task parsing (mock implementation)
export const parseTask = async (
  request: FastifyRequest<{ Body: ParseTaskRequest }>,
  reply: FastifyReply
) => {
  const { text, listId } = request.body;
  const userId = (request as any).user.id;

  try {
    // Mock AI parsing logic
    const parsedTask = parseTaskFromText(text);

    // If listId is provided, verify ownership
    if (listId) {
      const list = await prisma.list.findFirst({
        where: { id: listId, ownerId: userId },
      });

      if (!list) {
        return reply.code(403).send({ error: 'Access denied to list' });
      }
    }

    reply.send({
      ...parsedTask,
      listId,
      suggestions: generateTaskSuggestions(parsedTask),
    });
  } catch (error) {
    reply.code(500).send({ error: 'Failed to parse task' });
  }
};

// Mock AI parsing function
function parseTaskFromText(text: string): ParsedTask {
  const lowerText = text.toLowerCase();

  // Extract title (first sentence or until common separators)
  const titleMatch = text.split(/[.!?]/)[0];
  const title = (titleMatch ? titleMatch.trim() : text.slice(0, 50)) || 'New Task';

  // Extract description (everything after title)
  const description = text.length > title.length ? text.slice(title.length + 1).trim() : undefined;

  // Extract priority keywords
  let priority = 3; // default medium
  if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('critical')) {
    priority = 1; // high
  } else if (lowerText.includes('low') || lowerText.includes('whenever')) {
    priority = 5; // low
  } else if (lowerText.includes('high') || lowerText.includes('important')) {
    priority = 2; // high-medium
  }

  // Extract due date patterns
  let dueAt: string | undefined;
  const datePatterns = [
    /by\s+(\w+\s+\d+|\d+\s+\w+|\d{1,2}\/\d{1,2})/i,
    /due\s+(\w+\s+\d+|\d+\s+\w+|\d{1,2}\/\d{1,2})/i,
    /tomorrow/i,
    /next\s+week/i,
    /end\s+of\s+week/i,
  ];

  for (const pattern of datePatterns) {
    const match = text.match(pattern);
    if (match) {
      // Simple date parsing - in real implementation, use a proper date parser
      if (match[0].includes('tomorrow')) {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        dueAt = tomorrow.toISOString();
      } else if (match[0].includes('next week')) {
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        dueAt = nextWeek.toISOString();
      } else if (match[0].includes('end of week')) {
        const endOfWeek = new Date();
        const daysUntilFriday = (5 - endOfWeek.getDay() + 7) % 7;
        endOfWeek.setDate(endOfWeek.getDate() + daysUntilFriday);
        dueAt = endOfWeek.toISOString();
      }
      break;
    }
  }

  // Extract tags (words starting with #)
  const tags = text.match(/#\w+/g)?.map(tag => tag.slice(1)) || [];

  // Extract subtasks (lines starting with - or *)
  const subtasks = text
    .split('\n')
    .filter(line => line.trim().match(/^[-*]\s/))
    .map(line => line.trim().slice(2));

  return {
    title,
    description,
    priority,
    dueAt,
    tags,
    subtasks,
  };
}

// Generate AI suggestions
function generateTaskSuggestions(parsedTask: ParsedTask) {
  const suggestions = [];

  if (!parsedTask.description) {
    suggestions.push('Consider adding more details to the task description');
  }

  if (!parsedTask.dueAt) {
    suggestions.push('Set a due date to help with prioritization');
  }

  if (parsedTask.priority === 1) {
    suggestions.push('This seems urgent - consider breaking it into smaller tasks');
  }

  if (parsedTask.subtasks && parsedTask.subtasks.length > 0) {
    suggestions.push(`Great! You've identified ${parsedTask.subtasks.length} subtasks`);
  }

  if (parsedTask.tags && parsedTask.tags.length === 0) {
    suggestions.push('Consider adding tags for better organization');
  }

  return suggestions;
}