import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, FileText, Search } from 'lucide-react';
import StatusPill from '../../components/common/StatusPill';
import { useBloodData } from '../../context/BloodDataContext';

export const DonorHistoryPage = () => {
  const { donorHistory } = useBloodData();
  const [activeTab, setActiveTab] = useState('DONATIONS');
  const [yearFilter, setYearFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredHistory = donorHistory.filter((item) => {
    if (searchQuery && !item.where.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    if (yearFilter !== 'ALL' && !item.date.includes(yearFilter)) {
      return false;
    }
    return true;
  });

  // Chart data for Donations Per Year
  const yearData = [
    { year: '2023', count: 1, height: 'h-16' },
    { year: '2024', count: 3, height: 'h-28' },
    { year: '2025', count: 2, height: 'h-20' },
    { year: '2026', count: 4, height: 'h-36' },
  ];

  return (
    <div className="min-h-screen bg-[#FAF9F8]">
      {/* Top Bar with Back Link */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/donor"
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-[#B81D24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to home</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header & Actions (UI/UX Page 22) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Donation history
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Every donation and alert response, in one place.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Exporting donations CSV...')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => alert('Generating official donor certificate PDF...')}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Download donation record</span>
            </button>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total donations
            </div>
            <div className="text-3xl font-extrabold text-stone-900 mt-2">8</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Last donation
            </div>
            <div className="text-xl sm:text-2xl font-bold text-stone-900 mt-2">Aug 15, 2026</div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Next eligible
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xl sm:text-2xl font-bold text-stone-900">Today</span>
              <StatusPill status="ELIGIBLE NOW" size="xs" />
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Alerts answered
            </div>
            <div className="text-3xl font-extrabold text-stone-900 mt-2">12</div>
          </div>
        </div>

        {/* Donations Per Year Visual Chart (UI/UX Page 22) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-stone-900">Donations per year</h2>
          <div className="pt-6 pb-2 border-b border-stone-200 flex items-end justify-around h-48">
            {yearData.map((d) => (
              <div key={d.year} className="flex flex-col items-center gap-2 group">
                <span className="text-xs font-bold text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity">
                  {d.count} units
                </span>
                <div
                  className={`w-12 sm:w-16 bg-[#B81D24] rounded-t-lg transition-all duration-500 ${d.height} hover:bg-[#9E151E]`}
                />
                <span className="text-xs font-semibold text-stone-600 mt-1">{d.year}</span>
              </div>
            ))}
          </div>
        </div>

        {/* History Table with Filters */}
        <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
          {/* Controls Bar */}
          <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            {/* Filter Tabs */}
            <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('DONATIONS')}
                className={`px-4 py-1.5 rounded-md transition-colors ${
                  activeTab === 'DONATIONS'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600'
                }`}
              >
                Donations
              </button>
              <button
                onClick={() => setActiveTab('RESPONSES')}
                className={`px-4 py-1.5 rounded-md transition-colors ${
                  activeTab === 'RESPONSES'
                    ? 'bg-white text-stone-900 shadow-xs font-semibold'
                    : 'text-stone-600'
                }`}
              >
                All responses
              </button>
            </div>

            {/* Year & Search Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-700 bg-white"
              >
                <option value="ALL">All years</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
              </select>

              <div className="relative">
                <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search hospital"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-stone-300 text-xs text-stone-700 bg-white focus:outline-none focus:ring-1 focus:ring-[#B81D24]"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                <tr>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Where</th>
                  <th className="py-3 px-4">Blood type</th>
                  <th className="py-3 px-4">Units</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-800">
                {filteredHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="py-3.5 px-4 text-stone-600 font-medium">{item.date}</td>
                    <td className="py-3.5 px-4 font-semibold text-stone-900">{item.where}</td>
                    <td className="py-3.5 px-4 font-bold text-[#B81D24]">{item.bloodType}</td>
                    <td className="py-3.5 px-4">{item.units}</td>
                    <td className="py-3.5 px-4">
                      <StatusPill status={item.status} size="xs" />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() =>
                          alert(`Donation Verification Details for ${item.where} on ${item.date}`)
                        }
                        className="font-semibold text-[#B81D24] hover:underline"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Info Banner & Pagination (Page 22) */}
          <div className="p-4 bg-[#FAF3F1] border-t border-red-100 text-xs text-stone-700">
            A donation shows as <strong className="text-stone-900">confirmed</strong> once the
            hospital or blood bank records it after you arrive. If something looks wrong,{' '}
            <button
              onClick={() => alert('Support request submitted.')}
              className="font-semibold text-[#B81D24] underline"
            >
              contact support
            </button>
            .
          </div>

          <div className="p-4 border-t border-stone-200 bg-[#FAF9F8] flex items-center justify-between text-xs text-stone-600">
            <span>Showing [1–{filteredHistory.length}] of [{filteredHistory.length}]</span>
            <div className="flex items-center gap-2">
              <button
                disabled
                className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-stone-400 cursor-not-allowed"
              >
                Previous
              </button>
              <button
                disabled
                className="px-3 py-1.5 rounded-md border border-stone-300 bg-white text-stone-400 cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DonorHistoryPage;
