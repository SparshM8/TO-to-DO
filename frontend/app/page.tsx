'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface List {
  id: string;
  name: string;
  createdAt: string;
  _count?: {
    tasks: number;
  };
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: number;
  dueAt?: string;
  createdAt: string;
  list: {
    name: string;
  };
}

export default function Home() {
  const [user, setUser] = useState<{ id: string; email: string; name?: string } | null>(null);
  const [stats, setStats] = useState({
    totalLists: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [recentLists, setRecentLists] = useState<List[]>([]);
  const router = useRouter();

  const fetchDashboardData = async (token: string) => {
    try {
      // Fetch lists
      const listsRes = await fetch('http://localhost:3001/api/lists', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (listsRes.ok) {
        const lists = await listsRes.json();
        setRecentLists(lists.slice(0, 5)); // Show 5 most recent lists

        // Calculate stats
        const totalLists = lists.length;
        let totalTasks = 0;
        let completedTasks = 0;

        // Fetch tasks for each list to calculate stats
        for (const list of lists) {
          const tasksRes = await fetch(`http://localhost:3001/api/tasks?listId=${list.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (tasksRes.ok) {
            const tasks = await tasksRes.json();
            totalTasks += tasks.length;
            completedTasks += tasks.filter((task: Task) => task.status === 'done').length;
          }
        }

        setStats({
          totalLists,
          totalTasks,
          completedTasks,
          pendingTasks: totalTasks - completedTasks
        });

        // Fetch recent tasks
        if (lists.length > 0) {
          const tasksRes = await fetch('http://localhost:3001/api/tasks', {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (tasksRes.ok) {
            const allTasks = await tasksRes.json();
            const sortedTasks = allTasks
              .sort((a: Task, b: Task) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 5);
            setRecentTasks(sortedTasks);
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch user info
        const userRes = await fetch('http://localhost:3001/api/users/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (userRes.ok) {
          const data = await userRes.json();
          setUser(data.user);
        } else {
          localStorage.removeItem('token');
          router.push('/login');
          return;
        }

        // Fetch dashboard data
        await fetchDashboardData(token);
      } catch (error) {
        console.error('Failed to fetch data:', error);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    fetchData();
  }, [router]);

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user.name || user.email}!</h1>
              <p className="text-gray-600">Here&apos;s your TO2DO overview</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/lists" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors">
                Manage Lists
              </Link>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  router.push('/login');
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">📋</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Lists</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalLists}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">✅</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Tasks</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.totalTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">⏳</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pending Tasks</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.pendingTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <span className="text-white text-sm font-bold">🎯</span>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.completedTasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Lists */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Lists</h3>
                {recentLists.length > 0 ? (
                  <ul className="space-y-3">
                    {recentLists.map((list) => (
                      <li key={list.id} className="flex items-center justify-between">
                        <Link
                          href={`/lists/${list.id}`}
                          className="text-indigo-600 hover:text-indigo-500 font-medium"
                        >
                          {list.name}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {new Date(list.createdAt).toLocaleDateString()}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No lists yet. <Link href="/lists" className="text-indigo-600 hover:text-indigo-500">Create your first list</Link></p>
                )}
              </div>
            </div>

            {/* Recent Tasks */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Recent Tasks</h3>
                {recentTasks.length > 0 ? (
                  <ul className="space-y-3">
                    {recentTasks.map((task) => (
                      <li key={task.id} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <p className="text-sm text-gray-500">in {task.list.name}</p>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          task.status === 'done' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No tasks yet. <Link href="/lists" className="text-indigo-600 hover:text-indigo-500">Create your first task</Link></p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/lists"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 transition-colors"
                >
                  📋 Create New List
                </Link>
                <button
                  onClick={() => router.push('/lists')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  ✅ Add New Task
                </button>
                <button
                  onClick={() => window.open('http://localhost:3001/', '_blank')}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  🔗 View API Docs
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
