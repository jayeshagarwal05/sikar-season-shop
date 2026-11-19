import React, { useState, useEffect, useMemo } from 'react';
import {
  Search, ShoppingBag, Heart, Star, Eye, ShieldCheck, Truck, RefreshCw,
  Phone, Mail, MapPin, ChevronRight, ChevronLeft, Sparkles, Filter,
  ArrowRight, Store, Check, Award, Feather, Gem, CircleDot,
  Menu, X, ChevronDown, User, Share2, Camera, Clock, Tag
} from 'lucide-react';
import Logo from './Logo';
import { storeInfo, categories } from '../data/products';

export default function Storefront({
  products,
  cartItems,
  wishlistItems,
  onOpenCart,
  onOpenWishlist,
  onQuickView,
  onAddToCart,
  onToggleWishlist,
  onSwitchToPos
}) {
  // Navigation & UI state
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pagesCollapsed, setPagesCollapsed] = useState(false);
  const [categoriesCollapsed, setCategoriesCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [displayLimit, setDisplayLimit] = useState(12);

  // Hero Carousel State
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState(null);

  const heroSlides = [
    {
      id: 'shawls',
      badge: 'Royal Winter Collection',
      tagline: 'Pure Kashmiri Pashmina & Rajasthani Dushalas',
      title: 'Wrap Your Winter in Royal Grandeur',
      description: 'Hand-woven artisan Sozni needlework and pure cashmere wraps tailored for heritage winter weddings in Sikar & beyond.',
      cta: 'Explore Shawls',
      image: '/images/collections/col_shawls.jpg',
      category: 'shawls',
      priceTag: 'From ₹1,299',
      highlight: '100% Pure Handloom'
    },
    {
      id: 'bangles',
      badge: 'Heritage Bridal Ornaments',
      tagline: 'Authentic Jaipur & Sikar Lac Chudha',
      title: 'Embrace Timeless Bridal Elegance',
      description: 'Handcrafted with Kundan, Polki, and emerald glass accents. Adorn your special occasions with auspicious Rajasthani bangles.',
      cta: 'Shop Bridal Bangles',
      image: '/images/collections/col_bangles.jpg',
      category: 'bangles',
      priceTag: 'Sets from ₹499',
      highlight: 'Auspicious Bridal Lac'
    },
    {
      id: 'cosmetics',
      badge: 'Festive Beauty & Radiance',
      tagline: '24K Gold & Herbal Kumkumadi Glow',
      title: 'Glow Naturally, Live Radiantly',
      description: 'Dermatologically tested Ayurvedic bridal HD foundations, 16-hour velvety matte lipsticks, and pure herbal kajal.',
      cta: 'Shop Cosmetics',
      image: '/images/collections/col_cosmetics.jpg',
      category: 'cosmetics',
      priceTag: 'From ₹199',
      highlight: 'Dermatologically Tested'
    },
    {
      id: 'showpieces',
      badge: 'Artisan Home Decor & Gifts',
      tagline: 'Hand-Carved Brass & Marble Idols',
      title: 'Sacred Idols & Rajasthani Keepsakes',
      description: 'Bring blessings and heritage royal charm home with artisan peacock diyas, gold-leaf elephants, and hand-painted pottery.',
      cta: 'Explore Gifts',
      image: '/images/collections/col_showpieces.jpg',
      category: 'showpieces',
      priceTag: 'Starting ₹349',
      highlight: 'Pure Brass & Ceramic'
    }
  ];

  // Auto-scroll horizontal hero slider every 6s (pauses on mouse hover)
  useEffect(() => {
    if (isHeroHovered) return;
    const slideTimer = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => clearInterval(slideTimer);
  }, [isHeroHovered, heroSlides.length]);

  const nextHeroSlide = () => setCurrentHeroSlide(prev => (prev + 1) % heroSlides.length);
  const prevHeroSlide = () => setCurrentHeroSlide(prev => (prev - 1 + heroSlides.length) % heroSlides.length);

  const handleTouchStart = (e) => {
    if (e.touches && e.touches[0]) {
      setTouchStartX(e.touches[0].clientX);
    }
  };
  const handleTouchEnd = (e) => {
    if (touchStartX === null || !e.changedTouches || !e.changedTouches[0]) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 50) nextHeroSlide();
    else if (diff < -50) prevHeroSlide();
    setTouchStartX(null);
  };

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchCat = selectedCategory === 'all' || product.category === selectedCategory;
        const matchSearch = !searchQuery.trim() ||
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
        return matchCat && matchSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'price-low') return a.price - b.price;
        if (sortBy === 'price-high') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return (b.reviewsCount || 0) - (a.reviewsCount || 0);
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  const totalCartUnits = cartItems.reduce((acc, i) => acc + i.qty, 0);

  // Category story circles data
  const storyCategories = [
    { id: 'cosmetics', name: 'Cosmetics', count: 12, img: '/images/collections/col_cosmetics.jpg' },
    { id: 'bangles', name: 'Bangles', count: 12, img: '/images/collections/col_bangles.jpg' },
    { id: 'shawls', name: 'Shawls', count: 12, img: '/images/collections/col_shawls.jpg' },
    { id: 'socks', name: 'Socks', count: 12, img: '/images/collections/col_socks.jpg' },
    { id: 'undergarments', name: 'Innerwear', count: 12, img: '/images/products/undergarments_01.png' },
    { id: 'showpieces', name: 'Gifts & Idols', count: 12, img: '/images/collections/col_showpieces.jpg' }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#1F2937] font-sans antialiased selection:bg-[#064E3B] selection:text-white relative pb-16 sm:pb-0">
      
      {/* Ambient background glow accents */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-[#064E3B]/5 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[30rem] h-[30rem] rounded-full bg-[#FF7722]/5 blur-3xl" />
        <div className="absolute bottom-10 left-1/4 w-80 h-80 rounded-full bg-[#D4AF37]/5 blur-3xl" />
      </div>

      {/* ============================================================== */}
      {/* 1. COLLAPSIBLE SLIDE-OUT MOBILE SIDEBAR NAVIGATION             */}
      {/* ============================================================== */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-[#FAF7F2] shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-in-out border-r border-[#EDE4D3] ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="overflow-y-auto p-6">
          {/* Sidebar Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-[#EDE4D3]">
            <Logo variant="compact" size="sm" />
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 hover:bg-black/5 rounded-xl text-gray-500 hover:text-gray-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Mall POS Button */}
          <div className="mt-5 p-3 rounded-2xl bg-gradient-to-br from-[#064E3B] to-[#043828] text-white shadow-md border border-[#FF7722]/30">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#FFE082]">Supermarket Billing</span>
              <span className="px-2 py-0.5 rounded-full bg-[#FF7722] text-[9px] font-black uppercase">Active</span>
            </div>
            <p className="text-xs font-semibold mt-1 text-emerald-100">DMart Style Cashier &amp; Khata POS</p>
            <button
              onClick={() => {
                onSwitchToPos();
                setSidebarOpen(false);
              }}
              className="w-full mt-3 py-2 bg-[#FF7722] hover:bg-[#D95305] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Store className="w-3.5 h-3.5" />
              Open Mall POS Terminal
            </button>
          </div>

          {/* Navigation Links Group */}
          <nav className="mt-6 space-y-1 text-sm font-semibold text-gray-800">
            <button
              onClick={() => {
                setSelectedCategory('all');
                setSidebarOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/80 hover:text-[#064E3B] flex items-center justify-between transition-colors"
            >
              <span>Home</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Shop Link */}
            <button
              onClick={() => {
                document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' });
                setSidebarOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/80 hover:text-[#064E3B] flex items-center justify-between transition-colors"
            >
              <span>Shop All Products ({products.length})</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Categories Collapsible */}
            <div>
              <button
                onClick={() => setCategoriesCollapsed(!categoriesCollapsed)}
                className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/80 flex items-center justify-between text-gray-800 transition-colors"
              >
                <span>Shop by Category</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${categoriesCollapsed ? 'rotate-180' : ''}`} />
              </button>
              {categoriesCollapsed && (
                <div className="pl-4 py-1 space-y-1 text-xs text-gray-600 border-l-2 border-[#EDE4D3] ml-4">
                  {categories.filter(c => c.id !== 'all').map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' });
                        setSidebarOpen(false);
                      }}
                      className="block w-full text-left py-1.5 px-2 rounded-lg hover:text-[#064E3B] hover:bg-white transition-colors"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Collections Link */}
            <button
              onClick={() => {
                document.getElementById('popular-collections')?.scrollIntoView({ behavior: 'smooth' });
                setSidebarOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/80 hover:text-[#064E3B] flex items-center justify-between transition-colors"
            >
              <span>Featured Collections</span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            {/* Wishlist Link */}
            <button
              onClick={() => {
                onOpenWishlist();
                setSidebarOpen(false);
              }}
              className="w-full text-left py-2.5 px-3 rounded-xl hover:bg-white/80 hover:text-rose-600 flex items-center justify-between transition-colors"
            >
              <span>Wishlist ({wishlistItems.length})</span>
              <Heart className="w-4 h-4 text-rose-500" />
            </button>

            {/* Contact */}
            <a
              href="#contact"
              onClick={() => setSidebarOpen(false)}
              className="block py-2.5 px-3 rounded-xl hover:bg-white/80 hover:text-[#064E3B] transition-colors"
            >
              Store &amp; Contact Details
            </a>
          </nav>
        </div>

        {/* Sidebar Footer Contacts */}
        <div className="p-4 bg-white/60 border-t border-[#EDE4D3] text-xs text-gray-600 space-y-1.5">
          <p className="font-bold text-gray-900 font-serif">{storeInfo.name}</p>
          <p className="text-[11px] text-gray-500">Station Road, Main Market, Sikar, Rajasthan</p>
          <div className="pt-1 flex flex-col gap-0.5 text-[11px]">
            <a href="tel:9602172335" className="text-[#064E3B] font-bold hover:underline">
              Owner: Pooja Sharma (9602172335)
            </a>
            <a href="tel:8306447955" className="text-[#FF7722] font-bold hover:underline">
              Franchise Head: Priyanshu (+91 8306447955)
            </a>
          </div>
        </div>
      </aside>

      {/* ============================================================== */}
      {/* 2. TRANSPARENT BEIGE TINTED STICKY NAVBAR                      */}
      {/* ============================================================== */}
      <header className="sticky top-0 left-0 right-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EDE4D3] shadow-[0_2px_15px_-3px_rgba(6,78,59,0.04)] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-3 sm:gap-6">
          
          {/* Left: Hamburger menu & Royal Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 hover:bg-black/5 rounded-xl text-gray-800 transition-colors"
              title="Open Navigation Menu"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6 text-[#064E3B]" />
            </button>

            <div
              className="cursor-pointer group flex items-center"
              onClick={() => {
                setSelectedCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            >
              {/* Responsive Logo */}
              <Logo variant="full" size="md" className="hidden sm:inline-flex" />
              <Logo variant="compact" size="sm" className="inline-flex sm:hidden" />
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-bold text-gray-700 uppercase tracking-widest">
            <button
              onClick={() => {
                setSelectedCategory('all');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#064E3B] transition-colors py-1 cursor-pointer"
            >
              Home
            </button>
            <button
              onClick={() => document.getElementById('popular-collections')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#064E3B] transition-colors py-1 cursor-pointer"
            >
              Collections
            </button>
            <button
              onClick={() => document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' })}
              className="hover:text-[#064E3B] transition-colors py-1 cursor-pointer"
            >
              Catalog
            </button>
            <a href="#contact" className="hover:text-[#064E3B] transition-colors py-1">
              Store Info
            </a>
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            
            {/* Live Search Trigger / Bar */}
            <div className="relative">
              {searchOpen ? (
                <div className="flex items-center bg-white border border-[#EDE4D3] shadow-xs rounded-full px-3 py-1.5 text-xs animate-in fade-in duration-200">
                  <Search className="w-3.5 h-3.5 text-gray-400 mr-2 flex-shrink-0" />
                  <input
                    type="text"
                    autoFocus
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search cosmetics, bangles, shawls..."
                    className="bg-transparent border-0 focus:outline-none w-36 sm:w-56 text-gray-900 text-xs"
                  />
                  <button onClick={() => setSearchOpen(false)} className="text-gray-400 hover:text-gray-600 ml-1">
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="p-2 text-gray-700 hover:text-[#064E3B] hover:bg-white/70 rounded-full transition-colors"
                  title="Search Products"
                  aria-label="Search products"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Wishlist Icon */}
            <button
              onClick={onOpenWishlist}
              className="relative p-2 text-gray-700 hover:text-rose-600 hover:bg-white/70 rounded-full transition-colors"
              title="Saved Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistItems.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[9px] font-black flex items-center justify-center shadow-xs animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </button>

            {/* Shopping Bag Icon with badge */}
            <button
              onClick={onOpenCart}
              className="relative p-2 text-gray-700 hover:text-[#064E3B] hover:bg-white/70 rounded-full transition-colors"
              title="Shopping Bag"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalCartUnits > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF7722] text-white text-[9px] font-black flex items-center justify-center shadow-xs">
                  {totalCartUnits}
                </span>
              )}
            </button>

            {/* MALL FRANCHISE POS BUTTON (Desktop & Mobile) */}
            <button
              onClick={onSwitchToPos}
              className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-gradient-to-r from-[#064E3B] to-[#043828] hover:from-[#043828] hover:to-[#032D22] text-white rounded-xl text-xs font-bold shadow-sm transition-all hover:scale-103 cursor-pointer border border-[#FF7722]/30"
              title="Switch to DMart Style Franchise POS Terminal"
            >
              <Store className="w-3.5 h-3.5 text-[#FF7722]" />
              <span className="hidden sm:inline">Mall POS</span>
              <span className="sm:hidden text-[11px]">POS</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10">
        
        {/* ============================================================== */}
        {/* 3. REAL INTERACTIVE E-COMMERCE HERO SECTION                   */}
        {/* ============================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-6">
          <div
            className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-[#FFFFFF]/90 via-[#FAF7F2] to-[#F4EFE6] border border-[#EDE4D3] shadow-[0_8px_30px_rgb(6,78,59,0.06)] overflow-hidden p-6 sm:p-10 lg:p-12 transition-all"
            onMouseEnter={() => setIsHeroHovered(true)}
            onMouseLeave={() => setIsHeroHovered(false)}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* Subtle background luxury pattern */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              
              {/* Left Column: Authentic Brand Typography & CTAs */}
              <div className="lg:col-span-7 space-y-4 sm:space-y-6">
                
                {/* Royal Heritage Tag */}
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#064E3B]/10 border border-[#064E3B]/20 text-[#064E3B] text-[11px] sm:text-xs font-bold tracking-wide">
                  <span className="w-2 h-2 rounded-full bg-[#FF7722] animate-ping" />
                  <span>⚜️ Handcrafted Rajasthani Heritage • Station Road, Sikar</span>
                </div>

                {/* Hero Headline */}
                <div className="space-y-2">
                  <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-[#FF7722]">
                    {heroSlides[currentHeroSlide].badge}
                  </p>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tight leading-[1.15] font-serif">
                    {heroSlides[currentHeroSlide].title}
                  </h1>
                </div>

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed max-w-xl">
                  {heroSlides[currentHeroSlide].description}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-2">
                  <button
                    onClick={() => {
                      setSelectedCategory(heroSlides[currentHeroSlide].category);
                      document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 sm:px-8 py-3.5 bg-[#064E3B] hover:bg-[#043828] text-white rounded-2xl text-xs sm:text-sm font-bold tracking-wide shadow-md transition-all hover:scale-102 flex items-center gap-2 cursor-pointer border border-[#064E3B]"
                  >
                    <span>{heroSlides[currentHeroSlide].cta}</span>
                    <ArrowRight className="w-4 h-4 text-[#FF7722]" />
                  </button>

                  <button
                    onClick={onSwitchToPos}
                    className="px-5 sm:px-6 py-3.5 bg-white hover:bg-[#FAF7F2] text-[#064E3B] border border-[#EDE4D3] rounded-2xl text-xs sm:text-sm font-bold tracking-wide shadow-xs transition-all hover:border-[#064E3B] flex items-center gap-2 cursor-pointer"
                  >
                    <Store className="w-4 h-4 text-[#FF7722]" />
                    <span>Mall Franchise POS</span>
                  </button>
                </div>

                {/* Trust Perks Pill Bar */}
                <div className="pt-4 border-t border-[#EDE4D3]/70 flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-gray-600 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Truck className="w-4 h-4 text-[#064E3B]" />
                    <span>Free Sikar Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#064E3B]" />
                    <span>100% Authentic Quality</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#FF7722]" />
                    <span>Govt GST Verified</span>
                  </div>
                </div>

              </div>

              {/* Right Column: Hero Visual Showcase */}
              <div className="lg:col-span-5 relative">
                
                {/* Main Featured Visual Showcase Card */}
                <div className="relative aspect-4/3 sm:aspect-square w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-white shadow-xl border-2 border-[#EDE4D3] group">
                  <img
                    src={heroSlides[currentHeroSlide].image}
                    alt={heroSlides[currentHeroSlide].title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Floating Top Badge */}
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#064E3B]/90 backdrop-blur-md text-[#FFE082] text-[10px] sm:text-xs font-bold shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#FF7722]" />
                    <span>{heroSlides[currentHeroSlide].highlight}</span>
                  </div>

                  {/* Floating Price Tag */}
                  <div className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-xl bg-white/95 backdrop-blur-md text-gray-900 text-xs sm:text-sm font-bold shadow-lg border border-[#EDE4D3]">
                    <span className="text-[#064E3B] font-serif">{heroSlides[currentHeroSlide].priceTag}</span>
                  </div>

                  {/* Manual Arrow Controls */}
                  <div className="absolute inset-y-0 left-2 flex items-center">
                    <button
                      onClick={prevHeroSlide}
                      className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all hover:scale-110"
                      title="Previous Slide"
                      aria-label="Previous slide"
                    >
                      ‹
                    </button>
                  </div>
                  <div className="absolute inset-y-0 right-2 flex items-center">
                    <button
                      onClick={nextHeroSlide}
                      className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-gray-800 flex items-center justify-center shadow-md transition-all hover:scale-110"
                      title="Next Slide"
                      aria-label="Next slide"
                    >
                      ›
                    </button>
                  </div>
                </div>

                {/* Hero Slide Tabs / Dots */}
                <div className="flex items-center justify-center gap-2 mt-4">
                  {heroSlides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentHeroSlide(idx)}
                      className={`h-2 rounded-full transition-all cursor-pointer ${
                        currentHeroSlide === idx
                          ? 'w-8 bg-[#064E3B]'
                          : 'w-2 bg-[#EDE4D3] hover:bg-gray-400'
                      }`}
                      title={slide.title}
                      aria-label={`Go to slide ${idx + 1}`}
                    />
                  ))}
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 4. INSTAGRAM-STYLE CATEGORY STORY CIRCLES                      */}
        {/* ============================================================== */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF7722]" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-widest text-[#064E3B] font-serif">
                Shop by Categories
              </h2>
            </div>
            <button
              onClick={() => { setSelectedCategory('all'); document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' }); }}
              className="text-xs font-bold text-[#FF7722] hover:text-[#D95305] flex items-center gap-1 cursor-pointer"
            >
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Horizontal scrollable story pills */}
          <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto pb-2 scrollbar-none">
            {storyCategories.map(cat => {
              const isSelected = selectedCategory === cat.id;
              return (
                <div
                  key={cat.id}
                  onClick={() => {
                    setSelectedCategory(isSelected ? 'all' : cat.id);
                    document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="flex flex-col items-center flex-shrink-0 cursor-pointer group"
                >
                  {/* Story ring */}
                  <div className={`p-0.5 rounded-full transition-all duration-300 ${
                    isSelected
                      ? 'ring-3 ring-[#064E3B] shadow-md scale-105'
                      : 'ring-2 ring-[#EDE4D3] group-hover:ring-[#FF7722]'
                  }`}>
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden bg-white p-0.5">
                      <img
                        src={cat.img}
                        alt={cat.name}
                        className="w-full h-full object-cover rounded-full transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>
                  
                  <span className={`text-[11px] sm:text-xs font-bold mt-2 transition-colors ${
                    isSelected ? 'text-[#064E3B]' : 'text-gray-700 group-hover:text-[#064E3B]'
                  }`}>
                    {cat.name}
                  </span>
                  <span className="text-[9px] text-gray-400 font-semibold">
                    {cat.count} items
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 5. POPULAR FEATURED COLLECTIONS                                */}
        {/* ============================================================== */}
        <section id="popular-collections" className="py-8 sm:py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#FF7722] block mb-1">
                Handpicked Specialties
              </span>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-gray-900 tracking-tight">
                Curated Royal Collections
              </h2>
            </div>

            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                onClick={() => {
                  const el = document.getElementById('collections-carousel-track');
                  if (el) el.scrollBy({ left: -320, behavior: 'smooth' });
                }}
                className="w-9 h-9 rounded-full border border-[#EDE4D3] hover:border-[#064E3B] flex items-center justify-center text-gray-700 hover:text-[#064E3B] transition-all cursor-pointer shadow-xs bg-white text-base font-bold"
                title="Scroll Left"
                aria-label="Previous collection"
              >
                ‹
              </button>
              <button
                onClick={() => {
                  const el = document.getElementById('collections-carousel-track');
                  if (el) el.scrollBy({ left: 320, behavior: 'smooth' });
                }}
                className="w-9 h-9 rounded-full bg-[#064E3B] hover:bg-[#043828] text-white flex items-center justify-center transition-all cursor-pointer shadow-xs text-base font-bold"
                title="Scroll Right"
                aria-label="Next collection"
              >
                ›
              </button>
            </div>
          </div>

          {/* 3 Large Rounded Collection Cards */}
          <div
            id="collections-carousel-track"
            className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-7 overflow-x-auto pb-2 scroll-smooth"
          >
            {[
              {
                id: 'bangles',
                title: 'Royal Bridal Lac Chudha',
                subtitle: 'Auspicious Kundan & Meenakari Kadas',
                location: 'Sikar Season Shop • Rajasthan',
                image: '/images/collections/col_bangles.jpg',
                rating: '4.9',
                count: '12 Items'
              },
              {
                id: 'shawls',
                title: 'Pure Kashmiri Pashmina',
                subtitle: 'Authentic Sozni Needlework Weaves',
                location: 'Handloom Artisan Weave',
                image: '/images/collections/col_shawls.jpg',
                rating: '4.9',
                count: '12 Items'
              },
              {
                id: 'cosmetics',
                title: '24K Gold Bridal Cosmetics',
                subtitle: 'Kumkumadi Ayurvedic Radiance',
                location: 'Ayurvedic Radiance Formula',
                image: '/images/collections/col_cosmetics.jpg',
                rating: '4.8',
                count: '12 Items'
              }
            ].map(col => (
              <div
                key={col.id}
                onClick={() => {
                  setSelectedCategory(col.id);
                  document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="group cursor-pointer flex flex-col justify-between bg-white rounded-3xl p-4 border border-[#EDE4D3] shadow-xs hover:shadow-xl hover:border-[#064E3B]/30 transition-all duration-300"
              >
                {/* Large Rounded Image Card */}
                <div className="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-[#FAF7F2]">
                  <img
                    src={col.image}
                    alt={col.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-106"
                  />
                  <div className="absolute top-3 left-3 px-3 py-1 bg-white/90 backdrop-blur-xs rounded-full text-[10px] font-bold text-gray-900 uppercase tracking-wider shadow-xs">
                    {col.count}
                  </div>
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-[#064E3B] text-white rounded-full text-[11px] font-bold flex items-center gap-1 shadow-xs">
                    <Star className="w-3 h-3 fill-[#FF7722] text-[#FF7722]" />
                    <span>{col.rating}</span>
                  </div>
                </div>

                {/* Card Info Details */}
                <div className="pt-3.5 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-serif font-black text-base sm:text-lg text-gray-900 group-hover:text-[#064E3B] transition-colors leading-snug">
                      {col.title}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">{col.subtitle}</p>
                    <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-1 font-medium">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span>{col.location}</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#FAF7F2] group-hover:bg-[#064E3B] group-hover:text-white text-[#064E3B] flex items-center justify-center transition-colors flex-shrink-0 mt-1">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ============================================================== */}
        {/* 6. MAIN PRODUCT CATALOG (MOBILE: STRICTLY 2 ITEMS PER ROW)    */}
        {/* ============================================================== */}
        <section id="shop-catalog" className="py-8 sm:py-12 px-3 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-24">
          
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#FF7722]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#FF7722]">Complete Retail Inventory</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-gray-900 tracking-tight mt-1">
                Explore Sikar Season Collection
              </h2>
            </div>

            {/* Sort & Filter Controls */}
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-semibold text-gray-500">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-[#EDE4D3] text-gray-800 text-xs font-bold rounded-xl px-3 py-2 focus:outline-none focus:border-[#064E3B] shadow-xs"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Filter Pills / Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none text-xs font-bold">
            <button
              onClick={() => { setSelectedCategory('all'); setDisplayLimit(12); }}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#064E3B] text-white shadow-xs'
                  : 'bg-white text-gray-700 border border-[#EDE4D3] hover:border-[#064E3B]'
              }`}
            >
              All Items ({products.length})
            </button>
            {categories.filter(c => c.id !== 'all').map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedCategory(cat.id); setDisplayLimit(12); }}
                className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#064E3B] text-white shadow-xs'
                    : 'bg-white text-gray-700 border border-[#EDE4D3] hover:border-[#064E3B]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* ============================================================== */}
          {/* PRODUCT GRID: 2 COLUMNS ON MOBILE (grid-cols-2)               */}
          {/* ============================================================== */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-5">
            {filteredProducts.slice(0, displayLimit).map((item) => {
              const isWishlisted = wishlistItems.some(i => i.id === item.id);

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between bg-white rounded-2xl p-2.5 sm:p-4 border border-[#EDE4D3] shadow-xs hover:shadow-lg hover:border-[#064E3B]/30 transition-all duration-300"
                >
                  {/* Top Image Container */}
                  <div className="relative w-full aspect-square bg-[#FFFFFF] rounded-xl overflow-hidden p-2 sm:p-4 flex items-center justify-center">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-108"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/images/products/cosmetics_01.png';
                      }}
                    />

                    {/* Badge: Discount or Tag */}
                    {item.discount > 0 && (
                      <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-[#FF7722] text-white text-[9px] sm:text-[10px] font-black uppercase shadow-xs">
                        {item.discount}% OFF
                      </div>
                    )}

                    {/* Wishlist Heart Icon (Always accessible on Mobile & Desktop) */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist(item);
                      }}
                      className={`absolute top-2 right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 backdrop-blur-xs shadow-xs flex items-center justify-center transition-all hover:scale-110 cursor-pointer ${
                        isWishlisted ? 'text-rose-600' : 'text-gray-400 hover:text-rose-600'
                      }`}
                      title="Add to Wishlist"
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isWishlisted ? 'fill-current' : ''}`} />
                    </button>

                    {/* Quick View Button (Desktop hover) */}
                    <button
                      onClick={() => onQuickView(item)}
                      className="hidden sm:flex absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-white/90 backdrop-blur-xs text-gray-800 rounded-full text-[10px] font-bold shadow-xs items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-3 h-3" />
                      <span>Quick View</span>
                    </button>
                  </div>

                  {/* Product Details */}
                  <div className="pt-2.5 sm:pt-3 flex flex-col flex-1 justify-between">
                    <div>
                      <span className="text-[9.5px] sm:text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                        {item.categoryLabel}
                      </span>
                      <h3
                        onClick={() => onQuickView(item)}
                        className="font-bold text-xs sm:text-sm text-gray-900 mt-0.5 line-clamp-2 hover:text-[#064E3B] transition-colors cursor-pointer leading-snug"
                        title={item.name}
                      >
                        {item.name}
                      </h3>
                    </div>

                    {/* Rating and Price */}
                    <div className="mt-2 pt-2 border-t border-gray-100 flex flex-col gap-1.5">
                      <div className="flex items-center justify-between">
                        {/* Rating */}
                        <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-gray-700">
                          <Star className="w-3 h-3 fill-[#FF7722] text-[#FF7722]" />
                          <span>{item.rating}</span>
                          <span className="text-gray-400 text-[9px] hidden sm:inline">({item.reviewsCount})</span>
                        </div>

                        {/* Stock status indicator */}
                        <span className="text-[9px] font-semibold text-emerald-700">
                          In Stock
                        </span>
                      </div>

                      {/* Pricing row */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-sm sm:text-base text-[#064E3B] font-serif">
                          ₹{item.price}
                        </span>
                        {item.mrp > item.price && (
                          <span className="text-[10px] sm:text-xs text-gray-400 line-through">
                            ₹{item.mrp}
                          </span>
                        )}
                      </div>

                      {/* 1-Tap Add to Cart Button */}
                      <button
                        onClick={() => onAddToCart(item, 1)}
                        className="w-full mt-1 py-1.5 sm:py-2 bg-[#064E3B] hover:bg-[#043828] text-white rounded-xl text-[11px] sm:text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-all hover:scale-102 cursor-pointer active:scale-95"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#FF7722]" />
                        <span>Add to Bag</span>
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>

          {/* View More / Load More Button */}
          {filteredProducts.length > displayLimit ? (
            <div className="text-center mt-10">
              <button
                onClick={() => setDisplayLimit(prev => prev + 12)}
                className="px-8 py-3.5 bg-white border-2 border-[#064E3B] hover:bg-[#064E3B] hover:text-white text-[#064E3B] text-xs font-bold uppercase tracking-widest transition-all rounded-2xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <span>View More Products</span>
                <span className="text-xs text-[#FF7722] font-mono">({Math.min(displayLimit, filteredProducts.length)} / {filteredProducts.length})</span>
              </button>
            </div>
          ) : filteredProducts.length > 12 && (
            <div className="text-center mt-8 text-xs text-gray-400 font-semibold uppercase tracking-wider">
              Showing all {filteredProducts.length} products
            </div>
          )}

        </section>

        {/* ============================================================== */}
        {/* 7. SERVICE & TRUST HIGHLIGHTS                                  */}
        {/* ============================================================== */}
        <section className="border-y border-[#EDE4D3] py-10 sm:py-14 px-4 bg-white/70">
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="flex items-center gap-4 justify-start p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D3]">
              <div className="w-12 h-12 rounded-2xl bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center flex-shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase text-gray-900 tracking-wider">Free Sikar Delivery</h3>
                <p className="text-xs text-gray-500 mt-0.5">On all orders above ₹499 across Sikar &amp; Rajasthan</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-start p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D3]">
              <div className="w-12 h-12 rounded-2xl bg-[#FF7722]/10 text-[#FF7722] flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase text-gray-900 tracking-wider">Direct Store Support</h3>
                <p className="text-xs text-gray-500 mt-0.5">Pooja Sharma (9602172335) • Priyanshu (+91 8306447955)</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-start p-4 rounded-2xl bg-[#FAF7F2] border border-[#EDE4D3]">
              <div className="w-12 h-12 rounded-2xl bg-[#064E3B]/10 text-[#064E3B] flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold uppercase text-gray-900 tracking-wider">100% Authentic Quality</h3>
                <p className="text-xs text-gray-500 mt-0.5">Handloom Pashmina, Lac Kadas &amp; Certified Ayurveda</p>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================== */}
        {/* 8. FOOTER WITH BRAND, STORE CONTACTS & POS LAUNCH             */}
        {/* ============================================================== */}
        <footer id="contact" className="bg-[#032D22] text-white pt-14 pb-12 px-4 sm:px-6 lg:px-8 border-t-2 border-[#FF7722]">
          <div className="max-w-7xl mx-auto">
            
            {/* Links Columns */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-emerald-900/60 text-xs text-emerald-100">
              {/* Brand info */}
              <div className="md:col-span-5 space-y-4">
                <Logo variant="full" size="lg" theme="light" />
                <p className="text-xs text-emerald-200/90 leading-relaxed max-w-sm mt-3">
                  Official retail storefront and mall franchise billing platform for <strong>{storeInfo.name}</strong>. Delivering handcrafted Rajasthani bridal bangles, luxury cosmetics, pure Kashmiri pashmina, socks, innerwear, and artisan brass showpieces.
                </p>
                <div className="pt-2 text-white font-medium space-y-1 text-xs">
                  <p>Store Owner: <strong>Pooja Sharma ({storeInfo.ownerPhone})</strong></p>
                  <p>Franchise Head: <strong>Priyanshu Sharma ({storeInfo.managerPhone})</strong></p>
                  <p>Email: <strong>{storeInfo.email}</strong></p>
                </div>
              </div>

              {/* Collections Quick Links */}
              <div className="md:col-span-3 space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#FFE082] mb-3 font-serif">
                  Collections
                </h4>
                {categories.filter(c => c.id !== 'all').map(cat => (
                  <p
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-white cursor-pointer transition-colors"
                  >
                    {cat.name}
                  </p>
                ))}
              </div>

              {/* Store & POS Location */}
              <div className="md:col-span-4 space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-[#FFE082] mb-3 font-serif">
                  Store &amp; POS Location
                </h4>
                <p className="text-emerald-100 flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#FF7722] flex-shrink-0 mt-0.5" />
                  <span>Station Road, Main Market, Sikar, Rajasthan - 332001</span>
                </p>
                <p className="text-emerald-200">GSTIN: {storeInfo.gstin}</p>
                <p className="text-emerald-200">Store Hours: Mon – Sun: 09:30 AM – 10:00 PM</p>
                
                <button
                  onClick={onSwitchToPos}
                  className="mt-4 px-5 py-3 bg-[#FF7722] hover:bg-[#D95305] text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <Store className="w-4 h-4" />
                  Launch Mall Franchise POS
                </button>
              </div>
            </div>

            {/* Copyright */}
            <div className="pt-6 flex flex-wrap items-center justify-between gap-4 text-xs text-emerald-300/70">
              <p>© {new Date().getFullYear()} SIKAR SEASON SHOP. All Rights Reserved. Owner: Pooja Sharma ({storeInfo.ownerPhone})</p>
              <div className="flex items-center gap-4">
                <span>Station Road • Sikar • Rajasthan</span>
                <span>•</span>
                <span>GST Verified</span>
              </div>
            </div>

          </div>
        </footer>

      </main>

      {/* ============================================================== */}
      {/* 9. MOBILE STICKY BOTTOM NAVIGATION BAR                         */}
      {/* ============================================================== */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F2]/95 backdrop-blur-lg border-t border-[#EDE4D3] py-2 px-3 shadow-lg flex items-center justify-around">
        <button
          onClick={() => {
            setSelectedCategory('all');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#064E3B]"
        >
          <CircleDot className="w-5 h-5 text-[#064E3B]" />
          <span className="text-[10px] font-bold">Home</span>
        </button>

        <button
          onClick={() => document.getElementById('shop-catalog')?.scrollIntoView({ behavior: 'smooth' })}
          className="flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#064E3B]"
        >
          <Tag className="w-5 h-5" />
          <span className="text-[10px] font-bold">Shop</span>
        </button>

        <button
          onClick={onOpenWishlist}
          className="relative flex flex-col items-center gap-0.5 text-gray-700 hover:text-rose-600"
        >
          <Heart className="w-5 h-5" />
          {wishlistItems.length > 0 && (
            <span className="absolute -top-1 right-2 w-3.5 h-3.5 rounded-full bg-rose-600 text-white text-[8px] font-black flex items-center justify-center">
              {wishlistItems.length}
            </span>
          )}
          <span className="text-[10px] font-bold">Wishlist</span>
        </button>

        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center gap-0.5 text-gray-700 hover:text-[#064E3B]"
        >
          <ShoppingBag className="w-5 h-5" />
          {totalCartUnits > 0 && (
            <span className="absolute -top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#FF7722] text-white text-[8px] font-black flex items-center justify-center">
              {totalCartUnits}
            </span>
          )}
          <span className="text-[10px] font-bold">Bag</span>
        </button>

        <button
          onClick={onSwitchToPos}
          className="flex flex-col items-center gap-0.5 text-[#064E3B] font-bold"
        >
          <div className="w-6 h-6 rounded-lg bg-[#064E3B] text-[#FF7722] flex items-center justify-center shadow-xs">
            <Store className="w-3.5 h-3.5" />
          </div>
          <span className="text-[10px] text-[#064E3B]">POS</span>
        </button>
      </nav>

    </div>
  );
}
