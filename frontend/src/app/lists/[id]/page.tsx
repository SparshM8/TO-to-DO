'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useOnlineStatus } from '../../../hooks/useOnlineStatus';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: number;
  dueAt?: string;
  createdAt: string;
  subtasks?: Subtask[];
  comments?: Comment[];
  attachments?: Attachment[];
  tags?: { tag: Tag }[];
}

interface Subtask {
  id: string;
  title: string;
  status: string;
  createdAt: string;
}

interface Comment {
  id: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name?: string;
    email: string;
  };
}

interface Attachment {
  id: string;
  filename: string;
  url: string;
  size?: number;
  mimeType?: string;
  createdAt: string;
}

interface Tag {
  id: string;
  name: string;
  color?: string;
}

interface List {
  id: string;
  name: string;
}

export default function ListDetail() {
  const [list, setList] = useState<List | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueAt, setNewTaskDueAt] = useState('');
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueAt, setEditDueAt] = useState('');
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newComment, setNewComment] = useState('');
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [selectedTagId, setSelectedTagId] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = useParams();
  const isOnline = useOnlineStatus();

  const fetchList = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const res = await fetch(`http://localhost:3001/api/lists/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setList(data);
      } else {
        setError('Failed to fetch list');
      }
    } catch {
      setError('Network error');
    }
  }, [id, router]);

  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/tasks?listId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        setError('Failed to fetch tasks');
      }
    } catch {
      setError('Network error');
    }
  }, [id]);

  useEffect(() => {
    fetchList();
    fetchTasks();
  }, [fetchList, fetchTasks]);

  const createTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          listId: id,
          title: newTaskTitle,
          description: newTaskDescription,
          dueAt: newTaskDueAt || undefined,
        }),
      });

      if (res.ok) {
        setNewTaskTitle('');
        setNewTaskDescription('');
        setNewTaskDueAt('');
        fetchTasks();
      } else {
        setError('Failed to create task');
      }
    } catch {
      setError('Network error');
    }
  };

  const updateTaskStatus = async (taskId: string, status: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(tasks.map(task => task.id === taskId ? { ...task, status } : task));

    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        setTasks(previousTasks);
        setError('Failed to update task');
      }
    } catch {
      setTasks(previousTasks);
      setError('Network error');
    }
  };

  const deleteTask = async (taskId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Optimistic update
    const previousTasks = [...tasks];
    setTasks(tasks.filter(task => task.id !== taskId));

    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        setTasks(previousTasks);
        setError('Failed to delete task');
      }
    } catch {
      setTasks(previousTasks);
      setError('Failed to delete task');
    }
  };

  // Subtask functions
  const createSubtask = async (taskId: string, title: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${taskId}/subtasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title }),
      });

      if (res.ok) {
        await fetchTasks();
      } else {
        setError('Failed to create subtask');
      }
    } catch {
      setError('Network error');
    }
  };

  const updateSubtaskStatus = async (subtaskId: string, status: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await fetch(`http://localhost:3001/api/subtasks/${subtaskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      await fetchTasks();
    } catch {
      setError('Failed to update subtask');
    }
  };

  // Comment functions
  const createComment = async (taskId: string, content: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        await fetchTasks();
      } else {
        setError('Failed to create comment');
      }
    } catch {
      setError('Network error');
    }
  };

  // Tag functions
  const fetchTags = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3001/api/tags', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAvailableTags(data);
      }
    } catch {
      // Ignore errors for tags
    }
  }, []);

  const addTagToTask = async (taskId: string, tagId: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch(`http://localhost:3001/api/tasks/${taskId}/tags/${tagId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        await fetchTasks();
      } else {
        setError('Failed to add tag');
      }
    } catch {
      setError('Network error');
    }
  };

  useEffect(() => {
    fetchList();
    fetchTasks();
    fetchTags();

    // Auto-refresh tasks every 30 seconds for realtime-like experience
    const interval = setInterval(() => {
      fetchTasks();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchList, fetchTasks, fetchTags]);

  if (!list) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">{list.name}</h1>
            <div className="flex items-center space-x-4">
              <div className={`flex items-center space-x-2 ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}></div>
                <span className="text-sm">{isOnline ? 'Online' : 'Offline'}</span>
              </div>
              <Link href="/lists" className="text-indigo-600 hover:text-indigo-500">
                Back to Lists
              </Link>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && <div className="text-red-500 mb-4">{error}</div>}

          <form onSubmit={createTask} className="mb-8 bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium mb-4">Add New Task</h2>
            <div className="space-y-4">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Task description"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                rows={3}
              />
              <input
                type="datetime-local"
                value={newTaskDueAt}
                onChange={(e) => setNewTaskDueAt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add Task
              </button>
            </div>
          </form>

          <div className="space-y-4">
            {tasks.map((task) => (
              <div key={task.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-lg font-medium">{task.title}</h3>
                    {task.description && (
                      <p className="mt-2 text-gray-600">{task.description}</p>
                    )}
                    <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                      <span>Priority: {task.priority}</span>
                      {task.dueAt && (
                        <span>Due: {new Date(task.dueAt).toLocaleString()}</span>
                      )}
                      <span>Status: {task.status}</span>
                    </div>

                    {/* Tags */}
                    {task.tags && task.tags.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {task.tags.map((taskTag) => (
                          <span
                            key={taskTag.tag.id}
                            className="px-2 py-1 text-xs rounded"
                            style={{ backgroundColor: taskTag.tag.color || '#e5e7eb', color: '#374151' }}
                          >
                            {taskTag.tag.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Subtasks */}
                    {task.subtasks && task.subtasks.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Subtasks</h4>
                        <div className="space-y-1">
                          {task.subtasks.map((subtask) => (
                            <div key={subtask.id} className="flex items-center space-x-2">
                              <input
                                type="checkbox"
                                checked={subtask.status === 'done'}
                                onChange={(e) => updateSubtaskStatus(subtask.id, e.target.checked ? 'done' : 'todo')}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                              <span className={`text-sm ${subtask.status === 'done' ? 'line-through text-gray-500' : ''}`}>
                                {subtask.title}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Subtask */}
                    <div className="mt-4">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (newSubtaskTitle.trim()) {
                          createSubtask(task.id, newSubtaskTitle.trim());
                          setNewSubtaskTitle('');
                        }
                      }} className="flex space-x-2">
                        <input
                          type="text"
                          value={newSubtaskTitle}
                          onChange={(e) => setNewSubtaskTitle(e.target.value)}
                          placeholder="Add subtask"
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                        >
                          Add
                        </button>
                      </form>
                    </div>

                    {/* Comments */}
                    {task.comments && task.comments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Comments</h4>
                        <div className="space-y-2">
                          {task.comments.map((comment) => (
                            <div key={comment.id} className="bg-gray-50 p-3 rounded">
                              <div className="flex justify-between items-start">
                                <div className="flex-1">
                                  <p className="text-sm text-gray-800">{comment.content}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {comment.author.name || comment.author.email} • {new Date(comment.createdAt).toLocaleString()}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add Comment */}
                    <div className="mt-4">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (newComment.trim()) {
                          createComment(task.id, newComment.trim());
                          setNewComment('');
                        }
                      }} className="space-y-2">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment"
                          className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                          rows={2}
                        />
                        <button
                          type="submit"
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                        >
                          Comment
                        </button>
                      </form>
                    </div>

                    {/* Add Tag */}
                    <div className="mt-4">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (selectedTagId) {
                          addTagToTask(task.id, selectedTagId);
                          setSelectedTagId('');
                        }
                      }} className="flex space-x-2">
                        <select
                          value={selectedTagId}
                          onChange={(e) => setSelectedTagId(e.target.value)}
                          className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Select tag</option>
                          {availableTags.map((tag) => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                          ))}
                        </select>
                        <button
                          type="submit"
                          className="px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700"
                        >
                          Add Tag
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setEditingTask(task);
                        setEditTitle(task.title);
                        setEditDescription(task.description || '');
                        setEditDueAt(task.dueAt ? new Date(task.dueAt).toISOString().slice(0, 16) : '');
                      }}
                      className="px-2 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <select
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      <option value="todo">Todo</option>
                      <option value="in-progress">In Progress</option>
                      <option value="done">Done</option>
                    </select>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="px-2 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Edit Task Modal */}
          {editingTask && (
            <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full" id="my-modal">
              <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
                <div className="mt-3">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Task</h3>
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const token = localStorage.getItem('token');
                    if (!token || !editingTask) return;

                    try {
                      const res = await fetch(`http://localhost:3001/api/tasks/${editingTask.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          title: editTitle,
                          description: editDescription,
                          dueAt: editDueAt || undefined,
                        }),
                      });

                      if (res.ok) {
                        await fetchTasks();
                        setEditingTask(null);
                        setEditTitle('');
                        setEditDescription('');
                        setEditDueAt('');
                      } else {
                        setError('Failed to update task');
                      }
                    } catch {
                      setError('Network error');
                    }
                  }}>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Description</label>
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        rows={3}
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Due Date</label>
                      <input
                        type="datetime-local"
                        value={editDueAt}
                        onChange={(e) => setEditDueAt(e.target.value)}
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setEditingTask(null)}
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        Update
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}