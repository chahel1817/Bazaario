import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, ShieldAlert, Heart, Plus, Minus, Send, ShoppingBag } from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductFallbackImage } from '../imageHelper';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { token } = useAuth();

  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');

  // Review states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  // Selected image index state (for thumbnails)
  const [selectedImgIndex, setSelectedImgIndex] = useState(0);

  const fetchProductAndReviews = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get(`/api/products/${id}`);
      setProduct(prodRes.data);

      const revRes = await api.get(`/api/products/${id}/reviews`);
      setReviews(revRes.data);
    } catch (error) {
      console.error("Failed to fetch product details", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductAndReviews();
  }, [id]);

  const handleAddToCart = async () => {
    const res = await addToCart(product.id, quantity);
    if (!res.success && res.message && !res.loginRequired) {
      alert(res.message);
    }
  };

  const handleBuyNow = async () => {
    const res = await addToCart(product.id, quantity);
    if (res.success) {
      navigate('/cart');
    } else if (!res.success && res.message && !res.loginRequired) {
      alert(res.message);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      navigate('/login');
      return;
    }
    if (!comment.trim()) return;

    setSubmittingReview(true);
    try {
      await api.post(`/api/products/${id}/reviews`, { rating, comment });
      setComment('');
      setRating(5);
      
      const revRes = await api.get(`/api/products/${id}/reviews`);
      setReviews(revRes.data);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 animate-pulse space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="bg-bazaario-card aspect-square rounded-3xl"></div>
          <div className="space-y-6">
            <div className="h-10 bg-bazaario-card rounded-xl w-3/4"></div>
            <div className="h-6 bg-bazaario-card rounded-xl w-1/4"></div>
            <div className="h-32 bg-bazaario-card rounded-xl w-full"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center space-y-4">
        <ShieldAlert size={48} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold">Product Not Found</h2>
        <button onClick={() => navigate('/shop')} className="text-bazaario-primary hover:underline font-semibold">
          Back to Shop
        </button>
      </div>
    );
  }

  // Simulated alternate product images to display in thumbnail strip
  const productImages = [
    product.imageUrl,
    product.imageUrl,
    product.imageUrl
  ];

  return (
    <div className="relative overflow-hidden min-h-screen pb-16">
      {/* Background glow spots */}
      <div className="absolute top-[10%] left-[-150px] w-[500px] h-[500px] rounded-full glow-spot-teal opacity-20 pointer-events-none"></div>
      <div className="absolute top-[60%] right-[-150px] w-[600px] h-[600px] rounded-full glow-spot-cyan opacity-15 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16 relative z-10">
        {/* Product main area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column: Image Frames */}
          <div className="space-y-4">
            <div className="glass-panel p-6 rounded-2xl flex items-center justify-center aspect-square relative shadow-2xl transition-all duration-300 hover:shadow-[0_0_35px_rgba(20,184,166,0.15)] group">
              <img
                src={productImages[selectedImgIndex]}
                alt={product.name}
                decoding="async"
                onError={(e) => {
                  e.target.src = getProductFallbackImage(product);
                }}
                className="w-full h-full object-contain rounded-xl transform group-hover:scale-[1.03] transition-all duration-500"
              />
              <button className="absolute top-4 right-4 p-3 bg-black/40 hover:bg-black/60 text-gray-400 hover:text-red-500 rounded-full border border-white/5 transition-all backdrop-blur-sm">
                <Heart size={18} />
              </button>
            </div>

            {/* Thumbnail Strip */}
            <div className="flex gap-3 justify-center">
              {productImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImgIndex(idx)}
                  className={`w-16 h-16 glass-panel p-1.5 rounded-lg border transition-all flex items-center justify-center overflow-hidden ${
                    selectedImgIndex === idx ? 'border-bazaario-primary scale-105 shadow-[0_0_15px_rgba(20,184,166,0.25)]' : 'border-white/5 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt="" 
                    loading="lazy"
                    decoding="async"
                    onError={(e) => {
                      e.target.src = getProductFallbackImage(product);
                    }} 
                    className="w-full h-full object-contain rounded-md" 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Right Column: Specifications and Buying options */}
          <div className="space-y-6">
            <span className="text-bazaario-primary text-[10px] uppercase font-extrabold tracking-widest bg-bazaario-primary/10 px-3 py-1.5 rounded-full border border-bazaario-primary/20">
              {product.category?.name || "New Season Arrivals"}
            </span>

            <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight font-poppins">{product.name}</h1>

            {/* Stars & Reviews Count */}
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400 gap-0.5">
                {[1, 2, 3, 4, 5].map((s) => {
                  const avgRating = reviews.length > 0 ? Math.round(reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length) : 5;
                  return <Star key={s} size={14} fill={s <= avgRating ? "currentColor" : "none"} className="text-bazaario-primary" />;
                })}
              </div>
              <span className="text-xs text-gray-450">
                ({reviews.length} reviews)
              </span>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-4 pt-1">
              <span className="text-3xl font-black text-bazaario-primary">₹{product.price.toFixed(2)}</span>
              <span className="text-sm text-gray-500 line-through">₹{(product.price * 1.35).toFixed(2)}</span>
            </div>

            <p className="text-gray-400 text-sm leading-relaxed">{product.description}</p>

            {/* Stock Tag badge */}
            <div>
              {product.stockQty > 0 ? (
                <span className="bg-emerald-500/10 text-emerald-450 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full border border-emerald-500/20">
                  In Stock ({product.stockQty} Units)
                </span>
              ) : (
                <span className="bg-red-500/10 text-red-500 text-[10px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full border border-red-500/20">
                  Out of Stock
                </span>
              )}
            </div>

            {/* Actions */}
            {product.stockQty > 0 && (
              <div className="space-y-4 pt-4 border-t border-bazaario-border/60">
                {/* Stepper + Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 items-center">
                  {/* Quantity select */}
                  <div className="flex items-center bg-black/40 border border-white/5 rounded-full px-4 py-2 flex-shrink-0 w-32 justify-between backdrop-blur-sm">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="text-bazaario-primary hover:text-white p-1 transition-all"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="text-sm font-bold text-white">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stockQty, quantity + 1))}
                      className="text-bazaario-primary hover:text-white p-1 transition-all"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  {/* Add to Cart (Teal Pill, full width) */}
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-bazaario-primary hover:bg-bazaario-primaryHover text-black font-extrabold py-3.5 rounded-full transition-all text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(20,184,166,0.25)] hover:shadow-[0_0_30px_rgba(20,184,166,0.45)] hover:scale-[1.01] flex items-center justify-center gap-2"
                  >
                    Add to Cart
                  </button>
                </div>

                {/* Buy Now (Teal Outline) */}
                <button
                  onClick={handleBuyNow}
                  className="w-full glass-panel hover:bg-bazaario-primary border border-bazaario-primary text-bazaario-primary hover:text-black font-extrabold py-3.5 rounded-full transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:scale-[1.01]"
                >
                  Buy Now
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tabs section below (Description | Specs | Reviews) */}
        <div className="space-y-6 pt-6 border-t border-bazaario-border/60">
          <div className="flex gap-8 border-b border-bazaario-border/60 pb-px text-sm font-bold">
            <button
              onClick={() => setActiveTab('description')}
              className={`pb-4 transition-all relative ${
                activeTab === 'description' ? 'text-bazaario-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              Description
              {activeTab === 'description' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-bazaario-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-4 transition-all relative ${
                activeTab === 'specs' ? 'text-bazaario-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              Specs
              {activeTab === 'specs' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-bazaario-primary" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('reviews')}
              className={`pb-4 relative transition-all ${
                activeTab === 'reviews' ? 'text-bazaario-primary' : 'text-gray-400 hover:text-white'
              }`}
            >
              Reviews ({reviews.length})
              {activeTab === 'reviews' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-bazaario-primary" />
              )}
            </button>
          </div>

          {/* Tab content area */}
          <div className="text-sm leading-relaxed text-gray-400">
            {activeTab === 'description' && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-xs text-bazaario-primary font-bold uppercase tracking-widest">Product Overview</h4>
                  <p className="text-sm text-gray-300 leading-relaxed">{product.description}</p>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    Every aspect of this product has been tested to meet strict quality and safety certifications. It combines state-of-the-art ergonomics with top-grade raw materials to deliver maximum utility and long-lasting durability.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="glass-panel p-4 rounded-xl space-y-1">
                    <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Premium Build</h5>
                    <p className="text-gray-500 text-[10px]">Constructed from durable, premium materials for high load capacity.</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl space-y-1">
                    <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Ergonomic Design</h5>
                    <p className="text-gray-500 text-[10px]">Specifically configured for optimal comfort and intuitive daily handling.</p>
                  </div>
                  <div className="glass-panel p-4 rounded-xl space-y-1">
                    <h5 className="text-[10px] font-bold text-white uppercase tracking-wider">Certified Safe</h5>
                    <p className="text-gray-500 text-[10px]">Undergoes multiple performance validation checks before dispatch.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="glass-panel p-6 rounded-2xl space-y-4">
                  <h4 className="text-xs text-bazaario-primary font-bold uppercase tracking-widest">Technical Specifications</h4>
                  <table className="w-full text-xs">
                    <tbody>
                      <tr className="border-b border-bazaario-border/60 pb-2">
                        <td className="py-2 text-gray-400 font-semibold">Category</td>
                        <td className="py-2 text-white font-medium">{product.category?.name}</td>
                      </tr>
                      <tr className="border-b border-bazaario-border/60">
                        <td className="py-2 text-gray-400 font-semibold">Model ID</td>
                        <td className="py-2 text-white font-medium font-mono">BZR-{product.id}</td>
                      </tr>
                      <tr className="border-b border-bazaario-border/60">
                        <td className="py-2 text-gray-400 font-semibold">Stock Availability</td>
                        <td className="py-2 text-emerald-500 font-bold">In Stock ({product.stockQty} Units)</td>
                      </tr>
                      {(() => {
                        const category = product.category?.name || "";
                        if (category === "Electronics") {
                          return (
                            <>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Connectivity</td><td className="py-2 text-white">Bluetooth 5.3 & Wi-Fi Direct</td></tr>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Battery Life</td><td className="py-2 text-white">Up to 48 Hours playback</td></tr>
                              <tr><td className="py-2 text-gray-400 font-semibold">Charging</td><td className="py-2 text-white">USB Type-C HyperFast Charging</td></tr>
                            </>
                          );
                        }
                        if (category === "Fashion") {
                          return (
                            <>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Material</td><td className="py-2 text-white">100% Organic Combed Cotton</td></tr>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Fit Type</td><td className="py-2 text-white">Regular Fit / Pre-shrunk wear</td></tr>
                              <tr><td className="py-2 text-gray-400 font-semibold">Care Instructions</td><td className="py-2 text-white">Machine wash cold, tumble dry low</td></tr>
                            </>
                          );
                        }
                        if (category === "Beauty") {
                          return (
                            <>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Skin Type</td><td className="py-2 text-white">All skin types, dermatologically tested</td></tr>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Net Weight / Vol</td><td className="py-2 text-white">150 mL / 5.1 fl. oz</td></tr>
                              <tr><td className="py-2 text-gray-400 font-semibold">Certificates</td><td className="py-2 text-white">100% Vegan, Cruelty-Free, Paraben-Free</td></tr>
                            </>
                          );
                        }
                        if (category === "Home & Living") {
                          return (
                            <>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Material</td><td className="py-2 text-white">Sustainably sourced premium wood/textile</td></tr>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Assembly</td><td className="py-2 text-white">Easy tool-less setup instruction manual</td></tr>
                              <tr><td className="py-2 text-gray-400 font-semibold">Weight Limit</td><td className="py-2 text-white">Supports up to 120 kg safely</td></tr>
                            </>
                          );
                        }
                        if (category === "Sports") {
                          return (
                            <>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Sport Type</td><td className="py-2 text-white">Fitness, Outdoor & Multi-sport tracking ready</td></tr>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Water Resistance</td><td className="py-2 text-white">Sweatproof & IPX4 Splashproof resistance</td></tr>
                              <tr><td className="py-2 text-gray-400 font-semibold">Grip material</td><td className="py-2 text-white">Ergonomic anti-slip textured silicone</td></tr>
                            </>
                          );
                        }
                        if (category === "Gaming") {
                          return (
                            <>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Platform</td><td className="py-2 text-white">PC, PS5, Xbox Series X/S, Switch</td></tr>
                              <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Lighting</td><td className="py-2 text-white">Dynamic 16.8M Color Aura RGB synchronization</td></tr>
                              <tr><td className="py-2 text-gray-400 font-semibold">Response Rate</td><td className="py-2 text-white">Ultra-low 1ms Latency Response Switch</td></tr>
                            </>
                          );
                        }
                        return (
                          <>
                            <tr className="border-b border-bazaario-border/60"><td className="py-2 text-gray-400 font-semibold">Origin</td><td className="py-2 text-white">Imported</td></tr>
                            <tr><td className="py-2 text-gray-400 font-semibold">Warranty</td><td className="py-2 text-white">1-Year Bazaario Domestic Warranty</td></tr>
                          </>
                        );
                      })()}
                    </tbody>
                  </table>
                </div>

                {/* Shopping Promises */}
                <div className="glass-panel p-6 rounded-2xl space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h4 className="text-xs text-bazaario-primary font-bold uppercase tracking-widest">Bazaario Promises</h4>
                    <ul className="text-xs space-y-3">
                      <li className="flex items-start gap-2.5">
                        <span className="text-emerald-500 font-bold">⚡</span>
                        <div>
                          <p className="text-white font-bold">Free Metro Express Delivery</p>
                          <p className="text-gray-500 text-[10px]">Get it delivered within 24-48 hours in major metropolitan cities.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-bazaario-primary font-bold">🛡️</span>
                        <div>
                          <p className="text-white font-bold">100% Secured Payments</p>
                          <p className="text-gray-500 text-[10px]">Secure transactions with industry-standard Razorpay Gateway or Cash on Delivery.</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2.5">
                        <span className="text-blue-500 font-bold">🔄</span>
                        <div>
                          <p className="text-white font-bold">7-Day Easy Returns</p>
                          <p className="text-gray-500 text-[10px]">Not satisfied? Return or exchange hassle-free within 7 days of delivery.</p>
                        </div>
                      </li>
                    </ul>
                  </div>
                  <div className="border-t border-white/5 pt-3 text-[10px] text-gray-500">
                    * Terms and conditions apply. Warranty cards included inside the packaging box.
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Write review */}
                <div className="lg:col-span-1 space-y-6">
                  <h3 className="text-base font-bold text-white">Share Your Feedback</h3>
                  {token ? (
                    <form onSubmit={handleReviewSubmit} className="glass-panel p-6 rounded-2xl space-y-4 shadow-lg">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              type="button"
                              key={star}
                              onClick={() => setRating(star)}
                              className={`text-yellow-400 hover:scale-110 transition-all ${
                                rating >= star ? 'opacity-100' : 'opacity-20'
                              }`}
                            >
                              <Star size={20} fill={rating >= star ? "currentColor" : "none"} className="text-bazaario-primary" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Comment</label>
                        <textarea
                          rows="3"
                          placeholder="Write comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="w-full bg-black/40 text-xs text-white p-4 rounded-xl border border-white/5 focus:outline-none focus:border-bazaario-primary backdrop-blur-sm"
                          required
                        ></textarea>
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="w-full bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold py-2.5 rounded-full transition-all uppercase tracking-wider shadow-[0_0_12px_rgba(20,184,166,0.15)] hover:scale-[1.01]"
                      >
                        {submittingReview ? "Submitting..." : "Submit Review"}
                      </button>
                    </form>
                  ) : (
                    <div className="glass-panel p-6 rounded-2xl text-center space-y-3 shadow-lg">
                      <p className="text-xs text-gray-400">Please sign in to write a product review.</p>
                      <button
                        onClick={() => navigate('/login')}
                        className="text-bazaario-primary hover:underline text-xs font-bold"
                      >
                        Sign In Now
                      </button>
                    </div>
                  )}
                </div>

                {/* Reviews List */}
                <div className="lg:col-span-2 space-y-4">
                  <h3 className="text-base font-bold text-white">Customer Feedback ({reviews.length})</h3>
                  {reviews.length === 0 ? (
                    <div className="glass-panel p-8 rounded-2xl text-center text-gray-500 text-xs">
                      No reviews yet. Be the first to review this product!
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="glass-panel p-5 rounded-2xl space-y-3 shadow-md">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-white text-xs">{rev.user?.name}</h4>
                              <span className="text-[9px] text-gray-500">
                                {new Date(rev.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                              </span>
                            </div>
                            <div className="flex text-yellow-450 gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star key={s} size={10} fill={s <= rev.rating ? "currentColor" : "none"} className="text-bazaario-primary" />
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-300 text-xs leading-relaxed">{rev.comment}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
