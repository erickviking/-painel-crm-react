// Ficheiro: src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message);
      }
    } catch (err) {
      setError('Falha ao fazer login. Verifique suas credenciais.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2>Login do CRM</h2>
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.button}>Entrar</button>
          {error && <p style={styles.error}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    height: '100vh', 
    backgroundColor: '#f0f2f5' 
  },
  loginBox: { 
    padding: '40px', 
    backgroundColor: 'white', 
    borderRadius: '8px', 
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
    width: '350px' 
  },
  input: { 
    width: '100%', 
    padding: '10px', 
    marginBottom: '15px', 
    border: '1px solid #ccc', 
    borderRadius: '4px', 
    boxSizing: 'border-box' 
  },
  button: { 
    width: '100%', 
    padding: '10px', 
    border: 'none', 
    backgroundColor: '#007bff', 
    color: 'white', 
    borderRadius: '4px', 
    cursor: 'pointer', 
    fontWeight: 'bold' 
  },
  error: { 
    color: 'red', 
    marginTop: '10px', 
    textAlign: 'center' 
  }
};

export default LoginPage;
