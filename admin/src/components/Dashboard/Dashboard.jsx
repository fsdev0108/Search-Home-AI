import { useState, useEffect } from 'react'
import './Dashboard.css'

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    replicas: 0,
    files: 0,
    storage: 0
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      // TODO: Replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000))

      setStats({
        users: 12,
        replicas: 8,
        files: 24,
        storage: 156.8
      })
    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const cards = [
    {
      title: 'Total Users',
      value: stats.users
    },
    {
      title: 'Total Replicas',
      value: stats.replicas
    },
    {
      title: 'Files Uploaded',
      value: stats.files
    },
    {
      title: 'Storage Used',
      value: `${stats.storage} MB`
    }
  ]

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>System overview and statistics</p>
      </div>

      <div className="dashboard-grid">
        {cards.map((card, index) => (
          <div key={index} className="card">
            <div className="card-content">
              <h3>{card.title}</h3>
              <div className="card-value">{card.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-charts">
        <div className="chart-section">
          <h2>Recent Activity</h2>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-content">
                <p>New file uploaded by user123</p>
                <small>2 hours ago</small>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-content">
                <p>New user created: real-estate-company</p>
                <small>4 hours ago</small>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-content">
                <p>New replica created: Property Assistant</p>
                <small>6 hours ago</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
