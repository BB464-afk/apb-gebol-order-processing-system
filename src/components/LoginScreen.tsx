import React, { useState } from 'react';
import { UserRole } from '../types/user';
import {
  Eye,
  EyeOff,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Lock,
} from 'lucide-react';
import {
  authenticateUser,
  setUserNewPassword,
  resetSuperAdminPasswordWithCode,
  isSuperAdminEmail,
  verifySuperAdminRecoveryCode,
} from '../utils/userStore';

interface LoginScreenProps {
  onLogin: (email?: string, role?: UserRole) => void;
}

type AuthStep =
  | 'login'
  | 'forgot-email'
  | 'regular-user-contact-admin'
  | 'superadmin-recovery'
  | 'superadmin-recovery-success'
  | 'create-new-password';

interface FieldErrors {
  loginIdentifier?: string;
  password?: string;
  forgotEmail?: string;
  recoveryCode?: string;
  newPassword?: string;
  confirmPassword?: string;
  general?: string;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('login');
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Password Visibility Toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showRecoveryCode, setShowRecoveryCode] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Forgot Password Email Field
  const [forgotEmail, setForgotEmail] = useState('');

  // Super Admin Recovery Fields
  const [recoveryCode, setRecoveryCode] = useState('');

  // New Password Creation Fields (used in Force Change and Super Admin Recovery)
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

  // 🔹 1. Handle Login Submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessNotice('');

    const newErrors: FieldErrors = {};
    const trimmedId = loginIdentifier.trim();

    if (!trimmedId) {
      newErrors.loginIdentifier = 'Email is required';
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
      const authResult = authenticateUser(trimmedId, password);

      if (!authResult.success) {
        setErrors({
          password: authResult.error || 'Invalid email or password. Please check your credentials.',
        });
        return;
      }

      // If user logged in with temporary password, FORCE Create New Password screen
      if (authResult.requiresNewPassword) {
        setNewPassword('');
        setConfirmPassword('');
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setStep('create-new-password');
        return;
      }

      // Permanent credentials: login directly into the application
      onLogin(trimmedId, authResult.user?.role);
    }, 250);
  };

  // 🔹 2. Handle Forgot Password Email Submission (Auto-detects Role)
  const handleForgotEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = forgotEmail.trim();

    if (!trimmedEmail) {
      setErrors({ forgotEmail: 'Registered email address is required' });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(trimmedEmail)) {
      setErrors({ forgotEmail: 'Please enter a valid email address' });
      return;
    }

    setErrors({});
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      // System automatically identifies role from account/email
      const isSuper = isSuperAdminEmail(trimmedEmail);

      if (isSuper) {
        // Super Admin -> Show Recovery Code screen
        setRecoveryCode('');
        setNewPassword('');
        setConfirmPassword('');
        setShowRecoveryCode(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        setStep('superadmin-recovery');
      } else {
        // Regular User -> Show contact Super Admin screen (No OTP/email recovery)
        setStep('regular-user-contact-admin');
      }
    }, 250);
  };

  // 🔹 3. Handle Create New Password Submission (For Regular User logging in with Temp Password)
  const handleCreateNewPasswordSubmit = (e: React.FormEvent) => {
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
      const trimmedEmail = loginIdentifier.trim();
      const updated = setUserNewPassword(trimmedEmail, newPassword);

      if (updated) {
        // Successfully created new password -> proceed directly into application
        onLogin(trimmedEmail);
      } else {
        setErrors({ general: 'Failed to update password. Please try again.' });
      }
    }, 300);
  };

  // 🔹 4. Handle Super Admin Recovery Submission (Recovery Code + New Password)
  const handleSuperAdminRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FieldErrors = {};
    const trimmedAdminEmail = forgotEmail.trim() || loginIdentifier.trim();
    const trimmedCode = recoveryCode.trim();

    if (!trimmedCode) {
      newErrors.recoveryCode = 'Recovery Code is required';
    } else if (!verifySuperAdminRecoveryCode(trimmedCode)) {
      newErrors.recoveryCode = 'Invalid Recovery Code. Please enter your valid Super Admin Recovery Code.';
    }

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
      const res = resetSuperAdminPasswordWithCode(trimmedAdminEmail, trimmedCode, newPassword);

      if (res.success) {
        setStep('superadmin-recovery-success');
      } else {
        setErrors({ general: res.error || 'Password recovery failed. Please check your recovery code.' });
      }
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

      {/* 🔹 Center Container: Clean card */}
      <div className="flex-1 flex items-center justify-center my-6 relative z-10">
        <div className="w-full max-w-[460px] bg-white border border-[#E0E0E0] rounded-none shadow-md p-8 sm:p-10 text-center">

          {/* ========================================================= */}
          {/* STEP 1: LOGIN (UNCHANGED CLEAN LOGIN UI)                  */}
          {/* ========================================================= */}
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
                {/* Email Field */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    Email ID
                  </label>
                  <input
                    type="email"
                    value={loginIdentifier}
                    onChange={(e) => {
                      setLoginIdentifier(e.target.value);
                      clearFieldError('loginIdentifier');
                    }}
                    placeholder="Enter your email"
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

                {/* Password Field with Show/Hide Toggle */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        clearFieldError('password');
                      }}
                      placeholder="Enter Password"
                      className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded text-sm text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                        errors.password
                          ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.password}
                    </p>
                  )}

                  {/* Forgot Password Link - Positioned Below Password Field */}
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setErrors({});
                        setSuccessNotice('');
                        setForgotEmail(loginIdentifier);
                        setStep('forgot-email');
                      }}
                      className="text-xs text-[#f7b611] hover:text-[#e2a508] font-semibold transition-colors cursor-pointer hover:underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* Login Button */}
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

          {/* ========================================================= */}
          {/* STEP 2: FORGOT PASSWORD - ASK REGISTERED EMAIL            */}
          {/* (No role selection - System automatically detects role)   */}
          {/* ========================================================= */}
          {step === 'forgot-email' && (
            <div>
              <div className="mb-7">
                <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
                  Reset Password
                </h1>
                <p className="text-[14px] mt-2 font-light text-[#8f9494]">
                  Enter your registered email address to proceed.
                </p>
              </div>

              <form onSubmit={handleForgotEmailSubmit} className="space-y-4 text-left" noValidate>
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    Registered Email
                  </label>
                  <input
                    type="email"
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

                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs select-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <span className="text-white font-semibold">Continue</span>
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

          {/* ========================================================= */}
          {/* STEP 3A: REGULAR USER - CONTACT SUPER ADMIN MESSAGE       */}
          {/* (Identified as regular user: no email/OTP recovery)       */}
          {/* ========================================================= */}
          {step === 'regular-user-contact-admin' && (
            <div className="space-y-6 text-center animate-in fade-in duration-200">
              <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-[#ED6C02] shadow-2xs">
                <KeyRound className="w-6 h-6 text-[#ED6C02]" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
                  Forgot your password?
                </h1>
                <p className="text-[15px] mt-3 font-semibold text-[#4f4f4e] leading-relaxed">
                  Please contact your Super Admin to reset your password they can generate a secure temporary password for your account
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded p-3 text-xs text-amber-950 text-left">
                <div className="flex justify-between items-center text-[11px] text-amber-900 font-medium">
                  <span>Account Email:</span>
                  <span className="font-mono font-bold text-[#1A1A1A]">{forgotEmail}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier(forgotEmail);
                    setErrors({});
                    setStep('login');
                  }}
                  className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs select-none"
                >
                  <ArrowLeft className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold">Back to Login</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 3B: SUPER ADMIN RECOVERY (RECOVERY CODE + NEW PASS)  */}
          {/* ========================================================= */}
          {step === 'superadmin-recovery' && (
            <div className="space-y-5 text-left animate-in fade-in duration-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-[#ED6C02] shadow-2xs mb-3">
                  <Lock className="w-6 h-6 text-[#ED6C02]" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
                  Super Admin Password Recovery
                </h1>
                <p className="text-[13.5px] text-[#8f9494] mt-2 font-light">
                  Enter your Recovery Code to reset your password.
                </p>
              </div>

              <div className="bg-amber-50/60 border border-amber-200 rounded p-2.5 text-xs text-amber-900 flex justify-between items-center">
                <span className="font-medium text-gray-600">Super Admin:</span>
                <span className="font-mono font-bold text-gray-900">{forgotEmail}</span>
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleSuperAdminRecoverySubmit} className="space-y-4" noValidate>
                {/* Recovery Code */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    Recovery Code
                  </label>
                  <div className="relative">
                    <input
                      type={showRecoveryCode ? 'text' : 'password'}
                      value={recoveryCode}
                      onChange={(e) => {
                        setRecoveryCode(e.target.value);
                        clearFieldError('recoveryCode');
                      }}
                      placeholder="Enter Recovery Code (e.g. GEBOL2026)"
                      className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded text-sm font-mono text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                        errors.recoveryCode
                          ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                      }`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowRecoveryCode(!showRecoveryCode)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                      title={showRecoveryCode ? 'Hide code' : 'Show code'}
                    >
                      {showRecoveryCode ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.recoveryCode && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.recoveryCode}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        clearFieldError('newPassword');
                      }}
                      placeholder="Enter new password"
                      className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded text-sm text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                        errors.newPassword
                          ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearFieldError('confirmPassword');
                      }}
                      placeholder="Confirm new password"
                      className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded text-sm text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                        errors.confirmPassword
                          ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 space-y-2.5">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs select-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <span className="text-white font-semibold">Reset Password</span>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setErrors({});
                      setStep('forgot-email');
                    }}
                    className="w-full text-center text-xs text-[#8f9494] hover:text-[#4f4f4e] font-medium py-1 transition-colors cursor-pointer"
                  >
                    Change Email
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 4: SUPER ADMIN RECOVERY SUCCESS                      */}
          {/* ========================================================= */}
          {step === 'superadmin-recovery-success' && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-6 h-6 text-emerald-600" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
                  Password Reset Successful
                </h1>
                <p className="text-[14px] mt-2 font-light text-[#8f9494]">
                  You can now log in with your new password.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setLoginIdentifier(forgotEmail);
                    setPassword('');
                    setErrors({});
                    setSuccessNotice('Password reset successful. Please sign in with your new password.');
                    setStep('login');
                  }}
                  className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs select-none"
                >
                  <span className="text-white font-semibold">Proceed to Login</span>
                </button>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* STEP 5: CREATE NEW PASSWORD (FORCED ON TEMP PASS LOGIN)   */}
          {/* ========================================================= */}
          {step === 'create-new-password' && (
            <div className="space-y-5 text-left animate-in fade-in duration-200">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto text-[#ED6C02] shadow-2xs mb-3">
                  <ShieldCheck className="w-6 h-6 text-[#ED6C02]" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
                  Create New Password
                </h1>
                <p className="text-xs text-[#8f9494] mt-2 font-light">
                  You logged in with a temporary password. Please create a new password to continue.
                </p>
              </div>

              <div className="bg-amber-50/70 border border-amber-200 rounded p-2.5 text-[11.5px] text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-[#F8B800] shrink-0 mt-0.5" />
                <span className="leading-snug">
                  You cannot proceed into the application until you create and confirm your new permanent password.
                </span>
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded">
                  {errors.general}
                </div>
              )}

              <form onSubmit={handleCreateNewPasswordSubmit} className="space-y-4" noValidate>
                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        clearFieldError('newPassword');
                      }}
                      placeholder="Enter new password"
                      className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded text-sm text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                        errors.newPassword
                          ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                      }`}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                      title={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#4f4f4e] uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        clearFieldError('confirmPassword');
                      }}
                      placeholder="Confirm new password"
                      className={`w-full px-3.5 py-2.5 pr-10 bg-white border rounded text-sm text-[#262626] placeholder-[#8f9494] focus:outline-none transition-all ${
                        errors.confirmPassword
                          ? 'border-red-500 bg-red-50/20 focus:border-red-500 focus:ring-1 focus:ring-red-500'
                          : 'border-[#E0E0E0] focus:border-[#f7b611] focus:ring-1 focus:ring-[#f7b611]'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer p-1"
                      title={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Eye className="w-4 h-4 text-gray-500" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="mt-1 text-xs text-red-600 font-medium">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                {/* Set New Password Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-2.5 px-4 rounded text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs select-none disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                    ) : (
                      <span className="text-white font-semibold">Set New Password</span>
                    )}
                  </button>
                </div>
              </form>
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
