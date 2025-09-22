const express = require('express');
const { body, validationResult } = require('express-validator');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Apply authentication to all routes
router.use(authenticateToken);

// AI Medical Assistant Chat
router.post('/chat', [
  body('message').notEmpty().isLength({ max: 1000 }),
  body('conversationId').optional().isString(),
  body('context').optional().isObject()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { message, conversationId, context } = req.body;

    // In a real application, you would integrate with OpenAI or another AI service
    // For now, we'll return mock responses based on keywords

    let response = '';
    let suggestions = [];
    let isEmergency = false;

    const lowerMessage = message.toLowerCase();

    // Simple keyword-based responses
    if (lowerMessage.includes('chest pain') || lowerMessage.includes('heart attack')) {
      response = 'Chest pain can be a serious symptom. If you are experiencing severe chest pain, shortness of breath, or pain radiating to your arm or jaw, please seek immediate medical attention or call emergency services.';
      suggestions = ['Call Emergency Services', 'Schedule Urgent Appointment', 'Visit Emergency Room'];
      isEmergency = true;
    } else if (lowerMessage.includes('fever') || lowerMessage.includes('temperature')) {
      response = 'Fever is your body\'s natural response to infection. If your temperature is above 100.4°F (38°C) and persists for more than 3 days, or if you have other concerning symptoms, please consult with a healthcare provider.';
      suggestions = ['Rest and Hydrate', 'Take Fever Reducer', 'Schedule Appointment'];
    } else if (lowerMessage.includes('headache') || lowerMessage.includes('head pain')) {
      response = 'Headaches can have various causes. If you experience sudden, severe headaches, headaches with fever, or changes in vision, please seek medical attention. For mild headaches, rest, hydration, and over-the-counter pain relievers may help.';
      suggestions = ['Rest in Dark Room', 'Stay Hydrated', 'Take Pain Reliever', 'Schedule Appointment'];
    } else if (lowerMessage.includes('cough') || lowerMessage.includes('cold')) {
      response = 'Cough and cold symptoms are common. If symptoms persist for more than 10 days, worsen, or are accompanied by high fever or difficulty breathing, please consult a healthcare provider.';
      suggestions = ['Stay Hydrated', 'Use Humidifier', 'Get Rest', 'Schedule Appointment'];
    } else if (lowerMessage.includes('stomach') || lowerMessage.includes('nausea')) {
      response = 'Stomach issues and nausea can have various causes. If you experience severe abdominal pain, persistent vomiting, or signs of dehydration, please seek medical attention.';
      suggestions = ['Stay Hydrated', 'Eat Bland Foods', 'Avoid Spicy Foods', 'Schedule Appointment'];
    } else if (lowerMessage.includes('medication') || lowerMessage.includes('prescription')) {
      response = 'For questions about medications, please consult with your prescribing doctor or pharmacist. Never stop or change medication dosages without medical supervision.';
      suggestions = ['Contact Your Doctor', 'Consult Pharmacist', 'Check Medication Guide'];
    } else {
      response = 'I understand you have a health concern. While I can provide general information, I cannot diagnose or replace professional medical advice. For specific symptoms or concerns, please consult with a healthcare provider.';
      suggestions = ['Schedule Appointment', 'Contact Your Doctor', 'Visit Urgent Care'];
    }

    // Generate conversation ID if not provided
    const newConversationId = conversationId || `conv_${Date.now()}_${req.user._id}`;

    res.json({
      message: 'AI response generated',
      data: {
        conversationId: newConversationId,
        response,
        suggestions,
        isEmergency,
        timestamp: new Date(),
        context: {
          userRole: req.user.role,
          ...context
        }
      }
    });
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({
      message: 'Failed to process AI request',
      error: error.message
    });
  }
});

// Get AI conversation history
router.get('/conversations', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // In a real application, you would fetch conversation history from the database
    const conversations = [
      {
        id: 'conv_1',
        title: 'Chest Pain Inquiry',
        lastMessage: 'Chest pain can be a serious symptom...',
        timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        messageCount: 5
      },
      {
        id: 'conv_2',
        title: 'Fever and Cold Symptoms',
        lastMessage: 'Fever is your body\'s natural response...',
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        messageCount: 8
      }
    ];

    res.json({
      conversations,
      pagination: {
        current: parseInt(page),
        pages: 1,
        total: conversations.length
      }
    });
  } catch (error) {
    console.error('Get AI conversations error:', error);
    res.status(500).json({
      message: 'Failed to fetch AI conversations',
      error: error.message
    });
  }
});

// Get specific conversation
router.get('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // In a real application, you would fetch the conversation from the database
    const conversation = {
      id: conversationId,
      title: 'Chest Pain Inquiry',
      messages: [
        {
          id: 'msg1',
          text: 'I have been experiencing chest pain',
          sender: 'user',
          timestamp: new Date(Date.now() - 1000 * 60 * 45)
        },
        {
          id: 'msg2',
          text: 'Chest pain can be a serious symptom. If you are experiencing severe chest pain, shortness of breath, or pain radiating to your arm or jaw, please seek immediate medical attention or call emergency services.',
          sender: 'ai',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          suggestions: ['Call Emergency Services', 'Schedule Urgent Appointment', 'Visit Emergency Room'],
          isEmergency: true
        }
      ],
      createdAt: new Date(Date.now() - 1000 * 60 * 60),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30)
    };

    res.json({
      conversation
    });
  } catch (error) {
    console.error('Get AI conversation error:', error);
    res.status(500).json({
      message: 'Failed to fetch AI conversation',
      error: error.message
    });
  }
});

// Delete conversation
router.delete('/conversations/:conversationId', async (req, res) => {
  try {
    const { conversationId } = req.params;

    // In a real application, you would delete the conversation from the database
    // For now, we'll just return success

    res.json({
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    console.error('Delete AI conversation error:', error);
    res.status(500).json({
      message: 'Failed to delete AI conversation',
      error: error.message
    });
  }
});

// Get AI health tips
router.get('/health-tips', async (req, res) => {
  try {
    const { category, limit = 10 } = req.query;

    // In a real application, you would fetch health tips from a database or AI service
    const healthTips = [
      {
        id: 'tip1',
        title: 'Stay Hydrated',
        content: 'Drink at least 8 glasses of water daily to maintain proper hydration and support overall health.',
        category: 'general',
        tags: ['hydration', 'wellness', 'daily habits']
      },
      {
        id: 'tip2',
        title: 'Regular Exercise',
        content: 'Aim for at least 150 minutes of moderate-intensity exercise per week to improve cardiovascular health.',
        category: 'fitness',
        tags: ['exercise', 'cardiovascular', 'fitness']
      },
      {
        id: 'tip3',
        title: 'Balanced Diet',
        content: 'Include a variety of fruits, vegetables, whole grains, and lean proteins in your daily meals.',
        category: 'nutrition',
        tags: ['diet', 'nutrition', 'healthy eating']
      },
      {
        id: 'tip4',
        title: 'Adequate Sleep',
        content: 'Get 7-9 hours of quality sleep each night to support immune function and mental health.',
        category: 'sleep',
        tags: ['sleep', 'rest', 'mental health']
      }
    ];

    let filteredTips = healthTips;
    if (category) {
      filteredTips = healthTips.filter(tip => tip.category === category);
    }

    res.json({
      tips: filteredTips.slice(0, parseInt(limit))
    });
  } catch (error) {
    console.error('Get health tips error:', error);
    res.status(500).json({
      message: 'Failed to fetch health tips',
      error: error.message
    });
  }
});

// Get AI symptom checker
router.post('/symptom-checker', [
  body('symptoms').isArray({ min: 1 }),
  body('age').optional().isInt({ min: 0, max: 120 }),
  body('gender').optional().isIn(['male', 'female', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { symptoms, age, gender } = req.body;

    // In a real application, you would use a medical AI service for symptom analysis
    // For now, we'll return mock analysis based on symptoms

    let analysis = {
      possibleConditions: [],
      severity: 'low',
      recommendations: [],
      emergency: false
    };

    const symptomText = symptoms.join(' ').toLowerCase();

    if (symptomText.includes('chest pain') && symptomText.includes('shortness of breath')) {
      analysis.possibleConditions = ['Heart Attack', 'Angina', 'Pulmonary Embolism'];
      analysis.severity = 'high';
      analysis.emergency = true;
      analysis.recommendations = ['Seek immediate medical attention', 'Call emergency services'];
    } else if (symptomText.includes('fever') && symptomText.includes('cough')) {
      analysis.possibleConditions = ['Common Cold', 'Flu', 'Respiratory Infection'];
      analysis.severity = 'medium';
      analysis.recommendations = ['Rest and stay hydrated', 'Monitor temperature', 'Consider seeing a doctor if symptoms worsen'];
    } else if (symptomText.includes('headache') && symptomText.includes('nausea')) {
      analysis.possibleConditions = ['Migraine', 'Tension Headache', 'Sinusitis'];
      analysis.severity = 'medium';
      analysis.recommendations = ['Rest in a dark room', 'Stay hydrated', 'Consider over-the-counter pain relief'];
    } else {
      analysis.possibleConditions = ['General Illness', 'Viral Infection'];
      analysis.severity = 'low';
      analysis.recommendations = ['Monitor symptoms', 'Rest and stay hydrated', 'Consult a healthcare provider if symptoms persist'];
    }

    res.json({
      message: 'Symptom analysis completed',
      data: {
        symptoms,
        analysis,
        timestamp: new Date(),
        disclaimer: 'This analysis is for informational purposes only and should not replace professional medical advice.'
      }
    });
  } catch (error) {
    console.error('Symptom checker error:', error);
    res.status(500).json({
      message: 'Failed to analyze symptoms',
      error: error.message
    });
  }
});

// Get AI medication information
router.get('/medication-info/:medicationName', async (req, res) => {
  try {
    const { medicationName } = req.params;

    // In a real application, you would fetch medication information from a medical database
    const medicationInfo = {
      name: medicationName,
      genericName: 'Generic Name',
      description: 'This medication is used to treat various conditions.',
      dosage: 'Take as directed by your healthcare provider',
      sideEffects: ['Nausea', 'Dizziness', 'Headache'],
      interactions: ['Avoid alcohol', 'May interact with other medications'],
      warnings: ['Do not use if allergic to this medication', 'Consult doctor before use'],
      lastUpdated: new Date()
    };

    res.json({
      medication: medicationInfo,
      disclaimer: 'This information is for educational purposes only. Always consult your healthcare provider for medical advice.'
    });
  } catch (error) {
    console.error('Get medication info error:', error);
    res.status(500).json({
      message: 'Failed to fetch medication information',
      error: error.message
    });
  }
});

module.exports = router;
