import { useState, useEffect } from 'react'
import Modal from '../Modal/Modal'
import './Replicas.css'

const Replicas = () => {
  const [replicas, setReplicas] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    greeting: '',
    ownerID: '',
    slug: ''
  })

  useEffect(() => {
    loadReplicas()
  }, [])

  const loadReplicas = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReplicas([
        { uuid: 'rep1', name: 'Property Assistant', ownerID: 'user1' },
        { uuid: 'rep2', name: 'Real Estate Bot', ownerID: 'user2' }
      ])
    } catch (error) {
      console.error('Error loading replicas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // TODO: Implement API call to create replica
      console.log('Creating replica:', formData)

      // Reset form and close modal
      setFormData({
        name: '',
        shortDescription: '',
        greeting: '',
        ownerID: '',
        slug: ''
      })
      setIsModalOpen(false)

      // Reload replicas
      await loadReplicas()
    } catch (error) {
      console.error('Error creating replica:', error)
    }
  }

  const openModal = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setFormData({
      name: '',
      shortDescription: '',
      greeting: '',
      ownerID: '',
      slug: ''
    })
  }

  if (loading) {
    return (
      <div className="replicas-loading">
        <div className="spinner"></div>
        <p>Loading replicas...</p>
      </div>
    )
  }

  return (
    <div className="replicas">
      <div className="replicas-header">
        <h1>Manage Replicas</h1>
        <button className="btn btn-primary" onClick={openModal}>
          + New Replica
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>UUID</th>
              <th>Name</th>
              <th>User</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {replicas.map(replica => (
              <tr key={replica.uuid}>
                <td>{replica.uuid}</td>
                <td>{replica.name}</td>
                <td>{replica.ownerID}</td>
                <td>
                  <span className="status-badge status-active">Active</span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-secondary">
                      Edit
                    </button>
                    <button className="btn btn-sm btn-danger">
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create New Replica">
        <form onSubmit={handleSubmit} className="replica-form">
          <div className="form-group">
            <label htmlFor="name">Name *</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              maxLength={50}
              required
              placeholder="Enter replica name (max 50 characters)"
            />
            <small>{formData.name.length}/50 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="shortDescription">Short Description *</label>
            <input
              type="text"
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              maxLength={50}
              required
              placeholder="Brief description (max 50 characters)"
            />
            <small>{formData.shortDescription.length}/50 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="greeting">Greeting *</label>
            <textarea
              id="greeting"
              name="greeting"
              value={formData.greeting}
              onChange={handleInputChange}
              maxLength={600}
              required
              rows={3}
              placeholder="Welcome message (max 600 characters)"
            />
            <small>{formData.greeting.length}/600 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="ownerID">Owner ID *</label>
            <input
              type="text"
              id="ownerID"
              name="ownerID"
              value={formData.ownerID}
              onChange={handleInputChange}
              required
              placeholder="Enter owner user ID"
            />
          </div>

          <div className="form-group">
            <label htmlFor="slug">Slug *</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              maxLength={50}
              required
              placeholder="URL-friendly identifier (max 50 characters)"
            />
            <small>{formData.slug.length}/50 characters</small>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary" onClick={closeModal}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Replica
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Replicas
