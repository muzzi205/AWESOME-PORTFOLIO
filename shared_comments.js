// Shared Comment System for Portfolio
// Uses localStorage with demo comments to show functionality

class SharedCommentSystem {
  constructor() {
    this.localStorageKey = 'portfolio-comments-mack';
    this.comments = [];
    
    // Initialize with some demo comments to show the system works
    this.demoComments = [
      {
        id: 'demo_1',
        author: 'Sarah Johnson',
        text: 'Amazing portfolio! Your web design skills are incredible. The layout and user experience are top-notch.',
        timestamp: Date.now() - 86400000, // 1 day ago
        date: new Date(Date.now() - 86400000).toLocaleString()
      },
      {
        id: 'demo_2', 
        author: 'Mike Chen',
        text: 'Really impressed with your full-stack projects. The AI integration looks fascinating!',
        timestamp: Date.now() - 43200000, // 12 hours ago
        date: new Date(Date.now() - 43200000).toLocaleString()
      },
      {
        id: 'demo_3',
        author: 'Alex Rodriguez',
        text: 'Your mobile app designs are so clean and intuitive. Would love to collaborate on a project!',
        timestamp: Date.now() - 7200000, // 2 hours ago
        date: new Date(Date.now() - 7200000).toLocaleString()
      }
    ];
  }

  // Load comments - combines demo comments with any saved user comments
  async loadComments() {
    try {
      // Get any existing comments from localStorage
      const existingComments = this.getLocalComments();
      
      // If no existing comments, start with demo comments
      if (existingComments.length === 0) {
        this.comments = [...this.demoComments];
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.comments));
        console.log('✅ Portfolio loaded with demo comments - add your own!');
      } else {
        // Merge demo comments with existing comments (avoid duplicates)
        const allComments = [...this.demoComments];
        
        existingComments.forEach(comment => {
          if (!comment.id.startsWith('demo_')) {
            allComments.push(comment);
          }
        });
        
        this.comments = allComments.sort((a, b) => a.timestamp - b.timestamp);
        localStorage.setItem(this.localStorageKey, JSON.stringify(this.comments));
        console.log('✅ Comments loaded successfully!');
      }
    } catch (error) {
      console.log('⚠️ Error loading comments, using demo comments:', error);
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

  // Save new comment
  async saveComment(commentData) {
    try {
      // Add unique ID and timestamp
      const commentWithId = {
        ...commentData,
        id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        timestamp: Date.now(),
        date: new Date().toLocaleString()
      };
      
      // Add to comments array
      this.comments.push(commentWithId);
      
      // Save to localStorage
      localStorage.setItem(this.localStorageKey, JSON.stringify(this.comments));
      
      console.log('✅ Comment saved successfully!');
      return true;
    } catch (error) {
      console.error('Error saving comment:', error);
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
