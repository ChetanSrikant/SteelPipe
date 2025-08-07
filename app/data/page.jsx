'use client';
import { useState, useEffect, useMemo, useCallback } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
// Optional: If you want to add toast notifications, install react-hot-toast
// import toast, { Toaster } from 'react-hot-toast';

export default function DataViewPage() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedTable, setSelectedTable] = useState('all');
  const [selectedCustomerCode, setSelectedCustomerCode] = useState('all');
  const [selectedItemName, setSelectedItemName] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(50); // This can be made configurable if needed

  const fetchAllData = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const response = await fetch('/api/sales/all-data');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch data');
      }
      const result = await response.json();
      console.log('API Response:', result);

      const fetchedData = Array.isArray(result) ? result : (result.data || []);
      setData(fetchedData);
      setStats(result.stats || { totalRows: fetchedData.length });
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [selectedTable, selectedCustomerCode, selectedItemName]);

  const filteredData = useMemo(() => {
    return data.filter(row => {
      const matchesTable = selectedTable === 'all' || row._sourceTable === selectedTable;
      const matchesCustomerCode = selectedCustomerCode === 'all' || row['Customer Code'] === selectedCustomerCode;
      const matchesItemName = selectedItemName === 'all' || row['Item Name'] === selectedItemName;
      
      return matchesTable && matchesCustomerCode && matchesItemName;
    });
  }, [data, selectedTable, selectedCustomerCode, selectedItemName]);

  const uniqueTables = useMemo(() => {
    return [...new Set(data.map(row => row._sourceTable))].filter(Boolean);
  }, [data]);

  const uniqueCustomerCodes = useMemo(() => {
    return [...new Set(filteredData.map(row => row['Customer Code']))].filter(Boolean).sort();
  }, [filteredData]);

  const uniqueItemNames = useMemo(() => {
    return [...new Set(filteredData.map(row => row['Item Name']))].filter(Boolean).sort();
  }, [filteredData]);

  // NEW: Memoize the total sales calculation for performance
  const totalSales = useMemo(() => {
    let total = 0;
    
    filteredData.forEach(row => {
      // Look for date columns (format: YYYY-MM-DD) which contain sales data
      Object.keys(row).forEach(key => {
        if (/^\d{4}-\d{2}-\d{2}$/.test(key)) {
          const value = parseFloat(row[key]);
          if (!isNaN(value)) {
            total += value;
          }
        }
      });
    });

    return total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }, [filteredData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  const columns = useMemo(() => {
    if (filteredData.length === 0) return [];
    const allKeys = new Set();
    filteredData.forEach(row => {
      Object.keys(row).forEach(key => allKeys.add(key));
    });
    
    const preferredColumns = ['Customer Code', 'Item Name', '_sourceTable'];
    const allKeysArray = Array.from(allKeys);
    const preferred = preferredColumns.filter(col => allKeysArray.includes(col));
    const others = allKeysArray.filter(col => !preferredColumns.includes(col)).sort();
    
    return [...preferred, ...others];
  }, [filteredData]);

  const handleResetFilters = () => {
    setSelectedTable('all');
    setSelectedCustomerCode('all');
    setSelectedItemName('all');
    setCurrentPage(1);
  };

  const renderContent = () => {
    if (loading && data.length === 0) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      );
    }

    if (data.length === 0 && !loading) {
      return <p className="text-gray-600 text-center py-8">No data available. Try refreshing or check your API.</p>;
    }

    if (filteredData.length === 0 && (selectedTable !== 'all' || selectedCustomerCode !== 'all' || selectedItemName !== 'all')) {
      return <p className="text-gray-600 text-center py-8">No results found for your current filters.</p>;
    }

    return (
      <>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard title="Total Rows" value={stats.totalRows || data.length} color="blue" />
          <StatCard title="Filtered Rows" value={filteredData.length} color="green" />
          <StatCard title="Total Sales" value={`${totalSales} tons`} color="cyan" />
          <StatCard title="Unique Columns" value={columns.length} color="purple" />
          <StatCard title="Source Tables" value={uniqueTables.length} color="orange" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            <div className="w-full md:w-40">
              <label htmlFor="table-filter" className="block text-sm font-medium text-gray-700 mb-1">Filter by Table</label>
              <select
                id="table-filter"
                value={selectedTable}
                onChange={(e) => setSelectedTable(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Tables</option>
                {uniqueTables.map(table => (
                  <option key={table} value={table}>{table}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-40">
              <label htmlFor="customer-filter" className="block text-sm font-medium text-gray-700 mb-1">Customer Code</label>
              <select
                id="customer-filter"
                value={selectedCustomerCode}
                onChange={(e) => setSelectedCustomerCode(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Customers</option>
                {uniqueCustomerCodes.map(code => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
            </div>

            <div className="w-full md:w-40">
              <label htmlFor="item-filter" className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
              <select
                id="item-filter"
                value={selectedItemName}
                onChange={(e) => setSelectedItemName(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Items</option>
                {uniqueItemNames.map(item => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleResetFilters}
              className="w-full md:w-auto px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Filters
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {column.replace(/_/g, ' ')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedData.map((row, rowIndex) => (
                  <tr key={`row-${rowIndex}`} className="hover:bg-gray-50">
                    {columns.map((column) => (
                      <td
                        key={`cell-${rowIndex}-${column}`}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                      >
                        {String(row[column] ?? 'N/A')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Database Raw Data</h1>
            <p className="text-gray-600">Complete database view with filtering, search, and pagination.</p>
          </div>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

// Simple Stat Card Component
const StatCard = ({ title, value, color }) => {
  const colorClasses = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600',
    cyan: 'text-cyan-600', // Added a new color for the sales card
  };
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200">
      <div className="text-sm font-medium text-gray-600">{title}</div>
      <div className={`text-2xl font-bold ${colorClasses[color] || 'text-gray-800'}`}>{value}</div>
    </div>
  );
};