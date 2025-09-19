import React, { useState, useEffect } from 'react'
import './TelegramIntegration.css'
import API from '../../services/api'

const TelegramIntegration = ({ integrationId }) => {
    const [telegramData, setTelegramData] = useState(null)
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

    useEffect(() => {
        loadTelegramIntegration()
        loadReplicas()
    }, [integrationId])

    const loadTelegramIntegration = async () => {
        try {
            const response = await API.telegram.getIntegration(integrationId)
            if (response.success) {
                setTelegramData(response.data)
                setFormData({
                    botToken: '••••••••••', // Hide token for security
                    replicaId: response.data.replicaId || ''
                })
            }
        } catch (error) {
            console.error('Error loading Telegram integration:', error)
        } finally {
            setLoading(false)
        }
    }

    const loadReplicas = async () => {
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
                setBotInfo(response.data)
                setSuccess('Valid token! Bot found: @' + response.data.username)
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
                integrationId,
                formData.botToken,
                formData.replicaId
            )

            if (response.success) {
                setSuccess('Telegram integration created successfully!')
                await loadTelegramIntegration()
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

        const webhookUrl = `${window.location.origin.replace(':5173', ':3000')}/api/v1/telegram/webhook/${telegramData.botToken || formData.botToken}`

        try {
            const response = await API.telegram.activateBot(integrationId, webhookUrl)

            if (response.success) {
                setSuccess('Bot activated successfully! Your bot is now receiving messages.')
                await loadTelegramIntegration()
            } else {
                setError(response.error || 'Error activating bot')
            }
        } catch (error) {
            setError('Error activating bot: ' + error.message)
        } finally {
            setActivating(false)
        }
    }

    const updateIntegration = async () => {
        if (!formData.replicaId) {
            setError('Please select a replica')
            return
        }

        setSaving(true)
        setError('')

        try {
            const response = await API.telegram.updateIntegration(integrationId, {
                replicaId: formData.replicaId
            })

            if (response.success) {
                setSuccess('Integration updated successfully!')
                await loadTelegramIntegration()
            } else {
                setError(response.error || 'Error updating integration')
            }
        } catch (error) {
            setError('Error updating: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) {
        return <div className="telegram-loading">Loading Telegram integration...</div>
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
                        <h3>⚙️ Settings</h3>
                        <div className="telegram-form-group">
                            <label>Connected replica:</label>
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

                        <div className="telegram-actions">
                            <button
                                onClick={updateIntegration}
                                disabled={saving}
                                className="telegram-btn telegram-btn-secondary"
                            >
                                {saving ? 'Saving...' : 'Update'}
                            </button>

                            {!telegramData.isActive && (
                                <button
                                    onClick={activateBot}
                                    disabled={activating}
                                    className="telegram-btn telegram-btn-primary"
                                >
                                    {activating ? 'Activating...' : 'Activate Bot'}
                                </button>
                            )}
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
