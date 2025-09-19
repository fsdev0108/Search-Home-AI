import { useState, useEffect } from 'react'
import Modal from '../Modal/Modal'
import { replicasAPI, usersAPI, integrationsAPI, knowledgeBaseAPI } from '../../services/api'
import './Replicas.css'

const Replicas = () => {
  const [replicas, setReplicas] = useState([])
  const [users, setUsers] = useState([])
  const [currentIntegration, setCurrentIntegration] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [error, setError] = useState(null)
  const [expandedReplica, setExpandedReplica] = useState(null)
  const [knowledgeBase, setKnowledgeBase] = useState([])
  const [filesLoading, setFilesLoading] = useState(false)
  const [expandedEntry, setExpandedEntry] = useState(null)
  const [entryDetails, setEntryDetails] = useState(null)
  const [entryLoading, setEntryLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    shortDescription: '',
    greeting: '',
    ownerID: '',
    slug: ''
  })

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = currentUser.role === 'admin'

  useEffect(() => {
    loadIntegrationAndData()
  }, [])

  const loadIntegrationAndData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get integration
      const integrationsResponse = await integrationsAPI.getAll()

      if (!integrationsResponse || !integrationsResponse.data || integrationsResponse.data.length === 0) {
        setError('No integration found. Please create an integration in Settings first.')
        return
      }

      const integration = integrationsResponse.data[0]
      setCurrentIntegration(integration)

      // Load users (for admin dropdown)
      if (isAdmin && currentUser && currentUser.role === 'admin') {
        const usersResponse = await usersAPI.getAll(integration.id)
        setUsers(usersResponse.data || [])
      }

      // Load replicas
      const replicasResponse = await replicasAPI.getAll(integration.id)
      let allReplicas = replicasResponse.data || []

      // Filter replicas based on user role
      if (!isAdmin) {
        // For regular users, only show replicas they own
        const currentUserId = currentUser.id || currentUser.sensayUserId
        allReplicas = allReplicas.filter(replica => replica.ownerID === currentUserId)
      }

      setReplicas(allReplicas)
    } catch (error) {
      console.error('Error loading data:', error)
      setError('Failed to load data. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const loadReplicas = async () => {
    if (!currentIntegration) return

    try {
      // Load replicas
      const replicasResponse = await replicasAPI.getAll(currentIntegration.id)
      let allReplicas = replicasResponse.data || []

      // Filter replicas based on user role
      if (!isAdmin) {
        // For regular users, only show replicas they own
        const currentUserId = currentUser.id || currentUser.sensayUserId
        allReplicas = allReplicas.filter(replica => replica.ownerID === currentUserId)
      }

      setReplicas(allReplicas)
    } catch (error) {
      console.error('Error loading replicas:', error)
      setError('Failed to load replicas. Please try again.')
    }
  }

  const toggleReplicaExpansion = async (replica) => {
    if (expandedReplica?.uuid === replica.uuid) {
      // Collapse
      setExpandedReplica(null)
      setKnowledgeBase([])
      setExpandedEntry(null)
      setEntryDetails(null)
    } else {
      // Expand
      setExpandedReplica(replica)
      setExpandedEntry(null)
      setEntryDetails(null)
      await loadReplicaFiles(replica)
    }
  }

  const loadReplicaFiles = async (replica) => {
    try {
      setFilesLoading(true)
      const response = await knowledgeBaseAPI.getKnowledgeBase(replica.uuid)
      setKnowledgeBase(response.data || [])
    } catch (error) {
      console.error('Error loading replica files:', error)
      setError('Failed to load files for this replica')
    } finally {
      setFilesLoading(false)
    }
  }

  const toggleEntryExpansion = async (entry) => {
    if (expandedEntry?.id === entry.id) {
      // Collapse
      setExpandedEntry(null)
      setEntryDetails(null)
    } else {
      // Expand
      setExpandedEntry(entry)
      await loadEntryDetails(entry)
    }
  }

  const loadEntryDetails = async (entry) => {
    try {
      setEntryLoading(true)
      const response = await knowledgeBaseAPI.getKnowledgeBaseEntry(expandedReplica.uuid, entry.id)
      setEntryDetails(response.data)
    } catch (error) {
      console.error('Error loading entry details:', error)
      setError('Failed to load entry details')
    } finally {
      setEntryLoading(false)
    }
  }

  const handleDeleteEntry = async (entry) => {
    if (!window.confirm(`Are you sure you want to delete "${entry.title}"? This action cannot be undone.`)) {
      return
    }

    try {
      await knowledgeBaseAPI.deleteKnowledgeBaseEntry(expandedReplica.uuid, entry.id)

      // Refresh the knowledge base list
      await loadReplicaFiles(expandedReplica)

      // Close entry details if the deleted entry was expanded
      if (expandedEntry?.id === entry.id) {
        setExpandedEntry(null)
        setEntryDetails(null)
      }

      setError(null)
    } catch (error) {
      console.error('Error deleting entry:', error)
      setError('Failed to delete entry. Please try again.')
    }
  }

  const handleDownload = (entry) => {
    if (entry.type === 'file' && entry.file?.downloadURL) {
      // Open download URL in new tab
      window.open(entry.file.downloadURL, '_blank')
    } else if (entry.type === 'url' && entry.url) {
      // Open URL in new tab
      window.open(entry.url, '_blank')
    } else if (entry.type === 'youtube' && entry.youtube?.url) {
      // Open YouTube URL in new tab
      window.open(entry.youtube.url, '_blank')
    }
  }

  const canDownload = (entry) => {
    return (
      (entry.type === 'file' && entry.file?.downloadURL) ||
      (entry.type === 'url' && entry.url) ||
      (entry.type === 'youtube' && entry.youtube?.url)
    )
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

    if (!currentIntegration) {
      setError('No integration available')
      return
    }

    try {
      setError(null)

      // Determine owner ID based on user role
      let ownerID = formData.ownerID
      if (!isAdmin) {
        // For non-admin users, use their own ID
        ownerID = currentUser.id || currentUser.sensayUserId
      }

      const replicaData = {
        name: formData.name,
        shortDescription: formData.shortDescription,
        greeting: formData.greeting,
        ownerID: ownerID,
        slug: formData.slug
      }

      // Create replica via API
      await replicasAPI.create(currentIntegration.id, replicaData)

      // Reload replicas from backend to get complete data
      await loadReplicas()

      // Reset form and close modal
      setFormData({
        name: '',
        shortDescription: '',
        greeting: '',
        ownerID: '',
        slug: ''
      })
      setIsModalOpen(false)
    } catch (error) {
      console.error('Error creating replica:', error)
      setError('Failed to create replica. Please try again.')
    }
  }

  const openModal = () => {
    // Pre-fill owner ID for non-admin users
    if (!isAdmin && currentUser.id) {
      setFormData(prev => ({
        ...prev,
        ownerID: currentUser.id
      }))
    }
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
        <button
          className="btn btn-primary"
          onClick={openModal}
          disabled={!currentIntegration}
        >
          + New Replica
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {currentIntegration && (
        <div className="integration-info">
          <small>Integration: {currentIntegration.organizationName}</small>
        </div>
      )}

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
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => toggleReplicaExpansion(replica)}
                      disabled={filesLoading}
                    >
                      {filesLoading && expandedReplica?.uuid === replica.uuid ? 'Loading...' :
                        expandedReplica?.uuid === replica.uuid ? 'Hide Files' : 'View Files'}
                    </button>
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

      {/* Expanded Files Section */}
      {expandedReplica && (
        <div className="expanded-files-section">
          <div className="expanded-header">
            <h3>Knowledge Base Files - {expandedReplica.name}</h3>
            <button
              className="btn btn-sm btn-secondary"
              onClick={() => setExpandedReplica(null)}
            >
              Close
            </button>
          </div>

          {filesLoading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading files...</p>
            </div>
          ) : (
            <div className="files-container">
              {knowledgeBase.length === 0 ? (
                <div className="no-files">
                  <p>No files found for this replica.</p>
                  <p>Upload files to the knowledge base to see them here.</p>
                </div>
              ) : (
                <div className="files-list">
                  <div className="table-container">
                    <table className="table">
                      <thead>
                        <tr>
                          <th>ID</th>
                          <th>Type</th>
                          <th>Title</th>
                          <th>Status</th>
                          <th>Summary</th>
                          <th>Created</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {knowledgeBase.map(file => (
                          <tr key={file.id}>
                            <td>{file.id}</td>
                            <td>
                              <span className={`type-badge type-${file.type}`}>
                                {file.type}
                              </span>
                            </td>
                            <td>{file.title}</td>
                            <td>
                              <span className={`status-badge status-${file.status.toLowerCase()}`}>
                                {file.status}
                              </span>
                            </td>
                            <td>{file.summary || 'No summary'}</td>
                            <td>{new Date(file.createdAt).toLocaleDateString()}</td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="btn btn-sm btn-primary"
                                  onClick={() => toggleEntryExpansion(file)}
                                  disabled={entryLoading}
                                  title="View content"
                                >
                                  {expandedEntry?.id === file.id ? 'Hide' : 'View'}
                                </button>
                                {canDownload(file) && (
                                  <button
                                    className="btn btn-sm btn-secondary"
                                    onClick={() => handleDownload(file)}
                                    title={file.type === 'file' ? 'Download file' : 'Open link'}
                                  >
                                    {file.type === 'file' ? 'Download' : 'Open'}
                                  </button>
                                )}
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDeleteEntry(file)}
                                  title="Delete entry"
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

                  {/* Entry Details Section */}
                  {expandedEntry && (
                    <div className="entry-details-section">
                      <div className="entry-details-header">
                        <h4>Entry Details - {expandedEntry.title}</h4>
                        <button
                          className="btn btn-sm btn-secondary"
                          onClick={() => setExpandedEntry(null)}
                        >
                          Close
                        </button>
                      </div>

                      {entryLoading ? (
                        <div className="loading-container">
                          <div className="spinner"></div>
                          <p>Loading entry details...</p>
                        </div>
                      ) : entryDetails ? (
                        <div className="entry-details">
                          <div className="entry-header">
                            <h5>{entryDetails.title}</h5>
                            <div className="entry-meta">
                              <span className={`type-badge type-${entryDetails.type}`}>
                                {entryDetails.type}
                              </span>
                              <span className={`status-badge status-${entryDetails.status.toLowerCase()}`}>
                                {entryDetails.status}
                              </span>
                            </div>
                          </div>

                          {entryDetails.summary && (
                            <div className="entry-section">
                              <h6>Summary</h6>
                              <p>{entryDetails.summary}</p>
                            </div>
                          )}

                          {entryDetails.type === 'file' && entryDetails.file && (
                            <div className="entry-section">
                              <h6>File Information</h6>
                              <div className="file-info">
                                <p><strong>Name:</strong> {entryDetails.file.name}</p>
                                <p><strong>Size:</strong> {Math.round(entryDetails.file.size / 1024)} KB</p>
                                <p><strong>Type:</strong> {entryDetails.file.mimeType}</p>
                                {entryDetails.file.downloadURL && (
                                  <button
                                    className="btn btn-primary"
                                    onClick={() => window.open(entryDetails.file.downloadURL, '_blank')}
                                  >
                                    Download File
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {entryDetails.type === 'url' && entryDetails.website && (
                            <div className="entry-section">
                              <h6>Website Information</h6>
                              <div className="website-info">
                                <p><strong>URL:</strong>
                                  <a href={entryDetails.website.url} target="_blank" rel="noopener noreferrer">
                                    {entryDetails.website.url}
                                  </a>
                                </p>
                                {entryDetails.website.title && <p><strong>Title:</strong> {entryDetails.website.title}</p>}
                                {entryDetails.website.description && <p><strong>Description:</strong> {entryDetails.website.description}</p>}
                                {entryDetails.website.text && (
                                  <div className="website-text">
                                    <h6>Extracted Text:</h6>
                                    <div className="text-content">
                                      {entryDetails.website.text.substring(0, 500)}
                                      {entryDetails.website.text.length > 500 && '...'}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {entryDetails.type === 'youtube' && entryDetails.youtube && (
                            <div className="entry-section">
                              <h6>YouTube Video Information</h6>
                              <div className="youtube-info">
                                <p><strong>URL:</strong>
                                  <a href={entryDetails.youtube.url} target="_blank" rel="noopener noreferrer">
                                    {entryDetails.youtube.url}
                                  </a>
                                </p>
                                {entryDetails.youtube.title && <p><strong>Title:</strong> {entryDetails.youtube.title}</p>}
                                {entryDetails.youtube.description && <p><strong>Description:</strong> {entryDetails.youtube.description}</p>}
                                {entryDetails.youtube.summary && <p><strong>Summary:</strong> {entryDetails.youtube.summary}</p>}
                                {entryDetails.youtube.transcription && (
                                  <div className="transcription">
                                    <h6>Transcription:</h6>
                                    <div className="text-content">
                                      {entryDetails.youtube.transcription.substring(0, 500)}
                                      {entryDetails.youtube.transcription.length > 500 && '...'}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}

                          {entryDetails.rawText && (
                            <div className="entry-section">
                              <h6>Raw Text Content</h6>
                              <div className="text-content">
                                {entryDetails.rawText.substring(0, 1000)}
                                {entryDetails.rawText.length > 1000 && '...'}
                              </div>
                            </div>
                          )}

                          {entryDetails.generatedFacts && entryDetails.generatedFacts.length > 0 && (
                            <div className="entry-section">
                              <h6>Generated Facts</h6>
                              <ul>
                                {entryDetails.generatedFacts.map((fact, index) => (
                                  <li key={index}>{fact}</li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {entryDetails.error && (
                            <div className="entry-section error-section">
                              <h6>Error</h6>
                              <p className="error-message">{entryDetails.error.message}</p>
                            </div>
                          )}

                          <div className="entry-footer">
                            <p><strong>Created:</strong> {new Date(entryDetails.createdAt).toLocaleString()}</p>
                            <p><strong>Updated:</strong> {new Date(entryDetails.updatedAt).toLocaleString()}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="no-data">
                          <p>No entry details available.</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

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

          {isAdmin ? (
            <div className="form-group">
              <label htmlFor="ownerID">Owner ID *</label>
              <select
                id="ownerID"
                name="ownerID"
                value={formData.ownerID}
                onChange={handleInputChange}
                required
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
              <small>Select the user who will own this replica</small>
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="ownerID">Owner ID</label>
              <input
                type="text"
                id="ownerID"
                name="ownerID"
                value={formData.ownerID}
                onChange={handleInputChange}
                readOnly
                className="readonly-field"
                placeholder="Your user ID (auto-filled)"
              />
              <small>This replica will be owned by you automatically</small>
            </div>
          )}

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
