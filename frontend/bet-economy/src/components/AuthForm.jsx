import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import styles from './AuthForm.module.css'

const AuthForm = ({ isLogin }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = React.useState({
    email: '',
    password: ''
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    // Add authentication logic
    navigate('/dashboard')
  }

  return (
    <div className={styles.authContainer}>
      <h2 className={styles.title}>{isLogin ? 'Login' : 'Register'}</h2>
      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>
          {isLogin ? 'Sign In' : 'Create Account'}
        </button>
      </form>
      <p className={styles.switchText}>
        {isLogin ? 'New here? ' : 'Already have an account? '}
        <Link to={isLogin ? '/register' : '/login'} className={styles.link}>
          {isLogin ? 'Create an account' : 'Sign in'}
        </Link>
      </p>
    </div>
  )
}

export default AuthForm