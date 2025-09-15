import '../styles/globals.css'
import { useEffect } from 'react'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    // Load Sensay widget script
    const script = document.createElement('script')
    script.src = 'https://chat-widget.sensay.io/474108fd-5b8e-466a-bd8b-a2c66caaccaf/embed-script.js'
    script.defer = true
    script.onload = () => {
      console.log('Sensay widget loaded successfully')
    }
    script.onerror = () => {
      console.error('Failed to load Sensay widget script')
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
