'use client';
import { useState, useRef, useEffect } from 'react';
import { FiSend, FiMessageSquare, FiX } from 'react-icons/fi';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Welcome to Sales Query Assistant! Ask me about sales data.", sender: 'bot' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const formatSalesValue = (value) => {
    if (value === undefined || value === null) return 'N/A';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    // Add user message
    const userMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Use your Next.js API route as a proxy
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input })
      });

      const data = await response.json();

      if (response.ok) {
        let htmlResponse = '';

        // Results table
        if (data.results && data.results.length > 0) {
          const headers = Object.keys(data.results[0]);
          htmlResponse += `
            <div class="mb-6">
              <h4 class="text-lg font-semibold mb-3 text-blue-700">📊 Results</h4>
              <div class="overflow-x-auto rounded-md border border-gray-200 shadow-sm">
                <table class="w-full border-collapse">
                  <thead class="bg-gray-50">
                    <tr>
                      ${headers.map(header => `
                        <th scope="col" class="py-3 px-4 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-b border-r border-gray-200 last:border-r-0">
                          ${header.replace(/_/g, ' ')}
                        </th>
                      `).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${data.results.map((row, rowIndex) => `
                      <tr class="${rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100">
                        ${headers.map(header => {
                          const cellValue = row[header];
                          const formattedValue = header.toLowerCase().includes('sales')
                            ? formatSalesValue(cellValue)
                            : cellValue;
                          return `
                            <td class="py-3 px-4 text-sm text-gray-800 border-b border-r border-gray-200 last:border-r-0">
                              ${formattedValue}
                            </td>
                          `;
                        }).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          `;
        }

        // Insights
        if (data.insights && data.insights.length > 0) {
          htmlResponse += `
            <div class="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <h4 class="text-lg font-semibold mb-3 text-blue-700">Insights</h4>
              <ul class="list-none pl-0">
                ${data.insights.map(i => `<li class="relative pl-6 mb-2 last:mb-0 before:content-['📌'] before:absolute before:left-0 before:text-blue-500">${i}</li>`).join('')}
              </ul>
            </div>
          `;
        }

        setMessages(prev => [...prev, { 
          text: htmlResponse || '<p class="text-gray-600">No data available</p>', 
          sender: 'bot',
          isHtml: true 
        }]);
      } else {
        setMessages(prev => [...prev, { 
          text: `<p class="text-red-600 p-2 bg-red-100 rounded-md">Error: ${data.error}</p>`, 
          sender: 'bot',
          isHtml: true
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { 
        text: `<p class="text-red-600 p-2 bg-red-100 rounded-md">Network Error: ${error.message}</p>`, 
        sender: 'bot',
        isHtml: true
      }]);
      console.error('Chatbot error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="w-[32rem] h-[35rem] bg-white rounded-lg shadow-xl flex flex-col border border-gray-200">
          <div className="p-3 bg-blue-600 text-white rounded-t-lg flex justify-between items-center">
            <h3 className="font-medium">📊 Sales Query Assistant</h3>
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close chat"
            >
              <FiX size={20} />
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar"> {/* Added custom-scrollbar class */}
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`mb-3 p-3 rounded-lg max-w-[90%] break-words ${ // Added break-words
                  msg.sender === 'user' 
                    ? 'bg-blue-600 ml-auto text-white' // Added text-white for user messages
                    : 'bg-gray-100 mr-auto'
                }`}
              >
                {msg.isHtml ? (
                  <div dangerouslySetInnerHTML={{ __html: msg.text }} />
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {loading && (
              <div className="mb-3 p-3 bg-gray-100 rounded-lg mr-auto">
                <div className="flex space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          <div className="p-3 border-t border-gray-200 flex">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={loading}
              className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" // Updated focus styles
              placeholder="Ask about monthly sales..."
              aria-label="Chat input"
            />
            <button
              onClick={handleSend}
              disabled={loading}
              className={`p-2 rounded-r-lg flex items-center justify-center ${ // Added flex for consistent button content alignment
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white transition-colors' // Added transition
              }`}
              aria-label="Send message"
            >
              <FiSend size={18} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2" // Added focus styles
          aria-label="Open chat"
        >
          <FiMessageSquare size={24} />
        </button>
      )}
    </div>
  );
}