import React, { useState, useEffect } from 'react'
import './WhatsAppIntegration.css'
import API from '../../services/api'
import NoReplicas from '../NoReplicas/NoReplicas'

const WhatsAppIntegration = ({ onTabChange }) => {
    const [whatsappData, setWhatsappData] = useState(null)
    const [currentIntegration, setCurrentIntegration] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [testing, setTesting] = useState(false)
    const [activating, setActivating] = useState(false)
    const [formData, setFormData] = useState({
        replicaId: ''
    })
    const [replicas, setReplicas] = useState([])
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

            const integrationsResponse = await API.integrations.getAll()

            if (!integrationsResponse || !integrationsResponse.data || integrationsResponse.data.length === 0) {
                setError('No integration found. Please create an integration in Settings first.')
                return
            }

            const integration = integrationsResponse.data[0]
            setCurrentIntegration(integration)

            await loadWhatsAppIntegration(integration.id)
            await loadReplicas(integration.id)

        } catch (error) {
            console.error('Error loading integration and data:', error)
            setError('Failed to load data. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const loadWhatsAppIntegration = async (integrationId) => {
        try {
            const response = await API.twilio.getIntegration(integrationId)
            if (response.success) {
                const whatsappData = response.data.data || response.data
                setWhatsappData(whatsappData)
                setFormData({
                    replicaId: whatsappData.replicaId || ''
                })
            }
        } catch (error) {
            console.error('Error loading WhatsApp integration:', error)
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

    const testServerCredentials = async () => {
        setTesting(true)
        setError('')

        try {
            const response = await API.twilio.testServerCredentials()

            if (response.success) {
                setSuccess('Server credentials are valid! WhatsApp integration ready.')
            } else {
                setError(response.error || 'Server credentials not configured')
            }
        } catch (error) {
            setError('Error testing server credentials: ' + error.message)
        } finally {
            setTesting(false)
        }
    }

    const saveWhatsAppIntegration = async () => {
        if (!formData.replicaId) {
            setError('Please select a replica')
            return
        }

        setSaving(true)
        setError('')

        try {
            const response = await API.twilio.createIntegration(
                currentIntegration.id,
                formData.replicaId
            )

            if (response.success) {
                setSuccess('WhatsApp integration created successfully!')
                await loadWhatsAppIntegration(currentIntegration.id)
            } else {
                setError(response.error || 'Error creating integration')
            }
        } catch (error) {
            setError('Error saving: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const activateIntegration = async () => {
        if (!whatsappData) return

        setActivating(true)
        setError('')

        try {
            const response = await API.twilio.activateIntegration(currentIntegration.id)

            if (response.success) {
                setSuccess('WhatsApp integration activated successfully!')
                await loadWhatsAppIntegration(currentIntegration.id)
            } else {
                setError(response.error || 'Error activating integration')
            }
        } catch (error) {
            setError('Error activating integration: ' + error.message)
        } finally {
            setActivating(false)
        }
    }

    const deleteIntegration = async () => {
        if (!window.confirm('Are you sure you want to delete this WhatsApp integration? This action cannot be undone.')) {
            return
        }

        try {
            setDeleting(true)
            setError('')
            setSuccess('')

            const response = await API.twilio.deleteIntegration(currentIntegration.id)

            if (response.success) {
                setSuccess('WhatsApp integration deleted successfully!')
                setWhatsappData(null)
                setFormData({ accountSid: '', authToken: '', phoneNumber: '+14155238886', replicaId: '' })
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
            replicaId: whatsappData.replicaId || ''
        })
        setError('')
        setSuccess('')
    }

    const cancelReconfigure = () => {
        setShowReconfigure(false)
        setFormData({ replicaId: '' })
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

            const updateData = { replicaId: formData.replicaId }
            if (formData.accountSid.trim()) updateData.accountSid = formData.accountSid
            if (formData.authToken.trim()) updateData.authToken = formData.authToken
            if (formData.phoneNumber.trim()) updateData.phoneNumber = formData.phoneNumber

            const response = await API.twilio.updateIntegration(currentIntegration.id, updateData)

            if (response.success) {
                setSuccess('WhatsApp integration updated successfully!')
                await loadWhatsAppIntegration(currentIntegration.id)
                setShowReconfigure(false)
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
        return <div className="whatsapp-loading">Loading WhatsApp integration...</div>
    }

    if (replicas.length === 0) {
        return <NoReplicas onNavigateToReplicas={() => onTabChange('replicas')} />
    }

    return (
        <div className="whatsapp-integration">
            <div className="whatsapp-header">
                <h2>💬 WhatsApp Integration</h2>
                <p>Configure your WhatsApp Business number for automated customer service</p>
            </div>

            {error && (
                <div className="whatsapp-alert whatsapp-alert-error">
                    {error}
                </div>
            )}

            {success && (
                <div className="whatsapp-alert whatsapp-alert-success">
                    {success}
                </div>
            )}

            {!whatsappData ? (
                <div className="whatsapp-setup">
                    <div className="whatsapp-step">
                        <h3>📋 MVP Setup - Server Credentials</h3>
                        <div className="whatsapp-info-box">
                            <p><strong>✅ Server Configuration:</strong> Twilio credentials are already configured on the server</p>
                            <p><strong>📱 WhatsApp Number:</strong> +1 415 523 8886 (Sandbox)</p>
                            <p><strong>🔗 Webhook:</strong> Automatically configured</p>
                        </div>

                        <button
                            onClick={testServerCredentials}
                            disabled={testing}
                            className="whatsapp-btn whatsapp-btn-test"
                        >
                            {testing ? 'Testing...' : 'Test Server Connection'}
                        </button>
                    </div>

                    <div className="whatsapp-step">
                        <h3>🤖 Select the Replica</h3>
                        <p>Choose which replica will respond to WhatsApp messages:</p>
                        <div className="whatsapp-form-group">
                            <label>Replica that will respond on WhatsApp:</label>
                            <select
                                value={formData.replicaId}
                                onChange={(e) => setFormData({ ...formData, replicaId: e.target.value })}
                                className="whatsapp-select"
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
                        onClick={saveWhatsAppIntegration}
                        disabled={saving || !formData.replicaId}
                        className="whatsapp-btn whatsapp-btn-primary"
                    >
                        {saving ? 'Creating...' : 'Create WhatsApp Integration'}
                    </button>
                </div>
            ) : showReconfigure ? (
                <div className="whatsapp-reconfigure">
                    <div className="whatsapp-header">
                        <h3>🔧 Reconfigure WhatsApp Integration</h3>
                        <p>Update your Twilio credentials or change the connected replica</p>
                    </div>

                    <div className="whatsapp-step">
                        <h3>🔑 Update Credentials (Optional)</h3>
                        <div className="whatsapp-form-group">
                            <label>Account SID:</label>
                            <input
                                type="text"
                                placeholder="Leave empty to keep current..."
                                value={formData.accountSid}
                                onChange={(e) => setFormData({ ...formData, accountSid: e.target.value })}
                                className="whatsapp-input"
                            />
                        </div>

                        <div className="whatsapp-form-group">
                            <label>Auth Token:</label>
                            <input
                                type="password"
                                placeholder="Leave empty to keep current..."
                                value={formData.authToken}
                                onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                                className="whatsapp-input"
                            />
                        </div>

                        <div className="whatsapp-form-group">
                            <label>WhatsApp Number (MVP - Sandbox):</label>
                            <input
                                type="text"
                                value="+14155238886"
                                disabled
                                className="whatsapp-input whatsapp-input-disabled"
                            />
                            <small className="whatsapp-help-text">Using Twilio Sandbox for MVP testing</small>
                        </div>
                    </div>

                    <div className="whatsapp-step">
                        <h3>🤖 Select Replica</h3>
                        <div className="whatsapp-form-group">
                            <label>Replica that will respond on WhatsApp:</label>
                            <select
                                value={formData.replicaId}
                                onChange={(e) => setFormData({ ...formData, replicaId: e.target.value })}
                                className="whatsapp-select"
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

                    <div className="whatsapp-actions">
                        <button
                            onClick={saveReconfiguration}
                            disabled={saving || !formData.replicaId}
                            className="whatsapp-btn whatsapp-btn-primary"
                        >
                            {saving ? 'Updating...' : 'Update Configuration'}
                        </button>

                        <button
                            onClick={cancelReconfigure}
                            disabled={saving}
                            className="whatsapp-btn whatsapp-btn-secondary"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="whatsapp-existing">
                    <div className="whatsapp-status">
                        <div className="whatsapp-status-item">
                            <span className="whatsapp-status-label">Phone Number:</span>
                            <span className="whatsapp-status-value">{whatsappData.phoneNumber}</span>
                        </div>
                        <div className="whatsapp-status-item">
                            <span className="whatsapp-status-label">Status:</span>
                            <span className={`whatsapp-status-badge ${whatsappData.isActive ? 'active' : 'inactive'}`}>
                                {whatsappData.isActive ? '🟢 Active' : '🔴 Inactive'}
                            </span>
                        </div>
                        <div className="whatsapp-status-item">
                            <span className="whatsapp-status-label">Created on:</span>
                            <span className="whatsapp-status-value">
                                {new Date(whatsappData.createdAt).toLocaleDateString('en-US')}
                            </span>
                        </div>
                    </div>

                    <div className="whatsapp-config">
                        <h3>⚙️ Configuration</h3>
                        <div className="whatsapp-status-item">
                            <span className="whatsapp-status-label">Connected Replica:</span>
                            <span className="whatsapp-status-value">
                                {replicas.find(r => r.id === whatsappData.replicaId)?.name || 'Unknown'}
                            </span>
                        </div>

                        <div className="whatsapp-actions">
                            {!whatsappData.isActive && (
                                <button
                                    onClick={activateIntegration}
                                    disabled={activating}
                                    className="whatsapp-btn whatsapp-btn-primary"
                                >
                                    {activating ? 'Activating...' : 'Activate Integration'}
                                </button>
                            )}

                            <button
                                onClick={startReconfigure}
                                disabled={activating || deleting}
                                className="whatsapp-btn whatsapp-btn-secondary"
                            >
                                🔧 Reconfigure
                            </button>

                            <button
                                onClick={deleteIntegration}
                                disabled={activating || deleting}
                                className="whatsapp-btn whatsapp-btn-danger"
                            >
                                {deleting ? 'Deleting...' : '🗑️ Delete'}
                            </button>
                        </div>
                    </div>

                    {whatsappData.isActive && (
                        <div className="whatsapp-instructions">
                            <h3>📱 How to use (MVP):</h3>
                            <ol>
                                <li><strong>Configure webhook in Twilio Console:</strong> <code>https://sensay-search-home-ai-production.up.railway.app/api/v1/twilio/webhook/{currentIntegration.id}</code></li>
                                <li><strong>For sandbox testing:</strong> Send "join &lt;keyword&gt;" to +1 415 523 8886</li>
                                <li><strong>Then send any message</strong> to test the integration</li>
                                <li>Your bot responds automatically using the selected replica's knowledge base</li>
                                <li>All conversations are saved in Sensay for analysis</li>
                            </ol>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}

export default WhatsAppIntegration
