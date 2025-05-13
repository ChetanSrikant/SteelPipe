"use client";
import { useState, useRef, useEffect } from 'react';
import { FiTrendingUp, FiDollarSign, FiUsers, FiBox, FiUpload, FiActivity, FiDatabase, FiCalendar } from 'react-icons/fi';
import { FaChartBar, FaChartLine } from 'react-icons/fa';
import Link from 'next/link';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import * as XLSX from 'xlsx';
import { Dialog } from '@headlessui/react';

// Import Chart Components
import DailySalesBarChart from '../components/charts/DailySalesBarChart';
import PipeContributionPieChart from '../components/charts/PipeContributionPieChart';
import MonthlyCustomerBarChart from '../components/charts/MonthlyCustomerBarChart';
import SheetSalesTrendChart from '../components/charts/SheetSalesTrendChart';

// --- Default Chart Options ---
const defaultBarChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' },
    title: { display: true, text: 'Total Daily Pipe Sales (Upload File)' },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: { title: { display: true, text: 'Day of the Month' } },
    y: { title: { display: true, text: 'Total Sales Value' }, beginAtZero: true },
  },
};

const defaultPieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Pipe Contribution (Upload File)' },
    tooltip: {
      callbacks: {
        label: function (context) {
          let label = context.label || '';
          if (label) {
            label += ': ';
          }
          if (context.parsed !== null) {
            const total = context.chart.getDatasetMeta(0).total;
            const value = context.parsed;
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) + '%' : '0.0%';
            label += `${formatCurrency(value)} (${percentage})`;
          }
          return label;
        }
      }
    }
  }
};

const defaultCustomerChartOptions = {
  indexAxis: 'y',
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    title: { display: true, text: 'Top Customers by Sales Value (Upload File & Select Sheet)' },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: { title: { display: true, text: 'Total Sales Value' }, beginAtZero: true },
    y: { title: { display: true, text: 'Customer' } },
  },
};

const defaultLineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: true, position: 'bottom' },
    title: { display: true, text: 'Total Sales Trend Across Months' },
    tooltip: { mode: 'index', intersect: false },
  },
  scales: {
    x: { title: { display: true, text: 'Month' } },
    y: { title: { display: true, text: 'Total Sales Value' }, beginAtZero: true }
  }
};

// --- Default Chart Data ---
const defaultBarChartData = {
  labels: ['Upload File and Select Sheet'],
  datasets: [{ label: 'Total Sales', data: [], backgroundColor: 'rgba(54, 162, 235, 0.6)' }]
};

const defaultPieChartData = {
  labels: ['Upload File and Select Sheet'],
  datasets: [{
    label: 'Sales Contribution',
    data: [],
    backgroundColor: [],
    borderColor: [],
    borderWidth: 1
  }]
};

const defaultCustomerChartData = {
  labels: ['Upload File & Select Sheet'],
  datasets: [{ label: 'Total Sales Value', data: [], backgroundColor: 'rgba(75, 192, 192, 0.6)' }]
};

const defaultLineChartData = {
  labels: ['Upload File to See Trend'],
  datasets: [{
    label: 'Total Sales',
    data: [],
    borderColor: 'rgba(75, 192, 192, 1)',
    backgroundColor: 'rgba(75, 192, 192, 0.2)',
    tension: 0.1,
    fill: true
  }]
};

// Helper functions
const generateColors = (numColors) => {
  const colors = [];
  const baseColors = [
    'rgba(255, 99, 132, 0.7)', 'rgba(54, 162, 235, 0.7)', 'rgba(255, 206, 86, 0.7)',
    'rgba(75, 192, 192, 0.7)', 'rgba(153, 102, 255, 0.7)', 'rgba(255, 159, 64, 0.7)',
    'rgba(199, 199, 199, 0.7)', 'rgba(83, 102, 255, 0.7)', 'rgba(100, 255, 100, 0.7)',
    'rgba(255, 100, 100, 0.7)'
  ];
  for (let i = 0; i < numColors; i++) {
    colors.push(baseColors[i % baseColors.length]);
  }
  return colors;
};

const formatCurrency = (value) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return value.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

const formatNumber = (value, precision = 0) => {
  if (typeof value !== 'number' || isNaN(value)) return 'N/A';
  return value.toLocaleString('en-IN', { minimumFractionDigits: precision, maximumFractionDigits: precision });
}

// Month to number mapping for financial year sorting
const MONTH_TO_NUM = {
  'january': 1, 'february': 2, 'march': 3, 'april': 4, 'may': 5, 'june': 6,
  'july': 7, 'august': 8, 'september': 9, 'october': 10, 'november': 11, 'december': 12
};

const getSheetDisplayName = (sheetName, sheetData) => {
  // Try to get period from A2 cell (row 1, column 0 in the array)
  let period = '';
  if (sheetData.length > 1 && sheetData[1] && sheetData[1][0]) {
    period = sheetData[1][0].toString().trim();
  }

  // If we have a period like "Period from 01-APR-22 to 30-APR-22"
  const periodMatch = period.match(/(\d{2}-[A-Z]{3}-\d{2})/);
  if (periodMatch) {
    const dateStr = periodMatch[1];
    const [day, month, year] = dateStr.split('-');
    const monthNames = {
      'JAN': 'January', 'FEB': 'February', 'MAR': 'March', 'APR': 'April',
      'MAY': 'May', 'JUN': 'June', 'JUL': 'July', 'AUG': 'August',
      'SEP': 'September', 'OCT': 'October', 'NOV': 'November', 'DEC': 'December'
    };
    const fullMonth = monthNames[month] || month;
    return `${fullMonth} 20${year}`;
  }

  // Fallback to original sheet name if we can't parse the period
  return sheetName;
};

export default function DashboardPage() {
  const [rawPipeSalesData, setRawPipeSalesData] = useState(null);
  const [allMonthlyCustomerSales, setAllMonthlyCustomerSales] = useState({});
  const [availableSheets, setAvailableSheets] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [sheetTotals, setSheetTotals] = useState({});
  const [financialYear, setFinancialYear] = useState('');
  const [uploadMode, setUploadMode] = useState(null);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  const [barChartData, setBarChartData] = useState(defaultBarChartData);
  const [barChartOptions, setBarChartOptions] = useState(defaultBarChartOptions);
  const [pieChartData, setPieChartData] = useState(defaultPieChartData);
  const [pieChartOptions, setPieChartOptions] = useState(defaultPieChartOptions);
  const [customerChartData, setCustomerChartData] = useState(defaultCustomerChartData);
  const [customerChartOptions, setCustomerChartOptions] = useState(defaultCustomerChartOptions);
  const [lineChartData, setLineChartData] = useState(defaultLineChartData);
  const [lineChartOptions, setLineChartOptions] = useState(defaultLineChartOptions);

  const [monthlyTotalSales, setMonthlyTotalSales] = useState(0);
  const [averageDailySales, setAverageDailySales] = useState(0);
  const [topCustomer, setTopCustomer] = useState({ name: 'N/A', value: 0 });
  const [topPipe, setTopPipe] = useState({ name: 'N/A', value: 0 });

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef(null);

  const openUploadDialog = () => {
    setErrorMsg('');
    setIsUploadDialogOpen(true);
  };

  const closeUploadDialog = () => {
    setIsUploadDialogOpen(false);
    setUploadMode(null);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);
    setErrorMsg('');
    setRawPipeSalesData(null);
    setAllMonthlyCustomerSales({});
    setAvailableSheets([]);
    setSelectedSheet('');
    setSheetTotals({});
    setFinancialYear('');
    setBarChartData(defaultBarChartData);
    setBarChartOptions(defaultBarChartOptions);
    setPieChartData(defaultPieChartData);
    setPieChartOptions(defaultPieChartOptions);
    setCustomerChartData(defaultCustomerChartData);
    setCustomerChartOptions(defaultCustomerChartOptions);
    setLineChartData(defaultLineChartData);
    setMonthlyTotalSales(0);
    setAverageDailySales(0);
    setTopCustomer({ name: 'N/A', value: 0 });
    setTopPipe({ name: 'N/A', value: 0 });

    if (!/\.(xlsx|xls|xlsm)$/i.test(file.name)) {
      setErrorMsg('Please upload a valid Excel file (.xlsx, .xls, .xlsm).');
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const arrayBuffer = e.target.result;
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });

        const intermediateData = {
          'Daily Total': {},
          'MonthlyPipeTotals': {}
        };
        const customerTotalsBySheet = {};
        const sheetsFound = [];
        const newSheetTotals = {};
        let detectedFinancialYear = '';

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: "" });

          if (sheetData.length < 2) {
            console.warn(`Sheet "${sheetName}" has less than 2 rows. Skipping.`);
            return;
          };

          let maxCols = 0;
          if (Array.isArray(sheetData[0])) {
            maxCols = sheetData[0].length;
          }
          if (maxCols < 3) { // If header didn't give enough cols, or no header row, check first few data rows
            maxCols = sheetData
              .slice(1, 11) // Look at up to 10 data rows
              .reduce((max, row) => Array.isArray(row) ? Math.max(max, row.length) : max, 0);
          }

          let lastPhysicalColIndex = maxCols - 1; // Index of the absolute last column found
          let lastDataColToInclude = lastPhysicalColIndex; // Default: assume last physical column contains data to include

          const headerRow = sheetData[0];
          let isExplicitTotalColumn = false;


          if (Array.isArray(headerRow) && headerRow.length > 0 && lastPhysicalColIndex >= 0) {
            const lastHeader = headerRow[lastPhysicalColIndex]?.toString().trim().toLowerCase();
            if (lastHeader === 'total' || lastHeader === 'sum' || lastHeader === 'grand total') {
              isExplicitTotalColumn = true;
            }
          }

          let shouldExcludeLastPhysicalColumn = isExplicitTotalColumn;

          if (!isExplicitTotalColumn && maxCols >= 4) {
            shouldExcludeLastPhysicalColumn = true;
          }

          // If the last physical column should be excluded AND
          // doing so still leaves data (i.e., data ends at lastPhysicalColIndex - 1, which must be >= 2 for Day1 data)
          // This means lastPhysicalColIndex must be >= 3 (which implies maxCols >= 4)
          if (shouldExcludeLastPhysicalColumn && lastPhysicalColIndex >= 3) {
            lastDataColToInclude = lastPhysicalColIndex - 1;
          } else {
            // Either not excluding, or not enough columns to exclude and still have Day1 data
            // (e.g. maxCols=3 -> P,C,D1; lastPhysicalColIndex=2. D1 is data, not excluded)
            lastDataColToInclude = lastPhysicalColIndex;
          }


          const lastDataColIndex = lastDataColToInclude;


          if (lastDataColIndex < 2) { // Ensure we have data columns (Pipe, Customer, Day1 at least)
            // The indices for PipeName and CustomerName are 0 and 1.
            // Daily sales data starts at index 2. So lastDataColIndex must be at least 2.
            console.warn(`Sheet "${sheetName}" doesn't have enough data columns (needs up to index 2, got ${lastDataColIndex}) after potential total exclusion. Detected ${maxCols} total columns. Skipping sheet.`);
            return; // Skip this sheet
          }

          const dailyTotalsForSheet = {};
          const pipeTotalsForSheet = {};
          const customerTotalsForSheet = {};
          let sheetTotal = 0;

          for (let rowIndex = 1; rowIndex < sheetData.length; rowIndex++) {
            const row = sheetData[rowIndex];
            if (!Array.isArray(row) || row.length < 3) continue;

            const pipeName = row[0]?.toString().trim();
            const customerName = row[1]?.toString().trim();

            if (!pipeName || !customerName) continue;

            const dailySales = row.slice(2, lastDataColIndex + 1).map(val => {
              if (val === null || val === undefined || val === "") return 0;
              const num = Number(val);
              return isNaN(num) ? 0 : num;
            });

            if (dailySales.length > 0) {
              const rowTotalSales = dailySales.reduce((sum, sale) => sum + sale, 0);
              sheetTotal += rowTotalSales;

              pipeTotalsForSheet[pipeName] = (pipeTotalsForSheet[pipeName] || 0) + rowTotalSales;

              dailySales.forEach((sale, dayIndex) => {
                const day = dayIndex + 1;
                dailyTotalsForSheet[day] = (dailyTotalsForSheet[day] || 0) + sale;
              });

              customerTotalsForSheet[customerName] = (customerTotalsForSheet[customerName] || 0) + rowTotalSales;
            }
          }

          const displayName = getSheetDisplayName(sheetName, sheetData);
          newSheetTotals[sheetName] = sheetTotal;

          if (Object.keys(dailyTotalsForSheet).length > 0) {
            const maxDay = Math.max(...Object.keys(dailyTotalsForSheet).map(Number));
            const dailyTotalsArray = Array(maxDay).fill(0);
            for (const day in dailyTotalsForSheet) {
              dailyTotalsArray[parseInt(day) - 1] = dailyTotalsForSheet[day];
            }
            intermediateData['Daily Total'][sheetName] = dailyTotalsArray;
          }

          if (Object.keys(pipeTotalsForSheet).length > 0) {
            intermediateData['MonthlyPipeTotals'][sheetName] = pipeTotalsForSheet;
          }

          if (Object.keys(customerTotalsForSheet).length > 0) {
            customerTotalsBySheet[sheetName] = customerTotalsForSheet;
          }

          sheetsFound.push({
            originalName: sheetName,
            displayName: displayName
          });
        });

        if (Object.keys(intermediateData['Daily Total']).length === 0 && Object.keys(intermediateData['MonthlyPipeTotals']).length === 0) {
          throw new Error("No valid data sheets found or data couldn't be extracted.");
        }

        // Sort sheets based on upload mode
        // In the handleFileChange function, replace the sorting logic with this:

        // Sort sheets based on upload mode
        let sortedSheets = [...sheetsFound];
        if (uploadMode === 'financial-year') {
          sortedSheets.sort((a, b) => {
            // Extract month and year from display names
            const aMatch = a.displayName.match(/([A-Za-z]+)\s(20\d{2})/i);
            const bMatch = b.displayName.match(/([A-Za-z]+)\s(20\d{2})/i);

            if (aMatch && bMatch) {
              const [, aMonth, aYear] = aMatch;
              const [, bMonth, bYear] = bMatch;
              const aMonthNum = MONTH_TO_NUM[aMonth.toLowerCase()];
              const bMonthNum = MONTH_TO_NUM[bMonth.toLowerCase()];
              const aYearNum = parseInt(aYear);
              const bYearNum = parseInt(bYear);

              // Financial year sorting (April to March)
              // First determine the financial year for each sheet
              const aFY = aMonthNum >= 4 ? aYearNum : aYearNum - 1;
              const bFY = bMonthNum >= 4 ? bYearNum : bYearNum - 1;

              // If different financial years, sort by financial year
              if (aFY !== bFY) {
                return aFY - bFY;
              }

              // If same financial year, sort by month number
              // But adjust month numbers so April (4) comes first
              const aSortMonth = aMonthNum >= 4 ? aMonthNum - 3 : aMonthNum + 9;
              const bSortMonth = bMonthNum >= 4 ? bMonthNum - 3 : bMonthNum + 9;

              return aSortMonth - bSortMonth;
            }
            return a.displayName.localeCompare(b.displayName);
          });

          // Filter to only include sheets with valid month names
          sortedSheets = sortedSheets.filter(sheet => {
            return sheet.displayName.match(/(January|February|March|April|May|June|July|August|September|October|November|December)\s20\d{2}/i);
          });

          // Detect financial year from the sheets
          if (sortedSheets.length > 0) {
            const firstSheet = sortedSheets[0].displayName;
            const lastSheet = sortedSheets[sortedSheets.length - 1].displayName;

            const firstMatch = firstSheet.match(/([A-Za-z]+)\s(20\d{2})/i);
            const lastMatch = lastSheet.match(/([A-Za-z]+)\s(20\d{2})/i);

            if (firstMatch && lastMatch) {
              const [, firstMonth, firstYear] = firstMatch;
              const [, lastMonth, lastYear] = lastMatch;
              const firstMonthNum = MONTH_TO_NUM[firstMonth.toLowerCase()];
              const lastMonthNum = MONTH_TO_NUM[lastMonth.toLowerCase()];

              if (firstMonthNum === 4 && lastMonthNum === 3) {
                detectedFinancialYear = `FY ${firstYear}-${parseInt(lastYear) + 1}`;
              } else if (firstMonthNum < 4 && lastMonthNum >= 4) {
                // Handle case where data spans two financial years
                detectedFinancialYear = `FY ${firstYear}-${lastYear}`;
              }
            }
          }
        } else {
          // For whole-data mode, keep original order but still try to detect financial year
          if (sortedSheets.length > 0) {
            const firstSheet = sortedSheets[0].displayName;
            const lastSheet = sortedSheets[sortedSheets.length - 1].displayName;

            const firstMatch = firstSheet.match(/([A-Za-z]+)\s(20\d{2})/i);
            const lastMatch = lastSheet.match(/([A-Za-z]+)\s(20\d{2})/i);

            if (firstMatch && lastMatch) {
              const [, firstMonth, firstYear] = firstMatch;
              const [, lastMonth, lastYear] = lastMatch;
              const firstMonthNum = MONTH_TO_NUM[firstMonth.toLowerCase()];
              const lastMonthNum = MONTH_TO_NUM[lastMonth.toLowerCase()];

              if (firstMonthNum === 4 && lastMonthNum === 3) {
                detectedFinancialYear = `FY ${firstYear}-${parseInt(lastYear) + 1}`;
              }
            }
          }
        }

        setRawPipeSalesData(intermediateData);
        setAllMonthlyCustomerSales(customerTotalsBySheet);
        setAvailableSheets(sortedSheets);
        setSelectedSheet(sortedSheets[0]?.originalName || '');
        setSheetTotals(newSheetTotals);
        setErrorMsg('');

        // Update line chart with sheet totals
        if (Object.keys(newSheetTotals).length > 0) {
          const sheetNames = sortedSheets.map(sheet => sheet.displayName);
          const totals = sortedSheets.map(sheet => newSheetTotals[sheet.originalName]);

          setLineChartData({
            labels: sheetNames,
            datasets: [{
              label: 'Total Sales',
              data: totals,
              borderColor: 'rgba(75, 192, 192, 1)',
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              tension: 0.1,
              fill: true
            }]
          });
        }

      } catch (error) {
        console.error("Error processing Excel file:", error);
        setErrorMsg(`Error processing file: ${error.message}. Please check file format and content.`);
        setRawPipeSalesData(null);
        setAllMonthlyCustomerSales({});
        setAvailableSheets([]);
        setSelectedSheet('');
        setSheetTotals({});
        setFinancialYear('');
        setBarChartData(defaultBarChartData);
        setBarChartOptions(defaultBarChartOptions);
        setPieChartData(defaultPieChartData);
        setPieChartOptions(defaultPieChartOptions);
        setCustomerChartData(defaultCustomerChartData);
        setCustomerChartOptions(defaultCustomerChartOptions);
        setLineChartData(defaultLineChartData);
        setMonthlyTotalSales(0);
        setAverageDailySales(0);
        setTopCustomer({ name: 'N/A', value: 0 });
        setTopPipe({ name: 'N/A', value: 0 });
      } finally {
        setIsLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
        setIsUploadDialogOpen(false);
        setUploadMode(null);
      }
    };

    reader.onerror = (error) => {
      console.error("Error reading file:", error);
      setErrorMsg("Error reading the selected file.");
      setIsLoading(false);
      setRawPipeSalesData(null);
      setAllMonthlyCustomerSales({});
      setAvailableSheets([]);
      setSelectedSheet('');
      setSheetTotals({});
      setFinancialYear('');
      setBarChartData(defaultBarChartData);
      setBarChartOptions(defaultBarChartOptions);
      setPieChartData(defaultPieChartData);
      setPieChartOptions(defaultPieChartOptions);
      setCustomerChartData(defaultCustomerChartData);
      setCustomerChartOptions(defaultCustomerChartOptions);
      setLineChartData(defaultLineChartData);
      setMonthlyTotalSales(0);
      setAverageDailySales(0);
      setTopCustomer({ name: 'N/A', value: 0 });
      setTopPipe({ name: 'N/A', value: 0 });
      if (fileInputRef.current) fileInputRef.current.value = "";
      setIsUploadDialogOpen(false);
      setUploadMode(null);
    };

    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    const sheetSelected = selectedSheet && availableSheets.some(s => s.originalName === selectedSheet);
    const hasData = rawPipeSalesData && allMonthlyCustomerSales;

    let currentMonthlyTotal = 0;
    let currentAverageDaily = 0;
    let currentTopCust = { name: 'N/A', value: 0 };
    let currentTopPip = { name: 'N/A', value: 0 };

    if (sheetSelected && hasData) {
      const dailyTotals = rawPipeSalesData['Daily Total']?.[selectedSheet];
      const pipeSales = rawPipeSalesData['MonthlyPipeTotals']?.[selectedSheet];
      const customerSales = allMonthlyCustomerSales?.[selectedSheet];

      if (dailyTotals && dailyTotals.length > 0) {
        currentMonthlyTotal = dailyTotals.reduce((sum, val) => sum + (val || 0), 0);
      }
      else if (pipeSales && Object.keys(pipeSales).length > 0) {
        currentMonthlyTotal = Object.values(pipeSales).reduce((sum, val) => sum + (val || 0), 0);
      }

      const numDaysWithData = dailyTotals?.length || 0;
      if (numDaysWithData > 0 && currentMonthlyTotal > 0) {
        currentAverageDaily = currentMonthlyTotal / numDaysWithData;
      }

      if (customerSales && Object.keys(customerSales).length > 0) {
        const sortedCustomers = Object.entries(customerSales)
          .sort(([, a], [, b]) => b - a);
        if (sortedCustomers.length > 0) {
          currentTopCust = { name: sortedCustomers[0][0], value: sortedCustomers[0][1] };
        }
      }

      if (pipeSales && Object.keys(pipeSales).length > 0) {
        const sortedPipes = Object.entries(pipeSales)
          .sort(([, a], [, b]) => b - a);
        if (sortedPipes.length > 0) {
          currentTopPip = { name: sortedPipes[0][0], value: sortedPipes[0][1] };
        }
      }

      if (dailyTotals && dailyTotals.length > 0) {
        const maxDays = dailyTotals.length;
        const dayLabels = Array.from({ length: maxDays }, (_, i) => `${i + 1}`);
        setBarChartData({
          labels: dayLabels,
          datasets: [{
            label: 'Total Sales', data: dailyTotals, borderWidth: 1,
            backgroundColor: 'rgba(54, 162, 235, 0.6)',
          }],
        });
        setBarChartOptions(prev => ({
          ...prev,
          plugins: { ...prev.plugins, title: { display: true, text: `Total Daily Pipe Sales - ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}` } },
          scales: {
            x: { title: { display: true, text: 'Day of the Month' } },
            y: { title: { display: true, text: 'Total Sales' }, beginAtZero: true }
          }
        }));
      } else {
        setBarChartData({ labels: [`No Daily Data for ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}`], datasets: [{ label: 'Total Sales', data: [] }] });
        setBarChartOptions(prev => ({ ...prev, plugins: { ...prev.plugins, title: { display: true, text: `Total Daily Pipe Sales - ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}` } } }));
      }

      if (pipeSales && Object.keys(pipeSales).length > 0) {
        const pipeLabels = Object.keys(pipeSales);
        const pipeSalesValues = Object.values(pipeSales);
        const backgroundColors = generateColors(pipeLabels.length);
        const borderColors = backgroundColors.map(color => color.replace('0.7', '1'));

        setPieChartData({
          labels: pipeLabels,
          datasets: [{
            label: 'Sales Contribution', data: pipeSalesValues,
            backgroundColor: backgroundColors, borderColor: borderColors, borderWidth: 1,
          }],
        });
        setPieChartOptions(prev => ({
          ...prev,
          plugins: { ...prev.plugins, title: { display: true, text: `Pipe Contribution - ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}` } },
        }));
      } else {
        setPieChartData({ labels: [`No Pipe Data for ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}`], datasets: [{ label: 'Sales Contribution', data: [] }] });
        setPieChartOptions(prev => ({ ...prev, plugins: { ...prev.plugins, title: { display: true, text: `Pipe Contribution - ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}` } } }));
      }

      if (customerSales && Object.keys(customerSales).length > 0) {
        const sortedCustomers = Object.entries(customerSales)
          .sort(([, a], [, b]) => b - a)
          .slice(0, 15);

        const customerLabels = sortedCustomers.map(([name]) => name);
        const customerValues = sortedCustomers.map(([, value]) => value);
        const backgroundColors = generateColors(customerLabels.length).map(c => c.replace('0.7', '0.6'));
        const borderColors = backgroundColors.map(color => color.replace('0.6', '1'));

        setCustomerChartData({
          labels: customerLabels,
          datasets: [{
            label: 'Monthly Sales Value',
            data: customerValues,
            backgroundColor: backgroundColors,
            borderColor: borderColors,
            borderWidth: 1,
          }],
        });
        setCustomerChartOptions(prev => ({
          ...prev,
          plugins: { ...prev.plugins, title: { display: true, text: `Top ${customerLabels.length} Customers - ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}` } },
          scales: {
            x: { title: { display: true, text: `Total Sales Value - ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}` }, beginAtZero: true },
            y: { title: { display: true, text: 'Customer' } }
          }
        }));
      } else {
        setCustomerChartData({ labels: [`No Customer Data for ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}`], datasets: [{ label: 'Monthly Sales Value', data: [] }] });
        setCustomerChartOptions(prev => ({
          ...prev,
          plugins: { ...prev.plugins, title: { display: true, text: `Top Customers - ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}` } },
          scales: {
            x: { title: { display: true, text: `Total Sales Value - ${availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet}` }, beginAtZero: true },
            y: { title: { display: true, text: 'Customer' } }
          }
        }));
      }

    } else {
      setBarChartData(defaultBarChartData);
      setBarChartOptions(defaultBarChartOptions);
      setPieChartData(defaultPieChartData);
      setPieChartOptions(defaultPieChartOptions);
      setCustomerChartData(defaultCustomerChartData);
      setCustomerChartOptions(defaultCustomerChartOptions);
    }

    setMonthlyTotalSales(currentMonthlyTotal);
    setAverageDailySales(currentAverageDaily);
    setTopCustomer(currentTopCust);
    setTopPipe(currentTopPip);
  }, [selectedSheet, rawPipeSalesData, availableSheets, allMonthlyCustomerSales]);

  const handleUploadClick = () => {
    if (uploadMode === 'financial-year' || uploadMode === 'whole-data') {
      fileInputRef.current?.click();
    }
  };

  const handleSheetChange = (event) => {
    setSelectedSheet(event.target.value);
  };

  const formatTons = (value, precision = 1) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return `${value.toLocaleString('en-IN', {
      minimumFractionDigits: precision,
      maximumFractionDigits: precision
    })} t`;
  };

  const stats = [
    {
      title: `Total Sales (${selectedSheet ? availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet : 'Select Sheet'})`,
      value: formatTons(monthlyTotalSales),
      icon: <FiDollarSign className="text-blue-500" />,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-500'
    },
    {
      title: `Avg Daily Sales (${selectedSheet ? availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet : 'Select Sheet'})`,
      value: formatTons(averageDailySales, 2),
      icon: <FiActivity className="text-orange-500" />,
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-500'
    },
    {
      title: `Top Customer (${selectedSheet ? availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet : 'Select Sheet'})`,
      value: topCustomer.name !== 'N/A' ? `${topCustomer.name}` : 'N/A',
      subValue: topCustomer.name !== 'N/A' ? formatTons(topCustomer.value) : '',
      icon: <FiUsers className="text-green-500" />,
      bgColor: 'bg-green-50',
      textColor: 'text-green-500'
    },
    {
      title: `Top Pipe (${selectedSheet ? availableSheets.find(s => s.originalName === selectedSheet)?.displayName || selectedSheet : 'Select Sheet'})`,
      value: topPipe.name !== 'N/A' ? `${topPipe.name}` : 'N/A',
      subValue: topPipe.name !== 'N/A' ? formatTons(topPipe.value) : '',
      icon: <FiBox className="text-red-500" />,
      bgColor: 'bg-red-50',
      textColor: 'text-red-500'
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className={`absolute inset-0 opacity-5 bg-gradient-to-br from-transparent to-${stat.textColor.split('-')[1]}-300`}></div>
                <div className="relative z-10 flex items-start justify-between h-full">
                  <div className="flex-1 mr-4">
                    <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {stat.title}
                    </p>
                    <p className="mt-2 text-2xl font-bold text-gray-900">
                      {stat.value}
                    </p>
                    {stat.subValue && (
                      <p className="mt-1 text-sm font-medium text-gray-600">
                        {stat.subValue}
                      </p>
                    )}
                  </div>
                  <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor} ${stat.textColor} transition-all duration-300 group-hover:scale-110`}>
                    <div className="w-6 h-6 flex items-center justify-center">
                      {stat.icon}
                    </div>
                  </div>
                </div>
                {index < 2 && (
                  <div className="relative mt-4 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`absolute top-0 left-0 h-full ${stat.textColor.replace('text', 'bg')} rounded-full`}
                      style={{
                        width: `${index === 0 ?
                          Math.min(100, monthlyTotalSales / 10000) :
                          Math.min(100, averageDailySales / 1000)}%`
                      }}
                    ></div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-4 flex-wrap w-full sm:w-auto">
              {financialYear && (
                <div className="flex items-center bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
                  <FiCalendar className="mr-1" />
                  {financialYear}
                </div>
              )}
              <label htmlFor="sheetSelect" className="text-sm font-medium text-gray-700 whitespace-nowrap">Select Month:</label>
              <select
                id="sheetSelect"
                value={selectedSheet}
                onChange={handleSheetChange}
                disabled={!rawPipeSalesData || availableSheets.length === 0 || isLoading}
                className="block w-full sm:w-auto text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm disabled:opacity-50 disabled:bg-gray-100 p-2"
              >
                <option value="" disabled={selectedSheet !== ''}>-- Select Sheet --</option>
                {availableSheets.map(sheet => (
                  <option key={sheet.originalName} value={sheet.originalName}>
                    {sheet.displayName}
                  </option>
                ))}
                {availableSheets.length === 0 && !isLoading && rawPipeSalesData && (
                  <option value="" disabled>No sheets found in file</option>
                )}
                {availableSheets.length === 0 && !isLoading && !rawPipeSalesData && (
                  <option value="" disabled>Upload a file first</option>
                )}
              </select>
            </div>


            <button
              onClick={openUploadDialog}
              disabled={isLoading}
              className={`flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm ${isLoading ? 'opacity-50 cursor-not-allowed' : ''} w-full sm:w-auto`}
            >
              <FiUpload className="mr-2 h-4 w-4" />
              {isLoading ? 'Processing...' : 'Upload Excel File'}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls, .xlsm"
              className="hidden"
              id="fileUpload"
            />
          </div>

          {/* Upload Dialog */}
          <Dialog open={isUploadDialogOpen} onClose={closeUploadDialog} className="relative z-50">
            <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
            <div className="fixed inset-0 flex items-center justify-center p-4">
              <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
                <Dialog.Title className="text-lg font-medium text-gray-900 mb-4">
                  Select Upload Mode
                </Dialog.Title>

                <div className="space-y-4 mb-6">
                  <button
                    onClick={() => setUploadMode('financial-year')}
                    className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${uploadMode === 'financial-year'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                  >
                    <div className="flex items-center">
                      <FiCalendar className="text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Financial Year Data</p>
                        <p className="text-sm text-gray-500">April to March (sorted automatically)</p>
                      </div>
                    </div>
                    {uploadMode === 'financial-year' && (
                      <div className="h-5 w-5 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>

                  <button
                    onClick={() => setUploadMode('whole-data')}
                    className={`w-full flex items-center justify-between p-4 border rounded-lg transition-colors ${uploadMode === 'whole-data'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-blue-50 hover:border-blue-300'
                      }`}
                  >
                    <div className="flex items-center">
                      <FiDatabase className="text-blue-500 mr-3" />
                      <div>
                        <p className="font-medium text-gray-900">Whole Data</p>
                        <p className="text-sm text-gray-500">All sheets in original order</p>
                      </div>
                    </div>
                    {uploadMode === 'whole-data' && (
                      <div className="h-5 w-5 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </button>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={closeUploadDialog}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleUploadClick();
                      closeUploadDialog();
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Upload File
                  </button>
                </div>
              </Dialog.Panel>
            </div>
          </Dialog>

          {errorMsg && (
            <div className="my-4 p-3 bg-red-100 text-red-700 border border-red-300 rounded-md text-sm">
              {errorMsg}
            </div>
          )}

          

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DailySalesBarChart
              data={barChartData}
              options={barChartOptions}
              isLoading={isLoading}
            />

            <PipeContributionPieChart
              data={pieChartData}
              options={pieChartOptions}
              isLoading={isLoading}
            />

            <MonthlyCustomerBarChart
              data={customerChartData}
              options={customerChartOptions}
              isLoading={isLoading}
              selectedMonth={selectedSheet}
              allMonthlyCustomerSales={allMonthlyCustomerSales}
            />
          </div>

          {/* New Line Chart Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="h-80">
              <SheetSalesTrendChart
                data={lineChartData}
                options={lineChartOptions}
                isLoading={isLoading}
              />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0 text-center md:text-left">
                <h2 className="text-xl font-bold mb-2">Advanced Pipe Sales Analysis</h2>
                <p>Use our AI-powered tools to forecast demand and optimize inventory.</p>
              </div>
              <Link href="/analysis" className="px-6 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-100 transition-colors duration-200 ease-in-out shadow">
                Explore Analysis
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}