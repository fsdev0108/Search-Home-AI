import React, { useState, useEffect } from 'react'
import API from '../../services/api'
import { Button, Card, Input, Select, Loading, Modal } from '../UI'
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
    const [showDeleteModal, setShowDeleteModal] = useState(false)
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
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        setShowDeleteModal(false)

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
        return (
            <div className="container-admin py-8">
                <Loading message="Loading WhatsApp integration..." />
            </div>
        )
    }

    if (replicas.length === 0) {
        return <NoReplicas onNavigateToReplicas={() => onTabChange('replicas')} />
    }

    return (
        <div className="container-admin py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">WhatsApp Integration</h1>
                <p className="text-gray-600">Configure your WhatsApp Business number for automated customer service</p>
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

            {!whatsappData ? (
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">MVP Setup - Server Credentials</h3>
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm mb-4">
                            <div className="space-y-2 text-sm text-blue-700">
                                <p><strong>✅ Server Configuration:</strong> Twilio credentials are already configured on the server</p>
                                <p><strong>📱 WhatsApp Number:</strong> +1 415 523 8886 (Sandbox)</p>
                                <p><strong>🔗 Webhook:</strong> Automatically configured</p>
                            </div>
                        </div>

                        <Button
                            onClick={testServerCredentials}
                            disabled={testing}
                            variant="outline"
                        >
                            {testing ? 'Testing...' : 'Test Server Connection'}
                        </Button>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select the Replica</h3>
                        <p className="text-gray-600 mb-4">Choose which replica will respond to WhatsApp messages:</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Replica that will respond on WhatsApp:</label>
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

                    <Button
                        onClick={saveWhatsAppIntegration}
                        disabled={saving || !formData.replicaId}
                        className="w-full"
                    >
                        {saving ? 'Creating...' : 'Create WhatsApp Integration'}
                    </Button>
                </div>
            ) : showReconfigure ? (
                <div className="space-y-6">
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Reconfigure WhatsApp Integration</h3>
                        <p className="text-gray-600">Update your Twilio credentials or change the connected replica</p>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Credentials (Optional)</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Account SID:</label>
                                <input
                                    type="text"
                                    placeholder="Leave empty to keep current..."
                                    value={formData.accountSid}
                                    onChange={(e) => setFormData({ ...formData, accountSid: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Auth Token:</label>
                                <input
                                    type="password"
                                    placeholder="Leave empty to keep current..."
                                    value={formData.authToken}
                                    onChange={(e) => setFormData({ ...formData, authToken: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number (MVP - Sandbox):</label>
                                <input
                                    type="text"
                                    value="+14155238886"
                                    disabled
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm bg-gray-50 text-gray-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">Using Twilio Sandbox for MVP testing</p>
                            </div>
                        </div>
                    </Card>

                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Replica</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Replica that will respond on WhatsApp:</label>
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
                                <span className="text-sm font-medium text-gray-700">Phone Number:</span>
                                <span className="text-sm text-gray-900">{whatsappData.phoneNumber}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Status:</span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold ${whatsappData.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                    {whatsappData.isActive ? '🟢 Active' : '🔴 Inactive'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-sm font-medium text-gray-700">Created on:</span>
                                <span className="text-sm text-gray-900">
                                    {new Date(whatsappData.createdAt).toLocaleDateString('en-US')}
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
                                    {replicas.find(r => r.id === whatsappData.replicaId)?.name || 'Unknown'}
                                </span>
                            </div>
                        </div>
                    </Card>

                    <div className="flex space-x-3">
                        {!whatsappData.isActive && (
                            <Button
                                onClick={activateIntegration}
                                disabled={activating}
                                className="flex-1"
                            >
                                {activating ? 'Activating...' : 'Activate Integration'}
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

                    {whatsappData.isActive && (
                        <Card>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 How to use (MVP):</h3>
                            <ol className="space-y-2 text-gray-700">
                                <li>1. <strong>Configure webhook in Twilio Console:</strong> <code className="bg-gray-100 px-2 py-1 rounded text-sm">https://sensay-search-home-ai-production.up.railway.app/api/v1/twilio/webhook/{currentIntegration.id}</code></li>
                                <li>2. <strong>For sandbox testing:</strong> Send "join &lt;keyword&gt;" to +1 415 523 8886</li>
                                <li>3. <strong>Then send any message</strong> to test the integration</li>
                                <li>4. Your bot responds automatically using the selected replica's knowledge base</li>
                                <li>5. All conversations are saved in Sensay for analysis</li>
                            </ol>
                        </Card>
                    )}
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                title="Delete WhatsApp Integration"
                onConfirm={confirmDelete}
                confirmText="Delete"
                cancelText="Cancel"
                confirmVariant="danger"
            >
                <div className="text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <p className="text-gray-600 mb-4">
                        Are you sure you want to delete this WhatsApp integration? This action cannot be undone.
                    </p>
                    <p className="text-sm text-gray-500">
                        All WhatsApp bot connections and settings will be permanently removed.
                    </p>
                </div>
            </Modal>
        </div>
    )
}

export default WhatsAppIntegration
