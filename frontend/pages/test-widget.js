import { useEffect } from 'react';
import Head from 'next/head';

export default function TestWidget() {
  useEffect(() => {
    // Simulate client embedding our widget
    // This is exactly what the client will do
    
    // Step 1: Load the widget script from separate port (simulating different domain)
    const script = document.createElement('script');
    script.src = 'http://localhost:3001/chat-widget-simple.js'; // Simplified widget for testing
    script.async = true;
    script.onload = () => {
      console.log('Simplified widget loaded from separate port (simulating external domain)');
      
      // Step 2: Initialize the widget (client configuration)
      if (window.RealEstateChat) {
        window.RealEstateChat.init({
          apiKey: 'test-api-key',
          userId: 'test-user-id',
          replicaUuid: 'test-replica-uuid',
          position: 'bottom-right',
          theme: 'auto',
          primaryColor: '#3cacae'
        });
        
        console.log('Widget initialized with client config');
      }
    };
    
    script.onerror = () => {
      console.error('Failed to load widget from separate port');
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
    } else {
      console.log('Widget not ready yet');
    }
  };

  return (
    <>
      <Head>
        <title>Test Widget Embed - Real Estate AI</title>
      </Head>
      
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🧪 Test Widget Embed (Cross-Origin)
          </h1>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Client Integration Test</h2>
            <p className="text-gray-600 mb-4">
              This page simulates how a client would embed our widget from a different domain.
            </p>
            
            <div className="bg-blue-100 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Widget Server:</h3>
              <code className="text-sm text-blue-700">http://localhost:3001/chat-widget-simple.js</code>
              <p className="text-xs text-blue-600 mt-1">
                Simplified widget for testing interface (no Sensay API required)
              </p>
            </div>
            
            <div className="bg-gray-100 p-4 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Client's Embed Code:</h3>
              <pre className="text-sm text-gray-700 overflow-x-auto">
{`<!-- Step 1: Load the widget script from separate domain -->
<script src="http://localhost:3001/chat-widget-simple.js" async></script>

<!-- Step 2: Initialize the widget -->
<script>
  window.RealEstateChat.init({
    apiKey: 'client-api-key-here',
    userId: 'client-user-id', 
    replicaUuid: 'client-replica-uuid',
    position: 'bottom-right',
    theme: 'auto',
    primaryColor: '#3cacae'
  });
</script>`}
              </pre>
            </div>
            
            <button
              onClick={openWidget}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              🚀 Test Widget (Client Button)
            </button>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">What We're Testing:</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Widget loading from separate port (simulating external domain)</li>
              <li>Cross-origin requests and CORS handling</li>
              <li>Widget interface and functionality</li>
              <li>Chat simulation (no real API calls)</li>
              <li>Widget opening/closing functionality</li>
              <li>Message handling and display</li>
            </ul>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Setup Instructions:</h2>
            <div className="space-y-3">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <h3 className="font-semibold text-yellow-800">1. Start Widget Server:</h3>
                <code className="text-sm text-yellow-700 block mt-1">
                  cd embed-widget && node server.js
                </code>
                <p className="text-xs text-yellow-600 mt-1">
                  Server will run on http://localhost:3001
                </p>
              </div>
              
              <div className="bg-green-100 p-3 rounded-lg">
                <h3 className="font-semibold text-green-800">2. Start Frontend:</h3>
                <code className="text-sm text-green-700 block mt-1">
                  cd frontend && npm run dev
                </code>
                <p className="text-xs text-green-600 mt-1">
                  Frontend will run on http://localhost:3000
                </p>
              </div>
              
              <div className="bg-blue-100 p-3 rounded-lg">
                <h3 className="font-semibold text-blue-800">3. Test Widget Embed:</h3>
                <code className="text-sm text-blue-700 block mt-1">
                  http://localhost:3000/test-widget
                </code>
                <p className="text-xs text-blue-600 mt-1">
                  This simulates client integration
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
