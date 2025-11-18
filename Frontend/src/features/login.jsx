import { useState, useRef, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAdmin } from '../redux/admin/adminSlice';

export default function AdminLogin() {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const pin = searchParams.get('pin');

  const [otp, setOtp] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Auto-login with pin from URL
  useEffect(() => {
    if (pin?.length === 4) {
      setOtp(pin.split(''));
      handleLogin(pin);
    } else {
      inputRefs.current[0]?.focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }

    if (e.key === 'Enter' && otp.every(d => d)) {
      handleLogin(otp.join(''));
    }

    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const digits = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 4);

    if (digits) {
      const newOtp = [...otp];
      digits.split('').forEach((digit, i) => {
        if (i < 4) newOtp[i] = digit;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(digits.length, 3)]?.focus();
    }
  };

  const handleLogin = async (passCode) => {
    if (!sessionId) {
      setError('Session ID is required');
      return;
    }

    if (passCode.length < 4) {
      setError('Please enter all 4 digits');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passCode, sessionId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      dispatch(setAdmin({ authenticated: true, sessionId }));
      navigate(`/admin/${sessionId}`);

    } catch (err) {
      setError(err.message);
      setOtp(['', '', '', '']);
      setIsLoading(false);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  };

  const isComplete = otp.every(digit => digit !== '');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg font-semibold text-gray-700">Verifying access...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-12">
          <div className="bg-white border-2 border-gray-200 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-sm">
            <Lock className="w-10 h-10 text-gray-700" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Admin Access</h1>
          <p className="text-gray-600 text-lg">Enter your 4-digit passcode</p>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
          <div className="space-y-8">
            {/* OTP Input Grid */}
            <div className="flex justify-center space-x-3">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleInputChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none ${digit
                      ? 'border-gray-900 bg-gray-50 text-gray-900'
                      : 'border-gray-300 bg-white text-gray-700'
                    } focus:border-gray-900 focus:ring-4 focus:ring-gray-100 hover:border-gray-400`}
                  autoComplete="off"
                />
              ))}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600 text-center font-medium">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={() => handleLogin(otp.join(''))}
              disabled={!isComplete}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${isComplete
                  ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
            >
              <span>Continue</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Helper Text */}
            <div className="text-center">
              <p className="text-sm text-gray-500">
                Press Enter to submit or use arrow keys to navigate
              </p>
            </div>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mt-6 flex justify-center space-x-2">
          {otp.map((digit, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${digit ? 'bg-gray-900' : 'bg-gray-300'
                }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}