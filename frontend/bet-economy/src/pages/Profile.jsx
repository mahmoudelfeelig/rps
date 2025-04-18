import React from 'react'
import { FaHeart, FaCoins, FaShieldAlt } from 'react-icons/fa'
import styles from './Profile.module.css'

const Profile = () => {
  // Mock data
  const user = {
    name: "JohnDoe",
    balance: 2450.75,
    hearts: 42,
    badges: ['High Roller', 'Community Hero', 'Lucky Streak']
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>{user.name}'s Profile</h1>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <FaCoins className={styles.statIcon} />
            <span>${user.balance.toLocaleString()}</span>
          </div>
          <div className={styles.statItem}>
            <FaHeart className={styles.statIcon} />
            <span>{user.hearts} Hearts</span>
          </div>
        </div>
      </div>

      <div className={styles.badgesSection}>
        <h2 className={styles.sectionTitle}>
          <FaShieldAlt className={styles.sectionIcon} />
          Earned Badges
        </h2>
        <div className={styles.badgesGrid}>
          {user.badges.map((badge, index) => (
            <div key={index} className={styles.badgeCard}>
              <div className={styles.badgeIcon}>🏆</div>
              <span className={styles.badgeName}>{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Profile