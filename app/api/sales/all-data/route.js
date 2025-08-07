// pages/api/sales/all-data.js
import { query } from '../../../lib/db'; // Assuming this is your database query utility

export async function GET(request) {
  try {
    // Define the tables to query.
    // In a real application, you might fetch this list dynamically or from a config.
    const tablesToQuery = ['MPL22', 'MPL23', 'MPL24', 'MPL25'];

    let allData = [];
    const tableStats = {};

    console.log(`[API] Starting data fetch from tables: ${tablesToQuery.join(', ')}`);

    for (const table of tablesToQuery) {
      try {
        console.log(`[API] Querying table: ${table}`);
        // It's generally safer to parameterize queries, but for table names in a fixed list,
        // direct interpolation can be acceptable if the list is controlled internally.
        const result = await query(`SELECT * FROM ${table}`);

        if (result && Array.isArray(result) && result.length > 0) {
          // Add a source table identifier to each row.
          const rowsWithTable = result.map(row => ({
            ...row,
            _sourceTable: table,
          }));
          allData.push(...rowsWithTable);
          tableStats[table] = result.length;
          console.log(`[API] Table ${table}: Fetched ${result.length} rows.`);
        } else {
          console.log(`[API] Table ${table} returned no rows or is empty.`);
          tableStats[table] = 0; // Explicitly set 0 for empty tables
        }
      } catch (tableError) {
        console.error(`[API] Error querying table ${table}:`, tableError.message);
        // Do not throw immediately, try to fetch from other tables
        tableStats[table] = `error: ${tableError.message}`; // Record the error for this table
      }
    }

    console.log(`[API] Total rows combined: ${allData.length}`);
    console.log('[API] Individual table statistics:', tableStats);

    // Return structured data and stats
    return new Response(JSON.stringify({
      data: allData,
      stats: {
        totalRows: allData.length,
        tableStats: tableStats,
      },
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('[API] Global error fetching all data:', error);
    // Return a generic 500 error for unexpected issues during the overall process
    return new Response(JSON.stringify({
      message: 'Internal Server Error',
      error: error.message,
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}