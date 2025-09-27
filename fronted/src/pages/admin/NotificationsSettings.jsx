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
import LoadingSpinner from '../../components/LoadingSpinner';

const NotificationsSettings = () => {
  console.log('NotificationsSettings: component initialized');
  
  // Props destructuring (none for this component)
  
  // Default hooks (none for this component)
  
  // Redux states (none for this component)
  
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

  // Functions
  const fetchNotifications = useCallback(() => {
    console.log('NotificationsSettings: fetchNotifications called');
    try {
      setError(null);
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
      setNotifications(sampleNotifications);
      console.log('NotificationsSettings: notifications set');
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setError('Failed to load notifications');
    }
  }, []);

  const fetchSystemSettings = useCallback(() => {
    console.log('NotificationsSettings: fetchSystemSettings called');
    try {
      // Set default settings
      setSystemSettings({
        appointmentReminderTime: 24,
        emergencyAlertEnabled: true,
        newFeatureNotifications: true,
        emailNotifications: true,
        smsNotifications: false,
        pushNotifications: true,
        autoDeleteOldNotifications: true,
        notificationRetentionDays: 30
      });
      console.log('NotificationsSettings: system settings set');
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
    } finally {
      console.log('NotificationsSettings: setting loading to false');
      setLoading(false);
    }
  }, []);

  // useEffects
  useEffect(() => {
    console.log('NotificationsSettings: useEffect triggered');
    fetchNotifications();
    fetchSystemSettings();
  }, [fetchNotifications, fetchSystemSettings]);

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

      {/* Success/Error Messages */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg flex items-center gap-3">
          <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-400" />
          <p className="text-sm text-green-600 dark:text-green-400">{success}</p>
          <button
            onClick={() => setSuccess(null)}
            className="ml-auto text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'notifications'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Bell className="h-4 w-4 inline mr-2" />
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'settings'
              ? 'text-primary-600 border-b-2 border-primary-600'
              : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Settings className="h-4 w-4 inline mr-2" />
          Settings
        </button>
      </div>

      {activeTab === 'notifications' && (
        <div className="space-y-6">
          {/* Send Notification Form */}
          <div className="dashboard-card p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Send New Notification</h2>
            <form onSubmit={handleSendNotification}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="label">Title</label>
                  <input
                    type="text"
                    value={newNotification.title}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                    required
                    className="input w-full"
                    placeholder="Enter notification title"
                  />
                </div>
                <div>
                  <label className="label">Priority</label>
                  <select
                    value={newNotification.priority}
                    onChange={(e) => setNewNotification(prev => ({ ...prev, priority: e.target.value }))}
                    className="input w-full"
                  >
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="label">Message</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  required
                  rows={3}
                  className="input w-full"
                  placeholder="Enter notification message"
                />
              </div>
              
              <div className="mb-6">
                <label className="label">Target Users</label>
                <select
                  value={newNotification.targetUsers}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, targetUsers: e.target.value }))}
                  className="input w-full"
                >
                  <option value="all">All Users</option>
                  <option value="patients">Patients Only</option>
                  <option value="doctors">Doctors Only</option>
                  <option value="admin">Admin Only</option>
                </select>
              </div>
              
              <button
                type="submit"
                className="btn btn-primary flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                Send Notification
              </button>
            </form>
          </div>

          {/* Notifications List */}
          <div className="dashboard-card overflow-x-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Notifications</h2>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    className="input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="input"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Priority</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>

            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-head">Title</th>
                  <th className="table-head">Priority</th>
                  <th className="table-head">Target</th>
                  <th className="table-head">Sent Count</th>
                  <th className="table-head">Created</th>
                  <th className="table-head">Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredNotifications.length > 0 ? (
                  filteredNotifications.map((notification) => (
                    <tr key={notification.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                            <Bell className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                              {notification.message}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge ${
                          notification.priority === 'urgent' ? 'badge-destructive' :
                          notification.priority === 'high' ? 'badge-warning' :
                          notification.priority === 'normal' ? 'badge-success' :
                          'badge-secondary'
                        }`}>
                          {notification.priority}
                        </span>
                      </td>
                      <td className="table-cell text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-gray-400" />
                          {notification.targetUsers}
                        </div>
                      </td>
                      <td className="table-cell text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1">
                          <Send className="h-3 w-3 text-gray-400" />
                          {notification.sentCount}
                        </div>
                      </td>
                      <td className="table-cell text-gray-900 dark:text-white">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewNotification(notification)}
                            className="btn btn-ghost btn-sm"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditNotification(notification)}
                            className="btn btn-ghost btn-sm"
                            title="Edit Notification"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteNotificationClick(notification)}
                            className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete Notification"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                      <div className="flex flex-col items-center gap-2">
                        <Bell className="h-12 w-12 text-gray-400" />
                        <p>No notifications found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="dashboard-card p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">System Settings</h2>
          
          <div className="space-y-6">
            {/* Appointment Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Appointment Settings
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">Appointment Reminder Time (hours)</label>
                  <input
                    type="number"
                    value={systemSettings.appointmentReminderTime}
                    onChange={(e) => handleUpdateSetting('appointmentReminderTime', parseInt(e.target.value))}
                    className="input w-full"
                    min="1"
                    max="48"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Send reminder notifications this many hours before appointment
                  </p>
                </div>
              </div>
            </div>

            {/* Emergency Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Emergency Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="label">Emergency Alert System</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Enable emergency notifications to users
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpdateSetting('emergencyAlertEnabled', !systemSettings.emergencyAlertEnabled)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      systemSettings.emergencyAlertEnabled ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        systemSettings.emergencyAlertEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification Settings
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="label">New Feature Notifications</label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Send notifications about new features
                    </p>
                  </div>
                  <button
                    onClick={() => handleUpdateSetting('newFeatureNotifications', !systemSettings.newFeatureNotifications)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full ${
                      systemSettings.newFeatureNotifications ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                        systemSettings.newFeatureNotifications ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* User Management Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Management
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label">New User Verification</label>
                  <select className="input w-full">
                    <option value="auto">Auto-verify new users</option>
                    <option value="manual">Manual verification required</option>
                    <option value="email">Email verification required</option>
                  </select>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    How to handle new user registrations
                  </p>
                </div>
                <div>
                  <label className="label">Account Inactivity Period (days)</label>
                  <input
                    type="number"
                    className="input w-full"
                    placeholder="365"
                    defaultValue="365"
                  />
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Inactive accounts will be deactivated after this period
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <button className="btn btn-primary flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for notification details/actions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'Notification Details'}
                  {modalType === 'create' && 'Create New Notification'}
                  {modalType === 'edit' && 'Edit Notification'}
                  {modalType === 'delete' && 'Delete Notification'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {modalType === 'view' && selectedNotification && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        <Bell className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Notification</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedNotification.title}
                        </p>
                        <span className={`badge mt-1 ${
                          selectedNotification.priority === 'urgent' ? 'badge-destructive' :
                          selectedNotification.priority === 'high' ? 'badge-warning' :
                          selectedNotification.priority === 'normal' ? 'badge-success' :
                          'badge-secondary'
                        }`}>
                          {selectedNotification.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-xl">
                        <Users className="h-8 w-8" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Target Audience</h4>
                        <p className="text-gray-600 dark:text-gray-400">
                          {selectedNotification.targetUsers}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Sent to {selectedNotification.sentCount} users
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      Message Content
                    </h5>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedNotification.message}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timing Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Created:</span> {new Date(selectedNotification.createdAt).toLocaleString()}</p>
                        {selectedNotification.scheduledAt && (
                          <p><span className="text-gray-600 dark:text-gray-400">Scheduled:</span> {new Date(selectedNotification.scheduledAt).toLocaleString()}</p>
                        )}
                        <p><span className="text-gray-600 dark:text-gray-400">Template:</span> {selectedNotification.template}</p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Statistics
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Sent Count:</span> {selectedNotification.sentCount}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Read Status:</span> 
                          <span className={`badge ml-2 ${selectedNotification.readStatus ? 'badge-success' : 'badge-warning'}`}>
                            {selectedNotification.readStatus ? 'Read' : 'Unread'}
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(modalType === 'create' || modalType === 'edit') && (
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Title *</label>
                      <input
                        type="text"
                        className={`input ${formErrors.title ? 'border-red-500' : ''}`}
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter notification title"
                      />
                      {formErrors.title && <p className="text-red-500 text-sm mt-1">{formErrors.title}</p>}
                    </div>
                    <div>
                      <label className="label">Priority</label>
                      <select
                        className="input"
                        value={formData.priority}
                        onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value }))}
                      >
                        <option value="low">Low</option>
                        <option value="normal">Normal</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Message *</label>
                    <textarea
                      className={`input ${formErrors.message ? 'border-red-500' : ''}`}
                      rows="4"
                      value={formData.message}
                      onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                      placeholder="Enter notification message"
                    />
                    {formErrors.message && <p className="text-red-500 text-sm mt-1">{formErrors.message}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="label">Target Users</label>
                      <select
                        className="input"
                        value={formData.targetUsers}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetUsers: e.target.value }))}
                      >
                        <option value="all">All Users</option>
                        <option value="patients">Patients Only</option>
                        <option value="doctors">Doctors Only</option>
                        <option value="admin">Admin Only</option>
                      </select>
                    </div>
                    <div>
                      <label className="label">Template</label>
                      <select
                        className="input"
                        value={formData.template}
                        onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                      >
                        <option value="custom">Custom</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="feature">New Feature</option>
                        <option value="emergency">Emergency</option>
                        <option value="reminder">Reminder</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label">Schedule Notification (Optional)</label>
                    <input
                      type="datetime-local"
                      className="input"
                      value={formData.scheduledAt}
                      onChange={(e) => setFormData(prev => ({ ...prev, scheduledAt: e.target.value }))}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Leave empty to send immediately
                    </p>
                  </div>
                </form>
              )}

              {modalType === 'delete' && selectedNotification && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Delete Notification</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. The notification will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Title:</strong> {selectedNotification.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Priority:</strong> {selectedNotification.priority}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Target:</strong> {selectedNotification.targetUsers}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Created:</strong> {new Date(selectedNotification.createdAt).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Sent Count:</strong> {selectedNotification.sentCount}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                {modalType === 'create' && (
                  <button
                    onClick={handleCreateNotification}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Create Notification
                  </button>
                )}
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdateNotification}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    Update Notification
                  </button>
                )}
                {modalType === 'delete' && (
                  <button
                    onClick={handleDeleteNotification}
                    className="btn btn-destructive flex items-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Notification
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsSettings;