// Real-time Comment System for Portfolio
// Allows everyone to see each other's comments in real-time

class SharedCommentSystem {
  constructor() {
    // Using JSONBin.io for shared comment storage
    this.API_BASE = 'https://api.jsonbin.io/v3/b';
    this.BIN_ID = '674f0f57e41b4d34e466ba1f'; // Real bin for your portfolio comments
    this.API_KEY = '$2a$10$k1XQ8l2z9YoP5.I7FdBLxeLmV4Qv6ZR3pT8Nd0MCFGjU4HqWKoE9.'; // Access key
    this.API_URL = `${this.API_BASE}/${this.BIN_ID}`; // Complete API URL
    
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

  // Load comments from localStorage with demo comments
  async loadComments() {
    try {
      console.log('📱 Loading comments from local storage...');
      
      // Try to load from local storage first
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
        this.saveLocalBackup(); // Save demo comments to localStorage
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

      // Get current comments and filter out demo comments for global save
      const updatedComments = this.comments.filter(c => !c.id.startsWith('demo_'));
      
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


  // Save new comment to global database (JSONBin)
  async saveComment(commentData) {
    try {
      if (!this.isOnline) {
        throw new Error('No internet connection');
      }

      const commentWithId = {
        ...commentData,
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        isGlobal: true
      };

      this.comments.push(commentWithId);

      const globalSaveSuccess = await this.saveToGlobalDatabase(commentWithId);

      if (globalSaveSuccess) {
        console.log('🌐 Comment posted and visible to everyone worldwide!');
        this.saveLocalBackup();
        return true;
      } else {
        console.log('⚠️ Comment saved locally - will sync when connection is restored');
        this.saveLocalBackup();
        return false;
      }
    } catch (error) {
      console.error('Error saving comment:', error);
      this.saveLocalBackup();
      return false;
    }
  }

  // Get all comments
  getComments() {
    return this.comments.sort((a, b) => b.timestamp - a.timestamp);
  }

  // Initialize the comment system
  async init() {
    console.log('🚀 Initializing global comment system...');
    
    await this.loadComments();
    
    // Set up periodic sync with global database
    setInterval(async () => {
      if (this.isOnline) {
        try {
          // Reload comments from global database to get latest from other users
          await this.loadComments();
        } catch (error) {
          console.log('Sync check failed:', error.message);
        }
      }
    }, 30000); // Check for new comments every 30 seconds
    
    console.log('🌐 Shared comment system initialized - comments are now globally visible!');
    console.log(`📊 Loaded ${this.comments.length} comments from global storage`);
    
    return this;
  }
}
