// @ts-nocheck
"use client";
import React, { useState, useEffect } from 'react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, onSnapshot, addDoc, doc, setDoc } from "firebase/firestore";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from "firebase/auth";
import { 
  ShoppingCart, X, Search, User, Heart, Trash2, 
  ArrowRight, ShieldCheck, CreditCard, Menu, 
  Truck, RefreshCcw, HelpCircle, Mail, Lock, Check, ChevronRight, LogOut
} from 'lucide-react';

// --- Sifaa Firebase (Firebase Setup) ---
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
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Default Global Products (Western Style)
const SAMPLE_PRODUCTS = [
  { id: 101, name: "Aura Minimalist Desk Lamp", price: 49.99, originalPrice: 79.99, category: "Home Tech", images: ["https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600"], details: "Touch control, wireless charging base, and 3 color temperatures.", badge: "Bestseller" },
  { id: 102, name: "Nova Pro ANC Earbuds", price: 89.99, originalPrice: 129.99, category: "Audio", images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"], details: "Active noise cancellation with 40h battery life.", badge: "New" },
  { id: 103, name: "ErgoLift Smart Stand", price: 34.99, originalPrice: null, category: "Accessories", images: ["https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600"], details: "Adjustable aluminum laptop stand for ergonomic posture." },
  { id: 104, name: "Zenith Smartwatch", price: 119.99, originalPrice: 159.99, category: "Wearables", images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600"], details: "Health tracking, OLED display, and waterproof design.", badge: "Sale" }
];

export default function GlobalWebsite() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState(null);
  
  const [view, setView] = useState('home'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null); 
  
  const [products, setProducts] = useState(SAMPLE_PRODUCTS);
  const [config, setConfig] = useState({ 
    shopName: "THE ROYCE", currency: "$", deliveryCharge: 4.99, freeShippingThreshold: 50,
    heroTitle: "Elevate Your Everyday.", heroSubtitle: "Curated premium gadgets for the modern lifestyle. Shipped globally."
  });
  const [loadingApp, setLoadingApp] = useState(true);

  // --- Initial Setup & Auth Listener ---
  useEffect(() => {
    setMounted(true);
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({ name: firebaseUser.displayName, email: firebaseUser.email, photo: firebaseUser.photoURL });
        setUid(firebaseUser.uid);
      } else {
        setUser(null);
        setUid(null);
        setCart([]);
        setWishlist([]);
      }
      setLoadingApp(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // --- Sync User Data from Cloud ---
  useEffect(() => {
    if(!uid) return;
    const unsubUser = onSnapshot(doc(db, "global_customers", uid), (docSnap) => {
       if(docSnap.exists()){
         const data = docSnap.data();
         setCart(data.cart || []);
         setWishlist(data.wishlist || []);
       }
    });
    return () => unsubUser();
  }, [uid]);

  const updateCloudData = async (field, data) => {
    if(!uid) return;
    try { await setDoc(doc(db, "global_customers", uid), { [field]: data }, { merge: true }); } catch(e) {}
  };

  const showToast = (message) => { setToast(message); setTimeout(() => setToast(null), 3000); };

  // --- Handlers ---
  const addToCart = (product) => {
    if(!user) { setIsLoginOpen(true); return; }
    let newCart = [...cart];
    const existingIndex = newCart.findIndex(i => i.id === product.id);
    if (existingIndex >= 0) newCart[existingIndex].qty += 1;
    else newCart.push({ ...product, qty: 1 });
    
    setCart(newCart); updateCloudData('cart', newCart); 
    showToast(`Added to cart`);
    setIsCartOpen(true);
  };

  const toggleWishlist = (product) => {
    if(!user) { setIsLoginOpen(true); return; }
    const exists = wishlist.some(i => i.id === product.id);
    let newWishlist;
    if (exists) { newWishlist = wishlist.filter(i => i.id !== product.id); showToast("Removed from Wishlist"); } 
    else { newWishlist = [...wishlist, product]; showToast("Saved to Wishlist"); }
    setWishlist(newWishlist); updateCloudData('wishlist', newWishlist);
  };

  const handleLogout = () => { signOut(auth); setView('home'); showToast("Logged out successfully"); };

  if (!mounted || loadingApp) return <div className="min-h-screen bg-white flex items-center justify-center text-slate-900"><div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div></div>;

  const displayedProducts = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="font-sans text-slate-900 bg-white min-h-screen selection:bg-slate-900 selection:text-white pb-20">
      
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 z-[100] animate-slideInDown">
          <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-medium tracking-wide">
            <Check size={16} className="text-emerald-400"/> {toast}
          </div>
        </div>
      )}

      {/* Top Announcement Bar */}
      <div className="bg-slate-900 text-white text-[11px] font-medium tracking-widest uppercase py-2 text-center flex justify-center items-center gap-2">
         <Truck size={14}/> Free Shipping on orders over {config.currency}{config.freeShippingThreshold}
      </div>

      {/* Minimalist Western Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
             {view !== 'home' && <button onClick={() => setView('home')} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition"><ChevronLeft size={20}/></button>}
             <span className="font-black text-2xl tracking-tighter text-slate-900 cursor-pointer" onClick={()=>setView('home')}>{config.shopName}</span>
          </div>
          
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <Search className="absolute left-4 top-2.5 text-slate-400" size={18} />
            <input className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-11 pr-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none transition" placeholder="Search products..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setView('home');}} />
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button className="p-2 hover:bg-slate-50 rounded-full transition md:hidden" onClick={() => document.getElementById('mobileSearch')?.focus()}><Search size={20}/></button>
            
            <button onClick={() => user ? setView('account') : setIsLoginOpen(true)} className="p-2 hover:bg-slate-50 rounded-full transition">
              {user?.photo ? <img src={user.photo} className="w-6 h-6 rounded-full" /> : <User size={20}/>}
            </button>
            
            <button onClick={() => setIsCartOpen(true)} className="relative p-2 hover:bg-slate-50 rounded-full transition flex items-center gap-2">
              <ShoppingCart size={20} />
              {cart.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Search */}
      <div className="md:hidden px-5 py-3 border-b border-slate-50">
        <div className="relative">
          <Search className="absolute left-4 top-3 text-slate-400" size={16} />
          <input id="mobileSearch" className="w-full bg-slate-50 border-none rounded-full py-2.5 pl-10 pr-4 text-sm focus:ring-1 focus:ring-slate-900 outline-none" placeholder="Search products..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setView('home');}} />
        </div>
      </div>

      <main className="max-w-6xl mx-auto min-h-[70vh]">
        
        {/* --- HOME VIEW --- */}
        {view === 'home' && (
          <div className="animate-fadeIn">
            {!searchTerm && (
              <div className="px-5 py-8 md:py-16">
                <div className="bg-slate-50 rounded-[2rem] p-8 md:p-16 relative overflow-hidden flex flex-col justify-center items-start min-h-[300px] md:min-h-[400px]">
                  <div className="relative z-10 max-w-lg">
                    <span className="inline-block border border-slate-900 text-slate-900 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">Global Shipping</span>
                    <h1 className="text-4xl md:text-6xl font-black mb-4 leading-tight tracking-tighter text-slate-900">{config.heroTitle}</h1>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-8">{config.heroSubtitle}</p>
                    <button className="bg-slate-900 text-white px-8 py-3.5 rounded-full text-sm font-bold hover:bg-slate-800 transition shadow-lg flex items-center gap-2">Shop Collection <ArrowRight size={16}/></button>
                  </div>
                </div>
                
                {/* Trust Badges Bar */}
                <div className="grid grid-cols-3 gap-4 py-8 border-b border-slate-100 mb-8">
                   <div className="flex flex-col items-center text-center gap-2"><Truck size={24} strokeWidth={1.5} className="text-slate-700"/><h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Fast Delivery</h4><p className="text-[10px] text-slate-500">US & Canada in 5-7 days</p></div>
                   <div className="flex flex-col items-center text-center gap-2"><RefreshCcw size={24} strokeWidth={1.5} className="text-slate-700"/><h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">30-Day Returns</h4><p className="text-[10px] text-slate-500">Hassle-free return policy</p></div>
                   <div className="flex flex-col items-center text-center gap-2"><ShieldCheck size={24} strokeWidth={1.5} className="text-slate-700"/><h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Secure Checkout</h4><p className="text-[10px] text-slate-500">Encrypted payments</p></div>
                </div>
              </div>
            )}

            <div className="px-5 pt-4 pb-12">
              <div className="flex justify-between items-end mb-8">
                <h3 className="text-2xl font-black tracking-tight">{searchTerm ? 'Search Results' : 'Trending Now'}</h3>
              </div>

              {displayedProducts.length === 0 ? (
                <div className="text-center py-20 text-slate-500"><p className="font-medium">No products found.</p></div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-10">
                  {displayedProducts.map(product => (
                    <WesternProductCard key={product.id} product={product} config={config} wishlist={wishlist} toggleWishlist={toggleWishlist} addToCart={addToCart} setView={setView} setSelectedProduct={setSelectedProduct} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* --- PRODUCT DETAILS --- */}
        {view === 'details' && selectedProduct && (
          <div className="animate-fadeIn px-5 py-8 md:py-12">
            <div className="grid md:grid-cols-2 gap-10 md:gap-16">
               <div className="aspect-square bg-slate-50 rounded-3xl overflow-hidden relative flex items-center justify-center p-8 group">
                 <button onClick={() => toggleWishlist(selectedProduct)} className="absolute top-6 right-6 z-10 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:scale-105 transition"><Heart size={18} fill={wishlist.some(i => i.id === selectedProduct.id) ? "#0f172a" : "none"} className={wishlist.some(i => i.id === selectedProduct.id) ? "text-slate-900" : "text-slate-400"}/></button>
                 <img src={selectedProduct.images[0]} className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105" />
               </div>

               <div className="flex flex-col justify-center">
                 {selectedProduct.badge && <span className="w-max bg-slate-100 text-slate-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4">{selectedProduct.badge}</span>}
                 <h1 className="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-4 tracking-tight">{selectedProduct.name}</h1>
                 
                 <div className="flex items-end gap-3 mb-6">
                   <span className="text-3xl font-bold text-slate-900 tracking-tight">{config.currency}{selectedProduct.price}</span>
                   {selectedProduct.originalPrice && <span className="text-lg text-slate-400 line-through mb-1">{config.currency}{selectedProduct.originalPrice}</span>}
                 </div>

                 <p className="text-slate-600 leading-relaxed mb-8">{selectedProduct.details}</p>

                 <div className="space-y-4 mb-8">
                   <div className="flex items-center gap-3 text-sm text-slate-700"><CheckCircle size={18} className="text-emerald-500"/> In stock, ready to ship</div>
                   <div className="flex items-center gap-3 text-sm text-slate-700"><ShieldCheck size={18} className="text-slate-400"/> 1 Year Global Warranty</div>
                 </div>
                 
                 <button onClick={() => addToCart(selectedProduct, true)} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-slate-800 active:scale-[0.98] transition shadow-lg flex justify-center items-center gap-2">Add to Cart</button>
               </div>
            </div>
          </div>
        )}
        
        {/* --- WESTERN PROFILE DASHBOARD --- */}
        {view === 'account' && user && (
          <div className="px-5 py-8 md:py-12 animate-fadeIn max-w-3xl mx-auto">
             <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-black tracking-tight">My Account</h2>
                <button onClick={handleLogout} className="text-sm font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1"><LogOut size={16}/> Sign Out</button>
             </div>

             <div className="bg-slate-50 rounded-3xl p-6 md:p-8 flex items-center gap-5 mb-8">
                <img src={user.photo || "https://via.placeholder.com/100"} className="w-20 h-20 rounded-full border-4 border-white shadow-md"/>
                <div>
                   <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
                   <p className="text-slate-500 text-sm">{user.email}</p>
                </div>
             </div>

             <div className="grid md:grid-cols-2 gap-6">
                <div className="border border-slate-100 rounded-3xl p-6 hover:border-slate-300 transition cursor-pointer" onClick={()=>setView('home')}>
                   <Package size={24} className="text-slate-900 mb-4"/>
                   <h4 className="font-bold text-lg mb-1">Order History</h4>
                   <p className="text-sm text-slate-500">Track, return, or buy things again.</p>
                </div>
                <div className="border border-slate-100 rounded-3xl p-6 hover:border-slate-300 transition cursor-pointer" onClick={()=>{setView('home'); showToast("Navigating to Saved Items");}}>
                   <Heart size={24} className="text-slate-900 mb-4"/>
                   <h4 className="font-bold text-lg mb-1">Saved Items</h4>
                   <p className="text-sm text-slate-500">{wishlist.length} items in your wishlist.</p>
                </div>
             </div>
          </div>
        )}
      </main>

      {/* Minimal Footer */}
      <footer className="bg-slate-50 pt-16 pb-8 border-t border-slate-100 mt-10">
         <div className="max-w-6xl mx-auto px-5 text-center md:text-left grid md:grid-cols-4 gap-8 mb-12">
            <div>
               <h4 className="font-black text-xl tracking-tight mb-4">{config.shopName}</h4>
               <p className="text-sm text-slate-500 leading-relaxed">Curated tech and lifestyle gadgets delivered straight to your door. Based in the USA.</p>
            </div>
            <div>
               <h4 className="font-bold mb-4">Support</h4>
               <ul className="space-y-2 text-sm text-slate-500"><li>FAQ</li><li>Shipping & Returns</li><li>Track Order</li></ul>
            </div>
            <div>
               <h4 className="font-bold mb-4">Legal</h4>
               <ul className="space-y-2 text-sm text-slate-500"><li>Terms of Service</li><li>Privacy Policy</li><li>Refund Policy</li></ul>
            </div>
            <div>
               <h4 className="font-bold mb-4">Safe Payments</h4>
               <div className="flex justify-center md:justify-start gap-2 text-slate-400">
                  <CreditCard size={32} strokeWidth={1}/> <ShieldCheck size={32} strokeWidth={1}/>
               </div>
            </div>
         </div>
         <div className="text-center text-xs text-slate-400 font-medium">© {new Date().getFullYear()} {config.shopName} Inc. All rights reserved.</div>
      </footer>

      {/* --- FLOATING SUPPORT WIDGET --- */}
      <div className="fixed bottom-6 right-6 z-50">
         {isSupportOpen && (
           <div className="absolute bottom-16 right-0 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 animate-slideInRight mb-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><HelpCircle size={18}/> Need Help?</h3>
                <button onClick={()=>setIsSupportOpen(false)} className="text-slate-400 hover:text-slate-900"><X size={16}/></button>
              </div>
              <p className="text-xs text-slate-500 mb-4 leading-relaxed">Our support team is available 24/7. Leave your email and message below.</p>
              <input placeholder="Your Email" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm outline-none focus:border-slate-900 mb-3" />
              <textarea placeholder="How can we help?" rows="3" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl text-sm outline-none focus:border-slate-900 mb-3" />
              <button onClick={()=>{setIsSupportOpen(false); showToast("Message Sent! We will email you.");}} className="w-full bg-slate-900 text-white py-3 rounded-xl text-sm font-bold">Send Message</button>
           </div>
         )}
         <button onClick={()=>setIsSupportOpen(!isSupportOpen)} className="w-14 h-14 bg-slate-900 text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-105 transition active:scale-95">
           {isSupportOpen ? <X size={24}/> : <MessageSquare size={24}/>}
         </button>
      </div>

      {/* --- GOOGLE LOGIN MODAL (US Market Standard) --- */}
      {isLoginOpen && <LoginModal auth={auth} provider={googleProvider} setUser={setUser} setUid={setUid} onClose={()=>setIsLoginOpen(false)} shopName={config.shopName} showToast={showToast} />}

      {/* --- CART DRAWER --- */}
      {isCartOpen && <CartDrawer cart={cart} updateCartQty={updateCartQty} removeCartItem={removeCartItem} onClose={() => setIsCartOpen(false)} user={user} config={config} db={db} uid={uid} clearCart={()=>{setCart([]); updateCloudData('cart', []);}} showToast={showToast} setIsLoginOpen={setIsLoginOpen} />}
    </div>
  );
}

// --- MINIMAL WESTERN PRODUCT CARD ---
function WesternProductCard({ product, config, wishlist, toggleWishlist, addToCart, setView, setSelectedProduct }) {
  const isWishlisted = wishlist.some(i => i.id === product.id);
  return (
    <div className="group cursor-pointer" onClick={() => { setSelectedProduct(product); setView('details'); window.scrollTo(0,0); }}>
      <div className="aspect-[4/5] bg-slate-50 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center p-6">
        <button onClick={(e) => { e.stopPropagation(); toggleWishlist(product); }} className="absolute top-3 right-3 z-10 p-2 rounded-full hover:bg-white transition opacity-0 group-hover:opacity-100">
          <Heart size={18} fill={isWishlisted ? "#0f172a" : "none"} className={isWishlisted ? "text-slate-900" : "text-slate-400"} />
        </button>
        {product.badge && <span className="absolute top-3 left-3 bg-white text-slate-900 text-[9px] font-bold px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">{product.badge}</span>}
        <img src={product.images[0]} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
        
        {/* Quick Add Hover Button */}
        <div className="absolute bottom-3 left-3 right-3 translate-y-10 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button onClick={(e) => { e.stopPropagation(); addToCart(product); }} className="w-full bg-slate-900/90 backdrop-blur text-white py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-900"><ShoppingCart size={16}/> Quick Add</button>
        </div>
      </div>
      <div>
        <h3 className="font-bold text-slate-900 text-sm mb-1 line-clamp-1">{product.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-900">{config.currency}{product.price}</span>
          {product.originalPrice && <span className="text-[11px] text-slate-400 line-through">{config.currency}{product.originalPrice}</span>}
        </div>
      </div>
    </div>
  );
}

// --- GOOGLE LOGIN MODAL WITH T&C ---
function LoginModal({ auth, provider, setUser, setUid, onClose, shopName, showToast }) {
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    if(!agreed) return alert("Please agree to the Terms & Conditions to proceed.");
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      setUser({ name: result.user.displayName, email: result.user.email, photo: result.user.photoURL });
      setUid(result.user.uid);
      showToast("Welcome to " + shopName);
      onClose();
    } catch (error) {
      console.error(error);
      showToast("Authentication failed.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
       <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
       <div className="bg-white w-full max-w-sm rounded-[2rem] p-8 relative z-10 shadow-2xl animate-slideInDown">
          <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-900"><X size={20}/></button>
          
          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-900 mb-6"><Lock size={20}/></div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Welcome Back</h2>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">Sign in or create an account to manage your orders, save items, and checkout faster.</p>

          <div className="flex items-start gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <input type="checkbox" id="terms" checked={agreed} onChange={(e)=>setAgreed(e.target.checked)} className="mt-1 w-4 h-4 accent-slate-900 cursor-pointer"/>
            <label htmlFor="terms" className="text-xs text-slate-600 leading-relaxed cursor-pointer">
              I agree to {shopName}'s <span className="font-bold text-slate-900 underline">Terms of Service</span> and <span className="font-bold text-slate-900 underline">Privacy Policy</span>.
            </label>
          </div>

          <button onClick={handleGoogleSignIn} disabled={loading} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 transition ${agreed ? 'bg-slate-900 text-white shadow-lg hover:bg-slate-800' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>
            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <><Mail size={18}/> Continue with Google</>}
          </button>
       </div>
    </div>
  )
}

// --- GLOBAL CART DRAWER ---
function CartDrawer({ cart, updateCartQty, removeCartItem, onClose, user, config, db, uid, clearCart, showToast, setIsLoginOpen }) {
  const [loading, setLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState('cart'); // cart -> shipping -> payment (simulation)
  const [shippingData, setShippingData] = useState({ fullName: user?.name || '', email: user?.email || '', address: '', city: '', state: '', zip: '', country: 'United States' });
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const delivery = subtotal >= config.freeShippingThreshold ? 0 : config.deliveryCharge;
  const total = subtotal + delivery;

  const handleSimulatedCheckout = async () => {
    if(!shippingData.address || !shippingData.city || !shippingData.zip) return showToast("Please complete shipping address");
    setLoading(true);
    
    try {
      // In a real app, this redirects to Stripe. Here we save to Firebase as 'Paid' for simulation.
      const order = {
        userId: uid, customerEmail: shippingData.email, customerName: shippingData.fullName,
        shipping: shippingData, items: cart, subtotal, delivery, total, status: 'Processing', date: new Date().toISOString()
      };
      await addDoc(collection(db, "global_orders"), order);
      
      clearCart();
      showToast("Payment Successful! Order placed.");
      onClose();
    } catch(e) {
      showToast("Checkout failed.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full flex flex-col animate-slideInRight shadow-2xl">
        
        <div className="px-6 py-5 flex justify-between items-center border-b border-slate-100">
          <h3 className="font-black text-xl text-slate-900">{checkoutStep === 'cart' ? 'Your Cart' : 'Checkout'}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition"><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {checkoutStep === 'cart' && (
            <>
              {cart.length === 0 ? (
                 <div className="flex flex-col items-center justify-center h-full text-slate-400">
                   <ShoppingCart size={48} strokeWidth={1} className="mb-4 text-slate-200"/>
                   <p className="font-medium text-slate-600">Your cart is empty.</p>
                 </div>
              ) : (
                <div className="space-y-6">
                  {/* Free Shipping Progress */}
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <p className="text-xs font-bold text-slate-700 mb-2">
                      {subtotal >= config.freeShippingThreshold ? <span className="text-emerald-600 flex items-center gap-1"><Check size={14}/> You unlocked Free Shipping!</span> : `Add ${config.currency}${(config.freeShippingThreshold - subtotal).toFixed(2)} more for Free Shipping.`}
                    </p>
                    <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                       <div className="bg-slate-900 h-full rounded-full transition-all duration-500" style={{width: `${Math.min(100, (subtotal/config.freeShippingThreshold)*100)}%`}}></div>
                    </div>
                  </div>

                  {cart.map(item => (
                    <div key={item.id} className="flex gap-4 group">
                      <div className="w-20 h-20 bg-slate-50 rounded-xl flex items-center justify-center p-2"><img src={item.images[0]} className="w-full h-full object-contain mix-blend-multiply"/></div>
                      <div className="flex-1 flex flex-col justify-between py-0.5">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-slate-900 line-clamp-2 pr-4">{item.name}</h4>
                          <button onClick={()=>removeCartItem(item.id)} className="text-slate-300 hover:text-red-500"><Trash2 size={16}/></button>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-slate-900 font-bold">{config.currency}{item.price}</p>
                          <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-2 py-1 border border-slate-100">
                            <button className="text-slate-400 font-bold px-1" onClick={()=>updateCartQty(item.id, Math.max(1, item.qty-1))}>-</button>
                            <span className="text-xs font-bold w-4 text-center">{item.qty}</span>
                            <button className="text-slate-400 font-bold px-1" onClick={()=>updateCartQty(item.id, item.qty+1)}>+</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {checkoutStep === 'shipping' && (
            <div className="space-y-4 animate-fadeIn">
               <div className="flex items-center gap-2 mb-6"><button onClick={()=>setCheckoutStep('cart')} className="text-slate-400 hover:text-slate-900"><ChevronLeft size={18}/></button><span className="text-sm font-bold text-slate-500 uppercase tracking-widest">Shipping Info</span></div>
               <input placeholder="Full Name" className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-slate-900" value={shippingData.fullName} onChange={e=>setShippingData({...shippingData, fullName:e.target.value})}/>
               <input placeholder="Email Address" type="email" className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-slate-900" value={shippingData.email} onChange={e=>setShippingData({...shippingData, email:e.target.value})}/>
               <input placeholder="Street Address" className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-slate-900" value={shippingData.address} onChange={e=>setShippingData({...shippingData, address:e.target.value})}/>
               <div className="grid grid-cols-2 gap-3">
                 <input placeholder="City" className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-slate-900" value={shippingData.city} onChange={e=>setShippingData({...shippingData, city:e.target.value})}/>
                 <input placeholder="State / Prov" className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-slate-900" value={shippingData.state} onChange={e=>setShippingData({...shippingData, state:e.target.value})}/>
               </div>
               <div className="grid grid-cols-2 gap-3">
                 <input placeholder="ZIP Code" className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-slate-900" value={shippingData.zip} onChange={e=>setShippingData({...shippingData, zip:e.target.value})}/>
                 <select className="w-full border border-slate-200 p-3.5 rounded-xl text-sm outline-none focus:border-slate-900 bg-white" value={shippingData.country} onChange={e=>setShippingData({...shippingData, country:e.target.value})}>
                    <option>United States</option><option>Canada</option><option>United Kingdom</option>
                 </select>
               </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <div className="space-y-2 mb-4 text-sm text-slate-500">
              <div className="flex justify-between"><span>Subtotal</span><span className="text-slate-900 font-medium">{config.currency}{subtotal.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span className="text-slate-900 font-medium">{delivery === 0 ? 'Free' : `${config.currency}${delivery.toFixed(2)}`}</span></div>
            </div>
            <div className="flex justify-between mb-6 font-black text-2xl text-slate-900 border-t border-slate-200 pt-4">
              <span>Total</span><span>{config.currency}{total.toFixed(2)}</span>
            </div>
            
            {checkoutStep === 'cart' ? (
              <button onClick={()=>{ if(!user) { onClose(); setIsLoginOpen(true); } else setCheckoutStep('shipping'); }} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-slate-800 transition flex justify-center items-center gap-2">
                Checkout securely <Lock size={16}/>
              </button>
            ) : (
              <button onClick={handleSimulatedCheckout} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold text-lg shadow-xl hover:bg-slate-800 transition flex justify-center items-center gap-2 disabled:opacity-70">
                {loading ? 'Processing...' : `Pay ${config.currency}${total.toFixed(2)}`}
              </button>
            )}
            
            <div className="flex justify-center items-center gap-3 mt-4 text-slate-300">
               <CreditCard size={24} strokeWidth={1.5}/> <ShieldCheck size={24} strokeWidth={1.5}/>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


