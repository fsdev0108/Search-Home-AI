import { useState } from 'react'
import { authAPI } from '../../services/api'
import './Auth.css'

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleInputChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            // Call real API
            const response = await authAPI.login(formData.email, formData.password)

            if (response.success) {
                // Save token and user data
                localStorage.setItem('authToken', response.data.token)
                localStorage.setItem('user', JSON.stringify(response.data.user))

                // Call login callback
                onLogin(response.data.user)
            } else {
                setError(response.error || 'Login failed')
            }
        } catch (error) {
            console.error('Login error:', error)
            setError('Failed to connect to server. Please try again.')
        }

        setLoading(false)
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>Herainov Admin</h1>
                    <p>Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="admin@herainov.com"
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            placeholder="admin123"
                            disabled={loading}
                        />
                    </div>

                    <div className="login-info">
                        <h4>Test Credentials:</h4>
                        <p><strong>Admin:</strong> admin@herainov.com / admin123</p>
                        <p><strong>User:</strong> user@herainov.com / user123</p>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary auth-submit"
                        disabled={loading}
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Available credentials:</p>
                    <p><strong>Admin:</strong> admin@sensay.com / admin123</p>
                    <p><strong>User:</strong> user@sensay.com / user123</p>
                    <p><small>Login simulado - sem API</small></p>
                </div>
            </div>
        </div>
    )
}

export default Login
