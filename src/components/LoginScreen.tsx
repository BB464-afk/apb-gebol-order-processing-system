import React, { useState } from 'react';
import { UserRole } from '../types/user';

interface LoginScreenProps {
  onLogin: (email?: string, role?: UserRole) => void;
}

type AuthStep = 'login' | 'forgot-email' | 'forgot-otp' | 'forgot-password' | 'forgot-success';

interface FieldErrors {
  loginIdentifier?: string;
  password?: string;
  forgotEmail?: string;
  otp?: string;
  newPassword?: string;
  confirmPassword?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<FieldErrors>({});
  const [successNotice, setSuccessNotice] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Clear specific field error
  const clearFieldError = (field: keyof FieldErrors) => {
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  // Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessNotice('');

    const newErrors: FieldErrors = {};
    const trimmedId = loginIdentifier.trim();

    if (!trimmedId) {
      newErrors.loginIdentifier = 'User ID or Email is required';
    }

    if (!password) {
      newErrors.password = 'Password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onLogin(trimmedId);
    }, 250);
  };

  // Step 1: Request OTP for registered email / User ID
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedEmail = forgotEmail.trim();
    if (!trimmedEmail) {
      setErrors({ forgotEmail: 'Registered email address or User ID is required' });
      return;
    }

    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtp('');
      setStep('forgot-otp');
    }, 300);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedOtp = otp.trim();
    if (!trimmedOtp) {
      setErrors({ otp: 'Verification code (OTP) is required' });
      return;
    }

    if (trimmedOtp.length < 4) {
      setErrors({ otp: 'Please enter a valid verification code' });
      return;
    }

    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setNewPassword('');
      setConfirmPassword('');
      setStep('forgot-password');
    }, 300);
  };

  // Step 2b: Resend OTP
  const handleResendOtp = () => {
    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setOtp('');
    }, 300);
  };

  // Step 3: Set New Password & Confirm Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FieldErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (newPassword && confirmPassword && newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep('forgot-success');
    }, 350);
  };

  return (
    <div className="min-h-screen w-full relative select-none overflow-x-hidden flex flex-col justify-between p-6 sm:p-10 text-[#8f9494]">
      {/* Background Image (B Login.png) with Subtle White Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
        style={{ backgroundImage: "url('/B%20Login.png')" }}
      />
      <div className="absolute inset-0 bg-white/45 z-0 pointer-events-none" />

      {/* 🔹 Top Header Bar */}
      <div className="w-full flex items-start justify-between relative z-10">
        {/* Top Left: Logo */}
        <div className="flex items-center pt-1">
          {!imgError ? (
            <img
              src="/expanded.png"
              alt="GEBOL"
              className="h-10 sm:h-12 md:h-14 max-w-[220px] object-contain"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 font-black rounded-lg flex items-center justify-center text-xl shadow-xs shrink-0 select-none bg-[#F8B800] text-[#262626]">
                G
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold tracking-wider text-xl leading-tight text-[#4f4f4e]">
                  GEBOL
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest leading-tight text-[#F8B800]">
                  ORDER PROCESSING
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Top Right: Tagline image */}
        <div className="flex items-start gap-3 sm:gap-5 shrink-0 -mt-6 sm:-mt-10">
          <img
            src="/Screenshot_3.png"
            alt="GEBOL Tagline"
            className="h-20 sm:h-28 md:h-32 w-auto object-contain drop-shadow-xs"
          />
        </div>
      </div>

      {/* 🔹 Center Container: Spacious, aligned with application styling, NO round corners */}
      <div className="flex-1 flex items-center justify-center my-6 relative z-10">
        <div className="w-full max-w-[460px] bg-white border border-[#E0E0E0] rounded-none shadow-md p-8 sm:p-10 text-center">
          
          {/* STEP: LOGIN */}
          {step === 'login' && (
            <div>
              <div className="mb-7">
                <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
                  Sign In
                </h1>
                <p className="text-[15px] mt-2 font-light text-[#8f9494]">
                  Sign in to your GEBOL account
                </p>
              </div>

              {successNotice && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded text-left">
                  {successNotice}
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4 text-left" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    User ID / Email
                  </label>
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      clearFieldError('loginIdentifier');
                    }}
                    placeholder="Enter User ID or Email"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded text-sm text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                      errors.loginIdentifier
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                    }`}
                    autoFocus
                  />
                  {errors.loginIdentifier && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.loginIdentifier}
                    </p>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(loginIdentifier);
                        setErrors({});
                        setSuccessNotice('');
                        setStep('forgot-email');
                      }}
                      className="text-xs text-[#f7b611] hover:text-[#e2a508] font-medium transition-colors cursor-pointer hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      clearFieldError('password');
                    }}
                    placeholder="Enter Password"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded text-sm text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                      errors.password
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                    }`}
                  />
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs select-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <span className="text-white font-semibold">Login</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP: FORGOT PASSWORD - REGISTERED EMAIL */}
          {step === 'forgot-email' && (
            <div>
              <div className="mb-7">
                <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
                  Forgot Password
                </h1>
                <p className="text-[14px] mt-2 font-light text-[#8f9494]">
                  Enter your registered User ID or Email to receive an OTP.
                </p>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4 text-left" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    Registered Email / User ID
                  </label>
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={(e) => {
                      setForgotEmail(e.target.value);
                      clearFieldError('forgotEmail');
                    }}
                    placeholder="e.g. user@gebol.at"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded text-sm text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                      errors.forgotEmail
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                    }`}
                    autoFocus
                  />
                  {errors.forgotEmail && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.forgotEmail}
                    </p>
                  )}
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs select-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <span className="text-white font-semibold">Send OTP</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErrors({});
                      setStep('login');
                    }}
                    className="w-full text-center text-xs text-[#8f9494] hover:text-[#4f4f4e] font-medium py-1 transition-colors cursor-pointer"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP: FORGOT PASSWORD - OTP VERIFICATION */}
          {step === 'forgot-otp' && (
            <div>
              <div className="mb-7">
                <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
                  OTP Verification
                </h1>
                <p className="text-[14px] mt-2 font-light text-[#8f9494]">
                  Enter the verification code sent to <span className="font-semibold text-[#4f4f4e]">{forgotEmail}</span>
                </p>
              </div>

              <form onSubmit={handleVerifyOtp} className="space-y-4 text-left" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    Verification Code (OTP)
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value);
                      clearFieldError('otp');
                    }}
                    placeholder="Enter OTP"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded text-center font-mono text-base tracking-widest text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                      errors.otp
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                    }`}
                    autoFocus
                  />
                  {errors.otp && (
                    <p className="mt-1 text-xs text-red-600 font-medium text-center">
                      {errors.otp}
                    </p>
                  )}
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs select-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <span className="text-white font-semibold">Verify OTP</span>
                    )}
                  </button>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setErrors({});
                        setStep('forgot-email');
                      }}
                      className="text-[#8f9494] hover:text-[#4f4f4e] font-medium transition-colors cursor-pointer"
                    >
                      Change Email
                    </button>
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      className="text-[#f7b611] hover:text-[#e2a508] font-medium transition-colors cursor-pointer hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* STEP: FORGOT PASSWORD - NEW PASSWORD & CONFIRM PASSWORD */}
          {step === 'forgot-password' && (
            <div>
              <div className="mb-7">
                <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
                  Set New Password
                </h1>
                <p className="text-[14px] mt-2 font-light text-[#8f9494]">
                  Enter your new password and confirm it.
                </p>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-4 text-left" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      clearFieldError('newPassword');
                    }}
                    placeholder="Enter new password"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded text-sm text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                      errors.newPassword
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                    }`}
                    autoFocus
                  />
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      clearFieldError('confirmPassword');
                    }}
                    placeholder="Confirm new password"
                    className={`w-full px-3.5 py-2.5 bg-white border rounded text-sm text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                      errors.confirmPassword
                        ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                        : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                    }`}
                  />
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <div className="pt-2 space-y-3">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs select-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <span className="text-white font-semibold">Update Password</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErrors({});
                      setStep('login');
                    }}
                    className="w-full text-center text-xs text-[#8f9494] hover:text-[#4f4f4e] font-medium py-1 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP: FORGOT PASSWORD - SUCCESS & PROCEED TO LOGIN */}
          {step === 'forgot-success' && (
            <div className="space-y-5">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
                  Password Reset Complete
                </h1>
                <p className="text-[14px] mt-2 font-light text-[#8f9494]">
                  Your password has been successfully updated. You can now log in with your new credentials.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier(forgotEmail);
                    setPassword('');
                    setErrors({});
                    setSuccessNotice('Password updated successfully. Please enter your new password to login.');
                    setStep('login');
                  }}
                  className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs select-none"
                >
                  <span className="text-white font-semibold">Proceed to Login</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 🔹 Bottom Copyright */}
      <div className="text-center text-xs text-[#4f4f4e] font-light relative z-10">
        &copy; {new Date().getFullYear()} GEBOL GmbH &bull; All Rights Reserved
      </div>
    </div>
  );
};
