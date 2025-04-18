import React from 'react';
import styles from './Dashboard.module.css';
import BetList from './BetList';

const Dashboard = () => {
  // Temporary data
  const balance = 2450.75;
  const badges = ['High Roller', 'Newbie', 'Lucky Streak'];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h1 className={styles.title}>Welcome Back, Player! 🎮</h1>
        <div className={styles.balanceCard}>
          <div className={styles.balanceHeader}>
            <span className={styles.balanceTitle}>Your Balance</span>
            <div className={styles.chip}>💎 VIP Member</div>
          </div>
          <div className={styles.balanceAmount}>${balance.toLocaleString()}</div>
          <div className={styles.balanceActions}>
            <button className={styles.actionButton}>Deposit</button>
            <button className={styles.actionButton}>Withdraw</button>
          </div>
        </div>
      </div>
      
      <BetList />
      
      <div className={styles.badgesSection}>
        <h2 className={styles.sectionTitle}>Your Badges ✨</h2>
        <div className={styles.badgesGrid}>
          {badges.map((badge, index) => (
            <div key={index} className={styles.badgeCard}>
              <div className={styles.badgeIcon}>🏅</div>
              <span className={styles.badgeName}>{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;