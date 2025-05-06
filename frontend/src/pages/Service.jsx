import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShoppingCart,
  Trash2,
  Pencil,
  CheckCircle,
  History,
  ThumbsUp
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { API_BASE } from '../api';

const Services = () => {
  const { user, token, refreshUser } = useAuth();
  const [services, setServices] = useState([]);
  const [tab, setTab] = useState('all');
  const [form, setForm] = useState({ title: '', description: '', price: '' });
  const [editing, setEditing] = useState(false);
  const [activeService, setActiveService] = useState(null);
  const [purchases, setPurchases] = useState([]);
  const [history, setHistory] = useState({ asProvider: [], asBuyer: [] });
  const [selectedService, setSelectedService] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  const fetchData = async () => {
    try {
      const [servicesRes, purchasesRes, historyRes] = await Promise.all([
        fetch(`${API_BASE}/api/services?showAll=true`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/services/purchases`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/api/services/history`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
      ]);

      const servicesData = await servicesRes.json();
      setServices(servicesData);

      setActiveService(
        servicesData.find(
          s =>
            String(s.provider._id) === user._id &&
            (!s.finalized || (s.finalized && !s.buyerAccepted))
        )
      );

      setPurchases(await purchasesRes.json());
      setHistory(await historyRes.json());
    } catch (err) {
      toast.error('Failed to load data');
    }
  };

  useEffect(() => {
    if (user) fetchData();
  }, [user]);

  useEffect(() => {
    if (editing) setTab('my');
  }, [editing]);

  const handleCreateOrUpdate = async e => {
    e.preventDefault();
    try {
      const method = editing ? 'PUT' : 'POST';
      const payload = { ...form, price: parseFloat(form.price) };

      const res = await fetch(`${API_BASE}/api/services`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error((await res.json()).message);

      toast.success(editing ? 'Service updated' : 'Service created');
      setForm({ title: '', description: '', price: '' });
      setEditing(false);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/services`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) throw new Error((await res.json()).message);

      toast.success('Service deleted');
      setForm({ title: '', description: '', price: '' });
      setEditing(false);
      await fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleBuyClick = service => {
    setSelectedService(service);
    setShowConfirm(true);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedService) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/services/buy/${selectedService._id}`,
        { method: 'POST', headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error((await res.json()).message);

      toast.success('Purchase successful!');
      setShowConfirm(false);
      setSelectedService(null);
      await fetchData();
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
      setShowConfirm(false);
      setSelectedService(null);
    }
  };
  // finalize by provider
  const handleFinalize = async serviceId => {
    try {
      const res = await fetch(`${API_BASE}/api/services/finalize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ serviceId })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success('Service finalized!');
      await fetchData();
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // accept finalization by buyer
  const handleAccept = async serviceId => {
    try {
      const res = await fetch(`${API_BASE}/api/services/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ serviceId })
      });
      if (!res.ok) throw new Error((await res.json()).message);
      toast.success('Finalization accepted!');
      await fetchData();
      await refreshUser();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // return list based on current tab
  const filteredServices = () => {
    switch (tab) {
      case 'my':
        return services.filter(
          s =>
            String(s.provider._id) === user._id &&
            (!s.finalized || !s.buyerAccepted)
        );
      case 'purchased':
        return purchases.filter(s => !s.buyerAccepted);
      case 'history':
        return [...history.asProvider, ...history.asBuyer];
      case 'all':
      default:
        // others' unsold
        return services.filter(
          s => !s.buyer && String(s.provider._id) !== user._id
        );
    }
  };

  // show the create/update form in "my" if editing or if no active service
  const showForm = tab === 'my' && (editing || !activeService);

  return (
    <div className="pt-[6rem] px-6 sm:px-12 lg:px-24 text-white min-h-screen">
      {/* Tabs */}
      <div className="flex justify-center flex-wrap gap-4 mb-10">
        {[
          { key: 'all', label: 'All Services' },
          { key: 'my', label: 'My Services' },
          { key: 'purchased', label: 'My Purchases' },
          { key: 'history', label: 'History' },
        ].map(({ key, label }) => (
          <button
            key={key}
            className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
              tab === key
                ? 'bg-green-600 text-white shadow-lg'
                : 'bg-white/10 hover:bg-white/20'
            }`}
            onClick={() => {
              setTab(key);
              setEditing(false);
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Create / Update Form */}
      {showForm && (
        <form
          onSubmit={handleCreateOrUpdate}
          className="mb-12 mx-auto bg-white/5 p-6 rounded-2xl max-w-xl space-y-4 border border-white/10"
        >
          <h2 className="text-xl font-semibold text-center">
            {editing ? 'Update Service' : 'Create New Service'}
          </h2>
          <input
            type="text"
            placeholder="Service Title"
            value={form.title}
            onChange={e => setForm({ ...form, title: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/10 focus:ring-2 focus:ring-green-400"
            required
          />
          <textarea
            placeholder="Service Description"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/10 focus:ring-2 focus:ring-green-400 h-32"
            required
          />
          <input
            type="number"
            placeholder="Price"
            value={form.price}
            onChange={e => setForm({ ...form, price: e.target.value })}
            className="w-full p-3 rounded-lg bg-white/10 focus:ring-2 focus:ring-green-400"
            required
          />
          <div className="flex justify-center gap-4">
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {editing ? 'Update' : 'Create'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 px-6 py-2 rounded-lg font-semibold transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </form>
      )}

      {/* Service Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices().map(service => {
          const isOwner = String(service.provider._id) === user._id;
          const isPurchased = !!service.buyer;
          const isFinalized = service.finalized;
          const buyerAccepted = service.buyerAccepted;

          return (
            <div
              key={service._id}
              className="relative bg-white/5 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-colors"
            >
              {/* Provider */}
              <div className="flex items-center gap-3 mb-4">
                <img
                  src={
                    service.provider.profileImage
                      ? `${API_BASE}${service.provider.profileImage}`
                      : '/default-avatar.png'
                  }
                  alt={service.provider.username}
                  className="w-12 h-12 rounded-full border-2 border-white/20 object-cover"
                />
                <div>
                  <Link
                    to={`/profile/${service.provider.username}`}
                    className="font-semibold hover:text-green-400 transition-colors"
                  >
                    {service.provider.username}
                  </Link>
                  <p className="text-xs text-white/60">
                    {isFinalized && buyerAccepted
                      ? 'Completed'
                      : isFinalized
                        ? 'Finalized'
                        : 'Provider'}
                  </p>
                </div>
              </div>

              {/* Title, Desc, Price */}
              <h3 className="text-xl font-bold mb-2">{service.title}</h3>
              <p className="text-white/75 mb-4">{service.description}</p>
              <div className="text-2xl font-bold text-green-400 mb-6">
                ${service.price}
              </div>

              {/* Buyer Info */}
              {service.buyer && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <img
                      src={
                        service.buyer.profileImage
                          ? `${API_BASE}${service.buyer.profileImage}`
                          : '/default-avatar.png'
                      }
                      className="w-8 h-8 rounded-full"
                      alt={service.buyer.username}
                    />
                    <div>
                      <p className="text-xs text-white/60">Purchased by</p>
                      <Link
                        to={`/profile/${service.buyer.username}`}
                        className="font-semibold hover:text-green-400 transition-colors"
                      >
                        {service.buyer.username}
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="absolute top-4 right-4 flex gap-2 flex-wrap">
                {/* Edit/Delete in My Services */}
                {tab === 'my' && isOwner && !isPurchased && (
                  <>
                    <button
                      onClick={() => {
                        setForm({
                          title: service.title,
                          description: service.description,
                          price: service.price,
                        });
                        setEditing(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </>
                )}

                {/* Finalize in My Services for sold */}
                {tab === 'my' && isOwner && isPurchased && !isFinalized && (
                  <button
                    onClick={() => handleFinalize(service._id)}
                    className="bg-purple-600 hover:bg-purple-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                  >
                    <CheckCircle size={14} /> Finalize
                  </button>
                )}

                {/* Buy in All Services */}
                {tab === 'all' && !isOwner && !isPurchased && (
                  <button
                    onClick={() => handleBuyClick(service)}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                  >
                    <ShoppingCart size={14} /> Buy
                  </button>
                )}

                {/* Accept in My Purchases */}
                {tab === 'purchased' && isPurchased && isFinalized && !buyerAccepted && (
                  <button
                    onClick={() => handleAccept(service._id)}
                    className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded-full flex items-center gap-1 text-sm"
                  >
                    <ThumbsUp size={14} /> Accept
                  </button>
                )}
              </div>

              {/* Finalized Timestamp */}
              {isFinalized && service.completedAt && (
                <div className="text-sm text-white/50 mt-4">
                  Finalized on: {new Date(service.completedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Confirm Purchase Modal */}
      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirm Purchase"
        onConfirm={handleConfirmPurchase}
      >
        <p>Are you sure you want to purchase this service?</p>
      </Modal>
    </div>
  );  
};

export default Services;
