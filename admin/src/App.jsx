import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header/Header'
import Dashboard from './components/Dashboard/Dashboard'
import Users from './components/Users/Users'
import Replicas from './components/Replicas/Replicas'
import Files from './components/Files/Files'
import Login from './components/Auth/Login'

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar se há usuário logado
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('authToken')

    if (savedUser && token) {
      setUser(JSON.parse(savedUser))
    }

    setLoading(false)
  }, [])

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = () => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('user')
    setUser(null)
    setCurrentTab('dashboard')
  }

  const renderTabContent = () => {
    if (!user) return null

    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />
      case 'users':
        return user.role === 'admin' ? <Users /> : <div>Access denied</div>
      case 'replicas':
        return <Replicas />
      case 'files':
        return <Files />
      default:
        return <Dashboard />
    }
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <div className="app">
      <Header
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        user={user}
        onLogout={handleLogout}
      />
      <main className="main-content">
        {renderTabContent()}
      </main>
    </div>
  )
}

export default App
