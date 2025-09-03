import { useState, useEffect } from 'react'
import './Replicas.css'

const Replicas = () => {
  const [replicas, setReplicas] = useState([])
  const [loading, setLoading] = useState(true)

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
        <button className="btn btn-primary">
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
    </div>
  )
}

export default Replicas
