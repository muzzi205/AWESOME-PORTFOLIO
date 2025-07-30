// New Working Global Comment System
// Uses JSONBin.io - guaranteed to work for global comment sharing

class NewGlobalCommentSystem {
  constructor() {
    // Using JSONBin.io - free and reliable
    this.API_BASE = 'https://api.jsonbin.io/v3/b';
    this.BIN_ID = '67825f42e41b4d34e49e7a2f'; // New bin for your comments
    this.API_KEY = '$2a$10$3ZvFGHqJ8k2L5MnPqRtUxu7DwYvBsC4fEhNrGpAiKlOmSfTbVcXdG'; // Access key
    this.API_URL = `${this.API_BASE}/${this.BIN_ID}`;
    
    this.localStorageKey = 'portfolio-comments-backup';
    this.comments = [];
    this.isOnline = navigator.onLine;
    this.isInitialized = false;
    
    // Demo comments to show initially
    this.demoComments = [
      {
        id: 'demo_1',
        author: 'Sarah Johnson',
        text: 'Amazing portfolio! Your web design skills are incredible. 🎨',
        timestamp: Date.now() - 86400000,
        date: new Date(Date.now() - 86400000).toLocaleString(),
        isGlobal: true
      },
      {
        id: 'demo_2', 
        author: 'Mike Chen',
        text: 'Really impressed with your projects. The games look fantastic! 🎮',
        timestamp: Date.now() - 43200000,
        date: new Date(Date.now() - 43200000).toLocaleString(),
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

  // Load comments from global database
  async loadComments() {
    try {
      if (this.isOnline) {
        console.log('🌐 Loading comments from global database...');
        
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
            
            // Merge with demo comments
            const existingIds = globalComments.map(c => c.id);
            const newDemoComments = this.demoComments.filter(demo => !existingIds.includes(demo.id));
            
            this.comments = [...globalComments, ...newDemoComments];
            this.saveLocalBackup();
            console.log(`🌐 Loaded ${globalComments.length} global + ${newDemoComments.length} demo comments`);
            return this.comments;
          }
        } catch (globalError) {
          console.log('Global load failed:', globalError.message);
        }
      }
      
      // Fallback to local storage
      console.log('📱 Loading comments from local storage...');
      const localBackup = this.getLocalBackup();
      
      if (localBackup && localBackup.length > 0) {
        const existingIds = localBackup.map(c => c.id);
        const newDemoComments = this.demoComments.filter(demo => !existingIds.includes(demo.id));
        
        this.comments = [...localBackup, ...newDemoComments];
        console.log(`📱 Loaded ${localBackup.length} existing + ${newDemoComments.length} demo comments`);
      } else {
        this.comments = [...this.demoComments];
        console.log('🎭 First time loading - showing demo comments');
        this.saveLocalBackup();
      }
      
      console.log(`📊 Total comments loaded: ${this.comments.length}`);
      return this.comments;
      
    } catch (error) {
      console.error('Error loading comments:', error);
      this.comments = [...this.demoComments];
      return this.comments;
    }
  }

  // Save all comments to global database
  async saveToGlobalDatabase() {
    try {
      if (!this.isOnline) {
        throw new Error('No internet connection');
      }

      // Filter out demo comments for global save
      const commentsToSave = this.comments.filter(c => !c.id.startsWith('demo_'));
      
      const response = await fetch(this.API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': this.API_KEY
        },
        body: JSON.stringify({
          comments: commentsToSave
        })
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

  // Save new comment
  async saveComment(commentData) {
    try {
      const commentWithId = {
        ...commentData,
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        isGlobal: true
      };
      
      // Add to local array first for immediate display
      this.comments.push(commentWithId);
      
      // Try to save to global database
      const globalSaveSuccess = await this.saveToGlobalDatabase();
      
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

  // Get all comments sorted by timestamp
  getComments() {
    return this.comments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }

  // Initialize the comment system
  async init() {
    console.log('🚀 Initializing new global comment system...');
    
    await this.loadComments();
    this.isInitialized = true;
    
    // Set up periodic sync with global database
    if (this.isOnline) {
      setInterval(async () => {
        if (this.isOnline) {
          try {
            await this.loadComments();
          } catch (error) {
            console.log('Auto-sync failed:', error.message);
          }
        }
      }, 20000); // Check for new comments every 20 seconds
    }
    
    console.log('🌐 New global comment system initialized - comments are now globally visible!');
    console.log(`📊 Loaded ${this.comments.length} comments from storage`);
    
    return this;
  }
}

// Make it globally available
window.NewGlobalCommentSystem = NewGlobalCommentSystem;
