/**
 * Real Estate AI Chat Widget
 * Embed this script in any website to add the chat functionality
 * 
 * Usage:
 * <script src="https://yourdomain.com/chat-widget.js"></script>
 * <script>
 *   RealEstateChat.init({
 *     apiKey: 'your_sensay_api_key',
 *     userId: 'your_user_id',
 *     replicaUuid: 'your_replica_uuid',
 *     position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
 *     theme: 'light', // light, dark, auto
 *     primaryColor: '#3cacae'
 *   });
 * </script>
 */

(function() {
  'use strict';

  // Configuration
  const DEFAULT_CONFIG = {
    position: 'bottom-right',
    theme: 'auto',
    primaryColor: '#3cacae',
    apiKey: '{{SENSAY_API_KEY}}', 
    userId: '',
    replicaUuid: '',
    apiVersion: '2025-03-25'
  };

  // Widget state
  let isOpen = false;
  let config = { ...DEFAULT_CONFIG };
  let messages = [];
  let isTyping = false;

  // Create widget HTML
  function createWidgetHTML() {
    const widgetHTML = `
      <div id="real-estate-chat-widget" style="display: none;">
        <!-- Chat Button -->
        <div id="chat-button" class="chat-widget-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z" fill="currentColor"/>
          </svg>
          <span class="chat-button-text">Chat with AI</span>
        </div>

        <!-- Chat Window -->
        <div id="chat-window" class="chat-widget-window">
          <!-- Header -->
          <div class="chat-header">
            <div class="chat-header-content">
              <div class="chat-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="chat-title">
                <h3>Real Estate AI</h3>
                <p>Ask me anything about real estate</p>
              </div>
            </div>
            <button id="close-chat" class="chat-close-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- Messages -->
          <div id="chat-messages" class="chat-messages">
            <div class="chat-message assistant">
              <div class="message-content">
                <p>Hello! I'm your AI real estate assistant. How can I help you today?</p>
              </div>
            </div>
          </div>

          <!-- Input -->
          <div class="chat-input-container">
            <form id="chat-form" class="chat-form">
              <input 
                type="text" 
                id="chat-input" 
                class="chat-input" 
                placeholder="Ask about real estate..."
                autocomplete="off"
              />
              <button type="submit" id="chat-send" class="chat-send-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    `;

    return widgetHTML;
  }

  // Create widget styles
  function createWidgetStyles() {
    const styles = `
      <style id="real-estate-chat-styles">
        #real-estate-chat-widget {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          position: fixed;
          z-index: 999999;
          font-size: 14px;
          line-height: 1.4;
        }

        .chat-widget-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: ${config.primaryColor};
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          transition: all 0.3s ease;
          color: white;
          z-index: 999998;
        }

        .chat-widget-button:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }

        .chat-button-text {
          position: absolute;
          right: 70px;
          background: #333;
          color: white;
          padding: 8px 12px;
          border-radius: 6px;
          white-space: nowrap;
          opacity: 0;
          transform: translateX(10px);
          transition: all 0.3s ease;
          pointer-events: none;
        }

        .chat-widget-button:hover .chat-button-text {
          opacity: 1;
          transform: translateX(0);
        }

        .chat-widget-window {
          position: fixed;
          bottom: 90px;
          right: 20px;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0,0,0,0.15);
          display: flex;
          flex-direction: column;
          overflow: hidden;
          opacity: 0;
          transform: translateY(20px) scale(0.9);
          transition: all 0.3s ease;
        }

        .chat-widget-window.open {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .chat-header {
          background: ${config.primaryColor};
          color: white;
          padding: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .chat-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-avatar {
          width: 40px;
          height: 40px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-title h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }

        .chat-title p {
          margin: 4px 0 0 0;
          font-size: 12px;
          opacity: 0.9;
        }

        .chat-close-btn {
          background: none;
          border: none;
          color: white;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.2s ease;
        }

        .chat-close-btn:hover {
          background: rgba(255,255,255,0.1);
        }

        .chat-messages {
          flex: 1;
          padding: 16px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .chat-message {
          display: flex;
          gap: 8px;
        }

        .chat-message.user {
          justify-content: flex-end;
        }

        .chat-message.assistant {
          justify-content: flex-start;
        }

        .message-content {
          max-width: 80%;
          padding: 12px 16px;
          border-radius: 18px;
          background: #f1f5f9;
          color: #333;
        }

        .chat-message.user .message-content {
          background: ${config.primaryColor};
          color: white;
        }

        .message-content p {
          margin: 0;
          word-wrap: break-word;
        }

        .chat-input-container {
          padding: 16px;
          border-top: 1px solid #e2e8f0;
        }

        .chat-form {
          display: flex;
          gap: 8px;
        }

        .chat-input {
          flex: 1;
          padding: 12px 16px;
          border: 1px solid #e2e8f0;
          border-radius: 24px;
          outline: none;
          font-size: 14px;
          transition: border-color 0.2s ease;
        }

        .chat-input:focus {
          border-color: ${config.primaryColor};
        }

        .chat-send-btn {
          width: 44px;
          height: 44px;
          background: ${config.primaryColor};
          border: none;
          border-radius: 50%;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
        }

        .chat-send-btn:hover {
          transform: scale(1.05);
        }

        .chat-send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .typing-indicator {
          display: flex;
          flex-direction: row;
          gap: 4px;
          padding: 12px 16px;
        }

        .typing-indicator .message-content {
          display: flex;
          flex-direction: row;
          gap: 4px;
          align-items: center;
        }

        .typing-dot {
          width: 8px;
          height: 8px;
          background: #9ca3af;
          border-radius: 50%;
          animation: typing 1.4s infinite ease-in-out;
        }

        .typing-dot:nth-child(1) { animation-delay: -0.32s; }
        .typing-dot:nth-child(2) { animation-delay: -0.16s; }

        @keyframes typing {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1); opacity: 1; }
        }

        /* Position variants */
        .chat-widget-window.bottom-left {
          bottom: 90px;
          left: 20px;
          right: auto;
        }

        .chat-widget-window.top-right {
          top: 20px;
          bottom: auto;
          right: 20px;
        }

        .chat-widget-window.top-left {
          top: 20px;
          bottom: auto;
          left: 20px;
          right: auto;
        }

        .chat-widget-button.bottom-left {
          bottom: 20px;
          left: 20px;
          right: auto;
        }

        .chat-widget-button.top-right {
          top: 20px;
          bottom: auto;
          right: 20px;
        }

        .chat-widget-button.top-left {
          top: 20px;
          bottom: auto;
          left: 20px;
          right: auto;
        }

        /* Dark theme */
        .chat-widget-window.dark {
          background: #1f2937;
          color: white;
        }

        .chat-widget-window.dark .message-content {
          background: #374151;
          color: #f9fafb;
        }

        .chat-widget-window.dark .chat-input {
          background: #374151;
          border-color: #4b5563;
          color: white;
        }

        .chat-widget-window.dark .chat-input-container {
          border-top-color: #4b5563;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .chat-widget-window {
            width: calc(100vw - 40px);
            height: calc(100vh - 120px);
            bottom: 80px;
            right: 20px;
            left: 20px;
          }
        }
      </style>
    `;

    return styles;
  }

  // Add message to chat
  function addMessage(content, type = 'assistant') {
    const messagesContainer = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}`;
    
    messageDiv.innerHTML = `
      <div class="message-content">
        <p>${content}</p>
      </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // Store message
    messages.push({ content, type, timestamp: new Date() });
  }

  // Show typing indicator
  function showTyping() {
    const messagesContainer = document.getElementById('chat-messages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message assistant typing-indicator';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
      <div class="message-content">
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
        <div class="typing-dot"></div>
      </div>
    `;
    
    messagesContainer.appendChild(typingDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  // Hide typing indicator
  function hideTyping() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) {
      typingIndicator.remove();
    }
  }

  // Send message to Sensay API
  async function sendMessageToAPI(content) {
    // If in demo mode, return simulated responses
    if (config.demoMode) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Return simulated responses based on user input
      const responses = [
        "I understand you're interested in real estate! In demo mode, I can show you how the chat interface works.",
        "That's a great question about properties! This is a preview of our AI assistant capabilities.",
        "I'd love to help you find the perfect property. Once API credentials are configured, I'll provide real-time assistance.",
        "Excellent question! Our AI analyzes thousands of properties to find exactly what you're looking for.",
        "I'm here to help with all your real estate needs. This demo shows the chat interface functionality."
      ];
      
      // Return a random response
      return responses[Math.floor(Math.random() * responses.length)];
    }
    
    try {
      const response = await fetch(`https://api.sensay.io/v1/replicas/${config.replicaUuid}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ORGANIZATION-SECRET': config.apiKey,
          'X-USER-ID': config.userId,
          'X-API-Version': config.apiVersion
        },
        body: JSON.stringify({
          content: content,
          source: 'web',
          skip_chat_history: false
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.content || 'I apologize, but I couldn\'t process your request.';
    } catch (error) {
      console.error('Error sending message:', error);
      return 'Sorry, I encountered an error. Please try again.';
    }
  }

  // Handle form submission
  function handleSubmit(event) {
    event.preventDefault();
    
    const input = document.getElementById('chat-input');
    const content = input.value.trim();
    
    if (!content) return;
    
    // Add user message
    addMessage(content, 'user');
    input.value = '';
    
    // Show typing indicator
    showTyping();
    
    // Send to API
    sendMessageToAPI(content).then(response => {
      hideTyping();
      addMessage(response, 'assistant');
    });
  }

  // Toggle chat window
  function toggleChat() {
    const chatWindow = document.getElementById('chat-window');
    const chatButton = document.getElementById('chat-button');
    
    if (isOpen) {
      chatWindow.classList.remove('open');
      chatButton.style.display = 'flex';
    } else {
      chatWindow.classList.add('open');
      chatButton.style.display = 'none';
    }
    
    isOpen = !isOpen;
  }

  // Initialize widget
  function init(userConfig = {}) {
    // Merge config
    config = { ...DEFAULT_CONFIG, ...userConfig };
    
    // Check if API configuration is available
    const hasApiConfig = config.apiKey && config.userId && config.replicaUuid;
    
    if (!hasApiConfig) {
      console.log('Real Estate Chat Widget: API configuration not available, running in demo mode');
      // Set demo mode flag
      config.demoMode = true;
    }
    
    // Add styles to head
    document.head.insertAdjacentHTML('beforeend', createWidgetStyles());
    
    // Add widget to body
    document.body.insertAdjacentHTML('beforeend', createWidgetHTML());
    
    // Position elements
    const chatButton = document.getElementById('chat-button');
    const chatWindow = document.getElementById('chat-window');
    
    // Apply position classes
    chatButton.classList.add(config.position);
    chatWindow.classList.add(config.position);
    
    // Apply theme
    if (config.theme === 'dark' || (config.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      chatWindow.classList.add('dark');
    }
    
    // Apply primary color
    document.documentElement.style.setProperty('--primary-color', config.primaryColor);
    
    // Show widget
    document.getElementById('real-estate-chat-widget').style.display = 'block';
    
    // Add event listeners
    document.getElementById('chat-button').addEventListener('click', toggleChat);
    document.getElementById('close-chat').addEventListener('click', toggleChat);
    document.getElementById('chat-form').addEventListener('submit', handleSubmit);
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen) {
        toggleChat();
      }
    });
    
    // Show demo mode message if no API config
    if (config.demoMode) {
      addMessage('⚠️ Demo Mode: API connection not configured. This is a preview of the chat interface.', 'assistant');
      addMessage('To enable full functionality, please configure your Sensay API credentials.', 'assistant');
    }
    
    console.log('Real Estate Chat Widget initialized successfully');
  }

  // Public API
  window.RealEstateChat = {
    init: init,
    toggle: toggleChat,
    addMessage: addMessage,
    config: config
  };

})();
