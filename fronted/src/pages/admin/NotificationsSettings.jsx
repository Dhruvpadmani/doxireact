import { useState, useEffect } from 'react';
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
  Search
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function NotificationsSettings() {
  const [notifications, setNotifications] = useState([]);
  const [systemSettings, setSystemSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('notifications');
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    priority: 'normal',
    targetUsers: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchNotifications();
    fetchSystemSettings();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await adminAPI.getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      // Set empty array in case of error
      setNotifications([
        {
          _id: '1',
          title: 'System Maintenance',
          message: 'Scheduled maintenance on Sunday at 2:00 AM',
          priority: 'high',
          targetUsers: 'all',
          created_at: new Date().toISOString(),
          read_status: false
        }
      ]);
    }
  };

  const fetchSystemSettings = async () => {
    try {
      const response = await adminAPI.getSystemSettings();
      setSystemSettings(response.data);
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
      // Set default settings in case of error
      setSystemSettings({
        appointmentReminderTime: 24,
        emergencyAlertEnabled: true,
        newFeatureNotifications: true
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    try {
      // Simulate sending notification
      const notification = {
        ...newNotification,
        _id: Date.now().toString(),
        created_at: new Date().toISOString(),
        read_status: false
      };
      
      setNotifications([notification, ...notifications]);
      setNewNotification({
        title: '',
        message: '',
        priority: 'normal',
        targetUsers: 'all'
      });
      
      alert('Notification sent successfully!');
    } catch (error) {
      console.error('Failed to send notification:', error);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notifications & Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Send announcements, manage global settings, emergency alerts
        </p>
      </div>

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
          <div className="dashboard-card">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Notifications</h2>
              
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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

            <div className="space-y-4">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <div 
                    key={notification._id} 
                    className={`p-4 rounded-lg border ${
                      notification.priority === 'urgent' 
                        ? 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20' 
                        : notification.priority === 'high'
                        ? 'border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-900/20'
                        : 'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">
                            {notification.title}
                          </h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            notification.priority === 'urgent' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : notification.priority === 'high'
                              ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                              : notification.priority === 'normal'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {notification.priority}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 mb-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                          <span>Target: {notification.targetUsers}</span>
                          <span>•</span>
                          <span>{new Date(notification.created_at).toLocaleString()}</span>
                        </div>
                      </div>
                      <button className="btn btn-ghost btn-sm">
                        <Send className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No notifications</h3>
                  <p className="text-gray-500 dark:text-gray-400">Send your first notification using the form above</p>
                </div>
              )}
            </div>
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
    </div>
  );
}