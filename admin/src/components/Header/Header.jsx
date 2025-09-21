import { Button } from '../UI'

const Header = ({ currentTab, onTabChange, user, onLogout }) => {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'users', label: 'Users', adminOnly: true },
        { id: 'replicas', label: 'Replicas' },
        { id: 'socials', label: 'Socials', userOnly: true },
        { id: 'widget', label: 'Widget', userOnly: true },
        { id: 'settings', label: 'Settings', userOnly: true }
    ]

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            onLogout()
        }
    }

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm">
            <div className="container-admin">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex items-center">
                        <h1 className="text-xl font-semibold text-gray-900">
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
                                        ? 'text-yellow-700 bg-yellow-50 border-b-2 border-yellow-600'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                            <div className="text-sm font-medium text-gray-900">
                                {user.name}
                            </div>
                            <div className="text-xs text-gray-500 capitalize">
                                {user.role}
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleLogout}
                        >
                            Logout
                        </Button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                <div className="md:hidden border-t border-gray-200">
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
                                        ? 'text-yellow-700 bg-yellow-50'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
        </header>
    )
}

export default Header
