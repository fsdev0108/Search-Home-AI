import React, { useState } from 'react'
import './SocialsIntegrations.css'
import TelegramIntegration from '../Telegram/TelegramIntegration'
import WhatsAppIntegration from '../WhatsApp/WhatsAppIntegration'

const SocialsIntegrations = ({ onTabChange }) => {
    const [activeTab, setActiveTab] = useState('telegram')

    const tabs = [
        { id: 'telegram', label: '🤖 Telegram', icon: '📱' },
        { id: 'whatsapp', label: '💬 WhatsApp', icon: '📲' }
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
        <div className="socials-integrations">
            <div className="socials-header">
                <h2>📱 Social Integrations</h2>
                <p>Connect your replicas to Telegram and WhatsApp for automated customer service</p>
            </div>

            <div className="socials-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`socials-tab ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <span className="socials-tab-icon">{tab.icon}</span>
                        <span className="socials-tab-label">{tab.label}</span>
                    </button>
                ))}
            </div>

            <div className="socials-content">
                {renderTabContent()}
            </div>
        </div>
    )
}

export default SocialsIntegrations
