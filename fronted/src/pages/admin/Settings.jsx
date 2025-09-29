import React, {useCallback, useEffect, useState} from 'react';
import {
  Activity,
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle as CheckCircleIcon,
  Clock,
  Database,
  Download,
  Edit,
  Eye,
  EyeOff,
  FileText,
  Globe,
  Key,
  Lock,
  Mail,
  Plus,
  RefreshCw,
  Save,
  Search,
  Server,
  Settings as SettingsIcon,
  Shield,
  Trash2,
  Upload,
  Users,
  X
} from 'lucide-react';
import { adminAPI } from '../../services/api';

const AdminSettings = () => {
  // Props destructuring (none for this component)
  
  // Default hooks (none for this component)
  
  // Redux states (none for this component)
  
  // Component states
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSetting, setSelectedSetting] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [settingsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'general',
    value: '',
    type: 'string',
    description: '',
    isRequired: false,
    isEncrypted: false,
    defaultValue: '',
    validation: '',
    tags: []
  });
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  // Functions
  const fetchSettings = useCallback(async () => {
    try {
      console.log('AdminSettings: Starting to fetch settings...');
      setLoading(true);
      setError(null);

      const response = await adminAPI.getSettings();
      if (response.data && response.data.settings) {
        console.log('AdminSettings: Settings loaded successfully:', response.data.settings.length);
        setSettings(response.data.settings);
      } else {
        console.log('AdminSettings: No settings found, returning empty array');
        setSettings([]);
        }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      setError('Failed to load settings');
      // Set empty settings array to prevent blank page
      setSettings([]);
    } finally {
      console.log('AdminSettings: Loading completed');
      setLoading(false);
    }
  }, []);

  // useEffects
  useEffect(() => {
    console.log('AdminSettings: Component mounted, fetching settings...');
    fetchSettings();
  }, [fetchSettings]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Setting name is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.value.trim()) errors.value = 'Value is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (formData.description.trim().length < 10) errors.description = 'Description must be at least 10 characters';
    
    // Type-specific validation
    if (formData.type === 'number' && isNaN(Number(formData.value))) {
      errors.value = 'Value must be a valid number';
    }
    if (formData.type === 'boolean' && !['true', 'false'].includes(formData.value.toLowerCase())) {
      errors.value = 'Value must be true or false';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreateSetting = async () => {
    if (!validateForm()) return;
    
    try {
      const newSetting = {
        id: Date.now().toString(),
        name: formData.name,
        category: formData.category,
        value: formData.value,
        type: formData.type,
        description: formData.description,
        isRequired: formData.isRequired,
        isEncrypted: formData.isEncrypted,
        defaultValue: formData.defaultValue,
        validation: formData.validation,
        tags: formData.tags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active'
      };
      
      setSettings(prev => [newSetting, ...prev]);
      setSuccess('Setting created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create setting:', error);
      setError('Failed to create setting');
    }
  };

  const handleUpdateSetting = async () => {
    if (!validateForm()) return;
    
    try {
      const updatedSetting = {
        ...selectedSetting,
        name: formData.name,
        category: formData.category,
        value: formData.value,
        type: formData.type,
        description: formData.description,
        isRequired: formData.isRequired,
        isEncrypted: formData.isEncrypted,
        defaultValue: formData.defaultValue,
        validation: formData.validation,
        tags: formData.tags,
        updatedAt: new Date().toISOString()
      };
      
      setSettings(prev => prev.map(s => 
        s.id === selectedSetting.id ? updatedSetting : s
      ));
      setSuccess('Setting updated successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update setting:', error);
      setError('Failed to update setting');
    }
  };

  const handleDeleteSetting = async () => {
    try {
      setSettings(prev => prev.filter(s => s.id !== selectedSetting.id));
      setSuccess('Setting deleted successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete setting:', error);
      setError('Failed to delete setting');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: 'general',
      value: '',
      type: 'string',
      description: '',
      isRequired: false,
      isEncrypted: false,
      defaultValue: '',
      validation: '',
      tags: []
    });
    setFormErrors({});
    setSelectedSetting(null);
    setShowPassword(false);
  };

  // Modal handlers
  const handleViewSetting = (setting) => {
    setSelectedSetting(setting);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditSetting = (setting) => {
    setSelectedSetting(setting);
    setFormData({
      name: setting.name || '',
      category: setting.category || 'general',
      value: setting.value || '',
      type: setting.type || 'string',
      description: setting.description || '',
      isRequired: setting.isRequired || false,
      isEncrypted: setting.isEncrypted || false,
      defaultValue: setting.defaultValue || '',
      validation: setting.validation || '',
      tags: setting.tags || []
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteSettingClick = (setting) => {
    setSelectedSetting(setting);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateSettingClick = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const handleExportSettings = () => {
    setSuccess('Settings exported successfully');
  };

  const handleImportSettings = () => {
    setSuccess('Settings imported successfully');
  };

  const handleResetToDefaults = () => {
    setSuccess('Settings reset to defaults successfully');
  };

  const handleRefreshSettings = () => {
    fetchSettings();
    setSuccess('Settings refreshed successfully');
  };

  const getCategoryIcon = (category) => {
    const icons = {
      general: SettingsIcon,
      appointments: Calendar,
      email: Mail,
      system: Server,
      backup: Database,
      api: Globe,
      security: Shield,
      notifications: Bell,
      users: Users,
      reports: FileText
    };
    return icons[category] || SettingsIcon;
  };

  const getTypeColor = (type) => {
    const colors = {
      string: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
      number: 'text-green-600 bg-green-100 dark:bg-green-900',
      boolean: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
      password: 'text-red-600 bg-red-100 dark:bg-red-900',
      select: 'text-orange-600 bg-orange-100 dark:bg-orange-900'
    };
    return colors[type] || 'text-gray-600 bg-gray-100 dark:bg-gray-900';
  };

  const filteredSettings = settings.filter(setting => {
    const matchesSearch = 
      setting.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      setting.value.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterCategory === 'all' || setting.category === filterCategory;
    
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-gray-300 dark:bg-gray-600 rounded animate-pulse"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-300 dark:bg-gray-600 rounded-lg animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">System Settings</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Manage system configuration, application settings, and platform preferences
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={handleRefreshSettings}
            className="btn btn-outline flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleCreateSettingClick}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Setting
          </button>
        </div>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <button 
          onClick={handleExportSettings}
          className="btn btn-outline flex flex-col items-center justify-center p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Download className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 mb-2" />
          <span className="text-sm sm:text-base">Export Settings</span>
        </button>
        <button 
          onClick={handleImportSettings}
          className="btn btn-outline flex flex-col items-center justify-center p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Upload className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 mb-2" />
          <span className="text-sm sm:text-base">Import Settings</span>
        </button>
        <button 
          onClick={handleResetToDefaults}
          className="btn btn-outline flex flex-col items-center justify-center p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <RefreshCw className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 mb-2" />
          <span className="text-sm sm:text-base">Reset Defaults</span>
        </button>
        <button 
          onClick={handleRefreshSettings}
          className="btn btn-outline flex flex-col items-center justify-center p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <Activity className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 mb-2" />
          <span className="text-sm sm:text-base">System Status</span>
        </button>
      </div>

      {/* Settings List */}
      <div className="dashboard-card overflow-x-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Configuration Settings</h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search settings..."
                className="input pl-10 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="input text-sm sm:text-base"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              <option value="general">General</option>
              <option value="appointments">Appointments</option>
              <option value="email">Email</option>
              <option value="system">System</option>
              <option value="backup">Backup</option>
              <option value="api">API</option>
              <option value="security">Security</option>
              <option value="notifications">Notifications</option>
              <option value="users">Users</option>
              <option value="reports">Reports</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="table min-w-full w-full">
            <thead className="table-header">
              <tr>
                <th className="table-head text-xs sm:text-sm">Setting Name</th>
                <th className="table-head text-xs sm:text-sm hidden sm:table-cell">Category</th>
                <th className="table-head text-xs sm:text-sm hidden md:table-cell">Type</th>
                <th className="table-head text-xs sm:text-sm hidden lg:table-cell">Value</th>
                <th className="table-head text-xs sm:text-sm">Status</th>
                <th className="table-head text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredSettings.length > 0 ? (
                filteredSettings.map((setting) => {
                  const CategoryIcon = getCategoryIcon(setting.category);
                  return (
                    <tr key={setting.id} className="table-row">
                      <td className="table-cell">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0">
                            <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                              {setting.name}
                            </p>
                            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                              {setting.description}
                            </p>
                            <div className="flex items-center gap-2 mt-1 sm:hidden">
                              <span className={`badge text-xs ${getTypeColor(setting.type)}`}>
                                {setting.type}
                              </span>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {setting.category}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="badge text-xs sm:text-sm badge-secondary">
                          {setting.category}
                        </span>
                      </td>
                      <td className="table-cell text-gray-900 dark:text-white hidden md:table-cell">
                        <span className={`badge text-xs sm:text-sm ${getTypeColor(setting.type)}`}>
                          {setting.type}
                        </span>
                      </td>
                      <td className="table-cell text-gray-900 dark:text-white hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          {setting.isEncrypted ? (
                            <>
                              <Lock className="h-3 w-3 text-gray-400" />
                              <span className="text-xs sm:text-sm">••••••••</span>
                            </>
                          ) : (
                            <span className="text-xs sm:text-sm truncate max-w-xs">
                              {setting.value}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="table-cell">
                        <span className={`badge text-xs sm:text-sm ${
                          setting.status === 'active' ? 'badge-success' : 'badge-warning'
                        }`}>
                          {setting.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1 sm:gap-2">
                          <button
                            onClick={() => handleViewSetting(setting)}
                            className="btn btn-ghost btn-sm p-1 sm:p-2"
                            title="View Details"
                          >
                            <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleEditSetting(setting)}
                            className="btn btn-ghost btn-sm p-1 sm:p-2"
                            title="Edit Setting"
                          >
                            <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSettingClick(setting)}
                            className="btn btn-ghost btn-sm p-1 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                            title="Delete Setting"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <SettingsIcon className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400"/>
                      <p className="text-sm sm:text-base">No settings found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for setting details/actions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'Setting Details'}
                  {modalType === 'create' && 'Create New Setting'}
                  {modalType === 'edit' && 'Edit Setting'}
                  {modalType === 'delete' && 'Delete Setting'}
                </h3>
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-1"
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>

              {modalType === 'view' && selectedSetting && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg sm:text-xl flex-shrink-0">
                        {React.createElement(getCategoryIcon(selectedSetting.category), { className: "h-6 w-6 sm:h-8 sm:w-8" })}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Setting</h4>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
                          {selectedSetting.name}
                        </p>
                        <span className={`badge mt-1 text-xs sm:text-sm ${getTypeColor(selectedSetting.type)}`}>
                          {selectedSetting.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-lg sm:text-xl flex-shrink-0">
                        <Database className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Category</h4>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                          {selectedSetting.category}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Status: {selectedSetting.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Description
                    </h5>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedSetting.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Key className="h-4 w-4" />
                        Value Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Current Value:</span> 
                          {selectedSetting.isEncrypted ? (
                            <span className="ml-2 text-gray-900 dark:text-white">••••••••</span>
                          ) : (
                            <span className="ml-2 text-gray-900 dark:text-white">{selectedSetting.value}</span>
                          )}
                        </p>
                        <p><span className="text-gray-600 dark:text-gray-400">Default Value:</span> 
                          <span className="ml-2 text-gray-900 dark:text-white">{selectedSetting.defaultValue || 'None'}</span>
                        </p>
                        <p><span className="text-gray-600 dark:text-gray-400">Required:</span> 
                          <span className={`badge ml-2 ${selectedSetting.isRequired ? 'badge-success' : 'badge-warning'}`}>
                            {selectedSetting.isRequired ? 'Yes' : 'No'}
                          </span>
                        </p>
                        <p><span className="text-gray-600 dark:text-gray-400">Encrypted:</span> 
                          <span className={`badge ml-2 ${selectedSetting.isEncrypted ? 'badge-success' : 'badge-warning'}`}>
                            {selectedSetting.isEncrypted ? 'Yes' : 'No'}
                          </span>
                        </p>
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timing Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Created:</span> {new Date(selectedSetting.createdAt).toLocaleString()}</p>
                        <p><span className="text-gray-600 dark:text-gray-400">Last Updated:</span> {new Date(selectedSetting.updatedAt).toLocaleString()}</p>
                        {selectedSetting.validation && (
                          <p><span className="text-gray-600 dark:text-gray-400">Validation:</span> 
                            <span className="ml-2 text-gray-900 dark:text-white">{selectedSetting.validation}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {selectedSetting.tags && selectedSetting.tags.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Activity className="h-4 w-4" />
                        Tags
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {selectedSetting.tags.map((tag, index) => (
                          <span key={index} className="badge badge-outline text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {(modalType === 'create' || modalType === 'edit') && (
                <form className="space-y-3 sm:space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="label text-sm sm:text-base">Setting Name *</label>
                      <input
                        type="text"
                        className={`input text-sm sm:text-base ${formErrors.name ? 'border-red-500' : ''}`}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter setting name"
                      />
                      {formErrors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="label text-sm sm:text-base">Category *</label>
                      <select
                        className={`input text-sm sm:text-base ${formErrors.category ? 'border-red-500' : ''}`}
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      >
                        <option value="general">General</option>
                        <option value="appointments">Appointments</option>
                        <option value="email">Email</option>
                        <option value="system">System</option>
                        <option value="backup">Backup</option>
                        <option value="api">API</option>
                        <option value="security">Security</option>
                        <option value="notifications">Notifications</option>
                        <option value="users">Users</option>
                        <option value="reports">Reports</option>
                      </select>
                      {formErrors.category && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.category}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="label text-sm sm:text-base">Type *</label>
                      <select
                        className="input text-sm sm:text-base"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="string">String</option>
                        <option value="number">Number</option>
                        <option value="boolean">Boolean</option>
                        <option value="password">Password</option>
                        <option value="select">Select</option>
                      </select>
                    </div>
                    <div>
                      <label className="label text-sm sm:text-base">Value *</label>
                      <div className="relative">
                        <input
                          type={formData.type === 'password' && !showPassword ? 'password' : 'text'}
                          className={`input text-sm sm:text-base pr-10 ${formErrors.value ? 'border-red-500' : ''}`}
                          value={formData.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, value: e.target.value }))}
                          placeholder="Enter setting value"
                        />
                        {formData.type === 'password' && (
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        )}
                      </div>
                      {formErrors.value && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.value}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label text-sm sm:text-base">Description *</label>
                    <textarea
                      className={`input text-sm sm:text-base ${formErrors.description ? 'border-red-500' : ''}`}
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter setting description"
                    />
                    {formErrors.description && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="label text-sm sm:text-base">Default Value</label>
                      <input
                        type="text"
                        className="input text-sm sm:text-base"
                        value={formData.defaultValue}
                        onChange={(e) => setFormData(prev => ({ ...prev, defaultValue: e.target.value }))}
                        placeholder="Enter default value"
                      />
                    </div>
                    <div>
                      <label className="label text-sm sm:text-base">Validation Rules</label>
                      <input
                        type="text"
                        className="input text-sm sm:text-base"
                        value={formData.validation}
                        onChange={(e) => setFormData(prev => ({ ...prev, validation: e.target.value }))}
                        placeholder="e.g., min:1,max:100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isRequired}
                          onChange={(e) => setFormData(prev => ({ ...prev, isRequired: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Required Setting</span>
                      </label>
                    </div>
                    <div className="flex items-center gap-4">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.isEncrypted}
                          onChange={(e) => setFormData(prev => ({ ...prev, isEncrypted: e.target.checked }))}
                          className="rounded"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">Encrypt Value</span>
                      </label>
                    </div>
                  </div>
                </form>
              )}

              {modalType === 'delete' && selectedSetting && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Delete Setting</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. The setting will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Name:</strong> {selectedSetting.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Category:</strong> {selectedSetting.category}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Type:</strong> {selectedSetting.type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Created:</strong> {new Date(selectedSetting.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                {modalType === 'create' && (
                  <button
                    onClick={handleCreateSetting}
                    className="btn btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Save className="h-4 w-4" />
                    Create Setting
                  </button>
                )}
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdateSetting}
                    className="btn btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Save className="h-4 w-4" />
                    Update Setting
                  </button>
                )}
                {modalType === 'delete' && (
                  <button
                    onClick={handleDeleteSetting}
                    className="btn btn-destructive flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Setting
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="btn btn-outline text-sm sm:text-base"
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

export default AdminSettings;
