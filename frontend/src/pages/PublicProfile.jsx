import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";

export default function PublicProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const { data } = await axios.get(`${API_BASE}/api/user/public/${username}`);
        const formattedItems = (data.inventory || []).map(({ item, quantity }) => ({
          _id:      item?._id || 'unknown',
          name:     item?.name || 'Unknown Item',
          image:    item?.image ? `/assets/rps/${item.image}` : null,
          quantity: quantity ?? 1
        }));

        setUser({
          ...data,
          items: formattedItems,
          profileImage: data.profileImage
            ? `${API_BASE}${data.profileImage}`
            : '/assets/default-avatar.png',
        });
      } catch (err) {
        console.error(err);
        setError("User not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchPublicProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl animate-pulse">
        Loading profile...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex justify-center items-center h-screen text-red-400 text-lg">
        {error || "User not found."}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 py-20 px-4 text-white">
      <div className="max-w-3xl mx-auto bg-white/5 border border-white/10 rounded-2xl shadow-lg p-8 backdrop-blur">
        <div className="flex flex-col items-center space-y-4">
        <img
          src={user.profileImage || 'default-avatar.png'}
          alt={`${user.username}'s profile`}
          className="w-28 h-28 rounded-full border-4 border-primary object-cover"
        />
          <h1 className="text-3xl font-bold text-primary">{user.username}</h1>
          <p className="text-white/80 text-lg">
            Balance: <span className="text-green-400 font-semibold">${user.balance}</span>
          </p>
        </div>

        {/* Achievements */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-pink-400">Achievements</h2>
          {user.achievements?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2 text-primary">Achievements</h2>
              <div className="grid grid-cols-3 gap-4">
              {user.achievements.map((ach, index) => (
                <div key={`ach-${index}-${ach._id}`} className="bg-gray-800 p-3 rounded-lg text-center">
                <img
                  src={ach.icon ? `/assets/rps/${ach.icon}` : '/default-avatar.png'}
                  alt={ach.title}
                  className="w-12 h-12 mx-auto mb-2"
                />
                <div className="font-semibold">{ach.title}</div>
                </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Inventory */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Inventory</h2>
          {user.items?.length > 0 && (
            <div className="mt-6">
              <h2 className="text-xl font-bold mb-2 text-primary">Items</h2>
              <div className="grid grid-cols-3 gap-4">
              {user.items.map((item, index) => (
                <div key={`item-${index}-${item._id}`} className="bg-gray-800 p-3 rounded-lg text-center relative">
                  <img
                    src={item.image || '/default-avatar.png'}
                    alt={item.name}
                    className="w-12 h-12 mx-auto mb-2"
                  />
                  <div className="font-semibold">{item.name}</div>
                  {item.quantity > 1 && (
                    <div className="absolute top-1 right-2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      ×{item.quantity}
                    </div>
                  )}
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
