import { useEffect, useState } from 'react';
import Head from 'next/head';

export default function TestWidgetLocal() {
  const [status, setStatus] = useState({
    script: 'Loading...',
    widget: 'Loading...',
    initialized: 'Loading...'
  });

  useEffect(() => {
    // Test loading our widget locally (for development)
    const script = document.createElement('script');
    script.src = '/widget/chat-widget.js'; // Local widget
    script.async = true;
    
    script.onload = () => {
      console.log('Widget loaded locally');
      setStatus(prev => ({ ...prev, script: '✅ Loaded' }));
      
      // Check if widget object exists
      if (window.RealEstateChat) {
        setStatus(prev => ({ ...prev, widget: '✅ Available' }));
        
        // Try to initialize
        try {
          window.RealEstateChat.init({
            apiKey: 'test-api-key',
            userId: 'test-user-id',
            replicaUuid: 'test-replica-uuid',
            position: 'bottom-right',
            theme: 'auto',
            primaryColor: '#3cacae'
          });
          
          setStatus(prev => ({ ...prev, initialized: '✅ Initialized' }));
          console.log('Widget initialized successfully');
        } catch (error) {
          setStatus(prev => ({ ...prev, initialized: '❌ Error: ' + error.message }));
          console.error('Widget initialization failed:', error);
        }
      } else {
        setStatus(prev => ({ ...prev, widget: '❌ Not Found' }));
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load widget locally');
      setStatus(prev => ({ ...prev, script: '❌ Failed' }));
    };
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  const openWidget = () => {
    if (window.RealEstateChat && window.RealEstateChat.open) {
      window.RealEstateChat.open();
      console.log('Widget opened');
    } else {
      console.log('Widget not ready yet');
    }
  };

  const closeWidget = () => {
    if (window.RealEstateChat && window.RealEstateChat.close) {
      window.RealEstateChat.close();
      console.log('Widget closed');
    }
  };

  const testChat = () => {
    if (window.RealEstateChat && window.RealEstateChat.config) {
      console.log('Widget config:', window.RealEstateChat.config);
      console.log('Widget methods:', Object.keys(window.RealEstateChat));
    } else {
      console.log('Widget not properly initialized');
    }
  };

  return (
    <>
      <Head>
        <title>Test Widget Local - Real Estate AI</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Test Widget Local (Development)
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Local Widget Test</h2>
            <p className="text-gray-600 mb-4">
              This page tests our widget loading from the local public folder.
            </p>
            
            <div className="bg-blue-100 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Local Widget Path:</h3>
              <code className="text-sm text-blue-700">/widget/chat-widget.js</code>
            </div>
            
            <div className="flex gap-4 mb-4">
              <button
                onClick={openWidget}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                🚀 Open Widget
              </button>
              
              <button
                onClick={closeWidget}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ❌ Close Widget
              </button>
              
              <button
                onClick={testChat}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🔍 Test Chat
              </button>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Widget Status:</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Script Loading:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  status.script.includes('✅') ? 'bg-green-100 text-green-800' : 
                  status.script.includes('❌') ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.script}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Widget Object:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  status.widget.includes('✅') ? 'bg-green-100 text-green-800' : 
                  status.widget.includes('❌') ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.widget}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">Widget Initialized:</span>
                <span className={`px-3 py-1 rounded-full text-sm ${
                  status.initialized.includes('✅') ? 'bg-green-100 text-green-800' : 
                  status.initialized.includes('❌') ? 'bg-red-100 text-red-800' : 
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {status.initialized}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Console Commands:</h2>
            <p className="text-gray-600 mb-4">
              Open browser console (F12) and try these commands:
            </p>
            <div className="space-y-2">
              <code className="block bg-gray-100 p-2 rounded text-sm">
                window.RealEstateChat
              </code>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                window.RealEstateChat.open()
              </code>
              <code className="block bg-gray-100 p-2 rounded text-sm">
                window.RealEstateChat.close()
              </code>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
