import { useState, useEffect } from "react";
import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function TestWidget() {
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [widgetConfig, setWidgetConfig] = useState({
    userId: 'test-user-123',
    replicaUuid: '9c9ffb4c-13a2-4424-96ea-a600320ba6a3',
    position: 'bottom-right',
    theme: 'auto',
    primaryColor: '#3cacae'
  });

  useEffect(() => {
    // Load the widget script
    const script = document.createElement('script');
    script.src = '/widget/chat-widget.js';
    script.onload = () => {
      console.log('Widget script loaded');
      setWidgetLoaded(true);
    };
    script.onerror = () => {
      console.error('Failed to load widget script');
    };
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const initializeWidget = () => {
    if (window.RealEstateChat && window.RealEstateChat.init) {
      window.RealEstateChat.init(widgetConfig);
      console.log('Widget initialized with config:', widgetConfig);
    } else {
      console.error('RealEstateChat not available');
    }
  };

  const toggleWidget = () => {
    if (window.RealEstateChat && window.RealEstateChat.toggle) {
      window.RealEstateChat.toggle();
    } else {
      console.error('RealEstateChat not available');
    }
  };

  const handleConfigChange = (key, value) => {
    setWidgetConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className={`${geistSans.variable} ${geistMono.variable} font-sans min-h-screen bg-gray-50`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">
            Widget Test Page
          </h1>

          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Widget Configuration
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key
                </label>
                <input
                  type="text"
                  value={widgetConfig.apiKey}
                  onChange={(e) => handleConfigChange('apiKey', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User ID
                </label>
                <input
                  type="text"
                  value={widgetConfig.userId}
                  onChange={(e) => handleConfigChange('userId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Replica UUID
                </label>
                <input
                  type="text"
                  value={widgetConfig.replicaUuid}
                  onChange={(e) => handleConfigChange('replicaUuid', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Position
                </label>
                <select
                  value={widgetConfig.position}
                  onChange={(e) => handleConfigChange('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <select
                  value={widgetConfig.theme}
                  onChange={(e) => handleConfigChange('theme', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="auto">Auto</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Primary Color
                </label>
                <input
                  type="color"
                  value={widgetConfig.primaryColor}
                  onChange={(e) => handleConfigChange('primaryColor', e.target.value)}
                  className="w-full h-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={initializeWidget}
                disabled={!widgetLoaded}
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {widgetLoaded ? 'Initialize Widget' : 'Loading Widget...'}
              </button>
              
              <button
                onClick={toggleWidget}
                disabled={!widgetLoaded}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                Toggle Widget
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              Test Content
            </h2>
            
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                This is a test page for the Real Estate AI Chat Widget. Use the configuration above to test different settings.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-2">
                How to test:
              </h3>
              <ol className="list-decimal list-inside text-gray-600 space-y-2">
                <li>Configure the widget settings above</li>
                <li>Click "Initialize Widget" to start the widget</li>
                <li>Click "Toggle Widget" to open/close the chat</li>
                <li>Test the chat functionality</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 mb-2 mt-6">
                Widget Status:
              </h3>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${widgetLoaded ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-gray-600">
                  {widgetLoaded ? 'Widget script loaded' : 'Widget script loading...'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}