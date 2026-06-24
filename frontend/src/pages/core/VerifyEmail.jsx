import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../../api';
import { useAuth } from '../../context/AuthContext';

export default function VerifyEmail() {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const params = new URLSearchParams(location.search);

  const [email, setEmail] = useState(params.get('email') || '');
  const [code, setCode] = useState('');
  const [message, setMessage] = useState(location.state?.message || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [redirectSeconds, setRedirectSeconds] = useState(5);

  useEffect(() => {
    const token = params.get('token');
    if (email && token) {
      verify({ email, token });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!verified) return undefined;
    if (redirectSeconds <= 0) {
      navigate('/onboarding', { replace: true });
      return undefined;
    }

    const id = setTimeout(() => {
      setRedirectSeconds((seconds) => seconds - 1);
    }, 1000);

    return () => clearTimeout(id);
  }, [navigate, redirectSeconds, verified]);

  const verify = async (payload) => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/verify-email', payload);
      if (res.data?.token) {
        login(res.data);
        setVerified(true);
        setRedirectSeconds(5);
        setMessage('Email verified. You are signed in.');
        return;
      }
      setVerified(true);
      setRedirectSeconds(5);
      setMessage(res.data.message || 'Email verified.');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await verify({ email, code });
  };

  const resend = async () => {
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const res = await api.post('/auth/resend-verification', { email });
      setMessage(res.data.message || 'Verification email resent');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend verification email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark text-white">
      <div className="w-full max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8 text-center shadow-2xl backdrop-blur">
        {verified ? (
          <>
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-emerald-300/30 bg-emerald-400/15 text-3xl">
              ✓
            </div>
            <h1 className="mb-2 text-2xl font-bold">Email verified</h1>
            <p className="mb-6 text-sm leading-6 text-white/65">
              Your account is ready. Redirecting you home in{' '}
              <span className="font-semibold text-emerald-300">{redirectSeconds}</span>{' '}
              {redirectSeconds === 1 ? 'second' : 'seconds'}.
            </p>
            <button
              type="button"
              onClick={() => navigate('/onboarding', { replace: true })}
              className="w-full rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white transition hover:bg-primary-600"
            >
              Not redirecting? Click here.
            </button>
          </>
        ) : (
          <>
        <h1 className="mb-2 text-2xl font-bold">Verify email</h1>
        <p className="mb-6 text-sm text-white/60">
          Use the 6-digit code from Brevo or click the verification link in your email.
        </p>

        {error && <div className="mb-4 rounded bg-red-500/20 p-3 text-sm text-red-100">{error}</div>}
        {message && <div className="mb-4 rounded bg-emerald-500/20 p-3 text-sm text-emerald-100">{message}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="mb-2 block text-sm text-white/70">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-white/70">Code</label>
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-2 text-white"
              placeholder="123456"
              autoComplete="one-time-code"
              inputMode="numeric"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary-500 px-4 py-2 font-semibold text-white disabled:opacity-60"
          >
            {loading ? 'Verifying…' : 'Verify'}
          </button>
        </form>

        <button
          type="button"
          onClick={resend}
          disabled={!email || loading}
          className="mt-4 w-full rounded-lg border border-white/10 px-4 py-2 text-sm text-white/80 disabled:opacity-60"
        >
          Resend verification email
        </button>
          </>
        )}
      </div>
    </div>
  );
}
