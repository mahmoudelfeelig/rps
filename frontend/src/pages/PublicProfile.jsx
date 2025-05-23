import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";
import { BadgeCheck } from "lucide-react";

export default function PublicProfile() {
  const { username } = useParams();
  const [user,   setUser]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  useEffect(() => {
    async function fetchPublicProfile() {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/user/public/${username}`
        );

        // format inventory...
        const formattedItems = (data.inventory || []).map(({ item, quantity }) => ({
          _id:      item?._id ?? "unknown",
          name:     item?.name ?? "Unknown Item",
          image:    item?.image
                      ? item.image.startsWith("http")
                        ? item.image
                        : `${API_BASE}${item.image}`
                      : null,
          emoji:    item?.emoji ?? "📦",
          quantity: quantity ?? 1,
        }));

        setUser({
          ...data,
          items: formattedItems,
          profileImage: data.profileImage
            ? data.profileImage.startsWith("http")
              ? data.profileImage
              : `${API_BASE}${data.profileImage}`
            : "/assets/default-avatar.png",
        });
      } catch (err) {
        console.error(err);
        setError("User not found or an error occurred.");
      } finally {
        setLoading(false);
      }
    }
    fetchPublicProfile();
  }, [username]);

  if (loading) return <div>Loading…</div>;
  if (error || !user) return <div>{error || "No user."}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-gray-950 py-20 px-4 text-white">
      <div className="max-w-3xl mx-auto bg-white/5 border-white/10 rounded-2xl p-8 backdrop-blur">
        {/* Header */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={user.profileImage}
            alt={`${user.username}'s profile`}
            className="w-28 h-28 rounded-full border-4 border-primary object-cover"
          />
          <h1 className="text-3xl font-bold text-primary">@{user.username}</h1>
          <p className="text-white/80 text-lg">
            Balance: <span className="text-green-400 font-semibold">{user.balance}</span> coins
          </p>
        </div>

        {/* Achievements */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-pink-400">Achievements</h2>
          {user.achievements?.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {user.achievements.map((ach, i) => (
                <div
                  key={`${ach._id}-${i}`}
                  className="bg-gray-800 p-3 rounded-lg text-center"
                >
                  {/*
                    If `ach.icon` looks like a URL (starts with http or /),
                    render an <img>; otherwise assume it's an emoji.
                  */}
                  {ach.icon && (ach.icon.startsWith("http") || ach.icon.startsWith("/")) ? (
                    <img
                      src={ach.icon.startsWith("http") ? ach.icon : `${API_BASE}${ach.icon}`}
                      alt={ach.title}
                      className="w-12 h-12 mx-auto mb-2 object-cover"
                    />
                  ) : (
                    <span className="text-4xl block mb-2">{ach.icon}</span>
                  )}
                  <div className="font-semibold">{ach.title}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70">No achievements yet.</p>
          )}
        </div>

        {/* Badges */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-yellow-400 flex items-center gap-2">
            <BadgeCheck className="w-5 h-5" /> Badges
          </h2>
          {user.badges.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {user.badges.map(badge => (
                <div
                  key={badge._id}
                  className="bg-gray-800 p-4 rounded-lg border-white/10 hover:border-white/30 transition"
                >
                  <div className="text-3xl mb-2">🏅</div>
                  <div className="font-medium">{badge.name}</div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70">No badges yet.</p>
          )}
        </div>

        {/* Inventory */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">Inventory</h2>
          {user.items.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {user.items.map((item, i) => (
                <div
                  key={`${item._id}-${i}`}
                  className="bg-gray-800 p-3 rounded-lg text-center relative"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-12 h-12 mx-auto mb-2 object-contain"
                    />
                  ) : (
                    <span className="text-3xl mb-2 block">{item.emoji}</span>
                  )}
                  <div className="font-semibold">{item.name}</div>
                  {item.quantity > 1 && (
                    <div className="absolute top-1 right-2 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                      ×{item.quantity}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-white/70">No items in inventory.</p>
          )}
        </div>
      </div>
    </div>
  );
}
