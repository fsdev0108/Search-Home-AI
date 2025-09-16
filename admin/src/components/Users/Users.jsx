import { useState, useEffect } from 'react'
import './Users.css'
import Modal from '../Modal/Modal'
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
            <div className="users-loading">
                <div className="spinner"></div>
                <p>Loading users...</p>
            </div>
        )
    }

    return (
        <div className="users">
            <div className="users-header">
                <h1>Manage Users</h1>
                {currentIntegration && (
                    <div className="integration-info">
                        <span>Integration: {currentIntegration.organizationName}</span>
                    </div>
                )}
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    + New User
                </button>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}

            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(user => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.name}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className="status-badge status-active">Active</span>
                                </td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn btn-sm btn-secondary"
                                            onClick={() => alert('Edit functionality in development')}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-sm btn-danger"
                                            onClick={() => handleDeleteUser(user.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

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
