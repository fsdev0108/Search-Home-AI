import { useState } from 'react'
import { authAPI } from '../../services/api'
import { Button, Input, Card, Loading } from '../UI'

const Login = ({ onLogin }) => {
    const [isRegistering, setIsRegistering] = useState(false)
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

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
        setSuccess('')

        try {
            if (isRegistering) {
                if (formData.password !== formData.confirmPassword) {
                    setError('Passwords do not match')
                    setLoading(false)
                    return
                }

                const response = await authAPI.register(formData.name, formData.email, formData.password)

                if (response.success) {
                    setSuccess('Account created successfully! You are now logged in.')

                    localStorage.setItem('authToken', response.data.token)
                    localStorage.setItem('user', JSON.stringify(response.data.user))

                    onLogin(response.data.user)
                } else {
                    setError(response.error || 'Registration failed')
                }
            } else {
                // Call login API
                const response = await authAPI.login(formData.email, formData.password)

                if (response.success) {
                    localStorage.setItem('authToken', response.data.token)
                    localStorage.setItem('user', JSON.stringify(response.data.user))

                    onLogin(response.data.user)
                } else {
                    setError(response.error || 'Login failed')
                }
            }
        } catch (error) {
            console.error(isRegistering ? 'Registration error:' : 'Login error:', error)
            setError('Failed to connect to server. Please try again.')
        }

        setLoading(false)
    }

    const toggleMode = () => {
        setIsRegistering(!isRegistering)
        setFormData({
            name: '',
            email: '',
            password: '',
            confirmPassword: ''
        })
        setError('')
        setSuccess('')
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Card className="text-center bg-white/95 backdrop-blur-sm border-gray-200 shadow-2xl">
                    <div className="mb-8">
                        <div className="flex items-center justify-center space-x-3 mb-4">
                            <img
                                src="/herainov_house_logo.png"
                                alt="Herainov Logo"
                                className="h-10 w-10 object-contain rounded-md"
                                onError={(e) => {
                                    e.target.style.display = 'none'
                                }}
                            />
                            <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-yellow-800 bg-clip-text text-transparent">
                                Herainov
                            </h1>
                        </div>
                        <p className="text-gray-600">
                            {isRegistering ? 'Create your account' : 'Sign in to your account'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 text-sm">
                                {success}
                            </div>
                        )}

                        {isRegistering && (
                            <Input
                                label="Full Name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                placeholder="Enter your full name"
                                disabled={loading}
                            />
                        )}

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your email"
                            disabled={loading}
                        />

                        <Input
                            label="Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            placeholder="Enter your password"
                            disabled={loading}
                        />

                        {isRegistering && (
                            <Input
                                label="Confirm Password"
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                required
                                placeholder="Confirm your password"
                                disabled={loading}
                            />
                        )}

                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-semibold py-3"
                            disabled={loading}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center space-x-2">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    <span>{isRegistering ? 'Creating account...' : 'Signing in...'}</span>
                                </div>
                            ) : (
                                isRegistering ? 'Create Account' : 'Sign In'
                            )}
                        </Button>
                    </form>

                    <div className="mt-6">
                        <button
                            type="button"
                            onClick={toggleMode}
                            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium"
                            disabled={loading}
                        >
                            {isRegistering
                                ? 'Already have an account? Sign in'
                                : "Don't have an account? Create one"
                            }
                        </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            Real Estate AI Assistant Platform
                        </p>
                    </div>
                </Card>

                <div className="mt-8 text-center">
                    <p className="text-sm text-gray-400">
                        © 2024 Herainov. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Login
