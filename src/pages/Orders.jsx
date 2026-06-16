import React, { useState, useEffect } from 'react';
import { ShoppingBag, Eye, X, CheckCircle, CreditCard, MapPin } from 'lucide-react';
import api from '../api';
import { getProductFallbackImage } from '../imageHelper';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('All'); // All, Processing, Delivered, Cancelled
  const [payingOrderId, setPayingOrderId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPaymentMethodModal, setShowPaymentMethodModal] = useState(false);
  const [orderToPay, setOrderToPay] = useState(null);
  const [paymentMethodSelection, setPaymentMethodSelection] = useState('Online');

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (activeTab === 'All') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status.toUpperCase() === activeTab.toUpperCase()));
    }
  }, [activeTab, orders]);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const triggerPaymentMethodSelection = (order) => {
    setOrderToPay(order);
    setPaymentMethodSelection('Online');
    setShowPaymentMethodModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!orderToPay) return;
    setShowPaymentMethodModal(false);
    
    if (paymentMethodSelection === 'COD') {
      setPayingOrderId(orderToPay.id);
      try {
        await api.post(`/api/payments/cod?orderId=${orderToPay.id}`);
        setSelectedOrder(null);
        fetchOrders();
        setSuccessMsg(`Payment completed successfully via Cash on Delivery for Order #BZR-${orderToPay.id}!`);
      } catch (err) {
        setErrorMsg("COD payment registration failed: " + (err.response?.data?.message || err.message));
      } finally {
        setPayingOrderId(null);
        setOrderToPay(null);
      }
    } else {
      const orderRef = orderToPay;
      setOrderToPay(null);
      handlePayNow(orderRef);
    }
  };

  const handlePayNow = async (order) => {
    setPayingOrderId(order.id);
    try {
      const paymentInitResponse = await api.post(`/api/payments/initiate?orderId=${order.id}`);
      const rzpOrderData = paymentInitResponse.data;

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg("Razorpay SDK failed to load. Please check your network connection.");
        setPayingOrderId(null);
        return;
      }

      const options = {
        key: 'rzp_test_T2Lj8d40gYcDTC',
        amount: rzpOrderData.amount,
        currency: rzpOrderData.currency,
        name: 'Bazaario Inc.',
        description: `Order Payment for #BZR-${order.id}`,
        order_id: rzpOrderData.id,
        handler: async function (response) {
          try {
            await api.post('/api/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order_id: String(order.id)
            });
            setSelectedOrder(null);
            fetchOrders();
            setSuccessMsg(`Payment completed successfully for Order #BZR-${order.id}!`);
          } catch (err) {
            setErrorMsg("Payment verification failed on server: " + (err.response?.data?.message || err.message));
          } finally {
            setPayingOrderId(null);
          }
        },
        prefill: {
          name: '',
          email: '',
        },
        theme: {
          color: '#14b8a6',
        },
        modal: {
          ondismiss: function () {
            setPayingOrderId(null);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "Failed to initiate payment.");
      setPayingOrderId(null);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await api.get('/api/orders');
      setOrders(response.data);
      setFilteredOrders(response.data);
    } catch (error) {
      console.error("Failed to load orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (orderId) => {
    try {
      const response = await api.get(`/api/orders/${orderId}`);
      setSelectedOrder(response.data);
    } catch (error) {
      alert("Failed to fetch order details");
    }
  };

  const getStatusStyle = (status) => {
    const s = status.toUpperCase();
    if (s === 'PENDING') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    if (s === 'PROCESSING') return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    if (s === 'SHIPPED') return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
    if (s === 'DELIVERED') return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
    return 'bg-red-500/10 text-red-500 border border-red-500/20';
  };

  const getStepStatus = (currentStatus, stepName) => {
    const statusMap = {
      'PENDING': 1,
      'PROCESSING': 2,
      'SHIPPED': 3,
      'DELIVERED': 4
    };
    
    const currentStep = statusMap[currentStatus.toUpperCase()] || 1;
    const stepTarget = statusMap[stepName.toUpperCase()];

    if (currentStep > stepTarget) return 'completed';
    if (currentStep === stepTarget) return 'current';
    return 'pending';
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-400">
        Loading your order history...
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
      {/* Page Heading */}
      <h1 className="text-2xl font-bold text-white tracking-tight">Your Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-6 border-b border-bazaario-border pb-px text-sm font-bold">
        {['All', 'Processing', 'Delivered', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 transition-all relative ${
              activeTab === tab ? 'text-bazaario-primary' : 'text-gray-400 hover:text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-bazaario-primary" />
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <div className="bg-bazaario-card border border-bazaario-border p-12 rounded-2xl text-center space-y-4">
          <ShoppingBag size={40} className="mx-auto text-gray-550" />
          <h2 className="text-lg font-bold text-white">No Orders Found</h2>
          <p className="text-gray-400 text-xs">There are no orders matching "{activeTab}" status.</p>
        </div>
      ) : (
        /* Order Cards Grid */
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-bazaario-card border border-bazaario-border p-6 rounded-2xl space-y-4 hover:border-gray-800 transition-all"
            >
              {/* Top Row: Order ID + Date + Status Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-bazaario-border pb-4">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Order reference</span>
                  <h3 className="text-sm font-extrabold text-white font-mono">#BZR-{order.id}</h3>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-450">
                    {new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* Middle Row: Item Thumbnails + Action Button */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto py-1">
                  {order.items?.map((item) => (
                    <div
                      key={item.id}
                      className="w-12 h-12 bg-[#0A0A0C] border border-bazaario-border rounded-lg p-1 flex items-center justify-center flex-shrink-0"
                      title={item.product?.name}
                    >
                      <img
                        src={item.product?.imageUrl}
                        alt=""
                        onError={(e) => {
                          e.target.src = getProductFallbackImage(item.product);
                        }}
                        className="w-full h-full object-contain rounded"
                      />
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                  <div className="text-right mr-2">
                    <span className="text-[10px] text-gray-455 uppercase tracking-wider block font-bold">Total Amount</span>
                    <span className="text-sm font-extrabold text-bazaario-primary">₹{order.totalAmount.toFixed(2)}</span>
                  </div>
                  {order.status.toUpperCase() === 'PENDING' && (
                    <button
                      onClick={() => triggerPaymentMethodSelection(order)}
                      disabled={payingOrderId === order.id}
                      className="bg-bazaario-primary hover:bg-bazaario-primaryHover disabled:opacity-50 text-black text-xs font-extrabold px-5 py-2 rounded-full transition-all flex items-center gap-1.5"
                    >
                      {payingOrderId === order.id ? "Paying..." : "Pay Now"}
                    </button>
                  )}
                  <button
                    onClick={() => handleViewDetails(order.id)}
                    className="border border-bazaario-primary hover:bg-bazaario-primary hover:text-black text-bazaario-primary text-xs font-bold px-5 py-2 rounded-full transition-all flex items-center gap-1.5"
                  >
                    <Eye size={12} /> View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* DETAIL MODAL (matches design spec) */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-bazaario-card border border-bazaario-border rounded-2xl w-full max-w-2xl p-8 relative space-y-6 shadow-2xl">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1A1A24] transition-all"
            >
              <X size={16} />
            </button>

            {/* Header info */}
            <div className="pb-4 border-b border-bazaario-border space-y-1">
              <span className="text-[9px] text-bazaario-primary uppercase tracking-widest font-extrabold">Order Summary</span>
              <h3 className="font-extrabold text-white text-lg font-mono">#BZR-{selectedOrder.id}</h3>
              <p className="text-xs text-gray-500">
                Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
              </p>
            </div>

            {/* Timeline step tracker */}
            {selectedOrder.status !== 'CANCELLED' && (
              <div className="bg-[#0A0A0C] border border-bazaario-border p-6 rounded-xl space-y-4">
                <div className="flex justify-between items-center relative px-2">
                  {/* Timeline progress line */}
                  <div className="absolute left-6 right-6 top-3 h-0.5 bg-bazaario-border -z-10" />

                  {/* Step 1: Pending (Placed) */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      getStepStatus(selectedOrder.status, 'PENDING') === 'completed'
                        ? 'bg-bazaario-primary text-black border-bazaario-primary'
                        : getStepStatus(selectedOrder.status, 'PENDING') === 'current'
                        ? 'bg-bazaario-primary/20 text-bazaario-primary border-bazaario-primary animate-pulse'
                        : 'bg-[#0A0A0C] text-gray-550 border-bazaario-border'
                    }`}>
                      1
                    </div>
                    <span className="text-[9px] text-white font-medium uppercase tracking-wider">Placed</span>
                  </div>

                  {/* Step 2: Processing */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      getStepStatus(selectedOrder.status, 'PROCESSING') === 'completed'
                        ? 'bg-bazaario-primary text-black border-bazaario-primary'
                        : getStepStatus(selectedOrder.status, 'PROCESSING') === 'current'
                        ? 'bg-bazaario-primary/20 text-bazaario-primary border-bazaario-primary animate-pulse'
                        : 'bg-[#0A0A0C] text-gray-555 border-bazaario-border'
                    }`}>
                      2
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Processing</span>
                  </div>

                  {/* Step 3: Shipped */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      getStepStatus(selectedOrder.status, 'SHIPPED') === 'completed'
                        ? 'bg-bazaario-primary text-black border-bazaario-primary'
                        : getStepStatus(selectedOrder.status, 'SHIPPED') === 'current'
                        ? 'bg-bazaario-primary/20 text-bazaario-primary border-bazaario-primary animate-pulse'
                        : 'bg-[#0A0A0C] text-gray-555 border-bazaario-border'
                    }`}>
                      3
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Shipped</span>
                  </div>

                  {/* Step 4: Delivered */}
                  <div className="flex flex-col items-center gap-2">
                    <div className={`w-6.5 h-6.5 rounded-full flex items-center justify-center text-[10px] font-bold border transition-all ${
                      getStepStatus(selectedOrder.status, 'DELIVERED') === 'completed'
                        ? 'bg-bazaario-primary text-black border-bazaario-primary'
                        : getStepStatus(selectedOrder.status, 'DELIVERED') === 'current'
                        ? 'bg-bazaario-primary/20 text-bazaario-primary border-bazaario-primary animate-pulse'
                        : 'bg-[#0A0A0C] text-gray-555 border-bazaario-border'
                    }`}>
                      4
                    </div>
                    <span className="text-[9px] text-gray-400 font-medium uppercase tracking-wider">Delivered</span>
                  </div>
                </div>
              </div>
            )}

            {/* Itemized List */}
            <div className="space-y-3 max-h-40 overflow-y-auto pr-1">
              {selectedOrder.items?.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-3 border-b border-[#1A1A24] last:border-0">
                  <div className="w-12 h-12 bg-[#0A0A0C] border border-bazaario-border rounded-lg p-1.5 flex items-center justify-center flex-shrink-0">
                    <img
                      src={item.product?.imageUrl}
                      alt=""
                      onError={(e) => {
                        e.target.src = getProductFallbackImage(item.product);
                      }}
                      className="w-full h-full object-contain rounded"
                    />
                  </div>
                  <div className="flex-grow text-xs space-y-0.5">
                    <h4 className="font-bold text-white">{item.product?.name}</h4>
                    <p className="text-gray-400">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-xs font-bold text-bazaario-primary">
                    ₹{(item.priceAtPurchase * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            {/* Address and Breakdown columns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-bazaario-border">
              {/* Delivery Address */}
              <div className="p-4 bg-[#0A0A0C] border border-bazaario-border rounded-xl space-y-2">
                <h4 className="text-[9px] text-gray-400 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <MapPin size={12} className="text-bazaario-primary" /> Delivery Address
                </h4>
                {selectedOrder.address ? (
                  <p className="text-xs text-white leading-relaxed">
                    {selectedOrder.address.street}, <br />
                    {selectedOrder.address.city}, {selectedOrder.address.state} - {selectedOrder.address.pincode}
                  </p>
                ) : (
                  <p className="text-xs text-red-400 font-medium">Deleted</p>
                )}
              </div>

              {/* Payment and Breakdown */}
              <div className="p-4 bg-[#0A0A0C] border border-bazaario-border rounded-xl space-y-2">
                <h4 className="text-[9px] text-gray-455 uppercase tracking-widest font-extrabold flex items-center gap-1.5">
                  <CreditCard size={12} className="text-bazaario-primary" /> Payment Method
                </h4>
                <p className="text-xs text-white font-bold uppercase">Razorpay Gateway (Test)</p>
                {selectedOrder.status.toUpperCase() === 'PENDING' && (
                  <button
                    onClick={() => triggerPaymentMethodSelection(selectedOrder)}
                    disabled={payingOrderId === selectedOrder.id}
                    className="w-full mt-2 bg-bazaario-primary hover:bg-bazaario-primaryHover disabled:opacity-50 text-black text-[11px] font-black py-2 rounded-lg transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    {payingOrderId === selectedOrder.id ? "Processing..." : "Complete Payment"}
                  </button>
                )}
                
                <div className="flex justify-between text-xs text-gray-400 pt-2 border-t border-[#1A1A24] mt-2">
                  <span>Grand Total</span>
                  <span className="text-bazaario-primary font-black">₹{selectedOrder.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Error Modal */}
      {errorMsg && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-bazaario-card border border-red-500/20 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-[0_0_50px_rgba(239,68,68,0.15)] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(239,68,68,0.1)]">
              <span className="text-2xl font-black font-sans leading-none">!</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Payment Alert</h2>
              <p className="text-gray-400 text-xs leading-relaxed">{errorMsg}</p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setErrorMsg(null)}
                className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 hover:text-white text-xs font-bold py-3.5 rounded-full transition-all uppercase tracking-wider"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Success Modal */}
      {successMsg && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-bazaario-card border border-bazaario-primary/20 rounded-3xl max-w-md w-full p-8 text-center space-y-6 shadow-[0_0_50px_rgba(20,184,166,0.15)] animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-bazaario-primary/10 border border-bazaario-primary/30 text-bazaario-primary rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(20,184,166,0.1)]">
              <span className="text-2xl font-black font-sans leading-none">✓</span>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Success</h2>
              <p className="text-gray-400 text-xs leading-relaxed">{successMsg}</p>
            </div>
            <div className="pt-2">
              <button
                onClick={() => setSuccessMsg(null)}
                className="w-full bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold py-3.5 rounded-full transition-all uppercase tracking-wider"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Payment Method Selection Modal */}
      {showPaymentMethodModal && orderToPay && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <div className="bg-bazaario-card border border-bazaario-border rounded-3xl max-w-md w-full p-8 space-y-6 shadow-[0_0_50px_rgba(20,184,166,0.1)] animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <h2 className="text-xl font-black text-white uppercase tracking-wider">Select Payment Method</h2>
              <p className="text-gray-400 text-xs">Choose how you want to complete payment for Order #BZR-{orderToPay.id}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setPaymentMethodSelection('Online')}
                className={`p-5 rounded-xl border cursor-pointer text-center relative transition-all flex flex-col items-center justify-center space-y-2 ${
                  paymentMethodSelection === 'Online'
                    ? 'border-bazaario-primary bg-bazaario-primary/5'
                    : 'border-bazaario-border bg-[#0A0A0C] hover:border-gray-800'
                }`}
              >
                {paymentMethodSelection === 'Online' && (
                  <span className="absolute top-2 right-2 p-0.5 bg-bazaario-primary text-black rounded-full">
                    <CheckCircle size={10} className="stroke-[2.5]" />
                  </span>
                )}
                <CreditCard size={18} className="text-bazaario-primary" />
                <span className="text-xs font-bold text-white">Online Payment</span>
              </div>

              <div
                onClick={() => setPaymentMethodSelection('COD')}
                className={`p-5 rounded-xl border cursor-pointer text-center relative transition-all flex flex-col items-center justify-center space-y-2 ${
                  paymentMethodSelection === 'COD'
                    ? 'border-bazaario-primary bg-bazaario-primary/5'
                    : 'border-bazaario-border bg-[#0A0A0C] hover:border-gray-800'
                }`}
              >
                {paymentMethodSelection === 'COD' && (
                  <span className="absolute top-2 right-2 p-0.5 bg-bazaario-primary text-black rounded-full">
                    <CheckCircle size={10} className="stroke-[2.5]" />
                  </span>
                )}
                <ShoppingBag size={18} className="text-bazaario-primary" />
                <span className="text-xs font-bold text-white">Cash on Delivery</span>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                onClick={handleConfirmPayment}
                className="flex-1 bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-black py-3 rounded-full transition-all uppercase tracking-wider"
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setShowPaymentMethodModal(false);
                  setOrderToPay(null);
                }}
                className="flex-1 border border-bazaario-border hover:border-gray-700 text-white text-xs font-bold py-3 rounded-full transition-all uppercase tracking-wider"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
