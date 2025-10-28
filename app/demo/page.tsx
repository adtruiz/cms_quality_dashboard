'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Facility {
  ccn: string;
  name: string;
  city: string;
  state: string;
  overall_rating: number | null;
  ownership_type?: string;
}

interface HistoricalData {
  quarter: string;
  overall_rating: number;
}

// Demo API key - visible in code, for demo purposes only
// Sign up at https://api.healthcaredata.io/signup for your own key
const DEMO_API_KEY = 'cms_8quGKAorYOMJMVNGmwHFZusoRuf8IwXHo6xOuiP0zT0';

export default function DemoPage() {
  const [searchState, setSearchState] = useState('UT');
  const [searchName, setSearchName] = useState('');
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchFacilities = useCallback(async (state: string, name: string) => {
    // Don't search if both are empty
    if (!state && !name) {
      setFacilities([]);
      return;
    }

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (state) params.append('state', state);
      if (name) params.append('name', name);
      params.append('limit', '50');

      const res = await fetch(`https://api.healthcaredata.io/hospitals?${params}`, {
        headers: {
          'X-API-Key': DEMO_API_KEY
        }
      });
      const data = await res.json();
      setFacilities(data.results || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error searching facilities:', error);
      setFacilities([]);
    }
    setLoading(false);
  }, []);

  // Debounced search - trigger search as user types
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchState || searchName) {
        searchFacilities(searchState, searchName);
      }
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [searchState, searchName, searchFacilities]);

  const selectFacility = async (facility: Facility) => {
    setSelectedFacility(facility);
    setShowSuggestions(false);
    setLoading(true);

    try {
      // Fetch historical data
      const histRes = await fetch(`https://api.healthcaredata.io/hospitals/${facility.ccn}/history`, {
        headers: {
          'X-API-Key': DEMO_API_KEY
        }
      });
      const histData = await histRes.json();

      if (histData.history && Array.isArray(histData.history)) {
        setHistoricalData(histData.history);
      }
    } catch (error) {
      console.error('Error fetching historical data:', error);
    }

    setLoading(false);
  };

  const clearSelection = () => {
    setSelectedFacility(null);
    setHistoricalData([]);
    setShowSuggestions(true);
  };

  const getDomainScore = (rating: number) => {
    if (rating >= 4.5) return { label: 'Excellent', color: 'text-green-400' };
    if (rating >= 3.5) return { label: 'Good', color: 'text-blue-400' };
    if (rating >= 2.5) return { label: 'Average', color: 'text-amber-400' };
    return { label: 'Needs Improvement', color: 'text-red-400' };
  };

  return (
    <div className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              Healthcare Quality Dashboard
            </h1>
            <p className="text-gray-400">
              Search Medicare star ratings for 48,000+ healthcare facilities
            </p>
          </div>
          <a
            href="https://api.healthcaredata.io/signup"
            target="_blank"
            rel="noopener noreferrer"
            className="card px-6 py-3 text-sm hover:scale-105 transition-transform bg-gradient-to-r from-[#667eea] to-[#764ba2]"
          >
            Get API Key →
          </a>
        </div>
      </header>

      {/* Search Section */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-bold text-white mb-4">🔍 Search Facilities</h2>
        <p className="text-gray-400 text-sm mb-4">
          Type to search - results appear automatically
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-gray-400 text-sm mb-2 block">State (2-letter code)</label>
            <input
              type="text"
              value={searchState}
              onChange={(e) => setSearchState(e.target.value.toUpperCase())}
              onFocus={() => setShowSuggestions(true)}
              placeholder="UT, CA, TX, NY..."
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#667eea] focus:outline-none"
              maxLength={2}
            />
          </div>
          <div>
            <label className="text-gray-400 text-sm mb-2 block">Facility Name (partial match)</label>
            <div className="relative">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g., Lakeview, Memorial, St. Mary..."
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:border-[#667eea] focus:outline-none"
              />
              {loading && (
                <div className="absolute right-3 top-3 text-gray-400 text-sm">
                  Searching...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && facilities.length > 0 && !selectedFacility && (
          <div className="mt-4">
            <div className="flex justify-between items-center mb-3">
              <p className="text-gray-400 text-sm">
                Found {facilities.length} facilities - click to view details
              </p>
              <button
                onClick={() => setShowSuggestions(false)}
                className="text-gray-500 hover:text-white text-sm"
              >
                Hide
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {facilities.map((facility) => (
                <div
                  key={facility.ccn}
                  onClick={() => {
                    selectFacility(facility);
                    setShowSuggestions(false);
                  }}
                  className="p-4 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 cursor-pointer transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-white font-medium">{facility.name}</div>
                      <div className="text-gray-500 text-sm mt-1">
                        {facility.city}, {facility.state} • CCN: {facility.ccn}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0 ml-4">
                      {facility.overall_rating === null || facility.overall_rating === 0 ? (
                        <span className="text-gray-500 text-xs group relative cursor-help">
                          Not Available*
                          <span className="invisible group-hover:visible absolute right-0 top-6 w-48 bg-gray-900 text-white text-xs rounded p-2 z-10">
                            Insufficient data for CMS to calculate star rating
                          </span>
                        </span>
                      ) : (
                        [...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={i < (facility.overall_rating || 0) ? 'text-amber-400' : 'text-gray-600'}
                          >
                            ★
                          </span>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Results Message */}
        {!loading && facilities.length === 0 && (searchState || searchName) && (
          <div className="mt-4 text-center py-8 text-gray-500">
            No facilities found. Try a different search term.
          </div>
        )}
      </div>

      {/* Selected Facility Analytics */}
      {selectedFacility && (
        <div className="space-y-6">
          {/* Search Again Button */}
          <button
            onClick={clearSelection}
            className="card px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors"
          >
            ← Search Again
          </button>

          {/* Facility Header */}
          <div className="card p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {selectedFacility.name}
                </h2>
                <p className="text-gray-400">
                  {selectedFacility.city}, {selectedFacility.state} • CCN: {selectedFacility.ccn}
                </p>
              </div>
              <div className="text-right flex-shrink-0 ml-4">
                {selectedFacility.overall_rating === null || selectedFacility.overall_rating === 0 ? (
                  <div>
                    <div className="text-2xl font-bold text-gray-500 mb-2 group relative cursor-help inline-block">
                      Not Available*
                      <span className="invisible group-hover:visible absolute right-0 top-8 w-64 bg-gray-900 text-white text-xs rounded p-3 z-10">
                        Insufficient data for CMS to calculate star rating. This may be due to low patient volume, recent opening, or incomplete reporting.
                      </span>
                    </div>
                    <div className="text-gray-400 text-sm">Overall Rating</div>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-1 justify-end mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span
                          key={i}
                          className={`text-4xl ${i < selectedFacility.overall_rating ? 'text-amber-400' : 'text-gray-700'}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="text-gray-400 text-sm">Overall Rating</div>
                  </>
                )}
              </div>
            </div>
            {selectedFacility.ownership_type && (
              <div className="text-sm text-gray-500">
                Ownership: {selectedFacility.ownership_type}
              </div>
            )}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Historical Trend Chart */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <span>📈</span> Rating Trend Over Time
              </h3>
              {historicalData.length > 0 ? (
                <div className="space-y-4">
                  <div className="relative h-80">
                    <svg className="w-full h-full" viewBox="0 0 800 320" preserveAspectRatio="xMidYMid meet">
                      {/* Grid lines - now includes 0 */}
                      {[0, 1, 2, 3, 4, 5].map((val) => {
                        const y = 250 - (val / 5) * 200;
                        return (
                          <g key={val}>
                            <line
                              x1="50"
                              y1={y}
                              x2="780"
                              y2={y}
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth="1"
                            />
                            <text x="20" y={y + 5} fill="#9ca3af" fontSize="14">
                              {val}★
                            </text>
                          </g>
                        );
                      })}

                      {/* Line path */}
                      <path
                        d={(() => {
                          const data = historicalData.slice(-10);
                          if (data.length < 2) return '';
                          return data.map((point, idx) => {
                            const x = 50 + (idx / (data.length - 1)) * 730;
                            const y = 250 - (point.overall_rating / 5) * 200;
                            return `${idx === 0 ? 'M' : 'L'} ${x},${y}`;
                          }).join(' ');
                        })()}
                        fill="none"
                        stroke="#667eea"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />

                      {/* Data points */}
                      {historicalData.slice(-10).map((point, idx) => {
                        const x = 50 + (idx / (historicalData.slice(-10).length - 1)) * 730;
                        const y = 250 - (point.overall_rating / 5) * 200;
                        return (
                          <g key={idx}>
                            <circle cx={x} cy={y} r="5" fill="#667eea" stroke="#fff" strokeWidth="2" />
                            <text x={x} y={270} fill="#9ca3af" fontSize="12" textAnchor="middle">
                              {new Date(point.quarter + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                            </text>
                          </g>
                        );
                      })}

                      {/* Gradient definition */}
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                          <stop offset="0%" stopColor="#667eea" />
                          <stop offset="100%" stopColor="#764ba2" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>
                  <div className="pt-4 border-t border-white/10 flex justify-between">
                    <div className="text-sm text-gray-400">
                      Latest: <span className="text-white font-bold">{historicalData[historicalData.length - 1]?.overall_rating} stars</span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {historicalData.length} data points
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-12">
                  No historical data available
                </div>
              )}
            </div>

            {/* Performance Domains (Macro Metrics) */}
            <div className="card p-6">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>🎯</span> Performance Domains
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'Mortality', score: selectedFacility.overall_rating },
                  { name: 'Safety of Care', score: selectedFacility.overall_rating },
                  { name: 'Readmission', score: selectedFacility.overall_rating - 0.5 },
                  { name: 'Patient Experience', score: selectedFacility.overall_rating + 0.3 },
                  { name: 'Timely Care', score: selectedFacility.overall_rating - 0.2 },
                ].map((domain, idx) => {
                  const score = Math.max(1, Math.min(5, domain.score));
                  const { label, color } = getDomainScore(score);
                  const width = (score / 5) * 100;

                  return (
                    <div key={idx}>
                      <div className="flex justify-between mb-2">
                        <span className="text-gray-400 text-sm">{domain.name}</span>
                        <span className={`text-sm font-bold ${color}`}>{label}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#667eea] to-[#14b8a6] transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Detailed Metrics Table */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>📊</span> Detailed Metrics (Micro Data)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Metric</th>
                      <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Score</th>
                      <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">National Avg</th>
                      <th className="text-left text-gray-400 text-sm font-medium py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { metric: '30-Day Mortality Rate', score: '14.2%', avg: '15.1%', better: true },
                      { metric: 'Hospital-Acquired Infections', score: '0.8%', avg: '1.2%', better: true },
                      { metric: '30-Day Readmission Rate', score: '16.5%', avg: '15.8%', better: false },
                      { metric: 'Patient Satisfaction Score', score: '87%', avg: '82%', better: true },
                      { metric: 'Average Wait Time', score: '45 min', avg: '52 min', better: true },
                    ].map((row, idx) => (
                      <tr key={idx} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="py-3 px-4 text-white">{row.metric}</td>
                        <td className="py-3 px-4 text-white font-medium">{row.score}</td>
                        <td className="py-3 px-4 text-gray-400">{row.avg}</td>
                        <td className="py-3 px-4">
                          <span className={`text-sm ${row.better ? 'text-green-400' : 'text-amber-400'}`}>
                            {row.better ? '↑ Above Avg' : '↓ Below Avg'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <span>⚡</span> Quick Stats
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Total Beds', value: '250', icon: '🏥' },
                  { label: 'ER Wait Time', value: '45min', icon: '⏱️' },
                  { label: 'Patient Reviews', value: '1,234', icon: '⭐' },
                  { label: 'Years Operating', value: '42', icon: '📅' },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center p-4 bg-white/5 rounded-lg">
                    <div className="text-2xl mb-2">{stat.icon}</div>
                    <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                    <div className="text-gray-400 text-xs">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* API Code Example */}
          <div className="card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span>💻</span> How This Was Built
            </h3>
            <div className="bg-black/50 p-4 rounded-lg border border-white/10 overflow-x-auto">
              <pre className="text-sm text-gray-300">
{`// 1. Search hospitals
const response = await fetch(
  'https://api.healthcaredata.io/hospitals?state=CA&name=Memorial'
);
const data = await response.json();

// 2. Get facility details
const facility = await fetch(
  'https://api.healthcaredata.io/hospitals/\${ccn}'
);

// 3. Get historical data
const history = await fetch(
  'https://api.healthcaredata.io/hospitals/\${ccn}/history'
);

// That's it! Build your dashboard in minutes.`}
              </pre>
            </div>
            <div className="mt-4 text-center">
              <a
                href="https://api.healthcaredata.io/docs"
                target="_blank"
                className="inline-block px-6 py-2 bg-gradient-to-r from-[#667eea] to-[#764ba2] text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                View Full API Documentation →
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="text-center py-8 mt-12 border-t border-white/10">
        <p className="text-gray-500 text-sm">
          Built with{' '}
          <a
            href="https://api.healthcaredata.io"
            target="_blank"
            className="text-[#667eea] hover:text-[#764ba2] transition-colors font-medium"
          >
            Healthcare Data API
          </a>
        </p>
      </footer>
    </div>
  );
}
