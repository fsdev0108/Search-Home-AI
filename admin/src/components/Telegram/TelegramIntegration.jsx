import React, { useState, useEffect } from 'react'
import './TelegramIntegration.css'
import API, { API_CONFIG } from '../../services/api'
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
        return <div className="telegram-loading">Loading Telegram integration...</div>
    }

    // Check if no replicas exist
    if (replicas.length === 0) {
        return <NoReplicas onNavigateToReplicas={() => onTabChange('replicas')} />
    }

    return (
        <div className="telegram-integration">
            <div className="telegram-header">
                <h2>🤖 Telegram Integration</h2>
                <p>Configure your Telegram bot for automated customer service</p>
            </div>

            {error && (
                <div className="telegram-alert telegram-alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="telegram-alert telegram-alert-success">
                    {success}
                </div>
            )}

            {!telegramData ? (
                // Nova integração
                <div className="telegram-setup">
                    <div className="telegram-step">
                        <h3>📋 Step 1: Create your Bot</h3>
                        <ol>
                            <li>Open Telegram and search for <strong>@BotFather</strong></li>
                            <li>Type <code>/newbot</code> and follow the instructions</li>
                            <li>Choose a name and username for your bot</li>
                            <li>Copy the <strong>token</strong> that BotFather sends you</li>
                        </ol>
                    </div>

                    <div className="telegram-step">
                        <h3>🔑 Step 2: Configure the Token</h3>
                        <div className="telegram-form-group">
                            <label>Bot Token:</label>
                            <div className="telegram-token-input">
                                <input
                                    type="text"
                                    placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
                                    value={formData.botToken}
                                    onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                                    className="telegram-input"
                                />
                                <button
                                    onClick={testBotToken}
                                    disabled={testing}
                                    className="telegram-btn telegram-btn-test"
                                >
                                    {testing ? 'Testing...' : 'Test'}
                                </button>
                            </div>
                        </div>

                        {botInfo && (
                            <div className="telegram-bot-info">
                                <h4>✅ Bot Found:</h4>
                                <p><strong>Name:</strong> {botInfo.firstName}</p>
                                <p><strong>Username:</strong> @{botInfo.username}</p>
                                <p><strong>ID:</strong> {botInfo.id}</p>
                            </div>
                        )}
                    </div>

                    <div className="telegram-step">
                        <h3>🤖 Step 3: Select the Replica</h3>
                        <div className="telegram-form-group">
                            <label>Replica that will respond on Telegram:</label>
                            <select
                                value={formData.replicaId}
                                onChange={(e) => setFormData({ ...formData, replicaId: e.target.value })}
                                className="telegram-select"
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

                    <button
                        onClick={saveTelegramIntegration}
                        disabled={saving || !botInfo || !formData.replicaId}
                        className="telegram-btn telegram-btn-primary"
                    >
                        {saving ? 'Saving...' : 'Create Integration'}
                    </button>
                </div>
            ) : showReconfigure ? (
                // Reconfiguração
                <div className="telegram-reconfigure">
                    <div className="telegram-header">
                        <h3>🔧 Reconfigure Telegram Bot</h3>
                        <p>Update your bot token or change the connected replica</p>
                    </div>

                    <div className="telegram-step">
                        <h3>🤖 Step 1: Enter New Bot Token (Optional)</h3>
                        <p>Leave empty to keep the current bot, or enter a new token to change the bot</p>
                        <div className="telegram-form-group">
                            <input
                                type="password"
                                placeholder="Enter new bot token or leave empty..."
                                value={formData.botToken}
                                onChange={(e) => setFormData({ ...formData, botToken: e.target.value })}
                                className="telegram-input"
                            />
                        </div>

                        {formData.botToken && (
                            <div className="telegram-form-group">
                                <button
                                    onClick={testBotToken}
                                    disabled={testing}
                                    className="telegram-btn telegram-btn-secondary"
                                >
                                    {testing ? 'Testing...' : 'Test New Token'}
                                </button>
                            </div>
                        )}

                        {botInfo && (
                            <div className="telegram-bot-info">
                                <h4>✅ New Bot Found:</h4>
                                <p><strong>Name:</strong> {botInfo.firstName}</p>
                                <p><strong>Username:</strong> @{botInfo.username}</p>
                                <p><strong>ID:</strong> {botInfo.id}</p>
                            </div>
                        )}
                    </div>

                    <div className="telegram-step">
                        <h3>🤖 Step 2: Select Replica</h3>
                        <div className="telegram-form-group">
                            <label>Replica that will respond on Telegram:</label>
                            <select
                                value={formData.replicaId}
                                onChange={(e) => setFormData({ ...formData, replicaId: e.target.value })}
                                className="telegram-select"
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

                    <div className="telegram-actions">
                        <button
                            onClick={saveReconfiguration}
                            disabled={saving || !formData.replicaId}
                            className="telegram-btn telegram-btn-primary"
                        >
                            {saving ? 'Updating...' : 'Update Configuration'}
                        </button>

                        <button
                            onClick={cancelReconfigure}
                            disabled={saving}
                            className="telegram-btn telegram-btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                // Integração existente
                <div className="telegram-existing">
                    <div className="telegram-status">
                        <div className="telegram-status-item">
                            <span className="telegram-status-label">Bot:</span>
                            <span className="telegram-status-value">@{telegramData.botUsername}</span>
                        </div>
                        <div className="telegram-status-item">
                            <span className="telegram-status-label">Status:</span>
                            <span className={`telegram-status-badge ${telegramData.isActive ? 'active' : 'inactive'}`}>
                                {telegramData.isActive ? '🟢 Active' : '🔴 Inactive'}
                            </span>
                        </div>
                        <div className="telegram-status-item">
                            <span className="telegram-status-label">Created on:</span>
                            <span className="telegram-status-value">
                                {new Date(telegramData.createdAt).toLocaleDateString('en-US')}
                            </span>
                        </div>
                    </div>

                    <div className="telegram-config">
                        <h3>⚙️ Configuration</h3>
                        <div className="telegram-status-item">
                            <span className="telegram-status-label">Connected Replica:</span>
                            <span className="telegram-status-value">
                                {replicas.find(r => r.id === telegramData.replicaId)?.name || 'Unknown'}
                            </span>
                        </div>

                        <div className="telegram-actions">
                            {!telegramData.isActive && (
                                <button
                                    onClick={activateBot}
                                    disabled={activating}
                                    className="telegram-btn telegram-btn-primary"
                                >
                                    {activating ? 'Activating...' : 'Activate Bot'}
                                </button>
                            )}

                            <button
                                onClick={startReconfigure}
                                disabled={activating || deleting}
                                className="telegram-btn telegram-btn-secondary"
                            >
                                🔧 Reconfigure
                            </button>

                            <button
                                onClick={deleteIntegration}
                                disabled={activating || deleting}
                                className="telegram-btn telegram-btn-danger"
                            >
                                {deleting ? 'Deleting...' : '🗑️ Delete'}
                            </button>
                        </div>
                    </div>

                    {telegramData.isActive && (
                        <div className="telegram-instructions">
                            <h3>📱 How to use:</h3>
                            <ol>
                                <li>Your customers can find your bot at: <strong>@{telegramData.botUsername}</strong></li>
                                <li>They start a conversation and ask questions about properties</li>
                                <li>Your bot responds automatically using the replica's knowledge base</li>
                                <li>All conversations are saved in Sensay for analysis</li>
                            </ol>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default TelegramIntegration
