// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { LayoutDashboard, Package, Settings, LogOut, Plus, Edit, Trash, ListOrdered, Lock, X, Image as ImageIcon } from 'lucide-react';

// --- Firebase Setup ---
const firebaseConfig = {
  apiKey: "AIzaSyDAQc-aLbQ_GPyuAU4hHmy8CIjLdNHVDtM",
  authDomain: "theroyce-d0527.firebaseapp.com",
  projectId: "theroyce-d0527",
  storageBucket: "theroyce-d0527.firebasestorage.app",
  messagingSenderId: "203103255148",
  appId: "1:203103255148:web:2f1a2862aa0e823aca7649"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState('orders');
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Customization Configuration State
  const [config, setConfig] = useState({ 
    shopName: "THE ROYCE", deliveryCharge: 130, currency: "৳",
    heroTitle: "Super Gadget Sale", heroSubtitle: "Up to 50% Off", heroBadge: "NEW ARRIVAL",
    heroImage: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400",
    whatsapp: "8801700000000"
  });
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

  const saveProduct = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Clean data before saving to prevent NaN
      const cleanData = {
        ...editingProduct,
        price: Number(editingProduct.price) || 0,
        originalPrice: Number(editingProduct.originalPrice) || 0,
      };

      if(editingProduct.id) {
        await updateDoc(doc(db, "products", editingProduct.id), cleanData);
      } else {
        await addDoc(collection(db, "products"), cleanData);
      }
      setEditingProduct(null);
    } catch (error) {
      alert("Error saving product.");
    }
    setIsSaving(false);
  };

  const delProduct = async (id) => { 
    if(confirm("Delete this product permanently?")) await deleteDoc(doc(db, "products", id)); 
  };

  const updateOrderStatus = async (id, status) => { 
    await updateDoc(doc(db, "orders", id), { status }); 
  };

  const delOrder = async (id) => {
    if(confirm("Are you sure you want to delete this order?")) await deleteDoc(doc(db, "orders", id));
  }

  const saveConfig = async (e) => {
    e.preventDefault();
    try {
      if(configId) {
        await updateDoc(doc(db, "config", configId), config);
      } else {
        await addDoc(collection(db, "config"), config);
      }
      alert("Website Customization Saved! It is live now.");
    } catch (err) {
      alert("Error updating settings.");
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg"><Lock className="text-white" size={32} /></div>
          <h2 className="text-2xl font-black mb-2 text-slate-800">ROYCE ADMIN</h2>
          <p className="text-slate-500 text-sm mb-8 font-medium">Enter password to manage store</p>
          <input type="password" placeholder="Password (admin123)" className="w-full bg-slate-50 border-2 border-slate-100 focus:border-slate-900 outline-none p-4 rounded-xl mb-6 text-center text-lg font-bold tracking-widest transition" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold active:scale-95 transition shadow-lg text-lg">Login to Panel</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans pb-16 md:pb-0">
      <main className="flex-1 flex flex-col h-full overflow-hidden max-w-3xl mx-auto w-full border-x bg-white">
        {/* Header */}
        <header className="bg-white border-b px-6 h-16 flex justify-between items-center z-10 sticky top-0">
          <h2 className="font-black text-xl text-slate-800 tracking-tight flex items-center gap-2"><div className="w-6 h-6 bg-slate-900 rounded text-white text-[10px] flex items-center justify-center">R</div> Admin</h2>
          <button onClick={()=>{setIsLoggedIn(false); setPassword("");}} className="text-slate-500 font-bold text-sm hover:text-red-500 transition p-2"><LogOut size={20}/></button>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          
          {/* ORDERS TAB */}
          {tab === 'orders' && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="font-black text-2xl mb-6 text-slate-800">Customer Orders <span className="text-slate-400 text-lg">({orders.length})</span></h2>
              {orders.length === 0 && <div className="text-center py-16 bg-white border-2 border-dashed rounded-3xl"><Package className="mx-auto mb-4 text-slate-300" size={48}/><p className="text-slate-500 font-medium">No orders yet.</p></div>}
              
              {orders.map(order => {
                const safeTotal = Number(order.total) || 0;
                return (
                  <div key={order.id} className="bg-white p-5 rounded-2xl border shadow-[0_2px_10px_rgba(0,0,0,0.02)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-slate-50 rounded-bl-full z-0"></div>
                    <div className="flex justify-between items-start mb-4 border-b pb-4 relative z-10">
                      <div>
                        <h4 className="font-bold text-lg text-slate-800">{order.customer || 'Unknown'}</h4>
                        <p className="text-sm font-bold text-slate-600 font-mono mt-1">{order.phone || 'No Number'}</p>
                        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed max-w-[200px]">{order.address}</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">{order.date}</p>
                      </div>
                      <div className="text-right flex flex-col items-end">
                         <p className="font-black text-2xl text-orange-600">{config.currency || '৳'}{safeTotal.toLocaleString()}</p>
                         <select 
                           className={`text-xs border-2 p-1.5 rounded-lg font-bold mt-2 outline-none cursor-pointer transition ${order.status==='Pending'?'bg-orange-50 text-orange-700 border-orange-200': order.status==='Completed'?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`} 
                           value={order.status || 'Pending'} 
                           onChange={(e)=>updateOrderStatus(order.id, e.target.value)}
                         >
                           <option value="Pending">Pending ⏳</option>
                           <option value="Completed">Completed ✅</option>
                           <option value="Cancelled">Cancelled ❌</option>
                         </select>
                         <button onClick={()=>delOrder(order.id)} className="text-[10px] text-red-400 font-bold mt-3 hover:underline">Delete Order</button>
                      </div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-2 relative z-10">
                      <p className="text-[10px] uppercase font-black text-slate-400 mb-2">Order Items:</p>
                      {order.items?.length > 0 ? order.items.map((it,i) => (
                        <div key={i} className="text-sm font-medium flex justify-between text-slate-700">
                          <span>{it.qty || 1}x {it.name || 'Unknown Item'}</span>
                          <span className="font-bold">{config.currency || '৳'}{(Number(it.price)||0) * (Number(it.qty)||1)}</span>
                        </div>
                      )) : <p className="text-xs text-red-400">Error reading items</p>}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* PRODUCTS TAB */}
          {tab === 'products' && (
            <div className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-black text-2xl text-slate-800">My Products</h2>
                <button onClick={() => setEditingProduct({ name: '', price: '', originalPrice: '', category: 'Gadgets', details: '', warranty: '', badge: '', images: [''] })} className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition"><Plus size={18}/> New</button>
              </div>

              {/* Product Modal - Mobile Friendly Bottom Sheet Style */}
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 p-0 sm:p-4 animate-fadeIn">
                  <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
                    <div className="p-5 border-b flex justify-between items-center shrink-0">
                       <h3 className="font-black text-xl">{editingProduct.id ? 'Edit Product' : 'Add New Product'}</h3>
                       <button onClick={()=>setEditingProduct(null)} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full transition"><X size={20}/></button>
                    </div>
                    
                    <div className="p-5 overflow-y-auto space-y-4 flex-1">
                      <div><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Product Name</label><input required placeholder="e.g. Smart Watch Pro" className="w-full bg-slate-50 border p-3 rounded-xl mt-1 outline-none font-medium focus:border-slate-400" value={editingProduct.name} onChange={e=>setEditingProduct({...editingProduct, name:e.target.value})}/></div>
                      <div className="flex gap-3">
                        <div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Sale Price (৳)</label><input required type="number" placeholder="1000" className="w-full bg-slate-50 border p-3 rounded-xl mt-1 outline-none font-bold text-orange-600 focus:border-slate-400" value={editingProduct.price} onChange={e=>setEditingProduct({...editingProduct, price:e.target.value})}/></div>
                        <div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Old Price (৳)</label><input type="number" placeholder="1500" className="w-full bg-slate-50 border p-3 rounded-xl mt-1 outline-none font-medium focus:border-slate-400" value={editingProduct.originalPrice} onChange={e=>setEditingProduct({...editingProduct, originalPrice:e.target.value})}/></div>
                      </div>
                      <div className="flex gap-3">
                        <div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Category</label><input required placeholder="Gadgets" className="w-full bg-slate-50 border p-3 rounded-xl mt-1 outline-none font-medium focus:border-slate-400" value={editingProduct.category} onChange={e=>setEditingProduct({...editingProduct, category:e.target.value})}/></div>
                        <div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Badge</label><input placeholder="e.g. HOT SALE" className="w-full bg-slate-50 border p-3 rounded-xl mt-1 outline-none font-medium focus:border-slate-400" value={editingProduct.badge} onChange={e=>setEditingProduct({...editingProduct, badge:e.target.value})}/></div>
                      </div>
                      
                      <div>
                        <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Image URL (Internet Link)</label>
                        <div className="flex gap-2 items-center mt-1">
                          {editingProduct.images[0] ? <img src={editingProduct.images[0]} className="w-12 h-12 rounded-lg object-cover border" onError={(e)=>{e.target.src='https://via.placeholder.com/50?text=Error'}}/> : <div className="w-12 h-12 rounded-lg border bg-slate-100 flex items-center justify-center"><ImageIcon size={20} className="text-slate-300"/></div>}
                          <input required placeholder="https://..." className="flex-1 bg-slate-50 border p-3 rounded-xl outline-none font-medium text-sm focus:border-slate-400" value={editingProduct.images[0]} onChange={e=>setEditingProduct({...editingProduct, images:[e.target.value]})}/>
                        </div>
                      </div>
                      
                      <div><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Short Description / Specs</label><textarea required placeholder="Features of the product..." className="w-full bg-slate-50 border p-3 rounded-xl mt-1 outline-none font-medium text-sm focus:border-slate-400" rows="3" value={editingProduct.details} onChange={e=>setEditingProduct({...editingProduct, details:e.target.value})}/></div>
                      <div><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Warranty Details</label><input placeholder="e.g. 7 Days Replacement" className="w-full bg-slate-50 border p-3 rounded-xl mt-1 outline-none font-medium focus:border-slate-400" value={editingProduct.warranty} onChange={e=>setEditingProduct({...editingProduct, warranty:e.target.value})}/></div>
                    </div>

                    <div className="p-4 border-t shrink-0 bg-white">
                       <button onClick={saveProduct} disabled={isSaving} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg shadow-lg disabled:opacity-50 active:scale-95 transition">{isSaving ? 'Saving...' : 'Save Product'}</button>
                    </div>
                  </div>
                </div>
              )}

              {products.length === 0 && <div className="text-center py-16 bg-white border-2 border-dashed rounded-3xl"><Package className="mx-auto mb-4 text-slate-300" size={48}/><p className="text-slate-500 font-medium">Store is empty. Add a product!</p></div>}
              
              <div className="space-y-3 pb-20">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-2xl border flex gap-4 shadow-[0_2px_8px_rgba(0,0,0,0.02)] items-center">
                    <img src={p.images?.[0] || 'https://via.placeholder.com/150'} className="w-20 h-20 rounded-xl object-cover bg-slate-50 border"/>
                    <div className="flex-1 py-1">
                      <h4 className="font-bold text-sm line-clamp-2 leading-tight pr-2">{p.name}</h4>
                      <p className="text-orange-600 font-black text-lg mt-1">{config.currency || '৳'}{Number(p.price)||0}</p>
                    </div>
                    <div className="flex flex-col gap-2 border-l pl-3 py-1">
                      <button onClick={()=>setEditingProduct(p)} className="p-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 transition"><Edit size={18}/></button>
                      <button onClick={()=>delProduct(p.id)} className="p-2.5 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition"><Trash size={18}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMIZATION SETTINGS TAB */}
          {tab === 'settings' && (
            <div className="animate-fadeIn">
              <h2 className="font-black text-2xl mb-6 text-slate-800">Customization</h2>
              
              <form onSubmit={saveConfig} className="space-y-6 pb-20">
                 {/* Basic Setup */}
                 <div className="bg-white p-6 rounded-3xl border shadow-sm">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Settings size={18} className="text-slate-400"/> General Settings</h3>
                   <div className="space-y-4">
                     <div><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Store Name</label><input className="w-full bg-slate-50 border p-3 rounded-xl mt-1 font-bold" value={config.shopName || ""} onChange={e=>setConfig({...config, shopName: e.target.value})} /></div>
                     <div className="flex gap-4">
                       <div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Delivery Charge</label><input type="number" className="w-full bg-slate-50 border p-3 rounded-xl mt-1 font-bold" value={config.deliveryCharge || 0} onChange={e=>setConfig({...config, deliveryCharge: parseInt(e.target.value)})} /></div>
                       <div className="flex-1"><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Currency Symbol</label><input className="w-full bg-slate-50 border p-3 rounded-xl mt-1 font-bold" value={config.currency || "৳"} onChange={e=>setConfig({...config, currency: e.target.value})} /></div>
                     </div>
                     <div>
                       <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">WhatsApp Order Number</label>
                       <input className="w-full bg-slate-50 border p-3 rounded-xl mt-1 font-bold text-green-600" value={config.whatsapp || ""} onChange={e=>setConfig({...config, whatsapp: e.target.value})} placeholder="e.g. 8801700000000" />
                       <p className="text-[10px] text-slate-400 mt-1 ml-1">Include country code without '+' (e.g. 880)</p>
                     </div>
                   </div>
                 </div>

                 {/* Hero Banner Setup */}
                 <div className="bg-white p-6 rounded-3xl border shadow-sm">
                   <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><ImageIcon size={18} className="text-slate-400"/> Home Page Banner</h3>
                   <div className="space-y-4">
                     <div><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Main Heading</label><input className="w-full bg-slate-50 border p-3 rounded-xl mt-1 font-bold text-lg" value={config.heroTitle || ""} onChange={e=>setConfig({...config, heroTitle: e.target.value})} /></div>
                     <div><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Sub Title</label><input className="w-full bg-slate-50 border p-3 rounded-xl mt-1 font-medium" value={config.heroSubtitle || ""} onChange={e=>setConfig({...config, heroSubtitle: e.target.value})} /></div>
                     <div><label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Small Badge Text</label><input placeholder="e.g. FLASH SALE" className="w-full bg-slate-50 border p-3 rounded-xl mt-1 font-bold" value={config.heroBadge || ""} onChange={e=>setConfig({...config, heroBadge: e.target.value})} /></div>
                     <div>
                       <label className="text-[10px] uppercase font-bold text-slate-400 ml-1">Banner Image Link</label>
                       {config.heroImage && <img src={config.heroImage} className="h-20 w-full object-cover rounded-lg border mt-1 mb-2 opacity-80"/>}
                       <input placeholder="https://..." className="w-full bg-slate-50 border p-3 rounded-xl font-medium text-sm" value={config.heroImage || ""} onChange={e=>setConfig({...config, heroImage: e.target.value})} />
                     </div>
                   </div>
                 </div>

                 <div className="sticky bottom-20 z-10">
                   <button type="submit" className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/30 active:scale-95 transition">Update Live Website</button>
                 </div>
              </form>
            </div>
          )}

        </div>
      </main>

      {/* Modern Floating Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe md:hidden">
        <div className="flex justify-around items-center px-2 py-2 max-w-md mx-auto relative">
          
          <button onClick={()=>setTab('orders')} className={`flex-1 flex flex-col items-center justify-center h-14 rounded-2xl transition-all ${tab==='orders'?'text-slate-900 bg-slate-100':'text-slate-400 hover:text-slate-600'}`}>
            <div className="relative"><ListOrdered size={24}/>{orders.filter(o=>o.status==='Pending').length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}</div>
            <span className="text-[10px] font-bold mt-1">Orders</span>
          </button>
          
          <button onClick={()=>setTab('products')} className={`flex-1 flex flex-col items-center justify-center h-14 rounded-2xl transition-all ${tab==='products'?'text-slate-900 bg-slate-100':'text-slate-400 hover:text-slate-600'}`}>
            <Package size={24}/><span className="text-[10px] font-bold mt-1">Products</span>
          </button>
          
          <button onClick={()=>setTab('settings')} className={`flex-1 flex flex-col items-center justify-center h-14 rounded-2xl transition-all ${tab==='settings'?'text-slate-900 bg-slate-100':'text-slate-400 hover:text-slate-600'}`}>
            <Settings size={24}/><span className="text-[10px] font-bold mt-1">Store Setup</span>
          </button>
          
        </div>
      </div>
    </div>
  );
}


