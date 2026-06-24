import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/forgot-password', { email });
      toast.success(res.data.message || 'Reset email sent');
      navigate(`/reset-password?email=${encodeURIComponent(email)}`, {
        state: { message: res.data.message }
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 pt-24 text-white">
      <form onSubmit={submit} className="mx-auto max-w-md rounded-[32px] border border-white/10 bg-white/[0.06] p-7 shadow-2xl backdrop-blur-2xl">
        <h1 className="text-3xl font-black">Reset your password</h1>
        <p className="mt-2 text-sm leading-6 text-white/60">
          Enter your account email. We will send a six-digit code and a reset link.
        </p>
        <label className="mt-6 block text-sm font-medium text-white/75">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-white outline-none transition focus:border-blue-300"
        />
        <button disabled={loading} className="mt-5 w-full rounded-2xl bg-blue-500 px-4 py-3 font-bold text-white transition hover:bg-blue-400 disabled:opacity-60">
          {loading ? 'Sending...' : 'Send reset code'}
        </button>
        <Link to="/login" className="mt-4 block text-center text-sm text-white/55 hover:text-white">
          Back to login
        </Link>
      </form>
    </div>
  );
}
