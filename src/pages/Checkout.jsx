import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, ShieldCheck, CreditCard, ArrowRight, Check, ArrowLeft, Loader2 } from 'lucide-react';
import api from '../api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProductFallbackImage } from '../imageHelper';

export default function Checkout() {
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loading, setLoading] = useState(true);
  const { cart, cartTotal, clearCartState } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Multi-step checkout states
  const [currentStep, setCurrentStep] = useState(1); // 1 = Address, 2 = Payment, 3 = Review
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('Card');

  // Address entry state
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [isDefault, setIsDefault] = useState(false);

  // Razorpay payment integration states
  const [paying, setPaying] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successOrderDetails, setSuccessOrderDetails] = useState(null);

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/api/addresses');
      setAddresses(response.data);
      if (response.data.length > 0) {
        const def = response.data.find(a => a.isDefault);
        setSelectedAddressId(def ? def.id : response.data[0].id);
      }
    } catch (error) {
      console.error("Failed to load addresses", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/api/addresses', { street, city, state, pincode, isDefault });
      setAddresses([...addresses, response.data]);
      setSelectedAddressId(response.data.id);
      
      setStreet('');
      setCity('');
      setState('');
      setPincode('');
      setIsDefault(false);
      setShowAddressForm(false);
    } catch (error) {
      alert("Failed to add address");
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert("Please select a delivery address.");
      setCurrentStep(1);
      return;
    }

    setPaying(true);
    try {
      const orderResponse = await api.post('/api/orders', { addressId: selectedAddressId });
      const createdOrder = orderResponse.data;

      const gst = cartTotal * 0.05;
      const platformFee = cartTotal < 50 ? 0.99 : (cartTotal < 150 ? 1.99 : 2.99);
      const calculatedTotal = cartTotal + gst + platformFee;

      if (selectedPaymentMethod === 'COD') {
        // Handle Cash on Delivery (COD)
        try {
          await api.post(`/api/payments/cod?orderId=${createdOrder.id}`);
          clearCartState();
          setSuccessOrderDetails({
            id: createdOrder.id,
            totalAmount: createdOrder.totalAmount || calculatedTotal,
            paymentMethod: 'Cash on Delivery (COD)',
            address: addresses.find(a => a.id === selectedAddressId)
          });
          setShowSuccessModal(true);
        } catch (err) {
          alert("COD payment registration failed: " + (err.response?.data?.message || err.message));
        } finally {
          setPaying(false);
        }
        return;
      }

      // Handle Online Razorpay Payment
      const paymentInitResponse = await api.post(`/api/payments/initiate?orderId=${createdOrder.id}`);
      const rzpOrderData = paymentInitResponse.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Razorpay SDK failed to load. Please check your network connection.");
        setPaying(false);
        return;
      }

      const options = {
        key: 'rzp_test_T2Lj8d40gYcDTC',
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency,
        name: 'Bazaario Inc.',
        description: `Order Payment for #BZR-${createdOrder.id}`,
        order_id: rzpOrderData.id,
        handler: async function (response) {
          try {
            await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: String(createdOrder.id)
            });
            clearCartState();
            setSuccessOrderDetails({
              id: createdOrder.id,
              totalAmount: createdOrder.totalAmount || calculatedTotal,
              paymentMethod: 'Online Payment (Razorpay)',
              address: addresses.find(a => a.id === selectedAddressId)
            });
            setShowSuccessModal(true);
          } catch (err) {
            alert("Payment verification failed on server: " + (err.response?.data?.message || err.message));
          } finally {
            setPaying(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#14b8a6',
        },
        modal: {
          ondismiss: function () {
            setPaying(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to initiate payment. Please verify item stock.");
      setPaying(false);
    }
  };

  const getStepCircleClass = (stepNum) => {
    if (currentStep === stepNum) {
      return "bg-bazaario-primary text-black border-bazaario-primary";
    }
    if (currentStep > stepNum) {
      return "bg-bazaario-primary/10 text-bazaario-primary border-bazaario-primary";
    }
    return "bg-[#0A0A0C] text-gray-500 border-bazaario-border";
  };

  const getStepLabelClass = (stepNum) => {
    if (currentStep === stepNum) {
      return "text-bazaario-primary font-bold";
    }
    if (currentStep > stepNum) {
      return "text-white font-semibold";
    }
    return "text-gray-500";
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-400">
        Loading Checkout details...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-10">
      {/* Visual Stepper */}
      <div className="max-w-xl mx-auto flex items-center justify-between relative px-2">
        {/* Horizontal Line connector */}
        <div className="absolute left-8 right-8 top-5 h-px bg-bazaario-border -z-10" />

        {/* Step 1: Address */}
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => setCurrentStep(1)}>
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${getStepCircleClass(1)}`}>
            {currentStep > 1 ? <Check size={14} /> : "1"}
          </div>
          <span className={`text-[10px] uppercase tracking-wider ${getStepLabelClass(1)}`}>Address</span>
        </div>

        {/* Step 2: Payment */}
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => selectedAddressId && setCurrentStep(2)}>
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${getStepCircleClass(2)}`}>
            {currentStep > 2 ? <Check size={14} /> : "2"}
          </div>
          <span className={`text-[10px] uppercase tracking-wider ${getStepLabelClass(2)}`}>Payment</span>
        </div>

        {/* Step 3: Review */}
        <div className="flex flex-col items-center gap-2 cursor-pointer" onClick={() => selectedAddressId && setCurrentStep(3)}>
          <div className={`w-10 h-10 rounded-full border flex items-center justify-center text-xs font-bold transition-all ${getStepCircleClass(3)}`}>
            "3"
          </div>
          <span className={`text-[10px] uppercase tracking-wider ${getStepLabelClass(3)}`}>Review</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Active Step Details (65%) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: ADDRESS */}
          {currentStep === 1 && (
            <div className="bg-bazaario-card border border-bazaario-border p-6 rounded-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-bazaario-border pb-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MapPin size={18} className="text-bazaario-primary" /> Delivery Address
                </h2>
              </div>

              {showAddressForm ? (
                <form onSubmit={handleAddAddress} className="bg-[#0A0A0C] p-6 rounded-xl border border-bazaario-border space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Street Address</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full bg-bazaario-card text-xs text-white px-4 py-2.5 rounded-lg border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-bazaario-card text-xs text-white px-4 py-2.5 rounded-lg border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-bazaario-card text-xs text-white px-4 py-2.5 rounded-lg border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-bazaario-card text-xs text-white px-4 py-2.5 rounded-lg border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
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
                    <span>Set as default delivery address</span>
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
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddressId(addr.id)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        selectedAddressId === addr.id
                          ? 'border-bazaario-primary bg-bazaario-primary/5'
                          : 'border-bazaario-border bg-[#0A0A0C] hover:border-gray-800'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-white">{addr.street}</p>
                          <input
                            type="radio"
                            checked={selectedAddressId === addr.id}
                            onChange={() => setSelectedAddressId(addr.id)}
                            className="accent-bazaario-primary"
                          />
                        </div>
                        <p className="text-[11px] text-gray-400">
                          {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                      </div>
                      {addr.isDefault && (
                        <span className="text-[9px] text-bazaario-primary font-bold uppercase mt-4">
                          Default Address
                        </span>
                      )}
                    </div>
                  ))}

                  {/* Add New Address Card */}
                  <div
                    onClick={() => setShowAddressForm(true)}
                    className="p-5 rounded-xl border border-dashed border-bazaario-primary/40 bg-bazaario-primary/5 hover:bg-bazaario-primary/10 cursor-pointer transition-all flex flex-col items-center justify-center text-center space-y-2 h-full min-h-[120px]"
                  >
                    <Plus size={20} className="text-bazaario-primary" />
                    <span className="text-xs font-bold text-bazaario-primary">+ Add New Address</span>
                  </div>
                </div>
              )}

              {selectedAddressId && (
                <div className="flex justify-end pt-4">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-1 transition-all uppercase tracking-wider"
                  >
                    Continue to Payment <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: PAYMENT METHOD */}
          {currentStep === 2 && (
            <div className="bg-bazaario-card border border-bazaario-border p-6 rounded-2xl space-y-6">
              {/* Selected Address Summary Banner */}
              {addresses.find(a => a.id === selectedAddressId) && (
                <div className="p-4 bg-[#0A0A0C] rounded-xl border border-bazaario-border flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <MapPin size={14} className="text-bazaario-primary flex-shrink-0" />
                    <span>Shipping to: <strong className="text-white">{addresses.find(a => a.id === selectedAddressId).street}, {addresses.find(a => a.id === selectedAddressId).city}</strong></span>
                  </div>
                  <button 
                    onClick={() => setCurrentStep(1)} 
                    className="text-[10px] text-bazaario-primary hover:underline font-bold uppercase"
                  >
                    Change
                  </button>
                </div>
              )}

              <h2 className="text-lg font-bold text-white">Select Payment Method</h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {['UPI', 'Card', 'Netbanking', 'COD'].map((method) => {
                  const isSelected = selectedPaymentMethod === method;
                  return (
                    <div
                      key={method}
                      onClick={() => setSelectedPaymentMethod(method)}
                      className={`p-5 rounded-xl border cursor-pointer text-center relative transition-all flex flex-col items-center justify-center space-y-2 ${
                        isSelected
                          ? 'border-bazaario-primary bg-bazaario-primary/5'
                          : 'border-bazaario-border bg-[#0A0A0C] hover:border-gray-800'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 p-0.5 bg-bazaario-primary text-black rounded-full">
                          <Check size={10} />
                        </span>
                      )}
                      <CreditCard size={18} className="text-bazaario-primary" />
                      <span className="text-xs font-bold text-white">{method === 'COD' ? 'Cash on Delivery' : method}</span>
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-gray-400 hover:text-white font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold px-6 py-2.5 rounded-full flex items-center gap-1 transition-all uppercase tracking-wider"
                >
                  Review Order <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: REVIEW ORDER */}
          {currentStep === 3 && (
            <div className="bg-bazaario-card border border-bazaario-border p-6 rounded-2xl space-y-6">
              <h2 className="text-lg font-bold text-white">Review Your Order</h2>

              <div className="space-y-4">
                {/* List item row */}
                <div className="space-y-3 bg-[#0A0A0C] p-4 rounded-xl border border-bazaario-border">
                  {cart?.items?.map((item) => (
                    <div key={item.id} className="flex items-center justify-between text-xs py-2 border-b border-bazaario-border last:border-0">
                      <div className="flex items-center gap-3">
                        <img 
                          src={item.product.imageUrl} 
                          alt="" 
                          onError={(e) => {
                            e.target.src = getProductFallbackImage(item.product);
                          }}
                          className="w-8 h-8 object-contain rounded bg-bazaario-card p-1" 
                        />
                        <div>
                          <p className="font-bold text-white">{item.product.name}</p>
                          <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                        </div>
                      </div>
                      <span className="text-bazaario-primary font-bold">₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                {/* Details layout */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-[#0A0A0C] rounded-xl border border-bazaario-border space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Shipping To</p>
                    {addresses.find(a => a.id === selectedAddressId) ? (
                      <p className="text-xs text-white">
                        {addresses.find(a => a.id === selectedAddressId).street}, {addresses.find(a => a.id === selectedAddressId).city}
                      </p>
                    ) : (
                      <p className="text-xs text-red-400">None selected</p>
                    )}
                  </div>
                  <div className="p-4 bg-[#0A0A0C] rounded-xl border border-bazaario-border space-y-1">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-extrabold">Payment Mode</p>
                    <p className="text-xs text-white font-bold">{selectedPaymentMethod === 'COD' ? 'Cash on Delivery' : selectedPaymentMethod}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-xs text-gray-400 hover:text-white font-bold flex items-center gap-1.5"
                >
                  <ArrowLeft size={14} /> Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  disabled={paying}
                  className="bg-bazaario-primary hover:bg-bazaario-primaryHover disabled:opacity-50 text-black text-xs font-extrabold px-8 py-3 rounded-full transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(20,184,166,0.25)] flex items-center gap-2"
                >
                  {paying ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      Processing...
                    </>
                  ) : (
                    "Place Order & Pay"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Summary Panel (35%) */}
        <div className="lg:col-span-1 bg-bazaario-card border border-bazaario-border p-6 rounded-2xl space-y-6 lg:sticky lg:top-6">
          <h2 className="text-base font-bold text-white">Summary</h2>

          <div className="space-y-3 max-h-48 overflow-y-auto border-b border-bazaario-border pb-4">
            {cart?.items?.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-xs">
                <div className="text-gray-400 max-w-xs truncate">
                  {item.product.name} <span className="text-gray-550">x{item.quantity}</span>
                </div>
                <span className="text-white font-medium">₹{(item.product.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          {/* Billing calculations */}
          {(() => {
            const gst = cartTotal * 0.05;
            const platformFee = cartTotal < 50 ? 0.99 : (cartTotal < 150 ? 1.99 : 2.99);
            const finalTotal = cartTotal + gst + platformFee;
            return (
              <>
                <div className="space-y-2 text-xs border-b border-bazaario-border pb-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Cart Subtotal</span>
                    <span className="text-white font-semibold">₹{cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping Fee</span>
                    <span className="text-emerald-500 font-bold uppercase">Free</span>
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
                  <span className="text-white">Payable Amount</span>
                  <span className="text-bazaario-primary">₹{finalTotal.toFixed(2)}</span>
                </div>

                {/* Permanent Delivery Address Summary */}
                {addresses.find(a => a.id === selectedAddressId) && (
                  <div className="border-t border-bazaario-border pt-4 mt-2 space-y-1 text-[11px]">
                    <span className="text-gray-500 uppercase font-extrabold tracking-wider text-[9px] flex items-center gap-1">
                      <MapPin size={10} className="text-bazaario-primary" /> Delivery Destination
                    </span>
                    <p className="text-gray-300 font-medium leading-relaxed">
                      {addresses.find(a => a.id === selectedAddressId).street}, {addresses.find(a => a.id === selectedAddressId).city}
                    </p>
                  </div>
                )}
              </>
            );
          })()}
        </div>
      </div>

      {/* Neat Success Modal */}
      {showSuccessModal && successOrderDetails && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-bazaario-card border border-bazaario-primary/20 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-[0_0_50px_rgba(20,184,166,0.15)]">
            <div className="w-16 h-16 bg-bazaario-primary/10 border border-bazaario-primary/30 text-bazaario-primary rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(20,184,166,0.1)]">
              <Check size={32} className="stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-white">Order Confirmed!</h2>
              <p className="text-gray-400 text-xs">Thank you for your purchase. Your order is now processing.</p>
            </div>

            <div className="bg-[#0A0A0C] border border-bazaario-border p-5 rounded-2xl text-left space-y-3.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Order ID</span>
                <span className="text-white font-mono font-bold">#BZR-{successOrderDetails.id}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Amount Paid</span>
                <span className="text-bazaario-primary font-extrabold text-sm">₹{successOrderDetails.totalAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase tracking-wider text-[10px]">Payment Mode</span>
                <span className="text-white font-bold uppercase tracking-wider text-[9px] bg-bazaario-primary/10 px-2 py-0.5 rounded border border-bazaario-primary/20">
                  {successOrderDetails.paymentMethod}
                </span>
              </div>
              
              {successOrderDetails.address && (
                <div className="pt-3 border-t border-bazaario-border space-y-1 text-xs">
                  <span className="text-gray-500 font-bold uppercase tracking-wider text-[9px] block">Shipping Address</span>
                  <p className="text-gray-300 leading-relaxed text-[11px]">
                    {successOrderDetails.address.street}, {successOrderDetails.address.city}, {successOrderDetails.address.state} - {successOrderDetails.address.pincode}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/orders');
                }}
                className="w-full bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-black py-3.5 rounded-full transition-all uppercase tracking-wider shadow-lg flex items-center justify-center gap-1.5"
              >
                Track Your Order
              </button>
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  navigate('/shop');
                }}
                className="w-full border border-bazaario-border hover:border-bazaario-primary text-white hover:text-bazaario-primary text-xs font-bold py-3.5 rounded-full transition-all uppercase tracking-wider"
              >
                Continue Shopping
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
