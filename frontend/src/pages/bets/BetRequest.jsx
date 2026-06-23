import React, { useEffect, useState } from 'react';
import api from '../../api';
import toast from 'react-hot-toast';

export default function BetRequest() {
  const [form, setForm] = useState({ title: '', market: '', oddsFormat: 'decimal', desiredOdds: '', stake: '', notes: '' });
  const [list, setList] = useState([]);

  const loadMine = async () => {
    try {
      const { data } = await api.get('/requests');
      setList(data);
    } catch {
      setList(JSON.parse(localStorage.getItem('local.betRequests') || '[]'));
    }
  };
  useEffect(() => { loadMine(); }, []);

  const onChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/requests/bets', form);
      toast.success('Request submitted');
      setForm({ title: '', market: '', oddsFormat: 'decimal', desiredOdds: '', stake: '', notes: '' });
      loadMine();
    } catch {
      const k = 'local.betRequests';
      const arr = JSON.parse(localStorage.getItem(k) || '[]');
      arr.push({ ...form, at: Date.now(), status: 'pending' });
      localStorage.setItem(k, JSON.stringify(arr));
      toast.success('Saved locally');
      setForm({ title: '', market: '', oddsFormat: 'decimal', desiredOdds: '', stake: '', notes: '' });
      loadMine();
    }
  };

  return (
    <div className="section">
      <div className="container max-w-3xl">
        <h1 className="text-2xl font-bold mb-4">Bet request</h1>
        <form onSubmit={submit} className="grid gap-4">
          <div><label className="block mb-1 text-sm">Title</label><input name="title" value={form.title} onChange={onChange} required /></div>
          <div><label className="block mb-1 text-sm">Market</label><input name="market" value={form.market} onChange={onChange} /></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div><label className="block mb-1 text-sm">Odds format</label>
              <select name="oddsFormat" value={form.oddsFormat} onChange={onChange}>
                <option value="decimal">Decimal</option>
                <option value="american">American</option>
                <option value="fractional">Fractional</option>
              </select>
            </div>
            <div><label className="block mb-1 text-sm">Desired odds</label><input name="desiredOdds" value={form.desiredOdds} onChange={onChange} placeholder="1.85 / +120" /></div>
            <div><label className="block mb-1 text-sm">Stake</label><input name="stake" value={form.stake} onChange={onChange} placeholder="100" /></div>
          </div>
          <div><label className="block mb-1 text-sm">Notes</label><textarea rows="4" name="notes" value={form.notes} onChange={onChange} /></div>
          <div className="form-actions"><button type="submit" className="btn-primary px-4">Submit</button></div>
        </form>

        <div className="mt-8 bg-white/5 p-4 rounded-xl border border-white/10">
          <h2 className="text-lg font-semibold mb-3">My requests</h2>
          <table>
            <thead><tr><th>Title</th><th>Status</th><th>Odds</th><th>Stake</th><th>Updated</th></tr></thead>
            <tbody>
              {list.length === 0 && <tr><td colSpan="5" className="text-center text-white/60 py-4">No requests yet.</td></tr>}
              {list.map((r) => (
                <tr key={r._id || r.at}>
                  <td className="text-white">{r.title}</td>
                  <td className="capitalize">{r.status || 'pending'}</td>
                  <td>{r.desiredOdds}</td>
                  <td>{r.stake}</td>
                  <td>{new Date(r.updatedAt || r.at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
