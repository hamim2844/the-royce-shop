// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc } from "firebase/firestore";
import { 
  ShoppingCart, X, Phone, MapPin, CheckCircle, Star, 
  ChevronLeft, Search, Home, Grid, User, Heart, Edit3, Trash2, 
  ArrowRight, ShieldCheck, Map, CreditCard, ChevronDown, Share2, ArrowDownUp, CheckSquare, Square
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

// --- ALL 64 DISTRICTS OF BANGLADESH ---
const BD_LOCATIONS = {
  "Dhaka": ["Dhaka", "Faridpur", "Gazipur", "Gopalganj", "Kishoreganj", "Madaripur", "Manikganj", "Munshiganj", "Narayanganj", "Narsingdi", "Rajbari", "Shariatpur", "Tangail"],
  "Chattogram": ["Bandarban", "Brahmanbaria", "Chandpur", "Chattogram", "Comilla", "Cox's Bazar", "Feni", "Khagrachari", "Lakshmipur", "Noakhali", "Rangamati"],
  "Rajshahi": ["Bogura", "Joypurhat", "Naogaon", "Natore", "Chapainawabganj", "Pabna", "Rajshahi", "Sirajganj"],
  "Khulna": ["Bagerhat", "Chuadanga", "Jashore", "Jhenaidah", "Khulna", "Kushtia", "Magura", "Meherpur", "Narail", "Satkhira"],
  "Barishal": ["Barguna", "Barishal", "Bhola", "Jhalokati", "Patuakhali", "Pirojpur"],
  "Sylhet": ["Habiganj", "Moulvibazar", "Sunamganj", "Sylhet"],
  "Rangpur": ["Dinajpur", "Gaibandha", "Kurigram", "Lalmonirhat", "Nilphamari", "Panchagarh", "Rangpur", "Thakurgaon"],
  "Mymensingh": ["Jamalpur", "Mymensingh", "Netrokona", "Sherpur"]
};

export default function Website() {
  const [view, setView] = useState('home'); // home, details, wishlist, account
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [cart, setCart] = useState([]);
  const [selectedCartItems, setSelectedCartItems] = useState([]); // Stores IDs of selected items
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  // App States
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("default");
  const [toast, setToast] = useState(null); 
  
  // DB States
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState({ 
    shopName: "THE ROYCE", currency: "৳", deliveryCharge: 130, 
    heroTitle: "Premium Tech Drop", heroSubtitle: "Discover the latest innovations", heroBadge: "TRENDING",
    heroImage: "https://images.unsplash.com/photo-1550009158-9ff169c66284?w=800",
    whatsapp: "8801700000000"
  });
  const [loadingProducts, setLoadingProducts] = useState(true);

  // --- Custom Toast Notification ---
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

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
    // Auto-select newly added items to cart
    if(cart.length > 0) {
       const unselectedNewItems = cart.filter(c => !selectedCartItems.includes(c.id)).map(c => c.id);
       if(unselectedNewItems.length > 0) {
         setSelectedCartItems([...selectedCartItems, ...unselectedNewItems]);
       }
    }
  }, [cart, wishlist, user]);

  const addToCart = (product, openDrawer = false) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    
    if(!selectedCartItems.includes(product.id)){
      setSelectedCartItems([...selectedCartItems, product.id]);
    }
    
    showToast(`${product.name} added to cart!`);
    if(openDrawer) setIsCartOpen(true);
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.find(i => i.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter(i => i.id !== product.id));
      showToast("Removed from Wishlist");
    } else {
      setWishlist([...wishlist, product]);
      showToast("Added to Wishlist");
    }
  };

  // Processing Products (Search, Filter, Sort)
  const categories = ["All", ...new Set(products.map(p => p.category).filter(Boolean))];
  
  let displayedProducts = [...products];
  if (searchTerm) displayedProducts = displayedProducts.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));
  if (activeCategory !== "All") displayedProducts = displayedProducts.filter(p => p.category === activeCategory);
  if (sortBy === "price-low") displayedProducts.sort((a,b) => (Number(a.price)||0) - (Number(b.price)||0));
  if (sortBy === "price-high") displayedProducts.sort((a,b) => (Number(b.price)||0) - (Number(a.price)||0));

  const relatedProducts = selectedProduct ? products.filter(p => p.category === selectedProduct.category && p.id !== selectedProduct.id).slice(0,4) : [];

  return (
    <div className="font-sans text-white bg-[#0a0a0a] min-h-screen pb-24 selection:bg-orange-500 selection:text-white relative">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slideInDown">
          <div className="bg-[#121212] border border-zinc-700 text-white px-5 py-3 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.8)] flex items-center gap-2 font-bold text-sm">
            <CheckCircle size={18} className="text-orange-500"/> {toast}
          </div>
        </div>
      )}

      {/* Dark Glassmorphism Header */}
      <header className="sticky top-0 z-40 bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-zinc-800/80">
        <div className="max-w-md mx-auto px-5 py-4 flex items-center justify-between">
          {view !== 'home' ? (
            <button onClick={() => setView('home')} className="p-2 bg-zinc-900 rounded-full hover:bg-zinc-800 active:scale-90 transition border border-zinc-800"><ChevronLeft size={20} className="text-zinc-300"/></button>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center text-black font-black text-lg shadow-[0_0_15px_rgba(249,115,22,0.4)]">R</div>
              <span className="font-black text-xl tracking-widest text-white uppercase">{config.shopName || 'ROYCE'}</span>
            </div>
          )}
          
          <div className="flex items-center gap-4">
            {view === 'home' && (
              <button onClick={() => document.getElementById('searchInput').focus()} className="text-zinc-400 hover:text-white transition active:scale-90"><Search size={22}/></button>
            )}
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-zinc-300 hover:text-white transition active:scale-90 bg-zinc-900 rounded-full border border-zinc-800">
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-black border-2 border-[#0a0a0a]">{cart.reduce((a,b)=>a+b.qty,0)}</span>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-md mx-auto">
        
        {/* VIEW: HOME */}
        {view === 'home' && (
          <div className="animate-fadeIn">
            <div className="px-5 pt-5 pb-3">
               <div className="relative">
                 <input id="searchInput" className="w-full bg-zinc-900/60 border border-zinc-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-white placeholder-zinc-500 outline-none focus:border-orange-500/50 focus:bg-zinc-900 transition-all shadow-inner" placeholder="Search premium gadgets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                 <Search className="absolute left-4 top-3.5 text-zinc-500" size={18} />
               </div>
            </div>

            {!searchTerm && (
              <div className="px-5 py-2">
                <div className="bg-zinc-900 rounded-[2rem] p-6 text-white relative overflow-hidden border border-zinc-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] h-48 flex flex-col justify-center">
                  <div className="relative z-10 w-[70%]">
                    {config.heroBadge && <span className="inline-block bg-orange-500/10 text-orange-500 text-[9px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest mb-3 border border-orange-500/20">{config.heroBadge}</span>}
                    <h2 className="text-3xl font-black mb-1.5 leading-tight text-white tracking-tight">{config.heroTitle || "New Drop"}</h2>
                    <p className="text-zinc-400 text-xs font-medium">{config.heroSubtitle}</p>
                  </div>
                  {config.heroImage && <img src={config.heroImage} className="absolute right-0 top-0 h-full w-2/3 object-cover opacity-50 mix-blend-screen pointer-events-none mask-image-gradient" />}
                  <div className="absolute inset-0 bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-transparent pointer-events-none"></div>
                </div>
              </div>
            )}

            <div className="px-5 py-4 flex items-center justify-between gap-2 sticky top-[72px] z-30 bg-[#0a0a0a]/90 backdrop-blur-md">
               <div className="flex gap-2 overflow-x-auto scrollbar-hide flex-1 pr-4">
                 {categories.map(cat => (
                   <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-white text-black' : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'}`}>
                     {cat}
                   </button>
                 ))}
               </div>
               <div className="relative shrink-0">
                 <select className="appearance-none bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-bold py-2 pl-3 pr-8 rounded-xl outline-none focus:border-orange-500" value={sortBy} onChange={(e)=>setSortBy(e.target.value)}>
                   <option value="default">Sort By</option>
                   <option value="price-low">Price: Low-High</option>
                   <option value="price-high">Price: High-Low</option>
                 </select>
                 <ArrowDownUp size={12} className="absolute right-3 top-2.5 text-zinc-500 pointer-events-none"/>
               </div>
            </div>
            
            <div className="px-5 pt-2">
              {loadingProducts ? (
                <div className="flex flex-col items-center justify-center py-20 text-zinc-500"><div className="w-8 h-8 border-4 border-zinc-800 border-t-orange-500 rounded-full animate-spin mb-3"></div><p className="text-sm font-medium tracking-widest uppercase text-[10px]">Loading Catalog...</p></div>
              ) : displayedProducts.length === 0 ? (
                <div className="text-center py-20 text-zinc-500 bg-zinc-900/30 rounded-[2rem] border border-dashed border-zinc-800"><Search size={40} className="mx-auto mb-3 opacity-20"/><p className="font-medium text-sm">No items found.</p></div>
              ) : (
                <div className="grid grid-cols-2 gap-4 pb-4">
                  {displayedProducts.map(product => {
                    const isWishlisted = wishlist.some(i => i.id === product.id);
                    return (
                      <div key={product.id} className="bg-[#121212] rounded-3xl p-3.5 border border-zinc-800/80 relative group flex flex-col h-full hover:border-zinc-700 transition-colors shadow-lg">
                        <button onClick={() => toggleWishlist(product)} className="absolute top-4 right-4 z-20 w-8 h-8 bg-[#0a0a0a]/80 backdrop-blur-md rounded-full flex items-center justify-center border border-zinc-800 active:scale-90 transition"><Heart size={14} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-orange-500" : "text-zinc-400"} /></button>
                        
                        <div onClick={() => { setSelectedProduct(product); setView('details'); window.scrollTo(0,0); }} className="aspect-square bg-gradient-to-br from-zinc-800/50 to-zinc-900 rounded-2xl mb-4 overflow-hidden relative cursor-pointer p-4 flex items-center justify-center">
                          <img src={product.images?.[0] || 'https://via.placeholder.com/300'} className="w-full h-full object-contain drop-shadow-2xl transition-transform duration-700 group-hover:scale-110" />
                          {product.badge && <span className="absolute bottom-2 left-2 bg-white text-black text-[8px] font-black px-2 py-1 rounded-md shadow-md tracking-widest uppercase">{product.badge}</span>}
                        </div>
                        
                        <div className="flex-1 flex flex-col justify-between px-1">
                          <div className="mb-3">
                            <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">{product.category}</span>
                            <h3 className="font-bold text-zinc-100 text-sm line-clamp-2 leading-snug cursor-pointer mt-1" onClick={() => { setSelectedProduct(product); setView('details'); }}>{product.name}</h3>
                          </div>
                          
                          <div className="flex items-center justify-between mt-auto">
                            <div>
                              <span className="text-lg font-black text-white">{config.currency || '৳'}{product.price}</span>
                              {product.originalPrice && <p className="text-[10px] text-zinc-500 line-through -mt-1">{config.currency || '৳'}{product.originalPrice}</p>}
                            </div>
                            <button onClick={() => addToCart(product, false)} className="w-9 h-9 bg-zinc-800 text-white rounded-xl flex items-center justify-center active:scale-90 transition hover:bg-orange-500 hover:text-black border border-zinc-700"><ShoppingCart size={16}/></button>
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
        
        {/* VIEW: DETAILS */}
        {view === 'details' && selectedProduct && (
          <div className="animate-slideInRight bg-[#0a0a0a] min-h-screen">
            <div className="relative bg-[#121212] border-b border-zinc-800 rounded-b-[3rem] shadow-2xl">
               <div className="absolute top-4 right-4 flex gap-2 z-10">
                 <button onClick={() => { navigator.clipboard.writeText(`${window.location.href}`); showToast("Product link copied!"); }} className="w-10 h-10 bg-[#0a0a0a]/80 backdrop-blur-md rounded-full flex items-center justify-center border border-zinc-700 text-white active:scale-90"><Share2 size={16}/></button>
                 <button onClick={() => toggleWishlist(selectedProduct)} className="w-10 h-10 bg-[#0a0a0a]/80 backdrop-blur-md rounded-full flex items-center justify-center border border-zinc-700 active:scale-90"><Heart size={16} fill={wishlist.some(i => i.id === selectedProduct.id) ? "#f97316" : "none"} className={wishlist.some(i => i.id === selectedProduct.id) ? "text-orange-500" : "text-zinc-300"}/></button>
               </div>
               <div className="w-full aspect-[4/3] overflow-hidden relative flex items-center justify-center p-12">
                 <img src={selectedProduct.images?.[0] || 'https://via.placeholder.com/600'} className="w-full h-full object-contain drop-shadow-[0_30px_50px_rgba(0,0,0,0.6)] animate-fadeIn" />
               </div>
            </div>

            <div className="px-6 py-8 relative">
              <div className="flex items-center gap-3 mb-4">
                 <span className="bg-zinc-900 border border-zinc-800 text-zinc-300 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-widest">{selectedProduct.category}</span>
                 <div className="bg-orange-500/10 px-2 py-1 rounded-lg border border-orange-500/20 flex items-center gap-1"><Star size={12} className="text-orange-500" fill="currentColor"/><span className="text-xs font-black text-orange-500">4.9</span></div>
              </div>
              
              <h1 className="text-3xl font-black text-white leading-tight mb-4">{selectedProduct.name}</h1>

              <div className="flex items-end mb-8 bg-[#121212] p-5 rounded-3xl border border-zinc-800 w-max">
                <span className="text-4xl font-black text-orange-500 tracking-tight">{config.currency || '৳'}{selectedProduct.price}</span>
                {selectedProduct.originalPrice && <span className="text-lg text-zinc-500 line-through ml-3 mb-1 font-medium">{config.currency || '৳'}{selectedProduct.originalPrice}</span>}
              </div>

              <h3 className="font-black text-lg mb-4 text-white flex items-center gap-2">Details</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-8 bg-zinc-900/50 p-5 rounded-2xl border border-zinc-800">{selectedProduct.details}</p>

              <div className="bg-[#121212] p-5 rounded-2xl border border-zinc-800/80 flex items-center gap-4 mb-10">
                <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center shrink-0 border border-zinc-800"><ShieldCheck size={20} className="text-zinc-300"/></div>
                <div>
                  <h4 className="font-bold text-sm text-white">Warranty Policy</h4>
                  <p className="text-xs text-zinc-500 mt-1">{selectedProduct.warranty || 'Check physical product on delivery.'}</p>
                </div>
              </div>

              {relatedProducts.length > 0 && (
                <div className="border-t border-zinc-800 pt-8 pb-10">
                  <h3 className="font-black text-lg mb-4 text-white">Related Products</h3>
                  <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4">
                    {relatedProducts.map(rp => (
                      <div key={rp.id} onClick={() => { setSelectedProduct(rp); window.scrollTo(0,0); }} className="min-w-[140px] bg-[#121212] rounded-2xl p-3 border border-zinc-800 shrink-0 cursor-pointer active:scale-95 transition">
                        <img src={rp.images[0]} className="w-full h-24 object-contain mb-3 drop-shadow-md bg-zinc-900 rounded-xl p-2" />
                        <h4 className="font-bold text-xs text-white line-clamp-1">{rp.name}</h4>
                        <p className="text-orange-500 font-black text-sm mt-1">{config.currency || '৳'}{rp.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#0a0a0a]/90 backdrop-blur-xl border-t border-zinc-800 z-30 pb-safe">
              <div className="max-w-md mx-auto flex gap-3">
                <button onClick={() => addToCart(selectedProduct)} className="w-14 h-14 rounded-2xl border-2 border-zinc-800 flex items-center justify-center text-zinc-300 active:bg-zinc-900 transition shrink-0"><ShoppingCart size={22}/></button>
                <button onClick={() => addToCart(selectedProduct, true)} className="flex-1 h-14 rounded-2xl bg-white text-black font-black text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition">Order Now</button>
              </div>
            </div>
          </div>
        )}
        
        {/* VIEW: WISHLIST (FIXED) */}
        {view === 'wishlist' && (
           <div className="animate-fadeIn pt-6 px-5 pb-20">
             <h2 className="font-black text-2xl mb-6 text-white flex items-center gap-2"><Heart className="text-orange-500"/> My Wishlist</h2>
             {wishlist.length === 0 ? (
                <div className="text-center py-24 bg-[#121212] rounded-[2rem] border border-dashed border-zinc-800 shadow-inner">
                  <div className="w-20 h-20 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-800"><Heart size={32} className="text-zinc-600"/></div>
                  <p className="font-medium text-zinc-500">Your wishlist is empty.</p>
                  <button onClick={()=>setView('home')} className="mt-4 px-6 py-2 bg-zinc-800 text-white rounded-full text-sm font-bold hover:bg-zinc-700 transition">Browse Products</button>
                </div>
             ) : (
                <div className="grid grid-cols-2 gap-4">
                  {wishlist.map(product => (
                    <div key={product.id} className="bg-[#121212] rounded-3xl p-3 border border-zinc-800 relative flex flex-col h-full">
                      <button onClick={() => toggleWishlist(product)} className="absolute top-3 right-3 z-20 w-8 h-8 bg-zinc-900/80 rounded-full flex items-center justify-center border border-zinc-700 active:scale-90 transition"><Trash2 size={14} className="text-red-500" /></button>
                      <div onClick={() => { setSelectedProduct(product); setView('details'); window.scrollTo(0,0); }} className="aspect-square bg-zinc-900 rounded-2xl mb-3 overflow-hidden p-3 flex items-center justify-center">
                        <img src={product.images?.[0] || 'https://via.placeholder.com/300'} className="w-full h-full object-contain drop-shadow-lg" />
                      </div>
                      <div className="flex-1 flex flex-col justify-between px-1">
                        <h3 className="font-bold text-zinc-200 text-sm line-clamp-2 leading-snug mb-3">{product.name}</h3>
                        <div className="flex items-center justify-between">
                          <span className="text-base font-black text-white">{config.currency || '৳'}{product.price}</span>
                          <button onClick={() => addToCart(product, false)} className="w-8 h-8 bg-orange-500 text-black rounded-full flex items-center justify-center active:scale-90 transition shadow-lg"><ShoppingCart size={14}/></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
             )}
           </div>
        )}

        {/* VIEW: ACCOUNT */}
        {view === 'account' && <AccountView user={user} setUser={setUser} showToast={showToast} />}
      </main>

      {/* Dark Floating App Bottom Navigation */}
      {view !== 'details' && (
        <div className="fixed bottom-6 left-4 right-4 z-30 md:hidden">
          <div className="bg-[#121212]/95 backdrop-blur-xl rounded-full p-2 flex justify-between items-center shadow-[0_10px_40px_rgba(0,0,0,0.8)] max-w-sm mx-auto border border-zinc-800 relative">
            <button onClick={()=>setView('home')} className={`flex-1 flex flex-col items-center justify-center h-12 rounded-full transition-all ${view==='home'?'text-white bg-zinc-800':'text-zinc-500 hover:text-zinc-300'}`}><Home size={20}/></button>
            <button onClick={()=>{setActiveCategory("All"); setView('home');}} className={`flex-1 flex flex-col items-center justify-center h-12 rounded-full transition-all text-zinc-500 hover:text-zinc-300`}><Grid size={20}/></button>
            
            <div className="relative -top-7 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-black shadow-[0_0_20px_rgba(249,115,22,0.4)] cursor-pointer border-[6px] border-[#0a0a0a] active:scale-90 transition" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={24} />
              {cart.length > 0 && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-white rounded-full border-2 border-orange-500"></span>}
            </div>
            
            <button onClick={()=>setView('wishlist')} className={`flex-1 flex flex-col items-center justify-center h-12 rounded-full transition-all ${view==='wishlist'?'text-white bg-zinc-800':'text-zinc-500 hover:text-zinc-300'}`}>
              <div className="relative">
                 <Heart size={20}/>
                 {wishlist.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
              </div>
            </button>
            <button onClick={()=>setView('account')} className={`flex-1 flex flex-col items-center justify-center h-12 rounded-full transition-all ${view==='account'?'text-white bg-zinc-800':'text-zinc-500 hover:text-zinc-300'}`}><User size={20}/></button>
          </div>
        </div>
      )}

      {isCartOpen && <CartDrawer cart={cart} setCart={setCart} selectedItems={selectedCartItems} setSelectedItems={setSelectedCartItems} onClose={() => setIsCartOpen(false)} user={user} config={config} db={db} setView={setView} showToast={showToast} />}
    </div>
  );
}

// --- Ultra Premium Dark Profile View ---
function AccountView({ user, setUser, showToast }) {
  const [isEditing, setIsEditing] = useState(!user);
  const [form, setForm] = useState(user || { deliveryType: 'Home Del.', phone: '', name: '', division: '', district: '', address: '' });

  const handleSave = () => {
    if(!form.name || !form.phone || !form.division || !form.district || !form.address) return showToast("Please fill all details!");
    setUser(form); 
    setIsEditing(false);
    showToast("Profile Saved Successfully!");
  };

  const divisions = Object.keys(BD_LOCATIONS);
  const districts = form.division ? BD_LOCATIONS[form.division] : [];

  if (isEditing) {
    return (
      <div className="px-4 pt-4 pb-32 animate-fadeIn">
        <div className="bg-[#121212] p-6 rounded-[2rem] shadow-2xl border border-zinc-800/80 max-w-md mx-auto relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-bl-full pointer-events-none"></div>
          <h2 className="font-black text-2xl mb-6 text-white flex items-center gap-2"><Map className="text-orange-500"/> Delivery Details</h2>
          
          <div className="space-y-5 relative z-10">
            {/* Delivery Type */}
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block ml-1">Delivery Method</label>
              <div className="flex gap-3 bg-zinc-900 p-1 rounded-2xl border border-zinc-800">
                <button onClick={()=>setForm({...form, deliveryType: 'Home Del.'})} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${form.deliveryType === 'Home Del.' ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-500'}`}>Home Delivery</button>
                <button onClick={()=>setForm({...form, deliveryType: 'Point Del.'})} className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${form.deliveryType === 'Point Del.' ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700' : 'text-zinc-500'}`}>Pickup Point</button>
              </div>
            </div>

            {/* Inputs */}
            <div className="relative">
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest absolute -top-2 left-4 bg-[#121212] px-1 z-10">Phone Number</label>
               <input type="tel" placeholder="017XXXXXXXX" className="w-full bg-transparent border border-zinc-700 p-4 rounded-2xl outline-none font-bold text-white placeholder-zinc-700 focus:border-orange-500 transition-colors relative z-0" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/>
            </div>

            <div className="relative">
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest absolute -top-2 left-4 bg-[#121212] px-1 z-10">Full Name</label>
               <input type="text" placeholder="Your Name" className="w-full bg-transparent border border-zinc-700 p-4 rounded-2xl outline-none font-bold text-white placeholder-zinc-700 focus:border-orange-500 transition-colors relative z-0" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
            </div>

            <div className="relative">
               <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest absolute -top-2 left-4 bg-[#121212] px-1 z-10">Detailed Address</label>
               <textarea placeholder="House, Road, Area..." className="w-full bg-transparent border border-zinc-700 p-4 rounded-2xl outline-none font-medium text-white placeholder-zinc-700 focus:border-orange-500 transition-colors relative z-0" rows="3" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/>
            </div>

            {/* Dropdowns */}
            <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 space-y-4">
               <div className="relative">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 block ml-1">Division</label>
                 <div className="relative">
                   <select className="w-full bg-[#121212] border border-zinc-700 p-3.5 rounded-xl outline-none font-bold text-white appearance-none focus:border-orange-500" value={form.division} onChange={e=>setForm({...form, division:e.target.value, district:''})}>
                     <option value="" disabled>Select Division</option>
                     {divisions.map(d=><option key={d} value={d} className="bg-[#121212] text-white">{d}</option>)}
                   </select>
                   <ChevronDown size={16} className="absolute right-4 top-4 text-zinc-500 pointer-events-none"/>
                 </div>
               </div>
               
               <div className="relative">
                 <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1 block ml-1">District</label>
                 <div className="relative">
                   <select className="w-full bg-[#121212] border border-zinc-700 p-3.5 rounded-xl outline-none font-bold text-white appearance-none focus:border-orange-500 disabled:opacity-50" value={form.district} onChange={e=>setForm({...form, district:e.target.value})} disabled={!form.division}>
                     <option value="" disabled>Select District</option>
                     {districts.map(d=><option key={d} value={d} className="bg-[#121212] text-white">{d}</option>)}
                   </select>
                   <ChevronDown size={16} className="absolute right-4 top-4 text-zinc-500 pointer-events-none"/>
                 </div>
               </div>
            </div>

            <button onClick={handleSave} className="w-full bg-white text-black py-4 rounded-2xl font-black shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition text-lg mt-4">Save Address</button>
          </div>
        </div>
      </div>
    )
  }
  return (
    <div className="px-5 pt-4 space-y-4 animate-fadeIn max-w-md mx-auto">
      <div className="bg-[#121212] text-white p-8 rounded-[2rem] relative overflow-hidden border border-zinc-800 shadow-xl">
        <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center font-black text-3xl text-white border border-zinc-700 shadow-inner">{user.name.charAt(0)}</div>
            <span className="bg-zinc-900 text-orange-500 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border border-zinc-800">{user.deliveryType || 'Home Del.'}</span>
          </div>
          <h2 className="text-3xl font-black mb-1 text-white">{user.name}</h2>
          <p className="text-zinc-400 font-medium flex items-center gap-2 mb-6 font-mono"><Phone size={16} className="text-zinc-500"/> {user.phone}</p>
          <div className="bg-[#0a0a0a] p-5 rounded-2xl border border-zinc-800/80">
             <p className="text-zinc-500 text-[10px] uppercase font-black tracking-widest flex items-center gap-1.5 mb-2"><MapPin size={12}/> Delivery Address</p>
             <p className="font-bold leading-relaxed text-zinc-200">{user.address}</p>
             <p className="text-sm font-medium text-zinc-400 mt-1">{user.district}, {user.division}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 pb-20">
        <button onClick={()=>setIsEditing(true)} className="bg-[#121212] border border-zinc-800 py-4 rounded-2xl font-black flex justify-center items-center gap-2 text-white hover:bg-zinc-900 transition"><Edit3 size={16}/> Edit Info</button>
        <button onClick={()=>{setUser(null); setIsEditing(true);}} className="bg-red-500/10 border border-red-500/20 py-4 rounded-2xl font-black flex justify-center items-center gap-2 text-red-500 hover:bg-red-500/20 transition"><LogOut size={16}/> Logout</button>
      </div>
    </div>
  );
}

// --- Daraz Style Cart Drawer with Item Selection ---
function CartDrawer({ cart, setCart, selectedItems, setSelectedItems, onClose, user, config, db, setView, showToast }) {
  const [loading, setLoading] = useState(false);
  
  // Calculate total ONLY for SELECTED items
  const selectedCartObjects = cart.filter(item => selectedItems.includes(item.id));
  
  const subtotal = selectedCartObjects.reduce((sum, item) => sum + ((Number(item.price) || 0) * (Number(item.qty) || 1)), 0);
  const delivery = selectedCartObjects.length > 0 ? (Number(config.deliveryCharge) || 0) : 0;
  const total = subtotal + delivery;

  const isAllSelected = cart.length > 0 && selectedItems.length === cart.length;

  const toggleAll = () => {
    if(isAllSelected) setSelectedItems([]);
    else setSelectedItems(cart.map(i => i.id));
  };

  const toggleItem = (id) => {
    if(selectedItems.includes(id)) setSelectedItems(selectedItems.filter(i => i !== id));
    else setSelectedItems([...selectedItems, id]);
  };

  const handleDeleteItem = (id) => {
    setCart(cart.filter(i => i.id !== id));
    setSelectedItems(selectedItems.filter(i => i !== id));
    showToast("Removed from cart");
  };

  const handleCheckout = async () => {
    if(selectedCartObjects.length === 0) {
      return showToast("Please select items to buy.");
    }
    if(!user) { 
      showToast("Save your delivery info first!"); 
      onClose(); 
      setView('account'); 
      return; 
    }
    
    setLoading(true);
    try {
      const orderData = { 
        customer: user.name, 
        phone: user.phone, 
        address: `${user.address}, ${user.district}, ${user.division}`, 
        items: selectedCartObjects, 
        total: total, 
        status: 'Pending', 
        type: user.deliveryType || 'Home Del.', 
        date: new Date().toLocaleString() 
      };
      await addDoc(collection(db, "orders"), orderData);

      let msg = `*New Order from Website* 🚀\n\n*Name:* ${user.name}\n*Phone:* ${user.phone}\n*Type:* ${user.deliveryType || 'Home Del.'}\n*Address:* ${user.address}, ${user.district}, ${user.division}\n\n`;
      selectedCartObjects.forEach(item => { msg += `▪ ${item.qty}x ${item.name} (৳${item.price * item.qty})\n`; });
      msg += `\nSubtotal: ৳${subtotal}\nDelivery: ৳${delivery}\n*Total Bill: ৳${total}*`;

      const whatsappNum = config.whatsapp || "8801700000000";
      const waUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`;

      // Only remove checked out items from the cart
      setCart(cart.filter(item => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      onClose();
      
      window.open(waUrl, '_blank');
    } catch (e) { showToast("Error placing order."); }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-[#0a0a0a] h-full flex flex-col animate-slideInRight shadow-2xl border-l border-zinc-800">
        
        <div className="bg-[#121212] px-5 py-4 flex justify-between items-center z-10 border-b border-zinc-800">
          <div className="flex items-center gap-3">
             {cart.length > 0 && (
               <button onClick={toggleAll} className="text-zinc-400 hover:text-white transition">
                 {isAllSelected ? <CheckSquare size={20} className="text-orange-500"/> : <Square size={20}/>}
               </button>
             )}
             <h3 className="font-black text-lg text-white">Cart <span className="text-zinc-500 font-medium text-sm">({cart.length})</span></h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 border border-zinc-800 transition active:scale-90"><X size={16} className="text-zinc-400"/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-zinc-600 space-y-5">
               <div className="w-24 h-24 bg-zinc-900 rounded-full flex items-center justify-center border border-zinc-800 shadow-inner"><ShoppingCart size={32} className="text-zinc-600"/></div>
               <p className="font-medium text-zinc-500">Your cart is feeling empty.</p>
               <button onClick={onClose} className="px-8 py-3 bg-white rounded-full text-black font-black text-sm active:scale-95 transition">Start Shopping</button>
             </div>
          ) : (
            <>
              {cart.map(item => {
                const isSelected = selectedItems.includes(item.id);
                return (
                  <div key={item.id} className={`bg-[#121212] p-3 rounded-2xl border flex gap-3 relative pr-10 transition-colors ${isSelected ? 'border-orange-500/50 bg-orange-500/5' : 'border-zinc-800'}`}>
                    
                    {/* Item Checkbox */}
                    <div className="flex items-center justify-center pl-1 cursor-pointer" onClick={() => toggleItem(item.id)}>
                       {isSelected ? <CheckSquare size={20} className="text-orange-500"/> : <Square size={20} className="text-zinc-600"/>}
                    </div>

                    <div className="w-20 h-20 bg-zinc-900 rounded-xl overflow-hidden flex items-center justify-center p-2"><img src={item.images[0]} className="w-full h-full object-contain drop-shadow-md"/></div>
                    
                    <div className="flex-1 flex flex-col justify-center py-1">
                      <h4 className="font-bold text-sm text-zinc-200 line-clamp-2 leading-snug mb-2 pr-2" onClick={() => toggleItem(item.id)}>{item.name}</h4>
                      <div className="flex justify-between items-end mt-auto">
                        <p className="text-orange-500 font-black">{config.currency || '৳'}{item.price}</p>
                        <div className="flex gap-4 items-center bg-zinc-900 rounded-lg px-2 py-1 w-max border border-zinc-800">
                          <button className="text-zinc-400 font-bold text-lg px-1 active:scale-90" onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:Math.max(1,i.qty-1)}:i))}>-</button>
                          <span className="text-sm font-black w-4 text-center text-white">{item.qty}</span>
                          <button className="text-zinc-400 font-bold text-lg px-1 active:scale-90" onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i))}>+</button>
                        </div>
                      </div>
                    </div>
                    <button onClick={()=>handleDeleteItem(item.id)} className="absolute top-3 right-3 p-1.5 text-zinc-600 hover:text-red-500 transition bg-zinc-900 rounded-lg"><Trash2 size={14}/></button>
                  </div>
                )
              })}

              {user ? (
                <div className="bg-[#121212] p-5 rounded-2xl border border-zinc-800 mt-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-bl-full pointer-events-none"></div>
                  <div className="flex justify-between items-center mb-3 relative z-10"><p className="text-[10px] uppercase font-black tracking-widest text-zinc-500 flex items-center gap-1"><MapPin size={12}/> Deliver To</p><span onClick={()=>{onClose(); setView('account')}} className="text-[10px] font-black uppercase tracking-wider text-orange-500 cursor-pointer bg-orange-500/10 border border-orange-500/20 px-2 py-1 rounded-md active:scale-95">Edit</span></div>
                  <p className="font-black text-white relative z-10">{user.name}</p>
                  <p className="text-xs font-bold text-zinc-400 font-mono mt-1 mb-2 relative z-10">{user.phone}</p>
                  <p className="text-xs text-zinc-400 leading-relaxed font-medium bg-[#0a0a0a] p-3 rounded-xl border border-zinc-800/50 relative z-10">{user.address}, {user.district}</p>
                </div>
              ) : (
                <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl text-center mt-6 shadow-inner">
                  <p className="text-sm text-zinc-400 font-bold mb-3">Add delivery details to continue.</p>
                  <button onClick={()=>{onClose(); setView('account');}} className="bg-white text-black px-6 py-2.5 rounded-xl font-black text-sm active:scale-95 transition">Add Address</button>
                </div>
              )}
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 bg-[#121212] border-t border-zinc-800 z-10 rounded-tl-3xl shadow-[0_-10px_40px_rgba(0,0,0,1)]">
            <div className="space-y-2.5 mb-4 text-sm font-bold text-zinc-400">
              <div className="flex justify-between"><span>Selected Items ({selectedCartObjects.reduce((a,b)=>a+b.qty,0)})</span><span className="text-white">{config.currency || '৳'}{subtotal}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span className="text-white">{selectedCartObjects.length > 0 ? `${config.currency || '৳'}${delivery}` : '৳0'}</span></div>
            </div>
            <div className="flex justify-between mb-5 font-black text-xl text-white border-t border-dashed border-zinc-800 pt-3">
              <span>Grand Total</span><span className="text-orange-500">{config.currency || '৳'}{total}</span>
            </div>
            <button 
               onClick={handleCheckout} 
               disabled={loading || selectedCartObjects.length === 0} 
               className="w-full bg-white text-black py-4 rounded-2xl font-black text-lg shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Processing...' : <><CreditCard size={20}/> Checkout ({selectedCartObjects.length})</>}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


