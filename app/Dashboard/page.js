// app/overall_dashboard/page.jsx
'use client';
import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import DatePicker from 'react-datepicker'; // Still imported, though not used for month filter directly
import 'react-datepicker/dist/react-datepicker.css';

// Import Chart.js components and elements
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement, // Added for potential future LineChart, though Bar is used for Daily Sales
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

// Register the necessary Chart.js elements
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  PointElement,
  LineElement // Registering for completeness, even if Line chart isn't explicitly used now
);

import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Chatbot from '../components/Chatbot';

// Chart.js colors (can be extended)
const CHART_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#E74C3C', '#2ECC71'];

const formatCurrency = (value) => {
  if (value === undefined || value === null) return '--';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
};

const formatTons = (value) => {
  if (value === undefined || value === null) return '--';
  // Show "ton" for 1, "tons" for everything else
  const tons = Number(value);
  const unit = tons === 1 ? 'ton' : 'tons';
  return `${tons.toLocaleString('en-IN')} ${unit}`;
};

export default function DashboardPage() {
  const [selectedYear, setSelectedYear] = useState('23');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [data, setData] = useState({
    dailySales: [],
    pipePerformance: [],
    customerPerformance: [],
    summary: {}
  });
  const [yearlyComparisonData, setYearlyComparisonData] = useState([]);
  const [loading, setLoading] = useState(false);

  
  const fetchYearlyComparisonData = async () => {
    try {
      const years = ['22', '23', '24', '25'];
      const comparisonData = [];
      
      for (const year of years) {
        try {
          const response = await fetch(`/api/sales?financialYear=${year}`);
          if (response.ok) {
            const result = await response.json();
            console.log(`FY${year} data:`, result); // Debug log
            comparisonData.push({
              year: `FY${year}`,
              totalSales: result.summary?.totalSales || 0
            });
          } else {
            console.error(`Failed to fetch FY${year}:`, response.status);
            // Add default data for failed requests
            comparisonData.push({
              year: `FY${year}`,
              totalSales: 0
            });
          }
        } catch (yearError) {
          console.error(`Error fetching FY${year}:`, yearError);
          // Add default data for failed requests
          comparisonData.push({
            year: `FY${year}`,
            totalSales: 0
          });
        }
      }
      
      console.log('Yearly comparison data:', comparisonData); // Debug log
      setYearlyComparisonData(comparisonData);
    } catch (error) {
      console.error('Error fetching yearly comparison data:', error);
      // Set default data on complete failure
      setYearlyComparisonData([
        { year: 'FY22', totalSales: 0 },
        { year: 'FY23', totalSales: 0 },
        { year: 'FY24', totalSales: 0 },
        { year: 'FY25', totalSales: 0 }
      ]);
    }
  };

  
  const fetchData = async () => {
    setLoading(true);
    try {
      let url = `/api/sales?financialYear=${selectedYear}`;
      if (selectedMonth) {
        url += `&month=${selectedMonth}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Optionally set data to default empty state on error to clear old data
      setData({
        dailySales: [],
        pipePerformance: [],
        customerPerformance: [],
        summary: {}
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchYearlyComparisonData();
  }, [selectedYear, selectedMonth]);

  const summaryCards = [
    {
      icon: "💰",
      label: 'Total Sales',
      value: data.summary?.totalSales,
      sub: 'Current Period',
      color: 'bg-blue-100 text-blue-800'
    },
    {
      icon: "📊",
      label: 'Avg Daily Sales',
      value: data.summary?.averageDailySales,
      sub: 'Daily Performance',
      color: 'bg-green-100 text-green-800'
    },
    {
      icon: "🏆",
      label: 'Top Customer',
      value: data.summary?.topCustomer?.[0],
      sales: data.summary?.topCustomer?.[1],
      color: 'bg-purple-100 text-purple-800'
    },
    {
      icon: "📦",
      label: 'Top Product',
      value: data.summary?.topPipe?.[0],
      sales: data.summary?.topPipe?.[1],
      color: 'bg-yellow-100 text-yellow-800'
    },
    {
      icon: "👥",
      label: 'Unique Customers',
      value: data.summary?.activeCustomers,
      sub: 'Engagement',
      color: 'bg-pink-100 text-pink-800'
    }
  ];

  // --- Chart.js Data Transformations ---

  // Yearly Comparison Line Chart Data
  const yearlyComparisonChartData = {
    labels: yearlyComparisonData.map(item => item.year),
    datasets: [
      {
        label: 'Total Sales',
        data: yearlyComparisonData.map(item => item.totalSales),
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3B82F6',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  };

  // Debug log for chart data
  console.log('Yearly comparison chart data:', yearlyComparisonChartData);

  // Yearly Comparison Line Chart Options
  const yearlyComparisonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `Total Sales: ${formatTons(context.parsed.y)}`;
          }
        },
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        bodyColor: '#1f2937',
        titleColor: '#1f2937',
        boxPadding: 6,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280',
          font: {
            size: 14
          }
        }
      },
      y: {
        grid: {
          color: '#f0f0f0',
          borderDash: [3, 3],
        },
        ticks: {
          color: '#6b7280',
          callback: function(value) {
            return formatTons(value);
          }
        }
      }
    }
  };

  // Daily Sales Bar Chart Data
  const dailySalesChartData = {
    labels: data.dailySales.map(item => format(parseISO(item.date), 'MMM dd')),
    datasets: [
      {
        label: 'Daily Sales',
        data: data.dailySales.map(item => item.sales),
        backgroundColor: '#3B82F6',
        borderRadius: 4, // for rounded bars
      },
    ],
  };

  // Daily Sales Bar Chart Options
  const dailySalesChartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows the parent div to control height
    plugins: {
      legend: {
        display: false, // Only one dataset, so legend might not be necessary
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.parsed.y !== null) {
              label += formatTons(context.parsed.y);
            }
            return label;
          },
          title: function(context) {
            return format(parseISO(data.dailySales[context[0].dataIndex].date), 'PPP');
          }
        },
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        bodyColor: '#1f2937',
        titleColor: '#1f2937',
        boxPadding: 6,
        cornerRadius: 8,
        displayColors: false, // Hide the color box in tooltip
      }
    },
    scales: {
      x: {
        grid: {
          display: false // Hide vertical grid lines
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          color: '#f0f0f0', // Light horizontal grid lines
          borderDash: [3, 3],
        },
        ticks: {
          color: '#6b7280'
        }
      }
    }
  };

  // Top Products Bar Chart Data
  const topProductsBarChartData = {
    labels: data.pipePerformance.slice(0, 10).map(item => item.pipe),
    datasets: [
      {
        label: 'Sales',
        data: data.pipePerformance.slice(0, 10).map(item => item.sales),
        backgroundColor: '#8884D8',
        borderRadius: 4,
      },
    ],
  };

  // Top Products Bar Chart Options (Vertical layout)
  const topProductsBarChartOptions = {
    indexAxis: 'y', // Makes it a horizontal bar chart
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            // Change from formatCurrency to formatTons
            return `Sales: ${formatTons(context.parsed.x)}`;
          }
        },
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        bodyColor: '#1f2937',
        titleColor: '#1f2937',
        boxPadding: 6,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          color: '#f0f0f0',
          borderDash: [3, 3],
        },
        ticks: {
          color: '#6b7280',
          // Change from formatCurrency to formatTons
          callback: function(value) {
            return formatTons(value);
          }
        }
      },
      y: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#6b7280'
        }
      }
    }
  };

  // Product Contribution Pie Chart Data
  const productContributionPieChartData = {
    labels: data.pipePerformance.slice(0, 5).map(item => item.pipe),
    datasets: [
      {
        data: data.pipePerformance.slice(0, 5).map(item => item.sales),
        backgroundColor: CHART_COLORS.slice(0, data.pipePerformance.slice(0, 5).length), // Use CHART_COLORS
        borderColor: '#ffffff', // Border between slices
        borderWidth: 2,
      },
    ],
  };

  // Product Contribution Pie Chart Options
  const productContributionPieChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right', // Position legend on the right
        labels: {
          color: '#1f2937', // Legend text color
          font: {
            size: 14
          }
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw;
            const total = context.dataset.data.reduce((sum, val) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(0);
            return `${label}: ${formatTons(value)} (${percentage}%)`;
          }
        },
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        bodyColor: '#1f2937',
        titleColor: '#1f2937',
        boxPadding: 6,
        cornerRadius: 8,
      }
    }
  };


  // Top Customers Bar Chart Data
  const topCustomersChartData = {
    labels: data.customerPerformance.slice(0, 10).map(item => item.customer),
    datasets: [
      {
        label: 'Sales',
        data: data.customerPerformance.slice(0, 10).map(item => item.sales),
        backgroundColor: '#00C49F',
        borderRadius: 4,
      },
    ],
  };

  // Top Customers Bar Chart Options
  const topCustomersChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            // Change from formatCurrency to formatTons
            return `Sales: ${formatTons(context.parsed.y)}`;
          }
        },
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1,
        bodyColor: '#1f2937',
        titleColor: '#1f2937',
        boxPadding: 6,
        cornerRadius: 8,
        displayColors: false,
      }
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#6b7280'
        }
      },
      y: {
        grid: {
          color: '#f0f0f0',
          borderDash: [3, 3],
        },
        ticks: {
          color: '#6b7280'
        }
      }
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Sales Performance Dashboard</h1>
            <p className="text-gray-600">Analyze and optimize your sales performance</p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Financial Year Select */}
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Financial Year</label>
                <select
                  value={selectedYear}
                  onChange={(e) => {
                    setSelectedYear(e.target.value);
                    setSelectedMonth(''); // Reset month when year changes
                  }}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {['22', '23', '24', '25'].map(year => (
                    <option key={year} value={year}>FY{year}</option>
                  ))}
                </select>
              </div>

              {/* Month Select - Financial Year Order */}
              <div className="w-full md:w-auto">
                <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Months</option>
                  {[
                    { number: '04', name: 'April' },
                    { number: '05', name: 'May' },
                    { number: '06', name: 'June' },
                    { number: '07', name: 'July' },
                    { number: '08', name: 'August' },
                    { number: '09', name: 'September' },
                    { number: '10', name: 'October' },
                    { number: '11', name: 'November' },
                    { number: '12', name: 'December' },
                    { number: '01', name: 'January' },
                    { number: '02', name: 'February' },
                    { number: '03', name: 'March' }
                  ].map((month) => {
                    const isFirstHalf = parseInt(month.number) >= 4;
                    const displayYear = isFirstHalf 
                      ? parseInt(`20${selectedYear}`) 
                      : parseInt(`20${selectedYear}`) + 1;
                    
                    return (
                      <option 
                        key={month.number} 
                        value={month.number}
                      >
                        {`${month.name} ${displayYear}`}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div className="w-full md:w-auto">
                {/* <div className="w-full md:w-auto"> */}
                <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Data</label>
                <button
                onClick={fetchData}
                disabled={loading}
                className="w-full md:w-auto mt-2 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </>
                )}
              </button>
              </div>

              {/* <button
                onClick={fetchData}
                disabled={loading}
                className="w-full md:w-auto mt-2 md:mt-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </>
                )}
              </button> */}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
                {summaryCards.map((card, index) => (
                  <div key={index} className={`${card.color} p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow`}>
                    <div className="flex items-start">
                      <div className="text-2xl mr-3">{card.icon}</div>
                      <div>
                        <div className="text-sm font-medium">{card.label}</div>
                        <div className="text-xl font-bold mt-1">
                          {card.label === 'Unique Customers' 
                            ? (card.value || '--')
                            : (typeof card.value === 'number' ? formatTons(card.value) : card.value || '--')
                          }
                        </div>
                        {card.sales ? (
                          <div className="text-xs mt-1">{formatTons(card.sales)}</div>
                        ) : (
                          <div className="text-xs text-gray-600 mt-1">{card.sub}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="space-y-6">

                {/* Daily Sales */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Daily Sales Trend</h2>
                  <div className="h-80">
                    {/* Render Chart.js Bar Chart */}
                    <Bar data={dailySalesChartData} options={dailySalesChartOptions} />
                  </div>
                </div>

                {/* Product Performance */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Products</h2>
                    <div className="h-80">
                      {/* Render Chart.js Horizontal Bar Chart */}
                      <Bar data={topProductsBarChartData} options={topProductsBarChartOptions} />
                    </div>
                  </div>

                  <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">Product Contribution</h2>
                    <div className="h-80">
                      {/* Render Chart.js Pie Chart */}
                      <Pie data={productContributionPieChartData} options={productContributionPieChartOptions} />
                    </div>
                  </div>
                </div>

                {/* Customer Performance */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Top Customers</h2>
                  <div className="h-80">
                    {/* Render Chart.js Bar Chart */}
                    <Bar data={topCustomersChartData} options={topCustomersChartOptions} />
                  </div>
                </div>

                {/* Yearly Comparison */}
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4">Yearly Sales Comparison</h2>
                  <div className="h-80">
                    {yearlyComparisonData.length > 0 ? (
                      /* Render Chart.js Line Chart */
                      <Line data={yearlyComparisonChartData} options={yearlyComparisonChartOptions} />
                    ) : (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div className="text-center">
                          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                          <p className="mt-2">Loading yearly comparison data...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>
            </>
          )}
        </main>
        {/* Chatbot */}
        <Chatbot />
      </div>
    </div>
  );
}

