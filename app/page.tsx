"use client";
import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, X, Phone, MapPin, CheckCircle, Star, 
  Menu, ChevronLeft, ChevronRight, Truck, ShieldCheck, 
  ArrowRight, Search, Plus, Minus, CreditCard, Banknote, 
  Home, Grid, User, Heart, Filter, LogOut, Edit3, Trash2
} from 'lucide-react';

// --- Configuration ---
const CONFIG = {
  shopName: "THE ROYCE",
  currency: "৳",
  deliveryCharge: 130,
  bkash: "01845220350"
};

const LOCATION_DATA = {
  "Dhaka": {
    "Dhaka": ["Savar", "Dhamrai", "Keraniganj", "Nawabganj", "Adabor", "Uttara", "Mirpur", "Dhanmondi"],
    "Gazipur": ["Gazipur Sadar", "Kaliakair", "Kapasia", "Sreepur"],
    "Narayanganj": ["Narayanganj Sadar", "Rupganj", "Sonargaon"]
  },
  "Rajshahi": {
    "Natore": ["Natore Sadar", "Singra", "Baraigram", "Lalpur", "Bagatipara", "Gurudaspur", "Naldanga"],
    "Rajshahi": ["Boalia", "Motihar", "Rajpara", "Paba", "Bagha"],
    "Pabna": ["Pabna Sadar", "Ishwardi", "Santhia"]
  }
};

const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: "ZT Pro 20 Ultra",
    price: 950,
    originalPrice: 1500,
    category: "Smart Watch",
    images: ["https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600"],
    details: "7 Straps Included, HD Display.",
    warranty: "7 Days Replacement",
    rating: 4.8,
    reviews: [],
    badge: "HOT SALE" 
  },
  {
    id: 2,
    name: "Oraimo Shark 4",
    price: 1390,
    originalPrice: 1800,
    category: "Audio",
    images: ["https://images.unsplash.com/photo-1572569028738-411a097746e6?w=600"],
    details: "Heavy Bass, 50H Playtime.",
    warranty: "6 Months Official",
    rating: 5.0,
    reviews: [],
    badge: "BEST SELLER"
  },
  {
    id: 3,
    name: "E30 Transparent",
    price: 590,
    originalPrice: 890,
    category: "Audio",
    images: ["https://images.unsplash.com/photo-1629367494173-c78a56567877?w=600"],
    details: "Transparent Design, Type-C.",
    warranty: "No Warranty",
    rating: 4.5,
    reviews: [],
    badge: "150 FLAT OFF"
  },
  {
    id: 4,
    name: "Hoco EQ34 Plus",
    price: 900,
    originalPrice: 1200,
    category: "Earbuds",
    images: ["https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600"],
    details: "Clear Sound, Long Battery.",
    warranty: "3 Months Warranty",
    rating: 4.7,
    reviews: [],
    badge: "NEW"
  }
];

export default function Website() {
  const [view, setView] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedProducts = localStorage.getItem('royce_products');
      const savedCart = localStorage.getItem('royce_cart');
      const savedUser = localStorage.getItem('royce_user');
      const savedWishlist = localStorage.getItem('royce_wishlist');
      
      if (savedProducts) setProducts(JSON.parse(savedProducts));
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedUser) setUser(JSON.parse(savedUser));
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));
    }
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
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    if(openDrawer) setIsCartOpen(true);
  };

  const toggleWishlist = (product) => {
    const exists = wishlist.find(i => i.id === product.id);
    if (exists) {
      setWishlist(wishlist.filter(i => i.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);
    }
  };

  const categories = ["All", ...new Set(products.map(p => p.category))];

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen pb-20 selection:bg-orange-500 selection:text-white">
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          {view !== 'home' ? (
            <button onClick={() => setView('home')}><ChevronLeft size={24} className="text-slate-700"/></button>
          ) : (
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">R</div>
          )}
          
          <div className="flex-1 text-center font-bold text-lg text-slate-800">
            {view === 'home' ? 'THE ROYCE' : 
             view === 'category' ? 'Categories' :
             view === 'wishlist' ? 'My Wishlist' :
             view === 'account' ? 'My Account' : ''}
          </div>

          <button onClick={() => setIsCartOpen(true)} className="relative">
            <ShoppingCart size={24} className="text-slate-700" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cart.reduce((a,b)=>a+b.qty,0)}</span>}
          </button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-4">
        {view === 'home' && (
          <HomeView products={products} addToCart={addToCart} toggleWishlist={toggleWishlist} wishlist={wishlist} onProductClick={(p) => { setSelectedProduct(p); setView('details'); }} />
        )}
        {view === 'details' && selectedProduct && (
          <ProductDetails product={selectedProduct} onAdd={addToCart} onBack={() => setView('home')} />
        )}
        {view === 'category' && (
          <CategoryView categories={categories} selectedCategory={selectedCategory} onSelect={(cat) => setSelectedCategory(cat)} products={products} onProductClick={(p) => { setSelectedProduct(p); setView('details'); }} />
        )}
        {view === 'wishlist' && (
          <WishlistView wishlist={wishlist} onRemove={(id) => setWishlist(wishlist.filter(i => i.id !== id))} onAddToCart={(p) => addToCart(p, true)} />
        )}
        {view === 'account' && (
          <AccountView user={user} setUser={setUser} />
        )}
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-2 px-6 flex justify-between items-center z-30 md:hidden pb-safe">
        <NavButton icon={<Home size={20} />} label="Home" active={view==='home'} onClick={()=>setView('home')} />
        <NavButton icon={<Grid size={20} />} label="Category" active={view==='category'} onClick={()=>setView('category')} />
        <div className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white -mt-8 border-4 border-slate-50 shadow-lg cursor-pointer transform active:scale-95 transition" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart size={22} />
        </div>
        <NavButton icon={<Heart size={20} />} label="Wishlist" active={view==='wishlist'} onClick={()=>setView('wishlist')} />
        <NavButton icon={<User size={20} />} label="Account" active={view==='account'} onClick={()=>setView('account')} />
      </div>

      {isCartOpen && <CartDrawer cart={cart} setCart={setCart} onClose={() => setIsCartOpen(false)} user={user} />}
    </div>
  );
}

function NavButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 w-16 pt-1 ${active ? 'text-orange-600' : 'text-slate-400 hover:text-slate-600'}`}>
      {icon} <span className="text-[10px] font-bold">{label}</span>
    </button>
  );
}

function HomeView({ products, addToCart, toggleWishlist, wishlist, onProductClick }) {
  return (
    <div className="animate-fadeIn">
      <div className="bg-slate-900 rounded-2xl p-6 text-white mb-6 relative overflow-hidden shadow-lg">
        <div className="relative z-10">
          <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">NEW ARRIVAL</span>
          <h2 className="text-2xl font-black mt-2 mb-1">Gadget Fest 2026</h2>
          <p className="text-slate-300 text-xs mb-3">Up to 50% Off</p>
          <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold">Shop Now</button>
        </div>
        <img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-30" />
      </div>
      <div className="grid grid-cols-2 gap-3 pb-4">
        {products.map(product => {
          const isWishlisted = wishlist.some(i => i.id === product.id);
          return (
            <div key={product.id} className="bg-white rounded-xl p-3 border border-slate-100 shadow-sm relative group">
              <button onClick={() => toggleWishlist(product)} className="absolute top-2 right-2 z-20 w-7 h-7 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 hover:text-red-500">
                <Heart size={14} fill={isWishlisted ? "currentColor" : "none"} className={isWishlisted ? "text-red-500" : ""} />
              </button>
              <div onClick={() => onProductClick(product)} className="aspect-square bg-slate-50 rounded-lg mb-3 overflow-hidden relative cursor-pointer">
                <img src={product.images[0]} className="w-full h-full object-cover" />
                {product.badge && <span className="absolute top-2 left-2 bg-slate-900 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">{product.badge}</span>}
              </div>
              <h3 onClick={() => onProductClick(product)} className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight mb-1 cursor-pointer">{product.name}</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-base font-black text-orange-600">৳{product.price}</span>
                <span className="text-xs text-slate-400 line-through">৳{product.originalPrice}</span>
              </div>
              <button onClick={() => addToCart(product, true)} className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2 rounded-lg font-bold text-xs shadow-lg transition active:scale-95">Buy Now</button>
            </div>
          )
        })}
      </div>
    </div>
  );
}

function CategoryView({ categories, selectedCategory, onSelect, products, onProductClick }) {
  const filtered = selectedCategory === "All" ? products : products.filter(p => p.category === selectedCategory);
  return (
    <div className="animate-fadeIn">
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {categories.map(cat => (
          <button key={cat} onClick={() => onSelect(cat)} className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border transition ${selectedCategory === cat ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200'}`}>{cat}</button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map(p => (
          <div key={p.id} onClick={() => onProductClick(p)} className="flex gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm cursor-pointer hover:border-orange-200">
            <img src={p.images[0]} className="w-20 h-20 bg-slate-50 rounded-lg object-cover" />
            <div className="flex-1 py-1">
              <h4 className="font-bold text-sm text-slate-800 mb-1">{p.name}</h4>
              <div className="flex items-center gap-2 mb-2"><span className="text-orange-600 font-bold">৳{p.price}</span><span className="text-slate-400 text-xs line-through">৳{p.originalPrice}</span></div>
              <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500">{p.category}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WishlistView({ wishlist, onRemove, onAddToCart }) {
  if (wishlist.length === 0) return <div className="flex flex-col items-center justify-center h-[60vh] text-slate-400"><Heart size={48} className="mb-4 opacity-20" /><p>Your wishlist is empty</p></div>;
  return (
    <div className="animate-fadeIn grid grid-cols-2 gap-3">
      {wishlist.map(p => (
        <div key={p.id} className="bg-white p-3 rounded-xl border border-slate-100 shadow-sm relative">
          <button onClick={() => onRemove(p.id)} className="absolute top-2 right-2 text-slate-400 hover:text-red-500"><X size={16}/></button>
          <img src={p.images[0]} className="w-full h-32 object-cover rounded-lg bg-slate-50 mb-2" />
          <h4 className="font-bold text-sm mb-1 truncate">{p.name}</h4>
          <p className="text-orange-600 font-bold text-sm mb-3">৳{p.price}</p>
          <button onClick={() => onAddToCart(p)} className="w-full py-2 bg-slate-900 text-white rounded-lg text-xs font-bold">Add to Cart</button>
        </div>
      ))}
    </div>
  );
}

function AccountView({ user, setUser }) {
  const [isEditing, setIsEditing] = useState(!user);
  const [form, setForm] = useState(user || { name: '', phone: '', division: '', district: '', upazila: '', address: '' });

  const handleSave = () => {
    if(!form.name || !form.phone || !form.division || !form.district) return alert("Please fill all details");
    setUser(form);
    setIsEditing(false);
  };

  const divisions = Object.keys(LOCATION_DATA);
  const districts = form.division ? Object.keys(LOCATION_DATA[form.division] || {}) : [];
  const upazilas = (form.division && form.district) ? (LOCATION_DATA[form.division][form.district] || []) : [];

  if (isEditing) {
    return (
      <div className="animate-fadeIn bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold mb-6 text-center">Create Profile</h2>
        <div className="space-y-4">
          <div><label className="text-xs font-bold text-slate-500 uppercase">Phone (WhatsApp)</label><input type="tel" placeholder="017XXXXXXXX" className="w-full border-b py-2 focus:outline-none focus:border-orange-500" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} /></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase">Full Name</label><input type="text" placeholder="Your Name" className="w-full border-b py-2 focus:outline-none focus:border-orange-500" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="text-xs font-bold text-slate-500 uppercase">Division</label><select className="w-full border-b py-2 bg-white" value={form.division} onChange={e=>setForm({...form, division: e.target.value, district: '', upazila: ''})}><option value="">Select</option>{divisions.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
            <div><label className="text-xs font-bold text-slate-500 uppercase">District</label><select className="w-full border-b py-2 bg-white" value={form.district} onChange={e=>setForm({...form, district: e.target.value, upazila: ''})} disabled={!form.division}><option value="">Select</option>{districts.map(d=><option key={d} value={d}>{d}</option>)}</select></div>
          </div>
          <div><label className="text-xs font-bold text-slate-500 uppercase">Upazila / Thana</label><select className="w-full border-b py-2 bg-white" value={form.upazila} onChange={e=>setForm({...form, upazila: e.target.value})} disabled={!form.district}><option value="">Select</option>{upazilas.map(u=><option key={u} value={u}>{u}</option>)}</select></div>
          <div><label className="text-xs font-bold text-slate-500 uppercase">Detailed Address</label><textarea placeholder="House No, Road No, Village..." className="w-full border-b py-2 focus:outline-none focus:border-orange-500" rows="2" value={form.address} onChange={e=>setForm({...form, address: e.target.value})} /></div>
          <button onClick={handleSave} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold mt-4 shadow-lg">Save Profile</button>
        </div>
      </div>
    )
  }

  return (
    <div className="animate-fadeIn space-y-4">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
          <p className="text-slate-300 text-sm mb-4">{user.phone}</p>
          <div className="bg-white/10 p-3 rounded-lg text-xs backdrop-blur-md border border-white/10">
            <p className="opacity-80">Address:</p>
            <p className="font-medium">{user.address}, {user.upazila}, {user.district}</p>
          </div>
        </div>
        <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-500 rounded-full blur-2xl opacity-50"></div>
      </div>
      <div className="bg-white rounded-xl border border-slate-100 divide-y">
        <button className="w-full flex items-center justify-between p-4 hover:bg-slate-50" onClick={()=>setIsEditing(true)}><div className="flex items-center gap-3"><Edit3 size={18} className="text-slate-500"/> <span className="text-sm font-bold">Edit Profile</span></div><ChevronRight size={16} className="text-slate-400"/></button>
        <button className="w-full flex items-center justify-between p-4 hover:bg-red-50 text-red-500" onClick={()=>{setUser(null); setIsEditing(true);}}><div className="flex items-center gap-3"><LogOut size={18}/> <span className="text-sm font-bold">Logout</span></div></button>
      </div>
    </div>
  );
}

function CartDrawer({ cart, setCart, onClose, user }) {
  const [payment, setPayment] = useState('cod');
  const total = cart.reduce((a,b)=>a+(b.price*b.qty),0) + CONFIG.deliveryCharge;

  const handleCheckout = () => {
    if(!user) return alert("Please create an account first!");
    const order = { id: Date.now(), user, items: cart, total, payment, date: new Date().toLocaleString() };
    const oldOrders = JSON.parse(localStorage.getItem('royce_orders') || '[]');
    localStorage.setItem('royce_orders', JSON.stringify([order, ...oldOrders]));
    alert("Order Placed Successfully!");
    setCart([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-slate-50 h-full shadow-2xl flex flex-col animate-slideInRight">
        <div className="bg-white p-4 flex justify-between items-center shadow-sm z-10"><h3 className="font-bold text-lg">My Cart ({cart.length})</h3><button onClick={onClose}><X size={20}/></button></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? <div className="flex flex-col items-center justify-center h-full text-slate-400"><ShoppingCart size={48} className="mb-4 opacity-20"/><p>Your cart is empty</p></div> : (
            <>
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-100 flex gap-3 shadow-sm">
                    <img src={item.images[0]} className="w-20 h-20 rounded-lg object-cover bg-slate-50" />
                    <div className="flex-1 flex flex-col justify-between">
                      <h4 className="font-bold text-sm line-clamp-1">{item.name}</h4>
                      <div className="flex justify-between items-center">
                        <p className="text-orange-600 font-bold">৳{item.price}</p>
                        <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-2 py-1"><button onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:Math.max(1,i.qty-1)}:i))} className="font-bold">-</button><span className="text-xs font-bold w-4 text-center">{item.qty}</span><button onClick={()=>setCart(cart.map(i=>i.id===item.id?{...i,qty:i.qty+1}:i))} className="font-bold">+</button></div>
                      </div>
                    </div>
                    <button onClick={()=>setCart(cart.filter(i=>i.id!==item.id))} className="text-slate-300 hover:text-red-500 self-start"><Trash2 size={16}/></button>
                  </div>
                ))}
              </div>
              {user ? (
                <div className="bg-white p-4 rounded-xl border border-slate-100">
                  <h4 className="font-bold text-xs uppercase text-slate-500 mb-2">Shipping To</h4>
                  <p className="font-bold text-sm">{user.name} ({user.phone})</p>
                  <p className="text-slate-500 text-xs mt-1">{user.address}, {user.upazila}, {user.district}</p>
                </div>
              ) : (
                <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 text-center"><p className="text-sm text-orange-800">Please login to checkout</p></div>
              )}
            </>
          )}
        </div>
        {cart.length > 0 && (
          <div className="bg-white border-t p-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
            <div className="flex justify-between text-lg font-black text-slate-900 mb-4"><span>Total</span><span>৳{total}</span></div>
            <button onClick={handleCheckout} disabled={!user} className="w-full bg-orange-600 text-white py-3.5 rounded-xl font-bold shadow-lg disabled:opacity-50">Checkout ({cart.length})</button>
          </div>
        )}
      </div>
    </div>
  );
}

function ProductDetails({ product, onBack, onAdd }) {
  const [activeImg, setActiveImg] = useState(0);
  return (
    <div className="animate-slideInRight pb-10">
      <button onClick={onBack} className="flex items-center text-sm text-slate-500 hover:text-slate-900 mb-4 font-medium"><ChevronLeft size={18}/> Back</button>
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <img src={product.images[activeImg]} className="w-full aspect-square object-cover rounded-2xl bg-slate-100" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4"><Star size={14} fill="currentColor" className="text-yellow-400"/><span className="text-sm font-bold">{product.rating}</span></div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
            <span className="text-3xl font-black text-slate-900">৳{product.price}</span>
            <span className="text-lg text-slate-400 line-through ml-3">৳{product.originalPrice}</span>
          </div>
          <p className="text-sm text-slate-600 mb-8">{product.details}</p>
          <div className="fixed bottom-[60px] left-0 right-0 p-3 bg-white/90 backdrop-blur border-t flex gap-3 z-20 md:hidden">
            <button onClick={() => onAdd(product)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-bold text-sm">Cart</button>
            <button onClick={() => { onAdd(product); document.querySelector('.cart-btn')?.click(); }} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg">Buy Now</button>
          </div>
        </div>
      </div>
    </div>
  );
}

