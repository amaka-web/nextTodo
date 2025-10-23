'use client';

import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { TodoDashboard } from '../components/TodoDashboard';

export default function TodoListPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('');
    }
  }, [user, router]);

  if (!user) return null;

  return <TodoDashboard />;
}

