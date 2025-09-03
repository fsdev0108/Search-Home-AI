import { useState } from 'react'
import './App.css'
import Header from './components/Header/Header'
import Dashboard from './components/Dashboard/Dashboard'
import Users from './components/Users/Users'
import Replicas from './components/Replicas/Replicas'
import Files from './components/Files/Files'

function App() {
  const [currentTab, setCurrentTab] = useState('dashboard')

  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return <Dashboard />
      case 'users':
        return <Users />
      case 'replicas':
        return <Replicas />
      case 'files':
        return <Files />
      default:
        return <Dashboard />
    }
  }

  return (
    <div className="app">
      <Header currentTab={currentTab} onTabChange={setCurrentTab} />
      <main className="main-content">
        {renderTabContent()}
      </main>
    </div>
  )
}

export default App
