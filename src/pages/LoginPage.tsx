import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShieldCheck, Globe, Zap, Eye, EyeOff, MailCheck, Chrome, Apple } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '../contexts/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { user, loading: authLoading, login, register, verifyOtp, resendOtp, socialLogin, pendingVerification, clearPendingVerification } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('LoginPage - User changed:', user);
    if (user) {
      console.log('LoginPage - User role:', user.role);
      if (user.role === 'admin') {
        console.log('LoginPage - Navigating to admin dashboard');
        navigate('/admin/dashboard', { replace: true });
        return;
      }

      if (user.role === 'vendor') {
        console.log('LoginPage - Navigating to vendor dashboard');
        navigate('/vendor/dashboard', { replace: true });
        return;
      }

      console.log('LoginPage - Navigating to home');
      navigate('/', { replace: true });
    }
  }, [navigate, user]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    console.log('LoginPage - Submitting form:', { isLogin, email: formData.email });

    try {
      if (pendingVerification) {
        console.log('LoginPage - Verifying OTP');
        await verifyOtp(pendingVerification.email, otpCode);
        toast.success('Account verified successfully');
        return;
      }

      if (isLogin) {
        console.log('LoginPage - Attempting login');
        await login(formData.email, formData.password);
        toast.success('Welcome back!');
      } else {
        console.log('LoginPage - Attempting registration');
        await register(formData.name, formData.email, formData.password);
        toast.success('Verification code generated');
      }
    } catch (error: any) {
      console.error('LoginPage - Error:', error);
      if (isLogin && String(error.message || '').toLowerCase().includes('not verified')) {
        try {
          await resendOtp(formData.email);
          toast.info('Your account needs verification. A new OTP has been generated.');
        } catch (resendError: any) {
          toast.error(resendError.message || 'Could not resend verification code');
        }
      } else {
      toast.error(error.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocial = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      await socialLogin(provider);
      toast.success(`${provider} sign-in completed`);
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || `${provider} sign-in failed`);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [event.target.name]: event.target.value }));
  };

  const verificationMode = Boolean(pendingVerification);

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-white/8 to-white/5 backdrop-blur-xl"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative hidden overflow-hidden border-r border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_40%),linear-gradient(160deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] p-10 lg:flex lg:flex-col">
            <div className="mb-12">
              <span className="text-3xl font-black tracking-tighter text-white">
                VELORA<span className="text-emerald-500">.</span>
              </span>
            </div>
            <div className="max-w-lg space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-emerald-400">
                <MailCheck className="h-4 w-4" /> Secure Commerce Access
              </span>
              <h1 className="text-5xl font-black leading-[0.95] text-white">
                Build trust with
                <span className="block italic text-emerald-500">fast verification</span>
              </h1>
              <p className="text-sm leading-relaxed text-white/60">
                Login, register, verify OTP, and access your cart, wishlist, orders, and dashboards from a single commerce identity flow.
              </p>
            </div>
            <div className="mt-auto grid grid-cols-3 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <ShieldCheck className="mb-3 h-5 w-5 text-emerald-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Verified Users</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Globe className="mb-3 h-5 w-5 text-emerald-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Cross-device Ready</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <Zap className="mb-3 h-5 w-5 text-emerald-500" />
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">Fast Checkout Flow</p>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 lg:p-12">
            <div className="mb-8 text-center">
              <span className="text-2xl font-bold tracking-tighter text-white lg:hidden">
                VELORA<span className="text-emerald-500">.</span>
              </span>
              <h1 className="mt-6 text-2xl font-bold text-white">
                {verificationMode ? 'Verify Your Account' : isLogin ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="mt-2 text-sm text-white/40">
                {verificationMode
                  ? `Enter the OTP sent to ${pendingVerification?.email}`
                  : isLogin
                    ? 'Access your premium tech dashboard'
                    : 'Join the Velora commerce experience'}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {verificationMode ? (
                <>
                  <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-5">
                    <p className="text-xs leading-relaxed text-white/70">
                      A verification code is required before first login. In local demo mode the current OTP is:
                    </p>
                    <p className="mt-3 text-2xl font-black tracking-[0.35em] text-emerald-400">
                      {pendingVerification?.devOtp || '------'}
                    </p>
                  </div>
                  <div>
                    <input
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      id="otp-code"
                      name="otp-code"
                      autoComplete="one-time-code"
                      placeholder="Enter OTP"
                      value={otpCode}
                      onChange={(event) => setOtpCode(event.target.value)}
                      className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-center text-lg font-bold tracking-[0.4em] text-white placeholder-white/30 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  {!isLogin && (
                    <div>
                      <input
                        type="text"
                        id="full-name"
                        name="name"
                        autoComplete="name"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none"
                        required
                      />
                    </div>
                  )}
                  <div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      autoComplete="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      autoComplete={isLogin ? 'current-password' : 'new-password'}
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full rounded-full border border-white/10 bg-white/10 px-4 py-3 pr-12 text-white placeholder-white/40 focus:border-emerald-500 focus:outline-none"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading || authLoading}
                className="w-full rounded-full bg-emerald-500 px-4 py-3 text-sm font-bold text-black transition-all hover:bg-emerald-400 disabled:opacity-50"
              >
                {loading || authLoading
                  ? 'Please wait...'
                  : verificationMode
                    ? 'Verify OTP'
                    : isLogin
                      ? 'Sign In'
                      : 'Create Account'}
              </button>
            </form>

            {verificationMode ? (
              <div className="mt-6 space-y-3 text-center">
                <button
                  type="button"
                  onClick={() => void resendOtp(pendingVerification.email)}
                  className="text-sm text-white/50 transition-colors hover:text-emerald-500"
                >
                  Resend verification code
                </button>
                <button
                  type="button"
                  onClick={clearPendingVerification}
                  className="block w-full text-sm text-white/30 transition-colors hover:text-white"
                >
                  Back to register
                </button>
              </div>
            ) : (
              <>
                <div className="my-6 flex items-center gap-4">
                  <div className="h-px flex-1 bg-white/10" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/30">or continue with</span>
                  <div className="h-px flex-1 bg-white/10" />
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => void handleSocial('google')}
                    disabled={loading || authLoading}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-all hover:border-emerald-500 hover:bg-white/10"
                  >
                    <Chrome className="h-4 w-4 text-emerald-400" /> Google
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleSocial('apple')}
                    disabled={loading || authLoading}
                    className="flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-3 text-sm font-bold text-white transition-all hover:border-emerald-500 hover:bg-white/10"
                  >
                    <Apple className="h-4 w-4 text-white" /> Apple
                  </button>
                </div>

                <div className="mt-6 text-center">
                  <button
                    type="button"
                    onClick={() => setIsLogin((prev) => !prev)}
                    className="text-sm text-white/40 transition-colors hover:text-emerald-500"
                  >
                    {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
