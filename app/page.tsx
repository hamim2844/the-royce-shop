// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc } from "firebase/firestore";
import { 
  ShoppingCart, X, Phone, MapPin, CheckCircle, Star, 
  ChevronLeft, Search, Home, Grid, User, Heart, Edit3, Trash2, 
  ArrowRight, ShieldCheck
} from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState({ 
    shopName: "THE ROYCE", currency: "৳", deliveryCharge: 130, 
    heroTitle: "Premium Tech Sale", heroSubtitle: "Discover the best gadgets", heroBadge: "TRENDING",
    heroImage: "https://images.unsplash.com/photo-1550009158-9ff169c66284?w=800",
    whatsapp: "8801700000000"
  });
  const [loadingProducts, setLoadingProducts] = useState(true);

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

  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="font-sans text-slate-800 bg-[#f8f9fc] min-h-screen pb-24 selection:bg-slate-900 selection:text-white">
      {/* Modern Glassmorphism Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-slate-200/50">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          {view !== 'home' ? (
            <button onClick={() => setView('home')} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition"><ChevronLeft size={20}/></button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-gradient-to-br from-slate-900 to-slate-700 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-md">R</div>
              <span className="font-black text-xl tracking-tight text-slate-900">{config.shopName || 'ROYCE'}</span>
            </div>
          )}
          
          <div className="flex items-center gap-3">
            {view === 'home' && (
              <button onClick={() => document.getElementById('searchInput').focus()} className="p-2 text-slate-500 hover:text-slate-900 transition"><Search size={22}/></button>
            )}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-slate-800 bg-slate-100 rounded-full hover:bg-slate-200 transition">
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-white">{cart.reduce((a,b)=>a+b.qty,0)}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        {view === 'home' && (
          <div className="animate-fadeIn">
            {/* Search Bar section */}
            <div className="px-5 pt-4 pb-2">
               <div className="relative">
                 <input id="searchInput" className="w-full bg-white border border-slate-200/80 rounded-2xl py-3.5 pl-12 pr-4 text-sm outline-none focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all" placeholder="What are you looking for?" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                 <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
               </div>
            </div>

            {/* Premium Hero Banner */}
            {!searchTerm && (
              <div className="px-5 py-4">
                <div className="bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden shadow-2xl shadow-slate-900/20 h-48 flex flex-col justify-center">
                  <div className="relative z-10 w-2/3">
                    {config.heroBadge && <span className="inline-block bg-white/20 text-[10px] font-bold px-2.5 py-1 rounded-lg backdrop-blur-md uppercase tracking-wider mb-2">{config.heroBadge}</span>}
                    <h2 className="text-2xl font-black mb-1.5 leading-tight">{config.heroTitle || "New Collection"}</h2>
                    <p className="text-slate-300 text-xs font-medium">{config.heroSubtitle}</p>
                    <button className="mt-4 bg-white text-slate-900 px-5 py-2 rounded-full text-xs font-bold flex items-center gap-1 hover:bg-slate-100 transition">Shop Now <ArrowRight size={14}/></button>
                  </div>
                  {config.heroImage && <img src={config.heroImage} className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-60 mix-blend-overlay pointer-events-none" />}
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/60 to-transparent pointer-events-none"></div>
                </div>
              </div>
            )}

            {/* Category Chips */}
            {!searchTerm && categories.length > 1 && (
              <div className="px-5 py-2 flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {categories.map(cat => (
                  <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200'}`}>
                    {cat}
                  </button>
                ))}
              </div>
            )}
            
            <div className="px-5 pt-4">
              <div className="flex justify-between items-end mb-4">
                <h3 className="font-black text-lg">{searchTerm ? 'Search Results' : 'Featured Products'}</h3>
                {!searchTerm && <span className="text-xs font-bold text-orange-600 cursor-pointer">View All</span>}
              </div>

              {loadingProducts ? (
                <div className="flex flex-col items-center justify-center py-20 text-slate-400"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin mb-3"></div><p className="text-sm font-medium">Loading...</p></div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-20 text-slate-400 bg-white rounded-3xl border border-dashed border-slate-300 mx-2"><Search size={40} className="mx-auto mb-3 opacity-20"/><p className="font-medium text-sm">No products found.</p></div>
              ) : (
                <div className="grid grid-cols-2 gap-4 pb-4">
                  {filteredProducts.map(product => {
                    const isWishlisted = wishlist.some(i => i.id === product.id);
                    return (
                      <div key={product.id} className="bg-white rounded-3xl p-3 border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative group flex flex-col h-full">
                        <button onClick={() => toggleWishlist(product)} className="absolute top-3 right-3 z-20 w-8 h-8 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center shadow-sm active:scale-90 transition"><Heart size={16} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : "text-slate-400"} /></button>
                        
                        <div onClick={() => { setSelectedProduct(product); setView('details'); window.scrollTo(0,0); }} className="aspect-square bg-slate-50/50 rounded-2xl mb-3 overflow-hidden relative cursor-pointer p-2 flex items-center justify-center">
                          <img src={product.images?.[0] || 'https://via.placeholder.com/300'} className="w-full h-full object-contain mix-blend-multiply drop-shadow-sm transition-transform group-hover:scale-105" />
                          {product.badge && <span className="absolute bottom-2 left-2 bg-slate-900 text-white text-[9px] font-black px-2 py-1 rounded-lg shadow-md tracking-wider uppercase">{product.badge}</span>}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between px-1">
                          <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-snug cursor-pointer mb-2" onClick={() => { setSelectedProduct(product); setView('details'); }}>{product.name}</h3>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              <span className="text-lg font-black text-slate-900">{config.currency || '৳'}{product.price}</span>
                              {product.originalPrice && <p className="text-[10px] text-slate-400 line-through -mt-1">{config.currency || '৳'}{product.originalPrice}</p>}
                            </div>
                            <button onClick={() => addToCart(product, true)} className="w-8 h-8 bg-slate-900 text-white rounded-full flex items-center justify-center active:scale-90 transition shadow-lg"><ShoppingCart size={14}/></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Modern Product Details */}
        {view === 'details' && selectedProduct && (
          <div className="animate-slideInRight bg-white min-h-screen">
            <div className="relative bg-slate-100">
               <div className="w-full aspect-square overflow-hidden relative flex items-center justify-center p-8">
                 <img src={selectedProduct.images?.[0] || 'https://via.placeholder.com/600'} className="w-full h-full object-contain mix-blend-multiply drop-shadow-xl" />
               </div>
               <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white rounded-t-[3rem]"></div>
            </div>

            <div className="px-6 pb-32 bg-white relative">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-2xl font-black text-slate-900 leading-tight pr-4">{selectedProduct.name}</h1>
                <button onClick={() => toggleWishlist(selectedProduct)} className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center shrink-0"><Heart size={20} fill={wishlist.some(i => i.id === selectedProduct.id) ? "#ef4444" : "none"} className={wishlist.some(i => i.id === selectedProduct.id) ? "text-red-500" : "text-slate-400"}/></button>
              </div>
              
              <div className="flex items-center gap-3 mb-6">
                 <div className="bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-100 flex items-center gap-1.5"><Star size={14} className="text-orange-500" fill="currentColor"/><span className="text-sm font-bold text-orange-700">4.9</span></div>
                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{selectedProduct.category}</span>
              </div>

              <div className="flex items-end mb-8">
                <span className="text-4xl font-black text-slate-900 tracking-tight">{config.currency || '৳'}{selectedProduct.price}</span>
                {selectedProduct.originalPrice && <span className="text-lg text-slate-400 line-through ml-3 mb-1 font-medium">{config.currency || '৳'}{selectedProduct.originalPrice}</span>}
              </div>

              <h3 className="font-black text-lg mb-3">Description</h3>
              <p className="text-slate-600 text-sm leading-relaxed mb-6">{selectedProduct.details}</p>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center shrink-0"><ShieldCheck size={24} className="text-blue-600"/></div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Warranty Policy</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedProduct.warranty || 'Check physical product on delivery.'}</p>
                </div>
              </div>
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-200/50 z-30 pb-safe">
              <div className="max-w-md mx-auto flex gap-3">
                <button onClick={() => addToCart(selectedProduct)} className="w-14 h-14 rounded-2xl border-2 border-slate-200 flex items-center justify-center text-slate-700 active:bg-slate-50 transition shrink-0"><ShoppingCart size={24}/></button>
                <button onClick={() => addToCart(selectedProduct, true)} className="flex-1 h-14 rounded-2xl bg-slate-900 text-white font-black text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition">Buy Now</button>
              </div>
            </div>
          </div>
        )}
        
        {view === 'account' && <AccountView user={user} setUser={setUser} />}
      </main>

      {/* Floating App Bottom Navigation */}
      {view !== 'details' && (
        <div className="fixed bottom-4 left-4 right-4 z-30 md:hidden">
          <div className="bg-slate-900/95 backdrop-blur-md rounded-3xl p-2 flex justify-between items-center shadow-2xl shadow-slate-900/30 max-w-sm mx-auto border border-white/10">
            <button onClick={()=>setView('home')} className={`flex-1 flex flex-col items-center justify-center h-12 rounded-2xl transition-all ${view==='home'?'bg-white/10 text-white':'text-slate-400 hover:text-white'}`}><Home size={20}/></button>
            <button onClick={()=>{}} className={`flex-1 flex flex-col items-center justify-center h-12 rounded-2xl transition-all text-slate-400 opacity-50`}><Grid size={20}/></button>
            
            <div className="relative -top-6 w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/40 cursor-pointer border-4 border-[#f8f9fc] active:scale-90 transition" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={22} />
              {cart.length > 0 && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-white rounded-full border border-orange-500"></span>}
            </div>
            
            <button onClick={()=>{}} className={`flex-1 flex flex-col items-center justify-center h-12 rounded-2xl transition-all text-slate-400 opacity-50`}><Heart size={20}/></button>
            <button onClick={()=>setView('account')} className={`flex-1 flex flex-col items-center justify-center h-12 rounded-2xl transition-all ${view==='account'?'bg-white/10 text-white':'text-slate-400 hover:text-white'}`}><User size={20}/></button>
          </div>
        </div>
      )}

      {isCartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={() => setIsCartOpen(false)} user={user} config={config} db={db} setView={setView} />}
    </div>
  );
}

// --- User Profile View ---
function AccountView({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(!user);
  const [form, setForm] = useState(user || { name: '', phone: '', division: '', district: '', address: '' });

  const handleSave = () => {
    if(!form.name || !form.phone || !form.address) return alert("Please fill all details.");
    setUser(form); setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="px-5 pt-4 animate-fadeIn">
        <div className="bg-white p-6 rounded-3xl shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-100">
          <h2 className="font-black text-2xl text-center mb-6 text-slate-800">My Details</h2>
          <div className="space-y-4">
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Full Name</label><input placeholder="e.g. Hasan Mahmud" className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-slate-300 transition" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Phone Number</label><input type="tel" placeholder="017XXXXXXXX" className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-slate-300 transition" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Division</label><select className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-2xl outline-none font-bold text-slate-800" value={form.division} onChange={e=>setForm({...form, division:e.target.value, district:''})}><option value="">Select</option>{Object.keys(LOCATION_DATA).map(d=><option key={d}>{d}</option>)}</select></div>
              <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">District</label><select className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-2xl outline-none font-bold text-slate-800" value={form.district} onChange={e=>setForm({...form, district:e.target.value})} disabled={!form.division}><option value="">Select</option>{form.division && Object.keys(LOCATION_DATA[form.division]).map(d=><option key={d}>{d}</option>)}</select></div>
            </div>
            <div><label className="text-[10px] font-black text-slate-400 uppercase tracking-wider ml-1">Full Address</label><textarea placeholder="House, Road, Area..." className="w-full bg-slate-50 border border-slate-100 p-3.5 rounded-2xl outline-none font-bold text-slate-800 focus:bg-white focus:border-slate-300 transition" rows="3" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/></div>
            <button onClick={handleSave} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-xl shadow-slate-900/20 active:scale-95 transition text-lg mt-2">Save Profile</button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="px-5 pt-4 space-y-4 animate-fadeIn">
      <div className="bg-slate-900 text-white p-8 rounded-[2rem] relative overflow-hidden shadow-2xl shadow-slate-900/20">
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-2xl mb-5 backdrop-blur-md border border-white/20 shadow-inner">{user.name.charAt(0)}</div>
          <h2 className="text-3xl font-black mb-1">{user.name}</h2>
          <p className="text-slate-300 font-medium flex items-center gap-2 mb-6"><Phone size={16}/> {user.phone}</p>
          <div className="bg-white/10 p-5 rounded-2xl text-sm border border-white/10 backdrop-blur-md">
             <p className="opacity-70 text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 mb-2"><MapPin size={12}/> Delivery Address</p>
             <p className="font-bold leading-relaxed">{user.address}, {user.district}, {user.division}</p>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-48 h-48 bg-orange-500 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
      </div>
      <button onClick={()=>setIsEditing(true)} className="w-full bg-white border-2 border-slate-200 py-4 rounded-2xl font-black flex justify-center items-center gap-2 text-slate-800 active:bg-slate-50 transition shadow-sm"><Edit3 size={18}/> Edit Information</button>
    </div>
  );
}

// --- Cart Drawer ---
function CartDrawer({ cart, setCart, onClose, user, config, db, setView }) {
  const [loading, setLoading] = useState(false);
  
  const subtotal = cart.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 1)), 0);
  const delivery = Number(config.deliveryCharge) || 0;
  const total = subtotal + delivery;

  const handleCheckout = async () => {
    if(!user) { alert("Please save your delivery info first!"); onClose(); setView('account'); return; }
    setLoading(true);
    try {
      const orderData = { customer: user.name, phone: user.phone, address: `${user.address}, ${user.district}`, items: cart, total: total, status: 'Pending', date: new Date().toLocaleString() };
      await addDoc(collection(db, "orders"), orderData);

      let msg = `*New Order from Website* 🚀\n\n*Name:* ${user.name}\n*Phone:* ${user.phone}\n*Address:* ${user.address}, ${user.district}\n\n`;
      cart.forEach(item => { msg += `▪ ${item.qty}x ${item.name} (৳${item.price * item.qty})\n`; });
      msg += `\nSubtotal: ৳${subtotal}\nDelivery: ৳${delivery}\n*Total Bill: ৳${total}*`;

      const whatsappNum = config.whatsapp || "8801700000000";
      const waUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`;

      setCart([]); onClose();
      window.open(waUrl, '_blank');
    } catch (e) { alert("Error placing order."); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#f8f9fc] h-full flex flex-col animate-slideInRight shadow-2xl rounded-l-[2rem] overflow-hidden">
        
        <div className="bg-white px-6 py-5 flex justify-between items-center shadow-sm z-10 border-b border-slate-100">
          <h3 className="font-black text-xl text-slate-900">Your Cart <span className="text-slate-400 font-medium text-sm ml-1">({cart.length})</span></h3>
          <button onClick={onClose} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition"><X size={20} className="text-slate-600"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-5">
               <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm"><ShoppingCart size={40} className="text-slate-300"/></div>
               <p className="font-bold text-slate-500">Your cart is empty.</p>
               <button onClick={onClose} className="px-8 py-3 bg-slate-900 rounded-full text-white font-black text-sm shadow-lg shadow-slate-900/20 active:scale-95 transition">Start Shopping</button>
             </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex gap-4 shadow-sm relative pr-10">
                  <div className="w-24 h-24 bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center p-2"><img src={item.images[0]} className="w-full h-full object-contain mix-blend-multiply"/></div>
                  <div className="flex-1 flex flex-col justify-center py-1">
                    <h4 className="font-bold text-sm text-slate-800 line-clamp-2 leading-tight mb-2">{item.name}</h4>
                    <p className="text-orange-600 font-black text-lg">{config.currency || '৳'}{item.price}</p>
                    <div className="flex gap-4 items-center bg-slate-50 rounded-lg px-2 py-1 w-max mt-2 border border-slate-100">
                      <button className="text-slate-500 font-bold text-lg px-2 active:scale-90" onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:Math.max(1,i.qty-1)}:i))}>-</button>
                      <span className="text-sm font-black w-4 text-center text-slate-800">{item.qty}</span>
                      <button className="text-slate-500 font-bold text-lg px-2 active:scale-90" onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i))}>+</button>
                    </div>
                  </div>
                  <button onClick={()=>setCart(cart.filter(i=>i.id!==item.id))} className="absolute top-4 right-4 text-slate-300 hover:text-red-500 bg-white"><Trash2 size={18}/></button>
                </div>
              ))}

              {user ? (
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm mt-6">
                  <div className="flex justify-between items-center mb-3"><p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Deliver To:</p><span onClick={()=>{onClose(); setView('account')}} className="text-[10px] font-black uppercase tracking-wider text-blue-600 cursor-pointer bg-blue-50 px-2 py-1 rounded-md">Edit</span></div>
                  <p className="font-black text-slate-800">{user.name}</p>
                  <p className="text-xs font-bold text-slate-500 font-mono mt-1 mb-2">{user.phone}</p>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium bg-slate-50 p-2 rounded-lg">{user.address}, {user.district}</p>
                </div>
              ) : (
                <div className="bg-orange-50 border-2 border-dashed border-orange-200 p-5 rounded-2xl text-center mt-6">
                  <p className="text-sm text-orange-800 font-bold mb-3">Add delivery details to checkout.</p>
                  <button onClick={()=>{onClose(); setView('account');}} className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg shadow-orange-600/20 text-sm active:scale-95 transition">Add Address</button>
                </div>
              )}
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] z-10 rounded-tl-3xl">
            <div className="space-y-3 mb-5 text-sm font-bold text-slate-500">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-slate-800">{config.currency || '৳'}{subtotal}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span className="text-slate-800">{config.currency || '৳'}{delivery}</span></div>
            </div>
            <div className="flex justify-between mb-6 font-black text-2xl text-slate-900 border-t border-dashed border-slate-200 pt-4">
              <span>Total</span><span className="text-orange-600">{config.currency || '৳'}{total}</span>
            </div>
            <button onClick={handleCheckout} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? 'Processing...' : <><ShoppingCart size={20}/> Confirm Order</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


