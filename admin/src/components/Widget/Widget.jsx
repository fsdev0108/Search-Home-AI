import { useState, useEffect } from 'react'
import { replicasAPI, integrationsAPI } from '../../services/api'
import './Widget.css'

const Widget = () => {
    const [replicas, setReplicas] = useState([])
    const [currentIntegration, setCurrentIntegration] = useState(null)
    const [selectedReplica, setSelectedReplica] = useState(null)
    const [widgetConfig, setWidgetConfig] = useState({
        position: 'bottom-right',
        theme: 'auto',
        primaryColor: '#3cacae'
    })
    const [generatedCode, setGeneratedCode] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const isAdmin = currentUser.role === 'admin'

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
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

    const generateWidgetCode = () => {
        if (!selectedReplica) {
            alert('Please select a replica first')
            return
        }

        const userId = currentUser.id || currentUser.sensayUserId || 'user-not-found'

        const code = `<!-- Real Estate AI Chat Widget -->
<script src="https://yourdomain.com/chat-widget.js"></script>
<script>
  RealEstateChat.init({
    userId: '${userId}',
    replicaUuid: '${selectedReplica.uuid}',
    position: '${widgetConfig.position}',
    theme: '${widgetConfig.theme}',
    primaryColor: '${widgetConfig.primaryColor}'
  });
</script>`

        setGeneratedCode(code)
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedCode)
            alert('Code copied to clipboard!')
        } catch (error) {
            console.error('Failed to copy:', error)
            alert('Failed to copy code. Please copy manually.')
        }
    }

    const handleConfigChange = (key, value) => {
        setWidgetConfig(prev => ({
            ...prev,
            [key]: value
        }))
    }

    if (loading) {
        return (
            <div className="widget-loading">
                <div className="spinner"></div>
                <p>Loading widget generator...</p>
            </div>
        )
    }

    return (
        <div className="widget">
            <div className="widget-header">
                <h1>Widget Generator</h1>
                <p>Generate embed code for your AI chat widget</p>
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

            <div className="widget-content">
                <div className="widget-config">
                    <h2>Widget Configuration</h2>

                    <div className="config-section">
                        <h3>Replica Selection</h3>
                        <div className="form-group">
                            <label htmlFor="replica">Select Replica *</label>
                            <select
                                id="replica"
                                value={selectedReplica?.uuid || ''}
                                onChange={(e) => {
                                    const replica = replicas.find(r => r.uuid === e.target.value)
                                    setSelectedReplica(replica)
                                }}
                                required
                            >
                                <option value="">Choose a replica...</option>
                                {replicas.map(replica => (
                                    <option key={replica.uuid} value={replica.uuid}>
                                        {replica.name} ({replica.uuid})
                                    </option>
                                ))}
                            </select>
                            <small>Select the replica that will handle the chat conversations</small>
                        </div>
                    </div>

                    <div className="config-section">
                        <h3>Widget Appearance</h3>

                        <div className="form-group">
                            <label htmlFor="position">Position</label>
                            <select
                                id="position"
                                value={widgetConfig.position}
                                onChange={(e) => handleConfigChange('position', e.target.value)}
                            >
                                <option value="bottom-right">Bottom Right</option>
                                <option value="bottom-left">Bottom Left</option>
                                <option value="top-right">Top Right</option>
                                <option value="top-left">Top Left</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="theme">Theme</label>
                            <select
                                id="theme"
                                value={widgetConfig.theme}
                                onChange={(e) => handleConfigChange('theme', e.target.value)}
                            >
                                <option value="auto">Auto (System)</option>
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="primaryColor">Primary Color</label>
                            <input
                                type="color"
                                id="primaryColor"
                                value={widgetConfig.primaryColor}
                                onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                            />
                            <small>Choose the primary color for the widget</small>
                        </div>
                    </div>

                    <div className="config-section">
                        <h3>User Information</h3>
                        <div className="user-info">
                            <p><strong>User ID:</strong> {currentUser.id || currentUser.sensayUserId || 'Not found'}</p>
                            <p><strong>Role:</strong> {currentUser.role || 'user'}</p>
                            <p><strong>API Key:</strong> Configured on server side</p>
                        </div>
                    </div>

                    <button
                        className="btn btn-primary"
                        onClick={generateWidgetCode}
                        disabled={!selectedReplica}
                    >
                        Generate Widget Code
                    </button>
                </div>

                {generatedCode && (
                    <div className="generated-code">
                        <div className="code-header">
                            <h2>Generated Widget Code</h2>
                            <button
                                className="btn btn-secondary"
                                onClick={copyToClipboard}
                            >
                                Copy to Clipboard
                            </button>
                        </div>

                        <div className="code-preview">
                            <pre><code>{generatedCode}</code></pre>
                        </div>

                        <div className="code-instructions">
                            <h3>How to use:</h3>
                            <ol>
                                <li>Copy the code above</li>
                                <li>Paste it into your website's HTML, preferably before the closing <code>&lt;/body&gt;</code> tag</li>
                                <li>Make sure the widget script is accessible at the URL specified in the script src</li>
                                <li>The widget will automatically initialize when the page loads</li>
                                <li><strong>Note:</strong> The API Key is automatically configured on our server</li>
                            </ol>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Widget
