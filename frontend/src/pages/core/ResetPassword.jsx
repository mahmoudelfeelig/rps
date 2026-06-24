import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const params = new URLSearchParams(location.search);
  const [email, setEmail] = useState(params.get('email') || '');
  const [token] = useState(params.get('token') || '');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/reset-password', {
        email,
        password,
        ...(token ? { token } : { code })
      });
      login(res.data);
      toast.success('Password updated. You are signed in.');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pt-24 text-white">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-2xl">
        <h1 className="text-3xl font-black">Choose a new password</h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Use the reset link or enter the six-digit code from your email.
        </p>
        {location.state?.message && (
          <div className="mt-4 rounded-2xl border border-emerald-300/20 bg-emerald-400/10 p-3 text-sm text-emerald-100">
            {location.state.message}
          </div>
        )}
        <label className="mt-5 block text-sm font-medium text-white/75">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-blue-300"
        />
        {!token && (
          <>
            <label className="mt-4 block text-sm font-medium text-white/75">Reset code</label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-blue-300"
            />
          </>
        )}
        <label className="mt-4 block text-sm font-medium text-white/75">New password</label>
        <input
          type="password"
          value={password}
          minLength={8}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-blue-300"
        />
        <button disabled={loading} className="mt-5 w-full rounded-2xl bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-400 disabled:opacity-60">
          {loading ? 'Updating...' : 'Reset and sign in'}
        </button>
        <Link to="/forgot-password" className="mt-4 block text-center text-sm text-white/55 hover:text-white">
          Need a new code?
        </Link>
      </form>
    </div>
  );
}
