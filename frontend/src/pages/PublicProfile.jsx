import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { API_BASE } from "../api";
import { BadgeCheck } from "lucide-react";

export default function PublicProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBadge, setSelectedBadge] = useState(null);

  useEffect(() => {
    const fetchPublicProfile = async () => {
      try {
        const { data } = await axios.get(
          `${API_BASE}/api/user/public/${username}`
        );
        const formattedItems = (data.inventory || []).map(
          ({ item, quantity }) => ({
            _id: item?._id || "unknown",
            name: item?.name || "Unknown Item",
            image: item?.image
              ? `/assets/rps/${item.image}`
              : null,
            quantity: quantity ?? 1,
          })
        );

        setUser({
          ...data,
          items: formattedItems,
          profileImage: data.profileImage
            ? `${API_BASE}${data.profileImage}`
            : "/assets/default-avatar.png",
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

  const handleBadgeClick = (badge) => {
    setSelectedBadge((prev) =>
      prev?.name === badge.name ? null : badge
    );
  };

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
        {/* Header */}
        <div className="flex flex-col items-center space-y-4">
          <img
            src={user.profileImage}
            alt={`${user.username}'s profile`}
            className="w-28 h-28 rounded-full border-4 border-primary object-cover"
          />
          <h1 className="text-3xl font-bold text-primary">
            {user.username}
          </h1>
          <p className="text-white/80 text-lg">
            Balance:{" "}
            <span className="text-green-400 font-semibold">
              ${user.balance}
            </span>
          </p>
        </div>

        {/* Achievements */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-pink-400">
            Achievements
          </h2>
          {user.achievements?.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {user.achievements.map((ach, i) => (
                <div
                  key={`ach-${i}-${ach._id}`}
                  className="bg-gray-800 p-3 rounded-lg text-center"
                >
                  <img
                    src={
                      ach.icon
                        ? `/assets/rps/${ach.icon}`
                        : "/assets/default-avatar.png"
                    }
                    alt={ach.title}
                    className="w-12 h-12 mx-auto mb-2"
                  />
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
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                      {user.badges.map(badge => {
                        const isSelected = selectedBadge?.name === badge.name;
                        return (
                          <div
                            key={badge._id}
                            onClick={() => handleBadgeClick(badge)}
                            className={`
                              relative group p-4 rounded-lg cursor-pointer transition-transform
                              ${isSelected ? 'ring-2 ring-yellow-400' : 'border border-white/10 hover:border-white/30 hover:scale-105'}
                            `}
                          >
                            <div className="text-3xl mb-2">🏅</div>
                            <div className="font-medium">{badge.name}</div>
                          </div>
                        );
                      })}
                    </div>

                    {selectedBadge && (
                      <div className="mt-6 bg-white/10 p-4 rounded-xl border border-white/10">
                        <h3 className="text-lg font-semibold mb-1">{selectedBadge.name}</h3>
                        <p className="text-sm">{selectedBadge.description}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <p className="text-white/70">No badges yet.</p>
                )}
              </div>

        {/* Inventory */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold mb-4 text-blue-400">
            Inventory
          </h2>
          {user.items?.length > 0 ? (
            <div className="grid grid-cols-3 gap-4">
              {user.items.map((item, i) => (
                <div
                  key={`item-${i}-${item._id}`}
                  className="bg-gray-800 p-3 rounded-lg text-center relative"
                >
                  <img
                    src={item.image || "/assets/default-avatar.png"}
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
          ) : (
            <p className="text-white/70">No items in inventory.</p>
          )}
        </div>
      </div>
    </div>
  );
}
