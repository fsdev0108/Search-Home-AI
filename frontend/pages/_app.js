import '../styles/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Load our embed widget script from the external widget server
    const script = document.createElement('script')
    script.src = 'http://localhost:3001/chat-widget.js'
    script.async = true
    script.onload = () => {
      console.log('Real Estate AI Widget loaded successfully from external server')
      
      // Initialize widget automatically (will run in demo mode without API keys)
      if (window.RealEstateChat) {
        window.RealEstateChat.init({
          apiKey: 'test-api-key',
          userId: 'test-user-id',
          replicaUuid: 'test-replica-uuid',
          position: 'bottom-right',
          theme: 'auto',
          primaryColor: '#3cacae'
          // No API keys = demo mode
        });
        console.log('Widget initialized automatically');
      }
    }
    script.onerror = () => {
      console.error('Failed to load widget script from external server')
    }
    document.head.appendChild(script)

    return () => {
      // Cleanup script when component unmounts
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return <Component {...pageProps} />
}
