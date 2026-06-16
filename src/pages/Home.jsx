import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Laptop, Shirt, Gem, Home as HomeIcon, Award, Gamepad2, ArrowRight, Play, Heart, Star, ShoppingCart, ShoppingBag } from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { getProductFallbackImage } from '../imageHelper';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [dbCategories, setDbCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 42, seconds: 17 });
  const { addToCart } = useCart();
  const navigate = useNavigate();

  // Load featured products and categories
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const response = await api.get('/api/products?page=0&size=4');
        setProducts(response.data.content || []);
      } catch (error) {
        console.error('Failed to load products', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        setDbCategories(response.data || []);
      } catch (error) {
        console.error('Failed to load categories', error);
      }
    };

    fetchFeaturedProducts();
    fetchCategories();
  }, []);

  // Flash sale countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (num) => String(num).padStart(2, '0');

  // Static tags for featured products to match UI
  const getProductTag = (index) => {
    if (index === 0) return { text: 'Best Seller', class: 'bg-[#10B981]/15 text-[#10B981]' };
    if (index === 1) return { text: 'New', class: 'bg-[#3B82F6]/15 text-[#3B82F6]' };
    if (index === 2) return { text: 'Trending', class: 'bg-[#F59E0B]/15 text-[#F59E0B]' };
    return null;
  };

  const getProductStars = (index) => {
    if (index === 0) return { rating: 4.8, reviews: '1,240' };
    if (index === 1) return { rating: 4.6, reviews: '872' };
    if (index === 2) return { rating: 4.7, reviews: '534' };
    return { rating: 4.9, reviews: '2,100' };
  };

  const handleAddToCartClick = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await addToCart(productId, 1);
    if (!res.success && res.message && !res.loginRequired) {
      alert(res.message);
    }
  };

  const getCategoryIcon = (name) => {
    const n = name.toLowerCase();
    if (n.includes('electronic')) return <Laptop size={22} />;
    if (n.includes('fashion') || n.includes('apparel') || n.includes('cloth')) return <Shirt size={22} />;
    if (n.includes('beauty') || n.includes('care') || n.includes('cosmetic')) return <Gem size={22} />;
    if (n.includes('home') || n.includes('living') || n.includes('furnit')) return <HomeIcon size={22} />;
    if (n.includes('sport') || n.includes('fit')) return <Award size={22} />;
    if (n.includes('game') || n.includes('toy')) return <Gamepad2 size={22} />;
    return <ShoppingBag size={22} />;
  };

  return (
    <div className="bg-[#0A0A0C] min-h-screen text-white pb-16">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Side */}
        <div className="space-y-8">
          <span className="text-bazaario-primary font-bold text-xs uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-bazaario-primary rounded-full animate-ping"></span>
            New Season Arrivals
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight font-poppins">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-bazaario-primary to-cyan-400">
              Bazaario
            </span> <br />
            — Shop Everything
          </h1>
          <p className="text-gray-405 text-base sm:text-lg max-w-lg leading-relaxed">
            Curated collections across tech, fashion, beauty & more — all in one place. Deals that move as fast as you do.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/shop"
              className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black px-8 py-3.5 rounded-full font-bold transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              Shop Now <ArrowRight size={14} />
            </Link>
            <Link
              to="/shop?deals=true"
              className="border border-bazaario-border hover:border-bazaario-primary hover:text-bazaario-primary px-8 py-3.5 rounded-full font-bold transition-all flex items-center gap-2 text-xs uppercase tracking-wider"
            >
              View Deals
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 border-t border-bazaario-border pt-8 max-w-md">
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">50K+</h3>
              <p className="text-xs text-gray-500 mt-1">Products</p>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">2M+</h3>
              <p className="text-xs text-gray-500 mt-1">Happy Customers</p>
            </div>
            <div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">99%</h3>
              <p className="text-xs text-gray-500 mt-1">Satisfaction Rate</p>
            </div>
          </div>
        </div>

        {/* Right Side - Premium Product Collage */}
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-bazaario-primary/20 to-cyan-500/20 rounded-3xl filter blur-3xl opacity-30 group-hover:opacity-50 transition-all duration-700"></div>
          <div className="relative border border-bazaario-border bg-[#13131A]/40 p-4 rounded-3xl overflow-hidden aspect-[4/3] flex items-center justify-center">
            <img
              src="/hero_collage.png"
              alt="Bazaario Hero Collage"
              className="w-full h-full object-cover rounded-2xl transform group-hover:scale-102 transition-all duration-700"
            />
            {/* Play Button Overlay */}
            <button className="absolute bottom-6 right-6 p-4 bg-bazaario-primary/10 backdrop-blur-md border border-bazaario-primary/30 rounded-full text-bazaario-primary hover:bg-bazaario-primary hover:text-black transition-all">
              <Play size={20} fill="currentColor" className="ml-0.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Explore Shop by Category */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-bazaario-primary text-xs uppercase font-extrabold tracking-widest">Explore</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2 font-poppins">Shop by Category</h2>
            <p className="text-gray-400 text-sm mt-1">Find everything you need across our curated collections</p>
          </div>
          <Link to="/shop" className="text-bazaario-primary hover:underline text-sm font-semibold flex items-center gap-1">
            All Categories <ArrowRight size={14} />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dbCategories.map((cat, index) => (
            <Link
              key={index}
              to={`/shop?category=${cat.id}`}
              className="bg-[#13131A] border border-bazaario-border p-6 rounded-2xl hover:border-bazaario-primary/45 hover:bg-[#1E1E26] transition-all group flex flex-col items-start gap-4"
            >
              <div className="p-3 bg-[#0A0A0C] rounded-xl text-bazaario-primary group-hover:bg-bazaario-primary group-hover:text-black transition-all">
                {getCategoryIcon(cat.name)}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-bazaario-primary transition-all">{cat.name}</h4>
                <p className="text-xs text-gray-500 mt-1">Explore Collection</p>
              </div>
              <span className="text-xs text-bazaario-primary/60 font-semibold mt-auto flex items-center gap-0.5 group-hover:translate-x-1 transition-all">
                Explore <ArrowRight size={12} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Flash Sale Banner */}
      <section className="max-w-7xl mx-auto px-6 py-8">
        <div className="relative bg-gradient-to-r from-bazaario-primary/95 to-cyan-500/90 text-black rounded-3xl p-8 md:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_10px_30px_rgba(20,184,166,0.15)]">
          <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 w-64 h-64 bg-white/10 rounded-full filter blur-3xl"></div>
          
          <div className="space-y-3 z-10 text-center md:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-black/70">Limited Time Offer</span>
            <h2 className="text-3xl sm:text-4xl font-black text-black">Up to 60% Off Flash Sale Today</h2>
            <p className="text-black/80 font-bold flex items-center justify-center md:justify-start gap-1.5 text-sm sm:text-base">
              Ends in <span className="bg-black text-white px-2 py-0.5 rounded font-mono">{formatTime(timeLeft.hours)}h</span> : 
              <span className="bg-black text-white px-2 py-0.5 rounded font-mono">{formatTime(timeLeft.minutes)}m</span> : 
              <span className="bg-black text-white px-2 py-0.5 rounded font-mono">{formatTime(timeLeft.seconds)}s</span> — Don't miss out
            </p>
          </div>

          <Link
            to="/shop?deals=true"
            className="bg-black hover:bg-gray-900 text-white font-bold px-8 py-3.5 rounded-full text-xs uppercase tracking-wider transition-all shadow-xl z-10 flex-shrink-0"
          >
            Shop the Sale
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-bazaario-primary text-xs uppercase font-extrabold tracking-widest">Picks</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2 font-poppins">Featured Products</h2>
            <p className="text-gray-400 text-sm mt-1">Handpicked items our customers love most</p>
          </div>
          <Link to="/shop" className="text-bazaario-primary hover:underline text-sm font-semibold flex items-center gap-1">
            View All Products <ArrowRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-[#13131A] border border-bazaario-border h-80 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product, index) => {
              const tag = getProductTag(index);
              const stars = getProductStars(index);
              return (
                <div
                  key={product.id}
                  onClick={() => navigate(`/product/${product.id}`)}
                  className="bg-[#13131A] border border-bazaario-border rounded-2xl overflow-hidden hover:border-bazaario-primary/30 transition-all duration-300 flex flex-col group cursor-pointer relative"
                >
                  {/* Image wrapper */}
                  <div className="relative aspect-square overflow-hidden bg-[#0A0A0C] flex items-center justify-center p-4">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      onError={(e) => {
                        e.target.src = getProductFallbackImage(product);
                      }}
                      className="w-full h-full object-contain rounded-xl transform group-hover:scale-105 transition-all duration-500"
                    />

                    {/* Tag badge */}
                    {tag && (
                      <span className={`absolute top-4 left-4 text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md ${tag.class}`}>
                        {tag.text}
                      </span>
                    )}

                    {/* Wishlist button */}
                    <button className="absolute top-4 right-4 p-2 bg-[#0A0A0C]/60 hover:bg-[#0A0A0C] text-gray-400 hover:text-red-500 rounded-full transition-all border border-bazaario-border">
                      <Heart size={14} />
                    </button>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex flex-col flex-grow space-y-3">
                    <h3 className="font-bold text-white text-sm line-clamp-1 group-hover:text-bazaario-primary transition-all">
                      {product.name}
                    </h3>
                    
                    {/* Stars / Reviews */}
                    <div className="flex items-center gap-1.5 text-[10px]">
                      <div className="flex items-center text-yellow-500 gap-0.5">
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                        <Star size={10} fill="currentColor" />
                      </div>
                      <span className="text-gray-400 font-medium">{stars.rating}</span>
                      <span className="text-gray-500">({stars.reviews})</span>
                    </div>

                    {/* Price and Add to Cart */}
                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-baseline gap-2">
                        <span className="text-sm font-extrabold text-bazaario-primary">₹{product.price.toFixed(2)}</span>
                        {index !== 2 && (
                          <span className="text-[10px] text-gray-500 line-through">
                            ₹{(product.price * 1.25).toFixed(2)}
                          </span>
                        )}
                      </div>
                      
                      <button
                        onClick={(e) => handleAddToCartClick(e, product.id)}
                        className="p-2.5 bg-bazaario-primary/10 hover:bg-bazaario-primary text-bazaario-primary hover:text-black rounded-xl transition-all"
                      >
                        <ShoppingCart size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
