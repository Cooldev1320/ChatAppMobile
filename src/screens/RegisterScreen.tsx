import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import AuthForm from '../components/AuthForm';
import { LoginRequest, RegisterRequest } from '../types/auth';

export default function RegisterScreen() {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (data: LoginRequest | RegisterRequest) => {
    try {
      setLoading(true);
      setError(null);
      await register(data as RegisterRequest);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <AuthForm
        mode="register"
        onSubmit={handleRegister}
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
