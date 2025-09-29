const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticateToken, authRateLimit } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
};

// Set token in cookie
const setTokenCookie = (res, token) => {
  res.cookie('token', token, {
    httpOnly: true,  // Prevents XSS attacks
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Adjust for development
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
  });
};

// Register new user (only patient and doctor roles allowed)
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('role').isIn(['patient', 'doctor']).withMessage('Only patient and doctor roles are allowed for registration'),
  body('profile.firstName').notEmpty().trim().isLength({ max: 50 }),
  body('profile.lastName').notEmpty().trim().isLength({ max: 50 }),
  body('profile.phone').matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('profile.dateOfBirth').optional().isISO8601(),
  body('profile.gender').optional().isIn(['male', 'female', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password, role, profile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists with this email',
        code: 'USER_EXISTS'
      });
    }

      // Create user with role-specific data
      const userData = {
      email,
      password,
      role,
        profile,
        // Initialize the appropriate subdocument based on role, others will be undefined
        patientData: role === 'patient' ? {
        emergencyContact: {
          name: profile.emergencyContact?.name || '',
          relationship: profile.emergencyContact?.relationship || '',
          phone: profile.emergencyContact?.phone || ''
        }
        } : undefined,
        doctorData: role === 'doctor' ? {
        licenseNumber: profile.licenseNumber || '',
        specialization: profile.specialization || '',
        experience: profile.experience || 0,
        consultationFee: profile.consultationFee || 0
        } : undefined
      };

      const user = new User(userData);
      await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set token in cookie instead of returning in response
    setTokenCookie(res, token);

    res.status(201).json({
      message: 'User registered successfully',
      // Don't send token in response for improved security
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      message: 'Registration failed',
      error: error.message
    });
  }
});

// Login user
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], authRateLimit(5, 15 * 60 * 1000), async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Account is deactivated. Please contact support.',
        code: 'ACCOUNT_DEACTIVATED'
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
        code: 'INVALID_CREDENTIALS'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Set token in cookie instead of returning in response
    setTokenCookie(res, token);

    res.json({
      message: 'Login successful',
      // Don't send token in response for improved security
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        lastLogin: user.lastLogin
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      message: 'Login failed',
      error: error.message
    });
  }
});

// Get current user profile
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = req.user;

      // Get role-specific data from the same user document
    let roleData = null;
    if (user.role === 'patient') {
        roleData = user.patientData;
    } else if (user.role === 'doctor') {
        roleData = user.doctorData;
    } else if (user.role === 'admin') {
      // Admin might not have specific role data, but we can return a placeholder
      roleData = { isAdmin: true };
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile,
        isActive: user.isActive,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      },
      roleData
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      message: 'Failed to get profile',
      error: error.message
    });
  }
});

// Update user profile
router.put('/profile', authenticateToken, [
  body('profile.firstName').optional().notEmpty().trim().isLength({ max: 50 }),
  body('profile.lastName').optional().notEmpty().trim().isLength({ max: 50 }),
  body('profile.phone').optional().matches(/^\d{10}$/).withMessage('Phone number must be exactly 10 digits'),
  body('profile.dateOfBirth').optional().isISO8601(),
  body('profile.gender').optional().isIn(['male', 'female', 'other'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const user = req.user;
    const { profile } = req.body;

    // Update profile
    Object.keys(profile).forEach(key => {
      if (profile[key] !== undefined) {
        user.profile[key] = profile[key];
      }
    });

    await user.save();

    res.json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        profile: user.profile
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message
    });
  }
});

// Change password
router.put('/change-password', authenticateToken, [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        message: 'Current password is incorrect',
        code: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      message: 'Failed to change password',
      error: error.message
    });
  }
});

// Logout (clear token cookie)
router.post('/logout', (req, res) => {
  // Clear the token cookie regardless of authentication status
  res.clearCookie('token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax'
  });
  
  res.json({
    message: 'Logout successful'
  });
});

// Check authentication status without error (for debugging)
router.get('/check-auth', (req, res) => {
  try {
    // Try to get token from header first, then from cookies
    let token = null;
    
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]; // Bearer TOKEN
    } else {
      // Try to get token from cookies
      token = req.cookies?.token;
    }

    if (!token) {
      return res.json({ 
        authenticated: false,
        message: 'No token found',
        hasAuthHeader: !!authHeader,
        hasCookie: !!req.cookies?.token,
        cookies: req.cookies,
        headers: {
          authorization: req.headers['authorization'],
          origin: req.headers['origin'],
          referer: req.headers['referer']
        }
      });
    }

    // Try to verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // If token is valid, return success
    res.json({
      authenticated: true,
      hasValidToken: true,
      tokenPayload: decoded
    });
  } catch (error) {
    res.json({ 
      authenticated: false,
      hasValidToken: false,
      error: error.message,
      hasToken: !!req.headers['authorization'] || !!req.cookies?.token,
      cookies: req.cookies,
      headers: {
        authorization: req.headers['authorization'],
        origin: req.headers['origin'],
        referer: req.headers['referer']
      }
    });
  }
});

// Refresh token
router.post('/refresh', authenticateToken, (req, res) => {
  try {
    const newToken = generateToken(req.user._id);
    
    // Set new token in cookie
    setTokenCookie(res, newToken);
    
    res.json({
      message: 'Token refreshed successfully'
      // Don't send token in response for improved security
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      message: 'Failed to refresh token',
      error: error.message
    });
  }
});

// Forgot password
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't reveal if email exists
      return res.json({
        message: 'If the email exists, a password reset link has been sent'
      });
    }

    // Generate reset token
    const resetToken = jwt.sign(
      { userId: user._id, type: 'password_reset' },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // TODO: Send email with reset link
    // For now, just return success
    res.json({
      message: 'If the email exists, a password reset link has been sent',
      resetToken // Remove this in production
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      message: 'Failed to process forgot password request',
      error: error.message
    });
  }
});

// Reset password
router.post('/reset-password', [
  body('token').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { token, newPassword } = req.body;

    // Verify reset token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.type !== 'password_reset') {
      return res.status(400).json({
        message: 'Invalid reset token',
        code: 'INVALID_RESET_TOKEN'
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(400).json({
        message: 'User not found',
        code: 'USER_NOT_FOUND'
      });
    }

    // Update password
    user.password = newPassword;
    await user.save();

    res.json({
      message: 'Password reset successfully'
    });
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(400).json({
        message: 'Invalid or expired reset token',
        code: 'INVALID_RESET_TOKEN'
      });
    }
    
    console.error('Reset password error:', error);
    res.status(500).json({
      message: 'Failed to reset password',
      error: error.message
    });
  }
});

module.exports = router;
