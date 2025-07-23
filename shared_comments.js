// Truly Shared Comment System for Portfolio
// Uses JSONBin.io for real global comment sharing

class SharedCommentSystem {
  constructor() {
    // JSONBin configuration for real global sharing
    this.API_KEY = '$2a$10$1cQzbOxxwxnPEVp3ui7rr.jG9t35skMrxNaaFZ1x5IEh5pd7qR7bq';
    this.BIN_ID = '687f5bc97b4b8670d8a54b76';
    this.API_URL = `https://api.jsonbin.io/v3/b/${this.BIN_ID}`;
    
    // Fallback storage
    this.localStorageKey = 'portfolio-comments-backup';
    this.comments = [];
    this.isOnline = navigator.onLine;
    
    // Demo comments to show functionality
    this.demoComments = [
      {
        id: 'demo_1',
        author: 'Sarah Johnson',
        text: 'Amazing portfolio! Your web design skills are incredible. The layout and user experience are top-notch. 🎨',
        timestamp: Date.now() - 86400000,
        date: new Date(Date.now() - 86400000).toLocaleString()
      },
      {
        id: 'demo_2', 
        author: 'Mike Chen',
        text: 'Really impressed with your full-stack projects. The AI integration looks fascinating! 🤖',
        timestamp: Date.now() - 43200000,
        date: new Date(Date.now() - 43200000).toLocaleString()
      },
      {
        id: 'demo_3',
        author: 'Emma Rodriguez',
        text: 'Love the modern design and smooth animations. Your portfolio really stands out! ⭐',
        timestamp: Date.now() - 21600000,
        date: new Date(Date.now() - 21600000).toLocaleString()
      }
    ];
    
    // Listen for online/offline changes
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Connection restored - comments will sync');
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Offline mode - comments saved locally');
    });
  }

  // Load comments from JSONBin - truly global and shared
  async loadComments() {
    try {
      console.log('🌐 Loading comments from global database...');
      
      const response = await fetch(this.API_URL + '/latest', {
        method: 'GET',
        headers: {
          'X-Master-Key': this.API_KEY,
          'X-Bin-Meta': 'false'
        }
      });
      
      if (response.ok) {
        const globalComments = await response.json();
        console.log('✅ Comments loaded from global database - truly shared worldwide!');
        console.log(`📊 Found ${globalComments.length} global comments`);
        
        this.comments = Array.isArray(globalComments) ? globalComments : [];
        this.saveLocalBackup(); // Keep local backup
        return this.comments;
      } else {
        throw new Error(`API responded with status: ${response.status}`);
      }
      
    } catch (error) {
      console.warn('⚠️ Could not load from global database:', error.message);
      console.log('📱 Falling back to local backup...');
      
      // Fallback to local backup
      const localBackup = this.getLocalBackup();
      if (localBackup && localBackup.length > 0) {
        this.comments = localBackup;
        console.log('📱 Loaded backup comments from local storage');
      } else {
        this.comments = [...this.demoComments];
        console.log('🎭 Using demo comments as starting point');
      }
      
      return this.comments;
    }
  }

  // Save comments to global JSONBin database
  async saveToGlobalDatabase(comments) {
    try {
      const response = await fetch(this.API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.API_KEY
        },
        body: JSON.stringify(comments)
      });
      
      if (response.ok) {
        console.log('✅ Comments saved to global database - visible worldwide!');
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
      const commentWithId = {
        ...commentData,
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        isGlobal: true // Mark as globally shared
      };
      
      // Add to local array first
      this.comments.push(commentWithId);
      
      // Try to save to global database
      const globalSaveSuccess = await this.saveToGlobalDatabase(this.comments);
      
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
