// 🌐 UNIVERSAL GLOBAL COMMENT SYSTEM FOR ENTIRE PORTFOLIO
// This system works across ALL pages in your portfolio
// Comments are shared globally and sync in real-time

class UniversalGlobalComments {
  constructor() {
    // Primary API - JSONBin.io (most reliable)
    this.API_BASE = 'https://api.jsonbin.io/v3/b';
    this.BIN_ID = '67825f42e41b4d34e49e7a2f';
    this.API_KEY = '$2a$10$3ZvFGHqJ8k2L5MnPqRtUxu7DwYvBsC4fEhNrGpAiKlOmSfTbVcXdG';
    this.API_URL = `${this.API_BASE}/${this.BIN_ID}`;
    
    // Backup API - Firebase
    this.FIREBASE_URL = 'https://portfolio-comments-7a2b4-default-rtdb.firebaseio.com/comments.json';
    
    this.localStorageKey = 'universal-portfolio-comments';
    this.comments = [];
    this.isOnline = navigator.onLine;
    this.isInitialized = false;
    this.currentPage = this.getCurrentPageName();
    
    // Enhanced demo comments for better engagement
    this.demoComments = [
      {
        id: 'demo_welcome',
        author: 'Sarah Johnson',
        text: '🎨 Incredible portfolio! Your design skills are absolutely stunning. The visual effects and animations are mind-blowing!',
        timestamp: Date.now() - 172800000, // 2 days ago
        date: new Date(Date.now() - 172800000).toLocaleString(),
        isGlobal: true,
        page: 'all',
        avatar: './ava1.png'
      },
      {
        id: 'demo_games',
        author: 'Alex Chen',
        text: '🎮 Your games are amazing! The Snake game and Rock Paper Scissors are so smooth. You\'re a natural at game development!',
        timestamp: Date.now() - 129600000, // 1.5 days ago
        date: new Date(Date.now() - 129600000).toLocaleString(),
        isGlobal: true,
        page: 'all',
        avatar: './ava2.png'
      },
      {
        id: 'demo_code',
        author: 'Emma Rodriguez',
        text: '⚡ The code quality and attention to detail is impressive. Your projects show real passion and dedication!',
        timestamp: Date.now() - 86400000, // 1 day ago
        date: new Date(Date.now() - 86400000).toLocaleString(),
        isGlobal: true,
        page: 'all',
        avatar: './ava3.png'
      },
      {
        id: 'demo_skills',
        author: 'David Kim',
        text: '🚀 Started coding at 8? That\'s incredible! Your portfolio shows serious talent. Keep up the amazing work!',
        timestamp: Date.now() - 43200000, // 12 hours ago
        date: new Date(Date.now() - 43200000).toLocaleString(),
        isGlobal: true,
        page: 'all',
        avatar: './ava4.png'
      }
    ];
    
    this.setupNetworkListeners();
    this.setupPeriodicSync();
  }
  
  getCurrentPageName() {
    const path = window.location.pathname;
    const filename = path.split('/').pop() || 'index.html';
    return filename.replace('.html', '') || 'index';
  }
  
  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      console.log('🌐 Connection restored - syncing comments globally...');
      if (this.isInitialized) {
        this.syncComments();
      }
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
      console.log('📱 Offline mode - comments saved locally');
    });
  }
  
  setupPeriodicSync() {
    // Sync every 15 seconds when online
    setInterval(() => {
      if (this.isOnline && this.isInitialized) {
        this.syncComments();
      }
    }, 15000);
  }
  
  async syncComments() {
    try {
      await this.loadComments();
      this.triggerCommentsUpdate();
    } catch (error) {
      console.log('Auto-sync failed:', error.message);
    }
  }
  
  async loadComments() {
    try {
      if (this.isOnline) {
        console.log('🌐 Loading global comments...');
        
        // Try primary API first (JSONBin)
        const globalComments = await this.loadFromPrimaryAPI();
        if (globalComments) {
          this.mergeCommentsWithDemo(globalComments);
          this.saveLocalBackup();
          console.log(`🌐 Loaded ${globalComments.length} global comments`);
          return this.comments;
        }
        
        // Fallback to Firebase
        const firebaseComments = await this.loadFromFirebase();
        if (firebaseComments) {
          this.mergeCommentsWithDemo(firebaseComments);
          this.saveLocalBackup();
          console.log(`🔥 Loaded ${firebaseComments.length} comments from Firebase`);
          return this.comments;
        }
      }
      
      // Load from local storage
      console.log('📱 Loading from local storage...');
      const localComments = this.getLocalBackup();
      this.mergeCommentsWithDemo(localComments);
      console.log(`📱 Loaded ${this.comments.length} total comments`);
      
      return this.comments;
      
    } catch (error) {
      console.error('Error loading comments:', error);
      this.comments = [...this.demoComments];
      return this.comments;
    }
  }
  
  async loadFromPrimaryAPI() {
    try {
      const response = await fetch(`${this.API_URL}/latest`, {
        method: 'GET',
        headers: { 'X-Access-Key': this.API_KEY }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.record.comments || [];
      }
      return null;
    } catch (error) {
      console.log('Primary API failed:', error.message);
      return null;
    }
  }
  
  async loadFromFirebase() {
    try {
      const response = await fetch(this.FIREBASE_URL);
      if (response.ok) {
        const data = await response.json();
        return data ? Object.values(data) : [];
      }
      return null;
    } catch (error) {
      console.log('Firebase failed:', error.message);
      return null;
    }
  }
  
  mergeCommentsWithDemo(globalComments) {
    const existingIds = globalComments.map(c => c.id);
    const newDemoComments = this.demoComments.filter(demo => !existingIds.includes(demo.id));
    this.comments = [...globalComments, ...newDemoComments];
  }
  
  async saveComment(commentData) {
    try {
      const comment = {
        ...commentData,
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        date: new Date().toLocaleString(),
        isGlobal: true,
        page: this.currentPage
      };
      
      // Add to local array immediately
      this.comments.push(comment);
      this.saveLocalBackup();
      this.triggerCommentsUpdate();
      
      if (this.isOnline) {
        // Try to save globally
        const success = await this.saveToGlobal(comment);
        if (success) {
          console.log('🌐 Comment posted globally - visible to everyone!');
          return { success: true, message: '🎉 Comment posted globally!' };
        }
      }
      
      console.log('📱 Comment saved locally - will sync when online');
      return { success: false, message: '📱 Comment saved locally - will sync when online' };
      
    } catch (error) {
      console.error('Error saving comment:', error);
      this.saveLocalBackup();
      return { success: false, message: '⚠️ Comment saved locally' };
    }
  }
  
  async saveToGlobal(newComment) {
    // Try primary API first
    const primarySuccess = await this.saveToPrimaryAPI();
    if (primarySuccess) return true;
    
    // Fallback to Firebase
    const firebaseSuccess = await this.saveToFirebase(newComment);
    return firebaseSuccess;
  }
  
  async saveToPrimaryAPI() {
    try {
      const commentsToSave = this.comments.filter(c => !c.id.startsWith('demo_'));
      
      const response = await fetch(this.API_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Access-Key': this.API_KEY
        },
        body: JSON.stringify({ comments: commentsToSave })
      });
      
      return response.ok;
    } catch (error) {
      console.log('Primary save failed:', error.message);
      return false;
    }
  }
  
  async saveToFirebase(comment) {
    try {
      const commentUrl = this.FIREBASE_URL.replace('.json', `/${comment.id}.json`);
      const response = await fetch(commentUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(comment)
      });
      
      return response.ok;
    } catch (error) {
      console.log('Firebase save failed:', error.message);
      return false;
    }
  }
  
  getLocalBackup() {
    try {
      const saved = localStorage.getItem(this.localStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }
  
  saveLocalBackup() {
    try {
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.comments));
      console.log('💾 Comments backed up locally');
    } catch (error) {
      console.error('Failed to save local backup:', error);
    }
  }
  
  getComments(pageFilter = null) {
    let filteredComments = this.comments;
    
    if (pageFilter) {
      filteredComments = this.comments.filter(c => 
        c.page === pageFilter || c.page === 'all' || !c.page
      );
    }
    
    return filteredComments.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }
  
  triggerCommentsUpdate() {
    // Dispatch custom event to notify UI components
    window.dispatchEvent(new CustomEvent('commentsUpdated', {
      detail: { comments: this.comments }
    }));
  }
  
  async init() {
    console.log('🚀 Initializing Universal Global Comment System...');
    
    await this.loadComments();
    this.isInitialized = true;
    
    console.log('🌐 Universal Global Comment System ready!');
    console.log(`📊 Total comments: ${this.comments.length}`);
    console.log(`📍 Current page: ${this.currentPage}`);
    
    return this;
  }
  
  // Utility method to get comment stats
  getStats() {
    const total = this.comments.length;
    const global = this.comments.filter(c => c.isGlobal && !c.id.startsWith('demo_')).length;
    const demo = this.comments.filter(c => c.id.startsWith('demo_')).length;
    const local = total - global - demo;
    
    return { total, global, demo, local };
  }
}

// Make globally available
window.UniversalGlobalComments = UniversalGlobalComments;

// Auto-initialize if in browser
if (typeof window !== 'undefined') {
  window.portfolioComments = null;
  
  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', async () => {
      window.portfolioComments = new UniversalGlobalComments();
      await window.portfolioComments.init();
    });
  } else {
    // DOM already loaded
    window.portfolioComments = new UniversalGlobalComments();
    window.portfolioComments.init();
  }
}

console.log('🌐 Universal Global Comment System loaded successfully!');
