import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, LogOut, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import api from '../api';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { cartItemsCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      return;
    }
    const delayDebounce = setTimeout(() => {
      api.get(`/api/products/autocomplete?q=${encodeURIComponent(searchQuery)}`)
        .then((res) => {
          setSuggestions(res.data || []);
        })
        .catch((err) => {
          console.error("Autocomplete error:", err);
        });
    }, 250);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setShowSuggestions(false);
      navigate(`/shop?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-bazaario-dark/95 backdrop-blur-md border-b border-bazaario-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 flex-shrink-0">
          <img src="/Bazaario.png" alt="Bazaario" className="h-9 w-auto object-contain" />
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
          <Link to="/" className="hover:text-bazaario-primary transition-all">Home</Link>
          <Link to="/shop" className="hover:text-bazaario-primary transition-all">Shop</Link>
          <Link to="/deals" className="hover:text-bazaario-primary transition-all">Deals</Link>
          <Link to="/about" className="hover:text-bazaario-primary transition-all">About</Link>
        </nav>

        {/* Search Bar with Autocomplete */}
        <div ref={searchRef} className="relative max-w-md w-full hidden sm:block">
          <form onSubmit={handleSearchSubmit}>
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className="w-full bg-[#13131A] text-white text-sm pl-4 pr-10 py-2 rounded-full border border-bazaario-border focus:outline-none focus:border-bazaario-primary transition-all"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-bazaario-primary">
              <Search size={18} />
            </button>
          </form>

          {/* Autocomplete Suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute left-0 right-0 mt-2 bg-[#13131A] border border-bazaario-border rounded-xl shadow-2xl overflow-hidden z-50">
              <ul className="divide-y divide-bazaario-border/30">
                {suggestions.map((product) => (
                  <li key={product.id}>
                    <button
                      onClick={() => {
                        setSearchQuery(product.name);
                        setShowSuggestions(false);
                        navigate(`/product/${product.id}`);
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-[#1E1E26]/50 flex items-center gap-3 transition-colors text-sm text-gray-200"
                    >
                      {product.imageUrl && (
                        <img 
                          src={product.imageUrl} 
                          alt={product.name} 
                          className="w-8 h-8 rounded object-cover bg-gray-800"
                        />
                      )}
                      <div className="flex-1 truncate">
                        <span className="font-medium text-white block truncate">{product.name}</span>
                        <span className="text-xs text-bazaario-primary">₹{product.price}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6 flex-shrink-0">
          {/* Wishlist */}
          <Link to="/profile" className="text-gray-300 hover:text-bazaario-primary transition-all relative">
            <Heart size={22} />
          </Link>

          {/* Cart */}
          <Link to="/cart" className="text-gray-300 hover:text-bazaario-primary transition-all relative">
            <ShoppingBag size={22} />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-bazaario-primary text-black text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </Link>

          {/* Auth Button or User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-2 bg-[#13131A] border border-bazaario-border text-gray-200 px-4 py-2 rounded-full text-sm font-medium hover:border-bazaario-primary transition-all"
              >
                <User size={16} />
                <span>{user.name}</span>
              </button>

              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-[#13131A] border border-bazaario-border rounded-xl shadow-2xl py-2 z-50 text-sm">
                  {isAdmin && (
                    <Link
                      to="/admin"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:bg-[#1E1E26]/50 hover:text-white"
                    >
                      <LayoutDashboard size={16} />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    to="/profile"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:bg-[#1E1E26]/50 hover:text-white"
                  >
                    <User size={16} />
                    My Profile
                  </Link>
                  <Link
                    to="/orders"
                    onClick={() => setShowDropdown(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-gray-300 hover:bg-[#1E1E26]/50 hover:text-white"
                  >
                    <ShoppingBag size={16} />
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      setShowDropdown(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-[#1E1E26]/50 text-left border-t border-bazaario-border mt-1"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-sm px-6 py-2 rounded-full font-semibold transition-all shadow-[0_0_15px_rgba(20,184,166,0.3)]"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
