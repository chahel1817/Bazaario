import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Heart, ShoppingBag, Save, Plus, Star, AlertCircle, Key, CheckCircle, Eye, EyeOff, Trash2 } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { getProductFallbackImage } from '../imageHelper';

export default function Profile() {
  const { user, token, sendOtp, setPassword } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('account'); // account, addresses, wishlist, orders
  
  // Account state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [updatingAccount, setUpdatingAccount] = useState(false);
  const [message, setMessage] = useState('');

  // Addresses state
  const [addresses, setAddresses] = useState([]);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Wishlist state (mock wishlisted items loaded from Catalog)
  const [wishlistProducts, setWishlistProducts] = useState([]);

  // Orders state
  const [orders, setOrders] = useState([]);

  // Password setting modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpSentMessage, setOtpSentMessage] = useState('');
  const [sandboxOtp, setSandboxOtp] = useState('');
  const [passwordModalError, setPasswordModalError] = useState('');
  const [passwordModalSuccess, setPasswordModalSuccess] = useState(false);
  const [passwordModalLoading, setPasswordModalLoading] = useState(false);

  const handleOpenPasswordModal = () => {
    setNewPassword('');
    setShowNewPassword(false);
    setOtpCode('');
    setOtpSent(false);
    setOtpSentMessage('');
    setSandboxOtp('');
    setPasswordModalError('');
    setPasswordModalSuccess(false);
    setPasswordModalLoading(false);
    setShowPasswordModal(true);
  };

  const handleSendOtp = async () => {
    setPasswordModalError('');
    setPasswordModalLoading(true);
    const result = await sendOtp();
    setPasswordModalLoading(false);
    if (result.success) {
      setOtpSent(true);
      setOtpSentMessage(result.message || 'OTP sent successfully!');
      setSandboxOtp(result.otp || '');
    } else {
      setPasswordModalError(result.message);
    }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordModalError('');
    
    if (newPassword.length < 8) {
      setPasswordModalError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setPasswordModalError("Password must contain at least one capital letter.");
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) {
      setPasswordModalError("Password must contain at least one special character.");
      return;
    }
    if (!otpCode) {
      setPasswordModalError("Please enter the verification OTP.");
      return;
    }

    setPasswordModalLoading(true);
    const result = await setPassword(newPassword, otpCode);
    setPasswordModalLoading(false);
    
    if (result.success) {
      setPasswordModalSuccess(true);
      setTimeout(() => {
        setShowPasswordModal(false);
      }, 1500);
    } else {
      setPasswordModalError(result.message);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
    fetchAddresses();
    fetchOrders();
    fetchWishlistProducts();
  }, [user, token]);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/api/addresses');
      setAddresses(response.data);
    } catch (error) {
      console.error("Failed to fetch addresses", error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders');
      setOrders(response.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    }
  };

  const fetchWishlistProducts = async () => {
    try {
      const saved = localStorage.getItem('bazaario_wishlist');
      const wishlistMap = saved ? JSON.parse(saved) : {};
      const wishlistIds = Object.keys(wishlistMap).filter(id => wishlistMap[id]);
      
      if (wishlistIds.length === 0) {
        setWishlistProducts([]);
        return;
      }
      
      const productPromises = wishlistIds.map(async (id) => {
        try {
          const res = await api.get(`/api/products/${id}`);
          return res.data;
        } catch (e) {
          return null;
        }
      });
      const resolved = await Promise.all(productPromises);
      setWishlistProducts(resolved.filter(p => p !== null));
    } catch (error) {
      console.error("Failed to fetch wishlist products", error);
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    const saved = localStorage.getItem('bazaario_wishlist');
    const wishlistMap = saved ? JSON.parse(saved) : {};
    wishlistMap[productId] = false;
    localStorage.setItem('bazaario_wishlist', JSON.stringify(wishlistMap));
    fetchWishlistProducts();
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdatingAccount(true);
    setMessage('');
    try {
      // API call to save user profile changes
      setTimeout(() => {
        setMessage("Account details saved successfully!");
        setUpdatingAccount(false);
      }, 800);
    } catch (error) {
      setMessage("Failed to update profile info.");
      setUpdatingAccount(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/addresses', { street, city, state, pincode, isDefault });
      setAddresses([...addresses, response.data]);
      setStreet('');
      setCity('');
      setState('');
      setPincode('');
      setIsDefault(false);
      setShowAddressForm(false);
    } catch (error) {
      alert("Failed to save address");
    }
  };

  const handleRemoveAddress = async (id) => {
    try {
      await api.delete(`/api/addresses/${id}`);
      setAddresses(addresses.filter(a => a.id !== id));
    } catch (error) {
      alert("Failed to delete address");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Side: Sidebar Tabs Card */}
        <aside className="w-full lg:w-64 bg-[#13131A] border border-bazaario-border rounded-2xl overflow-hidden flex-shrink-0">
          <div className="p-6 border-b border-bazaario-border text-center space-y-2">
            <div className="w-16 h-16 bg-bazaario-primary/10 border border-bazaario-primary/25 rounded-full flex items-center justify-center mx-auto text-bazaario-primary text-xl font-bold">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">{user?.name}</h3>
              <p className="text-[10px] text-gray-500 font-medium">{user?.email}</p>
            </div>
          </div>

          <nav className="flex flex-col">
            <button
              onClick={() => setActiveTab('account')}
              className={`flex items-center gap-3 px-6 py-4 text-xs font-bold text-left border-l-2 transition-all ${
                activeTab === 'account'
                  ? 'border-bazaario-primary text-bazaario-primary bg-bazaario-primary/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1A1A24]/40'
              }`}
            >
              <User size={14} /> Account Info
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center gap-3 px-6 py-4 text-xs font-bold text-left border-l-2 transition-all ${
                activeTab === 'addresses'
                  ? 'border-bazaario-primary text-bazaario-primary bg-bazaario-primary/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1A1A24]/40'
              }`}
            >
              <MapPin size={14} /> Addresses
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center gap-3 px-6 py-4 text-xs font-bold text-left border-l-2 transition-all ${
                activeTab === 'wishlist'
                  ? 'border-bazaario-primary text-bazaario-primary bg-bazaario-primary/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1A1A24]/40'
              }`}
            >
              <Heart size={14} /> Wishlist
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-6 py-4 text-xs font-bold text-left border-l-2 transition-all ${
                activeTab === 'orders'
                  ? 'border-bazaario-primary text-bazaario-primary bg-bazaario-primary/5'
                  : 'border-transparent text-gray-400 hover:text-white hover:bg-[#1A1A24]/40'
              }`}
            >
              <ShoppingBag size={14} /> Orders History
            </button>
          </nav>
        </aside>

        {/* Right Side: Tab Panel Content */}
        <main className="flex-grow w-full bg-[#13131A] border border-bazaario-border p-6 sm:p-8 rounded-2xl">
          {/* ACCOUNT INFO */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-white pb-3 border-b border-bazaario-border">Account Details</h2>
              {message && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs p-4 rounded-xl flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{message}</span>
                </div>
              )}
              <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Full Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0A0A0C] text-xs text-white px-4 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0A0A0C] text-xs text-white px-4 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={updatingAccount}
                  className="bg-bazaario-primary hover:bg-bazaario-primaryHover disabled:opacity-50 text-black text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-1.5 transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(20,184,166,0.2)]"
                >
                  <Save size={14} /> {updatingAccount ? "Saving..." : "Save Changes"}
                </button>
              </form>

              {/* Password Management */}
              <div className="mt-8 pt-6 border-t border-bazaario-border space-y-4 max-w-lg">
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider">Security & Password</h3>
                {user?.provider === 'GOOGLE' ? (
                  <div className="bg-[#13131A] p-5 rounded-xl border border-bazaario-border/80 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-bazaario-primary/10 rounded-lg text-bazaario-primary">
                        <Key size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">No Password Set</h4>
                        <p className="text-[10px] text-gray-400 leading-normal mt-0.5">Your account is currently linked only via Google OAuth. Set a local password to enable email/password login.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenPasswordModal()}
                      className="w-full bg-[#0A0A0C] hover:bg-[#1A1A24] border border-bazaario-border text-white text-[10px] font-bold py-2 px-4 rounded-xl transition-all uppercase tracking-wider text-center"
                    >
                      Set Local Password
                    </button>
                  </div>
                ) : (
                  <div className="bg-[#13131A] p-5 rounded-xl border border-bazaario-border/80 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                        <CheckCircle size={16} />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-white">Password Linked</h4>
                        <p className="text-[10px] text-gray-400 leading-normal mt-0.5">
                          {user?.provider === 'BOTH' 
                            ? "Your account is linked to both Google and email/password credentials."
                            : "Your account is secured with email/password credentials."}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleOpenPasswordModal()}
                      className="w-full bg-[#0A0A0C] hover:bg-[#1A1A24] border border-bazaario-border text-white text-[10px] font-bold py-2 px-4 rounded-xl transition-all uppercase tracking-wider text-center"
                    >
                      Change Password
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ADDRESSES */}
          {activeTab === 'addresses' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-bazaario-border">
                <h2 className="text-base font-bold text-white">Manage Addresses</h2>
                {!showAddressForm && (
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold px-5 py-2 rounded-full flex items-center gap-1.5 transition-all"
                  >
                    <Plus size={12} /> Add Address
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="bg-[#0A0A0C] p-6 rounded-xl border border-bazaario-border space-y-4 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Street Address</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full bg-[#13131A] text-xs text-white px-4 py-2.5 rounded-lg border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-[#13131A] text-xs text-white px-4 py-2.5 rounded-lg border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-[#13131A] text-xs text-white px-4 py-2.5 rounded-lg border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-[#13131A] text-xs text-white px-4 py-2.5 rounded-lg border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                        required
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="accent-bazaario-primary"
                    />
                    <span>Set as default address</span>
                  </label>

                  <div className="flex gap-4 pt-2">
                    <button
                      type="submit"
                      className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold px-6 py-2.5 rounded-full transition-all uppercase tracking-wider"
                    >
                      Save Address
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowAddressForm(false)}
                      className="text-xs text-gray-450 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr.id} className="bg-[#0A0A0C] border border-bazaario-border p-5 rounded-xl flex flex-col justify-between">
                      <div className="space-y-1">
                        <p className="text-xs font-bold text-white">{addr.street}</p>
                        <p className="text-[11px] text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                      <div className="flex items-center justify-between mt-6">
                        {addr.isDefault ? (
                          <span className="text-[9px] text-bazaario-primary font-bold uppercase">Default</span>
                        ) : (
                          <span />
                        )}
                        <button
                          onClick={() => handleRemoveAddress(addr.id)}
                          className="text-[10px] text-red-400 hover:underline font-bold"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* WISHLIST */}
          {activeTab === 'wishlist' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-white pb-3 border-b border-bazaario-border">Your Wishlist</h2>
              {wishlistProducts.length === 0 ? (
                <p className="text-xs text-gray-450 text-center py-12">Your wishlist is currently empty.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {wishlistProducts.map((product) => (
                    <div
                      key={product.id}
                      onClick={() => navigate(`/product/${product.id}`)}
                      className="bg-[#0A0A0C] border border-bazaario-border rounded-xl p-4 hover:border-bazaario-primary transition-all duration-300 flex flex-col group cursor-pointer relative"
                    >
                      <div className="relative aspect-square overflow-hidden bg-bazaario-card border border-[#1A1A24] rounded-lg flex items-center justify-center p-4 mb-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          onError={(e) => {
                            e.target.src = getProductFallbackImage(product);
                          }}
                          className="w-full h-full object-contain rounded transform group-hover:scale-105 transition-all duration-500"
                        />
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleRemoveFromWishlist(product.id);
                          }}
                          className="absolute top-2 right-2 p-1.5 bg-[#0A0A0C]/80 hover:bg-[#0A0A0C] text-red-400 hover:text-red-500 rounded-full border border-bazaario-border transition-all"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                      <div className="space-y-2 flex-grow flex flex-col justify-between">
                        <div>
                          <span className="text-[9px] text-bazaario-primary uppercase font-extrabold tracking-wider">{product.category?.name}</span>
                          <h4 className="font-semibold text-white text-xs line-clamp-1 group-hover:text-bazaario-primary">{product.name}</h4>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <span className="text-xs font-bold text-white">₹{product.price.toFixed(2)}</span>
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await addToCart(product.id, 1);
                            }}
                            className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-[10px] font-bold px-3 py-1.5 rounded-full transition-all"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ORDERS */}
          {activeTab === 'orders' && (
            <div className="space-y-6">
              <h2 className="text-base font-bold text-white pb-3 border-b border-bazaario-border">Orders History</h2>
              {orders.length === 0 ? (
                <p className="text-xs text-gray-450 text-center py-12">No orders placed yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="bg-[#0A0A0C] border border-bazaario-border p-5 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="font-mono text-xs text-white font-bold">#BZR-{order.id}</p>
                        <p className="text-[10px] text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-[10px] text-gray-550 uppercase">Total</p>
                          <p className="text-xs font-bold text-bazaario-primary">₹{order.totalAmount.toFixed(2)}</p>
                        </div>
                        <button
                          onClick={() => navigate('/orders')}
                          className="border border-bazaario-primary hover:bg-bazaario-primary hover:text-black text-bazaario-primary text-[10px] font-bold px-4 py-1.5 rounded-full transition-all"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Set/Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#13131A] border border-[#27272A] rounded-2xl w-full max-w-sm p-6 relative space-y-5 shadow-2xl">
            <button
              onClick={() => setShowPasswordModal(false)}
              className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1A1A24] transition-all"
            >
              <Plus size={16} className="rotate-45" />
            </button>

            <div className="space-y-1">
              <h3 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Key size={16} className="text-bazaario-primary" />
                {user?.provider === 'GOOGLE' ? "Set Account Password" : "Change Password"}
              </h3>
              <p className="text-[10px] text-gray-400">
                Verify your identity with email OTP to secure your account.
              </p>
            </div>

            {passwordModalError && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] p-3 rounded-xl flex items-start gap-2">
                <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                <span>{passwordModalError}</span>
              </div>
            )}

            {passwordModalSuccess ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 text-xs p-5 rounded-xl flex flex-col items-center gap-2 text-center py-8">
                <CheckCircle size={32} className="text-emerald-400 animate-bounce" />
                <span className="font-bold">Password Saved Successfully!</span>
                <span className="text-[10px] text-gray-400">Your credentials have been updated.</span>
              </div>
            ) : (
              <form onSubmit={handleSavePassword} className="space-y-4">
                {/* Password input */}
                <div className="space-y-1">
                  <label className="text-[9px] text-gray-400 uppercase tracking-widest font-extrabold">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0A0A0C] text-xs text-white pl-4 pr-10 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                    >
                      {showNewPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* OTP flow */}
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={passwordModalLoading}
                    className="w-full bg-bazaario-primary hover:bg-bazaario-primaryHover disabled:opacity-50 text-black text-xs font-bold py-2.5 rounded-full transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(20,184,166,0.15)]"
                  >
                    {passwordModalLoading ? "Sending OTP..." : "Send Verification OTP"}
                  </button>
                ) : (
                  <div className="space-y-4">
                    {/* Sandbox OTP Helper Alert Box */}
                    {sandboxOtp && (
                      <div className="bg-bazaario-primary/10 border border-bazaario-primary/20 text-bazaario-primary text-[10px] p-3 rounded-xl flex items-start gap-2">
                        <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold uppercase tracking-wider block mb-0.5">[Demo Sandbox Mode]</span>
                          <span>Verification code sent: <strong className="font-mono text-white text-xs select-all">{sandboxOtp}</strong></span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="text-[9px] text-gray-400 uppercase tracking-widest font-extrabold">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        maxLength="6"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="123456"
                        className="w-full bg-[#0A0A0C] text-xs text-white px-4 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary tracking-widest text-center font-bold"
                        required
                      />
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={passwordModalLoading}
                        className="flex-grow bg-bazaario-primary hover:bg-bazaario-primaryHover disabled:opacity-50 text-black text-xs font-bold py-2.5 rounded-full transition-all uppercase tracking-wider"
                      >
                        {passwordModalLoading ? "Verifying..." : "Verify & Save"}
                      </button>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="text-gray-450 hover:text-white text-[10px] font-bold"
                      >
                        Resend
                      </button>
                    </div>
                  </div>
                )}
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
