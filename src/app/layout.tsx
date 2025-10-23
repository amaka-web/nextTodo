import type { Metadata } from 'next';
import { AuthProvider } from './contexts/AuthContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'Offline-first Todo app with sync and authentication',
};
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <link rel="shortcut icon" href="/typescript-todo-icon.svg" type="image/x-icon" />
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  )
}