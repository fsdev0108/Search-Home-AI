import { useState, useEffect } from 'react'
import { Card, Loading, Button } from '../UI'
import { integrationsAPI, dashboardAPI, telegramAPI, twilioAPI, hubspotAPI } from '../../services/api'

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    replicas: 0,
    integrations: 0,
    activeIntegrations: 0
  })

  const [integrations, setIntegrations] = useState([])
  const [recentActivity, setRecentActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
  const isAdmin = currentUser.role === 'admin'

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load integrations
      const integrationsResponse = await integrationsAPI.getAll()
      const allIntegrations = integrationsResponse.data || []
      setIntegrations(allIntegrations)

      // If no integrations, show empty state
      if (allIntegrations.length === 0) {
        setStats({ users: 0, replicas: 0, integrations: 0, activeIntegrations: 0 })
        setRecentActivity([])
        return
      }

      // Get current integration (first one for now)
      const currentIntegration = allIntegrations[0]

      // Load dashboard stats for current integration
      const dashboardStats = await dashboardAPI.getStats(currentIntegration.id)

      // Load integration statuses
      const integrationStatuses = await Promise.allSettled([
        telegramAPI.getIntegration(currentIntegration.id).catch(() => null),
        twilioAPI.getIntegration(currentIntegration.id).catch(() => null),
        hubspotAPI.getStatus(currentIntegration.id).catch(() => null)
      ])

      const activeIntegrations = integrationStatuses.filter(result =>
        result.status === 'fulfilled' && result.value?.success
      ).length

      setStats({
        users: dashboardStats.users,
        replicas: dashboardStats.replicas,
        integrations: allIntegrations.length,
        activeIntegrations
      })

      // Generate recent activity from available data
      generateRecentActivity(allIntegrations, dashboardStats)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const generateRecentActivity = (integrations, dashboardStats) => {
    const activities = []

    // Add integration activities
    integrations.forEach(integration => {
      activities.push({
        id: `integration-${integration.id}`,
        type: 'integration',
        message: `Integration "${integration.organizationName}" created`,
        timestamp: new Date(integration.createdAt),
        icon: '🏢'
      })
    })

    // Add sync activities if available
    if (dashboardStats.lastSync) {
      activities.push({
        id: 'last-sync',
        type: 'sync',
        message: 'Last data sync completed',
        timestamp: new Date(dashboardStats.lastSync),
        icon: '🔄'
      })
    }

    // Sort by timestamp and take most recent
    const sortedActivities = activities
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 5)

    setRecentActivity(sortedActivities)
  }

  const formatTimeAgo = (date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now - new Date(date)) / (1000 * 60))

    if (diffInMinutes < 1) return 'Just now'
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return `${Math.floor(diffInMinutes / 1440)}d ago`
  }

  const getStatusColor = (type) => {
    switch (type) {
      case 'integration': return 'bg-blue-100 text-blue-800'
      case 'sync': return 'bg-green-100 text-green-800'
      case 'user': return 'bg-yellow-100 text-yellow-800'
      case 'replica': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="container-admin py-8">
        <Loading message="Loading dashboard..." />
      </div>
    )
  }

  if (error) {
    return (
      <div className="container-admin py-8">
        <Card>
          <div className="text-center py-8">
            <div className="text-red-600 mb-4">⚠️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={loadDashboardData} variant="outline">
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  const cards = [
    {
      title: 'Total Users',
      value: stats.users,
      icon: '👥',
      description: 'Active users in system'
    },
    {
      title: 'AI Replicas',
      value: stats.replicas,
      icon: '🤖',
      description: 'AI agents created'
    },
    {
      title: 'Integrations',
      value: stats.integrations,
      icon: '🔗',
      description: 'Connected services'
    },
    {
      title: 'Active Channels',
      value: stats.activeIntegrations,
      icon: '📱',
      description: 'Telegram/WhatsApp bots'
    }
  ]

  return (
    <div className="container-admin py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Real-time system overview and analytics</p>
        {integrations.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-sm">
            <span className="text-sm font-medium text-blue-700">Current Organization: </span>
            <span className="text-sm text-blue-900">{integrations[0].organizationName}</span>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <Card key={index} className="text-center hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{card.icon}</div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{card.value}</div>
            <div className="text-sm font-medium text-gray-700 mb-1">{card.title}</div>
            <div className="text-xs text-gray-500">{card.description}</div>
          </Card>
        ))}
      </div>

      {/* Integration Status */}
      {integrations.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Organization</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold bg-green-100 text-green-800`}>
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Telegram Bot</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold ${stats.activeIntegrations > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {stats.activeIntegrations > 0 ? 'Connected' : 'Not Connected'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">WhatsApp Bot</span>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold ${stats.activeIntegrations > 1 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                  {stats.activeIntegrations > 1 ? 'Connected' : 'Not Connected'}
                </span>
              </div>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.hash = '#replicas'}
              >
                🤖 Manage AI Replicas
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.hash = '#socials'}
              >
                📱 Setup Social Integrations
              </Button>
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => window.location.hash = '#settings'}
              >
                ⚙️ Configure Settings
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Recent Activity */}
      <Card>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDashboardData}
          >
            🔄 Refresh
          </Button>
        </div>

        {recentActivity.length > 0 ? (
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3 p-4 bg-gray-50 border border-gray-200 rounded-sm">
                <div className="flex-shrink-0 text-lg">{activity.icon}</div>
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{activity.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{formatTimeAgo(activity.timestamp)}</p>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold ${getStatusColor(activity.type)}`}>
                  {activity.type}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 text-4xl mb-4">📊</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activity Yet</h3>
            <p className="text-gray-600">Start by creating your first integration or replica</p>
          </div>
        )}
      </Card>
    </div>
  )
}

export default Dashboard
