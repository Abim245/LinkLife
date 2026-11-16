import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Droplet } from 'lucide-react';

export const ResetPasswordVerifyPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const target = searchParams.get('target') || 'j***@example.com';

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

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/reset-password/new');
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F8]">
      {/* Left Maroon Panel (UI/UX Page 24) */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-[#6B0E23] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between shrink-0">
        <div>
          <Link to="/" className="inline-flex items-center gap-2 mb-12 sm:mb-16">
            <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-[#6B0E23]">
              <Droplet className="w-4 h-4 fill-[#6B0E23]" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">LifeLink</span>
          </Link>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
              Locked out? We'll get you back in.
            </h1>
            <p className="text-base text-red-100 max-w-sm">Enter the code to prove it's you.</p>
          </div>
        </div>

        <div className="mt-12 bg-white/10 backdrop-blur-xs rounded-xl p-5 border border-white/15 text-xs text-red-100">
          For your safety, reset codes expire after 10 minutes and work only once.
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 p-6 sm:p-10 lg:p-16 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-xs font-bold uppercase tracking-wider text-[#B81D24] mb-1">
            STEP 1 OF 2
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            Check your messages
          </h2>
          <p className="text-sm text-stone-600 mb-8">
            We sent a 6-digit code to <strong className="text-stone-800">{target}</strong>. It may
            take a minute to arrive.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2 sm:gap-3">
              {code.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => (inputRefs.current[idx] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-extrabold rounded-xl border border-stone-300 bg-[#FAFAF9] text-stone-900 focus:outline-none focus:ring-2 focus:ring-[#B81D24]"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-lg bg-[#B81D24] hover:bg-[#9E151E] text-white font-semibold text-sm shadow-xs transition-colors"
            >
              Verify code
            </button>

            <div className="flex items-center justify-between text-xs text-stone-600 pt-2">
              <span>Resend code in [0:{timer < 10 ? `0${timer}` : timer}]</span>
              <Link to="/forgot-password" className="text-[#B81D24] font-semibold hover:underline">
                Use a different email or number
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordVerifyPage;
