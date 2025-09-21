import { useState } from 'react'
import { authAPI } from '../../services/api'
import { Button, Input, Card, Loading } from '../UI'

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
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                <Card className="text-center">
                    <div className="mb-8">
                        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                            Herainov
                        </h1>
                        <p className="text-gray-600">Sign in to your account</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm">
                                {error}
                            </div>
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

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={loading}
                        >
                            {loading ? 'Signing in...' : 'Sign In'}
                        </Button>
                    </form>
                </Card>
            </div>
        </div>
    )
}

export default Login
