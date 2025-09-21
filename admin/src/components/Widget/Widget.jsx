import { useState, useEffect } from 'react'
import { replicasAPI, integrationsAPI } from '../../services/api'
import { Button, Card, Select, Loading } from '../UI'
import NoReplicas from '../NoReplicas/NoReplicas'

const Widget = ({ onTabChange }) => {
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
            console.error('Error loading widget data:', error)
            setError('Failed to load widget data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleConfigChange = (key, value) => {
        setWidgetConfig(prev => ({
            ...prev,
            [key]: value
        }))
    }

    const generateWidgetCode = () => {
        if (!selectedReplica || !currentIntegration) {
            setError('Please select a replica and ensure integration is available')
            return
        }

        const widgetCode = `<!-- Sensay AI Chat Widget -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://sensay.ai/widget/chat-widget.min.js';
    script.async = true;
    script.onload = function() {
      SensayWidget.init({
        replicaId: '${selectedReplica.uuid}',
        integrationId: '${currentIntegration.id}',
        position: '${widgetConfig.position}',
        theme: '${widgetConfig.theme}',
        primaryColor: '${widgetConfig.primaryColor}',
        apiKey: '${currentIntegration.apiKey || 'YOUR_API_KEY'}'
      });
    };
    document.head.appendChild(script);
  })();
</script>`

        setGeneratedCode(widgetCode)
    }

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generatedCode)
            alert('Widget code copied to clipboard!')
        } catch (error) {
            console.error('Failed to copy to clipboard:', error)
            alert('Failed to copy to clipboard. Please copy manually.')
        }
    }

    if (loading) {
        return (
            <div className="container-admin py-8">
                <Loading message="Loading widget generator..." />
            </div>
        )
    }

    // Check if no replicas exist
    if (replicas.length === 0) {
        return <NoReplicas onNavigateToReplicas={() => onTabChange('replicas')} />
    }

    return (
        <div className="container-admin py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Widget Generator</h1>
                <p className="text-gray-600">Generate embed code for your AI chat widget</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {currentIntegration && (
                <div className="mb-6">
                    <p className="text-sm text-gray-600">
                        Integration: {currentIntegration.organizationName}
                    </p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card>
                    <h2 className="text-lg font-semibold text-gray-900 mb-6">Widget Configuration</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Replica Selection</h3>
                            <Select
                                label="Select Replica *"
                                value={selectedReplica?.uuid || ''}
                                onChange={(e) => {
                                    const replica = replicas.find(r => r.uuid === e.target.value)
                                    setSelectedReplica(replica)
                                }}
                                options={replicas.map(replica => ({
                                    value: replica.uuid,
                                    label: `${replica.name} (${replica.uuid})`
                                }))}
                                placeholder="Choose a replica..."
                            />
                            <p className="text-xs text-gray-500 mt-1">Select the replica that will handle the chat conversations</p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">Widget Appearance</h3>

                            <div className="space-y-4">
                                <Select
                                    label="Position"
                                    value={widgetConfig.position}
                                    onChange={(e) => handleConfigChange('position', e.target.value)}
                                    options={[
                                        { value: 'bottom-right', label: 'Bottom Right' },
                                        { value: 'bottom-left', label: 'Bottom Left' },
                                        { value: 'top-right', label: 'Top Right' },
                                        { value: 'top-left', label: 'Top Left' }
                                    ]}
                                />

                                <Select
                                    label="Theme"
                                    value={widgetConfig.theme}
                                    onChange={(e) => handleConfigChange('theme', e.target.value)}
                                    options={[
                                        { value: 'auto', label: 'Auto (System)' },
                                        { value: 'light', label: 'Light' },
                                        { value: 'dark', label: 'Dark' }
                                    ]}
                                />

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Primary Color
                                    </label>
                                    <input
                                        type="color"
                                        className="w-full h-10 border border-gray-300 rounded-sm"
                                        value={widgetConfig.primaryColor}
                                        onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-900 mb-3">User Information</h3>
                            <div className="space-y-2 text-sm">
                                <p><span className="font-medium">User ID:</span> {currentUser.id || currentUser.sensayUserId || 'Not found'}</p>
                                <p><span className="font-medium">Role:</span> {currentUser.role || 'user'}</p>
                                <p><span className="font-medium">API Key:</span> Configured on server side</p>
                            </div>
                        </div>

                        <Button
                            onClick={generateWidgetCode}
                            disabled={!selectedReplica}
                            className="w-full"
                        >
                            Generate Widget Code
                        </Button>
                    </div>
                </Card>

                {generatedCode && (
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">Generated Widget Code</h2>
                            <Button
                                variant="outline"
                                onClick={copyToClipboard}
                            >
                                Copy to Clipboard
                            </Button>
                        </div>

                        <div className="bg-gray-900 text-gray-100 p-4 rounded-sm overflow-x-auto">
                            <pre className="text-sm">
                                <code>{generatedCode}</code>
                            </pre>
                        </div>
                    </Card>
                )}
            </div>
        </div>
    )
}

export default Widget