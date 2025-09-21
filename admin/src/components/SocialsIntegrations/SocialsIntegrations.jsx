import React, { useState } from 'react'
import { FaTelegram, FaWhatsapp } from 'react-icons/fa'
import TelegramIntegration from '../Telegram/TelegramIntegration'
import WhatsAppIntegration from '../WhatsApp/WhatsAppIntegration'

const SocialsIntegrations = ({ onTabChange }) => {
    const [activeTab, setActiveTab] = useState('telegram')

    const tabs = [
        { id: 'telegram', label: 'Telegram', icon: FaTelegram, color: 'text-blue-500' },
        { id: 'whatsapp', label: 'WhatsApp', icon: FaWhatsapp, color: 'text-green-500' }
    ]

    const renderTabContent = () => {
        switch (activeTab) {
            case 'telegram':
                return <TelegramIntegration onTabChange={onTabChange} />
            case 'whatsapp':
                return <WhatsAppIntegration onTabChange={onTabChange} />
            default:
                return <TelegramIntegration onTabChange={onTabChange} />
        }
    }

    return (
        <div className="container-admin py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900 mb-2">Social Integrations</h1>
                <p className="text-gray-600">Connect your replicas to Telegram and WhatsApp for automated customer service</p>
            </div>

            <div className="border-b border-gray-200 mb-6">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => {
                        const IconComponent = tab.icon
                        return (
                            <button
                                key={tab.id}
                                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${activeTab === tab.id
                                    ? 'border-yellow-500 text-yellow-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <IconComponent className={`mr-2 text-lg ${activeTab === tab.id ? 'text-yellow-600' : tab.color}`} />
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>
            </div>

            <div>
                {renderTabContent()}
            </div>
        </div>
    )
}

export default SocialsIntegrations
