'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ChevronRight, 
  Truck, 
  ShieldCheck, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp,
  Plus,
  Minus,
  CreditCard,
  Lock,
  Star,
  Timer,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

// --- Product Data with Variants & Reviews ---
const PRODUCTS = [
  {
    id: 'royce-lumina-01',
    name: "Royce Lumina Desk Lamp",
    price: 89.00,
    oldPrice: 129.00,
    tagline: "Professional Lighting",
    rating: 4.9,
    reviews: 128,
    description: "The ultimate productivity companion. Features 4 color modes, wireless charging base, and a sleek brushed aluminum finish.",
    variants: ["Space Gray", "Silver", "Midnight"],
    features: [
      "15W Qi Fast Wireless Charging",
      "4 Color Temperatures (3000K-6000K)",
      "Touch-sensitive Dimming Control",
      "Auto-off Sleep Timer"
    ],
    image: "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1534073828943-f801091bb18c?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: 'aeropod-pro-02',
    name: "AeroPod Pro Max G3",
    price: 159.00,
    oldPrice: 219.00,
    tagline: "Immersive Audio",
    rating: 4.8,
    reviews: 254,
    description: "Experience silence like never before. Industry-leading noise cancellation and 40-hour battery life.",
    variants: ["Onyx Black", "Cloud White"],
    features: [
      "Active Noise Cancellation (ANC)",
      "Transparency Mode",
      "Spatial Audio with Dynamic Tracking",
      "40 Hours Total Playback"
    ],
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&q=80&w=800"
    ]
  },
  {
    id: 'titan-mag-03',
    name: "Titan Magnetic Power Bank",
    price: 54.00,
    oldPrice: 79.00,
    tagline: "Ultra-Portable Power",
    rating: 5.0,
    reviews: 89,
    description: "Magnetic snap-on power that fits in your pocket. Compatible with all MagSafe devices.",
    variants: ["Titanium Grey", "Tech Blue"],
    features: [
      "Strong N52 Magnetic Attachment",
      "10,000mAh High Density Battery",
      "20W USB-C PD Fast Charging",
      "LCD Battery Percentage Display"
    ],
    image: "https://images.unsplash.com/photo-1619131666671-12f689e30a84?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1619131666671-12f689e30a84?auto=format&fit=crop&q=80&w=800"
    ]
  }
];

// --- Specialized Components ---

const AnnouncementBar = () => (
  <div className="bg-black text-white text-[10px] md:text-xs font-bold py-2.5 px-4 text-center tracking-[0.1em] uppercase overflow-hidden whitespace-nowrap border-b border-white/10">
    <div className="inline-block animate-marquee whitespace-nowrap">
      FREE WORLDWIDE SHIPPING ON ALL ORDERS OVER $100 — BUY 2 GET 15% OFF — LIMITED STOCK AVAILABLE — 
    </div>
  </div>
);

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ h: 12, m: 45, s: 0 });
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { h, m, s } = prev;
        if (s > 0) s--;
        else if (m > 0) { m--; s = 59; }
        else if (h > 0) { h--; m = 59; s = 59; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex items-center gap-2 text-red-600 font-bold text-xs">
      <Timer size={14} />
      <span>FLASH SALE ENDS IN: {String(timeLeft.h).padStart(2,'0')}:{String(timeLeft.m).padStart(2,'0')}:{String(timeLeft.s).padStart(2,'0')}</span>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [view, setView] = useState('home'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState('');
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('royce_cart_v2');
    if (saved) setCart(JSON.parse(saved));
    
    const handleScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    localStorage.setItem('royce_cart_v2', JSON.stringify(cart));
  }, [cart]);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const addToCart = (product, variant = '') => {
    setCart(prev => {
      const cartId = `${product.id}-${variant}`;
      const existing = prev.find(item => item.cartId === cartId);
      if (existing) {
        return prev.map(item => item.cartId === cartId ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, cartId, variant, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (cartId) => {
    setCart(prev => prev.filter(item => item.cartId !== cartId));
  };

  const updateQuantity = (cartId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartId === cartId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const navigateToProduct = (product) => {
    setSelectedProduct(product);
    setSelectedVariant(product.variants[0]);
    setView('product');
    window.scrollTo(0, 0);
  };

  // --- Views ---

  const Header = () => (
    <div className="fixed top-0 left-0 w-full z-50">
      <AnnouncementBar />
      <header className={`transition-all duration-300 ${
        isScrolled || view !== 'home' ? 'bg-white shadow-md py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Menu className={isScrolled || view !== 'home' ? 'text-black' : 'text-white'} size={24} />
            <h1 
              onClick={() => setView('home')}
              className={`text-2xl font-black tracking-tighter cursor-pointer ${isScrolled || view !== 'home' ? 'text-black' : 'text-white'}`}
            >
              ROYCE<span className="text-blue-600">.</span>
            </h1>
          </div>
          
          <nav className={`hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest ${isScrolled || view !== 'home' ? 'text-black' : 'text-white'}`}>
             <span className="cursor-pointer hover:opacity-70">Shop All</span>
             <span className="cursor-pointer hover:opacity-70">New Arrivals</span>
             <span className="cursor-pointer hover:opacity-70">Support</span>
          </nav>

          <div className="flex items-center gap-5">
            <Search className={isScrolled || view !== 'home' ? 'text-black' : 'text-white'} size={20} />
            <button onClick={() => setIsCartOpen(true)} className="relative group">
              <ShoppingBag className={isScrolled || view !== 'home' ? 'text-black' : 'text-white'} size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>
    </div>
  );

  const HomeView = () => (
    <div className="animate-in fade-in duration-1000">
      {/* Hero Section - Dawn Theme Style */}
      <section className="relative h-[100vh] md:h-[90vh] flex items-center bg-black overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
          alt="Hero"
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white">
          <div className="max-w-xl">
            <p className="text-blue-500 font-black text-xs uppercase tracking-[0.3em] mb-4">Summer Tech Drop 2024</p>
            <h2 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9] uppercase">
              The Gold Standard <br/> of Tech.
            </h2>
            <p className="text-lg md:text-xl mb-10 text-gray-300 font-light leading-relaxed">
              Premium gadgets engineered for those who refuse to settle. Join the elite Royce club today.
            </p>
            <button 
              onClick={() => document.getElementById('grid').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-black font-bold py-5 px-12 rounded-sm hover:scale-105 transition-all uppercase tracking-widest text-xs"
            >
              Shop Collection
            </button>
          </div>
        </div>
      </section>

      {/* Social Proof / Trust */}
      <div className="bg-gray-50 border-y py-12">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {['As Seen On Wired', 'Trusted by 50k+', 'Fast US Shipping', 'Money-Back Guarantee'].map((text, i) => (
            <div key={i} className="text-center">
               <p className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">{text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Grid */}
      <section id="grid" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4">Elite Best Sellers</h3>
          <div className="h-1 w-20 bg-blue-600 mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {PRODUCTS.map(product => (
            <div key={product.id} className="group cursor-pointer">
              <div 
                onClick={() => navigateToProduct(product)}
                className="relative aspect-[4/5] bg-gray-100 rounded-3xl overflow-hidden mb-6 shadow-sm border border-gray-100"
              >
                <img 
                  src={product.image} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  alt={product.name}
                />
                <div className="absolute top-4 left-4 bg-white/90 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  -{Math.round((1 - product.price/product.oldPrice)*100)}% SALE
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h4 className="text-xl font-black uppercase tracking-tight">{product.name}</h4>
                  <div className="flex items-center gap-1">
                    <Star size={12} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-bold">{product.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-blue-600">${product.price.toFixed(2)}</span>
                  <span className="text-gray-400 line-through text-sm font-bold">${product.oldPrice.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => addToCart(product, product.variants[0])}
                  className="w-full border-2 border-black py-3 font-black text-xs uppercase tracking-widest mt-4 hover:bg-black hover:text-white transition-all"
                >
                  Quick Add
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const ProductView = () => (
    <div className="pt-32 animate-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 mb-24">
        {/* Sticky Images */}
        <div className="lg:sticky lg:top-32 h-fit space-y-6">
          <div className="aspect-square rounded-[2rem] overflow-hidden bg-gray-50 border shadow-inner">
            <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
          </div>
          <div className="flex gap-4">
            {selectedProduct.gallery.map((img, i) => (
              <div key={i} className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-transparent hover:border-blue-600 cursor-pointer">
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col">
          <CountdownTimer />
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter my-4 leading-none">
            {selectedProduct.name}
          </h2>
          <div className="flex items-center gap-4 mb-8">
            <div className="flex">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
            </div>
            <span className="text-sm font-bold text-gray-500 underline uppercase tracking-widest">{selectedProduct.reviews} Verified Reviews</span>
          </div>

          <div className="flex items-center gap-6 mb-10">
            <p className="text-4xl font-black text-blue-600">${selectedProduct.price.toFixed(2)}</p>
            <span className="text-xl text-gray-400 line-through font-bold">${selectedProduct.oldPrice.toFixed(2)}</span>
            <span className="bg-red-50 text-red-600 px-3 py-1 rounded text-xs font-black uppercase">Save ${(selectedProduct.oldPrice - selectedProduct.price).toFixed(2)}</span>
          </div>

          {/* Variants */}
          <div className="mb-10">
            <p className="text-xs font-black uppercase tracking-widest mb-4">Color: <span className="text-blue-600">{selectedVariant}</span></p>
            <div className="flex gap-3">
              {selectedProduct.variants.map(v => (
                <button 
                  key={v}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-6 py-3 border-2 rounded-xl font-bold text-sm transition-all ${
                    selectedVariant === v ? 'border-blue-600 bg-blue-50/50 text-blue-600' : 'border-gray-200 hover:border-black'
                  }`}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={() => addToCart(selectedProduct, selectedVariant)}
            className="group relative w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all active:scale-[0.98]"
          >
            ADD TO CART
            <span className="absolute inset-0 bg-white/20 animate-pulse rounded-2xl"></span>
          </button>

          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
               <CheckCircle2 size={20} className="text-emerald-600" />
               <span className="text-[10px] font-black uppercase">Secure Checkout</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
               <CheckCircle2 size={20} className="text-emerald-600" />
               <span className="text-[10px] font-black uppercase">Verified Authentic</span>
            </div>
          </div>

          <div className="mt-12 space-y-2 border-t pt-8">
            <Accordion title="Key Innovations">
               <ul className="space-y-3">
                 {selectedProduct.features.map((f, i) => (
                   <li key={i} className="flex gap-3 text-sm text-gray-600 font-medium">
                     <div className="w-1.5 h-1.5 rounded-full bg-blue-600 mt-2"></div>
                     {f}
                   </li>
                 ))}
               </ul>
            </Accordion>
            <Accordion title="Shipping & Returns">
               <p className="text-sm text-gray-600 leading-relaxed">
                 We ship globally from our US hub. Orders processed within 24h. <br/><br/>
                 - US/Canada: 7-12 Days <br/>
                 - Worldwide: 10-15 Days <br/><br/>
                 Not satisfied? Return within 30 days for a full refund.
               </p>
            </Accordion>
          </div>
        </div>
      </div>
      
      {/* Mobile Sticky Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md p-4 z-[60] border-t shadow-2xl flex items-center justify-between gap-4">
        <div className="flex flex-col">
           <span className="text-[10px] font-black text-blue-600">ROYCE EXCLUSIVE</span>
           <span className="text-xl font-black">${selectedProduct.price.toFixed(2)}</span>
        </div>
        <button 
          onClick={() => addToCart(selectedProduct, selectedVariant)}
          className="flex-1 bg-black text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest"
        >
          Buy Now
        </button>
      </div>
    </div>
  );

  const CheckoutView = () => (
    <div className="min-h-screen bg-[#f4f4f4] py-12 px-6">
      <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-12">
        <div className="flex-[2] space-y-8">
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm">
             <h3 className="text-2xl font-black mb-10 flex items-center gap-4 uppercase italic">
               <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center not-italic">1</span>
               Shipping
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <input type="text" placeholder="First Name" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-600 font-bold" />
               <input type="text" placeholder="Last Name" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-600 font-bold" />
               <input type="email" placeholder="Email Address" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-600 font-bold md:col-span-2" />
               <input type="text" placeholder="Full Address" className="w-full p-4 bg-gray-50 border-none rounded-2xl outline-none focus:ring-2 ring-blue-600 font-bold md:col-span-2" />
             </div>
          </div>
          
          <div className="bg-white p-10 rounded-[2.5rem] shadow-sm">
             <h3 className="text-2xl font-black mb-10 flex items-center gap-4 uppercase italic">
               <span className="bg-black text-white w-10 h-10 rounded-full flex items-center justify-center not-italic">2</span>
               Payment
             </h3>
             <div className="p-8 border-4 border-blue-600 rounded-[2rem] bg-blue-50/30 flex justify-between items-center">
               <div className="flex items-center gap-4 font-black uppercase text-blue-600">
                 <CreditCard size={32} />
                 <span>Card / Apple Pay / G-Pay</span>
               </div>
               <Lock size={24} className="text-blue-600" />
             </div>
          </div>

          <button className="w-full bg-blue-600 text-white py-8 rounded-[2rem] font-black text-2xl uppercase tracking-[0.2em] shadow-2xl shadow-blue-600/40 hover:scale-[1.02] transition-transform">
            Pay Now — ${(cartTotal + 9.99).toFixed(2)}
          </button>
        </div>

        <div className="flex-1 bg-white p-8 rounded-[2.5rem] shadow-sm h-fit sticky top-10">
          <h3 className="text-xl font-black mb-8 uppercase">Your Order</h3>
          <div className="space-y-6 mb-10">
            {cart.map(item => (
              <div key={item.cartId} className="flex gap-4">
                <div className="relative">
                  <img src={item.image} className="w-20 h-20 object-cover rounded-2xl" />
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] border-2 border-white">{item.quantity}</span>
                </div>
                <div className="flex-1 py-1">
                  <p className="font-black text-xs uppercase">{item.name}</p>
                  <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-widest">{item.variant}</p>
                  <p className="font-black text-sm mt-1 text-blue-600">${item.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="border-t pt-6 space-y-4">
            <div className="flex justify-between text-sm font-bold text-gray-400 uppercase"><span>Subtotal</span><span>${cartTotal.toFixed(2)}</span></div>
            <div className="flex justify-between text-sm font-bold text-gray-400 uppercase"><span>Shipping</span><span className="text-emerald-600">FREE</span></div>
            <div className="flex justify-between text-2xl font-black pt-6 border-t mt-4"><span>TOTAL</span><span>USD ${(cartTotal).toFixed(2)}</span></div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white min-h-screen">
      {view !== 'checkout' && <Header />}
      
      <main>
        {view === 'home' && <HomeView />}
        {view === 'product' && <ProductView />}
        {view === 'checkout' && <CheckoutView />}
      </main>

      {/* Footer */}
      {view !== 'checkout' && (
        <footer className="bg-black text-white py-20 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="col-span-1 md:col-span-2">
               <h4 className="text-4xl font-black tracking-tighter mb-8 italic">ROYCE<span className="text-blue-600">.</span></h4>
               <p className="text-gray-500 text-lg leading-relaxed max-w-md">
                 Redefining tech since 2024. We don't just sell gadgets; we sell the future of high-performance living.
               </p>
            </div>
            <div>
               <h5 className="font-black uppercase text-blue-600 text-[10px] tracking-[0.3em] mb-8">Navigation</h5>
               <ul className="space-y-4 font-bold text-sm uppercase text-gray-400 tracking-widest">
                 <li onClick={() => setView('home')} className="hover:text-white cursor-pointer">Frontpage</li>
                 <li className="hover:text-white cursor-pointer">All Collections</li>
                 <li className="hover:text-white cursor-pointer">Support Center</li>
               </ul>
            </div>
            <div>
               <h5 className="font-black uppercase text-blue-600 text-[10px] tracking-[0.3em] mb-8">Join the Elite</h5>
               <p className="text-xs text-gray-500 mb-6">Drop notifications & VIP pricing.</p>
               <div className="flex border-b border-gray-800 pb-2">
                 <input type="email" placeholder="EMAIL ADDRESS" className="bg-transparent outline-none w-full text-[10px] font-bold tracking-[0.2em]" />
                 <ArrowRight size={18} className="text-blue-600" />
               </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-10">
             <p className="text-[10px] font-bold text-gray-600 tracking-[0.3em]">© 2024 THE ROYCE. NORTH AMERICAN LUXURY TECH.</p>
             <div className="flex gap-6 opacity-40">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" />
             </div>
          </div>
        </footer>
      )}

      {/* Cart Drawer - Shopify Dawn Style */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black uppercase tracking-tighter italic">Bag <span className="text-blue-600">({cartCount})</span></h2>
              <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform p-3 bg-white rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {cart.length === 0 ? (
                <div className="text-center py-40">
                  <ShoppingBag size={64} className="mx-auto text-gray-100 mb-6" />
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Your bag is empty</p>
                  <button onClick={() => { setIsCartOpen(false); setView('home'); }} className="mt-8 bg-black text-white px-8 py-4 font-black uppercase text-xs">Start Shopping</button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.cartId} className="flex gap-6">
                    <img src={item.image} className="w-24 h-28 object-cover rounded-2xl border" />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-black text-sm uppercase tracking-tight">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.cartId)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
                        </div>
                        <p className="text-xs font-bold text-blue-600 mt-1 uppercase tracking-widest">{item.variant}</p>
                        <p className="font-black text-sm mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-50 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.cartId, -1)} className="p-2 hover:bg-white rounded-md transition-colors"><Minus size={12} /></button>
                          <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.cartId, 1)} className="p-2 hover:bg-white rounded-md transition-colors"><Plus size={12} /></button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-8 border-t bg-gray-50 space-y-6">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.3em]">Estimated Total</span>
                  <span className="text-3xl font-black">${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); setView('checkout'); window.scrollTo(0,0); }}
                  className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black tracking-[0.2em] uppercase shadow-2xl shadow-blue-600/20"
                >
                  CHECKOUT
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Custom Accordion Component
const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100">
      <button 
        className="w-full py-6 flex justify-between items-center text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-black text-[10px] uppercase tracking-[0.3em] text-gray-400">{title}</span>
        {isOpen ? <Minus size={14} /> : <Plus size={14} />}
      </button>
      {isOpen && <div className="pb-8 animate-in fade-in slide-in-from-top-2 duration-300">{children}</div>}
    </div>
  );
};

