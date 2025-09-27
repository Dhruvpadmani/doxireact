import { useState, useEffect } from 'react';
import { 
  TrendingUp,
  Calendar,
  Users,
  UserCheck,
  FileText,
  Star,
  Activity,
  Download,
  Filter,
  BarChart3,
  PieChart,
  CalendarDays,
  DollarSign,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner';

export default function ReportsAnalytics() {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const [chartsData, setChartsData] = useState({
    dailyAppointments: [],
    topDoctors: [],
    userGrowth: []
  });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      // In a real app, this would come from an API
      // For demo, we'll create mock data
      const mockData = {
        totalUsers: 1250,
        totalDoctors: 156,
        totalAppointments: 2450,
        totalReviews: 980,
        totalReports: 642,
        activeToday: 234,
        revenue: 125000,
        growthRate: 12.5,
        mostBookedDoctor: 'Dr. John Smith',
        busiestSlot: '10:00 AM',
        peakDay: 'Wednesday',
        dailyAppointments: [
          { date: '2024-01-01', count: 45 },
          { date: '2024-01-02', count: 52 },
          { date: '2024-01-03', count: 38 },
          { date: '2024-01-04', count: 67 },
          { date: '2024-01-05', count: 55 },
          { date: '2024-01-06', count: 72 },
          { date: '2024-01-07', count: 61 }
        ],
        topDoctors: [
          { name: 'Dr. John Smith', appointments: 156, rating: 4.8 },
          { name: 'Dr. Sarah Johnson', appointments: 142, rating: 4.7 },
          { name: 'Dr. Michael Chen', appointments: 128, rating: 4.9 },
          { name: 'Dr. Priya Patel', appointments: 112, rating: 4.6 },
          { name: 'Dr. Robert Wilson', appointments: 98, rating: 4.5 }
        ],
        userGrowth: [
          { month: 'Jan', users: 120, doctors: 15 },
          { month: 'Feb', users: 145, doctors: 18 },
          { month: 'Mar', users: 178, doctors: 22 },
          { month: 'Apr', users: 210, doctors: 25 },
          { month: 'May', users: 256, doctors: 28 },
          { month: 'Jun', users: 298, doctors: 32 }
        ]
      };
      
      setAnalyticsData(mockData);
      setChartsData({
        dailyAppointments: mockData.dailyAppointments,
        topDoctors: mockData.topDoctors,
        userGrowth: mockData.userGrowth
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Generate insights (most booked doctors, busiest slots, activity trends)
            </p>
          </div>
          
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
              <option value="1y">Last Year</option>
            </select>
            
            <button className="btn btn-primary flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Users</p>
              <p className="stat-value text-primary-600">{analyticsData?.totalUsers?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-primary-100 dark:bg-primary-900 p-3 rounded-full">
              <Users className="h-6 w-6 text-primary-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Doctors</p>
              <p className="stat-value text-success-600">{analyticsData?.totalDoctors?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
              <UserCheck className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Total Appointments</p>
              <p className="stat-value text-warning-600">{analyticsData?.totalAppointments?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-warning-100 dark:bg-warning-900 p-3 rounded-full">
              <Calendar className="h-6 w-6 text-warning-600" />
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-label">Revenue</p>
              <p className="stat-value text-success-600">₹{analyticsData?.revenue?.toLocaleString() || 0}</p>
            </div>
            <div className="bg-success-100 dark:bg-success-900 p-3 rounded-full">
              <DollarSign className="h-6 w-6 text-success-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Key Metrics
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Growth Rate</span>
              <span className="font-semibold text-green-600 dark:text-green-400">+{analyticsData?.growthRate || 0}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Active Today</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData?.activeToday || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Reviews</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData?.totalReviews || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Total Reports</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData?.totalReports || 0}</span>
            </div>
          </div>
        </div>

        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Peak Times
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Most Booked Doctor</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData?.mostBookedDoctor || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Busiest Time Slot</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData?.busiestSlot || 'N/A'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Peak Day</span>
              <span className="font-semibold text-gray-900 dark:text-white">{analyticsData?.peakDay || 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Daily Appointments Chart */}
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5" />
            Daily Appointments
          </h3>
          <div className="h-64 flex items-end justify-between gap-2 pt-8">
            {chartsData.dailyAppointments.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="w-full bg-primary-500 rounded-t hover:bg-primary-600 transition-colors"
                  style={{ height: `${(day.count / Math.max(...chartsData.dailyAppointments.map(d => d.count))) * 80}%` }}
                ></div>
                <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                  {new Date(day.date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                </span>
                <span className="text-xs text-gray-900 dark:text-white mt-1">{day.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Doctors Chart */}
        <div className="dashboard-card p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Top Doctors by Appointments
          </h3>
          <div className="space-y-3">
            {chartsData.topDoctors.map((doctor, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{doctor.name}</p>
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
                <span className="text-sm font-medium text-gray-900 dark:text-white">{doctor.appointments} appointments</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Growth Chart */}
      <div className="dashboard-card p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Users className="h-5 w-5" />
          User Growth
        </h3>
        <div className="h-64 flex items-end justify-between gap-2 pt-8">
          {chartsData.userGrowth.map((month, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
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
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">{month.month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Users</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-sm text-gray-600 dark:text-gray-400">Doctors</span>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="dashboard-card p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Export Reports</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="btn btn-outline flex flex-col items-center justify-center p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <BarChart3 className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
            <span>Appointment Report</span>
          </button>
          <button className="btn btn-outline flex flex-col items-center justify-center p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <PieChart className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
            <span>Revenue Report</span>
          </button>
          <button className="btn btn-outline flex flex-col items-center justify-center p-6 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
            <FileText className="h-8 w-8 text-gray-600 dark:text-gray-400 mb-2" />
            <span>Activity Report</span>
          </button>
        </div>
      </div>
    </div>
  );
}