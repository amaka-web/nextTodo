'use client';
import React from 'react';
import { AuthForm } from './AuthForm';

export const LoginPage = () => {
  return <AuthForm mode="login" />;
};


export const RegisterPage = () => {
  return <AuthForm mode="register" />;
};



