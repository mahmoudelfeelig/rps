import React from 'react'
import { Link } from 'react-router-dom'
import styles from './NotFound.module.css'

const NotFound = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>404 - Page Not Found</h1>
      <p className={styles.text}>The page you're looking for doesn't exist.</p>
      <Link to="/" className={styles.button}>
        Return to Home
      </Link>
    </div>
  )
}

export default NotFound