import React, { useState, useEffect } from 'react';
import { Tag, Flame, Clock, Ticket, AlertCircle, ShoppingCart } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { useCart } from '../context/CartContext';
import { getProductFallbackImage } from '../imageHelper';

export default function Deals() {
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const [dealProducts, setDealProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState("");

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 45 });

  useEffect(() => {
    // Tick timer every second
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 24, minutes: 0, seconds: 0 }; // reset
        }
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchDealProducts = async () => {
      setLoading(true);
      try {
        // Fetch products and filter those marked as onDeal
        const response = await api.get('/api/products?page=0&size=150');
        const allProducts = response.data.content || [];
        const dealProds = allProducts.filter(p => p.onDeal).slice(0, 8);
        setDealProducts(dealProds);
      } catch (error) {
        console.error("Failed to load deal products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDealProducts();
  }, []);

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  };

  const handleAddToCartClick = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await addToCart(productId, 1);
    if (!res.success && res.message && !res.loginRequired) {
      alert(res.message);
    }
  };

  const coupons = [
    { code: "DEAL20", discount: "20% OFF", desc: "Applicable on all Electronics", expiry: "Expires in 12h" },
    { code: "FASHION50", discount: "50% OFF", desc: "Buy 1 Get 1 on selected apparel", expiry: "Expires tonight" },
    { code: "GLOW30", discount: "30% OFF", desc: "Save on premium Beauty serums", expiry: "Expires in 2 days" }
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
      {/* Deals Header & Countdown Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-red-950/40 via-bazaario-card to-bazaario-card border border-red-500/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(239,68,68,0.08),transparent_50%)]"></div>
        
        <div className="space-y-4 max-w-xl text-center md:text-left z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold uppercase tracking-wider">
            <Flame size={12} className="animate-pulse" /> Limited Time Flash Sale
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">
            Unbeatable Deals on <span className="text-red-400">Exclusive Catalogs</span>
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Get up to 60% discount on top-performing items across Electronics, Sports, and Fashion. Quantities are strictly limited. Grab yours before they run out!
          </p>
        </div>

        {/* Countdown Timer Widget */}
        <div className="bg-[#13131A] border border-bazaario-border p-6 rounded-2xl flex flex-col items-center gap-3 w-full md:w-auto min-w-[280px] z-10 shadow-2xl">
          <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
            <Clock size={14} className="text-red-400" /> Offer Ends In:
          </div>
          <div className="flex items-center gap-4 text-center">
            <div>
              <div className="text-3xl font-extrabold text-white bg-bazaario-card border border-bazaario-border px-3 py-2 rounded-xl min-w-[50px]">
                {String(timeLeft.hours).padStart(2, '0')}
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold mt-1 block">Hrs</span>
            </div>
            <span className="text-2xl font-bold text-gray-600">:</span>
            <div>
              <div className="text-3xl font-extrabold text-white bg-bazaario-card border border-bazaario-border px-3 py-2 rounded-xl min-w-[50px]">
                {String(timeLeft.minutes).padStart(2, '0')}
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold mt-1 block">Min</span>
            </div>
            <span className="text-2xl font-bold text-gray-600">:</span>
            <div>
              <div className="text-3xl font-extrabold text-white bg-bazaario-card border border-bazaario-border px-3 py-2 rounded-xl min-w-[50px]">
                {String(timeLeft.seconds).padStart(2, '0')}
              </div>
              <span className="text-[10px] text-gray-500 uppercase tracking-wider font-extrabold mt-1 block">Sec</span>
            </div>
          </div>
        </div>
      </div>

      {/* Coupons Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
          <Ticket className="text-bazaario-primary" size={22} /> Exclusive Promo Coupons
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {coupons.map((coupon, idx) => (
            <div
              key={idx}
              className="bg-bazaario-card border border-bazaario-border rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between gap-4 group hover:border-bazaario-primary transition-all duration-300"
            >
              {/* Ticket Notch decorations */}
              <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-bazaario-dark border border-bazaario-border"></div>
              <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-bazaario-dark border border-bazaario-border"></div>

              <div className="space-y-2 pl-4">
                <span className="text-2xl font-extrabold text-bazaario-primary">{coupon.discount}</span>
                <p className="text-sm font-semibold text-white">{coupon.desc}</p>
                <span className="text-[10px] text-gray-500 font-extrabold block uppercase tracking-wider">{coupon.expiry}</span>
              </div>

              <div className="flex items-center gap-2 pt-2 pl-4 border-t border-dashed border-bazaario-border">
                <button
                  onClick={() => handleCopyCode(coupon.code)}
                  className="w-full bg-[#13131A] hover:bg-[#1E1E26] text-white border border-bazaario-border hover:border-bazaario-primary text-xs font-bold py-2 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                  {copiedCode === coupon.code ? "Copied!" : coupon.code}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deal Catalog Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between border-b border-bazaario-border pb-4">
          <h2 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <Flame className="text-red-400" size={22} /> Today's Hot Sales
          </h2>
          <Link to="/shop" className="text-xs text-bazaario-primary hover:underline font-bold transition-all">
            See All Products
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-bazaario-card border border-bazaario-border h-80 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {dealProducts.map((p) => {
              const discountRate = p.discountPercent || 20;
              const originalPrice = p.price / (1 - (discountRate / 100));
              const stockPercentage = Math.max(15, 95 - (p.id % 60)); // simulated stock percentage

              return (
                <div
                  key={p.id}
                  onClick={() => navigate(`/product/${p.id}`)}
                  className="bg-bazaario-card border border-bazaario-border rounded-2xl p-4 hover:border-red-500/40 hover:shadow-[0_0_20px_rgba(239,68,68,0.06)] transition-all duration-300 flex flex-col group cursor-pointer relative"
                >
                  {/* Discount Badge */}
                  <span className="absolute top-6 left-6 bg-red-500 text-black text-[10px] font-black px-2 py-1 rounded-full z-10 uppercase tracking-widest shadow-md">
                    -{discountRate}%
                  </span>

                  {/* Image Frame */}
                  <div className="relative aspect-square overflow-hidden bg-[#0A0A0C] border border-[#1A1A24] rounded-xl flex items-center justify-center p-4 shadow-[inset_0_0_20px_rgba(239,68,68,0.02)] mb-4">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      onError={(e) => {
                        e.target.src = getProductFallbackImage(p);
                      }}
                      className="w-full h-full object-contain rounded-lg transform group-hover:scale-105 transition-all duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="space-y-3 flex-grow flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] text-gray-500 uppercase font-extrabold tracking-wider">
                        {p.category?.name}
                      </span>
                      <h4 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-red-400 transition-colors">
                        {p.name}
                      </h4>
                    </div>

                    {/* Stock status bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-gray-500 font-extrabold">
                        <span>Available</span>
                        <span className="text-red-400 font-black">{stockPercentage}% claimed</span>
                      </div>
                      <div className="w-full bg-[#13131A] h-1.5 rounded-full overflow-hidden border border-[#23232D]">
                        <div
                          className="bg-red-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${stockPercentage}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Price Matrix */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-white">₹{p.price.toFixed(2)}</span>
                        <span className="text-xs text-gray-500 line-through">₹{originalPrice.toFixed(2)}</span>
                      </div>
                      <button
                        onClick={(e) => handleAddToCartClick(e, p.id)}
                        className="p-2 bg-red-500 hover:bg-red-600 text-black rounded-full transition-all hover:scale-110 shadow-lg"
                      >
                        <ShoppingCart size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Deal Warning banner */}
      <div className="bg-[#1C1113] border border-red-500/20 p-5 rounded-2xl flex items-start gap-4">
        <AlertCircle className="text-red-400 flex-shrink-0 mt-0.5" size={20} />
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white">Notice regarding Discount Offers</h4>
          <p className="text-xs text-gray-400 leading-relaxed">
            All prices listed on the Deals page are final and cannot be combined with any other site-wide vouchers. Quantities are capped per customer to ensure fair distribution.
          </p>
        </div>
      </div>
    </div>
  );
}
