import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, Download, Check, Plus, Minus } from 'lucide-react';
import StatusPill from '../../components/common/StatusPill';
import { useBloodData } from '../../context/BloodDataContext';
import { useAuth } from '../../context/AuthContext';
import { BLOOD_TYPES } from '../../utils/compatibility';

export const HospitalInventoryPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { inventory, adjustStock, stockMovements, recordMovement, refreshInventory } =
    useBloodData();

  // Stock movement form state
  const [moveType, setMoveType] = useState('O-');
  const [moveDirection, setMoveDirection] = useState('add');
  const [moveUnits, setMoveUnits] = useState('1');
  const [moveReason, setMoveReason] = useState('Donation received');
  const [moveNote, setMoveNote] = useState('');
  const [movementFilter, setMovementFilter] = useState('ALL');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [message, setMessage] = useState('Stock is up to date.');

  const backPath = currentUser?.role === 'bloodbank' ? '/bloodbank' : '/hospital';

  const totalUnits = inventory.reduce((sum, item) => sum + item.units, 0);
  const lowTypes = inventory.filter((item) => item.status === 'LOW').map((item) => item.type);
  const belowThresholdCount = lowTypes.length;
  const onWatchCount = inventory.filter((item) => item.status === 'WATCH').length;

  const flash = (text) => {
    setMessage(text);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleRecordSubmit = (e) => {
    e.preventDefault();
    const units = Number(moveUnits);
    if (!units || units < 1) return;

    if (moveDirection === 'remove') {
      const have = inventory.find((i) => i.type === moveType)?.units ?? 0;
      if (units > have) {
        alert(`Not enough ${moveType} in stock (you have ${have}).`);
        return;
      }
    }

    recordMovement(moveType, moveDirection, units, moveReason, moveNote);
    setMoveNote('');
    flash('Stock change recorded.');
  };

  const handleRefresh = async () => {
    await refreshInventory();
    flash('Stock is up to date.');
  };

  const filteredMovements = stockMovements.filter((m) => {
    if (movementFilter === 'ADDED') return m.change > 0;
    if (movementFilter === 'REMOVED') return m.change < 0;
    return true;
  });

  const filterClass = (f) =>
    `px-2.5 py-1 rounded transition-colors ${
      movementFilter === f ? 'bg-white text-stone-900 shadow-xs font-semibold' : 'text-stone-600'
    }`;

  return (
    <div className="min-h-screen bg-[#FAF9F8]">
      {/* Top Bar with Back Link */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to={backPath}
            className="inline-flex items-center gap-2 text-sm font-semibold text-stone-700 hover:text-[#B81D24] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to dashboard</span>
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header & Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
              Inventory
            </h1>
            <p className="text-xs sm:text-sm text-stone-500 mt-1">
              Changes are saved as you adjust the units.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Exporting inventory CSV...')}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-white border border-stone-300 hover:bg-stone-50 text-stone-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleRefresh}
              className="px-5 py-2 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-xs font-semibold shadow-xs transition-colors"
            >
              Refresh stock
            </button>
          </div>
        </div>

        {saveSuccess && (
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{message}</span>
          </div>
        )}

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Total units
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-2">
              {totalUnits}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border-2 border-red-200 shadow-xs">
            <div className="text-xs font-semibold text-[#B81D24] uppercase tracking-wider">
              Types below threshold
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-[#B81D24] mt-2">
              {belowThresholdCount}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-stone-200/80 shadow-xs">
            <div className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Types on watch
            </div>
            <div className="text-3xl sm:text-4xl font-extrabold text-stone-900 mt-2">
              {onWatchCount}
            </div>
          </div>
        </div>

        {/* Low Stock Warning Banner (names the types that are actually low) */}
        {belowThresholdCount > 0 && (
          <div className="bg-[#FAF3F1] border border-red-200 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-red-100 text-[#B81D24] flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="w-4 h-4 text-[#B81D24]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900">
                  {lowTypes.join(', ')} {lowTypes.length > 1 ? 'are' : 'is'} below your low-stock
                  threshold
                </h3>
                <p className="text-xs text-stone-600 mt-0.5">
                  Declare a shortage to alert eligible donors near you.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/hospital#declare-form')}
              className="px-5 py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white text-xs font-semibold shadow-xs transition-colors shrink-0"
            >
              Declare shortage
            </button>
          </div>
        )}

        {/* Stock by Blood Type Table */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-4">
          <div>
            <h2 className="text-lg font-bold text-stone-900">Stock by blood type</h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Adjust units directly, or record a movement below to keep a log.
            </p>
          </div>

          <div className="border border-stone-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Units available</th>
                    <th className="py-3 px-4">Low-stock at</th>
                    <th className="py-3 px-4">Level</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Last changed</th>
                    <th className="py-3 px-4 text-right">History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {inventory.map((item) => (
                    <tr key={item.type} className="hover:bg-stone-50/60">
                      <td className="py-3 px-4 font-bold text-[#B81D24] text-sm">{item.type}</td>
                      <td className="py-3 px-4">
                        <div className="inline-flex items-center gap-1.5 border border-stone-200 rounded-lg p-0.5 bg-white">
                          <button
                            type="button"
                            onClick={() => adjustStock(item.type, -1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-8 text-center font-bold text-stone-900 text-xs">
                            {item.units}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustStock(item.type, 1)}
                            className="w-6 h-6 rounded flex items-center justify-center text-stone-600 hover:bg-stone-100 active:scale-95"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-600">
                        <span className="px-2 py-1 rounded bg-stone-100 border border-stone-200">
                          {item.lowThreshold}
                        </span>
                      </td>
                      <td className="py-3 px-4 w-32 sm:w-48">
                        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              item.status === 'LOW'
                                ? 'bg-[#B81D24]'
                                : item.status === 'WATCH'
                                ? 'bg-amber-500'
                                : 'bg-emerald-600'
                            }`}
                            style={{ width: `${Math.min(100, (item.units / 20) * 100)}%` }}
                          />
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <StatusPill status={item.status} size="xs" />
                      </td>
                      <td className="py-3 px-4 text-stone-500">{item.lastChanged}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => {
                            setMoveType(item.type);
                            document
                              .getElementById('record-change')
                              ?.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="font-semibold text-[#B81D24] hover:underline"
                        >
                          Record
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 2 Bottom Cards: Record a stock change & Movement log */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Record a stock change */}
          <div
            id="record-change"
            className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-4"
          >
            <h2 className="text-base font-bold text-stone-900">Record a stock change</h2>

            <form onSubmit={handleRecordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Blood type</label>
                <select
                  value={moveType}
                  onChange={(e) => setMoveType(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white font-semibold"
                >
                  {BLOOD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">Direction</label>
                  <select
                    value={moveDirection}
                    onChange={(e) => setMoveDirection(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                  >
                    <option value="add">Add units (+)</option>
                    <option value="remove">Remove units (−)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-stone-700 mb-1.5">Units</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={moveUnits}
                    onChange={(e) => setMoveUnits(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">Reason</label>
                <select
                  value={moveReason}
                  onChange={(e) => setMoveReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                >
                  <option value="Donation received">Donation received</option>
                  <option value="Issued to hospital">Issued to hospital</option>
                  <option value="Used in surgery">Used in surgery / ER</option>
                  <option value="Expired">Expired</option>
                  <option value="Adjustment">Audit adjustment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-stone-700 mb-1.5">
                  Note (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Batch or request reference"
                  value={moveNote}
                  onChange={(e) => setMoveNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-[#B81D24] bg-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-xs shadow-xs transition-colors"
              >
                Record change
              </button>
            </form>
          </div>

          {/* Right: Movement log */}
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-7 border border-stone-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-stone-900">Movement log</h2>
                <p className="text-[11px] text-stone-500 mt-0.5">Changes made in this session.</p>
              </div>
              <div className="inline-flex rounded-lg border border-stone-200 p-0.5 bg-stone-50 text-[11px] font-medium">
                <button onClick={() => setMovementFilter('ALL')} className={filterClass('ALL')}>
                  All
                </button>
                <button onClick={() => setMovementFilter('ADDED')} className={filterClass('ADDED')}>
                  Added
                </button>
                <button
                  onClick={() => setMovementFilter('REMOVED')}
                  className={filterClass('REMOVED')}
                >
                  Removed
                </button>
              </div>
            </div>

            <div className="border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF9F8] text-stone-600 font-semibold border-b border-stone-200">
                  <tr>
                    <th className="py-2.5 px-3">When</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Change</th>
                    <th className="py-2.5 px-3">Reason</th>
                    <th className="py-2.5 px-3">By</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 text-stone-800">
                  {filteredMovements.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 px-3 text-center text-stone-400">
                        No changes recorded yet.
                      </td>
                    </tr>
                  )}
                  {filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-stone-50/60">
                      <td className="py-2.5 px-3 text-stone-500">{m.when}</td>
                      <td className="py-2.5 px-3 font-bold text-[#B81D24]">{m.type}</td>
                      <td className="py-2.5 px-3 font-mono font-bold">
                        <span className={m.change > 0 ? 'text-emerald-700' : 'text-[#B81D24]'}>
                          {m.change > 0 ? `+${m.change}` : m.change}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-medium">{m.reason}</td>
                      <td className="py-2.5 px-3 text-stone-500">{m.by}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HospitalInventoryPage;