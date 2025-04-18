import React, { useEffect, useState } from 'react';
import styles from './BetList.module.css';

const BetList = () => {
  const [bets, setBets] = useState([]);
  const [loading, setLoading] = useState(true);

  // Temporary mock data
  useEffect(() => {
    setTimeout(() => {
      setBets([
        { id: 1, title: "World Cup Winner", odds: "2.5", endTime: "2024-07-15" },
        { id: 2, title: "Election Prediction", odds: "3.2", endTime: "2024-11-05" },
        { id: 3, title: "Stock Market Challenge", odds: "1.8", endTime: "2024-09-30" }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  return (
    <div className={styles.betList}>
      <h2 className={styles.sectionTitle}>Active Bets 🔥</h2>
      {loading ? (
        <div className={styles.loader}></div>
      ) : (
        <div className={styles.betGrid}>
          {bets.map((bet) => (
            <div key={bet.id} className={styles.betCard}>
              <div className={styles.betHeader}>
                <h3 className={styles.betTitle}>{bet.title}</h3>
                <span className={styles.odds}>{bet.odds}x</span>
              </div>
              <div className={styles.betFooter}>
                <span className={styles.endTime}>⏳ {bet.endTime}</span>
                <button className={styles.betButton}>Place Bet</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BetList;