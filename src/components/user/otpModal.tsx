import React, { useRef, useEffect } from 'react';

interface OtpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (otpString: string) => void;
  onResend: () => void;
  otp: string[];
  setOtp: React.Dispatch<React.SetStateAction<string[]>>;
  otpError: string | null;
  timer: number;
  isExpired: boolean;
}

const OtpModal: React.FC<OtpModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onResend,
  otp,
  setOtp,
  otpError,
  timer,
  isExpired,
}) => {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleOtpChange = (index: number, value: string) => {
    if (!/^[a-zA-Z0-9]$/.test(value) && value !== '') return;
    const newOtp = [...otp];
    newOtp[index] = value.toUpperCase();
    setOtp(newOtp);

    if (value !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = () => {
    const otpString = otp.join('');
    onSubmit(otpString);
  };

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isOpen) {
      inputRefs.current[0]?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true"></div>
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="sm:flex sm:flex-col sm:items-center">
            <div className="mt-3 text-center sm:mt-0 sm:text-center sm:w-full">
              <h2 className="text-2xl font-bold mb-4 text-fuchsia-900">
                Enter OTP
              </h2>
              <p className="text-sm text-gray-600 mb-8">
                Please enter the 6-digit code sent to your email.
              </p>
              
              <div className="text-sm font-medium mb-6">
                {isExpired ? (
                  <span className="text-red-500">OTP Expired</span>
                ) : (
                  <span className="text-gray-600">Time remaining: {formatTime(timer)}</span>
                )}
              </div>

              <div className="flex justify-center gap-2 mb-6">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    ref={(el) => (inputRefs.current[index] = el)}
                    className="w-12 h-12 text-center text-2xl border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-fuchsia-900 focus:border-transparent disabled:bg-gray-100"
                    disabled={isExpired}
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-red-500 text-sm mb-6">
                  {otpError}
                </p>
              )}

              <div className="flex justify-end gap-3 mt-8">
                <button
                  onClick={onClose}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
                >
                  Cancel
                </button>
                {isExpired ? (
                  <button
                    onClick={onResend}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-fuchsia-700 border border-transparent rounded-md hover:bg-fuchsia-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fuchsia-500"
                  >
                    Resend OTP
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isExpired}
                    className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-fuchsia-700 border border-transparent rounded-md hover:bg-fuchsia-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Submit
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OtpModal;