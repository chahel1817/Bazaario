import React, { createContext, useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ShoppingBag, X, Check } from 'lucide-react';
import api from '../api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  // Guest login prompt state
  const [pendingLoginItem, setPendingLoginItem] = useState(null);
  
  // Successful add toast state
  const [cartNotification, setCartNotification] = useState(null);

  const fetchCart = async () => {
    if (!token) {
      setCart(null);
      return;
    }
    setLoading(true);
    try {
      const response = await api.get('/api/cart');
      setCart(response.data);
    } catch (error) {
      console.error("Failed to fetch cart", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // Check if there is a pending item stored in localStorage upon login
    if (token) {
      const pendingItem = localStorage.getItem('pending_cart_item');
      if (pendingItem) {
        try {
          const { productId, quantity } = JSON.parse(pendingItem);
          localStorage.removeItem('pending_cart_item');
          
          // Add to cart now that user is logged in
          api.post('/api/cart/items', { productId, quantity }).then((res) => {
            setCart(res.data);
            showNotification("Item has been added and in cart");
          }).catch((err) => {
            console.error("Failed to add pending item", err);
          });
        } catch (e) {
          console.error("Error parsing pending cart item", e);
        }
      }
    }
  }, [token]);

  const showNotification = (msg) => {
    setCartNotification(msg);
    const timer = setTimeout(() => {
      setCartNotification(null);
    }, 3000);
    return () => clearTimeout(timer);
  };

  const addToCart = async (productId, quantity = 1) => {
    if (!token) {
      setPendingLoginItem({ productId, quantity });
      return { success: false, loginRequired: true };
    }
    try {
      const response = await api.post('/api/cart/items', { productId, quantity });
      setCart(response.data);
      showNotification("Item has been added and in cart");
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Failed to add item to cart.' 
      };
    }
  };

  const updateQuantity = async (cartItemId, quantity) => {
    if (!token) return;
    try {
      const response = await api.put(`/api/cart/items/${cartItemId}?quantity=${quantity}`);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to update cart quantity", error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    if (!token) return;
    try {
      const response = await api.delete(`/api/cart/items/${cartItemId}`);
      setCart(response.data);
    } catch (error) {
      console.error("Failed to remove item from cart", error);
    }
  };

  const clearCartState = () => {
    setCart({ items: [] });
  };

  const handleLoginRedirect = () => {
    if (pendingLoginItem) {
      localStorage.setItem('pending_cart_item', JSON.stringify(pendingLoginItem));
    }
    setPendingLoginItem(null);
    navigate('/login');
  };

  const cartItemsCount = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  const cartTotal = cart?.items?.reduce((sum, item) => sum + (item.product.price * item.quantity), 0) || 0;

  return (
    <CartContext.Provider value={{ 
      cart, 
      loading, 
      fetchCart, 
      addToCart, 
      updateQuantity, 
      removeFromCart, 
      clearCartState,
      cartItemsCount, 
      cartTotal 
    }}>
      {children}

      {/* 3-Second Add Success Transparent Modal */}
      {cartNotification && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/30 backdrop-blur-[2px] pointer-events-none transition-all duration-300">
          <div className="bg-[#13131A]/90 border border-bazaario-primary/40 px-6 py-4 rounded-2xl shadow-[0_0_30px_rgba(20,184,166,0.15)] flex items-center gap-3 animate-fade-in text-white pointer-events-auto max-w-sm">
            <div className="w-6 h-6 rounded-full bg-bazaario-primary/20 flex items-center justify-center text-bazaario-primary">
              <Check size={14} className="stroke-[3]" />
            </div>
            <span className="text-xs font-black uppercase tracking-wider font-poppins">{cartNotification}</span>
          </div>
        </div>
      )}

      {/* Not Logged In Guest Modal */}
      {pendingLoginItem && (
        <div className="fixed inset-0 z-[99] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#13131A] border border-[#2A2A38] p-6 sm:p-8 rounded-2xl w-full max-w-sm space-y-6 shadow-2xl relative">
            <button 
              onClick={() => setPendingLoginItem(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
            >
              <X size={16} />
            </button>

            <div className="text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1A1A24] border border-bazaario-primary/20 flex items-center justify-center text-bazaario-primary mx-auto shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                <ShoppingBag size={22} className="animate-pulse" />
              </div>
              <h3 className="font-extrabold text-lg tracking-tight text-white font-poppins">Not Logged In Yet</h3>
              <p className="text-xs text-gray-400 leading-relaxed max-w-xs mx-auto">
                You need to login to add this product to your cart. We will save this item and add it automatically once you log in.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPendingLoginItem(null)}
                className="w-1/2 bg-[#1C1C24] hover:bg-[#252530] text-gray-400 hover:text-white font-extrabold py-3 rounded-full text-xs uppercase tracking-wider transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleLoginRedirect}
                className="w-1/2 bg-bazaario-primary hover:bg-bazaario-primaryHover text-black font-extrabold py-3 rounded-full text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(20,184,166,0.15)]"
              >
                Login to Add
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
