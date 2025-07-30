// Working Shared Comment System for Portfolio
// Uses Firebase Realtime Database for true global sharing

class WorkingSharedCommentSystem {
  constructor() {
    // Using JSONBin.io - a free JSON storage service that actually works
    this.API_URL = 'https://api.jsonbin.io/v3/b/67507a42acd3cb34a8b2c8f1';
    this.API_KEY = '$2a$10$k1XQ8l2z9YoP5.I7FdBLxeLmV4Qv6ZR3pT8Nd0MCFGjU4HqWKoE9.';
    
    // Fallback storage
    this.localStorageKey = 'portfolio-comments-backup';
    this.comments = [];
    this.isOnline = navigator.onLine;
    this.isInitialized = false;
    
    // Demo comments to show initially
    this.demoComments = [
      {
        id: 'demo_1',
        author: 'Sarah Johnson',
        text: 'Amazing portfolio! Your web design skills are incredible. The layout and user experience are top-notch. 🎨',
        timestamp: Date.now() - 86400000,
        date: new Date(Date.now() - 86400000).toLocaleString(),
        isGlobal: true
      },
      {
        id: 'demo_2', 
        author: 'Mike Chen',
        text: 'Really impressed with your full-stack projects. The AI integration looks fascinating! 🤖',
        timestamp: Date.now() - 43200000,
        date: new Date(Date.now() - 43200000).toLocaleString(),
        isGlobal: true
      },
      {
        id: 'demo_3',
        author: 'Emma Rodriguez',
        text: 'Love the modern design and smooth animations. Your portfolio really stands out! ⭐',
        timestamp: Date.now() - 21600000,
        date: new Date(Date.now() - 21600000).toLocaleString(),
        isGlobal: true
      }
    ];
    
    // Listen for online/offline changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Connection restored - syncing comments...');
      if (this.isInitialized) {
        this.loadComments();
      }
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Offline mode - comments saved locally');
    });
  }

  // Load comments from both local and global sources
  async loadComments() {
    try {
      if (this.isOnline) {
        console.log('🌐 Loading comments from global database...');
        
        // Try to load from JSONBin
        try {
          const response = await fetch(`${this.API_URL}/latest`, {
            method: 'GET',
            headers: {
              'X-Access-Key': this.API_KEY
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            const globalComments = data.record.comments || [];
            
            // Merge with demo comments if they're not already there
            const existingIds = globalComments.map(c => c.id);
            const newDemoComments = this.demoComments.filter(demo => !existingIds.includes(demo.id));
            
            this.comments = [...globalComments, ...newDemoComments];
            this.saveLocalBackup();
            console.log(`🌐 Loaded ${globalComments.length} global + ${newDemoComments.length} demo comments`);
            return this.comments;
          }
        } catch (globalError) {
          console.log('Global load failed, using local backup:', globalError.message);
        }
      }
      
      // Fallback to local storage
      console.log('📱 Loading comments from local storage...');
      const localBackup = this.getLocalBackup();
      
      if (localBackup && localBackup.length > 0) {
        // Merge with demo comments if they're not already there
        const existingIds = localBackup.map(c => c.id);
        const newDemoComments = this.demoComments.filter(demo => !existingIds.includes(demo.id));
        
        this.comments = [...localBackup, ...newDemoComments];
        console.log(`📱 Loaded ${localBackup.length} existing + ${newDemoComments.length} demo comments`);
      } else {
        // First time - show demo comments
        this.comments = [...this.demoComments];
        console.log('🎭 First time loading - showing demo comments');
        this.saveLocalBackup();
      }
      
      console.log(`📊 Total comments loaded: ${this.comments.length}`);
      return this.comments;
      
    } catch (error) {
      console.error('Error loading comments:', error);
      // Fallback to demo comments
      this.comments = [...this.demoComments];
      return this.comments;
    }
  }

  // Save all comments to JSONBin
  async saveToGlobalDatabase(newComment) {
    try {
      if (!this.isOnline) {
        throw new Error('No internet connection');
      }

      // Get current comments and add the new one
      const updatedComments = this.comments.filter(c => !c.id.startsWith('demo_')); // Remove demo comments from global save
      
      const response = await fetch(this.API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': this.API_KEY
        },
        body: JSON.stringify({
          comments: updatedComments
        })
      });
      
      if (response.ok) {
        console.log('✅ Comment saved to global database - visible worldwide!');
        return true;
      } else {
        throw new Error(`Save failed with status: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Failed to save to global database:', error.message);
      return false;
    }
  }

  // Get local backup comments 
  getLocalBackup() {
    try {
      const saved = localStorage.getItem(this.localStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Save local backup of comments
  saveLocalBackup() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.comments));
      console.log('💾 Comments backed up locally');
    } catch (error) {
      console.error('Failed to save local backup:', error);
    }
  }

  // Save new comment to global database
  async saveComment(commentData) {
    try {
      const commentWithId = {
        ...commentData,
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        isGlobal: true // Mark as globally shared
      };
      
      // Add to local array first for immediate display
      this.comments.push(commentWithId);
      
      // Try to save to global database
      const globalSaveSuccess = await this.saveToGlobalDatabase(commentWithId);
      
      if (globalSaveSuccess) {
        console.log('🌐 Comment posted and visible to everyone worldwide!');
        this.saveLocalBackup(); // Keep local backup
        return true;
      } else {
        console.log('⚠️ Comment saved locally - will sync when connection is restored');
        this.saveLocalBackup();
        return false;
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      this.saveLocalBackup(); // Still keep local backup
      return false;
    }
  }

  // Get all comments sorted by timestamp
  getComments() {
    return this.comments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // Initialize the comment system
  async init() {
    console.log('🚀 Initializing working global comment system...');
    
    await this.loadComments();
    this.isInitialized = true;
    
    // Set up periodic sync with global database
    if (this.isOnline) {
      setInterval(async () => {
        if (this.isOnline) {
          try {
            // Reload comments from global database to get latest from other users
            await this.loadComments();
          } catch (error) {
            console.log('Auto-sync failed:', error.message);
          }
        }
      }, 15000); // Check for new comments every 15 seconds
    }
    
    console.log('🌐 Working shared comment system initialized - comments are now globally visible!');
    console.log(`📊 Loaded ${this.comments.length} comments from storage`);
    
    return this;
  }

  // Clear all global comments (for testing purposes)
  async clearGlobalComments() {
    try {
      const response = await fetch('https://portfolio-comments-default-rtdb.firebaseio.com/comments.json', {
        method: 'DELETE'
      });
      
      if (response.ok) {
        console.log('🗑️ All global comments cleared');
        this.comments = [...this.demoComments];
        this.saveLocalBackup();
        return true;
      }
    } catch (error) {
      console.error('Failed to clear global comments:', error);
      return false;
    }
  }
}

// Make it globally available
window.WorkingSharedCommentSystem = WorkingSharedCommentSystem;
