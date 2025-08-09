// app/api/chatbot/route.js
import { NextResponse } from 'next/server';

/**
 * Handles POST requests to the chatbot API route.
 * This acts as a proxy to your external sales query API.
 */
export async function POST(request) {
  try {
    const { query } = await request.json();

    // Validate the incoming request body
    if (!query) {
      return NextResponse.json({ error: 'Query parameter is missing.' }, { status: 400 });
    }

    // Forward the request to your external API
    // Ensure this URL is correct for your backend API
    const externalApiUrl = process.env.SALES_QUERY_API_URL || 'http://15.223.11.152:5003/query'; 
    // It's highly recommended to use an environment variable for the external API URL.

    const response = await fetch(externalApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });

    // Check if the external API response was successful
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown external API error' }));
      console.error('External API error:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.error || `External API responded with status ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Return the data received from the external API to the frontend
    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error('API Route Error:', error);
    return NextResponse.json(
      { error: `Internal Server Error: ${error.message || 'An unexpected error occurred'}` },
      { status: 500 }
    );
  }
}