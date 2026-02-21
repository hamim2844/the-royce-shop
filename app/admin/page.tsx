// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, Package, Settings, LogOut, Plus, 
  Search, Bell, Edit, Trash, ListOrdered, Lock, 
  Users, TrendingUp, Save, X, Eye, CheckCircle
} from 'lucide-react';

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState('dashboard');
  
  // Data States
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [config, setConfig] = useState({});
  const [editingProduct, setEditingProduct] = useState(null);

  // Load Data from LocalStorage
  const refreshData = () => {
    if (typeof window !== 'undefined') {
      const storedOrders = JSON.parse(localStorage.getItem('royce_orders') || '[]');
      const storedProducts = JSON.parse(localStorage.getItem('royce_products') || '[]');
      const storedConfig = JSON.parse(localStorage.getItem('royce_config') || '{}');
      const storedUser = JSON.parse(localStorage.getItem('royce_user') || 'null'); // currently stores one user for demo
      
      setOrders(storedOrders);
      setProducts(storedProducts);
      setConfig(storedConfig);
      if(storedUser) setUsers([storedUser]); // For MVP, showing the local user
    }
  };

  useEffect(() => {
    if(isLoggedIn) {
      refreshData();
      const interval = setInterval(refreshData, 5000); // Sync every 5 seconds
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  // Login Logic
  const handleLogin = (e) => {
    e.preventDefault();
    if(password === "admin123") { // Default password
      setIsLoggedIn(true);
    } else {
      alert("Wrong Password!");
    }
  };

  // Product Logic
  const saveProduct = (e) => {
    e.preventDefault();
    let newProducts;
    if(editingProduct.id) {
      newProducts = products.map(p => p.id === editingProduct.id ? editingProduct : p);
    } else {
      const newProd = { ...editingProduct, id: Date.now(), reviews: [], rating: 5.0 };
      newProducts = [newProd, ...products];
    }
    setProducts(newProducts);
    localStorage.setItem('royce_products', JSON.stringify(newProducts));
    setEditingProduct(null);
    alert("Product Saved Successfully!");
  };

  const deleteProduct = (id) => {
    if(confirm("Are you sure you want to delete this product?")) {
      const newProducts = products.filter(p => p.id !== id);
      setProducts(newProducts);
      localStorage.setItem('royce_products', JSON.stringify(newProducts));
    }
  };

  // Order Logic
  const updateOrderStatus = (id, newStatus) => {
    const updatedOrders = orders.map(o => o.id === id ? { ...o, status: newStatus } : o);
    setOrders(updatedOrders);
    localStorage.setItem('royce_orders', JSON.stringify(updatedOrders));
  };

  // Config Logic
  const saveConfig = (e) => {
    e.preventDefault();
    localStorage.setItem('royce_config', JSON.stringify(config));
    alert("Settings Saved Successfully! It will reflect on the website.");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-slate-300">
            <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">ROYCE ADMIN</h2>
          <p className="text-slate-500 mb-6 text-sm">Enter password to access control panel</p>
          <input 
            type="password" 
            placeholder="Password (admin123)" 
            className="w-full border-2 border-slate-200 rounded-xl p-3 mb-4 text-center text-lg outline-none focus:border-slate-900"
            value={password}
            onChange={(e)=>setPassword(e.target.value)}
          />
          <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold mt-2 shadow-lg shadow-slate-900/20 active:scale-95 transition">Login</button>
        </form>
      </div>
    );
  }

  const totalRevenue = orders.filter(o=>o.status==='Completed').reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans pb-16 md:pb-0">
      {/* Sidebar (Desktop) */}
      <aside className="w-64 bg-slate-900 text-slate-400 flex-col hidden md:flex h-full">
        <div className="p-6 border-b border-slate-800">
          <h2 className="text-white font-bold text-xl">THE ROYCE</h2>
          <span className="text-xs bg-green-500/10 text-green-500 px-2 py-0.5 rounded mt-2 inline-block border border-green-500/20">● Live Panel</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <MenuLink icon={<LayoutDashboard size={18}/>} label="Dashboard" active={tab==='dashboard'} onClick={()=>setTab('dashboard')} />
          <MenuLink icon={<ListOrdered size={18}/>} label={`Orders (${orders.filter(o=>o.status==='Pending').length} New)`} active={tab==='orders'} onClick={()=>setTab('orders')} />
          <MenuLink icon={<Package size={18}/>} label="Products" active={tab==='products'} onClick={()=>setTab('products')} />
          <MenuLink icon={<Users size={18}/>} label="Customers" active={tab==='users'} onClick={()=>setTab('users')} />
          <MenuLink icon={<Settings size={18}/>} label="Store Settings" active={tab==='settings'} onClick={()=>setTab('settings')} />
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={()=>{setIsLoggedIn(false); setPassword("");}} className="flex items-center gap-2 text-red-400 w-full px-4 py-2 hover:bg-slate-800 rounded-lg text-sm font-medium"><LogOut size={16}/> Logout</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Topbar */}
        <header className="bg-white border-b h-16 flex items-center justify-between px-4 md:px-8 shadow-sm z-10">
          <h2 className="font-bold text-lg capitalize">{tab}</h2>
          <div className="flex items-center gap-3">
            <button className="p-2 bg-slate-100 text-slate-600 rounded-full" onClick={refreshData}><Search size={18}/></button>
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">R</div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* DASHBOARD TAB */}
          {tab === 'dashboard' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard title="Total Revenue" value={`৳${totalRevenue}`} subtitle="From completed orders" icon={<TrendingUp size={20} className="text-green-600"/>} color="green"/>
                <StatCard title="Pending Orders" value={orders.filter(o=>o.status==='Pending').length} subtitle="Needs action" icon={<ListOrdered size={20} className="text-orange-600"/>} color="orange"/>
                <StatCard title="Total Products" value={products.length} subtitle="In store" icon={<Package size={20} className="text-blue-600"/>} color="blue"/>
                <StatCard title="Total Customers" value={users.length} subtitle="Registered" icon={<Users size={20} className="text-purple-600"/>} color="purple"/>
              </div>
              
              <div className="bg-white p-4 md:p-6 rounded-xl border border-slate-200 shadow-sm">
                 <h3 className="font-bold mb-4 border-b pb-2">Recent Orders</h3>
                 {orders.slice(0,5).map(o => (
                   <div key={o.id} className="flex justify-between items-center py-2 border-b last:border-0 text-sm">
                     <div><p className="font-bold">{o.customer}</p><p className="text-xs text-slate-500">#{o.id} • {o.date}</p></div>
                     <div className="text-right"><p className="font-bold text-slate-800">৳{o.total}</p><span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${o.status==='Pending'?'bg-orange-100 text-orange-700': o.status==='Completed'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{o.status}</span></div>
                   </div>
                 ))}
                 <button onClick={()=>setTab('orders')} className="w-full text-center text-sm font-bold text-blue-600 mt-4 pt-2 border-t">View All Orders</button>
              </div>
            </div>
          )}

          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn">
              {orders.length === 0 && <div className="text-center py-20 text-slate-400">No orders yet. Start marketing!</div>}
              {orders.map(order => (
                <div key={order.id} className="bg-white p-4 md:p-5 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-4 border-b pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-slate-100 px-2 py-1 rounded text-xs font-mono font-bold text-slate-600">#{order.id}</span>
                        <span className="text-xs text-slate-400">{order.date}</span>
                      </div>
                      <h4 className="font-bold text-lg">{order.customer}</h4>
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-1"><Phone size={14}/> {order.phone}</p>
                      
                      <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">
                        <p className="text-slate-700 font-medium flex items-start gap-2"><MapPin size={16} className="mt-0.5 text-slate-400 shrink-0"/> {order.address}</p>
                        <div className="mt-2 pt-2 border-t border-slate-200 flex justify-between">
                          <span className="text-xs font-bold uppercase text-slate-500">Payment: {order.payment}</span>
                          {order.trxId && <span className="text-xs font-bold text-pink-600">TrxID: {order.trxId}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-row md:flex-col justify-between items-end gap-2">
                       <p className="font-black text-xl text-orange-600">৳{order.total}</p>
                       <select 
                         className={`text-sm font-bold p-2 rounded-lg border outline-none ${order.status==='Pending'?'bg-orange-50 text-orange-700 border-orange-200': order.status==='Completed'?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`}
                         value={order.status}
                         onChange={(e)=>updateOrderStatus(order.id, e.target.value)}
                       >
                         <option value="Pending">Pending</option>
                         <option value="Processing">Processing</option>
                         <option value="Completed">Completed</option>
                         <option value="Cancelled">Cancelled</option>
                       </select>
                    </div>
                  </div>

                  {/* Order Items */}
                  <div>
                    <h5 className="text-xs font-bold uppercase text-slate-400 mb-2">Ordered Items</h5>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-center text-sm bg-slate-50 px-3 py-2 rounded">
                          <div className="flex items-center gap-3">
                            <img src={item.images[0]} className="w-8 h-8 rounded object-cover" />
                            <span className="font-medium">{item.qty}x {item.name}</span>
                          </div>
                          <span className="font-bold">৳{item.price * item.qty}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <div className="max-w-5xl mx-auto animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Product Catalog</h2>
                <button onClick={() => setEditingProduct({ name: '', price: '', originalPrice: '', category: 'Gadgets', details: '', warranty: '', badge: '', images: [''] })} className="bg-slate-900 text-white px-4 py-2 rounded-lg font-bold text-sm flex gap-2 items-center shadow-lg"><Plus size={16}/> Add New</button>
              </div>

              {/* Product Edit Modal */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                      <h3 className="font-bold text-lg">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                      <button onClick={()=>setEditingProduct(null)} className="p-1 hover:bg-slate-100 rounded-full"><X size={20}/></button>
                    </div>
                    <form onSubmit={saveProduct} className="p-4 space-y-4">
                      <div><label className="text-xs font-bold text-slate-500">Product Name</label><input required className="w-full border p-2.5 rounded-lg" value={editingProduct.name} onChange={e=>setEditingProduct({...editingProduct, name:e.target.value})}/></div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-bold text-slate-500">Sale Price (৳)</label><input required type="number" className="w-full border p-2.5 rounded-lg" value={editingProduct.price} onChange={e=>setEditingProduct({...editingProduct, price:e.target.value})}/></div>
                        <div><label className="text-xs font-bold text-slate-500">Regular Price (৳)</label><input required type="number" className="w-full border p-2.5 rounded-lg" value={editingProduct.originalPrice} onChange={e=>setEditingProduct({...editingProduct, originalPrice:e.target.value})}/></div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div><label className="text-xs font-bold text-slate-500">Category</label><input required className="w-full border p-2.5 rounded-lg" value={editingProduct.category} onChange={e=>setEditingProduct({...editingProduct, category:e.target.value})}/></div>
                        <div><label className="text-xs font-bold text-slate-500">Badge (Optional)</label><input placeholder="e.g. HOT SALE" className="w-full border p-2.5 rounded-lg" value={editingProduct.badge} onChange={e=>setEditingProduct({...editingProduct, badge:e.target.value})}/></div>
                      </div>
                      <div><label className="text-xs font-bold text-slate-500">Image URL</label><input required placeholder="https://..." className="w-full border p-2.5 rounded-lg" value={editingProduct.images[0]} onChange={e=>setEditingProduct({...editingProduct, images:[e.target.value]})}/></div>
                      <div><label className="text-xs font-bold text-slate-500">Short Details/Specs</label><textarea required className="w-full border p-2.5 rounded-lg" rows="2" value={editingProduct.details} onChange={e=>setEditingProduct({...editingProduct, details:e.target.value})}/></div>
                      <div><label className="text-xs font-bold text-slate-500">Warranty Info</label><input required className="w-full border p-2.5 rounded-lg" value={editingProduct.warranty} onChange={e=>setEditingProduct({...editingProduct, warranty:e.target.value})}/></div>
                      
                      <div className="pt-4 border-t"><button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Save Product</button></div>
                    </form>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white rounded-xl border p-3 flex gap-4 shadow-sm relative">
                    <img src={p.images[0]} className="w-20 h-20 rounded-lg bg-slate-50 object-cover"/>
                    <div className="flex-1 py-1">
                      <h4 className="font-bold text-sm line-clamp-1">{p.name}</h4>
                      <p className="text-orange-600 font-bold text-sm mb-1">৳{p.price}</p>
                      <p className="text-xs text-slate-500">{p.category}</p>
                    </div>
                    <div className="flex flex-col gap-2 justify-center">
                      <button onClick={()=>setEditingProduct(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"><Edit size={16}/></button>
                      <button onClick={()=>deleteProduct(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"><Trash size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {tab === 'users' && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <h2 className="text-xl font-bold mb-6">Registered Customers</h2>
              <div className="bg-white rounded-xl border overflow-hidden">
                {users.length === 0 ? <p className="p-8 text-center text-slate-500">No users registered yet.</p> : 
                  users.map((u, i) => (
                    <div key={i} className="p-4 border-b last:border-0 flex justify-between items-center hover:bg-slate-50">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center font-bold text-slate-600">{u.name?.charAt(0) || 'U'}</div>
                        <div>
                          <p className="font-bold text-sm">{u.name}</p>
                          <p className="text-xs text-slate-500">{u.phone}</p>
                        </div>
                      </div>
                      <div className="text-right text-xs text-slate-500">
                        <p>{u.district}</p>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === 'settings' && (
            <div className="max-w-2xl mx-auto animate-fadeIn">
              <div className="bg-white p-6 md:p-8 rounded-2xl border shadow-sm">
                 <h2 className="text-2xl font-bold mb-6 border-b pb-4">Store Configuration</h2>
                 <form onSubmit={saveConfig} className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Store Name (Logo Text)</label>
                      <input className="w-full border-2 p-3 rounded-xl outline-none focus:border-slate-900" value={config.shopName || "THE ROYCE"} onChange={e=>setConfig({...config, shopName: e.target.value})} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Delivery Charge (৳)</label>
                        <input type="number" className="w-full border-2 p-3 rounded-xl outline-none focus:border-slate-900" value={config.deliveryCharge || 130} onChange={e=>setConfig({...config, deliveryCharge: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Currency Symbol</label>
                        <input className="w-full border-2 p-3 rounded-xl outline-none focus:border-slate-900" value={config.currency || "৳"} onChange={e=>setConfig({...config, currency: e.target.value})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Bkash/Nagad Number</label>
                      <input className="w-full border-2 p-3 rounded-xl outline-none focus:border-slate-900" value={config.bkash || ""} onChange={e=>setConfig({...config, bkash: e.target.value})} placeholder="e.g. 017XXXXXXXX" />
                      <p className="text-xs text-slate-500 mt-1">This number will be shown to customers during checkout.</p>
                    </div>
                    <div className="pt-4 mt-4 border-t">
                      <button type="submit" className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-800 transition"><Save size={18}/> Save Settings</button>
                    </div>
                 </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Mobile Bottom Nav for Admin */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t flex justify-between px-2 pb-safe z-40">
        <MobileNav icon={<LayoutDashboard/>} label="Dash" active={tab==='dashboard'} onClick={()=>setTab('dashboard')} />
        <MobileNav icon={<ListOrdered/>} label="Orders" active={tab==='orders'} onClick={()=>setTab('orders')} />
        <MobileNav icon={<Package/>} label="Products" active={tab==='products'} onClick={()=>setTab('products')} />
        <MobileNav icon={<Settings/>} label="Settings" active={tab==='settings'} onClick={()=>setTab('settings')} />
      </div>
    </div>
  );
}

function MenuLink({ icon, label, active, onClick }) {
  return <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition text-sm font-bold ${active ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/20' : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'}`}>{icon} {label}</button>;
}

function MobileNav({ icon, label, active, onClick }) {
  return <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center py-3 gap-1 ${active ? 'text-slate-900' : 'text-slate-400'}`}>{icon} <span className="text-[10px] font-bold">{label}</span></button>;
}

function StatCard({ title, value, subtitle, icon, color }) {
  const colors = { green: "bg-green-50 text-green-600", orange: "bg-orange-50 text-orange-600", blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600" };
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2 rounded-lg ${colors[color]}`}>{icon}</div>
      </div>
      <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
      <h3 className="text-2xl font-black text-slate-800">{value}</h3>
      {subtitle && <p className="text-[10px] text-slate-400 mt-1">{subtitle}</p>}
    </div>
  );
}


