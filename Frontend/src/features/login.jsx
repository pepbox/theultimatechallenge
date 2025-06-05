import { useState, useRef, useEffect } from 'react';
import { Lock, ArrowRight } from 'lucide-react';
import { useParams } from 'react-router-dom';

export default function AdminLogin() {
  // You can set this dynamically or pass it as a prop
  const {sessionId} = useParams();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // Only take the last digit
    setOtp(newOtp);
    
    // Clear errors when user starts typing
    if (errors.passCode) {
      setErrors({});
    }

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        // If current input is empty, focus previous and clear it
        inputRefs.current[index - 1]?.focus();
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
      }
    }
    
    // Handle Enter key
    if (e.key === 'Enter') {
      handleSubmit();
    }
    
    // Handle arrow keys
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowRight' && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 4);
    
    if (digits.length > 0) {
      const newOtp = [...otp];
      for (let i = 0; i < digits.length && i < 4; i++) {
        newOtp[i] = digits[i];
      }
      setOtp(newOtp);
      
      // Focus the next empty input or the last one
      const nextIndex = Math.min(digits.length, 3);
      inputRefs.current[nextIndex]?.focus();
    }
  };

  const validateForm = () => {
    const passCode = otp.join('');
    const newErrors = {};
    
    if (!sessionId) {
      newErrors.sessionId = 'Session ID is required';
    }
    
    if (passCode.length < 4) {
      newErrors.passCode = 'Please enter all 4 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    const passCode = otp.join('');
    
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_BASE_URL}/api/v1/admin/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ passCode, sessionId }),
        credentials: 'include'
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle specific error messages from the backend
        if (response.status === 400) {
          throw new Error(data.error || 'Invalid input provided');
        } else if (response.status === 401) {
          throw new Error('Invalid passcode. Please try again.');
        } else if (response.status === 404) {
          throw new Error('Session not found. Please check your session ID.');
        } else {
          throw new Error(data.error || 'Login failed');
        }
      }

      // Success - redirect to admin dashboard
      console.log('Login successful:', data.message);
      window.location.href = `/admin/${sessionId}`;
      
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ submit: error.message });
      setIsLoading(false);
      // Clear OTP on error and refocus first input
      setOtp(['', '', '', '']);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  };

  const isComplete = otp.every(digit => digit !== '');

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
                  className={`w-14 h-14 text-center text-2xl font-bold border-2 rounded-xl transition-all duration-200 focus:outline-none ${
                    digit 
                      ? 'border-gray-900 bg-gray-50 text-gray-900' 
                      : 'border-gray-300 bg-white text-gray-700'
                  } focus:border-gray-900 focus:ring-4 focus:ring-gray-100 hover:border-gray-400`}
                  autoComplete="off"
                />
              ))}
            </div>

            {/* Error Messages */}
            {errors.passCode && (
              <div className="text-center">
                <p className="text-sm text-red-600 bg-red-50 py-2 px-4 rounded-lg border border-red-200">
                  {errors.passCode}
                </p>
              </div>
            )}

            {errors.sessionId && (
              <div className="text-center">
                <p className="text-sm text-red-600 bg-red-50 py-2 px-4 rounded-lg border border-red-200">
                  {errors.sessionId}
                </p>
              </div>
            )}

            {errors.submit && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600 text-center font-medium">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!isComplete || isLoading}
              className={`w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center space-x-2 ${
                isComplete && !isLoading
                  ? 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
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
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                digit ? 'bg-gray-900' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}