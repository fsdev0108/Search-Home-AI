import { useState, useEffect } from 'react'
import Modal from '../Modal/Modal'
import { Button, Card, Loading } from '../UI'
import { replicasAPI, usersAPI, integrationsAPI, knowledgeBaseAPI } from '../../services/api'

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

      const replicasResponse = await replicasAPI.getAll(integration.id)
      const allReplicas = replicasResponse.data || []

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
      const replicasResponse = await replicasAPI.getAll(currentIntegration.id)
      const allReplicas = replicasResponse.data || []

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
      window.open(entry.file.downloadURL, '_blank')
    } else if (entry.type === 'url' && entry.url) {
      window.open(entry.url, '_blank')
    } else if (entry.type === 'youtube' && entry.youtube?.url) {
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
      <div className="container-admin py-8">
        <Loading message="Loading replicas..." />
      </div>
    )
  }

  return (
    <div className="container-admin py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Manage Replicas</h1>
          {currentIntegration && (
            <p className="text-gray-600">
              Integration: {currentIntegration.organizationName}
            </p>
          )}
        </div>
        <Button
          onClick={openModal}
          disabled={!currentIntegration}
        >
          + New Replica
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
                  UUID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
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
              {replicas.map(replica => (
                <tr key={replica.uuid} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {replica.uuid}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {replica.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {replica.ownerID}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                    <Button
                      size="sm"
                      onClick={() => toggleReplicaExpansion(replica)}
                      disabled={filesLoading}
                    >
                      {filesLoading && expandedReplica?.uuid === replica.uuid ? 'Loading...' :
                        expandedReplica?.uuid === replica.uuid ? 'Hide Files' : 'View Files'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
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

      {/* Expanded Files Section */}
      {expandedReplica && (
        <Card className="mt-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Knowledge Base Files - {expandedReplica.name}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedReplica(null)}
            >
              Close
            </Button>
          </div>

          {filesLoading ? (
            <Loading message="Loading files..." size="sm" />
          ) : (
            <div>
              {knowledgeBase.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-2">No files found for this replica.</p>
                  <p className="text-gray-500 text-sm">Upload files to the knowledge base to see them here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Summary
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {knowledgeBase.map(file => (
                        <tr key={file.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {file.id}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                              {file.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {file.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold ${file.status.toLowerCase() === 'active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                              }`}>
                              {file.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 max-w-xs truncate">
                            {file.summary || 'No summary'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {new Date(file.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                            <Button
                              size="sm"
                              onClick={() => toggleEntryExpansion(file)}
                              disabled={entryLoading}
                            >
                              {expandedEntry?.id === file.id ? 'Hide' : 'View'}
                            </Button>
                            {canDownload(file) && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownload(file)}
                              >
                                {file.type === 'file' ? 'Download' : 'Open'}
                              </Button>
                            )}
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteEntry(file)}
                            >
                              Delete
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Entry Details Section */}
              {expandedEntry && (
                <div className="mt-6 p-6 bg-gray-50 border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Entry Details - {expandedEntry.title}
                    </h4>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedEntry(null)}
                    >
                      Close
                    </Button>
                  </div>

                  {entryLoading ? (
                    <Loading message="Loading entry details..." size="sm" />
                  ) : entryDetails ? (
                    <div className="space-y-4">
                      <div>
                        <h5 className="text-lg font-medium text-gray-900">{entryDetails.title}</h5>
                        <div className="flex space-x-2 mt-2">
                          <span className="inline-flex px-2 py-1 text-xs font-semibold bg-blue-100 text-blue-800">
                            {entryDetails.type}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold ${entryDetails.status.toLowerCase() === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                            }`}>
                            {entryDetails.status}
                          </span>
                        </div>
                      </div>

                      {entryDetails.content && (
                        <div>
                          <h6 className="text-sm font-medium text-gray-900 mb-2">Content:</h6>
                          <div className="bg-white p-4 border border-gray-200 rounded-sm">
                            <p className="text-gray-700">{entryDetails.content}</p>
                          </div>
                        </div>
                      )}

                      {entryDetails.summary && (
                        <div>
                          <h6 className="text-sm font-medium text-gray-900 mb-2">Summary:</h6>
                          <p className="text-gray-700">{entryDetails.summary}</p>
                        </div>
                      )}

                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Created:</strong> {new Date(entryDetails.createdAt).toLocaleString()}</p>
                        <p><strong>Updated:</strong> {new Date(entryDetails.updatedAt).toLocaleString()}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600">No entry details available.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      <Modal isOpen={isModalOpen} onClose={closeModal} title="Create New Replica">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter replica name"
            />
          </div>

          <div>
            <label htmlFor="shortDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Short Description *
            </label>
            <textarea
              id="shortDescription"
              name="shortDescription"
              value={formData.shortDescription}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter short description"
            />
          </div>

          <div>
            <label htmlFor="greeting" className="block text-sm font-medium text-gray-700 mb-1">
              Greeting Message *
            </label>
            <textarea
              id="greeting"
              name="greeting"
              value={formData.greeting}
              onChange={handleInputChange}
              required
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="Enter greeting message"
            />
          </div>

          {isAdmin && (
            <div>
              <label htmlFor="ownerID" className="block text-sm font-medium text-gray-700 mb-1">
                Owner *
              </label>
              <select
                id="ownerID"
                name="ownerID"
                value={formData.ownerID}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              >
                <option value="">Select a user</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({user.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              Slug *
            </label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={formData.slug}
              onChange={handleInputChange}
              maxLength={50}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              placeholder="URL-friendly identifier (max 50 characters)"
            />
            <p className="text-xs text-gray-500 mt-1">{formData.slug.length}/50 characters</p>
          </div>

          <div className="flex space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={closeModal}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
            >
              Create Replica
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default Replicas