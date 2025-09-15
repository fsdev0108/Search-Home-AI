import { useState, useEffect } from 'react'
import './Organizations.css'

const Organizations = () => {
    const [organizations, setOrganizations] = useState([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [newOrganization, setNewOrganization] = useState({
        name: '',
        description: '',
        domain: ''
    })

    useEffect(() => {
        fetchOrganizations()
    }, [])

    const fetchOrganizations = async () => {
        try {
            setLoading(true)
            const response = await fetch('http://localhost:3000/api/organizations', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            })

            if (response.ok) {
                const data = await response.json()
                setOrganizations(data.data || [])
            }
        } catch (error) {
            console.error('Error fetching organizations:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCreateOrganization = async (e) => {
        e.preventDefault()
        try {
            const response = await fetch('http://localhost:3000/api/organizations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify(newOrganization)
            })

            if (response.ok) {
                setShowCreateForm(false)
                setNewOrganization({ name: '', description: '', domain: '' })
                fetchOrganizations()
            }
        } catch (error) {
            console.error('Error creating organization:', error)
        }
    }

    if (loading) {
        return (
            <div className="organizations">
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading organizations...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="organizations">
            <div className="organizations-header">
                <h2>Organizations</h2>
                <p>Manage organizations and their settings</p>
                <button
                    className="create-btn"
                    onClick={() => setShowCreateForm(true)}
                >
                    Create Organization
                </button>
            </div>

            {showCreateForm && (
                <div className="create-organization-form">
                    <h3>Create New Organization</h3>
                    <form onSubmit={handleCreateOrganization}>
                        <div className="form-group">
                            <label htmlFor="name">Organization Name</label>
                            <input
                                type="text"
                                id="name"
                                value={newOrganization.name}
                                onChange={(e) => setNewOrganization({ ...newOrganization, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="description">Description</label>
                            <textarea
                                id="description"
                                value={newOrganization.description}
                                onChange={(e) => setNewOrganization({ ...newOrganization, description: e.target.value })}
                                rows="3"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="domain">Domain</label>
                            <input
                                type="text"
                                id="domain"
                                value={newOrganization.domain}
                                onChange={(e) => setNewOrganization({ ...newOrganization, domain: e.target.value })}
                                placeholder="example.com"
                            />
                        </div>
                        <div className="form-actions">
                            <button type="submit" className="submit-btn">Create Organization</button>
                            <button
                                type="button"
                                className="cancel-btn"
                                onClick={() => setShowCreateForm(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="organizations-list">
                {organizations.length === 0 ? (
                    <div className="empty-state">
                        <p>No organizations found. Create your first organization to get started.</p>
                    </div>
                ) : (
                    organizations.map((org) => (
                        <div key={org.id} className="organization-card">
                            <div className="organization-info">
                                <h3>{org.name}</h3>
                                <p className="organization-description">{org.description}</p>
                                <div className="organization-meta">
                                    <span className="domain">{org.domain}</span>
                                    <span className="created">Created: {new Date(org.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                            <div className="organization-actions">
                                <button className="view-btn">View Details</button>
                                <button className="settings-btn">Settings</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    )
}

export default Organizations
