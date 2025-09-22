const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// Get chat rooms for user
router.get('/rooms', async (req, res) => {
  try {
    // In a real application, you would have a ChatRoom model
    // For now, we'll return mock data based on user role
    
    let rooms = [];

    if (req.user.role === 'patient') {
      // Get rooms with doctors the patient has appointments with
      rooms = [
        {
          id: 'room1',
          name: 'Dr. Smith - Cardiology',
          type: 'doctor',
          lastMessage: {
            text: 'How are you feeling today?',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            sender: 'doctor'
          },
          unreadCount: 2,
          isOnline: true
        },
        {
          id: 'room2',
          name: 'Dr. Johnson - General Medicine',
          type: 'doctor',
          lastMessage: {
            text: 'Your test results are ready',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            sender: 'doctor'
          },
          unreadCount: 0,
          isOnline: false
        }
      ];
    } else if (req.user.role === 'doctor') {
      // Get rooms with patients
      rooms = [
        {
          id: 'room1',
          name: 'John Doe',
          type: 'patient',
          lastMessage: {
            text: 'I have been taking the medication as prescribed',
            timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
            sender: 'patient'
          },
          unreadCount: 1,
          isOnline: true
        },
        {
          id: 'room3',
          name: 'Jane Smith',
          type: 'patient',
          lastMessage: {
            text: 'Thank you for the consultation',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4), // 4 hours ago
            sender: 'patient'
          },
          unreadCount: 0,
          isOnline: false
        }
      ];
    }

    res.json({
      rooms
    });
  } catch (error) {
    console.error('Get chat rooms error:', error);
    res.status(500).json({
      message: 'Failed to fetch chat rooms',
      error: error.message
    });
  }
});

// Get messages for a chat room
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const { roomId } = req.params;
    const { page = 1, limit = 50 } = req.query;

    // In a real application, you would fetch messages from a database
    // For now, we'll return mock data
    const messages = [
      {
        id: 'msg1',
        text: 'Hello, how can I help you today?',
        sender: req.user.role === 'patient' ? 'doctor' : 'patient',
        timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        type: 'text',
        isRead: true
      },
      {
        id: 'msg2',
        text: 'I have been experiencing some symptoms',
        sender: req.user.role,
        timestamp: new Date(Date.now() - 1000 * 60 * 45), // 45 minutes ago
        type: 'text',
        isRead: true
      },
      {
        id: 'msg3',
        text: 'Can you describe the symptoms in detail?',
        sender: req.user.role === 'patient' ? 'doctor' : 'patient',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        type: 'text',
        isRead: true
      },
      {
        id: 'msg4',
        text: 'I have chest pain and shortness of breath',
        sender: req.user.role,
        timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
        type: 'text',
        isRead: false
      }
    ];

    res.json({
      messages,
      pagination: {
        current: parseInt(page),
        pages: 1,
        total: messages.length
      }
    });
  } catch (error) {
    console.error('Get chat messages error:', error);
    res.status(500).json({
      message: 'Failed to fetch chat messages',
      error: error.message
    });
  }
});

// Send message
router.post('/rooms/:roomId/messages', [
  body('text').notEmpty().isLength({ max: 1000 }),
  body('type').optional().isIn(['text', 'image', 'file'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { roomId } = req.params;
    const { text, type = 'text' } = req.body;

    // In a real application, you would save the message to the database
    // and emit it via Socket.io to the recipient
    
    const message = {
      id: `msg_${Date.now()}`,
      text,
      sender: req.user.role,
      timestamp: new Date(),
      type,
      isRead: false
    };

    // Emit message via Socket.io (this would be handled by the Socket.io server)
    // io.to(roomId).emit('new_message', message);

    res.status(201).json({
      message: 'Message sent successfully',
      data: message
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      message: 'Failed to send message',
      error: error.message
    });
  }
});

// Mark messages as read
router.put('/rooms/:roomId/messages/read', async (req, res) => {
  try {
    const { roomId } = req.params;

    // In a real application, you would update the read status in the database
    // For now, we'll just return success

    res.json({
      message: 'Messages marked as read'
    });
  } catch (error) {
    console.error('Mark messages read error:', error);
    res.status(500).json({
      message: 'Failed to mark messages as read',
      error: error.message
    });
  }
});

// Upload file for chat
router.post('/upload', async (req, res) => {
  try {
    // In a real application, you would handle file upload using multer
    // For now, we'll return a mock response

    res.json({
      message: 'File uploaded successfully',
      file: {
        id: `file_${Date.now()}`,
        name: 'document.pdf',
        url: '/uploads/chat/document.pdf',
        size: 1024000,
        type: 'application/pdf'
      }
    });
  } catch (error) {
    console.error('Upload file error:', error);
    res.status(500).json({
      message: 'Failed to upload file',
      error: error.message
    });
  }
});

// Get chat participants
router.get('/rooms/:roomId/participants', async (req, res) => {
  try {
    const { roomId } = req.params;

    // In a real application, you would fetch participants from the database
    const participants = [
      {
        id: 'user1',
        name: req.user.role === 'patient' ? 'Dr. Smith' : 'John Doe',
        role: req.user.role === 'patient' ? 'doctor' : 'patient',
        avatar: '/avatars/default.jpg',
        isOnline: true,
        lastSeen: new Date()
      }
    ];

    res.json({
      participants
    });
  } catch (error) {
    console.error('Get chat participants error:', error);
    res.status(500).json({
      message: 'Failed to fetch chat participants',
      error: error.message
    });
  }
});

// Create new chat room
router.post('/rooms', [
  body('participantId').isMongoId(),
  body('type').isIn(['doctor', 'patient'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { participantId, type } = req.body;

    // In a real application, you would create a new chat room in the database
    const room = {
      id: `room_${Date.now()}`,
      name: type === 'doctor' ? 'Dr. Smith' : 'John Doe',
      type,
      createdAt: new Date(),
      participants: [req.user._id, participantId]
    };

    res.status(201).json({
      message: 'Chat room created successfully',
      room
    });
  } catch (error) {
    console.error('Create chat room error:', error);
    res.status(500).json({
      message: 'Failed to create chat room',
      error: error.message
    });
  }
});

// Delete chat room
router.delete('/rooms/:roomId', async (req, res) => {
  try {
    const { roomId } = req.params;

    // In a real application, you would delete the chat room from the database
    // For now, we'll just return success

    res.json({
      message: 'Chat room deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat room error:', error);
    res.status(500).json({
      message: 'Failed to delete chat room',
      error: error.message
    });
  }
});

// Get chat statistics
router.get('/stats', async (req, res) => {
  try {
    // In a real application, you would calculate statistics from the database
    const stats = {
      totalRooms: 5,
      unreadMessages: 12,
      totalMessages: 150,
      activeRooms: 3
    };

    res.json({
      statistics: stats
    });
  } catch (error) {
    console.error('Get chat stats error:', error);
    res.status(500).json({
      message: 'Failed to fetch chat statistics',
      error: error.message
    });
  }
});

module.exports = router;
