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
  Lock
} from 'lucide-react';

// --- Product Data (JSON Structure for easy CMS migration) ---
const PRODUCTS = [
  {
    id: 'royce-lumina-01',
    name: "Royce Lumina Desk Lamp",
    price: 89.00,
    tagline: "Productivity, Illuminated.",
    description: "The ultimate productivity companion. Features 4 color modes, wireless charging base, and a sleek brushed aluminum finish designed for the modern workspace.",
    features: [
      "15W Qi-Certified Fast Wireless Charging",
      "Flicker-free Eye Protection Technology",
      "Touch-sensitive Dimming & Color Control",
      "Auto-timer (30/60 mins) for Energy Efficiency"
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
    price: 129.00,
    tagline: "Silence the World.",
    description: "Next-generation noise cancellation for the modern traveler. Featuring 40-hour battery life and spatial audio immersion that makes every flight feel like a front-row seat.",
    features: [
      "Hybrid Active Noise Cancellation (45dB)",
      "40hr Combined Battery Life with Quick Charge",
      "Waterproof IPX7 - Sweat & Rain Proof",
      "Bluetooth 5.3 Low Latency Mode"
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
    tagline: "Power that Sticks.",
    description: "Slim, powerful, and stays attached. This 10,000mAh MagSafe compatible pack ensures your tech never dies while maintaining a footprint thinner than your smartphone.",
    features: [
      "N52 Neodymium Magnets for Strong Grip",
      "20W USB-C Power Delivery (PD)",
      "Real-time Digital Battery Percentage Display",
      "Ultra-slim 11mm Aerospace-grade Aluminum"
    ],
    image: "https://images.unsplash.com/photo-1619131666671-12f689e30a84?auto=format&fit=crop&q=80&w=800",
    gallery: [
      "https://images.unsplash.com/photo-1619131666671-12f689e30a84?auto=format&fit=crop&q=80&w=800"
    ]
  }
];

// --- UI Components ---

const PulseButton = ({ children, onClick, className = "" }) => (
  <button 
    onClick={onClick}
    className={`group relative bg-blue-600 text-white font-bold py-5 px-8 rounded-lg transition-all active:scale-95 hover:bg-blue-700 overflow-hidden shadow-xl shadow-blue-500/20 ${className}`}
  >
    <span className="relative z-10 flex items-center justify-center gap-2">
      {children}
    </span>
    <span className="absolute inset-0 bg-white/20 animate-pulse group-hover:animate-none"></span>
  </button>
);

const Accordion = ({ title, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        className="w-full py-5 flex justify-between items-center text-left focus:outline-none"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{title}</span>
        {isOpen ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {isOpen && (
        <div className="pb-6 text-gray-500 text-sm leading-relaxed animate-in fade-in slide-in-from-top-2 duration-300">
          {children}
        </div>
      )}
    </div>
  );
};

// --- Main Application ---

export default function App() {
  const [view, setView] = useState('home'); 
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Persistence (Business logic: recover abandoned carts)
  useEffect(() => {
    const saved = localStorage.getItem('royce_cart');
    if (saved) setCart(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem('royce_cart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);

  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const navigateToProduct = (product) => {
    setSelectedProduct(product);
    setView('product');
    window.scrollTo(0, 0);
  };

  // --- Layout Sections ---

  const Header = () => (
    <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
      isScrolled || view !== 'home' ? 'bg-white/90 backdrop-blur-md py-3 shadow-sm border-b' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Menu className={isScrolled || view !== 'home' ? 'text-black' : 'text-white'} size={24} />
          <h1 
            onClick={() => setView('home')}
            className={`text-2xl font-black tracking-tighter cursor-pointer ${isScrolled || view !== 'home' ? 'text-black' : 'text-white'}`}
          >
            ROYCE<span className="text-blue-600">.</span>
          </h1>
        </div>
        <div className="flex items-center gap-6">
          <Search className={isScrolled || view !== 'home' ? 'text-black' : 'text-white'} size={20} />
          <button onClick={() => setIsCartOpen(true)} className="relative group">
            <ShoppingBag className={isScrolled || view !== 'home' ? 'text-black' : 'text-white'} size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );

  const HomeView = () => (
    <div className="animate-in fade-in duration-700">
      {/* High-Impact Hero */}
      <section className="relative h-[95vh] flex items-center justify-center text-center text-white overflow-hidden bg-black">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/80 z-10"></div>
        <img 
          src="https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&q=80&w=2000" 
          className="absolute inset-0 w-full h-full object-cover opacity-70"
          alt="Premium Gadgets"
        />
        <div className="relative z-20 px-6 max-w-3xl">
          <span className="inline-block px-3 py-1 bg-blue-600/20 backdrop-blur-sm border border-blue-500/30 text-blue-400 text-[10px] font-bold tracking-[0.2em] uppercase mb-6 rounded-full">
            Limited Edition Collection
          </span>
          <h2 className="text-5xl md:text-8xl font-black mb-6 tracking-tighter leading-[0.9]">
            FUTURE <br/> READY.
          </h2>
          <p className="text-lg md:text-xl mb-10 text-gray-300 font-light max-w-lg mx-auto leading-relaxed">
            Curating the world's most sophisticated tech essentials for the modern pioneer.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => document.getElementById('collection').scrollIntoView({ behavior: 'smooth' })}
              className="bg-white text-black font-bold py-5 px-12 rounded-sm hover:bg-gray-100 transition-all uppercase tracking-[0.15em] text-xs"
            >
              Explore Collection
            </button>
          </div>
        </div>
      </section>

      {/* Trust & Conversion Section */}
      <section className="bg-white py-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-between gap-8 md:gap-0">
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">Secure Payment</p>
              <p className="text-xs text-gray-400">Encrypted Stripe Checkout</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <Truck size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">Insured Shipping</p>
              <p className="text-xs text-gray-400">Tracked Global Delivery</p>
            </div>
          </div>
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
              <RotateCcw size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">Easy Returns</p>
              <p className="text-xs text-gray-400">30-Day Money Back</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Grid */}
      <section id="collection" className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
          <div>
            <h3 className="text-4xl font-black tracking-tight mb-2 uppercase">Best Sellers</h3>
            <p className="text-gray-400 font-medium">Engineered for excellence.</p>
          </div>
          <div className="flex gap-4">
            <span className="text-sm font-bold border-b-2 border-black pb-1">ALL</span>
            <span className="text-sm font-bold text-gray-300 hover:text-black cursor-pointer pb-1 transition-colors">CHARGING</span>
            <span className="text-sm font-bold text-gray-300 hover:text-black cursor-pointer pb-1 transition-colors">AUDIO</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {PRODUCTS.map(product => (
            <div key={product.id} className="group flex flex-col">
              <div 
                onClick={() => navigateToProduct(product)}
                className="relative aspect-[4/5] bg-gray-100 rounded-2xl overflow-hidden cursor-pointer mb-6 shadow-sm hover:shadow-2xl transition-all duration-500"
              >
                <img 
                  src={product.image} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                  alt={product.name}
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">In Stock</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                  <button 
                    onClick={(e) => { e.stopPropagation(); addToCart(product); }}
                    className="w-full bg-white text-black font-bold py-4 rounded-xl shadow-xl flex items-center justify-center gap-2 hover:bg-black hover:text-white transition-colors"
                  >
                    <Plus size={18} /> QUICK ADD
                  </button>
                </div>
              </div>
              <div className="flex justify-between items-start">
                <div onClick={() => navigateToProduct(product)} className="cursor-pointer">
                  <h4 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                  <p className="text-sm text-gray-400 font-medium mt-1">{product.tagline}</p>
                </div>
                <p className="text-xl font-black text-gray-900">${product.price.toFixed(2)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const ProductView = () => (
    <div className="pt-24 animate-in slide-in-from-bottom-8 duration-700 bg-white">
      <div className="max-w-7xl mx-auto px-6 pb-24 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Media */}
        <div className="space-y-6">
          <div className="aspect-square bg-gray-50 rounded-[2rem] overflow-hidden shadow-inner border border-gray-100">
            <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
          </div>
          <div className="grid grid-cols-4 gap-4">
            {selectedProduct.gallery.map((img, i) => (
              <div key={i} className="aspect-square rounded-xl overflow-hidden border-2 border-transparent hover:border-blue-600 transition-all cursor-pointer">
                <img src={img} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Sales Copy */}
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest mb-4">
            <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
            Limited Stock Available
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-2 leading-none uppercase">{selectedProduct.name}</h2>
          <div className="flex items-center gap-4 mb-8">
            <p className="text-3xl font-black text-blue-600">${selectedProduct.price.toFixed(2)}</p>
            <div className="h-6 w-[1px] bg-gray-200"></div>
            <p className="text-sm text-gray-400 font-medium line-through">${(selectedProduct.price * 1.4).toFixed(2)}</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-2xl mb-8">
            <p className="text-gray-600 leading-relaxed font-medium">
              {selectedProduct.description}
            </p>
          </div>

          <div className="flex flex-col gap-4 mb-10">
            <PulseButton 
              onClick={() => addToCart(selectedProduct)}
              className="w-full text-lg uppercase tracking-widest"
            >
              ADD TO CART <ShoppingBag size={20} />
            </PulseButton>
            <div className="flex justify-center items-center gap-6 text-[10px] text-gray-400 uppercase font-bold tracking-widest">
               <span className="flex items-center gap-1"><Lock size={12}/> Secure 256-bit SSL</span>
               <span className="flex items-center gap-1"><RotateCcw size={12}/> Easy Returns</span>
            </div>
          </div>

          <div className="border-t border-gray-100">
            <Accordion title="Premium Specs">
              <ul className="space-y-4">
                {selectedProduct.features.map((f, i) => (
                  <li key={i} className="flex gap-3 text-gray-600 font-medium">
                    <span className="text-blue-600">•</span> {f}
                  </li>
                ))}
              </ul>
            </Accordion>
            <Accordion title="Shipping & Logistics">
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                  <Truck className="text-blue-600" />
                  <div>
                    <p className="font-bold text-blue-900 text-sm">Free Global Shipping</p>
                    <p className="text-xs text-blue-800 opacity-70">10-15 Business Days to US/Canada</p>
                  </div>
                </div>
                <p>All Royce orders are processed within 24 hours. Once shipped, you will receive a real-time tracking number via email.</p>
              </div>
            </Accordion>
            <Accordion title="Our Guarantee">
              <p>We stand behind the engineering of every Royce product. If your gadget isn't performing as expected within 30 days, we'll replace it or refund you in full. No questions asked.</p>
            </Accordion>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bar - Business Critical for Conversion */}
      <div className="lg:hidden fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-gray-100 p-4 z-[60] flex items-center justify-between gap-6 shadow-2xl">
        <div className="flex flex-col">
          <span className="text-[10px] text-gray-400 uppercase font-black">Limited Time</span>
          <span className="text-lg font-black text-gray-900">${selectedProduct.price.toFixed(2)}</span>
        </div>
        <button 
          onClick={() => addToCart(selectedProduct)}
          className="flex-1 bg-blue-600 text-white py-4 rounded-xl font-black text-sm tracking-widest uppercase shadow-lg shadow-blue-500/30"
        >
          CLAIM NOW
        </button>
      </div>
    </div>
  );

  const CheckoutView = () => (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-12">
           <h1 onClick={() => setView('home')} className="text-2xl font-black tracking-tighter cursor-pointer">ROYCE<span className="text-blue-600">.</span></h1>
           <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
             <Lock size={14} /> SECURE CHECKOUT
           </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Form Side */}
          <div className="flex-[1.5] space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-8 uppercase flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">1</span>
                Shipping Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <input type="text" placeholder="First Name" className="p-4 bg-gray-50 border-none rounded-xl w-full focus:ring-2 focus:ring-blue-600 outline-none font-medium" />
                <input type="text" placeholder="Last Name" className="p-4 bg-gray-50 border-none rounded-xl w-full focus:ring-2 focus:ring-blue-600 outline-none font-medium" />
                <input type="email" placeholder="Email Address" className="p-4 bg-gray-50 border-none rounded-xl w-full md:col-span-2 focus:ring-2 focus:ring-blue-600 outline-none font-medium" />
                <input type="text" placeholder="Shipping Address" className="p-4 bg-gray-50 border-none rounded-xl w-full md:col-span-2 focus:ring-2 focus:ring-blue-600 outline-none font-medium" />
                <input type="text" placeholder="City" className="p-4 bg-gray-50 border-none rounded-xl w-full focus:ring-2 focus:ring-blue-600 outline-none font-medium" />
                <input type="text" placeholder="Postal Code" className="p-4 bg-gray-50 border-none rounded-xl w-full focus:ring-2 focus:ring-blue-600 outline-none font-medium" />
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-black mb-8 uppercase flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center text-xs">2</span>
                Payment
              </h3>
              <div className="p-6 border-2 border-blue-600 rounded-2xl flex justify-between items-center bg-blue-50/20 mb-6">
                <div className="flex items-center gap-4">
                  <CreditCard size={24} className="text-blue-600" />
                  <span className="font-bold">Credit / Debit Card</span>
                </div>
                <div className="flex gap-2 grayscale">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
                  <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-4" />
                </div>
              </div>
              <p className="text-xs text-gray-400 font-medium">Your payment is processed by Stripe. We do not store your credit card information.</p>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all shadow-2xl shadow-blue-600/30 flex items-center justify-center gap-3">
              COMPLETE PURCHASE — ${(cartTotal + 9.99).toFixed(2)}
            </button>
          </div>

          {/* Sidebar Side */}
          <div className="flex-1 space-y-6">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 h-fit sticky top-12">
              <h3 className="text-lg font-black mb-8 uppercase">Order Summary</h3>
              <div className="space-y-6 mb-8 max-h-[400px] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 group">
                    <div className="relative flex-shrink-0">
                      <img src={item.image} className="w-20 h-20 object-cover rounded-2xl border bg-gray-50" />
                      <span className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center font-bold border-2 border-white">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 text-sm flex flex-col justify-center">
                      <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.name}</p>
                      <p className="text-gray-400 font-medium mt-1">${item.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-6 space-y-4">
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400">Subtotal</span>
                  <span>${cartTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm font-medium">
                  <span className="text-gray-400">Shipping</span>
                  <span className="text-emerald-600 font-bold">$9.99</span>
                </div>
                <div className="flex justify-between text-xl font-black pt-6 border-t mt-4 text-gray-900">
                  <span>TOTAL</span>
                  <span>USD ${(cartTotal + 9.99).toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 flex gap-4">
              <ShieldCheck className="text-emerald-600 flex-shrink-0" />
              <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                <span className="font-bold block mb-1 uppercase">Buyer Protection</span>
                Shop with confidence. Your purchase is protected by the Royce Guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="antialiased selection:bg-blue-100 selection:text-blue-900">
      {view !== 'checkout' && <Header />}
      
      <main className="bg-white">
        {view === 'home' && <HomeView />}
        {view === 'product' && <ProductView />}
        {view === 'checkout' && <CheckoutView />}
      </main>

      {/* Modern Footer */}
      {view !== 'checkout' && (
        <footer className="bg-black text-white pt-24 pb-12 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 md:gap-8">
            <div className="space-y-6">
              <h4 className="text-2xl font-black tracking-tighter italic">ROYCE<span className="text-blue-600">.</span></h4>
              <p className="text-gray-500 text-sm leading-relaxed max-w-xs">
                Premium tech essentials for those who move the needle. Designed in North America. Built for the world.
              </p>
            </div>
            <div>
              <h5 className="font-black mb-8 text-[10px] uppercase tracking-[0.3em] text-blue-600">Navigation</h5>
              <ul className="space-y-4 text-sm font-bold text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer" onClick={() => setView('home')}>Storefront</li>
                <li className="hover:text-white transition-colors cursor-pointer">Our Mission</li>
                <li className="hover:text-white transition-colors cursor-pointer">Contact Support</li>
              </ul>
            </div>
            <div>
              <h5 className="font-black mb-8 text-[10px] uppercase tracking-[0.3em] text-blue-600">Policy</h5>
              <ul className="space-y-4 text-sm font-bold text-gray-400">
                <li className="hover:text-white transition-colors cursor-pointer">Shipping Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">Refund Policy</li>
                <li className="hover:text-white transition-colors cursor-pointer">Terms & Conditions</li>
              </ul>
            </div>
            <div>
              <h5 className="font-black mb-8 text-[10px] uppercase tracking-[0.3em] text-blue-600">Access</h5>
              <p className="text-xs text-gray-500 mb-6">Join the list for drop notifications.</p>
              <div className="flex border-b border-gray-800 pb-2">
                <input type="email" placeholder="EMAIL ADDRESS" className="bg-transparent outline-none w-full text-[10px] font-bold tracking-widest uppercase" />
                <ChevronRight size={18} className="text-blue-600" />
              </div>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-gray-900 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">© 2024 THE ROYCE DOMINION. ALL RIGHTS RESERVED.</p>
            <div className="flex gap-6 opacity-40 grayscale hover:grayscale-0 transition-all">
              <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" className="h-4" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" className="h-6" />
              <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" className="h-4" />
            </div>
          </div>
        </footer>
      )}

      {/* Cart Slider */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl animate-in slide-in-from-right duration-500 flex flex-col">
            <div className="p-8 border-b flex justify-between items-center bg-gray-50/50">
              <h2 className="text-2xl font-black uppercase tracking-tighter">Cart <span className="text-blue-600">({cartCount})</span></h2>
              <button onClick={() => setIsCartOpen(false)} className="hover:rotate-90 transition-transform p-2 bg-white rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {cart.length === 0 ? (
                <div className="text-center py-32">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                    <ShoppingBag size={32} />
                  </div>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Your bag is currently empty</p>
                  <button onClick={() => { setIsCartOpen(false); setView('home'); }} className="mt-8 text-blue-600 text-sm font-black underline uppercase tracking-tighter">Discover Products</button>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex gap-6">
                    <img src={item.image} className="w-24 h-24 object-cover rounded-2xl border" />
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-sm uppercase tracking-tight">{item.name}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500"><X size={16} /></button>
                        </div>
                        <p className="text-blue-600 font-black mt-1">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-gray-50 rounded-lg p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-2 hover:bg-white rounded-md transition-colors"><Minus size={12} /></button>
                          <span className="w-8 text-center text-sm font-black">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-2 hover:bg-white rounded-md transition-colors"><Plus size={12} /></button>
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
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Estimated Total</span>
                  <span className="text-2xl font-black">${cartTotal.toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); setView('checkout'); window.scrollTo(0,0); }}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black tracking-widest uppercase shadow-xl shadow-blue-600/20 hover:bg-blue-700 transition-all"
                >
                  CHECKOUT NOW
                </button>
                <div className="flex justify-center items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                  <ShieldCheck size={14} /> 100% Secure Checkout
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

