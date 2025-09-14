import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm';
import { LoginRequest } from '../types/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (data: LoginRequest) => {
    try {
      setLoading(true);
      setError(null);
      await login(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AuthForm
        mode="login"
        onSubmit={handleLogin}
        loading={loading}
        error={error}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
});
