import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

export default function PublicProfile() {
  const { username } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`/api/users/public/${username}`)
      .then(res => setUser(res.data))
      .catch(err => console.error(err));
  }, [username]);

  if (!user) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="max-w-md mx-auto mt-10 bg-white shadow-md rounded p-6">
      <div className="text-center">
        <img src={user.profilePic || '/default-pfp.png'} alt="Profile" className="w-24 h-24 rounded-full mx-auto mb-4" />
        <h1 className="text-2xl font-semibold">{user.username}</h1>
        <p className="text-gray-600">Balance: ${user.balance}</p>
        {/* Optional: Show public achievements or items */}
      </div>
    </div>
  );
}
