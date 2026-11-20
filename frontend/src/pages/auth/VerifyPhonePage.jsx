import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Droplet } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../lib/api';
export const VerifyPhonePage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verifyOtpWithApi } = useAuth();

  const phone = searchParams.get('phone') || '';
  const role = searchParams.get('role');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => setTimer((t) => t - 1), 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleChange = (index, value) => {
    if (value.length > 1) {
      const pasted = value.slice(0, 6).split('');
      const newCode = [...code];
      pasted.forEach((char, i) => {
        newCode[i] = char;
      });
      setCode(newCode);
      if (inputRefs.current[Math.min(5, pasted.length)]) {
        inputRefs.current[Math.min(5, pasted.length)].focus();
      }
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

const handleSubmit = async (e) => {
  e.preventDefault();
  const joined = code.join('');
  if (joined.length < 6) return setError('Enter all 6 digits');
  setError('');
  setLoading(true);
  try {
    await verifyOtpWithApi(phone, joined);
    navigate(role === 'hospital' || role === 'bloodbank' ? '/application-status' : '/login');
  } catch (err) {
    setError(err.response?.data?.message || 'Could not verify the code');
  } finally {
    setLoading(false);
  }
};

const handleResend = async () => {
  try {
    await api.post('/auth/otp/resend', { phone });
    setError('');
    setTimer(30);
  } catch {
    setError('Could not resend the code');
  }
};

  return (
    <div className="min-h-screen bg-[#FAF9F8] flex flex-col justify-between">
      {/* Top Brand Bar */}
      <div className="p-6">
        <Link to="/" className="inline-flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[#B81D24] flex items-center justify-center text-white shadow-xs">
            <Droplet className="w-4 h-4 fill-white" />
          </div>
          <span className="text-xl font-bold tracking-tight text-stone-900">LifeLink</span>
        </Link>
      </div>

      {/* Centered Modal / Card (UI/UX Page 14 exact replica) */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-2xl p-8 sm:p-10 shadow-xl border border-stone-200/80">
          <div className="text-xs font-bold uppercase tracking-wider text-[#B81D24] mb-1">
            STEP 2 OF 2
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            Verify your phone
          </h1>
          <p className="text-sm text-stone-600 mb-8">
            Enter the 6-digit code we sent to <span className="font-semibold text-stone-800">{phone}</span>.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 6 Code Boxes */}
            <div className="flex justify-between gap-2 sm:gap-3">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-extrabold rounded-xl border border-stone-300 bg-[#FAFAF9] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B81D24] focus:border-transparent transition-all"
                />
              ))}
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">{error}</div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors active:scale-95"
              >
              {loading ? 'Verifying...' : 'Verify and continue'}
              Verify and continue
            </button>
          </form>

          {/* Resend & Change Number */}
          <div className="flex items-center justify-between text-xs text-stone-600 mt-6 pt-4 border-t border-stone-100">
            <span>
              {timer > 0 ? (
                <>Resend code in [0:{timer < 10 ? `0${timer}` : timer}]</>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-[#B81D24] font-semibold hover:underline"
                >
                  Resend code now
                </button>
              )}
            </span>
            <Link to="/register" className="font-semibold text-[#B81D24] hover:underline">
              Change number
            </Link>
          </div>
        </div>
      </div>

      <div className="p-6 text-center text-xs text-stone-400">
        © 2026 LifeLink. All rights reserved.
      </div>
    </div>
  );
};

export default VerifyPhonePage;
