import React, { useState } from 'react';
import styles from './Admin.module.css';

const Admin = () => {
  const [hearts, setHearts] = useState([]);
  const [newBet, setNewBet] = useState({ title: '', odds: '' });
  const [newBadge, setNewBadge] = useState({ name: '', description: '' });

  const handleAddHeart = (username) => {
    setHearts([...hearts, { username, timestamp: new Date().toISOString() }]);
  };

  const handleCreateBet = (e) => {
    e.preventDefault();
    // Add bet creation logic
    setNewBet({ title: '', odds: '' });
  };

  const handleCreateBadge = (e) => {
    e.preventDefault();
    // Add badge creation logic
    setNewBadge({ name: '', description: '' });
  };

  return (
    <div className={styles.adminContainer}>
      <h1 className={styles.adminTitle}>Admin Dashboard</h1>
      
      <section className={styles.section}>
        <h2>Heart Management 💖</h2>
        <div className={styles.heartManager}>
          <input type="text" placeholder="Username" />
          <button 
            className={styles.heartButton}
            onClick={() => handleAddHeart('sampleUser')}
          >
            Add Heart
          </button>
          <div className={styles.heartList}>
            {hearts.map((heart, index) => (
              <div key={index} className={styles.heartItem}>
                <span>{heart.username}</span>
                <span>{new Date(heart.timestamp).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <h2>Create New Bet 🎲</h2>
        <form onSubmit={handleCreateBet} className={styles.form}>
          <input
            type="text"
            placeholder="Bet Title"
            value={newBet.title}
            onChange={(e) => setNewBet({ ...newBet, title: e.target.value })}
          />
          <input
            type="number"
            placeholder="Odds"
            value={newBet.odds}
            onChange={(e) => setNewBet({ ...newBet, odds: e.target.value })}
          />
          <button type="submit" className={styles.createButton}>
            Create Bet
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h2>Create New Badge 🛡️</h2>
        <form onSubmit={handleCreateBadge} className={styles.form}>
          <input
            type="text"
            placeholder="Badge Name"
            value={newBadge.name}
            onChange={(e) => setNewBadge({ ...newBadge, name: e.target.value })}
          />
          <input
            type="text"
            placeholder="Description"
            value={newBadge.description}
            onChange={(e) => setNewBadge({ ...newBadge, description: e.target.value })}
          />
          <button type="submit" className={styles.createButton}>
            Create Badge
          </button>
        </form>
      </section>
    </div>
  );
};

export default Admin;
