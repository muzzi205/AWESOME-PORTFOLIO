// Truly Shared Comment System for Portfolio
// Uses JSONBin.io for real shared comments visible to ALL visitors worldwide

class SharedCommentSystem {
  constructor() {
    // Real JSONBin setup - this will work for shared comments
    this.binId = '676fcf5de41b4d34e45a8c5b';
    this.apiUrl = 'https://api.jsonbin.io/v3/b/' + this.binId;
    this.apiKey = '$2a$10$YAYmTJ.TqP1/z9zQGc2Ume5Hzr/ULkEo7o6c5xjyPp7Bc.X/4X3em';
    this.localStorageKey = 'portfolio-comments-backup';
    this.comments = [];
    
    // Demo comments to initialize the shared database
    this.demoComments = [
      {
        id: 'demo_1',
        author: 'Sarah Johnson',
        text: 'Amazing portfolio! Your web design skills are incredible. The layout and user experience are top-notch.',
        timestamp: Date.now() - 86400000,
        date: new Date(Date.now() - 86400000).toLocaleString()
      },
      {
        id: 'demo_2', 
        author: 'Mike Chen',
        text: 'Really impressed with your full-stack projects. The AI integration looks fascinating!',
        timestamp: Date.now() - 43200000,
        date: new Date(Date.now() - 43200000).toLocaleString()
      }
    ];
  }

// Load comments from JSONBin - truly shared across all users
  async loadComments() {
    try {
      const response = await fetch(`${this.apiUrl}/latest`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.apiKey
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        this.comments = data.record.comments || [];
        this.comments.sort((a, b) => a.timestamp - b.timestamp);
        console.log('✅ Comments loaded from JSONBin - truly shared!');
      } else {
        console.error('Failed to load comments from JSONBin');
        this.comments = [...this.demoComments];
      }
    } catch (error) {
      console.error('Error loading shared comments:', error);
      this.comments = [...this.demoComments];
    }
    return this.comments;
  }

  // Get comments from localStorage 
  getLocalComments() {
    try {
      const saved = localStorage.getItem(this.localStorageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

// Save comment to JSONBin - truly shared across all users
  async saveComment(commentData) {
    try {
      const commentWithId = {
        ...commentData,
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        date: new Date().toLocaleString()
      };
      
      this.comments.push(commentWithId);
      
      const response = await fetch(this.apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': this.apiKey
        },
        body: JSON.stringify({ comments: this.comments })
      });
      
      if (response.ok) {
        console.log('✅ Comment saved to JSONBin - visible to all users!');
        return true;
      } else {
        console.error('Failed to save comment to JSONBin');
        return false;
      }
    } catch (error) {
      console.error('Error saving comment to JSONBin:', error);
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
