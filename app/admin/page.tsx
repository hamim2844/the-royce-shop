// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { LayoutDashboard, Package, Settings, LogOut, Plus, Edit, Trash, ListOrdered, Lock, X } from 'lucide-react';

const firebaseConfig = {
  apiKey: "AIzaSyDAQc-aLbQ_GPyuAU4hHmy8CIjLdNHVDtM",
  authDomain: "theroyce-d0527.firebaseapp.com",
  projectId: "theroyce-d0527",
  storageBucket: "theroyce-d0527.firebasestorage.app",
  messagingSenderId: "203103255148",
  appId: "1:203103255148:web:2f1a2862aa0e823aca7649"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function AdminPanel() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState('orders');
  
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState({ shopName: "THE ROYCE", deliveryCharge: 130 });
  const [editingProduct, setEditingProduct] = useState(null);

  useEffect(() => {
    if(isLoggedIn) {
      const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => setOrders(snap.docs.map(d=>({id: d.id, ...d.data()}))));
      const unsubProducts = onSnapshot(collection(db, "products"), (snap) => setProducts(snap.docs.map(d=>({id: d.id, ...d.data()}))));
      const unsubConfig = onSnapshot(collection(db, "config"), (snap) => { if(!snap.empty) setConfig({ id: snap.docs[0].id, ...snap.docs[0].data()}); });
      return () => { unsubOrders(); unsubProducts(); unsubConfig(); };
    }
  }, [isLoggedIn]);

  const handleLogin = (e) => { e.preventDefault(); if(password === "admin123") setIsLoggedIn(true); else alert("Wrong Password!"); };

  const saveProduct = async (e) => {
    e.preventDefault();
    if(editingProduct.id) {
      await updateDoc(doc(db, "products", editingProduct.id), editingProduct);
    } else {
      await addDoc(collection(db, "products"), editingProduct);
    }
    setEditingProduct(null);
  };

  const delProduct = async (id) => { if(confirm("Delete?")) await deleteDoc(doc(db, "products", id)); };

  const updateOrderStatus = async (id, status) => { await updateDoc(doc(db, "orders", id), { status }); };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-sm text-center">
          <Lock className="mx-auto mb-4" size={32} />
          <h2 className="text-2xl font-black mb-4">ADMIN LOGIN</h2>
          <input type="password" placeholder="admin123" className="w-full border p-3 rounded mb-4 text-center" value={password} onChange={(e)=>setPassword(e.target.value)} />
          <button className="w-full bg-slate-900 text-white py-3 rounded font-bold">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <main className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="bg-white border-b p-4 flex justify-between items-center z-10">
          <h2 className="font-bold text-lg">Royce Admin - {tab}</h2>
          <div className="flex gap-2">
            <button onClick={()=>setTab('orders')} className={`px-3 py-1 rounded ${tab==='orders'?'bg-slate-900 text-white':'bg-slate-200'}`}>Orders</button>
            <button onClick={()=>setTab('products')} className={`px-3 py-1 rounded ${tab==='products'?'bg-slate-900 text-white':'bg-slate-200'}`}>Products</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {tab === 'orders' && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {orders.map(order => (
                <div key={order.id} className="bg-white p-4 rounded-xl border shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold">{order.customer}</h4>
                      <p className="text-sm">{order.phone}</p>
                      <p className="text-xs text-slate-500">{order.address}</p>
                    </div>
                    <div className="text-right">
                       <p className="font-bold text-lg">৳{order.total}</p>
                       <select className="text-xs border p-1 rounded font-bold mt-1" value={order.status} onChange={(e)=>updateOrderStatus(order.id, e.target.value)}>
                         <option>Pending</option><option>Completed</option><option>Cancelled</option>
                       </select>
                    </div>
                  </div>
                  <div className="text-xs bg-slate-50 p-2 rounded">{order.items.map((it,i) => <div key={i}>{it.qty}x {it.name}</div>)}</div>
                </div>
              ))}
            </div>
          )}

          {tab === 'products' && (
            <div className="max-w-4xl mx-auto">
              <button onClick={() => setEditingProduct({ name: '', price: '', originalPrice: '', category: 'Gadgets', details: '', warranty: '', badge: '', images: [''] })} className="mb-4 bg-slate-900 text-white px-4 py-2 rounded flex items-center gap-2"><Plus size={16}/> Add Product</button>
              {editingProduct && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
                  <div className="bg-white w-full max-w-md rounded-xl p-4 shadow-2xl">
                    <form onSubmit={saveProduct} className="space-y-3">
                      <input required placeholder="Product Name" className="w-full border p-2 rounded" value={editingProduct.name} onChange={e=>setEditingProduct({...editingProduct, name:e.target.value})}/>
                      <div className="flex gap-2"><input required placeholder="Price" className="w-full border p-2 rounded" value={editingProduct.price} onChange={e=>setEditingProduct({...editingProduct, price:e.target.value})}/><input placeholder="Original Price" className="w-full border p-2 rounded" value={editingProduct.originalPrice} onChange={e=>setEditingProduct({...editingProduct, originalPrice:e.target.value})}/></div>
                      <input required placeholder="Image URL" className="w-full border p-2 rounded" value={editingProduct.images[0]} onChange={e=>setEditingProduct({...editingProduct, images:[e.target.value]})}/>
                      <textarea placeholder="Details" className="w-full border p-2 rounded" value={editingProduct.details} onChange={e=>setEditingProduct({...editingProduct, details:e.target.value})}/>
                      <div className="flex gap-2"><button type="button" onClick={()=>setEditingProduct(null)} className="flex-1 bg-red-100 text-red-600 py-2 rounded">Cancel</button><button type="submit" className="flex-1 bg-slate-900 text-white py-2 rounded">Save</button></div>
                    </form>
                  </div>
                </div>
              )}
              <div className="space-y-3">
                {products.map(p => (
                  <div key={p.id} className="bg-white p-3 rounded-xl border flex justify-between items-center">
                    <div className="flex gap-3"><img src={p.images[0]} className="w-12 h-12 rounded object-cover"/><div className="font-bold text-sm">{p.name} <br/><span className="text-orange-600">৳{p.price}</span></div></div>
                    <div className="flex gap-2"><button onClick={()=>setEditingProduct(p)} className="p-2 border rounded"><Edit size={14}/></button><button onClick={()=>delProduct(p.id)} className="p-2 border rounded text-red-500"><Trash size={14}/></button></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

