import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, UserPlus, AlertCircle, Eye, EyeOff, ShoppingBag, ShieldCheck, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  // Custom modals state
  const [validationErrors, setValidationErrors] = useState([]);
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [showCustomGoogleInput, setShowCustomGoogleInput] = useState(false);

  // Rotating Tagline Slider
  const [currentSlide, setCurrentSlide] = useState(0);
  const [fade, setFade] = useState(true);

  const slides = [
    {
      titlePart1: "Shop Everything,",
      highlight: "Effortlessly.",
      description: "Experience a faster, more secure, and beautifully designed digital storefront tailored for the modern consumer."
    },
    {
      titlePart1: "Secure Checkout,",
      highlight: "Instant Delivery.",
      description: "Rest easy with state-of-the-art encryption protecting your payments and live end-to-end tracking."
    },
    {
      titlePart1: "Curated Styles,",
      highlight: "Premium Quality.",
      description: "Explore handpicked products from verified global brands with hassle-free returns and support."
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: '', color: 'bg-transparent' };
    let score = 0;
    if (pass.length >= 6) score++;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    
    if (score === 1) return { score: 33, text: 'Weak', color: 'bg-red-500' };
    if (score === 2) return { score: 66, text: 'Medium', color: 'bg-yellow-500' };
    if (score === 3) return { score: 100, text: 'Strong', color: 'bg-bazaario-primary' };
    return { score: 15, text: 'Too Short', color: 'bg-red-600' };
  };

  const strength = getPasswordStrength(password);

  const validateInput = (emailVal, passVal, confirmVal) => {
    const errs = [];
    if (!emailVal.includes('@')) {
      errs.push("Email address must contain '@' symbol.");
    }
    if (passVal.length < 8) {
      errs.push("Password must be at least 8 characters long.");
    }
    if (!/[A-Z]/.test(passVal)) {
      errs.push("Password must contain at least one capital letter.");
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passVal)) {
      errs.push("Password must contain at least one special character.");
    }
    if (passVal !== confirmVal) {
      errs.push("Passwords do not match.");
    }
    if (!agreeTerms) {
      errs.push("You must agree to the Terms & Privacy Policy.");
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const errors = validateInput(email, password, confirmPassword);
    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    setLoading(true);
    const result = await register(name, email, password);
    setLoading(false);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  const handleGoogleLoginSelect = async (nameVal, googleEmail) => {
    setShowGoogleModal(false);
    setLoading(true);
    setError('');
    
    const mockSub = "google-sub-" + googleEmail.split('@')[0];
    const mockIdToken = `mock_google_token_${googleEmail}_${nameVal.replace(/\s+/g, '-')}_${mockSub}`;
    
    const result = await loginWithGoogle(mockIdToken, googleEmail, nameVal, mockSub);
    setLoading(false);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0A0A0C] text-white">
      {/* Left Panel (~45% width on desktop) - Premium Branding Panel */}
      <div className="w-full md:w-[45%] bg-gradient-to-br from-[#0B2522] via-[#041614] to-[#020F0E] p-6 sm:p-12 flex flex-col justify-between relative overflow-hidden min-h-[360px] md:min-h-screen border-b md:border-b-0 md:border-r border-bazaario-border/40 flex-shrink-0">
        {/* Glow Blobs */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-bazaario-primary/10 filter blur-[90px] animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-cyan-500/5 filter blur-[110px] animate-pulse delay-500 pointer-events-none"></div>

        {/* Header Branding Logo */}
        <RouterLink to="/" className="flex items-center gap-2 relative z-10 w-fit">
          <img src="/Bazaario.png" alt="Bazaario" className="h-10 w-auto object-contain" />
        </RouterLink>

        {/* Headline and Tagline */}
        <div className="space-y-4 my-auto relative z-10 py-10 md:py-0 pl-0 md:pl-10 lg:pl-16 max-w-lg">
          <div className="p-3 bg-bazaario-primary/10 rounded-2xl w-fit border border-bazaario-primary/20 text-bazaario-primary shadow-[0_0_20px_rgba(20,184,166,0.1)]">
            {currentSlide === 0 && <ShoppingBag size={24} className="animate-pulse" />}
            {currentSlide === 1 && <ShieldCheck size={24} className="animate-pulse" />}
            {currentSlide === 2 && <Award size={24} className="animate-pulse" />}
          </div>
          <div className={`transition-all duration-300 transform ${fade ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white leading-tight font-poppins tracking-tight min-h-[96px] sm:min-h-[112px]">
              {slides[currentSlide].titlePart1}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-bazaario-primary to-cyan-400">
                {slides[currentSlide].highlight}
              </span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm max-w-sm leading-relaxed mt-2 min-h-[48px]">
              {slides[currentSlide].description}
            </p>
          </div>
          {/* Slide Indicators */}
          <div className="flex gap-2 pt-4">
            {slides.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-350 ${idx === currentSlide ? 'w-6 bg-bazaario-primary' : 'w-2 bg-bazaario-border/60'}`}
              />
            ))}
          </div>
        </div>

        {/* Footer Credit */}
        <div className="relative z-10 text-[10px] text-gray-550 font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Bazaario Inc.
        </div>
      </div>

      {/* Right Panel (~55% width on desktop) - Pure Black Form */}
      <div className="w-full md:w-[55%] bg-[#0A0A0C] min-h-[500px] md:min-h-screen flex items-center justify-center p-6 sm:p-10 md:p-16 relative">
        <div className="absolute -top-12 -right-12 w-72 h-72 rounded-full bg-bazaario-primary/5 filter blur-[90px] pointer-events-none"></div>

        <div className="w-full max-w-[400px] space-y-6 z-10">
          {/* Form Brand Header */}
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-[#13131A] border border-bazaario-border flex items-center justify-center text-bazaario-primary mx-auto mb-4 shadow-[0_0_15px_rgba(20,184,166,0.05)] animate-pulse">
              <UserPlus size={20} />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Create Account</h2>
            <p className="text-xs text-gray-400">Join Bazaario today and start shopping</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-4 rounded-xl flex items-start gap-2.5">
              <AlertCircle size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-[#0A0A0C] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all"
                  required
                />
                <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-550" />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Email Address</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0A0C] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all"
                  required
                />
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-550" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0A0A0C] text-xs text-white pl-10 pr-11 py-3 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all"
                  required
                />
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-550" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-550 hover:text-white p-1 transition-all"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>

              {/* Password strength indicator */}
              {password && (
                <div className="pt-2 space-y-1.5">
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-wider font-extrabold text-gray-455">
                    <span>Password Strength</span>
                    <span className={strength.text === 'Strong' ? 'text-bazaario-primary' : strength.text === 'Medium' ? 'text-yellow-500' : 'text-red-500'}>
                      {strength.text}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-[#13131A] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${strength.color} transition-all duration-500`}
                      style={{ width: `${strength.score}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0A0A0C] text-xs text-white pl-10 pr-11 py-3 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all"
                  required
                />
                <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-550" />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-550 hover:text-white p-1 transition-all"
                >
                  {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="flex items-start gap-2.5 text-[11px] text-gray-400 cursor-pointer select-none py-1">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-bazaario-border bg-[#0A0A0C] text-bazaario-primary accent-bazaario-primary focus:ring-0 focus:ring-offset-0"
              />
              <span>I agree to the <a href="#" className="text-bazaario-primary hover:underline font-semibold">Terms of Service</a> & <a href="#" className="text-bazaario-primary hover:underline font-semibold">Privacy Policy</a></span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-bazaario-primary hover:bg-bazaario-primaryHover disabled:opacity-50 text-black font-extrabold py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all duration-300 hover:scale-[1.02] shadow-[0_0_15px_rgba(20,184,166,0.2)]"
            >
              <UserPlus size={14} /> {loading ? "Creating..." : "Sign Up"}
            </button>
          </form>

          {/* Social Sign-In */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <span className="h-px bg-bazaario-border/50 flex-grow" />
              <span className="text-[10px] text-gray-550 uppercase tracking-wider font-extrabold flex-shrink-0">or continue with</span>
              <span className="h-px bg-bazaario-border/50 flex-grow" />
            </div>

            {/* Google Signup Validation Button */}
            <button
              type="button"
              onClick={() => setShowGoogleModal(true)}
              className="w-full border border-bazaario-border bg-[#0A0A0C] hover:bg-[#13131A] text-white text-xs font-bold py-3.5 rounded-full flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02]"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <span>Sign Up with Google</span>
            </button>
          </div>

          <p className="text-center text-xs text-gray-550">
            Already have an account?{' '}
            <RouterLink to="/login" className="text-bazaario-primary hover:underline font-bold transition-all">
              Sign In
            </RouterLink>
          </p>
        </div>
      </div>

      {/* Input Validation Errors Modal */}
      {validationErrors.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#13131A] border border-red-500/30 p-8 rounded-2xl w-full max-w-sm space-y-6 shadow-2xl relative">
            <div className="flex items-center gap-3 text-red-400">
              <AlertCircle size={24} className="flex-shrink-0" />
              <h3 className="font-extrabold text-base tracking-tight text-white">Validation Error</h3>
            </div>
            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-300">
              {validationErrors.map((err, idx) => (
                <li key={idx}>{err}</li>
              ))}
            </ul>
            <button
              onClick={() => setValidationErrors([])}
              className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-extrabold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Simulated Google OAuth Modal */}
      {showGoogleModal && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#13131A] border border-bazaario-border p-8 rounded-2xl w-full max-w-sm space-y-6 shadow-2xl relative">
            <div className="text-center space-y-2">
              <svg className="w-8 h-8 mx-auto" viewBox="0 0 24 24" fill="currentColor">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
              </svg>
              <h3 className="font-extrabold text-base tracking-tight text-white pt-2">Sign up with Google</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Choose an account to continue</p>
            </div>

            <div className="space-y-2 pt-2">
              <button
                onClick={() => handleGoogleLoginSelect('John Doe', 'john.doe@gmail.com')}
                className="w-full bg-[#0A0A0C] border border-bazaario-border p-3.5 rounded-xl hover:border-bazaario-primary text-left text-xs transition-all flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-bazaario-primary text-black flex items-center justify-center font-bold text-sm">JD</div>
                <div>
                  <div className="font-bold text-white">John Doe</div>
                  <div className="text-[10px] text-gray-405">john.doe@gmail.com</div>
                </div>
              </button>

              <button
                onClick={() => handleGoogleLoginSelect('Jane Smith', 'jane.smith@gmail.com')}
                className="w-full bg-[#0A0A0C] border border-bazaario-border p-3.5 rounded-xl hover:border-bazaario-primary text-left text-xs transition-all flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm">JS</div>
                <div>
                  <div className="font-bold text-white">Jane Smith</div>
                  <div className="text-[10px] text-gray-405">jane.smith@gmail.com</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowGoogleModal(false);
                  setShowCustomGoogleInput(true);
                }}
                className="w-full border border-dashed border-bazaario-border hover:border-bazaario-primary text-center p-3 rounded-xl text-[10px] text-gray-400 hover:text-white transition-all font-bold uppercase tracking-wider"
              >
                Use another account
              </button>
            </div>

            <button
              onClick={() => setShowGoogleModal(false)}
              className="w-full bg-[#1C1C24] text-gray-400 font-bold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Custom Google Account Modal */}
      {showCustomGoogleInput && (
        <div className="fixed inset-0 z-[60] bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#13131A] border border-bazaario-border p-8 rounded-2xl w-full max-w-sm space-y-6 shadow-2xl relative">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-bazaario-border flex items-center justify-center text-bazaario-primary mx-auto mb-2">
                <Mail size={22} />
              </div>
              <h3 className="font-extrabold text-base tracking-tight text-white">Use Another Account</h3>
              <p className="text-[10px] text-gray-400 uppercase tracking-wider">Enter a custom test Google email address</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] text-gray-400 uppercase tracking-widest font-extrabold font-poppins">Google Email Address</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="e.g. testuser@gmail.com"
                    value={customGoogleEmail}
                    onChange={(e) => setCustomGoogleEmail(e.target.value)}
                    className="w-full bg-[#0A0A0C] text-xs text-white pl-10 pr-4 py-3 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary focus:shadow-[0_0_15px_rgba(20,184,166,0.15)] transition-all"
                  />
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-550" />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomGoogleInput(false);
                    setCustomGoogleEmail('');
                  }}
                  className="w-1/2 bg-[#1C1C24] hover:bg-[#252530] text-gray-400 hover:text-white font-extrabold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (!customGoogleEmail.includes('@')) {
                      setValidationErrors(["Please enter a valid Google email address containing '@'."]);
                      return;
                    }
                    const baseName = customGoogleEmail.split('@')[0];
                    const formatName = baseName.charAt(0).toUpperCase() + baseName.slice(1);
                    handleGoogleLoginSelect(formatName, customGoogleEmail);
                    setShowCustomGoogleInput(false);
                    setCustomGoogleEmail('');
                  }}
                  className="w-1/2 bg-bazaario-primary hover:bg-bazaario-primaryHover text-black font-extrabold py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
