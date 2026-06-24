import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';

const AuthForm = ({ isLogin }) => {
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    try {
      const url = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { username: identifier, password }
        : { username, email, password };

      const res = await api.post(url, payload);
      if (isLogin) {
        login(res.data);
        navigate('/');
      } else {
        navigate(`/verify-email?email=${encodeURIComponent(email)}`, {
          state: {
            message: res.data.message || 'Check your email for the verification code.'
          }
        });
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark">
      <div className="w-full max-w-md bg-dark-100 p-8 rounded-xl border border-dark-200">
        <h2 className="text-2xl font-bold text-primary text-center mb-6">
          {isLogin ? 'Welcome Back!' : 'Join RPS'}
        </h2>

        {error && (
          <div className="bg-red-500 text-white p-2 mb-4 rounded text-sm text-center">
            {error}
          </div>
        )}

        {info && (
          <div className="bg-emerald-500/20 text-emerald-100 p-2 mb-4 rounded text-sm text-center border border-emerald-400/20">
            {info}
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
        <InputField
          type="text"
          label="Username"
          value={isLogin ? identifier : username}
            onChange={(e) => isLogin ? setIdentifier(e.target.value) : setUsername(e.target.value)}
          />
          {!isLogin && (
            <InputField
              type="email"
              label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          )}
          <InputField
            type="password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button className="w-full bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg transition">
            {isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-gray-400 mt-6">
          {isLogin ? 'New here? ' : 'Already have an account? '}
          <a
            href={isLogin ? '/register' : '/login'}
            className="text-primary-500 hover:text-primary-400"
          >
            {isLogin ? 'Create account' : 'Sign in'}
          </a>
        </p>
        {isLogin && (
          <p className="text-center text-gray-500 mt-3 text-sm">
            Need to verify your email? <a href="/verify-email" className="text-primary-500 hover:text-primary-400">Open verification</a>
          </p>
        )}
      </div>
    </div>
  );
};

const InputField = ({ label, type, value, onChange }) => (
  <div>
    <label className="block text-gray-300 mb-2">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full bg-dark-200 border border-dark-300 rounded-lg px-4 py-2 text-gray-100"
    />
  </div>
);

export default AuthForm;
