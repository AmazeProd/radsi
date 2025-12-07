// Performance optimization configuration
export const PERFORMANCE_CONFIG = {
  // API configuration
  API_TIMEOUT: 15000, // 15 seconds
  REQUEST_DEBOUNCE: 300, // milliseconds
  
  // Image optimization
  IMAGE_LAZY_LOAD: true,
  IMAGE_QUALITY: 80,
  
  // Pagination
  POSTS_PER_PAGE: 10,
  MESSAGES_PER_PAGE: 20,
  NOTIFICATIONS_PER_PAGE: 15,
  
  // Caching
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
  
  // Socket.io
  SOCKET_RECONNECT_ATTEMPTS: 3,
  SOCKET_RECONNECT_DELAY: 1000,
  
  // React optimization
  MEMO_ENABLED: true,
  VIRTUALIZATION_THRESHOLD: 50, // Enable virtualization for lists > 50 items
};

export default PERFORMANCE_CONFIG;
