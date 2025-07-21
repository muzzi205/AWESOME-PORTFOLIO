// Shared Comment System for Portfolio
// Uses JSONBin.io for truly shared comments across all users - FREE and works immediately!

class SharedCommentSystem {
  constructor() {
    // JSONBin configuration - replace with your own bin ID
    this.jsonBinId = '676fcf5de41b4d34e45a8c5b'; // You can create your own at https://jsonbin.io
    this.jsonBinUrl = `https://api.jsonbin.io/v3/b/${this.jsonBinId}`;
    this.headers = {
      'Content-Type': 'application/json',
      'X-Master-Key': '$2a$10$YAYmTJ.TqP1/z9zQGc2Ume5Hzr/ULkEo7o6c5xjyPp7Bc.X/4X3em' // Optional: use your own master key
    };
    this.localStorageKey = 'portfolio-comments-backup';
    this.comments = [];
  }

  // Load comments from JSONBin (shared) with localStorage fallback
  async loadComments() {
    try {
      const response = await fetch(`${this.jsonBinUrl}/latest`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (response.ok) {
        const data = await response.json();
        this.comments = data.record.comments || [];
        this.comments.sort((a, b) => a.timestamp - b.timestamp);
        
        // Also save as local backup
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.comments));
        console.log('✅ Comments loaded from JSONBin - everyone can see these!');
      } else {
        throw new Error('Failed to load shared comments from JSONBin');
      }
    } catch (error) {
      console.log('⚠️ Error loading shared comments, using local fallback:', error);
      this.comments = this.getLocalComments();
    }
    return this.comments;
  }

  // Get comments from localStorage (fallback)
  getLocalComments() {
    try {
      const saved = localStorage.getItem(this.localStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  // Save comment to JSONBin (shared database)
  async saveComment(commentData) {
    try {
      // Add unique ID and timestamp
      const commentWithId = {
        ...commentData,
        id: 'comment_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        date: new Date().toLocaleString()
      };
      
      // Add to local array first
      this.comments.push(commentWithId);
      
      // Save entire comment array to JSONBin
      const response = await fetch(this.jsonBinUrl, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify({
          comments: this.comments,
          lastUpdated: new Date().toISOString()
        })
      });
      
      if (response.ok) {
        console.log('✅ Comment saved to JSONBin - visible to all users worldwide!');
        // Save to localStorage as backup
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.comments));
        return true;
      } else {
        throw new Error('Failed to save to JSONBin');
      }
    } catch (error) {
      console.error('Error saving to JSONBin:', error);
      // Keep local comment but save to localStorage as backup
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.comments));
      console.log('💾 Comment saved locally as backup');
      return false;
    }
  }

  // Get all comments
  getComments() {
    return this.comments;
  }

  // Initialize the comment system
  async init() {
    await this.loadComments();
    console.log('🌐 Shared comment system initialized - comments are now visible to everyone!');
    return this;
  }
}
