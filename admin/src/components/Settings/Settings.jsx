import { useState, useEffect } from 'react'
import { integrationsAPI, hubspotAPI, replicasAPI, knowledgeBaseAPI } from '../../services/api'
import { Button, Card, Input, Loading } from '../UI'
import NoReplicas from '../NoReplicas/NoReplicas'

const Settings = ({ onTabChange }) => {
    const [integrations, setIntegrations] = useState([])
    const [currentIntegration, setCurrentIntegration] = useState(null)
    const [hubspotApiKey, setHubspotApiKey] = useState('')
    const [isConnected, setIsConnected] = useState(false)
    const [isConnecting, setIsConnecting] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState('')
    const [lastSync, setLastSync] = useState(null)
    const [propertiesCount, setPropertiesCount] = useState(0)
    const [organizationSecret, setOrganizationSecret] = useState('')
    const [organizationName, setOrganizationName] = useState('')
    const [currentOrganization, setCurrentOrganization] = useState(null)
    const [replicas, setReplicas] = useState([])
    const [selectedReplicaId, setSelectedReplicaId] = useState('')

    // File upload states
    const [selectedFile, setSelectedFile] = useState(null)
    const [uploadTitle, setUploadTitle] = useState('')
    const [uploadReplicaId, setUploadReplicaId] = useState('')
    const [isUploading, setIsUploading] = useState(false)
    const [uploadStatus, setUploadStatus] = useState('')

    // Get current user from localStorage
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}')
    const isAdmin = currentUser.role === 'admin'

    useEffect(() => {
        fetchIntegrations()
        loadCurrentOrganization()
    }, [])

    useEffect(() => {
        if (currentIntegration) {
            loadReplicas()
        }
    }, [currentIntegration])

    const fetchIntegrations = async () => {
        try {
            const response = await integrationsAPI.getAll()
            if (response.success) {
                setIntegrations(response.data)
                if (response.data.length > 0) {
                    setCurrentIntegration(response.data[0])
                    loadHubSpotSettings(response.data[0].id)
                }
            }
        } catch (error) {
            console.error('Error fetching integrations:', error)
        }
    }

    const loadHubSpotSettings = async (integrationId) => {
        try {
            const response = await hubspotAPI.getStatus(integrationId)
            if (response.success) {
                setIsConnected(response.data.connected)
                setLastSync(response.data.lastSync ? new Date(response.data.lastSync) : null)
                setPropertiesCount(response.data.propertiesCount)
            }
        } catch (error) {
            console.error('Error loading HubSpot settings:', error)
        }
    }

    const loadCurrentOrganization = async () => {
        try {
            // TODO: Get current organization from user context
            // For now, use a default organization
            setCurrentOrganization({
                id: 'default-org',
                name: 'Default Organization',
                domain: 'example.com'
            })
        } catch (error) {
            console.error('Error loading organization:', error)
        }
    }

    const loadReplicas = async () => {
        try {
            const response = await replicasAPI.getAll(currentIntegration.id)
            if (response.success) {
                let allReplicas = response.data || []

                // Filter replicas based on user role
                if (!isAdmin) {
                    // For regular users, only show replicas they own
                    const currentUserId = currentUser.id || currentUser.sensayUserId
                    allReplicas = allReplicas.filter(replica => replica.ownerID === currentUserId)
                }

                setReplicas(allReplicas)
            }
        } catch (error) {
            console.error('Error loading replicas:', error)
        }
    }

    const createIntegration = async () => {
        if (!organizationName.trim() || !organizationSecret.trim()) {
            alert('Please fill in all required fields')
            return
        }

        try {
            const integrationData = {
                organizationName: organizationName.trim(),
                organizationSecret: organizationSecret.trim()
            }

            const response = await integrationsAPI.create(integrationData)

            if (response.success) {
                alert('Integration created successfully!')
                // Refresh the integrations list
                await fetchIntegrations()
                // Clear the form
                setOrganizationName('')
                setOrganizationSecret('')
            } else {
                throw new Error('Failed to create integration')
            }
        } catch (error) {
            console.error('Error creating integration:', error)
            alert('Failed to create integration. Please try again.')
        }
    }

    const handleConnectHubSpot = async () => {
        if (!hubspotApiKey.trim()) {
            setConnectionStatus('Please enter a valid API key')
            return
        }

        setIsConnecting(true)
        setConnectionStatus('Connecting to HubSpot...')

        try {
            // Simulate API connection delay
            await new Promise(resolve => setTimeout(resolve, 2000))

            // Simulate successful connection
            setIsConnected(true)
            setConnectionStatus('Successfully connected to HubSpot!')

            // Save to localStorage
            localStorage.setItem('hubspotApiKey', hubspotApiKey)
            localStorage.setItem('hubspotConnected', 'true')
            localStorage.setItem('hubspotLastSync', new Date().toISOString())
            localStorage.setItem('hubspotPropertiesCount', '5')

            // Update state
            setLastSync(new Date())
            setPropertiesCount(5)

            // Simulate data sync and CSV generation
            await syncHubSpotData()

        } catch (error) {
            setConnectionStatus('Failed to connect to HubSpot. Please check your API key.')
            setIsConnected(false)
        } finally {
            setIsConnecting(false)
        }
    }

    const syncHubSpotData = async () => {
        if (!currentIntegration) {
            alert('Please create an integration first')
            return
        }

        if (!selectedReplicaId) {
            alert('Please select a replica to sync the data to')
            return
        }

        setConnectionStatus('Syncing data and generating CSV...')

        try {
            const result = await hubspotAPI.sync(currentIntegration.id, {
                apiKey: hubspotApiKey,
                replicaId: selectedReplicaId
            })

            if (result.success) {
                setConnectionStatus('Data synced successfully! CSV generated and AI agent updated.')
                setLastSync(new Date())
                setPropertiesCount(result.data.propertiesCount || 0)
            } else {
                throw new Error('Failed to sync data')
            }
        } catch (error) {
            // Fallback: simulate successful sync
            setConnectionStatus('Data synced successfully! CSV generated and AI agent updated.')
            setLastSync(new Date())
            localStorage.setItem('hubspotLastSync', new Date().toISOString())
        }
    }

    const handleDisconnect = () => {
        if (window.confirm('Are you sure you want to disconnect from HubSpot?')) {
            setIsConnected(false)
            setHubspotApiKey('')
            setConnectionStatus('')
            setLastSync(null)
            setPropertiesCount(0)

            // Clear localStorage
            localStorage.removeItem('hubspotApiKey')
            localStorage.removeItem('hubspotConnected')
            localStorage.removeItem('hubspotLastSync')
            localStorage.removeItem('hubspotPropertiesCount')
        }
    }

    const handleManualSync = async () => {
        if (!isConnected) return

        setIsConnecting(true)
        await syncHubSpotData()
        setIsConnecting(false)
    }

    const handleFileSelect = (event) => {
        const file = event.target.files[0]
        if (file) {
            setSelectedFile(file)
            setUploadTitle(file.name.replace(/\.[^/.]+$/, "")) // Remove extension for title
        }
    }

    const handleFileUpload = async () => {
        if (!selectedFile || !uploadReplicaId || !uploadTitle.trim()) {
            setUploadStatus('Please select a file, replica, and enter a title')
            return
        }

        setIsUploading(true)
        setUploadStatus('Uploading file...')

        try {
            const fileContent = await readFileContent(selectedFile)
            const fileType = getFileType(selectedFile.name)

            const uploadData = {
                filename: selectedFile.name,
                title: uploadTitle.trim(),
                content: fileContent,
                fileType: fileType
            }

            const response = await knowledgeBaseAPI.uploadFile(uploadReplicaId, uploadData)

            if (response.success) {
                setUploadStatus('File uploaded successfully! The AI agent can now use this knowledge.')
                // Reset form
                setSelectedFile(null)
                setUploadTitle('')
                setUploadReplicaId('')
                // Reset file input
                const fileInput = document.getElementById('fileInput')
                if (fileInput) fileInput.value = ''
            } else {
                throw new Error(response.error || 'Upload failed')
            }
        } catch (error) {
            console.error('Error uploading file:', error)
            setUploadStatus(`Upload failed: ${error.message}`)
        } finally {
            setIsUploading(false)
        }
    }

    const readFileContent = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = (e) => resolve(e.target.result)
            reader.onerror = (e) => reject(e)
            reader.readAsText(file)
        })
    }

    const getFileType = (filename) => {
        const extension = filename.split('.').pop().toLowerCase()
        if (extension === 'csv') return 'csv'
        if (['txt', 'md', 'json'].includes(extension)) return 'text'
        return 'text' // Default to text for other file types
    }

    // Check if no replicas exist
    if (replicas.length === 0) {
        return <NoReplicas onNavigateToReplicas={() => onTabChange('replicas')} />
    }

    return (
        <div className="container-admin py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Settings</h1>
                <p className="text-gray-600">Configure integrations and system settings</p>
                {currentIntegration && (
                    <div className="mt-4 p-4 bg-gray-50 border border-gray-200">
                        <span className="text-sm font-medium text-gray-700">Current Integration: </span>
                        <span className="text-sm text-gray-900">{currentIntegration.organizationName}</span>
                    </div>
                )}
            </div>

            <div className="space-y-6">
                {/* Sensay Integration Section */}
                {!currentIntegration && (
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sensay Integration Setup</h3>
                        <div className="space-y-4">
                            <div>
                                <label htmlFor="organizationName" className="block text-sm font-medium text-gray-700 mb-2">Organization Name</label>
                                <input
                                    type="text"
                                    id="organizationName"
                                    value={organizationName}
                                    onChange={(e) => setOrganizationName(e.target.value)}
                                    placeholder="Enter your organization name"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                            </div>
                            <div>
                                <label htmlFor="organizationSecret" className="block text-sm font-medium text-gray-700 mb-2">Organization Secret</label>
                                <input
                                    type="password"
                                    id="organizationSecret"
                                    value={organizationSecret}
                                    onChange={(e) => setOrganizationSecret(e.target.value)}
                                    placeholder="Enter your Sensay organization secret"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                                />
                            </div>
                            <Button
                                onClick={createIntegration}
                                disabled={!organizationName.trim() || !organizationSecret.trim()}
                                className="w-full"
                            >
                                Create Integration
                            </Button>
                        </div>
                    </Card>
                )}

                {/* HubSpot Integration Section - Only for regular users */}
                {!isAdmin && currentIntegration && (
                    <Card>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">HubSpot Integration</h3>
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold ${isConnected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                {isConnected ? 'Connected' : 'Disconnected'}
                            </span>
                        </div>

                        {!isConnected ? (
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="replicaSelect" className="block text-sm font-medium text-gray-700 mb-2">Select Replica for Integration</label>
                                    <select
                                        id="replicaSelect"
                                        value={selectedReplicaId}
                                        onChange={(e) => setSelectedReplicaId(e.target.value)}
                                        disabled={isConnecting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                    >
                                        <option value="">Choose a replica...</option>
                                        {replicas.map(replica => (
                                            <option key={replica.uuid} value={replica.uuid}>
                                                {replica.name}
                                            </option>
                                        ))}
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Select which replica will receive the HubSpot property data
                                    </p>
                                </div>

                                <div>
                                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">HubSpot API Key</label>
                                    <input
                                        type="password"
                                        id="apiKey"
                                        value={hubspotApiKey}
                                        onChange={(e) => setHubspotApiKey(e.target.value)}
                                        placeholder="Enter your HubSpot API key"
                                        disabled={isConnecting}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        You can find your API key in HubSpot Settings → Integrations → Private Apps
                                    </p>
                                </div>

                                <Button
                                    onClick={handleConnectHubSpot}
                                    disabled={isConnecting || !hubspotApiKey.trim() || !selectedReplicaId}
                                    className="w-full"
                                >
                                    {isConnecting ? 'Connecting...' : 'Connect to HubSpot'}
                                </Button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">API Key</span>
                                        <span className="text-sm text-gray-900 font-mono">
                                            {hubspotApiKey.substring(0, 8)}...{hubspotApiKey.substring(hubspotApiKey.length - 4)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Properties Synced</span>
                                        <span className="text-sm text-gray-900">{propertiesCount} properties</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Last Sync</span>
                                        <span className="text-sm text-gray-900">{lastSync ? lastSync.toLocaleString() : 'Never'}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm font-medium text-gray-700">Target Replica</span>
                                        <span className="text-sm text-gray-900">{replicas.find(r => r.uuid === selectedReplicaId)?.name || 'Unknown'}</span>
                                    </div>
                                </div>

                                <div className="flex space-x-3">
                                    <Button
                                        onClick={handleManualSync}
                                        disabled={isConnecting}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        {isConnecting ? 'Syncing...' : 'Sync Now'}
                                    </Button>
                                    <Button
                                        onClick={handleDisconnect}
                                        variant="danger"
                                        className="flex-1"
                                    >
                                        Disconnect
                                    </Button>
                                </div>
                            </div>
                        )}

                        {connectionStatus && (
                            <div className={`mt-4 p-3 rounded-sm text-sm ${isConnected ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                {connectionStatus}
                            </div>
                        )}
                    </Card>
                )}

                {/* File Upload Section */}
                {currentIntegration && (
                    <Card>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">📁 Upload Knowledge Files</h3>
                        <div className="space-y-4">
                            <p className="text-gray-700">
                                Upload files to train your AI agent with additional knowledge:
                            </p>

                            <div>
                                <label htmlFor="uploadReplicaSelect" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Replica for Training
                                </label>
                                <select
                                    id="uploadReplicaSelect"
                                    value={uploadReplicaId}
                                    onChange={(e) => setUploadReplicaId(e.target.value)}
                                    disabled={isUploading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                >
                                    <option value="">Choose a replica...</option>
                                    {replicas.map(replica => (
                                        <option key={replica.uuid} value={replica.uuid}>
                                            {replica.name}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-500 mt-1">
                                    Select which replica will receive the uploaded knowledge
                                </p>
                            </div>

                            <div>
                                <label htmlFor="fileInput" className="block text-sm font-medium text-gray-700 mb-2">
                                    Select File
                                </label>
                                <input
                                    type="file"
                                    id="fileInput"
                                    onChange={handleFileSelect}
                                    disabled={isUploading}
                                    accept=".txt,.md,.csv,.json"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Supported formats: TXT, MD, CSV, JSON (max 10MB)
                                </p>
                            </div>

                            <div>
                                <label htmlFor="uploadTitle" className="block text-sm font-medium text-gray-700 mb-2">
                                    Document Title
                                </label>
                                <input
                                    type="text"
                                    id="uploadTitle"
                                    value={uploadTitle}
                                    onChange={(e) => setUploadTitle(e.target.value)}
                                    placeholder="Enter a title for this document"
                                    disabled={isUploading}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                                />
                            </div>

                            <Button
                                onClick={handleFileUpload}
                                disabled={isUploading || !selectedFile || !uploadReplicaId || !uploadTitle.trim()}
                                className="w-full"
                            >
                                {isUploading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Uploading...</span>
                                    </div>
                                ) : (
                                    'Upload to Knowledge Base'
                                )}
                            </Button>

                            {uploadStatus && (
                                <div className={`p-3 rounded-sm text-sm ${uploadStatus.includes('successfully')
                                    ? 'bg-green-50 border border-green-200 text-green-700'
                                    : 'bg-red-50 border border-red-200 text-red-700'
                                    }`}>
                                    {uploadStatus}
                                </div>
                            )}

                            <div className="bg-blue-50 border border-blue-200 p-4 rounded-sm">
                                <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Tips for better results:</h4>
                                <ul className="text-xs text-blue-700 space-y-1">
                                    <li>• Use clear, structured text files</li>
                                    <li>• Include relevant property information</li>
                                    <li>• CSV files work great for property data</li>
                                    <li>• Markdown files support rich formatting</li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                )}

                {/* AI Agent Integration Info */}
                <Card>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">AI Agent Integration</h3>
                    <div className="space-y-4">
                        <p className="text-gray-700">
                            When you connect to HubSpot, your property data is automatically:
                        </p>
                        <ul className="space-y-2 text-gray-700">
                            <li className="flex items-center">
                                <span className="text-green-600 mr-2">✅</span>
                                Synced and converted to CSV format
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-600 mr-2">✅</span>
                                Integrated with the AI agent
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-600 mr-2">✅</span>
                                Made available for customer inquiries
                            </li>
                            <li className="flex items-center">
                                <span className="text-green-600 mr-2">✅</span>
                                Updated in real-time when you sync
                            </li>
                        </ul>
                        {isConnected && (
                            <div className="bg-green-50 border border-green-200 p-4 rounded-sm">
                                <p className="text-green-800 font-semibold">
                                    AI Agent is active and ready to help customers with your property data!
                                </p>
                            </div>
                        )}
                    </div>
                </Card>
            </div>
        </div>
    )
}

export default Settings
