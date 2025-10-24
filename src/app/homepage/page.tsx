'use client';

import React, { useState } from 'react';
import { CheckCircle, Clock, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Content configuration
const CONTENT = {
  navigation: {
    logo: 'Add Todo',
    buttonDefault: 'Sign In / Register',
    buttonHover: 'Get Started →',
  },
  hero: {
    title: 'Organize Your Life,',
    titleGradient: 'One Task at a Time',
    subtitle: 'A todo list is your digital companion for capturing, organizing, and completing tasks. Transform chaos into clarity with a simple, powerful way to manage everything you need to do.',
    ctaButton: 'Start Organizing Now',
  },
  features: [
    {
      icon: 'CheckCircle',
      title: 'Capture Everything',
      description: 'Never forget a task again. Quickly add todos as they come to mind.',
      color: 'indigo',
    },
    {
      icon: 'Clock',
      title: 'Prioritize Wisely',
      description: 'Organize tasks by importance and deadlines to focus on what matters most.',
      color: 'purple',
    },
    {
      icon: 'Zap',
      title: 'Stay Productive',
      description: 'Check off completed tasks and watch your progress grow each day.',
      color: 'pink',
    },
  ],
  about: {
    title: 'What is a Todo List?',
    paragraphs: [
      'A todo list is a simple yet powerful productivity tool that helps you track tasks and responsibilities. It\'s a written or digital record of things you need to accomplish, allowing you to break down large goals into manageable, actionable items.',
      'Whether you\'re managing daily chores, planning a project, or organizing your career goals, a todo list provides clarity and structure. By externalizing your tasks, you free up mental space and reduce the stress of trying to remember everything.',
      'The beauty of a todo list lies in its simplicity: write it down, do it, check it off. This satisfying cycle creates momentum and helps you build lasting productive habits.',
    ],
  },
  footer: {
    copyright: 'all right reserved Chiamaka Faith',
  },
};

// Icon mapping
const ICON_MAP = {
  CheckCircle: CheckCircle,
  Clock: Clock,
  Zap: Zap,
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

function FeatureCard({ icon, title, description, color }: FeatureCardProps) {
  const colorClasses: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-600',
    purple: 'bg-purple-100 text-purple-600',
    pink: 'bg-pink-100 text-pink-600',
    blue: 'bg-blue-100 text-blue-600',
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
      <div className={`w-16 h-16 ${colorClasses[color]} rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

export default function TodoHomepage() {
  const [isHovered, setIsHovered] = useState(false);
  const router = useRouter();

  const handleAuthClick = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-800 via-gray-900 to-fuchsia-950 text-shadow-gray-950 text-black">
      {/* Navigation */}
      <nav className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <CheckCircle className="w-8 h-8 text-gray-500" />
          <span className="text-2xl font-bold text-gray-900">
            {CONTENT.navigation.logo}
          </span>
        </div>
        <button
          onClick={handleAuthClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="px-6 py-2.5 bg-gradient-to-r from-gray-600 to-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          {isHovered ? CONTENT.navigation.buttonHover : CONTENT.navigation.buttonDefault}
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {CONTENT.hero.title}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-gray-600 to-gray-800">
              {CONTENT.hero.titleGradient}
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
            {CONTENT.hero.subtitle}
          </p>
          <button
            onClick={handleAuthClick}
            className="px-8 py-4 text-gray-300 rounded-lg font-bold text-lg hover:from-purple-700 hover:to-purple-900 transition-all duration-300 shadow-2xl hover:shadow-purple-800 transform hover:scale-105"
          >
            {CONTENT.hero.ctaButton}
          </button>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
          {CONTENT.features.map((feature, index) => {
            const IconComponent = ICON_MAP[feature.icon as keyof typeof ICON_MAP];
            return (
              <FeatureCard
                key={index}
                icon={<IconComponent className="w-8 h-8" />}
                title={feature.title}
                description={feature.description}
                color={feature.color}
              />
            );
          })}
        </div>

        {/* What is a Todo List Section */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-600 box-border rounded-2xl shadow-gray-500 p-12 mb-20">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            {CONTENT.about.title}
          </h2>
          <div className="prose prose-lg max-w-3xl mx-auto text-gray-300">
            {CONTENT.about.paragraphs.map((paragraph, index) => (
              <p key={index} className={index < CONTENT.about.paragraphs.length - 1 ? 'mb-4' : ''}>
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="block py-8 text-gray-600 text-center">
        <p>&copy; {new Date().getFullYear()} {CONTENT.footer.copyright}</p>
      </footer>
    </div>
  );
}