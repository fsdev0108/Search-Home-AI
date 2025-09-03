import { useState, useEffect } from 'react'
import './Files.css'

const Files = () => {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadFiles()
  }, [])

  const loadFiles = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      setFiles([
        { id: 'file1', filename: 'properties.xlsx', userId: 'user1', replicaUuid: 'rep1', size: 2048576, uploadedAt: '2024-01-15' },
        { id: 'file2', filename: 'market-data.csv', userId: 'user2', replicaUuid: 'rep2', size: 1048576, uploadedAt: '2024-01-14' }
      ])
    } catch (error) {
      console.error('Error loading files:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (loading) {
    return (
      <div className="files-loading">
        <div className="spinner"></div>
        <p>Loading files...</p>
      </div>
    )
  }

  return (
    <div className="files">
      <div className="files-header">
        <h1>Manage Files</h1>
        <button className="btn btn-primary">
          + Upload File
        </button>
      </div>

      <div className="table-container">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>User</th>
              <th>Replica</th>
              <th>Size</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {files.map(file => (
              <tr key={file.id}>
                <td>{file.id}</td>
                <td>{file.filename}</td>
                <td>{file.userId}</td>
                <td>{file.replicaUuid}</td>
                <td>{formatFileSize(file.size)}</td>
                <td>{new Date(file.uploadedAt).toLocaleDateString('en-US')}</td>
                <td>
                  <div className="action-buttons">
                    <button className="btn btn-sm btn-secondary">
                      Download
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

export default Files
