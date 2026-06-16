import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Search, Heart, Star, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { getProductFallbackImage } from '../imageHelper';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  // Local state for wishlisted items to simulate wishlist toggling
  const [wishlist, setWishlist] = useState(() => {
    const saved = localStorage.getItem('bazaario_wishlist');
    return saved ? JSON.parse(saved) : {};
  });

  // Filter local states
  const [maxPrice, setMaxPrice] = useState(1000);
  const [selectedRating, setSelectedRating] = useState(0);

  const categoryIdParam = searchParams.get('category') || '';
  const searchParam = searchParams.get('search') || '';
  const pageParam = parseInt(searchParams.get('page') || '0', 10);
  const sortByParam = searchParams.get('sortBy') || 'id';
  const directionParam = searchParams.get('direction') || 'asc';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get('/api/categories');
        setCategories(response.data);
      } catch (error) {
        console.error("Failed to load categories", error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let url = `/api/products?page=${pageParam}&size=8&sortBy=${sortByParam}&direction=${directionParam}`;
        if (categoryIdParam && categoryIdParam !== 'all') {
          url += `&categoryId=${categoryIdParam}`;
        }
        if (searchParam) {
          url += `&search=${encodeURIComponent(searchParam)}`;
        }
        const response = await api.get(url);
        
        // Filter locally by price and simulated rating if set
        let fetchedList = response.data.content || [];
        if (maxPrice < 1000) {
          fetchedList = fetchedList.filter(p => p.price <= maxPrice);
        }
        
        setProducts(fetchedList);
        setTotalPages(response.data.totalPages || 0);
        setTotalElements(response.data.totalElements || 0);
      } catch (error) {
        console.error("Failed to load products", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [categoryIdParam, searchParam, pageParam, sortByParam, directionParam, maxPrice]);

  const updateFilters = (newParams) => {
    const params = new URLSearchParams(searchParams);
    Object.keys(newParams).forEach(key => {
      if (newParams[key] === null || newParams[key] === '') {
        params.delete(key);
      } else {
        params.set(key, newParams[key]);
      }
    });
    if (!newParams.hasOwnProperty('page')) {
      params.set('page', '0');
    }
    setSearchParams(params);
  };

  const handleClearAll = () => {
    setSearchParams({});
    setMaxPrice(1000);
    setSelectedRating(0);
  };

  const handleAddToCartClick = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    const res = await addToCart(productId, 1);
    if (!res.success && res.message && !res.loginRequired) {
      alert(res.message);
    }
  };

  const toggleWishlist = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlist(prev => {
      const updated = { ...prev, [id]: !prev[id] };
      localStorage.setItem('bazaario_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8 space-y-6">
      {/* Top Breadcrumb & Sorting Header Row */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-bazaario-border pb-6">
        {/* Left: Breadcrumbs */}
        <nav className="text-sm font-medium flex items-center gap-2">
          <Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link>
          <span className="text-gray-600">/</span>
          <span className="text-bazaario-primary font-bold">Shop</span>
        </nav>

        {/* Right: Results Count + Sort dropdown */}
        <div className="flex items-center justify-between md:justify-end gap-6 flex-wrap">
          <span className="text-xs text-gray-400">
            Showing <span className="text-white font-bold">{products.length}</span> of <span className="text-white font-bold">{totalElements}</span> results
          </span>

          <select
            value={`${sortByParam}-${directionParam}`}
            onChange={(e) => {
              const [sort, dir] = e.target.value.split('-');
              updateFilters({ sortBy: sort, direction: dir });
            }}
            className="bg-bazaario-card border border-bazaario-border text-xs text-white px-4 py-2 rounded-full focus:outline-none focus:border-bazaario-primary transition-all cursor-pointer font-bold"
          >
            <option value="id-asc">Default Sorting</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Sidebar (280px) */}
        <aside className="w-full lg:w-[280px] bg-bazaario-card border border-bazaario-border p-6 rounded-2xl space-y-8 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-white text-base flex items-center gap-2">
              <SlidersHorizontal size={16} className="text-bazaario-primary" /> Filters
            </h3>
            <button
              onClick={handleClearAll}
              className="text-xs text-bazaario-primary hover:underline font-bold transition-all"
            >
              Clear All
            </button>
          </div>

          {/* Search bar */}
          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Find products..."
                value={searchParam}
                onChange={(e) => updateFilters({ search: e.target.value })}
                className="w-full bg-[#0A0A0C] text-xs text-white pl-4 pr-10 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary transition-all"
              />
              <Search size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          {/* Category List Checkbox/Pills */}
          <div className="space-y-3">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Categories</label>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={categoryIdParam === '' || categoryIdParam === 'all'}
                  onChange={() => updateFilters({ category: 'all' })}
                  className="accent-bazaario-primary w-4 h-4 rounded cursor-pointer"
                />
                <span className={`text-xs transition-all ${
                  categoryIdParam === '' || categoryIdParam === 'all'
                    ? 'text-white font-bold'
                    : 'text-gray-400 group-hover:text-white'
                }`}>
                  All Products
                </span>
              </label>

              {categories.map((cat) => (
                <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={categoryIdParam === String(cat.id)}
                    onChange={() => updateFilters({ category: cat.id })}
                    className="accent-bazaario-primary w-4 h-4 rounded cursor-pointer"
                  />
                  <span className={`text-xs transition-all ${
                    categoryIdParam === String(cat.id)
                      ? 'text-white font-bold'
                      : 'text-gray-400 group-hover:text-white'
                  }`}>
                    {cat.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Max Price</label>
              <span className="text-xs text-bazaario-primary font-bold">₹{maxPrice}</span>
            </div>
            <input
              type="range"
              min="10"
              max="1000"
              step="10"
              value={maxPrice}
              onChange={(e) => setMaxPrice(parseInt(e.target.value))}
              className="w-full accent-bazaario-primary h-1.5 bg-[#0A0A0C] rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-bold">
              <span>₹10</span>
              <span>₹1000</span>
            </div>
          </div>

          {/* Rating filter */}
          <div className="space-y-3">
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star === selectedRating ? 0 : star)}
                  className={`text-yellow-400 hover:scale-110 transition-all ${
                    star <= selectedRating ? 'opacity-100' : 'opacity-20'
                  }`}
                >
                  <Star size={18} fill={star <= selectedRating ? "currentColor" : "none"} />
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Right Product Grid */}
        <main className="flex-grow w-full">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                <div key={n} className="bg-bazaario-card border border-bazaario-border h-80 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-bazaario-card border border-bazaario-border rounded-2xl space-y-4">
              <p className="text-gray-400 text-sm">No items found matching your filters.</p>
              <button
                onClick={handleClearAll}
                className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold px-6 py-2.5 rounded-full transition-all"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map((product) => {
                const isDeal = product.onDeal;
                const discountRate = product.discountPercent;
                const originalPrice = isDeal ? (product.price / (1 - (discountRate / 100))) : (product.price * 1.25);
                const isWishlisted = !!wishlist[product.id];
                return (
                  <div
                    key={product.id}
                    onClick={() => navigate(`/product/${product.id}`)}
                    className={`bg-bazaario-card border ${isDeal ? 'border-red-500/30' : 'border-bazaario-border'} rounded-2xl p-4 hover:border-bazaario-primary hover:shadow-[0_0_20px_rgba(20,184,166,0.12)] transition-all duration-300 flex flex-col group cursor-pointer relative`}
                  >
                    {isDeal && (
                      <span className="absolute top-6 left-6 bg-red-500 text-black text-[9px] font-black px-2 py-0.5 rounded-full z-10 uppercase tracking-widest shadow-md">
                        -{discountRate}% Deal
                      </span>
                    )}

                    {/* Inset Image Frame */}
                    <div className="relative aspect-square overflow-hidden bg-[#0A0A0C] border border-[#1A1A24] rounded-xl flex items-center justify-center p-4 shadow-[inset_0_0_20px_rgba(20,184,166,0.04)] mb-4">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        onError={(e) => {
                          e.target.src = getProductFallbackImage(product);
                        }}
                        className="w-full h-full object-contain rounded-lg transform group-hover:scale-105 transition-all duration-500"
                      />
                      <button
                        onClick={(e) => toggleWishlist(e, product.id)}
                        className="absolute top-3 right-3 p-2 bg-bazaario-card/80 hover:bg-bazaario-card text-gray-350 hover:text-red-500 rounded-full border border-bazaario-border transition-all"
                      >
                        <Heart size={14} fill={isWishlisted ? "#EF4444" : "none"} className={isWishlisted ? "text-red-500" : ""} />
                      </button>
                    </div>

                    {/* Metadata & Info */}
                    <div className="space-y-2 flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] text-bazaario-primary uppercase font-extrabold tracking-wider">
                          {product.category?.name}
                        </span>
                        <h4 className="font-semibold text-white text-sm line-clamp-1 group-hover:text-bazaario-primary transition-all">
                          {product.name}
                        </h4>
                      </div>

                      {/* Stars */}
                      <div className="flex text-yellow-450 gap-0.5 pt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} size={12} fill="currentColor" className="text-yellow-400" />
                        ))}
                      </div>

                      {/* Price Matrix */}
                      <div className="flex items-center gap-2 pt-1.5">
                        <span className="text-sm font-bold text-white">₹{product.price.toFixed(2)}</span>
                        <span className="text-[10px] text-gray-500 line-through">₹{originalPrice.toFixed(2)}</span>
                        {isDeal && (
                          <span className="text-[9px] bg-red-500/10 border border-red-500/20 text-red-400 px-1.5 py-0.5 rounded font-black uppercase tracking-wider">
                            Deal
                          </span>
                        )}
                      </div>

                      {/* Pill button */}
                      <button
                        onClick={(e) => handleAddToCartClick(e, product.id)}
                        className="w-full bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold py-2.5 rounded-full mt-3 transition-all flex items-center justify-center gap-1.5"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 mt-10 pt-6 border-t border-bazaario-border">
              <button
                onClick={() => updateFilters({ page: pageParam - 1 })}
                disabled={pageParam === 0}
                className="p-2 bg-bazaario-card border border-bazaario-border text-gray-400 hover:text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs text-gray-400">
                Page <span className="text-white font-semibold">{pageParam + 1}</span> of{' '}
                <span className="text-white font-semibold">{totalPages}</span>
              </span>
              <button
                onClick={() => updateFilters({ page: pageParam + 1 })}
                disabled={pageParam === totalPages - 1}
                className="p-2 bg-bazaario-card border border-bazaario-border text-gray-400 hover:text-white rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
