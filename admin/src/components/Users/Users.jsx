import { useState, useEffect } from 'react'
import Modal from '../Modal/Modal'
import { Button, Input, Card, Loading } from '../UI'
import { integrationsAPI, usersAPI } from '../../services/api'

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [currentIntegration, setCurrentIntegration] = useState(null)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        name: '',
        email: ''
    })

    useEffect(() => {
        loadIntegrationAndUsers()
    }, [])

    const loadIntegrationAndUsers = async () => {
        try {
            setLoading(true)
            setError('')

            // First, get the current integration
            const integrationsData = await integrationsAPI.getAll()

            if (!integrationsData.success || !integrationsData.data || integrationsData.data.length === 0) {
                setError('No integration found. Please create an integration in Settings first.')
                setUsers([])
                return
            }

            const integration = integrationsData.data[0]
            setCurrentIntegration(integration)

            // Then, get users for this integration
            const usersData = await usersAPI.getAll(integration.id)

            if (usersData.success) {
                setUsers(usersData.data || [])
            } else {
                setError('Failed to load users: ' + (usersData.error || 'Unknown error'))
                setUsers([])
            }
        } catch (error) {
            console.error('Error loading users:', error)
            setError('Failed to load users. Please check your connection and try again.')
            setUsers([])
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()

        if (!currentIntegration) {
            alert('No integration found. Please create an integration in Settings first.\n\nTo create an integration:\n1. Go to Settings tab\n2. Enter your Organization Name\n3. Enter your X-ORGANIZATION-SECRET from Sensay\n4. Click "Create Integration"')
            return
        }

        try {
            setError('')

            const userData = await usersAPI.create(currentIntegration.id, {
                name: formData.name,
                email: formData.email
            })

            if (userData.success) {
                // Add the new user to the list
                setUsers(prev => [...prev, userData.data])
                setShowCreateModal(false)
                setFormData({ name: '', email: '' })
                alert('User created successfully!')
            } else {
                setError('Failed to create user: ' + (userData.error || 'Unknown error'))
                alert('Failed to create user: ' + (userData.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Error creating user:', error)
            setError('Failed to create user. Please check your connection and try again.')
            alert('Failed to create user. Please check your connection and try again.')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                // Note: Sensay API doesn't have a delete user endpoint
                // This is a local removal for demo purposes
                setUsers(prev => prev.filter(user => user.id !== userId))
                alert('User removed from list successfully!')
            } catch (error) {
                console.error('Error deleting user:', error)
                alert('Error deleting user')
            }
        }
    }

    if (loading) {
        return (
            <div className="container-admin py-8">
                <Loading message="Loading users..." />
            </div>
        )
    }

    return (
        <div className="container-admin py-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-semibold text-gray-900 mb-2">Manage Users</h1>
                    {currentIntegration && (
                        <p className="text-gray-600">
                            Integration: {currentIntegration.organizationName}
                        </p>
                    )}
                </div>
                <Button onClick={() => setShowCreateModal(true)}>
                    + New User
                </Button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            <Card>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                        {user.id}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {user.name}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {user.email}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
                                            Active
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => alert('Edit functionality in development')}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            size="sm"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Delete
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Create User Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New User"
            >
                <div className="form-info">
                    <p><small>User ID will be generated automatically by Sensay API</small></p>
                </div>
                <form onSubmit={handleCreateUser}>
                    <div className="form-group">
                        <label htmlFor="user-name">Name:</label>
                        <input
                            type="text"
                            id="user-name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
                            placeholder="Enter user name"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="user-email">Email:</label>
                        <input
                            type="email"
                            id="user-email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                            placeholder="Enter user email"
                        />
                    </div>

                    <div className="form-actions">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setShowCreateModal(false)}
                        >
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                            Create User
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}

export default Users
