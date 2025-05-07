import React from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../api';

export default function ResourceClaimButton() {
  const { token } = useAuth();

  const claim = () => {
    axios.get(`${API_BASE}/api/sanctuary/resources`, {
      headers: { Authorization: `Bearer ${token}` }
    }).then(res => {
      alert(`You gained ${res.data.coinsAdded} coins and food!`);
    });
  };

  return (
    <button onClick={claim} className="bg-green-700 hover:bg-green-800 px-4 py-2 rounded">
      🌿 Claim Passive Resources
    </button>
  );
}
