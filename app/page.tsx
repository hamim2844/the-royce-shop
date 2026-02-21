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
  
  const [products, setProducts] = useState([]);
  const [config, setConfig] = useState({ 
    shopName: "THE ROYCE", currency: "৳", deliveryCharge: 130, 
    heroTitle: "Super Gadget Sale", heroSubtitle: "Up to 50% Off", heroBadge: "NEW ARRIVAL",
    heroImage: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400",
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

  const toggleWishlist = (product) => {
    const exists = wishlist.find(i => i.id === product.id);
    if (exists) setWishlist(wishlist.filter(i => i.id !== product.id));
    else setWishlist([...wishlist, product]);
  };

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen pb-24 selection:bg-orange-500 selection:text-white">
      {/* Navbar with Search */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          {view !== 'home' ? <button onClick={() => setView('home')} className="p-1"><ChevronLeft size={24}/></button> : <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">R</div>}
          
          <div className="flex-1 relative">
            {view === 'home' ? (
              <>
                <input className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm outline-none focus:ring-2 focus:ring-slate-900 transition" placeholder="Search gadgets..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              </>
            ) : (
              <div className="text-center font-black text-lg text-slate-800 uppercase tracking-widest">{config.shopName || 'THE ROYCE'}</div>
            )}
          </div>

          <button onClick={() => setIsCartOpen(true)} className="relative p-1">
            <ShoppingCart size={24} />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cart.reduce((a,b)=>a+b.qty,0)}</span>}
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-4">
        {view === 'home' && (
          <div className="animate-fadeIn">
            {/* Dynamic Hero Banner */}
            {!searchTerm && (
              <div className="bg-slate-900 rounded-2xl p-6 text-white mb-6 relative overflow-hidden shadow-lg h-40 flex flex-col justify-center">
                <div className="relative z-10 w-2/3">
                  {config.heroBadge && <span className="bg-white/20 text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm uppercase">{config.heroBadge}</span>}
                  <h2 className="text-2xl font-black mt-2 mb-1 leading-tight">{config.heroTitle || "Super Sale"}</h2>
                  <p className="text-slate-300 text-xs">{config.heroSubtitle}</p>
                </div>
                {config.heroImage && <img src={config.heroImage} className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-50 select-none pointer-events-none" />}
                <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent pointer-events-none"></div>
              </div>
            )}
            
            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4"><div className="w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div><p className="text-sm font-medium">Loading catalog...</p></div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 text-slate-400"><Search size={48} className="mx-auto mb-4 opacity-20"/><p>No products found.</p></div>
            ) : (
              <div className="grid grid-cols-2 gap-3 pb-4">
                {filteredProducts.map(product => {
                  const isWishlisted = wishlist.some(i => i.id === product.id);
                  return (
                    <div key={product.id} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm relative group">
                      <button onClick={() => toggleWishlist(product)} className="absolute top-2 right-2 z-20 w-8 h-8 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm active:scale-90 transition"><Heart size={16} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : "text-slate-400"} /></button>
                      <div onClick={() => { setSelectedProduct(product); setView('details'); window.scrollTo(0,0); }} className="aspect-square bg-slate-50 rounded-lg mb-3 overflow-hidden relative cursor-pointer">
                        <img src={product.images?.[0] || 'https://via.placeholder.com/300'} className="w-full h-full object-cover" />
                        {product.badge && <span className="absolute top-2 left-2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm">{product.badge}</span>}
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm line-clamp-2 mb-1 cursor-pointer leading-snug h-10" onClick={() => { setSelectedProduct(product); setView('details'); }}>{product.name}</h3>
                      <div className="flex items-baseline gap-2 mb-3"><span className="text-base font-black text-orange-600">{config.currency || '৳'}{product.price}</span>{product.originalPrice && <span className="text-[10px] text-slate-400 line-through">{config.currency || '৳'}{product.originalPrice}</span>}</div>
                      <button onClick={() => addToCart(product, true)} className="w-full bg-slate-900 text-white py-2.5 rounded-lg font-bold text-xs active:scale-95 transition shadow-lg">Buy Now</button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
        
        {view === 'details' && selectedProduct && (
          <div className="animate-slideInRight pb-10">
            <div className="w-full aspect-square bg-slate-100 rounded-3xl overflow-hidden relative mb-5 shadow-sm">
              <img src={selectedProduct.images?.[0] || 'https://via.placeholder.com/600'} className="w-full h-full object-cover" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 mb-2 leading-tight">{selectedProduct.name}</h1>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 mb-6 flex items-end shadow-sm">
              <span className="text-3xl font-black text-slate-900">{config.currency || '৳'}{selectedProduct.price}</span>
              {selectedProduct.originalPrice && <span className="text-lg text-slate-400 line-through ml-3 mb-1">{config.currency || '৳'}{selectedProduct.originalPrice}</span>}
            </div>
            <h3 className="font-bold text-lg mb-3">Product Info</h3>
            <div className="space-y-3 mb-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
              <div className="flex gap-3 text-sm text-slate-600 border-b border-slate-50 pb-3"><CheckCircle size={18} className="text-green-600 shrink-0"/> <span className="leading-relaxed">{selectedProduct.details}</span></div>
              <div className="flex gap-3 text-sm text-slate-600 pt-1"><ShieldCheck size={18} className="text-blue-600 shrink-0"/> <span>{selectedProduct.warranty || 'No explicit warranty provided'}</span></div>
            </div>
            
            <div className="fixed bottom-[60px] left-0 right-0 p-3 bg-white/90 backdrop-blur-md border-t flex gap-3 z-20 md:hidden">
              <button onClick={() => addToCart(selectedProduct)} className="flex-1 py-3.5 rounded-xl border-2 border-slate-200 font-bold text-sm text-slate-700 active:bg-slate-50">Add to Cart</button>
              <button onClick={() => addToCart(selectedProduct, true)} className="flex-[1.5] py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg shadow-slate-900/20 active:scale-95 transition">Order Now</button>
            </div>
          </div>
        )}
        
        {view === 'account' && <AccountView user={user} setUser={setUser} />}
      </main>

      {/* Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-6 flex justify-between items-center z-30 md:hidden pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.03)]">
        <button onClick={()=>setView('home')} className={`flex flex-col items-center gap-1 w-16 pt-1 ${view==='home'?'text-slate-900':'text-slate-400 hover:text-slate-600'}`}><Home size={20}/><span className="text-[10px] font-bold">Home</span></button>
        <button className="flex flex-col items-center gap-1 w-16 pt-1 text-slate-400 opacity-50"><Grid size={20}/><span className="text-[10px] font-bold">Menu</span></button>
        <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white -mt-8 border-4 border-slate-50 shadow-xl cursor-pointer active:scale-90 transition" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart size={22} />
        </div>
        <button onClick={()=>setView('account')} className={`flex flex-col items-center gap-1 w-16 pt-1 ${view==='account'?'text-slate-900':'text-slate-400 hover:text-slate-600'}`}><User size={20}/><span className="text-[10px] font-bold">Profile</span></button>
      </div>

      {isCartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={() => setIsCartOpen(false)} user={user} config={config} db={db} setView={setView} />}
    </div>
  );
}

function AccountView({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(!user);
  const [form, setForm] = useState(user || { name: '', phone: '', division: '', district: '', address: '' });

  const handleSave = () => {
    if(!form.name || !form.phone || !form.division || !form.address) return alert("Please fill all required details.");
    setUser(form); setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 animate-fadeIn max-w-md mx-auto">
        <h2 className="font-black text-2xl text-center mb-6 text-slate-800">My Details</h2>
        <div className="space-y-4">
          <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Full Name</label><input placeholder="e.g. Hasan Mahmud" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Phone Number</label><input type="tel" placeholder="017XXXXXXXX" className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Division</label><select className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none" value={form.division} onChange={e=>setForm({...form, division:e.target.value, district:''})}><option value="">Select</option>{Object.keys(LOCATION_DATA).map(d=><option key={d}>{d}</option>)}</select></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">District</label><select className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none" value={form.district} onChange={e=>setForm({...form, district:e.target.value})} disabled={!form.division}><option value="">Select</option>{form.division && Object.keys(LOCATION_DATA[form.division]).map(d=><option key={d}>{d}</option>)}</select></div>
          </div>
          <div><label className="text-xs font-bold text-slate-500 uppercase ml-1">Detailed Address</label><textarea placeholder="House, Road, Area..." className="w-full bg-slate-50 border border-slate-100 p-3 rounded-xl outline-none focus:ring-2 focus:ring-slate-900" rows="3" value={form.address} onChange={e=>setForm({...form, address:e.target.value})}/></div>
          <button onClick={handleSave} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-2 shadow-lg active:scale-95 transition text-lg">Save Profile</button>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-4 animate-fadeIn max-w-md mx-auto">
      <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden shadow-xl shadow-slate-900/20">
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center font-black text-2xl mb-4 backdrop-blur-sm border border-white/20">{user.name.charAt(0)}</div>
          <h2 className="text-2xl font-black">{user.name}</h2>
          <p className="text-slate-300 font-mono mt-1 flex items-center gap-2"><Phone size={14}/> {user.phone}</p>
          <div className="mt-6 bg-white/10 p-4 rounded-xl text-sm border border-white/10 backdrop-blur-md">
             <p className="opacity-70 text-[10px] uppercase font-bold flex items-center gap-1 mb-1"><MapPin size={12}/> Delivery Address</p>
             <p className="font-medium leading-relaxed">{user.address}, {user.district}, {user.division}</p>
          </div>
        </div>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500 rounded-full blur-3xl opacity-40"></div>
        <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-blue-500 rounded-full blur-3xl opacity-30"></div>
      </div>
      <button onClick={()=>setIsEditing(true)} className="w-full bg-white border-2 border-slate-200 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 text-slate-700 active:bg-slate-50 transition"><Edit3 size={18}/> Edit Profile Info</button>
    </div>
  );
}

function CartDrawer({ cart, setCart, onClose, user, config, db, setView }) {
  const [loading, setLoading] = useState(false);
  
  // Safe calculation for total
  const subtotal = cart.reduce((sum, item) => {
    const price = Number(item.price) || 0;
    const qty = Number(item.qty) || 1;
    return sum + (price * qty);
  }, 0);
  const delivery = Number(config.deliveryCharge) || 0;
  const total = subtotal + delivery;

  const handleCheckout = async () => {
    if(!user) {
      alert("Please save your delivery info first!");
      onClose(); setView('account'); return;
    }
    setLoading(true);
    try {
      // 1. Save order to Firebase for Admin Panel
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

      // 2. Generate WhatsApp Message
      let msg = `*New Order from Website* 🚀\n\n`;
      msg += `*Name:* ${user.name}\n*Phone:* ${user.phone}\n*Address:* ${user.address}, ${user.district}\n\n`;
      cart.forEach(item => { msg += `▪ ${item.qty}x ${item.name} (৳${item.price * item.qty})\n`; });
      msg += `\nSubtotal: ৳${subtotal}\nDelivery: ৳${delivery}\n*Total Bill: ৳${total}*`;

      const whatsappNum = config.whatsapp || "8801700000000"; // Fallback if admin didn't set it
      const waUrl = `https://wa.me/${whatsappNum}?text=${encodeURIComponent(msg)}`;

      setCart([]); 
      onClose();
      
      // Open WhatsApp
      window.open(waUrl, '_blank');
      
    } catch (e) {
      alert("Error placing order. Please check your internet.");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-50 h-full flex flex-col animate-slideInRight shadow-2xl">
        
        <div className="bg-white p-4 flex justify-between items-center shadow-sm z-10">
          <h3 className="font-bold text-lg">My Cart <span className="text-slate-400 font-normal text-sm">({cart.length} items)</span></h3>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full hover:bg-slate-200"><X size={18}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-4">
               <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center"><ShoppingCart size={32} className="text-slate-400"/></div>
               <p className="font-medium">Your cart is empty.</p>
               <button onClick={onClose} className="px-6 py-2 bg-white border border-slate-200 rounded-full text-slate-900 font-bold text-sm shadow-sm">Start Shopping</button>
             </div>
          ) : (
            <>
              {cart.map(item => (
                <div key={item.id} className="bg-white p-3 rounded-2xl border border-slate-100 flex gap-3 shadow-sm relative">
                  <img src={item.images[0]} className="w-20 h-20 rounded-xl object-cover bg-slate-50"/>
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <h4 className="font-bold text-sm line-clamp-2 leading-tight pr-6">{item.name}</h4>
                    <div className="flex justify-between items-end mt-2">
                      <p className="text-orange-600 font-black">{config.currency || '৳'}{item.price}</p>
                      <div className="flex gap-4 items-center bg-slate-100 rounded-lg px-2 py-1">
                        <button className="text-slate-500 font-bold text-lg px-1 active:scale-90" onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:Math.max(1,i.qty-1)}:i))}>-</button>
                        <span className="text-sm font-bold w-3 text-center">{item.qty}</span>
                        <button className="text-slate-500 font-bold text-lg px-1 active:scale-90" onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i))}>+</button>
                      </div>
                    </div>
                  </div>
                  <button onClick={()=>setCart(cart.filter(i=>i.id!==item.id))} className="absolute top-3 right-3 text-slate-300 hover:text-red-500 bg-white"><Trash2 size={16}/></button>
                </div>
              ))}

              {user ? (
                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mt-6">
                  <div className="flex justify-between items-center mb-2"><p className="text-xs uppercase font-bold text-slate-400">Deliver To:</p><span onClick={()=>{onClose(); setView('account')}} className="text-xs font-bold text-orange-600 cursor-pointer">Change</span></div>
                  <p className="font-bold text-slate-800">{user.name} <span className="font-normal text-slate-500">({user.phone})</span></p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{user.address}, {user.district}</p>
                </div>
              ) : (
                <div className="bg-orange-50 border border-orange-100 p-4 rounded-2xl text-center mt-6">
                  <p className="text-sm text-orange-800 font-medium mb-3">We need your delivery details.</p>
                  <button onClick={()=>{onClose(); setView('account');}} className="bg-white text-orange-700 px-6 py-2 rounded-xl font-bold shadow-sm text-sm">Add Address</button>
                </div>
              )}
            </>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 bg-white border-t shadow-[0_-10px_20px_rgba(0,0,0,0.03)] z-10">
            <div className="space-y-2 mb-4 text-sm font-medium text-slate-500">
              <div className="flex justify-between"><span>Subtotal</span><span>{config.currency || '৳'}{subtotal}</span></div>
              <div className="flex justify-between"><span>Delivery Fee</span><span>{config.currency || '৳'}{delivery}</span></div>
            </div>
            <div className="flex justify-between mb-4 font-black text-xl text-slate-900 border-t pt-3 border-dashed">
              <span>Total Bill</span><span>{config.currency || '৳'}{total}</span>
            </div>
            <button onClick={handleCheckout} disabled={loading} className="w-full bg-slate-900 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-slate-900/20 active:scale-95 transition disabled:opacity-70 flex items-center justify-center gap-2">
              {loading ? 'Processing...' : <><Phone size={20}/> Send Order on WhatsApp</>}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-3 font-medium">By confirming, you will be redirected to WhatsApp.</p>
          </div>
        )}
      </div>
    </div>
  );
}


