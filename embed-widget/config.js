/**
 * Real Estate AI Chat Widget Configuration
 * 
 * This file contains default configuration values for the widget.
 * These can be overridden when calling RealEstateChat.init()
 */

export const WIDGET_CONFIG = {
  // API Configuration
  API_VERSION: '2025-03-25',
  API_BASE_URL: 'https://api.sensay.io',
  
  // Default Widget Settings
  DEFAULT_POSITION: 'bottom-right',
  DEFAULT_THEME: 'auto',
  DEFAULT_PRIMARY_COLOR: '#3cacae',
  
  // Widget Dimensions
  DESKTOP_WIDTH: '350px',
  DESKTOP_HEIGHT: '500px',
  MOBILE_BREAKPOINT: 480,
  
  // Animation Settings
  ANIMATION_DURATION: 300,
  HOVER_SCALE: 1.1,
  BUTTON_SIZE: '60px',
  
  // Z-Index Values
  WIDGET_Z_INDEX: 999999,
  BUTTON_Z_INDEX: 999998,
  
  // Message Settings
  MAX_MESSAGE_WIDTH: '80%',
  TYPING_ANIMATION_DURATION: 1400,
  
  // Error Messages
  ERROR_MESSAGES: {
    MISSING_CONFIG: 'Real Estate Chat Widget: Missing required configuration (apiKey, userId, replicaUuid)',
    AUTH_FAILED: 'Authentication failed. Please check your API key.',
    REPLICA_NOT_FOUND: 'Replica not found. Please check your configuration.',
    RATE_LIMIT: 'Rate limit exceeded. Please wait a moment.',
    NETWORK_ERROR: 'Network error. Please check your connection.',
    GENERIC_ERROR: 'An error occurred. Please try again.'
  },
  
  // Success Messages
  SUCCESS_MESSAGES: {
    INITIALIZED: 'Real Estate Chat Widget initialized successfully',
    MESSAGE_SENT: 'Message sent successfully',
    CONFIG_SAVED: 'Configuration saved successfully'
  }
};

// Position options for the widget
export const POSITION_OPTIONS = {
  'bottom-right': {
    button: { bottom: '20px', right: '20px' },
    window: { bottom: '90px', right: '20px' }
  },
  'bottom-left': {
    button: { bottom: '20px', left: '20px' },
    window: { bottom: '90px', left: '20px' }
  },
  'top-right': {
    button: { top: '20px', right: '20px' },
    window: { top: '20px', right: '20px' }
  },
  'top-left': {
    button: { top: '20px', left: '20px' },
    window: { top: '20px', left: '20px' }
  }
};

// Theme configurations
export const THEME_CONFIG = {
  light: {
    background: '#ffffff',
    foreground: '#171717',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    muted: '#f8fafc',
    mutedForeground: '#64748b',
    border: '#e2e8f0',
    input: '#ffffff',
    card: '#ffffff',
    cardForeground: '#0f172a'
  },
  dark: {
    background: '#1f2937',
    foreground: '#f9fafb',
    secondary: '#374151',
    secondaryForeground: '#f9fafb',
    muted: '#374151',
    mutedForeground: '#9ca3af',
    border: '#4b5563',
    input: '#374151',
    card: '#1f2937',
    cardForeground: '#f9fafb'
  }
};

// Default system message for the AI
export const DEFAULT_SYSTEM_MESSAGE = 
  "You are a helpful AI real estate assistant. You help users find properties, answer questions about real estate, and provide guidance on buying, selling, or renting properties. Be friendly, knowledgeable, and always provide accurate information.";

// Validation rules for configuration
export const VALIDATION_RULES = {
  apiKey: {
    required: true,
    type: 'string',
    minLength: 10,
    pattern: /^sk_[a-zA-Z0-9]+$/
  },
  userId: {
    required: true,
    type: 'string',
    minLength: 1
  },
  replicaUuid: {
    required: true,
    type: 'string',
    minLength: 36,
    pattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  },
  position: {
    required: false,
    type: 'string',
    enum: Object.keys(POSITION_OPTIONS)
  },
  theme: {
    required: false,
    type: 'string',
    enum: ['light', 'dark', 'auto']
  },
  primaryColor: {
    required: false,
    type: 'string',
    pattern: /^#[0-9A-F]{6}$/i
  }
};
