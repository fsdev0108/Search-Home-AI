import { useState } from 'react'
import { Button, Modal } from '../UI'

const Header = ({ currentTab, onTabChange, user, onLogout }) => {
    const [showLogoutModal, setShowLogoutModal] = useState(false)

    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'users', label: 'Users', adminOnly: true },
        { id: 'replicas', label: 'Replicas' },
        { id: 'socials', label: 'Socials', userOnly: true },
        { id: 'widget', label: 'Widget', userOnly: true },
        { id: 'settings', label: 'Settings', userOnly: true }
    ]

    const handleLogout = () => {
        setShowLogoutModal(true)
    }

    const confirmLogout = () => {
        setShowLogoutModal(false)
        onLogout()
    }

    return (
        <header className="bg-black border-b border-gray-800 shadow-sm">
            <div className="container-admin">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center space-x-3">
                        <img
                            src="/herainov_house_logo.png"
                            alt="Herainov Logo"
                            className="h-8 w-8 object-contain flex-shrink-0"
                            onError={(e) => {
                                e.target.style.display = 'none'
                            }}
                        />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                            Herainov
                        </h1>
                    </div>

                    {/* Navigation */}
                    <nav className="hidden md:flex space-x-1">
                        {tabs.map(tab => {
                            if (tab.adminOnly && user.role !== 'admin') {
                                return null
                            }
                            if (tab.userOnly && user.role === 'admin') {
                                return null
                            }

                            return (
                                <button
                                    key={tab.id}
                                    className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${currentTab === tab.id
                                        ? 'text-yellow-400 bg-gray-900 border-b-2 border-yellow-400'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                        }`}
                                    onClick={() => onTabChange(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>

                    {/* User Info */}
                    <div className="flex items-center space-x-4">
                        <div className="hidden sm:block text-right">
                            <div className="text-sm font-medium text-white">
                                {user.name}
                            </div>
                            <div className="text-xs text-gray-400 capitalize">
                                {user.role}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                            className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden border-t border-gray-800">
                    <nav className="flex space-x-1 py-2 overflow-x-auto">
                        {tabs.map(tab => {
                            if (tab.adminOnly && user.role !== 'admin') {
                                return null
                            }
                            if (tab.userOnly && user.role === 'admin') {
                                return null
                            }

                            return (
                                <button
                                    key={tab.id}
                                    className={`px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-200 ${currentTab === tab.id
                                        ? 'text-yellow-400 bg-gray-900'
                                        : 'text-gray-300 hover:text-white hover:bg-gray-800'
                                        }`}
                                    onClick={() => onTabChange(tab.id)}
                                >
                                    {tab.label}
                                </button>
                            )
                        })}
                    </nav>
                </div>
            </div>

            {/* Logout Confirmation Modal */}
            <Modal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                title="Confirm Logout"
                onConfirm={confirmLogout}
                confirmText="Logout"
                cancelText="Cancel"
                confirmVariant="danger"
            >
                <div className="text-center">
                    <div className="text-4xl mb-4">🚪</div>
                    <p className="text-gray-600">
                        Are you sure you want to logout? You will need to sign in again to access the admin panel.
                    </p>
                </div>
            </Modal>
        </header>
    )
}

export default Header
