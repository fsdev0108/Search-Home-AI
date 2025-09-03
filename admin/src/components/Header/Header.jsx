import './Header.css'

const Header = ({ currentTab, onTabChange }) => {
    const tabs = [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'users', label: 'Users' },
        { id: 'replicas', label: 'Replicas' },
        { id: 'files', label: 'Files' }
    ]

    return (
        <header className="header">
            <div className="header-content">
                <h1 className="logo">Sensay Admin</h1>

                <nav className="nav">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            className={`nav-btn ${currentTab === tab.id ? 'active' : ''}`}
                            onClick={() => onTabChange(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>

                <div className="user-info">
                    <span>Admin</span>
                    <button className="logout-btn">Logout</button>
                </div>
            </div>
        </header>
    )
}

export default Header
