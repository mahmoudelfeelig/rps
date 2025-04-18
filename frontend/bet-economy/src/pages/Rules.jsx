import React from 'react'
import { FaCoins, FaGift, FaShieldAlt, FaBalanceScale } from 'react-icons/fa'
import styles from './Rules.module.css'

const Rules = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Game Rules & Economy Guide</h1>
      
      <div className={styles.section}>
        <div className={styles.icon}>
          <FaCoins />
        </div>
        <h2>Earning Currency</h2>
        <ul>
          <li>Community contributions (hosting events, helping others)</li>
          <li>Completing achievements and challenges</li>
          <li>Receiving heart reactions on your messages</li>
          <li>Successful bets and casino games</li>
        </ul>
      </div>

      <div className={styles.section}>
        <div className={styles.icon}>
          <FaGift />
        </div>
        <h2>Spending Currency</h2>
        <ul>
          <li>Purchasing limited edition badges</li>
          <li>Buying special items from the bank</li>
          <li>Commissioning tasks from other users</li>
          <li>Participating in high-stakes bets</li>
        </ul>
      </div>

      <div className={styles.section}>
        <div className={styles.icon}>
          <FaShieldAlt />
        </div>
        <h2>Admin Responsibilities</h2>
        <ul>
          <li>Maintaining economic balance</li>
          <li>Creating new events and challenges</li>
          <li>Monitoring for exploits</li>
          <li>Approving badge creations</li>
        </ul>
      </div>
    </div>
  )
}

export default Rules