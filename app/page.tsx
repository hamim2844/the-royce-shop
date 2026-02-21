// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc } from "firebase/firestore";
import { 
  ShoppingCart, X, Phone, MapPin, CheckCircle, Star, 
  ChevronLeft, ChevronRight, Truck, ShieldCheck, 
  Search, Home, Grid, User, Heart, LogOut, Edit3, Trash2
} from 'lucide-react';

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

const LOCATION_DATA = {
  "Dhaka": {"Dhaka": ["Savar", "Dhamrai", "Keraniganj", "Nawabganj", "Adabor", "Uttara", "Mirpur", "Dhanmondi"]},
  "Rajshahi": {"Natore": ["Natore Sadar", "Singra", "Baraigram", "Lalpur", "Bagatipara", "Gurudaspur", "Naldanga"], "Rajshahi": ["Boalia", "Motihar", "Rajpara", "Paba", "Bagha"]}
};

export default function Website() {
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // Real-time Database States
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState({ shopName: "THE ROYCE", currency: "৳", deliveryCharge: 130 });
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Load Data from Firebase
  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, "products"), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoadingProducts(false);
    });
    const unsubConfig = onSnapshot(collection(db, "config"), (snapshot) => {
      if(!snapshot.empty) setConfig(snapshot.docs[0].data());
    });

    if (typeof window !== 'undefined') {
      const savedCart = localStorage.getItem('royce_cart');
      const savedUser = localStorage.getItem('royce_user');
      const savedWishlist = localStorage.getItem('royce_wishlist');
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    }
    return () => { unsubProducts(); unsubConfig(); };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('royce_cart', JSON.stringify(cart));
      localStorage.setItem('royce_wishlist', JSON.stringify(wishlist));
      if(user) localStorage.setItem('royce_user', JSON.stringify(user));
    }
  }, [cart, wishlist, user]);

  const addToCart = (product, openDrawer = false) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    else setCart([...cart, { ...product, qty: 1 }]);
    if(openDrawer) setIsCartOpen(true);
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.find(i => i.id === product.id);
    if (exists) setWishlist(wishlist.filter(i => i.id !== product.id));
    else setWishlist([...wishlist, product]);
  };

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen pb-20 selection:bg-orange-500 selection:text-white">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          {view !== 'home' ? <button onClick={() => setView('home')}><ChevronLeft size={24}/></button> : <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">R</div>}
          <div className="flex-1 text-center font-bold text-lg text-slate-800 uppercase tracking-widest">{config.shopName}</div>
          <button onClick={() => setIsCartOpen(true)} className="relative">
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cart.reduce((a,b)=>a+b.qty,0)}</span>}
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-4">
        {view === 'home' && (
          <div className="animate-fadeIn">
            <div className="bg-slate-900 rounded-2xl p-6 text-white mb-6 relative overflow-hidden">
              <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded">NEW ARRIVAL</span>
              <h2 className="text-2xl font-black mt-2 mb-1">Super Sale 2026</h2>
              <p className="text-slate-300 text-xs mb-3">Exclusive Tech Gadgets</p>
            </div>
            
            {loadingProducts ? (
              <div className="text-center py-10 text-slate-400">Loading products from database...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-10 text-slate-400">No products available. Add from Admin Panel.</div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-4">
                {products.map(product => {
                  const isWishlisted = wishlist.some(i => i.id === product.id);
                  return (
                    <div key={product.id} className="bg-white rounded-xl p-3 border shadow-sm relative">
                      <button onClick={() => toggleWishlist(product)} className="absolute top-2 right-2 z-20 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm"><Heart size={14} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : "text-slate-400"} /></button>
                      <div onClick={() => { setSelectedProduct(product); setView('details'); window.scrollTo(0,0); }} className="aspect-square bg-slate-50 rounded-lg mb-3 overflow-hidden relative cursor-pointer">
                        <img src={product.images?.[0] || 'https://via.placeholder.com/300'} className="w-full h-full object-cover" />
                        {product.badge && <span className="absolute top-2 left-2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{product.badge}</span>}
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1 cursor-pointer" onClick={() => { setSelectedProduct(product); setView('details'); }}>{product.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3"><span className="text-base font-black text-orange-600">{config.currency}{product.price}</span><span className="text-xs text-slate-400 line-through">{config.currency}{product.originalPrice}</span></div>
                      <button onClick={() => addToCart(product, true)} className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold text-xs active:scale-95 transition">Buy Now</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        
        {view === 'details' && selectedProduct && (
          <div className="animate-fadeIn pb-10">
            <img src={selectedProduct.images?.[0] || 'https://via.placeholder.com/600'} className="w-full aspect-square object-cover rounded-2xl bg-slate-100 mb-4" />
            <h1 className="text-2xl font-black text-slate-900 mb-2">{selectedProduct.name}</h1>
            <div className="bg-slate-50 p-4 rounded-xl border mb-6 flex items-end"><span className="text-3xl font-black text-orange-600">{config.currency}{selectedProduct.price}</span><span className="text-lg text-slate-400 line-through ml-3 mb-1">{config.currency}{selectedProduct.originalPrice}</span></div>
            <div className="space-y-3 mb-8">
              <div className="flex gap-3 text-sm text-slate-600 border-b pb-3"><CheckCircle size={18} className="text-green-600"/> <span>{selectedProduct.details}</span></div>
              <div className="flex gap-3 text-sm text-slate-600"><ShieldCheck size={18} className="text-blue-600"/> <span>{selectedProduct.warranty || 'No warranty details provided'}</span></div>
            </div>
            <div className="fixed bottom-[60px] left-0 right-0 p-3 bg-white/90 border-t flex gap-3 z-20 md:hidden">
              <button onClick={() => addToCart(selectedProduct)} className="flex-1 py-3 rounded-xl border-2 font-bold text-sm">Add to Cart</button>
              <button onClick={() => addToCart(selectedProduct, true)} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg">Buy Now</button>
            </div>
          </div>
        )}
        {view === 'account' && <AccountView user={user} setUser={setUser} />}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-6 flex justify-between items-center z-30 md:hidden pb-safe">
        <button onClick={()=>setView('home')} className={`flex flex-col items-center gap-1 w-16 pt-1 ${view==='home'?'text-orange-600':'text-slate-400'}`}><Home size={20}/><span className="text-[10px] font-bold">Home</span></button>
        <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white -mt-8 border-4 border-slate-50 shadow-lg cursor-pointer" onClick={() => setIsCartOpen(true)}><ShoppingCart size={22} /></div>
        <button onClick={()=>setView('account')} className={`flex flex-col items-center gap-1 w-16 pt-1 ${view==='account'?'text-orange-600':'text-slate-400'}`}><User size={20}/><span className="text-[10px] font-bold">Account</span></button>
      </div>

      {isCartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={() => setIsCartOpen(false)} user={user} config={config} db={db} setView={setView} />}
    </div>
  );
}

function AccountView({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(!user);
  const [form, setForm] = useState(user || { name: '', phone: '', division: '', district: '', address: '' });

  const handleSave = () => {
    if(!form.name || !form.phone || !form.division) return alert("Please fill details");
    setUser(form); setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-2xl shadow-sm border space-y-4 animate-fadeIn">
        <h2 className="font-bold text-center mb-4 text-xl">My Profile</h2>
        <input placeholder="Full Name" className="w-full border-b py-2 outline-none" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Phone Number" className="w-full border-b py-2 outline-none" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
        <select className="w-full border-b py-2" value={form.division} onChange={e=>setForm({...form, division:e.target.value, district:''})}><option value="">Select Division</option>{Object.keys(LOCATION_DATA).map(d=><option key={d}>{d}</option>)}</select>
        <select className="w-full border-b py-2" value={form.district} onChange={e=>setForm({...form, district:e.target.value})} disabled={!form.division}><option value="">Select District</option>{form.division && Object.keys(LOCATION_DATA[form.division]).map(d=><option key={d}>{d}</option>)}</select>
        <textarea placeholder="Detailed Address" className="w-full border-b py-2 outline-none" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/>
        <button onClick={handleSave} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-4">Save Profile</button>
      </div>
    )
  }
  return (
    <div className="space-y-4 animate-fadeIn">
      <div className="bg-slate-900 text-white p-6 rounded-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold">{user.name}</h2>
          <p>{user.phone}</p>
          <div className="mt-4 bg-white/10 p-3 rounded-lg text-sm">
             <p className="opacity-70 text-xs">Delivery Address:</p>
             <p>{user.address}, {user.district}</p>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500 rounded-full blur-3xl opacity-30"></div>
      </div>
      <button onClick={()=>setIsEditing(true)} className="w-full bg-white border py-3 rounded-xl font-bold flex justify-center items-center gap-2"><Edit3 size={18}/> Edit Profile</button>
    </div>
  );
}

function CartDrawer({ cart, setCart, onClose, user, config, db, setView }) {
  const [loading, setLoading] = useState(false);
  const total = cart.reduce((a,b)=>a+(b.price*b.qty),0) + parseInt(config.deliveryCharge || 0);

  const handleCheckout = async () => {
    if(!user) {
      alert("Please create an account to order!");
      onClose(); setView('account'); return;
    }
    setLoading(true);
    try {
      const orderData = { 
        customer: user.name, 
        phone: user.phone, 
        address: `${user.address}, ${user.district}`, 
        items: cart, 
        total: total, 
        status: 'Pending', 
        date: new Date().toLocaleString() 
      };
      await addDoc(collection(db, "orders"), orderData);
      alert("🎉 Order Placed Successfully! We will contact you soon.");
      setCart([]); 
      onClose();
    } catch (e) {
      alert("Error placing order. Please check internet and try again.");
      console.error(e);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-50 h-full flex flex-col animate-slideInRight">
        <div className="bg-white p-4 flex justify-between items-center shadow-sm"><h3 className="font-bold">My Cart ({cart.length})</h3><button onClick={onClose}><X/></button></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 && <div className="text-center py-10 text-slate-400">Cart is empty</div>}
          {cart.map(item => (
            <div key={item.id} className="bg-white p-3 rounded-xl border flex gap-3 shadow-sm">
              <img src={item.images[0]} className="w-16 h-16 rounded-lg object-cover bg-slate-50"/>
              <div className="flex-1">
                <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                <div className="flex justify-between items-center mt-1">
                  <p className="text-orange-600 font-bold">{config.currency}{item.price}</p>
                  <div className="flex gap-3 bg-slate-50 rounded px-2 py-1"><button onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:Math.max(1,i.qty-1)}:i))}>-</button><span className="text-xs font-bold">{item.qty}</span><button onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i))}>+</button></div>
                </div>
              </div>
              <button onClick={()=>setCart(cart.filter(i=>i.id!==item.id))} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}
          {cart.length > 0 && user && (
            <div className="bg-white p-4 rounded-xl border">
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">Deliver To:</p>
              <p className="font-bold">{user.name} ({user.phone})</p>
              <p className="text-xs text-slate-600">{user.address}, {user.district}</p>
            </div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="p-4 bg-white border-t">
            <div className="flex justify-between mb-4 font-black text-lg"><span>Total Bill:</span><span>{config.currency}{total}</span></div>
            <button onClick={handleCheckout} disabled={loading} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold shadow-lg disabled:opacity-50">{loading ? 'Processing...' : `Confirm Order`}</button>
          </div>
        )}
      </div>
    </div>
  );
}


