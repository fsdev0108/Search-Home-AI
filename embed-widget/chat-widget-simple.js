// Simplified Real Estate Chat Widget for testing
(function() {
  'use strict';

  // Widget configuration
  let config = {
    apiKey: '',
    userId: '',
    replicaUuid: '',
    position: 'bottom-right',
    theme: 'auto',
    primaryColor: '#3cacae'
  };

  // Widget state
  let isOpen = false;
  let isInitialized = false;

  // Create widget HTML
  function createWidgetHTML() {
    const widgetHTML = `
      <div id="real-estate-chat-widget" style="display: none; position: fixed; z-index: 9999; ${config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'bottom: 20px; left: 20px;'}">
        <div style="width: 350px; background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0,0,0,0.2); border: 1px solid #e5e7eb;">
          <!-- Header -->
          <div style="background: ${config.primaryColor}; color: white; padding: 16px; border-radius: 12px 12px 0 0; display: flex; justify-content: space-between; align-items: center;">
            <div style="display: flex; align-items: center; gap: 12px;">
              <div style="width: 32px; height: 32px; background: rgba(255,255,255,0.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px;">
                🏠
              </div>
              <div>
                <div style="font-weight: 600; font-size: 16px;">Real Estate AI</div>
                <div style="font-size: 12px; opacity: 0.9;">AI Assistant</div>
              </div>
            </div>
            <button id="widget-close-btn" style="background: none; border: none; color: white; cursor: pointer; padding: 4px; border-radius: 4px;">
              ✕
            </button>
          </div>
          
          <!-- Chat Area -->
          <div id="widget-chat-area" style="height: 400px; padding: 16px; overflow-y: auto;">
            <!-- Welcome Message -->
            <div style="background: #f3f4f6; padding: 12px; border-radius: 8px; margin-bottom: 16px;">
              <div style="font-weight: 500; margin-bottom: 4px;">👋 Welcome!</div>
              <div style="font-size: 14px; color: #6b7280;">
                I'm your AI real estate assistant. How can I help you find your perfect property?
              </div>
            </div>
            
            <!-- Sample Messages -->
            <div style="margin-bottom: 12px;">
              <div style="text-align: right; margin-bottom: 8px;">
                <div style="background: ${config.primaryColor}; color: white; padding: 8px 12px; border-radius: 12px; display: inline-block; max-width: 80%; font-size: 14px;">
                  I'm looking for a 3-bedroom apartment in downtown
                </div>
              </div>
              <div style="text-align: left; margin-bottom: 8px;">
                <div style="background: #f3f4f6; padding: 8px 12px; border-radius: 12px; display: inline-block; max-width: 80%; font-size: 14px;">
                  Great! I can help you find the perfect 3-bedroom apartment. What's your budget range and preferred area in downtown?
                </div>
              </div>
            </div>
          </div>
          
          <!-- Input Area -->
          <div style="padding: 16px; border-top: 1px solid #e5e7eb;">
            <div style="display: flex; gap: 8px;">
              <input 
                id="widget-input" 
                type="text" 
                placeholder="Ask about properties..." 
                style="flex: 1; padding: 10px 12px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none;"
              >
              <button 
                id="widget-send-btn" 
                style="background: ${config.primaryColor}; color: white; border: none; padding: 10px 16px; border-radius: 8px; cursor: pointer; font-size: 14px;"
              >
                Send
              </button>
            </div>
            <div style="font-size: 11px; color: #9ca3af; margin-top: 8px; text-align: center;">
              Powered by Real Estate AI Widget
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', widgetHTML);
  }

  // Create chat button
  function createChatButton() {
    const buttonHTML = `
      <div id="real-estate-chat-button" style="position: fixed; z-index: 9998; ${config.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : 'bottom: 20px; left: 20px;'}">
        <button 
          id="widget-toggle-btn" 
          style="width: 60px; height: 60px; background: ${config.primaryColor}; color: white; border: none; border-radius: 50%; cursor: pointer; box-shadow: 0 4px 20px rgba(0,0,0,0.2); font-size: 24px;"
        >
          💬
        </button>
      </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', buttonHTML);
  }

  // Event handlers
  function setupEventHandlers() {
    // Toggle button
    document.getElementById('widget-toggle-btn').addEventListener('click', function() {
      if (!isOpen) {
        open();
      } else {
        close();
      }
    });

    // Close button
    document.getElementById('widget-close-btn').addEventListener('click', close);

    // Send button
    document.getElementById('widget-send-btn').addEventListener('click', handleSend);

    // Enter key in input
    document.getElementById('widget-input').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        handleSend();
      }
    });
  }

  // Handle send message
  function handleSend() {
    const input = document.getElementById('widget-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, 'user');
    input.value = '';
    
    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "I understand you're looking for properties. Let me search our database for you.",
        "Great question! I can help you find properties that match your criteria.",
        "I'm analyzing the market data to find the best options for you.",
        "Based on your requirements, I found several properties that might interest you.",
        "Let me check our latest listings and get back to you with personalized recommendations."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      addMessage(randomResponse, 'assistant');
    }, 1000);
  }

  // Add message to chat
  function addMessage(content, type) {
    const chatArea = document.getElementById('widget-chat-area');
    const messageDiv = document.createElement('div');
    messageDiv.style.marginBottom = '12px';
    
    if (type === 'user') {
      messageDiv.style.textAlign = 'right';
      messageDiv.innerHTML = `
        <div style="background: ${config.primaryColor}; color: white; padding: 8px 12px; border-radius: 12px; display: inline-block; max-width: 80%; font-size: 14px;">
          ${content}
        </div>
      `;
    } else {
      messageDiv.style.textAlign = 'left';
      messageDiv.innerHTML = `
        <div style="background: #f3f4f6; padding: 8px 12px; border-radius: 12px; display: inline-block; max-width: 80%; font-size: 14px;">
          ${content}
        </div>
      `;
    }
    
    chatArea.appendChild(messageDiv);
    chatArea.scrollTop = chatArea.scrollHeight;
  }

  // Open widget
  function open() {
    if (!isInitialized) {
      console.log('Widget not initialized yet');
      return;
    }
    
    document.getElementById('real-estate-chat-widget').style.display = 'block';
    document.getElementById('real-estate-chat-button').style.display = 'none';
    isOpen = true;
    
    // Focus input
    setTimeout(() => {
      document.getElementById('widget-input').focus();
    }, 100);
  }

  // Close widget
  function close() {
    document.getElementById('real-estate-chat-widget').style.display = 'none';
    document.getElementById('real-estate-chat-button').style.display = 'block';
    isOpen = false;
  }

  // Initialize widget
  function init(options) {
    // Merge options with defaults
    config = { ...config, ...options };
    
    // Create HTML elements
    createWidgetHTML();
    createChatButton();
    
    // Setup event handlers
    setupEventHandlers();
    
    // Mark as initialized
    isInitialized = true;
    
    console.log('Real Estate Chat Widget initialized successfully');
    console.log('Config:', config);
  }

  // Public API
  window.RealEstateChat = {
    init: init,
    open: open,
    close: close,
    config: config,
    isOpen: function() { return isOpen; },
    isInitialized: function() { return isInitialized; }
  };

  console.log('Real Estate Chat Widget loaded successfully');
})();
