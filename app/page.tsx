import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, X, Phone, MapPin, CheckCircle, Star, 
  Menu, ChevronLeft, ChevronRight, Truck, ShieldCheck, 
  ArrowRight, Search, Plus, Minus, CreditCard, Banknote, 
  Home, Grid, User, Heart, Filter
} from 'lucide-react';

// --- ডিফল্ট কনফিগ ---
const DEFAULT_CONFIG = {
  shopName: "THE ROYCE",
  currency: "৳",
  deliveryCharge: 130,
  phone: "01700000000",
  bkash: "017XXXXXXXX"
};

// --- ডিফল্ট প্রোডাক্ট (ব্যাজ সহ) ---
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

// --- জেলা ও থানা ডাটা ---
const DISTRICTS = ["Dhaka City", "Dhaka Sub-Urb", "Gazipur", "Narayanganj", "Chittagong", "Rajshahi", "Natore", "Khulna", "Sylhet", "Barisal"];
const THANAS = {
  "Dhaka City": ["Adabor", "Badda", "Dhanmondi", "Gulshan", "Mirpur", "Uttara", "Mohammadpur"],
  "Natore": ["Natore Sadar", "Singra", "Baraigram", "Lalpur", "Gurudaspur"],
  "Rajshahi": ["Boalia", "Motihar", "Rajpara", "Paba"],
};

export default function Website() {
  const [view, setView] = useState('home'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // LocalStorage Sync
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  useEffect(() => {
    const storedProducts = localStorage.getItem('royce_products');
    const storedConfig = localStorage.getItem('royce_config');
    const savedCart = localStorage.getItem('royce_cart');
    
    if (storedProducts) setProducts(JSON.parse(storedProducts));
    if (storedConfig) setConfig(JSON.parse(storedConfig));
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  useEffect(() => {
    localStorage.setItem('royce_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product, openDrawer = false) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
    if(openDrawer) setIsCartOpen(true);
  };

  const buyNow = (product) => {
    addToCart(product, true);
  };

  // Review Handle
  const handleReviewSubmit = (productId, newReview) => {
    const updatedProducts = products.map(p => {
      if(p.id === productId) {
        return { ...p, reviews: [newReview, ...(p.reviews || [])] };
      }
      return p;
    });
    setProducts(updatedProducts);
    localStorage.setItem('royce_products', JSON.stringify(updatedProducts));
  };

  // Filter Products
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="font-sans text-slate-900 bg-slate-50 min-h-screen pb-24">
      
      {/* Top Bar (Mobile App Style) */}
      <div className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          {view === 'details' ? (
            <button onClick={() => setView('home')}><ChevronLeft size={24} /></button>
          ) : (
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold">R</div>
          )}
          
          <div className="flex-1 relative">
            <input 
              className="w-full bg-slate-100 border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
              placeholder="Search gadgets..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setView('home'); }}
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          </div>

          <button onClick={() => setIsCartOpen(true)} className="relative">
            <ShoppingCart size={24} className="text-slate-700" />
            {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{cart.reduce((a,b)=>a+b.qty,0)}</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-4">
        {view === 'home' ? (
          <div className="animate-fadeIn">
            
            {/* Banner Slider (Static for now) */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white mb-8 relative overflow-hidden shadow-lg">
              <div className="relative z-10">
                <span className="bg-white/20 text-xs font-bold px-2 py-1 rounded backdrop-blur-sm">NEW ARRIVAL</span>
                <h2 className="text-2xl font-black mt-2 mb-1">Super Gadget Sale</h2>
                <p className="text-slate-300 text-xs mb-4">Get up to 50% Off</p>
                <button className="bg-white text-slate-900 px-4 py-2 rounded-lg text-xs font-bold">Shop Now</button>
              </div>
              <img src="https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400" className="absolute right-0 top-0 h-full w-1/2 object-cover opacity-50 mix-blend-overlay" />
            </div>

            {/* Product Grid (Unique UI) */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-2xl p-3 border border-slate-100 shadow-sm relative group hover:shadow-md transition-all duration-300"
                >
                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded-full z-10">
                      {product.badge}
                    </span>
                  )}
                  
                  {/* Image */}
                  <div 
                    onClick={() => { setSelectedProduct(product); setView('details'); window.scrollTo(0,0); }}
                    className="aspect-[4/5] bg-slate-50 rounded-xl mb-3 overflow-hidden relative cursor-pointer"
                  >
                    <img src={product.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition duration-500" />
                  </div>

                  {/* Content */}
                  <div onClick={() => { setSelectedProduct(product); setView('details'); window.scrollTo(0,0); }} className="cursor-pointer">
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-2 leading-tight mb-1">{product.name}</h3>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-lg font-black text-slate-900">{config.currency}{product.price}</span>
                      <span className="text-xs text-slate-400 line-through">{config.currency}{product.originalPrice}</span>
                    </div>
                  </div>

                  {/* Buy Button */}
                  <button 
                    onClick={() => buyNow(product)}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-slate-200 transition active:scale-95"
                  >
                    Buy Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <ProductDetails 
            product={selectedProduct} 
            config={config}
            onAdd={addToCart} 
            onBuyNow={buyNow}
            onSubmitReview={handleReviewSubmit}
          />
        )}
      </main>

      {/* Bottom Nav (App Feel) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t py-3 px-6 flex justify-between items-center z-30 md:hidden">
        <button onClick={() => setView('home')} className={`flex flex-col items-center gap-1 ${view==='home'?'text-slate-900':'text-slate-400'}`}>
          <Home size={20} /> <span className="text-[10px] font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Grid size={20} /> <span className="text-[10px] font-bold">Categories</span>
        </button>
        <div className="w-12 h-12 bg-slate-900 rounded-full flex items-center justify-center text-white -mt-8 border-4 border-slate-50 shadow-lg" onClick={() => setIsCartOpen(true)}>
          <ShoppingCart size={20} />
        </div>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <Heart size={20} /> <span className="text-[10px] font-bold">Wishlist</span>
        </button>
        <button className="flex flex-col items-center gap-1 text-slate-400">
          <User size={20} /> <span className="text-[10px] font-bold">Account</span>
        </button>
      </div>

      {/* Cart Drawer */}
      {isCartOpen && (
        <CartDrawer 
          cart={cart} 
          setCart={setCart} 
          config={config}
          onClose={() => setIsCartOpen(false)} 
        />
      )}
    </div>
  );
}

// --- Product Details ---
function ProductDetails({ product, config, onAdd, onBuyNow, onSubmitReview }) {
  const [activeImg, setActiveImg] = useState(0);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, text: '' });

  const submitReview = (e) => {
    e.preventDefault();
    if(!reviewForm.name || !reviewForm.text) return alert("Write something!");
    onSubmitReview(product.id, { ...reviewForm, date: new Date().toLocaleDateString() });
    setReviewForm({ name: '', rating: 5, text: '' });
  };

  return (
    <div className="animate-slideInRight pb-10">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Image Gallery */}
        <div className="space-y-3">
          <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden relative">
            <img src={product.images[activeImg]} className="w-full h-full object-cover" />
            <span className="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
              {Math.round(((product.originalPrice - product.price)/product.originalPrice)*100)}% OFF
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {product.images.map((img, i) => (
              <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-lg border-2 overflow-hidden flex-shrink-0 ${activeImg===i ? 'border-slate-900':'border-transparent'}`}>
                <img src={img} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-2">{product.name}</h1>
          <div className="flex items-center gap-2 mb-4">
            <div className="flex text-yellow-400"><Star size={14} fill="currentColor"/></div> 
            <span className="text-sm font-bold">{product.rating}</span>
            <span className="text-slate-400 text-sm">({product.reviews?.length || 0} reviews)</span>
          </div>
          
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 mb-6">
            <div className="flex items-end gap-3">
              <span className="text-3xl font-black text-slate-900">{config.currency}{product.price}</span>
              <span className="text-lg text-slate-400 line-through mb-1">{config.currency}{product.originalPrice}</span>
            </div>
            <p className="text-green-600 text-xs font-bold mt-1">In Stock • Fast Delivery</p>
          </div>

          <div className="space-y-3 mb-8">
            <div className="flex gap-3 text-sm text-slate-600 border-b border-slate-100 pb-3">
              <CheckCircle size={18} className="text-slate-900"/> <span>{product.details}</span>
            </div>
            <div className="flex gap-3 text-sm text-slate-600">
              <ShieldCheck size={18} className="text-slate-900"/> <span>{product.warranty}</span>
            </div>
          </div>

          {/* Action Buttons (Desktop) */}
          <div className="hidden md:flex gap-3 mb-8">
            <button onClick={() => onAdd(product)} className="flex-1 py-4 rounded-xl border-2 border-slate-200 font-bold hover:border-slate-900">Add to Cart</button>
            <button onClick={() => onBuyNow(product)} className="flex-1 py-4 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800">Buy Now</button>
          </div>

          {/* Reviews */}
          <div className="bg-white rounded-xl border p-4">
            <h3 className="font-bold mb-4">Reviews</h3>
            <div className="space-y-4 mb-6">
              {product.reviews?.length === 0 && <p className="text-slate-400 text-sm">No reviews yet.</p>}
              {product.reviews?.map((r, i) => (
                <div key={i} className="bg-slate-50 p-3 rounded-lg text-sm">
                  <div className="flex justify-between font-bold mb-1"><span>{r.user}</span><span className="text-xs text-slate-400">{r.date}</span></div>
                  <p className="text-slate-600">{r.text}</p>
                </div>
              ))}
            </div>
            <form onSubmit={submitReview} className="flex flex-col gap-2">
              <input placeholder="Name" className="border p-2 rounded text-sm" value={reviewForm.name} onChange={e=>setReviewForm({...reviewForm, name:e.target.value})} />
              <textarea placeholder="Review..." className="border p-2 rounded text-sm" rows="2" value={reviewForm.text} onChange={e=>setReviewForm({...reviewForm, text:e.target.value})} />
              <button className="bg-slate-900 text-white py-2 rounded text-sm font-bold">Submit Review</button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Footer */}
      <div className="fixed bottom-[60px] left-0 right-0 p-3 bg-white/90 backdrop-blur border-t flex gap-3 z-20 md:hidden">
        <button onClick={() => onAdd(product)} className="flex-1 py-3 rounded-xl border-2 border-slate-200 font-bold text-sm">Cart</button>
        <button onClick={() => onBuyNow(product)} className="flex-1 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm shadow-lg">Buy Now</button>
      </div>
    </div>
  );
}

// --- Checkout Logic ---
function CartDrawer({ cart, setCart, config, onClose }) {
  const [form, setForm] = useState({ name:'', phone:'', address:'', district:'', thana:'', payment:'cod' });
  const total = cart.reduce((a,b)=>a+(b.price*b.qty),0) + parseInt(config.deliveryCharge);

  const handleOrder = () => {
    if(!form.name || !form.phone || !form.district) return alert("Please fill details!");
    
    const newOrder = {
      id: Date.now(),
      customer: form.name,
      phone: form.phone,
      address: `${form.address}, ${form.thana}, ${form.district}`,
      items: cart,
      total,
      status: 'Pending',
      date: new Date().toLocaleString()
    };

    const existing = JSON.parse(localStorage.getItem('royce_orders') || '[]');
    localStorage.setItem('royce_orders', JSON.stringify([newOrder, ...existing]));
    
    alert("Order Placed Successfully! We will call you.");
    setCart([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slideInRight">
        <div className="p-4 border-b flex justify-between items-center bg-slate-900 text-white">
          <h3 className="font-bold">Checkout</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-6">
          {/* Items */}
          <div className="space-y-3">
            {cart.map(item => (
              <div key={item.id} className="flex gap-3 bg-white p-2 rounded-lg border">
                <img src={item.images[0]} className="w-14 h-14 rounded-md object-cover bg-slate-100"/>
                <div className="flex-1">
                  <h4 className="font-bold text-sm">{item.name}</h4>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-slate-500">{item.qty} x {item.price}</span>
                    <span className="font-bold text-sm">৳{item.price*item.qty}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white p-4 rounded-xl border shadow-sm space-y-3">
            <h4 className="font-bold text-sm border-b pb-2 mb-2">Shipping Details</h4>
            <input placeholder="Name" className="w-full border p-2 rounded text-sm" onChange={e=>setForm({...form,name:e.target.value})}/>
            <input placeholder="Phone" className="w-full border p-2 rounded text-sm" onChange={e=>setForm({...form,phone:e.target.value})}/>
            <div className="grid grid-cols-2 gap-2">
              <select className="border p-2 rounded text-sm" onChange={e=>setForm({...form,district:e.target.value})}>
                <option value="">District</option>
                {DISTRICTS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
              {form.district && THANAS[form.district] && (
                <select className="border p-2 rounded text-sm" onChange={e=>setForm({...form,thana:e.target.value})}>
                  <option value="">Thana</option>
                  {THANAS[form.district].map(t=><option key={t} value={t}>{t}</option>)}
                </select>
              )}
            </div>
            <textarea placeholder="Full Address" className="w-full border p-2 rounded text-sm" rows="2" onChange={e=>setForm({...form,address:e.target.value})}/>
          </div>

          {/* Payment */}
          <div className="bg-white p-4 rounded-xl border shadow-sm">
             <h4 className="font-bold text-sm border-b pb-2 mb-2">Payment</h4>
             <label className="flex items-center gap-2 p-2 border rounded cursor-pointer bg-slate-50">
               <input type="radio" checked readOnly className="accent-slate-900"/>
               <span className="text-sm font-bold">Cash on Delivery</span>
             </label>
          </div>
        </div>

        <div className="p-4 bg-white border-t shadow-[0_-5px_15px_rgba(0,0,0,0.05)]">
          <div className="flex justify-between font-bold text-lg mb-4">
            <span>Total</span><span>{config.currency}{total}</span>
          </div>
          <button onClick={handleOrder} className="w-full bg-slate-900 text-white py-3.5 rounded-xl font-bold hover:bg-slate-800 transition">
            Confirm Order
          </button>
        </div>
      </div>
    </div>
  );
}


