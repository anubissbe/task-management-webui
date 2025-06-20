import React, { useState } from 'react';
import { Login } from './Login';
import { Register } from './Register';
import { PasswordReset } from './PasswordReset';

type AuthMode = 'login' | 'register' | 'forgot-password';

export const AuthPage: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');

  const toggleMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const showForgotPassword = () => {
    setMode('forgot-password');
  };

  const backToLogin = () => {
    setMode('login');
  };

  switch (mode) {
    case 'login':
      return <Login onToggleMode={toggleMode} onForgotPassword={showForgotPassword} />;
    case 'register':
      return <Register onToggleMode={toggleMode} />;
    case 'forgot-password':
      return <PasswordReset onBack={backToLogin} />;
    default:
      return <Login onToggleMode={toggleMode} onForgotPassword={showForgotPassword} />;
  }
};