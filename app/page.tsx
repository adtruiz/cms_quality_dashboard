'use client';

import { useEffect, useState } from 'react';

interface Stats {
  hospitals: number;
  nursingHomes: number;
  dialysis: number;
  homeHealth: number;
}

interface FacilityData {
  name: string;
  state: string;
  overall_rating: number;
  city: string;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ hospitals: 0, nursingHomes: 0, dialysis: 0, homeHealth: 0 });
  const [topHospitals, setTopHospitals] = useState<FacilityData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch data from your API
    const fetchData = async () => {
      try {
        // Get stats from API
        const statsRes = await fetch('https://api.healthcaredata.io/stats');
        const statsData = await statsRes.json();

        // Extract provider counts
        setStats({
          hospitals: statsData.providers.hospitals.current,
          nursingHomes: statsData.providers['nursing-homes'].current,
          dialysis: statsData.providers.dialysis.current,
          homeHealth: statsData.providers['home-health'].current,
        });

        // Get top-rated hospitals
        const hospitalsRes = await fetch('https://api.healthcaredata.io/hospitals?min_rating=5&limit=10');
        const hospitalsData = await hospitalsRes.json();
        setTopHospitals(hospitalsData.results);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Hospitals',
      value: stats.hospitals.toLocaleString(),
      color: 'from-[#667eea] to-[#764ba2]',
      icon: '🏥'
    },
    {
      title: 'Nursing Homes',
      value: stats.nursingHomes.toLocaleString(),
      color: 'from-[#14b8a6] to-[#06b6d4]',
      icon: '🏡'
    },
    {
      title: 'Dialysis Facilities',
      value: stats.dialysis.toLocaleString(),
      color: 'from-[#3b82f6] to-[#06b6d4]',
      icon: '💉'
    },
    {
      title: 'Home Health',
      value: stats.homeHealth.toLocaleString(),
      color: 'from-[#10b981] to-[#14b8a6]',
      icon: '🏠'
    },
  ];

  return (
    <div className="min-h-screen p-6 md:p-12">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-[#667eea] to-[#764ba2] bg-clip-text text-transparent">
              Healthcare Quality Dashboard
            </h1>
            <p className="text-gray-400 text-lg">
              Live Medicare star ratings and quality data
            </p>
          </div>
          <div className="flex gap-3">
            <a
              href="/demo"
              className="card px-6 py-3 text-sm hover:scale-105 transition-transform bg-gradient-to-r from-[#667eea] to-[#764ba2]"
            >
              Try Interactive Demo →
            </a>
            <a
              href="https://api.healthcaredata.io"
              target="_blank"
              className="card px-6 py-3 text-sm hover:scale-105 transition-transform"
            >
              API Documentation
            </a>
          </div>
        </div>
        <div className="h-1 w-full bg-gradient-to-r from-[#667eea] via-[#14b8a6] to-[#764ba2] rounded-full opacity-50"></div>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {statCards.map((stat, idx) => (
          <div
            key={idx}
            className="card p-6 relative overflow-hidden"
          >
            {/* Gradient overlay */}
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${stat.color} opacity-10 rounded-full -mr-8 -mt-8`}></div>

            <div className="relative z-10">
              <div className="text-4xl mb-3">{stat.icon}</div>
              <div className={`text-4xl font-bold mb-2 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`}>
                {loading ? '...' : stat.value}
              </div>
              <div className="text-gray-400 text-sm uppercase tracking-wider">
                {stat.title}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Top Hospitals Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
        {/* 5-Star Hospitals */}
        <div className="card p-8">
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-4">⭐</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Top-Rated Hospitals</h2>
              <p className="text-gray-400 text-sm">5-star facilities across the nation</p>
            </div>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="text-gray-500">Loading...</div>
            ) : (
              topHospitals.slice(0, 5).map((hospital, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white text-sm">{hospital.name}</div>
                    <div className="text-gray-500 text-xs mt-1">
                      {hospital.city}, {hospital.state}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className="text-amber-400 text-xs">★</span>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Data Coverage */}
        <div className="card p-8">
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-4">📊</div>
            <div>
              <h2 className="text-2xl font-bold text-white">Data Coverage</h2>
              <p className="text-gray-400 text-sm">Historical trends & analytics</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400 text-sm">Total Facilities</span>
                <span className="text-white font-bold">
                  {(stats.hospitals + stats.nursingHomes + stats.dialysis + stats.homeHealth).toLocaleString()}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#667eea] to-[#14b8a6]" style={{width: '100%'}}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400 text-sm">Historical Data</span>
                <span className="text-white font-bold">2018-2025</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#3b82f6] to-[#06b6d4]" style={{width: '100%'}}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-400 text-sm">API Uptime</span>
                <span className="text-green-400 font-bold">99.9%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#10b981] to-[#14b8a6]" style={{width: '99.9%'}}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <div className="text-gray-400 text-xs">
                ✓ 8 years of quarterly data<br/>
                ✓ Real-time API access<br/>
                ✓ 10,000 free requests/day
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Provider Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="card p-6 border-l-4 border-[#667eea]">
          <h3 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
            <span>🏥</span> Hospital Ratings
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Overall ratings from 1-5 stars based on quality measures including patient safety, readmissions, and mortality rates.
          </p>
          <div className="flex gap-2">
            <a
              href="https://api.healthcaredata.io/docs#/Hospitals"
              target="_blank"
              className="text-[#667eea] text-sm hover:underline"
            >
              View API →
            </a>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-[#14b8a6]">
          <h3 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
            <span>🏡</span> Nursing Home Quality
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Comprehensive ratings covering health inspections, staffing, and quality measures for long-term care facilities.
          </p>
          <div className="flex gap-2">
            <a
              href="https://api.healthcaredata.io/docs#/Nursing%20Homes"
              target="_blank"
              className="text-[#14b8a6] text-sm hover:underline"
            >
              View API →
            </a>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-[#3b82f6]">
          <h3 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
            <span>💉</span> Dialysis Facility Performance
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Star ratings for dialysis centers based on patient outcomes, clinical measures, and standardized metrics.
          </p>
          <div className="flex gap-2">
            <a
              href="https://api.healthcaredata.io/docs#/Dialysis"
              target="_blank"
              className="text-[#3b82f6] text-sm hover:underline"
            >
              View API →
            </a>
          </div>
        </div>

        <div className="card p-6 border-l-4 border-[#10b981]">
          <h3 className="text-xl font-bold mb-3 text-white flex items-center gap-2">
            <span>🏠</span> Home Health Services
          </h3>
          <p className="text-gray-400 text-sm mb-4">
            Quality star ratings for home health agencies providing skilled care in patients' residences.
          </p>
          <div className="flex gap-2">
            <a
              href="https://api.healthcaredata.io/docs#/Home%20Health"
              target="_blank"
              className="text-[#10b981] text-sm hover:underline"
            >
              View API →
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-8 border-t border-white/10">
        <p className="text-gray-500 text-sm mb-3">
          Powered by{' '}
          <a
            href="https://api.healthcaredata.io"
            target="_blank"
            className="text-[#667eea] hover:text-[#764ba2] transition-colors font-medium"
          >
            Healthcare Data API
          </a>
        </p>
        <p className="text-gray-600 text-xs">
          Official Medicare star ratings curated from CMS (Centers for Medicare & Medicaid Services)
        </p>
      </footer>
    </div>
  );
}
