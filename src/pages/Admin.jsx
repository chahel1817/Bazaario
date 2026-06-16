import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, FolderOpen, Users, Pencil, Trash2, Plus, Package, ShieldAlert, X, TrendingUp } from 'lucide-react';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { getProductFallbackImage } from '../imageHelper';

export default function Admin() {
  const { user, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Navigation tab
  const [activeTab, setActiveTab] = useState('dashboard'); // dashboard, products, orders, categories

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / forms toggles
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: '',
    imageUrl: '',
    stockQty: '',
    categoryId: ''
  });

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || !isAdmin)) {
      navigate('/');
    }
  }, [user, isAdmin, authLoading]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const prodRes = await api.get('/api/products?page=0&size=100');
      setProducts(prodRes.data.content || []);

      const catRes = await api.get('/api/categories');
      setCategories(catRes.data);
      if (catRes.data.length > 0 && !productForm.categoryId) {
        setProductForm(prev => ({ ...prev, categoryId: catRes.data[0].id }));
      }

      const orderRes = await api.get('/api/orders');
      setOrders(orderRes.data || []);
    } catch (error) {
      console.error("Admin data fetch failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        name: productForm.name,
        description: productForm.description,
        price: parseFloat(productForm.price),
        imageUrl: productForm.imageUrl || '/images/headphones.jpg',
        stockQty: parseInt(productForm.stockQty, 10),
        categoryId: parseInt(productForm.categoryId, 10)
      };

      if (editingProduct) {
        await api.put(`/api/products/${editingProduct.id}`, data);
        alert("Product updated successfully!");
      } else {
        await api.post('/api/products', data);
        alert("Product created successfully!");
      }

      setEditingProduct(null);
      setProductForm({
        name: '',
        description: '',
        price: '',
        imageUrl: '',
        stockQty: '',
        categoryId: categories[0]?.id || ''
      });
      setShowProductModal(false);
      fetchDashboardData();
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save product");
    }
  };

  const handleEditClick = (prod) => {
    setEditingProduct(prod);
    setProductForm({
      name: prod.name,
      description: prod.description,
      price: prod.price,
      imageUrl: prod.imageUrl,
      stockQty: prod.stockQty,
      categoryId: prod.category?.id || ''
    });
    setShowProductModal(true);
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/api/products/${prodId}`);
      alert("Product deleted!");
      fetchDashboardData();
    } catch (error) {
      alert("Failed to delete product");
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    try {
      await api.post('/api/categories', { name: newCategoryName });
      setNewCategoryName('');
      alert("Category created!");
      setShowCategoryModal(false);
      fetchDashboardData();
    } catch (error) {
      alert("Failed to add category");
    }
  };

  const getOrderStatusStyle = (status) => {
    const s = status.toUpperCase();
    if (s === 'PENDING') return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    if (s === 'PROCESSING') return 'bg-blue-500/10 text-blue-500 border border-blue-500/20';
    if (s === 'SHIPPED') return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
    if (s === 'DELIVERED') return 'bg-teal-500/10 text-teal-400 border border-teal-500/20';
    return 'bg-red-500/10 text-red-500 border border-red-500/20';
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-20 text-center text-gray-400">
        Loading Admin Dashboard...
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldAlert size={48} className="mx-auto text-red-500" />
        <h2 className="text-xl font-bold">Access Denied</h2>
        <p className="text-gray-400 text-sm">Only administrators have access to this page.</p>
      </div>
    );
  }

  // Calculate statistics
  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="flex min-h-[calc(100vh-80px)] bg-[#0A0A0C]">
      {/* Sidebar (Left Sidebar) */}
      <aside className="w-64 bg-black border-r border-bazaario-border p-6 flex flex-col justify-between flex-shrink-0 hidden md:flex">
        <div className="space-y-8">
          <div className="flex items-center gap-2 px-2">
            <span className="text-white font-extrabold text-lg uppercase tracking-wider">Bazaario</span>
            <span className="bg-bazaario-primary/10 text-bazaario-primary text-[9px] font-bold px-2 py-0.5 rounded-full border border-bazaario-primary/20">Admin</span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-full transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-bazaario-primary text-black font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-bazaario-card'
              }`}
            >
              <LayoutDashboard size={14} /> Dashboard
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-full transition-all ${
                activeTab === 'products'
                  ? 'bg-bazaario-primary text-black font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-bazaario-card'
              }`}
            >
              <ShoppingBag size={14} /> Products
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-full transition-all ${
                activeTab === 'orders'
                  ? 'bg-bazaario-primary text-black font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-bazaario-card'
              }`}
            >
              <ShoppingBag size={14} /> Orders
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-full transition-all ${
                activeTab === 'categories'
                  ? 'bg-bazaario-primary text-black font-extrabold'
                  : 'text-gray-400 hover:text-white hover:bg-bazaario-card'
              }`}
            >
              <FolderOpen size={14} /> Categories
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Area (Right Content View) */}
      <main className="flex-grow p-6 sm:p-8 space-y-8 overflow-y-auto">
        {/* Mobile Tab Selectors */}
        <div className="flex md:hidden gap-2 overflow-x-auto pb-4 border-b border-bazaario-border">
          {['dashboard', 'products', 'orders', 'categories'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-bold capitalize whitespace-nowrap ${
                activeTab === tab ? 'bg-bazaario-primary text-black' : 'bg-bazaario-card text-gray-400'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* DASHBOARD TAB VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stat cards in a row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Stat 1: Sales */}
              <div className="bg-[#13131A] border border-bazaario-border p-6 rounded-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Total Revenue</span>
                  <div className="p-2 bg-bazaario-primary/10 rounded-lg text-bazaario-primary">
                    <TrendingUp size={16} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-mono">${totalSales.toFixed(2)}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">+12.5%</span>
                    <span className="text-[9px] text-gray-550">vs last month</span>
                  </div>
                </div>
              </div>

              {/* Stat 2: Orders */}
              <div className="bg-[#13131A] border border-bazaario-border p-6 rounded-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Total Orders</span>
                  <div className="p-2 bg-bazaario-primary/10 rounded-lg text-bazaario-primary">
                    <ShoppingBag size={16} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-mono">{orders.length}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">+8.3%</span>
                    <span className="text-[9px] text-gray-555">vs last month</span>
                  </div>
                </div>
              </div>

              {/* Stat 3: Products */}
              <div className="bg-[#13131A] border border-bazaario-border p-6 rounded-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Active Catalog</span>
                  <div className="p-2 bg-bazaario-primary/10 rounded-lg text-bazaario-primary">
                    <Package size={16} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-mono">{products.length}</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">+2.4%</span>
                    <span className="text-[9px] text-gray-555">newly added</span>
                  </div>
                </div>
              </div>

              {/* Stat 4: Customers */}
              <div className="bg-[#13131A] border border-bazaario-border p-6 rounded-xl space-y-3 relative overflow-hidden">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-gray-400 uppercase tracking-widest font-extrabold">Customers</span>
                  <div className="p-2 bg-bazaario-primary/10 rounded-lg text-bazaario-primary">
                    <Users size={16} />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-white font-mono">42</h3>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">+5.1%</span>
                    <span className="text-[9px] text-gray-555">growth rate</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium vector chart card */}
            <div className="bg-[#13131A] border border-bazaario-border p-6 rounded-2xl space-y-4">
              <div>
                <h4 className="font-bold text-white text-sm">Revenue Trends & Sales Timeline</h4>
                <p className="text-[10px] text-gray-500">Visualization of monthly order distributions</p>
              </div>

              <div className="w-full h-64 bg-[#0A0A0C] border border-bazaario-border rounded-xl flex items-center justify-center p-4">
                <svg viewBox="0 0 500 200" className="w-full h-full text-bazaario-primary">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#1F2937" strokeWidth="1" strokeDasharray="4" />
                  <line x1="40" y1="70" x2="480" y2="70" stroke="#1F2937" strokeWidth="1" strokeDasharray="4" />
                  <line x1="40" y1="120" x2="480" y2="120" stroke="#1F2937" strokeWidth="1" strokeDasharray="4" />
                  <line x1="40" y1="170" x2="480" y2="170" stroke="#1F2937" strokeWidth="1" />

                  {/* Gradient area */}
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#14B8A6" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <path
                    d="M 40 170 C 80 140, 120 110, 160 120 C 200 130, 240 70, 280 80 C 320 90, 360 40, 400 50 C 440 60, 460 30, 480 30 L 480 170 Z"
                    fill="url(#chartGrad)"
                  />

                  {/* Line Chart */}
                  <path
                    d="M 40 170 C 80 140, 120 110, 160 120 C 200 130, 240 70, 280 80 C 320 90, 360 40, 400 50 C 440 60, 460 30, 480 30"
                    fill="none"
                    stroke="#14B8A6"
                    strokeWidth="3"
                  />

                  {/* Highlight dots */}
                  <circle cx="160" cy="120" r="4" fill="#14B8A6" stroke="#13131A" strokeWidth="2" />
                  <circle cx="280" cy="80" r="4" fill="#14B8A6" stroke="#13131A" strokeWidth="2" />
                  <circle cx="400" cy="50" r="4" fill="#14B8A6" stroke="#13131A" strokeWidth="2" />
                  <circle cx="480" cy="30" r="4" fill="#14B8A6" stroke="#13131A" strokeWidth="2" />

                  {/* Axes labels */}
                  <text x="40" y="190" fill="#6B7280" fontSize="10" textAnchor="middle">Jan</text>
                  <text x="120" y="190" fill="#6B7280" fontSize="10" textAnchor="middle">Feb</text>
                  <text x="200" y="190" fill="#6B7280" fontSize="10" textAnchor="middle">Mar</text>
                  <text x="280" y="190" fill="#6B7280" fontSize="10" textAnchor="middle">Apr</text>
                  <text x="360" y="190" fill="#6B7280" fontSize="10" textAnchor="middle">May</text>
                  <text x="440" y="190" fill="#6B7280" fontSize="10" textAnchor="middle">Jun</text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* PRODUCTS TAB VIEW */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-bazaario-border">
              <h2 className="text-base font-bold text-white">Product Catalog ({products.length})</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: '',
                    imageUrl: '',
                    stockQty: '',
                    categoryId: categories[0]?.id || ''
                  });
                  setShowProductModal(true);
                }}
                className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold px-5 py-2 rounded-full flex items-center gap-1.5 transition-all"
              >
                <Plus size={12} /> Add Product
              </button>
            </div>

            {/* Products Table (Alternating dark rows) */}
            <div className="bg-bazaario-card border border-bazaario-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-bazaario-border text-[10px] text-gray-400 uppercase tracking-widest font-extrabold bg-[#0A0A0C]/50">
                      <th className="py-4 px-6">Image</th>
                      <th className="py-4 px-6">Name</th>
                      <th className="py-4 px-6">Price</th>
                      <th className="py-4 px-6">Stock</th>
                      <th className="py-4 px-6">Category</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A24] text-xs">
                    {products.map((prod, idx) => (
                      <tr key={prod.id} className={`${idx % 2 === 0 ? 'bg-[#13131A]' : 'bg-[#0A0A0C]/30'} hover:bg-bazaario-primary/5 transition-all`}>
                        <td className="py-4 px-6">
                          <img 
                            src={prod.imageUrl} 
                            alt="" 
                            onError={(e) => {
                              e.target.src = getProductFallbackImage(prod);
                            }}
                            className="w-8 h-8 object-contain rounded bg-[#0A0A0C] p-1 border border-bazaario-border" 
                          />
                        </td>
                        <td className="py-4 px-6 font-bold text-white max-w-xs truncate">{prod.name}</td>
                        <td className="py-4 px-6 text-bazaario-primary font-bold">${prod.price.toFixed(2)}</td>
                        <td className="py-4 px-6">
                          <span className={`font-mono font-semibold ${prod.stockQty < 5 ? 'text-red-400' : 'text-gray-300'}`}>
                            {prod.stockQty}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-400 font-medium">{prod.category?.name}</td>
                        <td className="py-4 px-6 text-right space-x-2">
                          <button
                            onClick={() => handleEditClick(prod)}
                            className="p-2 text-bazaario-primary hover:bg-bazaario-primary/10 rounded-xl transition-all"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                          >
                            <Trash2 size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ORDERS TAB VIEW */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <h2 className="text-base font-bold text-white pb-4 border-b border-bazaario-border">Customer Orders ({orders.length})</h2>

            {/* Orders Table (Alternating dark rows) */}
            <div className="bg-bazaario-card border border-bazaario-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-bazaario-border text-[10px] text-gray-400 uppercase tracking-widest font-extrabold bg-[#0A0A0C]/50">
                      <th className="py-4 px-6">Order ID</th>
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Total</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A24] text-xs">
                    {orders.map((ord, idx) => (
                      <tr key={ord.id} className={`${idx % 2 === 0 ? 'bg-[#13131A]' : 'bg-[#0A0A0C]/30'} hover:bg-bazaario-primary/5 transition-all`}>
                        <td className="py-4 px-6 font-mono font-bold text-white">#BZR-{ord.id}</td>
                        <td className="py-4 px-6 text-gray-400">
                          {new Date(ord.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-4 px-6 text-bazaario-primary font-bold">${ord.totalAmount.toFixed(2)}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider ${getOrderStatusStyle(ord.status)}`}>
                            {ord.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button
                            onClick={() => navigate('/orders')}
                            className="text-[10px] text-bazaario-primary hover:underline font-bold"
                          >
                            Manage Order
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORIES TAB VIEW */}
        {activeTab === 'categories' && (
          <div className="space-y-6 max-w-xl">
            <div className="flex items-center justify-between pb-4 border-b border-bazaario-border">
              <h2 className="text-base font-bold text-white">Categories Index</h2>
              <button
                onClick={() => setShowCategoryModal(true)}
                className="bg-bazaario-primary hover:bg-bazaario-primaryHover text-black text-xs font-bold px-5 py-2 rounded-full flex items-center gap-1.5 transition-all"
              >
                <Plus size={12} /> Add Category
              </button>
            </div>

            <div className="bg-bazaario-card border border-bazaario-border rounded-xl divide-y divide-[#1A1A24] text-xs">
              {categories.map((cat) => (
                <div key={cat.id} className="p-4 flex justify-between items-center hover:bg-bazaario-primary/5 transition-all">
                  <span className="text-white font-bold">{cat.name}</span>
                  <span className="text-[10px] text-gray-500 font-mono">ID: {cat.id}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* CREATE/EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-bazaario-card border border-bazaario-border rounded-2xl w-full max-w-md p-8 relative space-y-6 shadow-2xl">
            <button
              onClick={() => setShowProductModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1A1A24] transition-all"
            >
              <X size={16} />
            </button>

            <h3 className="font-extrabold text-white text-base flex items-center gap-2 pb-2 border-b border-bazaario-border">
              <Package size={16} className="text-bazaario-primary" />
              {editingProduct ? "Edit Product Details" : "Create New Product"}
            </h3>

            <form onSubmit={handleProductSubmit} className="space-y-4 text-[10px]">
              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-widest font-extrabold">Product Name</label>
                <input
                  type="text"
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  className="w-full bg-[#0A0A0C] text-xs text-white px-4 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-405 uppercase tracking-widest font-extrabold">Description</label>
                <textarea
                  rows="3"
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  className="w-full bg-[#0A0A0C] text-xs text-white p-4 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-gray-405 uppercase tracking-widest font-extrabold">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    className="w-full bg-[#0A0A0C] text-xs text-white px-4 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-gray-455 uppercase tracking-widest font-extrabold">Stock Qty</label>
                  <input
                    type="number"
                    value={productForm.stockQty}
                    onChange={(e) => setProductForm({ ...productForm, stockQty: e.target.value })}
                    className="w-full bg-[#0A0A0C] text-xs text-white px-4 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-gray-455 uppercase tracking-widest font-extrabold">Image URL</label>
                <input
                  type="text"
                  placeholder="/images/headphones.jpg"
                  value={productForm.imageUrl}
                  onChange={(e) => setProductForm({ ...productForm, imageUrl: e.target.value })}
                  className="w-full bg-[#0A0A0C] text-xs text-white px-4 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-gray-455 uppercase tracking-widest font-extrabold">Category</label>
                <select
                  value={productForm.categoryId}
                  onChange={(e) => setProductForm({ ...productForm, categoryId: e.target.value })}
                  className="w-full bg-[#0A0A0C] text-xs text-white px-4 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary cursor-pointer"
                  required
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-bazaario-primary hover:bg-bazaario-primaryHover text-black font-extrabold py-3 rounded-full text-xs uppercase tracking-wider transition-all"
                >
                  {editingProduct ? "Update Product" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-bazaario-card border border-bazaario-border rounded-2xl w-full max-w-sm p-8 relative space-y-6 shadow-2xl">
            <button
              onClick={() => setShowCategoryModal(false)}
              className="absolute top-6 right-6 p-2 text-gray-400 hover:text-white rounded-xl hover:bg-[#1A1A24] transition-all"
            >
              <X size={16} />
            </button>

            <h3 className="font-extrabold text-white text-base flex items-center gap-2 pb-2 border-b border-bazaario-border">
              <FolderOpen size={16} className="text-bazaario-primary" /> Create Category
            </h3>

            <form onSubmit={handleCategorySubmit} className="space-y-4 text-[10px]">
              <div className="space-y-1">
                <label className="text-gray-400 uppercase tracking-widest font-extrabold">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Footwear"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full bg-[#0A0A0C] text-xs text-white px-4 py-2.5 rounded-xl border border-bazaario-border focus:outline-none focus:border-bazaario-primary"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-bazaario-primary hover:bg-bazaario-primaryHover text-black font-extrabold py-3 rounded-full text-xs uppercase tracking-wider transition-all"
              >
                Create Category
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
