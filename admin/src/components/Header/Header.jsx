import './Header.css'

const Header = ({ currentTab, onTabChange, user, onLogout }) => {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'users', label: 'Users', adminOnly: true },
        { id: 'replicas', label: 'Replicas' },
        { id: 'telegram', label: '🤖 Telegram', userOnly: true },
        { id: 'widget', label: 'Widget', userOnly: true },
        { id: 'settings', label: 'Settings', userOnly: true }
    ]

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            onLogout()
        }
    }

    return (
        <header className="header">
            <div className="header-content">
                <h1 className="logo">Herainov Admin</h1>

                <nav className="nav">
                    {tabs.map(tab => {
                        // Filtrar tabs baseado no role do usuário
                        if (tab.adminOnly && user.role !== 'admin') {
                            return null
                        }

                        if (tab.userOnly && user.role === 'admin') {
                            return null
                        }

                        return (
                            <button
                                key={tab.id}
                                className={`nav-btn ${currentTab === tab.id ? 'active' : ''}`}
                                onClick={() => onTabChange(tab.id)}
                            >
                                {tab.label}
                            </button>
                        )
                    })}
                </nav>

                <div className="user-info">
                    <div className="user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-role">{user.role}</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </div>
        </header>
    )
}

export default Header
