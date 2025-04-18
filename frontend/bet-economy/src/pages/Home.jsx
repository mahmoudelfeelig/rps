import React from 'react'
import { Link } from 'react-router-dom'
import styles from './Home.module.css'

const Home = () => {
  const isLoggedIn = false // Replace with actual auth check

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>Welcome to BetEconomy</h1>
        <p className={styles.subtitle}>Where Every Action Counts</p>
        
        {isLoggedIn ? (
          <Link to="/dashboard" className={styles.ctaButton}>
            Go to Dashboard
          </Link>
        ) : (
          <div className={styles.authLinks}>
            <Link to="/login" className={styles.ctaButton}>
              Get Started
            </Link>
            <Link to="/rules" className={styles.secondaryButton}>
              Learn the Rules
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home