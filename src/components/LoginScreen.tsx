import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { GebolSelect } from './GebolSelect';
import { UserRole } from '../types/user';

interface LoginScreenProps {
  onLogin: (email: string, role: UserRole) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [role, setRole] = useState<UserRole>('Superadmin');
  const [email, setEmail] = useState('Lucas.Platzer@gebol.at');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleRoleChange = (newRoleValue: string) => {
    const newRole = newRoleValue as UserRole;
    setRole(newRole);
    if (newRole === 'Superadmin') {
      setEmail('Lucas.Platzer@gebol.at');
    } else {
      setEmail('bhoomi.barot@gebol.at');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let hasError = false;
    setEmailError('');
    setPasswordError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setEmailError('Please enter your email address.');
      hasError = true;
    } else if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      setEmailError('Please enter a valid email address.');
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError('Please enter your password.');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    onLogin(trimmedEmail, role);
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
        {/* Top Left: Logo (not in container) */}
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

      {/* 🔹 Center Container: All Login Elements in 1 container, center aligned, NO round corners */}
      <div className="flex-1 flex items-center justify-center my-6 relative z-10">
        <div className="w-full max-w-md bg-white border border-[#E0E0E0] rounded-none shadow-md p-8 sm:p-10">
          {/* Header in container */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold tracking-tight page-header-title text-[#4f4f4e]">
              Sign In
            </h1>
            <p className="text-[15px] mt-1.5 font-light text-[#8f9494]">
              Sign in to your GEBOL account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selection Dropdown */}
            <div>
              <GebolSelect
                id="login-role-select"
                label="Role"
                value={role}
                onChange={handleRoleChange}
                options={[
                  { value: 'Superadmin', label: 'Superadmin' },
                  { value: 'Normal User', label: 'Normal User' },
                ]}
              />
            </div>

            {/* Email Field */}
            <div>
              <label
                className="block text-[15px] font-light mb-1.5 field-header text-[#8f9494]"
                htmlFor="email-input"
              >
                Email Address
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                    emailError ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="email-input"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="name@gebol.at"
                  className={`w-full text-[15px] rounded-lg pl-10 pr-4 py-2.5 outline-none transition-all bg-white text-[#4f4f4e] placeholder-[#8f9494] ${
                    emailError
                      ? 'border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border border-[#D1D5DB] focus:border-[#F8B800] focus:ring-2 focus:ring-[#F8B800]/20'
                  }`}
                />
              </div>
              {emailError && (
                <p className="mt-1.5 text-xs text-red-600 font-normal">
                  {emailError}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                className="block text-[15px] font-light mb-1.5 field-header text-[#8f9494]"
                htmlFor="password-input"
              >
                Password
              </label>
              <div className="relative">
                <div
                  className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none ${
                    passwordError ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password-input"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (passwordError) setPasswordError('');
                  }}
                  placeholder="••••••••••••"
                  className={`w-full text-[15px] rounded-lg pl-10 pr-10 py-2.5 outline-none transition-all bg-white text-[#4f4f4e] placeholder-[#8f9494] ${
                    passwordError
                      ? 'border border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
                      : 'border border-[#D1D5DB] focus:border-[#F8B800] focus:ring-2 focus:ring-[#F8B800]/20'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center cursor-pointer transition-colors text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1.5 text-xs text-red-600 font-normal">
                  {passwordError}
                </p>
              )}
            </div>

            {/* Primary Button: #f7b611 with white font */}
            <button
              type="submit"
              className="w-full bg-[#f7b611] hover:bg-[#e2a508] active:bg-[#c99400] text-white font-semibold py-3 px-4 rounded-lg text-[15px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs mt-6"
            >
              <span className="text-white">Sign In</span>
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      </div>

      {/* 🔹 Bottom Copyright */}
      <div className="text-center text-xs text-[#4f4f4e] font-light relative z-10">
        &copy; {new Date().getFullYear()} GEBOL GmbH &bull; All Rights Reserved
      </div>
    </div>
  );
};
