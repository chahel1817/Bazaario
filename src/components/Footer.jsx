import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, RefreshCw, PhoneCall, Send, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        setCategories(response.data.slice(0, 4));
      } catch (err) {
        console.error("Failed to load footer categories", err);
      }
    };
    fetchCategories();
  }, []);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => {
        setSubscribed(false);
      }, 3000);
    }
  };

  return (
    <footer id="about" className="bg-bazaario-dark border-t border-bazaario-border mt-auto">
      {/* Features Bar */}
      <div className="border-b border-bazaario-border py-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-bazaario-primary/10 rounded-2xl text-bazaario-primary shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Free Shipping</h4>
              <p className="text-xs text-gray-450 mt-1">On all orders over $50</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-bazaario-primary/10 rounded-2xl text-bazaario-primary shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Secure Payment</h4>
              <p className="text-xs text-gray-450 mt-1">100% protected transactions</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-bazaario-primary/10 rounded-2xl text-bazaario-primary shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              <RefreshCw size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">Easy Returns</h4>
              <p className="text-xs text-gray-450 mt-1">30-day hassle-free returns</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 bg-bazaario-primary/10 rounded-2xl text-bazaario-primary shadow-[0_0_15px_rgba(20,184,166,0.1)]">
              <PhoneCall size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">24/7 Support</h4>
              <p className="text-xs text-gray-450 mt-1">Round-the-clock assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Newsletter */}
      <div className="py-16 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <img src="/Bazaario.png" alt="Bazaario" className="h-9 w-auto object-contain brightness-95" />
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              Your premium destination for tech, fashion, beauty, and more. High-quality products curated just for you. Shop everything, effortlessly.
            </p>
            <div className="flex gap-4 pt-2">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#13131A] hover:bg-bazaario-primary border border-bazaario-border hover:text-black text-gray-400 flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
                </svg>
              </a>
              <a href="https://twitter.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#13131A] hover:bg-bazaario-primary border border-bazaario-border hover:text-black text-gray-400 flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#13131A] hover:bg-bazaario-primary border border-bazaario-border hover:text-black text-gray-400 flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
                </svg>
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl bg-[#13131A] hover:bg-bazaario-primary border border-bazaario-border hover:text-black text-gray-400 flex items-center justify-center transition-all duration-300">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482C19.138 20.193 22 16.44 22 12.017 22 6.484 17.522 2 12 2z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Column 1: Shop */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Shop</h4>
            <ul className="space-y-2 text-xs text-gray-450">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <li key={cat.id}>
                    <Link to={`/shop?category=${cat.id}`} className="hover:text-bazaario-primary transition-all">
                      {cat.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li><Link to="/shop" className="hover:text-bazaario-primary transition-all">Clothes</Link></li>
                  <li><Link to="/shop" className="hover:text-bazaario-primary transition-all">Electronics</Link></li>
                  <li><Link to="/shop" className="hover:text-bazaario-primary transition-all">Shoes</Link></li>
                  <li><Link to="/shop" className="hover:text-bazaario-primary transition-all">Miscellaneous</Link></li>
                </>
              )}
            </ul>
          </div>

          {/* Column 2: Customer Care */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Customer Care</h4>
            <ul className="space-y-2 text-xs text-gray-400">
              <li><Link to="/about" className="hover:text-bazaario-primary transition-all">Help Center</Link></li>
              <li><Link to="/orders" className="hover:text-bazaario-primary transition-all">Track Order</Link></li>
              <li><Link to="/about" className="hover:text-bazaario-primary transition-all">Returns & Refunds</Link></li>
              <li><Link to="/about" className="hover:text-bazaario-primary transition-all">Security Center</Link></li>
            </ul>
          </div>

          {/* Column 3: Newsletter */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-white text-xs uppercase tracking-wider">Newsletter</h4>
            <p className="text-[11px] text-gray-400 leading-relaxed">
              Subscribe to get special offers, free giveaways, and once-in-a-lifetime deals.
            </p>
            <form onSubmit={handleSubscribe} className="pt-2">
              <div className="relative flex items-center">
                <input
                  type="email"
                  placeholder="Your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0A0A0C] text-xs text-white pl-4 pr-10 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                  required
                />
                <button
                  type="submit"
                  className="absolute right-1 p-2 bg-bazaario-primary hover:bg-bazaario-primaryHover text-black rounded-lg transition-all"
                >
                  {subscribed ? <Check size={14} /> : <Send size={14} />}
                </button>
              </div>
              {subscribed && (
                <p className="text-[10px] text-bazaario-primary mt-1.5 animate-pulse">
                  Subscribed successfully! Thank you.
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Bottom Trust & Copyright */}
        <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-bazaario-border/60 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-[11px] text-gray-550 text-center sm:text-left">
            &copy; {new Date().getFullYear()} <span className="text-white hover:text-bazaario-primary transition-all cursor-pointer font-semibold font-poppins">Bazaario</span>. All rights reserved.
          </p>
          
          {/* Mock Payment Options Badges */}
          <div className="flex items-center gap-3">
            <div className="px-2.5 py-1 bg-[#13131A] border border-bazaario-border rounded text-[9px] text-gray-400 font-mono tracking-widest select-none">VISA</div>
            <div className="px-2.5 py-1 bg-[#13131A] border border-bazaario-border rounded text-[9px] text-gray-400 font-mono tracking-widest select-none">MC</div>
            <div className="px-2.5 py-1 bg-[#13131A] border border-bazaario-border rounded text-[9px] text-gray-400 font-mono tracking-widest select-none">GPAY</div>
            <div className="px-2.5 py-1 bg-[#13131A] border border-bazaario-border rounded text-[9px] text-gray-400 font-mono tracking-widest select-none">APAY</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
