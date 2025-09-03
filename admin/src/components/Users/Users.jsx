import { useState, useEffect } from 'react'
import './Users.css'
import Modal from '../Modal/Modal'

const Users = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        email: ''
    })

    useEffect(() => {
        loadUsers()
    }, [])

    const loadUsers = async () => {
        try {
            // TODO: Replace with actual API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            setUsers([
                { id: 'user1', name: 'Real Estate Company A', email: 'admin@companya.com' },
                { id: 'user2', name: 'Property Group B', email: 'info@propertygroupb.com' },
                { id: 'user3', name: 'Housing Solutions', email: 'contact@housingsolutions.com' }
            ])
        } catch (error) {
            console.error('Error loading users:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateUser = async (e) => {
        e.preventDefault()

        try {
            // TODO: Replace with actual API call
            const newUser = {
                id: formData.id,
                name: formData.name,
                email: formData.email
            }

            setUsers(prev => [...prev, newUser])
            setShowCreateModal(false)
            setFormData({ id: '', name: '', email: '' })

            // Show success message
            alert('User created successfully!')
        } catch (error) {
            console.error('Error creating user:', error)
            alert('Error creating user')
        }
    }

    const handleDeleteUser = async (userId) => {
        if (confirm('Are you sure you want to delete this user?')) {
            try {
                // TODO: Replace with actual API call
                setUsers(prev => prev.filter(user => user.id !== userId))
                alert('User deleted successfully!')
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
                <button
                    className="btn btn-primary"
                    onClick={() => setShowCreateModal(true)}
                >
                    + New User
                </button>
            </div>

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
                <form onSubmit={handleCreateUser}>
                    <div className="form-group">
                        <label htmlFor="user-id">User ID:</label>
                        <input
                            type="text"
                            id="user-id"
                            value={formData.id}
                            onChange={(e) => setFormData(prev => ({ ...prev, id: e.target.value }))}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="user-name">Name:</label>
                        <input
                            type="text"
                            id="user-name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            required
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
