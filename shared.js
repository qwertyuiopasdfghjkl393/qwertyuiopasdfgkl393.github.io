// Notification System Database
const NotificationSystem = {
  // Initialize with sample data
  init: function() {
    if (!localStorage.getItem('notificationUsers')) {
      const users = {
        'user1': { id: 'user1', name: 'John Doe', notifications: [] },
        'user2': { id: 'user2', name: 'Jane Smith', notifications: [] },
        'user3': { id: 'user3', name: 'Bob Johnson', notifications: [] }
      };
      localStorage.setItem('notificationUsers', JSON.stringify(users));
    }
    
    if (!localStorage.getItem('notificationAdmins')) {
      const admins = {
        'admin1': { id: 'admin1', name: 'Customer Care' }
      };
      localStorage.setItem('notificationAdmins', JSON.stringify(admins));
    }
  },
  
  // Get all users
  getUsers: function() {
    return JSON.parse(localStorage.getItem('notificationUsers'));
  },
  
  // Get a specific user
  getUser: function(userId) {
    const users = this.getUsers();
    return users[userId];
  },
  
  // Get user notifications
  getUserNotifications: function(userId) {
    const user = this.getUser(userId);
    return user ? user.notifications : [];
  },
  
  // Add a new notification
  addNotification: function(recipientId, senderId, title, message) {
    const users = this.getUsers();
    const admins = JSON.parse(localStorage.getItem('notificationAdmins'));
    const sender = admins[senderId] || { name: 'System' };
    
    const notification = {
      id: Date.now().toString(),
      sender: sender.name,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false
    };
    
    if (recipientId === 'all') {
      // Send to all users
      Object.keys(users).forEach(userId => {
        users[userId].notifications.unshift(notification);
      });
    } else {
      // Send to specific user
      users[recipientId].notifications.unshift(notification);
    }
    
    localStorage.setItem('notificationUsers', JSON.stringify(users));
    
    // Trigger event for real-time update
    if (typeof Event === 'function') {
      const event = new Event('newNotification');
      window.dispatchEvent(event);
    }
    
    return notification;
  },
  
  // Mark notification as read
  markAsRead: function(userId, notificationId) {
    const users = this.getUsers();
    const user = users[userId];
    
    if (user) {
      const notification = user.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        localStorage.setItem('notificationUsers', JSON.stringify(users));
      }
    }
  },
  
  // Clear all notifications for user
  clearNotifications: function(userId) {
    const users = this.getUsers();
    if (users[userId]) {
      users[userId].notifications = [];
      localStorage.setItem('notificationUsers', JSON.stringify(users));
    }
  }
};

// Initialize the database
NotificationSystem.init();

// Helper functions
function formatTime(timestamp) {
  const now = new Date();
  const date = new Date(timestamp);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return date.toLocaleDateString();
}

function showDesktopNotification(title, message) {
  if (Notification.permission === 'granted') {
    new Notification(title, { body: message });
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, { body: message });
      }
    });
  }
}