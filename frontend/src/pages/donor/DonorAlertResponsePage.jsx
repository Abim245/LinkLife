import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Droplet, CheckCircle2 } from 'lucide-react';
import { useBloodData } from '../../context/BloodDataContext';

export const DonorAlertResponsePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { emergencies, respondToEmergency } = useBloodData();

  const emergency = emergencies.find((e) => e.id === id);
  const [selectedEta, setSelectedEta] = useState('20 min');
  const [confirmed, setConfirmed] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [sending, setSending] = useState(false);

  if (!emergency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F8] p-6 text-center">
        <div className="space-y-3">
          <p className="text-sm text-stone-600">This alert is no longer available.</p>
          <Link to="/donor" className="text-sm font-semibold text-[#B81D24] hover:underline">
            Back to donor home
          </Link>
        </div>
      </div>
    );
  }

  // Reloading the page after answering still shows the right screen
  const showConfirmed = confirmed || emergency.myResponse === 'accepted';
  const showDeclined = declined || emergency.myResponse === 'declined';
  const etaShown = emergency.myEta || selectedEta;
  const isClosed = emergency.status !== 'LIVE';

  const handleAccept = async () => {
    setSending(true);
    const ok = await respondToEmergency(emergency.id, 'ACCEPTED', selectedEta);
    setSending(false);
    if (ok) setConfirmed(true);
  };

  const handleDecline = async () => {
    setSending(true);
    const ok = await respondToEmergency(emergency.id, 'DECLINED');
    setSending(false);
    if (ok) setDeclined(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F8] flex flex-col justify-between">
      {/* Top Bar with Brand */}
      <header className="p-4 sm:p-6 max-w-lg mx-auto w-full flex items-center justify-between">
        <Link to="/donor" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#B81D24] flex items-center justify-center text-white shadow-xs">
            <Droplet className="w-4 h-4 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900">LifeLink</span>
        </Link>

        <Link
          to="/donor"
          className="text-xs font-semibold text-stone-500 hover:text-stone-800 transition-colors"
        >
          Exit to app
        </Link>
      </header>

      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-4 flex flex-col justify-center">
        {showConfirmed ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xl text-center space-y-5">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Thank you! You're on the way.
            </h1>
            <p className="text-sm text-stone-600 leading-relaxed">
              We notified{' '}
              <strong className="text-stone-800">{emergency.hospitalName || 'the hospital'}</strong>{' '}
              of your estimated arrival time of <strong className="text-stone-800">{etaShown}</strong>.
            </p>

            <div className="bg-[#FAF3F1] border border-red-100 rounded-xl p-4 text-xs text-stone-800 text-left space-y-1.5">
              <div className="font-bold text-[#B81D24]">Where to go</div>
              <div>Please head to the hospital's emergency entrance.</div>
              {emergency.notes && <div>Note from the hospital: {emergency.notes}</div>}
            </div>

            <button
              onClick={() => navigate('/donor')}
              className="w-full py-3 rounded-xl bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors"
            >
              Back to donor home
            </button>
          </div>
        ) : showDeclined ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xl text-center space-y-5">
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Alert acknowledged
            </h1>
            <p className="text-sm text-stone-600">
              Thank you for letting us know promptly. We will alert another eligible donor in range.
            </p>
            <button
              onClick={() => navigate('/donor')}
              className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm shadow-xs transition-colors"
            >
              Back to donor home
            </button>
          </div>
        ) : isClosed ? (
          <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-xl text-center space-y-5">
            <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              This request is closed
            </h1>
            <p className="text-sm text-stone-600">
              Enough donors have already responded, or the hospital closed the request. Thank you for
              being ready to help.
            </p>
            <button
              onClick={() => navigate('/donor')}
              className="w-full py-3 rounded-xl bg-stone-900 text-white font-semibold text-sm shadow-xs transition-colors"
            >
              Back to donor home
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Crimson Red Card */}
            <div className="bg-[#B81D24] text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
              <div className="inline-block px-3 py-1 rounded-full bg-white/20 text-white text-xs font-extrabold tracking-wider uppercase">
                {emergency.urgency} EMERGENCY
              </div>

              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white text-[#B81D24] flex items-center justify-center font-black text-2xl shadow-sm shrink-0">
                  {emergency.bloodType}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold leading-snug">
                    {emergency.hospitalName || 'A hospital'} needs {emergency.unitsNeeded} units
                  </h1>
                  <p className="text-xs sm:text-sm text-red-100 mt-1">
                    {emergency.distanceKm != null ? `${emergency.distanceKm} km from you` : 'Near you'}{' '}
                    · Needed by {emergency.neededBy}
                  </p>
                </div>
              </div>
            </div>

            {/* ETA Selector */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-stone-900">
                How soon can you get there?
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {['10 min', '20 min', '30 min', '45 min'].map((eta) => (
                  <button
                    key={eta}
                    type="button"
                    onClick={() => setSelectedEta(eta)}
                    className={`py-3 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                      selectedEta === eta
                        ? 'bg-stone-900 text-white shadow-md'
                        : 'bg-white border border-stone-300 text-stone-700 hover:border-stone-400'
                    }`}
                  >
                    {eta}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={handleAccept}
                disabled={sending}
                className="w-full py-4 rounded-xl bg-[#B81D24] hover:bg-[#9E151E] text-white font-bold text-base shadow-sm transition-all active:scale-95 disabled:opacity-60"
              >
                {sending ? 'Sending...' : 'I can come'}
              </button>
              <button
                type="button"
                onClick={handleDecline}
                disabled={sending}
                className="w-full py-3.5 rounded-xl bg-white hover:bg-stone-50 text-stone-700 font-semibold text-sm border border-stone-300 transition-colors disabled:opacity-60"
              >
                Can't make it
              </button>
            </div>

            <p className="text-xs text-stone-500 text-center leading-relaxed px-4">
              After you accept, the hospital sees your name and arrival time.
            </p>
          </div>
        )}
      </main>

      <div className="p-4 text-center text-xs text-stone-400">
        Emergency coordinate response · LifeLink
      </div>
    </div>
  );
};

export default DonorAlertResponsePage;