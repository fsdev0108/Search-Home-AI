import React, { useState, useEffect } from 'react'
import API, { API_CONFIG } from '../../services/api'
import { Button, Card, Input, Select, Loading } from '../UI'
import NoReplicas from '../NoReplicas/NoReplicas'

const TelegramIntegration = ({ onTabChange }) => {
    const [telegramData, setTelegramData] = useState(null)
    const [currentIntegration, setCurrentIntegration] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [activating, setActivating] = useState(false)
    const [formData, setFormData] = useState({
        botToken: '',
        replicaId: ''
    })
    const [replicas, setReplicas] = useState([])
    const [botInfo, setBotInfo] = useState(null)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [deleting, setDeleting] = useState(false)
    const [showReconfigure, setShowReconfigure] = useState(false)

    useEffect(() => {
        loadIntegrationAndData()
    }, [])

    const loadIntegrationAndData = async () => {
        try {
            setLoading(true)
            setError('')

            // Get integration
            const integrationsResponse = await API.integrations.getAll()

            if (!integrationsResponse || !integrationsResponse.data || integrationsResponse.data.length === 0) {
                setError('No integration found. Please create an integration in Settings first.')
                return
            }

            const integration = integrationsResponse.data[0]
            setCurrentIntegration(integration)

            // Load Telegram integration data
            await loadTelegramIntegration(integration.id)
            // Load replicas
            await loadReplicas(integration.id)

        } catch (error) {
            console.error('Error loading integration and data:', error)
            setError('Failed to load data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const loadTelegramIntegration = async (integrationId) => {
        try {
            const response = await API.telegram.getIntegration(integrationId)
            if (response.success) {
                const telegramData = response.data.data || response.data
                setTelegramData(telegramData)
                setFormData({
                    botToken: '••••••••••',
                    replicaId: telegramData.replicaId || ''
                })
            }
        } catch (error) {
            console.error('Error loading Telegram integration:', error)
        }
    }

    const loadReplicas = async (integrationId) => {
        try {
            const response = await API.replicas.getAll(integrationId)
            if (response.success) {
                setReplicas(response.data || [])
            }
        } catch (error) {
            console.error('Error loading replicas:', error)
        }
    }

    const testBotToken = async () => {
        if (!formData.botToken || formData.botToken === '••••••••••') {
            setError('Please enter a valid bot token')
            return
        }

        setTesting(true)
        setError('')
        setBotInfo(null)

        try {
            const response = await API.telegram.testBot(formData.botToken)

            if (response.success) {
                const botData = response.data.data || response.data
                setBotInfo(botData)
                setSuccess('Valid token! Bot found: @' + botData.username)
            } else {
                setError(response.error || 'Invalid token')
            }
        } catch (error) {
            setError('Error testing token: ' + error.message)
        } finally {
            setTesting(false)
        }
    }

    const saveTelegramIntegration = async () => {
        if (!formData.botToken || !formData.replicaId) {
            setError('Please fill in all required fields')
            return
        }

        if (!botInfo) {
            setError('Please test the bot token first')
            return
        }

        setSaving(true)
        setError('')

        try {
            const response = await API.telegram.createIntegration(
                currentIntegration.id,
                formData.botToken,
                formData.replicaId
            )

            if (response.success) {
                setSuccess('Telegram integration created successfully!')
                await loadTelegramIntegration(currentIntegration.id)

                // Automatically activate the bot after creation
                try {
                    const webhookUrl = `${API_CONFIG.BASE_URL}/v1/telegram/webhook/${formData.botToken}`
                    const activateResponse = await API.telegram.activateBot(currentIntegration.id, webhookUrl)

                    if (activateResponse.success) {
                        setSuccess('Telegram integration created and activated successfully!')
                        await loadTelegramIntegration(currentIntegration.id)
                    }
                } catch (activateError) {
                    console.error('Error auto-activating bot:', activateError)
                    // Don't show error, integration was created successfully
                }
            } else {
                setError(response.error || 'Error creating integration')
            }
        } catch (error) {
            setError('Error saving: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const activateBot = async () => {
        if (!telegramData) return

        setActivating(true)
        setError('')

        const webhookUrl = `${API_CONFIG.BASE_URL}/v1/telegram/webhook/${telegramData.botToken || formData.botToken}`

        try {
            const response = await API.telegram.activateBot(currentIntegration.id, webhookUrl)

            if (response.success) {
                setSuccess('Bot activated successfully! Your bot is now receiving messages.')
                await loadTelegramIntegration(currentIntegration.id)
            } else {
                setError(response.error || 'Error activating bot')
            }
        } catch (error) {
            setError('Error activating bot: ' + error.message)
        } finally {
            setActivating(false)
        }
    }

    const deleteIntegration = async () => {
        if (!window.confirm('Are you sure you want to delete this Telegram integration? This action cannot be undone.')) {
            return
        }

        try {
            setDeleting(true)
            setError('')
            setSuccess('')

            const response = await API.telegram.deleteIntegration(currentIntegration.id)

            if (response.success) {
                setSuccess('Telegram integration deleted successfully!')
                setTelegramData(null)
                setBotInfo(null)
                setFormData({ botToken: '', replicaId: '' })
            } else {
                setError(response.error || 'Failed to delete integration')
            }
        } catch (error) {
            console.error('Error deleting integration:', error)
            setError('Failed to delete integration')
        } finally {
            setDeleting(false)
        }
    }

    const startReconfigure = () => {
        setShowReconfigure(true)
        setFormData({
            botToken: '',
            replicaId: telegramData.replicaId || ''
        })
        setBotInfo(null)
        setError('')
        setSuccess('')
    }

    const cancelReconfigure = () => {
        setShowReconfigure(false)
        setFormData({ botToken: '', replicaId: '' })
        setBotInfo(null)
        setError('')
        setSuccess('')
    }

    const saveReconfiguration = async () => {
        try {
            setSaving(true)
            setError('')
            setSuccess('')

            if (!formData.replicaId) {
                setError('Please select a replica')
                return
            }

            // Prepare update data - only include botToken if provided
            const updateData = { replicaId: formData.replicaId }
            if (formData.botToken.trim()) {
                updateData.botToken = formData.botToken
            }

            // Update the integration
            const response = await API.telegram.updateIntegration(currentIntegration.id, updateData)

            if (response.success) {
                setSuccess('Telegram integration updated successfully!')
                await loadTelegramIntegration(currentIntegration.id)
                setShowReconfigure(false)

                // Automatically activate the bot after reconfiguration (if bot token was updated)
                if (formData.botToken.trim()) {
                    try {
                        const webhookUrl = `${API_CONFIG.BASE_URL}/v1/telegram/webhook/${formData.botToken}`
                        const activateResponse = await API.telegram.activateBot(currentIntegration.id, webhookUrl)

                        if (activateResponse.success) {
                            setSuccess('Telegram integration updated and activated successfully!')
                            await loadTelegramIntegration(currentIntegration.id)
                        }
                    } catch (activateError) {
                        console.error('Error auto-activating bot:', activateError)
                        setSuccess('Telegram integration updated! Please activate manually if needed.')
                    }
                }
            } else {
                setError(response.error || 'Failed to update integration')
            }
        } catch (error) {
            console.error('Error updating integration:', error)
            setError('Failed to update integration')
        } finally {
            setSaving(false)
        }
    }


    if (loading) {
        return (
            <div className="container-admin py-8">
                <Loading message="Loading Telegram integration..." />
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
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Telegram Integration</h1>
                <p className="text-gray-600">Configure your Telegram bot for automated customer service</p>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 mb-6">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 mb-6">
                    {success}
                </div>
            )}

            {!telegramData ? (
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Create your Bot</h3>
                        <ol className="space-y-2 text-gray-700">
                            <li>1. Open Telegram and search for <strong>@BotFather</strong></li>
                            <li>2. Type <code className="bg-gray-100 px-2 py-1 rounded text-sm">/newbot</code> and follow the instructions</li>
                            <li>3. Choose a name and username for your bot</li>
                            <li>4. Copy the <strong>token</strong> that BotFather sends you</li>
                        </ol>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Configure the Token</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Bot Token:</label>
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                                        value={formData.botToken}
                                        onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                    />
                                    <Button
                                        onClick={testBotToken}
                                        disabled={testing}
                                        variant="outline"
                                    >
                                        {testing ? 'Testing...' : 'Test'}
                                    </Button>
                                </div>
                            </div>

                            {botInfo && (
                                <div className="bg-green-50 border border-green-200 p-4 rounded-sm">
                                    <h4 className="text-sm font-semibold text-green-800 mb-2">✅ Bot Found:</h4>
                                    <div className="space-y-1 text-sm text-green-700">
                                        <p><strong>Name:</strong> {botInfo.firstName}</p>
                                        <p><strong>Username:</strong> @{botInfo.username}</p>
                                        <p><strong>ID:</strong> {botInfo.id}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 3: Select the Replica</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Replica that will respond on Telegram:</label>
                                <select
                                    value={formData.replicaId}
                                    onChange={(e) => setFormData({ ...formData, replicaId: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                >
                                    <option value="">Select a replica...</option>
                                    {replicas.map(replica => (
                                        <option key={replica.id} value={replica.id}>
                                            {replica.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </Card>

                    <Button
                        onClick={saveTelegramIntegration}
                        disabled={saving || !botInfo || !formData.replicaId}
                        className="w-full"
                    >
                        {saving ? 'Saving...' : 'Create Integration'}
                    </Button>
                </div>
            ) : showReconfigure ? (
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Reconfigure Telegram Bot</h3>
                        <p className="text-gray-600">Update your bot token or change the connected replica</p>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 1: Enter New Bot Token (Optional)</h3>
                        <p className="text-gray-600 mb-4">Leave empty to keep the current bot, or enter a new token to change the bot</p>
                        <div>
                            <input
                                type="password"
                                placeholder="Enter new bot token or leave empty..."
                                value={formData.botToken}
                                onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            />
                        </div>

                        {formData.botToken && (
                            <div className="mt-4">
                                <Button
                                    onClick={testBotToken}
                                    disabled={testing}
                                    variant="outline"
                                >
                                    {testing ? 'Testing...' : 'Test New Token'}
                                </Button>
                            </div>
                        )}

                        {botInfo && (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-sm mt-4">
                                <h4 className="text-sm font-semibold text-green-800 mb-2">✅ New Bot Found:</h4>
                                <div className="space-y-1 text-sm text-green-700">
                                    <p><strong>Name:</strong> {botInfo.firstName}</p>
                                    <p><strong>Username:</strong> @{botInfo.username}</p>
                                    <p><strong>ID:</strong> {botInfo.id}</p>
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Step 2: Select Replica</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Replica that will respond on Telegram:</label>
                            <select
                                value={formData.replicaId}
                                onChange={(e) => setFormData({ ...formData, replicaId: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                            >
                                <option value="">Select a replica...</option>
                                {replicas.map(replica => (
                                    <option key={replica.id} value={replica.id}>
                                        {replica.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </Card>

                    <div className="flex space-x-3">
                        <Button
                            onClick={saveReconfiguration}
                            disabled={saving || !formData.replicaId}
                            className="flex-1"
                        >
                            {saving ? 'Updating...' : 'Update Configuration'}
                        </Button>

                        <Button
                            onClick={cancelReconfigure}
                            disabled={saving}
                            variant="outline"
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integration Status</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Bot:</span>
                                <span className="text-sm text-gray-900">@{telegramData.botUsername}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Status:</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold ${telegramData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {telegramData.isActive ? '🟢 Active' : '🔴 Inactive'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Created on:</span>
                                <span className="text-sm text-gray-900">
                                    {new Date(telegramData.createdAt).toLocaleDateString('en-US')}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuration</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Connected Replica:</span>
                                <span className="text-sm text-gray-900">
                                    {replicas.find(r => r.id === telegramData.replicaId)?.name || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <div className="flex space-x-3">
                        {!telegramData.isActive && (
                            <Button
                                onClick={activateBot}
                                disabled={activating}
                                className="flex-1"
                            >
                                {activating ? 'Activating...' : 'Activate Bot'}
                            </Button>
                        )}

                        <Button
                            onClick={startReconfigure}
                            disabled={activating || deleting}
                            variant="outline"
                            className="flex-1"
                        >
                            🔧 Reconfigure
                        </Button>

                        <Button
                            onClick={deleteIntegration}
                            disabled={activating || deleting}
                            variant="danger"
                            className="flex-1"
                        >
                            {deleting ? 'Deleting...' : '🗑️ Delete'}
                        </Button>
                    </div>

                    {telegramData.isActive && (
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 How to use:</h3>
                            <ol className="space-y-2 text-gray-700">
                                <li>1. Your customers can find your bot at: <strong>@{telegramData.botUsername}</strong></li>
                                <li>2. They start a conversation and ask questions about properties</li>
                                <li>3. Your bot responds automatically using the replica's knowledge base</li>
                                <li>4. All conversations are saved in Sensay for analysis</li>
                            </ol>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}

export default TelegramIntegration
