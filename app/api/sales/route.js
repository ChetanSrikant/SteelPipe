// app/api/sales/route.js

import { query } from '../../lib/db';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const financialYear = searchParams.get('financialYear');
  const month = searchParams.get('month'); // This month is like "01", "02", etc.

  console.log('API Request - financialYear:', financialYear, 'month:', month);

  if (!financialYear) {
    return Response.json({ message: 'Financial year is required.' }, { status: 400 });
  }

  const validYears = ['22', '23', '24', '25'];
  if (!validYears.includes(financialYear)) {
    return Response.json({ message: 'Invalid financial year provided.' }, { status: 400 });
  }

  try {
    const tableName = `MPL${financialYear}`;
    console.log('Querying table:', tableName);
    
    // When filtering by month, we still need to fetch ALL data for the year
    // because date columns are dynamic. Filtering happens AFTER fetching.
    let queryString = `SELECT * FROM ${tableName}`;
    const params = []; // No params needed for the initial SELECT *

    const rawData = await query(queryString, params); // Fetch all data for the year
    console.log(`Raw data for ${tableName}:`, rawData ? rawData.length : 0, 'rows');

    // Initialize data structures
    const responseData = {
      dailySales: [],
      pipePerformance: [],
      customerPerformance: [],
      summary: {
        totalSales: 0,
        averageDailySales: 0,
        topCustomer: ['N/A', 0],
        topPipe: ['N/A', 0],
        activeCustomers: 0,
        activePipes: 0
      }
    };

    // Process raw data
    if (rawData && rawData.length > 0) {
      // Get all date columns from the first row (assuming consistent schema)
      const allDateColumns = Object.keys(rawData[0]).filter(col => /^\d{4}-\d{2}-\d{2}$/.test(col));

      // Filter date columns based on selected month (if any)
      const filteredDateColumns = month
        ? allDateColumns.filter(dateCol => dateCol.substring(5, 7) === month)
        : allDateColumns;

      const dailyTotals = {};
      const pipeTotals = {};
      const customerTotals = {};
      const skuCountByCustomer = {};

      rawData.forEach(row => {
        const pipeName = row['Item Name']?.toString().trim();
        const customerName = row['Customer Code']?.toString().trim();

        if (!pipeName || !customerName) return;

        let rowTotalSales = 0;

        // Iterate only over the filtered date columns
        filteredDateColumns.forEach(dateCol => {
          const dailySale = parseFloat(row[dateCol]) || 0;
          rowTotalSales += dailySale;

          // Daily totals - only for dates within the selected month if applicable
          if (!dailyTotals[dateCol]) {
            dailyTotals[dateCol] = 0;
          }
          dailyTotals[dateCol] += dailySale;
        });

        // Pipe totals - based on sales within the filtered period
        if (!pipeTotals[pipeName]) {
          pipeTotals[pipeName] = 0;
        }
        pipeTotals[pipeName] += rowTotalSales;

        // Customer totals - based on sales within the filtered period
        if (!customerTotals[customerName]) {
          customerTotals[customerName] = 0;
        }
        customerTotals[customerName] += rowTotalSales;

        // SKU count - still based on unique pipe names for the customer
        if (!skuCountByCustomer[customerName]) {
          skuCountByCustomer[customerName] = new Set();
        }
        skuCountByCustomer[customerName].add(pipeName);
      });

      // Convert to arrays and sort
      responseData.dailySales = Object.entries(dailyTotals)
        .map(([date, sales]) => ({ date, sales }))
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      responseData.pipePerformance = Object.entries(pipeTotals)
        .map(([pipe, sales]) => ({ pipe, sales }))
        .sort((a, b) => b.sales - a.sales);

      responseData.customerPerformance = Object.entries(customerTotals)
        .map(([customer, sales]) => ({ customer, sales }))
        .sort((a, b) => b.sales - a.sales);

      // Calculate summary
      responseData.summary = {
        totalSales: Object.values(dailyTotals).reduce((sum, val) => sum + val, 0),
        averageDailySales: Object.keys(dailyTotals).length > 0
          ? Object.values(dailyTotals).reduce((sum, val) => sum + val, 0) / Object.keys(dailyTotals).length
          : 0,
        topCustomer: Object.entries(customerTotals).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0],
        topPipe: Object.entries(pipeTotals).sort((a, b) => b[1] - a[1])[0] || ['N/A', 0],
        activeCustomers: Object.keys(customerTotals).length,
        activePipes: Object.keys(pipeTotals).length
      };
    }

    console.log('API Response summary:', {
      totalSales: responseData.summary.totalSales,
      dailySalesCount: responseData.dailySales.length,
      pipePerformanceCount: responseData.pipePerformance.length,
      customerPerformanceCount: responseData.customerPerformance.length
    });
    
    return Response.json(responseData, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { message: 'Internal Server Error', error: error.message },
      { status: 500 }
    );
  }
}