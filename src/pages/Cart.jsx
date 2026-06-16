import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Heart, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getProductFallbackImage } from '../imageHelper';

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal } = useCart();
  const navigate = useNavigate();

  // Wishlist modal state
  const [pendingDeleteProduct, setPendingDeleteProduct] = useState(null);

  if (!cart || !cart.items || cart.items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-6 py-24 text-center space-y-6 flex flex-col items-center">
        <div className="p-6 bg-bazaario-card border border-bazaario-border rounded-full text-gray-550">
          <ShoppingBag size={48} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-white tracking-tight">Your cart is empty</h2>
          <p className="text-gray-400 text-xs leading-relaxed">Looks like you haven't added any products to your cart yet.</p>
        </div>
        <Link
          to="/shop"
          className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold px-8 py-3.5 rounded-full transition-all uppercase tracking-wider"
        >
          Shop Now
        </Link>
      </div>
    );
  }

  const handleQuantityChange = (cartItemId, currentQty, amount, stockQty) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;
    if (newQty > stockQty) {
      alert(`Only ${stockQty} items available in stock.`);
      return;
    }
    updateQuantity(cartItemId, newQty);
  };

  // Billing calculations
  const gst = cartTotal * 0.05;
  const platformFee = cartTotal < 50 ? 0.99 : (cartTotal < 150 ? 1.99 : 2.99);
  const finalTotal = cartTotal + gst + platformFee;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      <h1 className="text-2xl font-bold text-white tracking-tight">Your Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left List Column (65%) */}
        <div className="lg:col-span-2 space-y-4">
          {cart.items.map((item) => (
            <div
              key={item.id}
              className="bg-bazaario-card border border-bazaario-border p-5 rounded-2xl flex flex-col sm:flex-row items-center gap-5 transition-all hover:border-gray-800"
            >
              {/* Product Thumbnail */}
              <div className="w-16 h-16 bg-[#0A0A0C] border border-bazaario-border rounded-xl p-1.5 flex items-center justify-center flex-shrink-0">
                <img
                  src={item.product.imageUrl}
                  alt={item.product.name}
                  onError={(e) => {
                    e.target.src = getProductFallbackImage(item.product);
                  }}
                  className="w-full h-full object-contain rounded-md"
                />
              </div>

              {/* Product Info */}
              <div className="flex-grow text-center sm:text-left space-y-0.5">
                <h3 className="font-bold text-white text-xs line-clamp-1">{item.product.name}</h3>
                <p className="text-[10px] text-bazaario-primary font-bold uppercase tracking-wider">{item.product.category?.name}</p>
                <div className="text-xs font-bold text-bazaario-primary pt-1">₹{item.product.price.toFixed(2)}</div>
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center bg-[#0A0A0C] border border-bazaario-border rounded-full px-3 py-1.5">
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity, -1, item.product.stockQty)}
                  className="text-bazaario-primary hover:text-white p-0.5"
                >
                  <Minus size={12} />
                </button>
                <span className="w-8 text-center text-xs font-bold text-white">{item.quantity}</span>
                <button
                  onClick={() => handleQuantityChange(item.id, item.quantity, 1, item.product.stockQty)}
                  className="text-bazaario-primary hover:text-white p-0.5"
                >
                  <Plus size={12} />
                </button>
              </div>

              {/* Price and Action */}
              <div className="flex items-center gap-6 justify-between w-full sm:w-auto">
                <div className="text-xs font-extrabold text-white w-20 text-right">
                  ₹{(item.product.price * item.quantity).toFixed(2)}
                </div>
                <button
                  onClick={() => setPendingDeleteProduct(item)}
                  className="p-2 text-gray-550 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Sticky Summary Column (35%) */}
        <div className="lg:col-span-1 bg-bazaario-card border border-bazaario-border p-6 rounded-2xl space-y-6 lg:sticky lg:top-6">
          <h2 className="text-base font-bold text-white">Cart Summary</h2>

          <div className="space-y-3 text-xs border-b border-bazaario-border pb-4">
            <div className="flex justify-between text-gray-400">
              <span>Subtotal</span>
              <span className="text-white font-medium">₹{cartTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Shipping</span>
              <span className="text-emerald-500 font-bold uppercase tracking-wider">Free</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>Platform Fee</span>
              <span className="text-white font-medium">₹{platformFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-400">
              <span>GST (5%)</span>
              <span className="text-white font-medium">₹{gst.toFixed(2)}</span>
            </div>
          </div>

          <div className="flex justify-between text-sm font-bold">
            <span className="text-white">Total Amount</span>
            <span className="text-bazaario-primary">₹{finalTotal.toFixed(2)}</span>
          </div>

          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-bazaario-primary hover:bg-bazaario-primaryHover text-black font-extrabold py-3.5 rounded-full text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-[0_0_15px_rgba(20,184,166,0.2)]"
          >
            Proceed to Checkout <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* Keep in Wishlist Confirmation Modal */}
      {pendingDeleteProduct && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#13131A] border border-[#2A2A38] p-6 sm:p-8 rounded-2xl w-full max-w-sm space-y-6 shadow-2xl relative animate-fade-in">
            <button 
              onClick={() => setPendingDeleteProduct(null)}
              className="absolute top-4 right-4 text-gray-550 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mx-auto shadow-[0_0_15px_rgba(239,68,68,0.1)]">
                <Heart size={22} className="animate-pulse" />
              </div>
              <h3 className="font-extrabold text-lg tracking-tight text-white font-poppins">Keep in Wishlist?</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                Would you like to save <strong>{pendingDeleteProduct.product.name}</strong> to your wishlist instead of deleting it from the cart?
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  removeFromCart(pendingDeleteProduct.id);
                  setPendingDeleteProduct(null);
                }}
                className="w-1/2 bg-[#1C1C24] hover:bg-red-900/20 text-red-400 hover:text-red-300 font-extrabold py-3 rounded-full text-xs uppercase tracking-wider transition-all"
              >
                No, Remove
              </button>
              <button
                type="button"
                onClick={() => {
                  const saved = localStorage.getItem('bazaario_wishlist');
                  const wishlist = saved ? JSON.parse(saved) : {};
                  wishlist[pendingDeleteProduct.product.id] = true;
                  localStorage.setItem('bazaario_wishlist', JSON.stringify(wishlist));
                  removeFromCart(pendingDeleteProduct.id);
                  setPendingDeleteProduct(null);
                }}
                className="w-1/2 bg-bazaario-primary hover:bg-bazaario-primaryHover text-black font-extrabold py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(20,184,166,0.15)]"
              >
                Yes, Wishlist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
