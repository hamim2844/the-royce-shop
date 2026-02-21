// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { LayoutDashboard, Package, Settings, LogOut, Plus, Edit, Trash, ListOrdered, Lock, X } from 'lucide-react';

// --- Firebase Setup (Safe Initialization) ---
const firebaseConfig = {
  apiKey: "AIzaSyDAQc-aLbQ_GPyuAU4hHmy8CIjLdNHVDtM",
  authDomain: "theroyce-d0527.firebaseapp.com",
  projectId: "theroyce-d0527",
  storageBucket: "theroyce-d0527.firebasestorage.app",
  messagingSenderId: "203103255148",
  appId: "1:203103255148:web:2f1a2862aa0e823aca7649",
  measurementId: "G-99TT8KT4Q8"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState('orders');
  
  // Real-time Database States
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState({ shopName: "THE ROYCE", deliveryCharge: 130 });
  const [configId, setConfigId] = useState(null);
  
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if(isLoggedIn) {
      const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => setOrders(snap.docs.map(d=>({id: d.id, ...d.data()}))));
      const unsubProducts = onSnapshot(collection(db, "products"), (snap) => setProducts(snap.docs.map(d=>({id: d.id, ...d.data()}))));
      const unsubConfig = onSnapshot(collection(db, "config"), (snap) => { 
        if(!snap.empty) {
          setConfig(snap.docs[0].data());
          setConfigId(snap.docs[0].id);
        }
      });
      return () => { unsubOrders(); unsubProducts(); unsubConfig(); };
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => { e.preventDefault(); if(password === "admin123") setIsLoggedIn(true); else alert("Wrong Password!"); };

  // --- Product Management ---
  const saveProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if(editingProduct.id) {
        await updateDoc(doc(db, "products", editingProduct.id), editingProduct);
        alert("Product Updated!");
      } else {
        await addDoc(collection(db, "products"), editingProduct);
        alert("Product Added Successfully!");
      }
      setEditingProduct(null);
    } catch (error) {
      alert("Error saving product: " + error.message);
    }
    setIsSaving(false);
  };

  const delProduct = async (id) => { 
    if(confirm("Are you sure you want to delete this product?")) {
      await deleteDoc(doc(db, "products", id)); 
    }
  };

  // --- Order Management ---
  const updateOrderStatus = async (id, status) => { 
    await updateDoc(doc(db, "orders", id), { status }); 
  };

  // --- Config Management ---
  const saveConfig = async (e) => {
    e.preventDefault();
    try {
      if(configId) {
        await updateDoc(doc(db, "config", configId), config);
      } else {
        await addDoc(collection(db, "config"), config);
      }
      alert("Settings Saved! Website updated instantly.");
    } catch (err) {
      alert("Error updating settings.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6"><Lock className="text-white" size={24} /></div>
          <h2 className="text-2xl font-black mb-2 text-slate-800">ROYCE ADMIN</h2>
          <p className="text-slate-500 text-sm mb-6">Enter password to access control panel</p>
          <input type="password" placeholder="Password (admin123)" className="w-full border-2 border-slate-200 focus:border-slate-900 outline-none p-3 rounded-xl mb-4 text-center text-lg" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold active:scale-95 transition shadow-lg">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans pb-16 md:pb-0">
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="bg-white border-b px-4 h-14 flex justify-between items-center z-10 shadow-sm">
          <h2 className="font-bold text-lg text-slate-800 capitalize">Royce Admin</h2>
          <button onClick={()=>{setIsLoggedIn(false); setPassword("");}} className="text-red-500 font-bold text-sm bg-red-50 px-3 py-1.5 rounded-lg flex gap-2 items-center"><LogOut size={16}/> Logout</button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          
          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="space-y-4 max-w-4xl mx-auto animate-fadeIn">
              <h2 className="font-bold text-xl mb-4">Customer Orders ({orders.length})</h2>
              {orders.length === 0 && <p className="text-center text-slate-400 py-10 border-2 border-dashed rounded-xl">No orders yet.</p>}
              
              {orders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  <div className="flex justify-between items-start mb-3 border-b pb-3">
                    <div>
                      <h4 className="font-bold text-lg">{order.customer}</h4>
                      <p className="text-sm font-medium text-slate-600 flex items-center gap-1 mt-1">{order.phone}</p>
                      <p className="text-xs text-slate-500 mt-1">{order.address}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{order.date}</p>
                    </div>
                    <div className="text-right flex flex-col items-end">
                       <p className="font-black text-xl text-orange-600">৳{order.total}</p>
                       <select 
                         className={`text-xs border p-1.5 rounded-lg font-bold mt-2 outline-none ${order.status==='Pending'?'bg-orange-50 text-orange-700 border-orange-200': order.status==='Completed'?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`} 
                         value={order.status} 
                         onChange={(e)=>updateOrderStatus(order.id, e.target.value)}
                       >
                         <option>Pending</option><option>Completed</option><option>Cancelled</option>
                       </select>
                    </div>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-400">Order Items:</p>
                    {order.items?.map((it,i) => (
                      <div key={i} className="text-sm font-medium flex justify-between">
                        <span>{it.qty}x {it.name}</span>
                        <span>৳{it.price * it.qty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <div className="max-w-4xl mx-auto animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl">My Products ({products.length})</h2>
                <button onClick={() => setEditingProduct({ name: '', price: '', originalPrice: '', category: 'Gadgets', details: '', warranty: '', badge: '', images: [''] })} className="bg-slate-900 text-white px-4 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition"><Plus size={16}/> Add Product</button>
              </div>

              {/* Product Modal */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                  <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
                    <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center z-10">
                       <h3 className="font-bold text-lg">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                       <button onClick={()=>setEditingProduct(null)} className="p-1 hover:bg-slate-100 rounded-full"><X/></button>
                    </div>
                    <form onSubmit={saveProduct} className="p-4 space-y-4">
                      <div><label className="text-xs font-bold text-slate-500">Product Name</label><input required className="w-full border p-2.5 rounded-lg mt-1 outline-none" value={editingProduct.name} onChange={e=>setEditingProduct({...editingProduct, name:e.target.value})}/></div>
                      <div className="flex gap-3">
                        <div className="flex-1"><label className="text-xs font-bold text-slate-500">Sale Price (৳)</label><input required type="number" className="w-full border p-2.5 rounded-lg mt-1 outline-none" value={editingProduct.price} onChange={e=>setEditingProduct({...editingProduct, price:e.target.value})}/></div>
                        <div className="flex-1"><label className="text-xs font-bold text-slate-500">Regular Price</label><input type="number" className="w-full border p-2.5 rounded-lg mt-1 outline-none" value={editingProduct.originalPrice} onChange={e=>setEditingProduct({...editingProduct, originalPrice:e.target.value})}/></div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1"><label className="text-xs font-bold text-slate-500">Category</label><input required className="w-full border p-2.5 rounded-lg mt-1 outline-none" value={editingProduct.category} onChange={e=>setEditingProduct({...editingProduct, category:e.target.value})}/></div>
                        <div className="flex-1"><label className="text-xs font-bold text-slate-500">Badge (e.g. HOT)</label><input className="w-full border p-2.5 rounded-lg mt-1 outline-none" value={editingProduct.badge} onChange={e=>setEditingProduct({...editingProduct, badge:e.target.value})}/></div>
                      </div>
                      <div><label className="text-xs font-bold text-slate-500">Image URL (Internet Link)</label><input required placeholder="https://..." className="w-full border p-2.5 rounded-lg mt-1 outline-none" value={editingProduct.images[0]} onChange={e=>setEditingProduct({...editingProduct, images:[e.target.value]})}/></div>
                      <div><label className="text-xs font-bold text-slate-500">Details</label><textarea required className="w-full border p-2.5 rounded-lg mt-1 outline-none" rows="2" value={editingProduct.details} onChange={e=>setEditingProduct({...editingProduct, details:e.target.value})}/></div>
                      <div><label className="text-xs font-bold text-slate-500">Warranty</label><input className="w-full border p-2.5 rounded-lg mt-1 outline-none" value={editingProduct.warranty} onChange={e=>setEditingProduct({...editingProduct, warranty:e.target.value})}/></div>
                      
                      <button type="submit" disabled={isSaving} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold mt-4 shadow-lg disabled:opacity-50">{isSaving ? 'Saving...' : 'Save Product'}</button>
                    </form>
                  </div>
                </div>
              )}

              {products.length === 0 && <p className="text-center text-slate-400 py-10 border-2 border-dashed rounded-xl">No products. Click "Add Product" to start.</p>}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-xl border flex gap-4 shadow-sm items-center">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-16 h-16 rounded-lg object-cover bg-slate-50"/>
                    <div className="flex-1">
                      <h4 className="font-bold text-sm line-clamp-1">{p.name}</h4>
                      <p className="text-orange-600 font-bold text-sm">৳{p.price}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button onClick={()=>setEditingProduct(p)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition"><Edit size={16}/></button>
                      <button onClick={()=>delProduct(p.id)} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition"><Trash size={16}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {tab === 'settings' && (
            <div className="max-w-2xl mx-auto animate-fadeIn">
              <div className="bg-white p-6 rounded-2xl border shadow-sm">
                 <h2 className="text-xl font-bold mb-6 border-b pb-4">Store Settings</h2>
                 <form onSubmit={saveConfig} className="space-y-4">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Shop Name</label>
                      <input className="w-full border-2 p-3 rounded-xl outline-none focus:border-slate-900" value={config.shopName || ""} onChange={e=>setConfig({...config, shopName: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1">Delivery Charge (৳)</label>
                      <input type="number" className="w-full border-2 p-3 rounded-xl outline-none focus:border-slate-900" value={config.deliveryCharge || 0} onChange={e=>setConfig({...config, deliveryCharge: parseInt(e.target.value)})} />
                    </div>
                    <button type="submit" className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg mt-4">Save Configuration</button>
                 </form>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Admin Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around px-2 pb-safe z-40 md:hidden">
        <button onClick={()=>setTab('orders')} className={`flex-1 flex flex-col items-center py-3 gap-1 ${tab==='orders'?'text-slate-900':'text-slate-400'}`}><ListOrdered size={20}/><span className="text-[10px] font-bold">Orders</span></button>
        <button onClick={()=>setTab('products')} className={`flex-1 flex flex-col items-center py-3 gap-1 ${tab==='products'?'text-slate-900':'text-slate-400'}`}><Package size={20}/><span className="text-[10px] font-bold">Products</span></button>
        <button onClick={()=>setTab('settings')} className={`flex-1 flex flex-col items-center py-3 gap-1 ${tab==='settings'?'text-slate-900':'text-slate-400'}`}><Settings size={20}/><span className="text-[10px] font-bold">Settings</span></button>
      </div>
    </div>
  );
}


