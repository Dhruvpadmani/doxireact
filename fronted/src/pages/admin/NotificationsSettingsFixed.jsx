import React, { useState, useEffect, useCallback } from 'react';
import { 
  MessageCircle,
  Settings,
  Bell,
  Mail,
  Calendar,
  AlertTriangle,
  User,
  Users,
  CheckCircle,
  Send,
  XCircle,
  Filter,
  Search,
  Plus,
  Save,
  Edit,
  Trash2,
  Eye,
  CheckCircle as CheckCircleIcon,
  Phone,
  MapPin,
  Calendar as CalendarIcon,
  Clock,
  Shield,
  Database,
  Monitor,
  Globe,
  X
} from 'lucide-react';

const NotificationsSettings = () => {
  console.log('NotificationsSettings: component initialized');
  
  // Component states
  const [notifications, setNotifications] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [notificationsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
    priority: 'normal',
    targetUsers: 'all',
    scheduledAt: '',
    template: 'custom'
  });
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    priority: 'normal',
    targetUsers: 'all'
  });
  const [formErrors, setFormErrors] = useState({});

  // Handle send notification
  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      // Create new notification
      const notificationToSend = {
        id: Date.now().toString(),
        title: newNotification.title,
        message: newNotification.message,
        priority: newNotification.priority,
        targetUsers: newNotification.targetUsers,
        createdAt: new Date().toISOString(),
        readStatus: false,
        sentCount: 0,
        template: 'custom'
      };
      
      // Add to notifications list
      setNotifications(prev => [notificationToSend, ...prev]);
      setSuccess('Notification sent successfully');
      
      // Reset form
      setNewNotification({
        title: '',
        message: '',
        priority: 'normal',
        targetUsers: 'all'
      });
    } catch (error) {
      console.error('Failed to send notification:', error);
      setError('Failed to send notification');
    }
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Title is required';
    if (!formData.message.trim()) errors.message = 'Message is required';
    if (formData.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';
    if (formData.message.trim().length < 10) errors.message = 'Message must be at least 10 characters';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreateNotification = async () => {
    if (!validateForm()) return;
    
    try {
      const newNotification = {
        id: Date.now().toString(),
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        targetUsers: formData.targetUsers,
        createdAt: new Date().toISOString(),
        readStatus: false,
        sentCount: 0,
        template: formData.template,
        scheduledAt: formData.scheduledAt || null
      };
      
      setNotifications(prev => [newNotification, ...prev]);
      setSuccess('Notification created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create notification:', error);
      setError('Failed to create notification');
    }
  };

  const handleUpdateNotification = async () => {
    if (!validateForm()) return;
    
    try {
      const updatedNotification = {
        ...selectedNotification,
        title: formData.title,
        message: formData.message,
        priority: formData.priority,
        targetUsers: formData.targetUsers,
        template: formData.template,
        scheduledAt: formData.scheduledAt || null
      };
      
      setNotifications(prev => prev.map(n => 
        n.id === selectedNotification.id ? updatedNotification : n
      ));
      setSuccess('Notification updated successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update notification:', error);
      setError('Failed to update notification');
    }
  };

  const handleDeleteNotification = async () => {
    try {
      setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
      setSuccess('Notification deleted successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete notification:', error);
      setError('Failed to delete notification');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      message: '',
      priority: 'normal',
      targetUsers: 'all',
      scheduledAt: '',
      template: 'custom'
    });
    setFormErrors({});
    setSelectedNotification(null);
  };

  // Modal handlers
  const handleViewNotification = (notification) => {
    setSelectedNotification(notification);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditNotification = (notification) => {
    setSelectedNotification(notification);
    setFormData({
      title: notification.title || '',
      message: notification.message || '',
      priority: notification.priority || 'normal',
      targetUsers: notification.targetUsers || 'all',
      scheduledAt: notification.scheduledAt || '',
      template: notification.template || 'custom'
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteNotificationClick = (notification) => {
    setSelectedNotification(notification);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateNotificationClick = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  // Initialize data
  useEffect(() => {
    console.log('NotificationsSettings: useEffect triggered');
    // Simulate data fetching
    setTimeout(() => {
      // Sample notifications data
      const sampleNotifications = [
        {
          id: '1',
          title: 'System Maintenance',
          message: 'Scheduled maintenance on Sunday at 2:00 AM. The system will be unavailable for approximately 2 hours.',
          priority: 'high',
          targetUsers: 'all',
          createdAt: new Date().toISOString(),
          readStatus: false,
          sentCount: 150,
          template: 'maintenance'
        },
        {
          id: '2',
          title: 'New Feature Available',
          message: 'We have added a new appointment scheduling feature. Check it out in your dashboard!',
          priority: 'normal',
          targetUsers: 'patients',
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          readStatus: true,
          sentCount: 75,
          template: 'feature'
        },
        {
          id: '3',
          title: 'Emergency Alert',
          message: 'Due to severe weather conditions, some appointments may be rescheduled. Please check your notifications.',
          priority: 'urgent',
          targetUsers: 'all',
          createdAt: new Date(Date.now() - 7200000).toISOString(),
          readStatus: false,
          sentCount: 200,
          template: 'emergency'
        }
      ];
      
      // Set default settings
      const defaultSettings = {
        appointmentReminderTime: 24,
        emergencyAlertEnabled: true,
        newFeatureNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        autoDeleteOldNotifications: true,
        notificationRetentionDays: 30
      };
      
      setNotifications(sampleNotifications);
      setSystemSettings(defaultSettings);
      setLoading(false);
      console.log('NotificationsSettings: data loaded and loading set to false');
    }, 1000); // Simulate network delay
  }, []);

  const handleUpdateSetting = (key, value) => {
    setSystemSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || notification.priority === filterType;
    
    return matchesSearch && matchesFilter;
  });

  console.log('NotificationsSettings: rendering, loading =', loading);

  // Simple test render to check if component is working
  if (loading) {
    console.log('NotificationsSettings: showing loading state');
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Notifications & Settings</h1>
        <div className="space-y-6">
          <div className="h-8 w-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Notifications & Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Send announcements, manage global settings, emergency alerts
          </p>
        </div>
        <button
          onClick={handleCreateNotificationClick}
          className="btn btn-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Create Notification
        </button>
      </div>
    </div>
  );
};

export default NotificationsSettings;