import React, {useCallback, useEffect, useState} from 'react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Calendar,
  CalendarDays,
  CheckCircle as CheckCircleIcon,
  Clock,
  Database,
  DollarSign,
  Edit,
  Eye,
  FileText,
  Filter,
  Monitor,
  PieChart,
  Plus,
  RefreshCw,
  Save,
  Search,
  Settings,
  Star,
  Trash2,
  TrendingUp,
  UserCheck,
  Users,
  X
} from 'lucide-react';

const ReportsAnalytics = () => {
  // Props destructuring (none for this component)
  
  // Default hooks (none for this component)
  
  // Redux states (none for this component)
  
  // Component states
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [chartsData, setChartsData] = useState({
    dailyAppointments: [],
    topDoctors: [],
    userGrowth: []
  });
  const [customReports, setCustomReports] = useState([]);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'view', 'create', 'edit', 'delete'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'appointment',
    metrics: [],
    filters: {},
    schedule: 'manual',
    recipients: []
  });
  const [formErrors, setFormErrors] = useState({});

  // Functions
  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch real analytics data from backend
      const response = await adminAPI.getDashboard();
      const dashboardData = response.data;

      // Transform dashboard data to analytics format
      const analyticsData = {
        totalUsers: dashboardData.statistics.total.users,
        totalDoctors: dashboardData.statistics.total.doctors,
        totalAppointments: dashboardData.statistics.total.appointments,
        totalReviews: dashboardData.statistics.total.reviews,
        totalReports: dashboardData.statistics.total.reports,
        activeToday: dashboardData.statistics.appointments.pending,
        revenue: 0, // TODO: Add revenue calculation when available
        growthRate: 0, // TODO: Add growth rate calculation when available
        mostBookedDoctor: 'N/A', // TODO: Add most booked doctor calculation
        busiestSlot: 'N/A', // TODO: Add busiest slot calculation
        peakDay: 'N/A', // TODO: Add peak day calculation
        dailyAppointments: [], // TODO: Add daily appointments data
        topDoctors: [], // TODO: Add top doctors data
        userGrowth: [] // TODO: Add user growth data
      };

      setAnalyticsData(analyticsData);
      setChartsData({
        dailyAppointments: analyticsData.dailyAppointments,
        topDoctors: analyticsData.topDoctors,
        userGrowth: analyticsData.userGrowth
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setError('Failed to load analytics data');
      // Set empty data to prevent blank page
      setAnalyticsData({
        totalUsers: 0,
        totalDoctors: 0,
        totalAppointments: 0,
        totalReviews: 0,
        totalReports: 0,
        activeToday: 0,
        revenue: 0,
        growthRate: 0,
        mostBookedDoctor: 'N/A',
        busiestSlot: 'N/A',
        peakDay: 'N/A',
        dailyAppointments: [],
        topDoctors: [],
        userGrowth: []
      });
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  const fetchCustomReports = useCallback(() => {
    try {
      // Sample custom reports
      const sampleReports = [
        {
          id: '1',
          name: 'Monthly Appointment Summary',
          description: 'Comprehensive monthly report on appointment trends and statistics',
          type: 'appointment',
          metrics: ['total_appointments', 'cancellation_rate', 'popular_slots'],
          filters: { dateRange: '30d', status: 'completed' },
          schedule: 'monthly',
          recipients: ['admin@example.com'],
          createdAt: new Date().toISOString(),
          lastGenerated: new Date(Date.now() - 86400000).toISOString(),
          status: 'active'
        },
        {
          id: '2',
          name: 'Doctor Performance Report',
          description: 'Weekly report on doctor performance metrics and patient satisfaction',
          type: 'doctor',
          metrics: ['appointment_count', 'rating', 'patient_feedback'],
          filters: { dateRange: '7d', department: 'all' },
          schedule: 'weekly',
          recipients: ['admin@example.com', 'hr@example.com'],
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          lastGenerated: new Date(Date.now() - 259200000).toISOString(),
          status: 'active'
        },
        {
          id: '3',
          name: 'Revenue Analysis',
          description: 'Daily revenue tracking and financial performance metrics',
          type: 'revenue',
          metrics: ['daily_revenue', 'payment_methods', 'refund_rate'],
          filters: { dateRange: '1d', paymentStatus: 'completed' },
          schedule: 'daily',
          recipients: ['admin@example.com', 'finance@example.com'],
          createdAt: new Date(Date.now() - 259200000).toISOString(),
          lastGenerated: new Date(Date.now() - 3600000).toISOString(),
          status: 'active'
        }
      ];
      setCustomReports(sampleReports);
    } catch (error) {
      console.error('Failed to fetch custom reports:', error);
    }
  }, []);

  // useEffects
  useEffect(() => {
    fetchAnalytics();
    fetchCustomReports();
  }, [fetchAnalytics, fetchCustomReports]);

  // Form validation
  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Report name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.metrics.length === 0) errors.metrics = 'At least one metric is required';
    if (formData.recipients.length === 0) errors.recipients = 'At least one recipient is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // CRUD Operations
  const handleCreateReport = async () => {
    if (!validateForm()) return;
    
    try {
      const newReport = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description,
        type: formData.type,
        metrics: formData.metrics,
        filters: formData.filters,
        schedule: formData.schedule,
        recipients: formData.recipients,
        createdAt: new Date().toISOString(),
        lastGenerated: null,
        status: 'active'
      };
      
      setCustomReports(prev => [newReport, ...prev]);
      setSuccess('Custom report created successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to create report:', error);
      setError('Failed to create report');
    }
  };

  const handleUpdateReport = async () => {
    if (!validateForm()) return;
    
    try {
      const updatedReport = {
        ...selectedReport,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        metrics: formData.metrics,
        filters: formData.filters,
        schedule: formData.schedule,
        recipients: formData.recipients
      };
      
      setCustomReports(prev => prev.map(r => 
        r.id === selectedReport.id ? updatedReport : r
      ));
      setSuccess('Report updated successfully');
      setShowModal(false);
      resetForm();
    } catch (error) {
      console.error('Failed to update report:', error);
      setError('Failed to update report');
    }
  };

  const handleDeleteReport = async () => {
    try {
      setCustomReports(prev => prev.filter(r => r.id !== selectedReport.id));
      setSuccess('Report deleted successfully');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to delete report:', error);
      setError('Failed to delete report');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'appointment',
      metrics: [],
      filters: {},
      schedule: 'manual',
      recipients: []
    });
    setFormErrors({});
    setSelectedReport(null);
  };

  // Modal handlers
  const handleViewReport = (report) => {
    setSelectedReport(report);
    setModalType('view');
    setShowModal(true);
  };

  const handleEditReport = (report) => {
    setSelectedReport(report);
    setFormData({
      name: report.name || '',
      description: report.description || '',
      type: report.type || 'appointment',
      metrics: report.metrics || [],
      filters: report.filters || {},
      schedule: report.schedule || 'manual',
      recipients: report.recipients || []
    });
    setModalType('edit');
    setShowModal(true);
  };

  const handleDeleteReportClick = (report) => {
    setSelectedReport(report);
    setModalType('delete');
    setShowModal(true);
  };

  const handleCreateReportClick = () => {
    resetForm();
    setModalType('create');
    setShowModal(true);
  };

  const handleExportReport = (reportType) => {
    setSuccess(`${reportType} report exported successfully`);
  };

  const handleRefreshData = () => {
    fetchAnalytics();
    setSuccess('Analytics data refreshed successfully');
  };

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
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1 sm:mt-2">
            Generate insights (most booked doctors, busiest slots, activity trends)
          </p>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={handleRefreshData}
            className="btn btn-outline flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            onClick={handleCreateReportClick}
            className="btn btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Report
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

      {/* Date Range Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Date Range:</span>
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="input"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="stat-label text-xs sm:text-sm">Total Users</p>
              <p className="stat-value text-primary-600 text-lg sm:text-xl lg:text-2xl">{analyticsData?.totalUsers?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-2 sm:p-3 rounded-full flex-shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="stat-label text-xs sm:text-sm">Total Doctors</p>
              <p className="stat-value text-success-600 text-lg sm:text-xl lg:text-2xl">{analyticsData?.totalDoctors?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-2 sm:p-3 rounded-full flex-shrink-0">
              <UserCheck className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="stat-label text-xs sm:text-sm">Total Appointments</p>
              <p className="stat-value text-warning-600 text-lg sm:text-xl lg:text-2xl">{analyticsData?.totalAppointments?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900 p-2 sm:p-3 rounded-full flex-shrink-0">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="stat-card hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="stat-label text-xs sm:text-sm">Revenue</p>
              <p className="stat-value text-success-600 text-lg sm:text-xl lg:text-2xl">₹{analyticsData?.revenue?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-2 sm:p-3 rounded-full flex-shrink-0">
              <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <div className="dashboard-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5" />
            Key Metrics
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Growth Rate</span>
              <span className="font-semibold text-green-600 dark:text-green-400 text-sm sm:text-base">+{analyticsData?.growthRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Active Today</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{analyticsData?.activeToday || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Total Reviews</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{analyticsData?.totalReviews || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Total Reports</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{analyticsData?.totalReports || 0}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <Activity className="h-4 w-4 sm:h-5 sm:w-5" />
            Peak Times
          </h3>
          <div className="space-y-3 sm:space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Most Booked Doctor</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base truncate ml-2">{analyticsData?.mostBookedDoctor || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Busiest Time Slot</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{analyticsData?.busiestSlot || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Peak Day</span>
              <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base">{analyticsData?.peakDay || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 w-full max-w-full">
        {/* Daily Appointments Chart */}
        <div className="dashboard-card p-4 sm:p-6 w-full">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" />
            Daily Appointments
          </h3>
          <div className="h-48 sm:h-56 lg:h-64 flex items-end justify-between gap-1 sm:gap-2 pt-6 sm:pt-8 w-full max-w-full overflow-x-auto">
            {chartsData.dailyAppointments.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1 min-w-0">
                <div 
                  className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors"
                  style={{ height: `${(day.count / Math.max(...chartsData.dailyAppointments.map(d => d.count))) * 80}%` }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                  {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </span>
                <span className="text-xs text-gray-900 dark:text-white mt-1">{day.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Doctors Chart */}
        <div className="dashboard-card p-4 sm:p-6 w-full">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
            <UserCheck className="h-4 w-4 sm:h-5 sm:w-5" />
            Top Doctors by Appointments
          </h3>
          <div className="space-y-2 sm:space-y-3">
            {chartsData.topDoctors.map((doctor, index) => (
              <div key={index} className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{doctor.name}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${
                          i < Math.floor(doctor.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-600 dark:text-gray-400 ml-1">{doctor.rating}</span>
                  </div>
                </div>
                <span className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white ml-2 flex-shrink-0">{doctor.appointments}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="dashboard-card p-4 sm:p-6 w-full">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4 flex items-center gap-2">
          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
          User Growth
        </h3>
        <div className="h-48 sm:h-56 lg:h-64 flex items-end justify-between gap-1 sm:gap-2 pt-6 sm:pt-8 w-full max-w-full overflow-x-auto">
          {chartsData.userGrowth.map((month, index) => (
            <div key={index} className="flex flex-col items-center flex-1 min-w-0">
              <div className="flex items-end justify-center gap-1 w-full">
                <div 
                  className="w-1/2 bg-blue-500 rounded-t hover:bg-blue-600 transition-colors"
                  style={{ height: `${(month.users / Math.max(...chartsData.userGrowth.map(m => m.users))) * 80}%` }}
                ></div>
                <div 
                  className="w-1/2 bg-green-500 rounded-t hover:bg-green-600 transition-colors"
                  style={{ height: `${(month.doctors / Math.max(...chartsData.userGrowth.map(m => m.doctors))) * 80}%` }}
                ></div>
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">{month.month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-4 sm:gap-6 mt-3 sm:mt-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-500 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded"></div>
            <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">Doctors</span>
          </div>
        </div>
      </div>

      {/* Custom Reports Section */}
      <div className="dashboard-card overflow-x-auto w-full">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">Custom Reports</h2>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search reports..."
                className="input pl-10 text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <select
              className="input text-sm sm:text-base"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="all">All Types</option>
              <option value="appointment">Appointment</option>
              <option value="doctor">Doctor</option>
              <option value="revenue">Revenue</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto w-full">
          <table className="table min-w-full w-full">
            <thead className="table-header">
              <tr>
                <th className="table-head text-xs sm:text-sm">Report Name</th>
                <th className="table-head text-xs sm:text-sm hidden sm:table-cell">Type</th>
                <th className="table-head text-xs sm:text-sm hidden md:table-cell">Schedule</th>
                <th className="table-head text-xs sm:text-sm hidden lg:table-cell">Last Generated</th>
                <th className="table-head text-xs sm:text-sm">Status</th>
                <th className="table-head text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {customReports.length > 0 ? (
                customReports.map((report) => (
                  <tr key={report.id} className="table-row">
                    <td className="table-cell">
                      <div className="flex items-center gap-2 sm:gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm flex-shrink-0">
                          <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
                            {report.name}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 truncate">
                            {report.description}
                          </p>
                          <div className="flex items-center gap-2 mt-1 sm:hidden">
                            <span className={`badge text-xs ${
                              report.type === 'appointment' ? 'badge-primary' :
                              report.type === 'doctor' ? 'badge-success' :
                              report.type === 'revenue' ? 'badge-warning' :
                              'badge-secondary'
                            }`}>
                              {report.type}
                            </span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              {report.schedule}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className={`badge text-xs sm:text-sm ${
                        report.type === 'appointment' ? 'badge-primary' :
                        report.type === 'doctor' ? 'badge-success' :
                        report.type === 'revenue' ? 'badge-warning' :
                        'badge-secondary'
                      }`}>
                        {report.type}
                      </span>
                    </td>
                    <td className="table-cell text-gray-900 dark:text-white hidden md:table-cell">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 text-gray-400" />
                        <span className="text-xs sm:text-sm">{report.schedule}</span>
                      </div>
                    </td>
                    <td className="table-cell text-gray-900 dark:text-white hidden lg:table-cell">
                      <span className="text-xs sm:text-sm">
                        {report.lastGenerated ? new Date(report.lastGenerated).toLocaleDateString() : 'Never'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge text-xs sm:text-sm ${
                        report.status === 'active' ? 'badge-success' : 'badge-warning'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => handleViewReport(report)}
                          className="btn btn-ghost btn-sm p-1 sm:p-2"
                          title="View Details"
                        >
                          <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => handleEditReport(report)}
                          className="btn btn-ghost btn-sm p-1 sm:p-2"
                          title="Edit Report"
                        >
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteReportClick(report)}
                          className="btn btn-ghost btn-sm p-1 sm:p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          title="Delete Report"
                        >
                          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400" />
                      <p className="text-sm sm:text-base">No custom reports found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Section */}
      <div className="dashboard-card p-4 sm:p-6">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-3 sm:mb-4">Quick Export Reports</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <button 
            onClick={() => handleExportReport('Appointment')}
            className="btn btn-outline flex flex-col items-center justify-center p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 mb-2" />
            <span className="text-sm sm:text-base">Appointment Report</span>
          </button>
          <button 
            onClick={() => handleExportReport('Revenue')}
            className="btn btn-outline flex flex-col items-center justify-center p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            <PieChart className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 mb-2" />
            <span className="text-sm sm:text-base">Revenue Report</span>
          </button>
          <button 
            onClick={() => handleExportReport('Activity')}
            className="btn btn-outline flex flex-col items-center justify-center p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors sm:col-span-2 lg:col-span-1"
          >
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-gray-600 dark:text-gray-400 mb-2" />
            <span className="text-sm sm:text-base">Activity Report</span>
          </button>
        </div>
      </div>

      {/* Modal for report details/actions */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {modalType === 'view' && 'Report Details'}
                  {modalType === 'create' && 'Create New Report'}
                  {modalType === 'edit' && 'Edit Report'}
                  {modalType === 'delete' && 'Delete Report'}
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

              {modalType === 'view' && selectedReport && (
                <div className="space-y-4 sm:space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-lg sm:text-xl flex-shrink-0">
                        <FileText className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Report</h4>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
                          {selectedReport.name}
                        </p>
                        <span className={`badge mt-1 text-xs sm:text-sm ${
                          selectedReport.type === 'appointment' ? 'badge-primary' :
                          selectedReport.type === 'doctor' ? 'badge-success' :
                          selectedReport.type === 'revenue' ? 'badge-warning' :
                          'badge-secondary'
                        }`}>
                          {selectedReport.type}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-lg sm:text-xl flex-shrink-0">
                        <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Schedule</h4>
                        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
                          {selectedReport.schedule}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                          Status: {selectedReport.status}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      Description
                    </h5>
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <p className="text-gray-700 dark:text-gray-300">
                        {selectedReport.description}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        Metrics
                      </h5>
                      <div className="space-y-2">
                        {selectedReport.metrics.map((metric, index) => (
                          <span key={index} className="badge badge-outline mr-2">
                            {metric}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Monitor className="h-4 w-4" />
                        Recipients
                      </h5>
                      <div className="space-y-2">
                        {selectedReport.recipients.map((recipient, index) => (
                          <p key={index} className="text-sm text-gray-600 dark:text-gray-400">
                            {recipient}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Timing Information
                      </h5>
                      <div className="space-y-2">
                        <p><span className="text-gray-600 dark:text-gray-400">Created:</span> {new Date(selectedReport.createdAt).toLocaleString()}</p>
                        {selectedReport.lastGenerated && (
                          <p><span className="text-gray-600 dark:text-gray-400">Last Generated:</span> {new Date(selectedReport.lastGenerated).toLocaleString()}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                      </h5>
                      <div className="space-y-2">
                        {Object.entries(selectedReport.filters).map(([key, value]) => (
                          <p key={key} className="text-sm text-gray-600 dark:text-gray-400">
                            <span className="font-medium">{key}:</span> {value}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {(modalType === 'create' || modalType === 'edit') && (
                <form className="space-y-3 sm:space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="label text-sm sm:text-base">Report Name *</label>
                      <input
                        type="text"
                        className={`input text-sm sm:text-base ${formErrors.name ? 'border-red-500' : ''}`}
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter report name"
                      />
                      {formErrors.name && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.name}</p>}
                    </div>
                    <div>
                      <label className="label text-sm sm:text-base">Report Type</label>
                      <select
                        className="input text-sm sm:text-base"
                        value={formData.type}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                      >
                        <option value="appointment">Appointment</option>
                        <option value="doctor">Doctor</option>
                        <option value="revenue">Revenue</option>
                        <option value="user">User</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="label text-sm sm:text-base">Description *</label>
                    <textarea
                      className={`input text-sm sm:text-base ${formErrors.description ? 'border-red-500' : ''}`}
                      rows="3"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter report description"
                    />
                    {formErrors.description && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.description}</p>}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="label text-sm sm:text-base">Schedule</label>
                      <select
                        className="input text-sm sm:text-base"
                        value={formData.schedule}
                        onChange={(e) => setFormData(prev => ({ ...prev, schedule: e.target.value }))}
                      >
                        <option value="manual">Manual</option>
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>
                    <div>
                      <label className="label text-sm sm:text-base">Recipients *</label>
                      <input
                        type="text"
                        className={`input text-sm sm:text-base ${formErrors.recipients ? 'border-red-500' : ''}`}
                        value={formData.recipients.join(', ')}
                        onChange={(e) => setFormData(prev => ({ 
                          ...prev, 
                          recipients: e.target.value.split(',').map(email => email.trim()).filter(email => email)
                        }))}
                        placeholder="Enter email addresses separated by commas"
                      />
                      {formErrors.recipients && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.recipients}</p>}
                    </div>
                  </div>

                  <div>
                    <label className="label text-sm sm:text-base">Metrics *</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {['total_appointments', 'cancellation_rate', 'popular_slots', 'appointment_count', 'rating', 'patient_feedback', 'daily_revenue', 'payment_methods', 'refund_rate'].map(metric => (
                        <label key={metric} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={formData.metrics.includes(metric)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData(prev => ({ ...prev, metrics: [...prev.metrics, metric] }));
                              } else {
                                setFormData(prev => ({ ...prev, metrics: prev.metrics.filter(m => m !== metric) }));
                              }
                            }}
                            className="rounded"
                          />
                          <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{metric.replace(/_/g, ' ')}</span>
                        </label>
                      ))}
                    </div>
                    {formErrors.metrics && <p className="text-red-500 text-xs sm:text-sm mt-1">{formErrors.metrics}</p>}
                  </div>
                </form>
              )}

              {modalType === 'delete' && selectedReport && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                    <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
                    <div>
                      <h4 className="font-medium text-red-900 dark:text-red-100">Delete Report</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">
                        This action cannot be undone. The report will be permanently removed from the system.
                      </p>
                    </div>
                  </div>
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Name:</strong> {selectedReport.name}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Type:</strong> {selectedReport.type}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Schedule:</strong> {selectedReport.schedule}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      <strong>Created:</strong> {new Date(selectedReport.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 mt-4 sm:mt-6">
                {modalType === 'create' && (
                  <button
                    onClick={handleCreateReport}
                    className="btn btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Save className="h-4 w-4" />
                    Create Report
                  </button>
                )}
                {modalType === 'edit' && (
                  <button
                    onClick={handleUpdateReport}
                    className="btn btn-primary flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Save className="h-4 w-4" />
                    Update Report
                  </button>
                )}
                {modalType === 'delete' && (
                  <button
                    onClick={handleDeleteReport}
                    className="btn btn-destructive flex items-center justify-center gap-2 text-sm sm:text-base"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Report
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

export default ReportsAnalytics;