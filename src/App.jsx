import React, { useState } from 'react';
import Storefront from './components/Storefront';
import FranchisePosTerminal from './components/FranchisePosTerminal';
import CartDrawer from './components/CartDrawer';
import CheckoutModal from './components/CheckoutModal';
import WishlistModal from './components/WishlistModal';
import ProductQuickViewModal from './components/ProductQuickViewModal';
import ThermalReceipt from './components/ThermalReceipt';
import { initialProducts } from './data/products';
import { playScanBeep } from './utils/sound';

export default function App() {
  // Mode: 'storefront' | 'pos'
  const [currentView, setCurrentView] = useState('storefront');

  // Master product catalog state (shared between storefront and POS software)
  const [products, setProducts] = useState(initialProducts);

  // Cart & Wishlist state
  const [cartItems, setCartItems] = useState([
    // Pre-populate with 2 items for instant gratification
    { ...initialProducts[0], qty: 1 },
    { ...initialProducts[5], qty: 1 }
  ]);
  const [wishlistItems, setWishlistItems] = useState([
    initialProducts[1],
    initialProducts[20]
  ]);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [activeReceipt, setActiveReceipt] = useState(null);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState('');

  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 2800);
  };

  // Add to Cart handler
  const handleAddToCart = (product, qty = 1) => {
    playScanBeep();
    setCartItems(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        const newQty = existing.qty + qty;
        if (newQty <= 0) {
          triggerToast(`Removed "${product.name}" from bag`);
          return prev.filter(i => i.id !== product.id);
        }
        triggerToast(`Updated "${product.name}" quantity (${newQty})`);
        return prev.map(i => i.id === product.id ? { ...i, qty: newQty } : i);
      } else {
        triggerToast(`Added "${product.name}" to shopping bag`);
        return [...prev, { ...product, qty: Math.max(1, qty) }];
      }
    });
  };

  // Update Cart Qty
  const handleUpdateCartQty = (id, newQty) => {
    if (newQty <= 0) {
      setCartItems(prev => prev.filter(i => i.id !== id));
      triggerToast('Item removed from cart');
    } else {
      setCartItems(prev => prev.map(i => i.id === id ? { ...i, qty: newQty } : i));
    }
  };

  // Remove Item from Cart
  const handleRemoveCartItem = (id) => {
    setCartItems(prev => prev.filter(i => i.id !== id));
    triggerToast('Item removed from cart');
  };

  // Toggle Wishlist
  const handleToggleWishlist = (product) => {
    setWishlistItems(prev => {
      const exists = prev.some(i => i.id === product.id);
      if (exists) {
        triggerToast(`Removed from wishlist`);
        return prev.filter(i => i.id !== product.id);
      } else {
        triggerToast(`Saved "${product.name}" to wishlist`);
        return [...prev, product];
      }
    });
  };

  // Move from Wishlist to Cart
  const handleMoveToCart = (product) => {
    handleAddToCart(product, 1);
    setWishlistItems(prev => prev.filter(i => i.id !== product.id));
  };

  // Checkout successful order
  const handleOrderSuccess = (newBill) => {
    setCartItems([]);
    setIsCheckoutOpen(false);
    setActiveReceipt(newBill);
  };

  return (
    <div className="relative min-h-screen bg-[#FAF7F2] text-[#1F2937]">
      {/* View Switcher: Storefront vs Mall Franchise POS */}
      {currentView === 'storefront' ? (
        <Storefront
          products={products}
          cartItems={cartItems}
          wishlistItems={wishlistItems}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onQuickView={(p) => setQuickViewProduct(p)}
          onAddToCart={handleAddToCart}
          onToggleWishlist={handleToggleWishlist}
          onSwitchToPos={() => setCurrentView('pos')}
        />
      ) : (
        <FranchisePosTerminal
          products={products}
          onUpdateProducts={(updated) => setProducts(updated)}
          onExitPos={() => setCurrentView('storefront')}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQty={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onProceedToCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
        appliedCoupon={appliedCoupon}
        onApplyCoupon={(c) => {
          setAppliedCoupon(c);
          triggerToast(`Coupon ${c} applied!`);
        }}
        onRemoveCoupon={() => {
          setAppliedCoupon('');
          triggerToast('Coupon removed');
        }}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cartItems}
        appliedCoupon={appliedCoupon}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlistItems={wishlistItems}
        onRemoveFromWishlist={(id) => setWishlistItems(prev => prev.filter(i => i.id !== id))}
        onMoveToCart={handleMoveToCart}
        onClearWishlist={() => setWishlistItems([])}
      />

      {/* Product Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={!!quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
        onAddToCart={handleAddToCart}
        isWishlisted={quickViewProduct ? wishlistItems.some(i => i.id === quickViewProduct.id) : false}
        onToggleWishlist={handleToggleWishlist}
      />

      {/* Thermal Receipt & Tax Invoice Modal */}
      {activeReceipt && (
        <ThermalReceipt
          bill={activeReceipt}
          onClose={() => setActiveReceipt(null)}
        />
      )}

      {/* Floating Action Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#064E3B] text-white px-4 py-2.5 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border border-[#FF7722] animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="w-2 h-2 rounded-full bg-[#FF7722] animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
