import React, { useState, useEffect, useRef } from 'react';
import {
  Store, Scan, Search, Plus, Minus, Trash2, PauseCircle, PlayCircle,
  CreditCard, Banknote, QrCode, Printer, Users, Package, BarChart3,
  Tag, ArrowLeft, RefreshCw, AlertTriangle, CheckCircle, ShieldCheck,
  Clock, DollarSign, Wallet, Phone, Sparkles
} from 'lucide-react';
import Logo from './Logo';
import BarcodeView from './BarcodeView';
import UpiQrView from './UpiQrView';
import ThermalReceipt from './ThermalReceipt';
import BarcodeStickerModal from './BarcodeStickerModal';
import { playScanBeep, playSuccessChime } from '../utils/sound';
import { storeInfo } from '../data/products';
import { initialCustomers, sampleSalesHistory } from '../data/customers';

export default function FranchisePosTerminal({
  products,
  onUpdateProducts,
  onExitPos
}) {
  // Navigation tabs: 'billing' | 'inventory' | 'customers' | 'reports'
  const [activeTab, setActiveTab] = useState('billing');

  // Active Billing State
  const [billItems, setBillItems] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Customer & Loyalty State
  const [customerPhone, setCustomerPhone] = useState('');
  const [matchedCustomer, setMatchedCustomer] = useState(null);
  const [redeemPoints, setRedeemPoints] = useState(false);
  
  // Held Bills Queue (DMart Supermarket Feature)
  const [heldBills, setHeldBills] = useState([]);

  // Payment Tender State
  const [paymentMode, setPaymentMode] = useState('CASH'); // 'CASH' | 'UPI' | 'CARD' | 'KHATA' | 'SPLIT'
  const [cashTendered, setCashTendered] = useState('');
  const [splitCash, setSplitCash] = useState('');
  const [splitUpi, setSplitUpi] = useState('');
  const [manualDiscount, setManualDiscount] = useState(0);

  // Completed Receipt Modal
  const [currentReceipt, setCurrentReceipt] = useState(null);
  const [showBarcodeModal, setShowBarcodeModal] = useState(false);

  // Sales History & Customer Ledger State
  const [salesHistory, setSalesHistory] = useState(sampleSalesHistory);
  const [customersList, setCustomersList] = useState(initialCustomers);

  // New Product Modal State
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [newProductForm, setNewProductForm] = useState({
    name: '',
    category: 'cosmetics',
    categoryLabel: 'Ladies Cosmetics',
    price: '',
    mrp: '',
    stock: '',
    sku: '',
    barcode: '',
    hsn: '3304',
    gstRate: 18,
    description: ''
  });

  // Current real-time clock
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Barcode input ref for auto-focus
  const barcodeInputRef = useRef(null);
  useEffect(() => {
    if (activeTab === 'billing' && barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, [activeTab, billItems.length]);

  // Customer search by phone
  useEffect(() => {
    if (customerPhone.trim().length >= 4) {
      const found = customersList.find(c => c.phone.includes(customerPhone.trim()));
      setMatchedCustomer(found || null);
    } else {
      setMatchedCustomer(null);
    }
  }, [customerPhone, customersList]);

  // Add item to active bill
  const handleAddItem = (product, qtyToAdd = 1) => {
    playScanBeep();
    setBillItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id
            ? { ...item, qty: item.qty + qtyToAdd }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            sku: product.sku,
            barcode: product.barcode,
            hsn: product.hsn,
            gstRate: product.gstRate || 18,
            mrp: product.mrp,
            price: product.price,
            qty: qtyToAdd,
            image: product.image
          }
        ];
      }
    });
  };

  // Barcode scanner submission
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const query = barcodeInput.trim();
    if (!query) return;

    // Search by Barcode, SKU, or Name
    const found = products.find(
      p => p.barcode === query || p.sku.toLowerCase() === query.toLowerCase() || p.name.toLowerCase().includes(query.toLowerCase())
    );

    if (found) {
      handleAddItem(found, 1);
      setBarcodeInput('');
    } else {
      alert(`No product found matching Barcode / SKU: "${query}". You can select from the quick-pick grid below.`);
    }
  };

  // Update item quantity in active bill
  const handleUpdateQty = (id, newQty) => {
    if (newQty <= 0) {
      setBillItems(prev => prev.filter(item => item.id !== id));
    } else {
      setBillItems(prev =>
        prev.map(item => item.id === id ? { ...item, qty: newQty } : item)
      );
    }
  };

  // Remove item from bill
  const handleRemoveItem = (id) => {
    setBillItems(prev => prev.filter(item => item.id !== id));
  };

  // Clear bill
  const handleClearBill = () => {
    if (billItems.length === 0) return;
    if (window.confirm('Are you sure you want to clear the current bill?')) {
      setBillItems([]);
      setCustomerPhone('');
      setCashTendered('');
      setRedeemPoints(false);
      setManualDiscount(0);
    }
  };

  // Hold Bill feature (DMart Cashier standard)
  const handleHoldBill = () => {
    if (billItems.length === 0) return;
    const heldEntry = {
      id: `HOLD-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleTimeString(),
      customerName: matchedCustomer?.name || (customerPhone ? `+91 ${customerPhone}` : 'Walk-in Guest'),
      customerPhone,
      items: [...billItems],
      totalAmount: billItems.reduce((acc, i) => acc + i.price * i.qty, 0)
    };
    setHeldBills(prev => [heldEntry, ...prev]);
    setBillItems([]);
    setCustomerPhone('');
    playSuccessChime();
    alert(`Bill has been placed on HOLD (Queue ID: ${heldEntry.id}). You can recall it anytime.`);
  };

  // Resume Bill from hold
  const handleResumeBill = (heldEntry) => {
    if (billItems.length > 0 && !window.confirm('Current active bill will be overwritten. Proceed?')) {
      return;
    }
    setBillItems(heldEntry.items);
    setCustomerPhone(heldEntry.customerPhone || '');
    setHeldBills(prev => prev.filter(h => h.id !== heldEntry.id));
    playScanBeep();
  };

  // Financial Calculations
  const grossMrp = billItems.reduce((acc, i) => acc + i.mrp * i.qty, 0);
  const netBeforeDiscount = billItems.reduce((acc, i) => acc + i.price * i.qty, 0);
  const schemeDiscount = grossMrp - netBeforeDiscount;
  
  // Loyalty points discount (if redeemed, 1 point = ₹1, up to netBeforeDiscount)
  const pointsAvailable = matchedCustomer ? matchedCustomer.loyaltyPoints : 0;
  const pointsDiscount = redeemPoints ? Math.min(pointsAvailable, netBeforeDiscount) : 0;
  
  const totalDiscount = schemeDiscount + pointsDiscount + Number(manualDiscount || 0);
  const finalPayable = Math.max(0, grossMrp - totalDiscount);
  
  // Round off
  const roundOff = (Math.round(finalPayable) - finalPayable);
  const roundedGrandTotal = Math.round(finalPayable);

  // Change computation for Cash
  const changeReturned = Math.max(0, (Number(cashTendered) || 0) - roundedGrandTotal);

  // Settle Bill & Print Invoice
  const handleSettleBill = () => {
    if (billItems.length === 0) {
      alert('Cart is empty. Please scan or select items first.');
      return;
    }

    if (paymentMode === 'CASH' && cashTendered && Number(cashTendered) < roundedGrandTotal) {
      alert(`Cash tendered (₹${cashTendered}) is less than the Grand Total (₹${roundedGrandTotal}).`);
      return;
    }

    const billId = `SSS-FR-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const timestamp = `${now.toLocaleDateString('en-IN')} ${now.toLocaleTimeString('en-IN')}`;

    const newInvoice = {
      id: billId,
      timestamp,
      cashier: 'Priyanshu Sharma (Franchise Head)',
      counter: 'COUNTER-01 (MALL POS)',
      customerName: matchedCustomer?.name || (customerPhone ? `Customer (${customerPhone})` : 'Walk-in Guest'),
      customerPhone: customerPhone || matchedCustomer?.phone || '',
      itemsCount: billItems.length,
      totalQty: billItems.reduce((s, i) => s + i.qty, 0),
      subtotal: grossMrp,
      discount: totalDiscount,
      taxable: Math.round(roundedGrandTotal * 0.88),
      cgst: Math.round(roundedGrandTotal * 0.06),
      sgst: Math.round(roundedGrandTotal * 0.06),
      roundOff,
      grandTotal: roundedGrandTotal,
      paymentMode,
      cashTendered: paymentMode === 'CASH' ? Number(cashTendered) || roundedGrandTotal : null,
      changeReturned: paymentMode === 'CASH' ? changeReturned : null,
      items: billItems.map(item => ({
        name: item.name,
        sku: item.sku,
        hsn: item.hsn,
        qty: item.qty,
        rate: item.price,
        amount: item.price * item.qty
      }))
    };

    // Update stock levels in inventory
    const updatedProducts = products.map(p => {
      const sold = billItems.find(i => i.id === p.id);
      if (sold) {
        return { ...p, stock: Math.max(0, p.stock - sold.qty) };
      }
      return p;
    });
    onUpdateProducts(updatedProducts);

    // Update sales history
    setSalesHistory(prev => [newInvoice, ...prev]);

    // Update customer loyalty points (earn 1 point per ₹100 spent)
    if (customerPhone) {
      const earned = Math.floor(roundedGrandTotal / 100);
      setCustomersList(prev => {
        const existingIdx = prev.findIndex(c => c.phone === customerPhone);
        if (existingIdx >= 0) {
          const updated = [...prev];
          const curr = updated[existingIdx];
          updated[existingIdx] = {
            ...curr,
            loyaltyPoints: (curr.loyaltyPoints - (redeemPoints ? pointsDiscount : 0)) + earned,
            totalOrders: curr.totalOrders + 1,
            lifetimeSpend: curr.lifetimeSpend + roundedGrandTotal
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: `cust-${Date.now()}`,
              name: `Customer (${customerPhone})`,
              phone: customerPhone,
              email: '',
              address: 'Sikar, Rajasthan',
              pincode: '332001',
              loyaltyPoints: earned,
              creditBalance: 0,
              totalOrders: 1,
              lifetimeSpend: roundedGrandTotal,
              joinDate: new Date().toISOString().split('T')[0]
            }
          ];
        }
      });
    }

    playSuccessChime();
    setCurrentReceipt(newInvoice);

    // Reset cashier register for next customer
    setBillItems([]);
    setCustomerPhone('');
    setCashTendered('');
    setRedeemPoints(false);
    setManualDiscount(0);
  };

  // Add Product form handler
  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProductForm.name || !newProductForm.price) return;

    const newProd = {
      id: `custom-${Date.now()}`,
      name: newProductForm.name,
      category: newProductForm.category,
      categoryLabel: newProductForm.categoryLabel,
      price: Number(newProductForm.price),
      mrp: Number(newProductForm.mrp || newProductForm.price),
      discount: Math.round(((Number(newProductForm.mrp) - Number(newProductForm.price)) / Number(newProductForm.mrp)) * 100) || 0,
      rating: 5.0,
      reviewsCount: 1,
      stock: Number(newProductForm.stock || 20),
      sku: newProductForm.sku || `SSS-${newProductForm.category.toUpperCase().slice(0,3)}-${Date.now().toString().slice(-3)}`,
      barcode: newProductForm.barcode || `89045610${Date.now().toString().slice(-4)}`,
      hsn: newProductForm.hsn || '3304',
      gstRate: Number(newProductForm.gstRate) || 18,
      badge: 'New Stock',
      featured: false,
      description: newProductForm.description || `${newProductForm.name} available at Sikar Season Shop.`,
      image: products.find(p => p.category === newProductForm.category)?.image || products[0].image
    };

    onUpdateProducts([newProd, ...products]);
    setShowAddProductModal(false);
    setNewProductForm({
      name: '',
      category: 'cosmetics',
      categoryLabel: 'Ladies Cosmetics',
      price: '',
      mrp: '',
      stock: '',
      sku: '',
      barcode: '',
      hsn: '3304',
      gstRate: 18,
      description: ''
    });
    alert(`Product "${newProd.name}" added to inventory successfully!`);
  };

  // Quick Stock Adjustment
  const handleStockAdjust = (id, delta) => {
    const updated = products.map(p =>
      p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p
    );
    onUpdateProducts(updated);
  };

  // Filtered Products for POS Quick-Pick Grid
  const filteredQuickPick = products.filter(p => {
    const matchCat = selectedCategory === 'all' || p.category === selectedCategory;
    const matchSearch = !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  // Analytics Computations
  const totalSalesRevenue = salesHistory.reduce((s, b) => s + b.grandTotal, 0);
  const totalInvoicesCount = salesHistory.length;
  const totalUnitsSold = salesHistory.reduce((s, b) => s + (b.totalQty || b.items.length), 0);
  const totalCashCollected = salesHistory.filter(b => b.paymentMode === 'CASH').reduce((s, b) => s + b.grandTotal, 0);
  const totalUpiCollected = salesHistory.filter(b => b.paymentMode === 'UPI').reduce((s, b) => s + b.grandTotal, 0);
  const totalGstCollected = salesHistory.reduce((s, b) => s + (b.cgst + b.sgst), 0);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-gray-900 flex flex-col font-sans select-none">
      
      {/* TOP POS MALL BANNER & STATUS BAR */}
      <header className="bg-gradient-to-r from-[#032D22] via-[#064E3B] to-[#043828] text-white px-4 py-2.5 shadow-md border-b-2 border-[#FF7722] flex flex-wrap items-center justify-between gap-3 z-30 no-print">
        {/* Store & Franchise Branding */}
        <div className="flex items-center gap-3">
          <Logo variant="full" size="sm" theme="light" />
          <span className="px-2.5 py-1 bg-[#FF7722] text-white text-[10px] font-black rounded-full uppercase tracking-wider shadow-xs hidden sm:inline-block">
            MALL POS #01
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-black/25 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setActiveTab('billing')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'billing' ? 'bg-[#FF7722] text-white shadow-sm' : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Scan className="w-4 h-4" />
            Billing Counter
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'inventory' ? 'bg-[#FF7722] text-white shadow-sm' : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Package className="w-4 h-4" />
            Inventory &amp; Stock
          </button>
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'customers' ? 'bg-[#FF7722] text-white shadow-sm' : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <Users className="w-4 h-4" />
            Customers &amp; Khata
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-3.5 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
              activeTab === 'reports' ? 'bg-[#FF7722] text-white shadow-sm' : 'text-emerald-100 hover:bg-white/10'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Z-Report / Analytics
          </button>
        </div>

        {/* Right Status Meta & Storefront Return */}
        <div className="flex items-center gap-3 text-xs">
          <div className="hidden lg:flex items-center gap-2 bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-700/50">
            <Clock className="w-3.5 h-3.5 text-[#FF7722]" />
            <span className="font-mono text-emerald-100 font-bold">{currentTime}</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" title="POS Server Connected" />
          </div>

          <button
            onClick={() => setShowBarcodeModal(true)}
            className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Tag className="w-3.5 h-3.5 text-[#FF7722]" />
            Barcode Labels
          </button>

          <button
            onClick={onExitPos}
            className="px-3 py-1.5 bg-white text-[#064E3B] hover:bg-emerald-50 font-black rounded-lg flex items-center gap-1.5 transition-colors shadow-md border border-white"
          >
            <ArrowLeft className="w-4 h-4 text-[#FF7722]" />
            Storefront
          </button>
        </div>
      </header>

      {/* MAIN POS CONTENT ROUTING */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* ============================================================== */}
        {/* 1. BILLING COUNTER VIEW (DMart / Vishal Mega Mart UI)          */}
        {/* ============================================================== */}
        {activeTab === 'billing' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            
            {/* LEFT 60%: ACTIVE BILL TABLE & SCANNER */}
            <div className="lg:w-[62%] flex flex-col bg-white border-r border-[#E8DFC8] overflow-hidden">
              
              {/* Cashier Barcode Gun Scan & Customer Lookup Bar */}
              <div className="p-3 bg-[#FAF7F2] border-b border-[#E8DFC8] space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  {/* Barcode Scanner Gun Input */}
                  <form onSubmit={handleBarcodeSubmit} className="flex-1 min-w-[260px] relative">
                    <Scan className="w-4 h-4 absolute left-3 top-2.5 text-[#064E3B]" />
                    <input
                      ref={barcodeInputRef}
                      type="text"
                      value={barcodeInput}
                      onChange={(e) => setBarcodeInput(e.target.value)}
                      placeholder="Scan Barcode Gun / Type SKU / Press Enter..."
                      className="w-full text-xs font-mono font-bold pl-9 pr-20 py-2 bg-white border-2 border-[#064E3B] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FF7722] shadow-sm text-gray-900"
                    />
                    <button
                      type="submit"
                      className="absolute right-1.5 top-1 px-3 py-1 bg-[#064E3B] text-white text-[11px] font-bold rounded-lg hover:bg-[#043828] transition-colors"
                    >
                      Add (Enter)
                    </button>
                  </form>

                  {/* Customer Mobile Number Search */}
                  <div className="w-full sm:w-56 relative">
                    <Phone className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="Customer Mobile (Loyalty)"
                      className="w-full text-xs font-semibold pl-8 pr-3 py-2 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                    />
                  </div>

                  {/* Held Bills Counter / Recall */}
                  {heldBills.length > 0 && (
                    <div className="relative group">
                      <button className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm animate-pulse">
                        <PauseCircle className="w-4 h-4" />
                        {heldBills.length} on Hold
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-64 bg-white rounded-xl shadow-xl border border-amber-300 p-2 z-40 hidden group-hover:block">
                        <div className="text-[11px] font-bold text-gray-700 pb-1 border-b">Resume Held Bill:</div>
                        {heldBills.map((hb) => (
                          <div key={hb.id} className="p-1.5 hover:bg-amber-50 rounded text-xs flex justify-between items-center border-b border-gray-100 last:border-0">
                            <div>
                              <div className="font-bold text-gray-900">{hb.customerName}</div>
                              <div className="text-[10px] text-gray-500">{hb.timestamp} • ₹{hb.totalAmount}</div>
                            </div>
                            <button
                              onClick={() => handleResumeBill(hb)}
                              className="px-2 py-1 bg-[#064E3B] text-white text-[10px] font-bold rounded hover:bg-[#043828]"
                            >
                              Resume
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Customer Loyalty / Khata Recognition Card */}
                {matchedCustomer && (
                  <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-xs flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-[#064E3B] text-white flex items-center justify-center font-bold text-[10px]">
                        ✓
                      </div>
                      <div>
                        <span className="font-black text-[#064E3B]">{matchedCustomer.name}</span>
                        <span className="text-gray-500 text-[11px] ml-1">({matchedCustomer.address})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-[11px]">
                        Loyalty Points: <strong className="text-[#FF7722]">{matchedCustomer.loyaltyPoints} pts (₹{matchedCustomer.loyaltyPoints})</strong>
                      </div>
                      {matchedCustomer.creditBalance > 0 && (
                        <div className="text-[11px] text-rose-700 font-bold">
                          Khata Due: ₹{matchedCustomer.creditBalance}
                        </div>
                      )}
                      {matchedCustomer.loyaltyPoints > 0 && (
                        <label className="flex items-center gap-1 font-bold text-emerald-900 cursor-pointer bg-white px-2 py-0.5 rounded border border-emerald-300 text-[11px]">
                          <input
                            type="checkbox"
                            checked={redeemPoints}
                            onChange={(e) => setRedeemPoints(e.target.checked)}
                            className="rounded text-[#064E3B]"
                          />
                          Redeem Points
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Active Supermarket Items Table (DMart / Vishal Mega Mart Standard) */}
              <div className="flex-1 overflow-y-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-[#EDE4D3] text-gray-800 font-bold sticky top-0 z-10 text-[11px] uppercase tracking-wider border-b border-[#D3C3A8]">
                    <tr>
                      <th className="py-2.5 px-3 w-10 text-center">#</th>
                      <th className="py-2.5 px-2">Item Description</th>
                      <th className="py-2.5 px-2 text-center">HSN</th>
                      <th className="py-2.5 px-2 text-right">MRP</th>
                      <th className="py-2.5 px-2 text-right">Selling Rate</th>
                      <th className="py-2.5 px-2 text-center w-28">Quantity</th>
                      <th className="py-2.5 px-2 text-right">Line Total</th>
                      <th className="py-2.5 px-2 text-center w-10">Del</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {billItems.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-gray-400">
                          <Scan className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#064E3B]" />
                          <p className="text-sm font-bold text-gray-600">Register Ready • Scan Barcode Gun or Select Item</p>
                          <p className="text-xs text-gray-400 mt-1">Cashier: Priyanshu Sharma • Sikar Season Shop POS</p>
                        </td>
                      </tr>
                    ) : (
                      billItems.map((item, idx) => (
                        <tr key={item.id} className="hover:bg-amber-50/50 transition-colors">
                          <td className="py-2 px-3 text-center text-gray-500 font-mono text-[11px]">{idx + 1}</td>
                          <td className="py-2 px-2">
                            <div className="font-bold text-gray-900 line-clamp-1">{item.name}</div>
                            <div className="text-[10px] text-gray-500 font-mono">
                              SKU: {item.sku} | Barcode: {item.barcode}
                            </div>
                          </td>
                          <td className="py-2 px-2 text-center font-mono text-gray-600 text-[11px]">{item.hsn}</td>
                          <td className="py-2 px-2 text-right text-gray-400 line-through text-[11px]">₹{item.mrp}</td>
                          <td className="py-2 px-2 text-right font-bold text-emerald-800 text-[11px]">₹{item.price}</td>
                          <td className="py-2 px-2 text-center">
                            <div className="inline-flex items-center border border-gray-300 rounded-lg bg-white overflow-hidden shadow-sm">
                              <button
                                onClick={() => handleUpdateQty(item.id, item.qty - 1)}
                                className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-100"
                              >
                                -
                              </button>
                              <span className="px-2 py-0.5 text-xs font-bold text-gray-900 min-w-[24px] text-center">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => handleUpdateQty(item.id, item.qty + 1)}
                                className="px-2 py-0.5 text-xs font-bold text-gray-600 hover:bg-gray-100"
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="py-2 px-2 text-right font-black text-gray-900 text-xs">
                            ₹{(item.price * item.qty).toFixed(2)}
                          </td>
                          <td className="py-2 px-2 text-center">
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="text-gray-400 hover:text-rose-600 transition-colors p-1"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Quick Cashier Action Bar (Hold, Clear, Keyboard cues) */}
              <div className="p-2.5 bg-[#F4EFE6] border-t border-[#E8DFC8] flex flex-wrap items-center justify-between text-xs font-semibold text-gray-700">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleHoldBill}
                    disabled={billItems.length === 0}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold hover:bg-amber-50 hover:text-amber-800 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <PauseCircle className="w-3.5 h-3.5 text-amber-600" />
                    Hold Bill (F4)
                  </button>
                  <button
                    onClick={handleClearBill}
                    disabled={billItems.length === 0}
                    className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold hover:bg-rose-50 hover:text-rose-700 transition-colors flex items-center gap-1.5 disabled:opacity-40"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    Clear (Esc)
                  </button>
                </div>

                <div className="text-[11px] text-gray-600">
                  Total Items: <strong className="text-gray-900 font-bold">{billItems.length}</strong> | Total Units:{' '}
                  <strong className="text-gray-900 font-bold">{billItems.reduce((s, i) => s + i.qty, 0)}</strong>
                </div>
              </div>
            </div>

            {/* RIGHT 40%: QUICK-PICK ITEM GRID & PAYMENT SETTLEMENT */}
            <div className="lg:w-[38%] flex flex-col bg-[#FAF7F2] overflow-hidden border-t lg:border-t-0 border-[#E8DFC8]">
              
              {/* Category Filter Pills for Fast Cashier Selection */}
              <div className="p-2.5 bg-white border-b border-[#E8DFC8]">
                <div className="flex gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold">
                  {[
                    { id: 'all', name: 'All Items' },
                    { id: 'cosmetics', name: 'Cosmetics' },
                    { id: 'bangles', name: 'Bangles' },
                    { id: 'socks', name: 'Socks' },
                    { id: 'undergarments', name: 'Undergarments' },
                    { id: 'showpieces', name: 'Showpieces' },
                    { id: 'shawls', name: 'Shawls' },
                  ].map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-2.5 py-1 rounded-lg whitespace-nowrap transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#064E3B] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fast Visual Touch Pick Grid */}
              <div className="h-48 overflow-y-auto p-2 bg-[#F9FAFB] border-b border-[#E8DFC8] grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {filteredQuickPick.slice(0, 15).map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleAddItem(item, 1)}
                    className="p-1.5 bg-white hover:bg-emerald-50 rounded-lg border border-gray-200 hover:border-[#064E3B] text-left transition-all flex flex-col justify-between shadow-xs group"
                  >
                    <div className="w-full h-12 bg-white flex items-center justify-center mb-1">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full object-contain"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = '/images/products/cosmetics_01.png';
                        }}
                      />
                    </div>
                    <div className="text-[10px] font-bold text-gray-900 line-clamp-1 group-hover:text-[#064E3B]">
                      {item.name}
                    </div>
                    <div className="flex justify-between items-baseline text-[10px] mt-0.5">
                      <span className="font-mono text-gray-400">[{item.sku.split('-')[1]}]</span>
                      <span className="font-black text-[#064E3B]">₹{item.price}</span>
                    </div>
                  </button>
                ))}
              </div>

              {/* FINANCIAL SETTLEMENT PANEL (DMart Supermarket Cash Register style) */}
              <div className="flex-1 overflow-y-auto p-3.5 space-y-3 bg-white">
                
                {/* Big Savings Green Banner (Vishal Mega Mart & DMart Signature) */}
                {totalDiscount > 0 && (
                  <div className="p-2 bg-emerald-50 border border-emerald-300 rounded-xl text-center">
                    <p className="text-xs font-black text-emerald-900 tracking-wide">
                      CUSTOMER SAVES: ₹{totalDiscount.toFixed(2)} TODAY!
                    </p>
                  </div>
                )}

                {/* Financial Line Item Breakdown */}
                <div className="p-3 bg-[#FAF7F2] rounded-xl border border-[#E8DFC8] space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Gross MRP Amount:</span>
                    <span>₹{grossMrp.toFixed(2)}</span>
                  </div>
                  {schemeDiscount > 0 && (
                    <div className="flex justify-between text-emerald-800 font-semibold">
                      <span>Scheme / Franchise Discount:</span>
                      <span>-₹{schemeDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {pointsDiscount > 0 && (
                    <div className="flex justify-between text-[#FF7722] font-semibold">
                      <span>Loyalty Points Redeemed:</span>
                      <span>-₹{pointsDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-700">
                    <span>Taxable Amount:</span>
                    <span>₹{(roundedGrandTotal * 0.88).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-500 text-[11px]">
                    <span>CGST + SGST (Included):</span>
                    <span>₹{(roundedGrandTotal * 0.12).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-black text-gray-950 border-t-2 border-gray-900 pt-2 mt-1">
                    <span>NET AMOUNT PAYABLE:</span>
                    <span className="text-lg text-[#064E3B] font-mono">₹{roundedGrandTotal.toFixed(2)}</span>
                  </div>
                </div>

                {/* Tender Mode Buttons */}
                <div>
                  <label className="block text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Select Tender / Payment Mode:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
                    {[
                      { id: 'CASH', label: 'Cash', icon: Banknote },
                      { id: 'UPI', label: 'UPI QR', icon: QrCode },
                      { id: 'CARD', label: 'Card POS', icon: CreditCard },
                      { id: 'KHATA', label: 'Khata/Udhar', icon: Wallet },
                    ].map(mode => {
                      const Icon = mode.icon;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => setPaymentMode(mode.id)}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            paymentMode === mode.id
                              ? 'bg-[#064E3B] text-white border-[#064E3B] shadow-sm'
                              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-[#FF7722]" />
                          <span className="text-[11px]">{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tender Sub-Panels */}
                {paymentMode === 'CASH' && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2 text-xs">
                    <div className="flex items-center justify-between gap-3">
                      <label className="font-bold text-gray-700">Cash Received (₹):</label>
                      <input
                        type="number"
                        value={cashTendered}
                        onChange={(e) => setCashTendered(e.target.value)}
                        placeholder={`e.g. ${roundedGrandTotal}`}
                        className="w-32 px-3 py-1.5 bg-white border-2 border-amber-400 rounded-lg text-sm font-bold text-gray-900 text-right focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                      />
                    </div>
                    {cashTendered && (
                      <div className="flex items-center justify-between text-xs font-black pt-1 border-t border-amber-200">
                        <span className="text-gray-700">Change Due to Customer:</span>
                        <span className="text-base text-emerald-800 font-mono">₹{changeReturned.toFixed(2)}</span>
                      </div>
                    )}
                  </div>
                )}

                {paymentMode === 'UPI' && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-300 flex flex-col items-center">
                    <UpiQrView
                      upiId={storeInfo.upiId}
                      name={storeInfo.name}
                      amount={roundedGrandTotal}
                      size={140}
                    />
                    <p className="text-[10px] text-gray-500 mt-1">Customer scans &amp; pays direct to {storeInfo.upiId}</p>
                  </div>
                )}

                {paymentMode === 'KHATA' && (
                  <div className="p-2.5 bg-rose-50 border border-rose-300 rounded-xl text-xs space-y-1">
                    <p className="font-bold text-rose-900">Store Credit / Khata Debit Entry:</p>
                    <p className="text-gray-600">
                      Amount of <strong>₹{roundedGrandTotal}</strong> will be added to customer ledger for {matchedCustomer?.name || customerPhone || 'Valued Customer'}.
                    </p>
                  </div>
                )}

                {/* SETTLE & PRINT BUTTONS (Giant Mall Register Buttons) */}
                <div className="pt-2 space-y-2">
                  <button
                    onClick={handleSettleBill}
                    disabled={billItems.length === 0}
                    className="w-full py-3.5 bg-[#064E3B] hover:bg-[#043828] text-white rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-xl transition-transform active:scale-[0.99] disabled:opacity-40"
                  >
                    <Printer className="w-5 h-5 text-[#FF7722]" />
                    PRINT TAX INVOICE &amp; COMPLETE (₹{roundedGrandTotal.toFixed(2)})
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 2. INVENTORY & STOCK MANAGEMENT VIEW                           */}
        {/* ============================================================== */}
        {activeTab === 'inventory' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {/* Inventory KPI Header */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs">
                <p className="text-xs text-gray-500 font-bold uppercase">Total Catalog SKUs</p>
                <h3 className="text-2xl font-black text-[#064E3B] mt-1">{products.length} Products</h3>
                <p className="text-[11px] text-emerald-700 mt-0.5">Active merchandise in Sikar</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs">
                <p className="text-xs text-gray-500 font-bold uppercase">Total In-Stock Units</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">
                  {products.reduce((s, p) => s + p.stock, 0)} Units
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Physical store stock count</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs">
                <p className="text-xs text-gray-500 font-bold uppercase">Inventory Value (MRP)</p>
                <h3 className="text-2xl font-black text-[#D95305] mt-1">
                  ₹{products.reduce((s, p) => s + (p.mrp * p.stock), 0).toLocaleString('en-IN')}
                </h3>
                <p className="text-[11px] text-gray-500 mt-0.5">Total retail assets value</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs">
                <p className="text-xs text-gray-500 font-bold uppercase">Low Stock Alerts (&lt;15)</p>
                <h3 className="text-2xl font-black text-amber-600 mt-1">
                  {products.filter(p => p.stock < 15).length} Items
                </h3>
                <p className="text-[11px] text-amber-700 mt-0.5">Reorder required soon</p>
              </div>
            </div>

            {/* Inventory Action Bar */}
            <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] flex flex-wrap items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 flex-1 min-w-[260px]">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products by SKU, Barcode, Title..."
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowBarcodeModal(true)}
                  className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-[#064E3B] border border-[#064E3B] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Tag className="w-4 h-4 text-[#FF7722]" />
                  Print Barcode Stickers
                </button>
                <button
                  onClick={() => setShowAddProductModal(true)}
                  className="px-4 py-2 bg-[#064E3B] hover:bg-[#043828] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <Plus className="w-4 h-4 text-[#FF7722]" />
                  Add New Product
                </button>
              </div>
            </div>

            {/* Comprehensive Stock Ledger Table */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7F2] text-gray-700 font-bold uppercase text-[11px] border-b border-[#E8DFC8]">
                  <tr>
                    <th className="py-3 px-4">Product Info</th>
                    <th className="py-3 px-3">Category</th>
                    <th className="py-3 px-3">SKU / Barcode</th>
                    <th className="py-3 px-3 text-center">HSN</th>
                    <th className="py-3 px-3 text-right">MRP</th>
                    <th className="py-3 px-3 text-right">Our Price</th>
                    <th className="py-3 px-3 text-center">Current Stock</th>
                    <th className="py-3 px-3 text-center">Status</th>
                    <th className="py-3 px-4 text-center">Quick Stock Adjust</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products
                    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
                    .map(product => (
                      <tr key={product.id} className="hover:bg-amber-50/40">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg p-1 flex-shrink-0 flex items-center justify-center">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-contain"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = '/images/products/cosmetics_01.png';
                              }}
                            />
                          </div>
                          <span className="font-bold text-gray-900 line-clamp-1">{product.name}</span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-semibold uppercase">
                            {product.categoryLabel}
                          </span>
                        </td>
                        <td className="py-3 px-3 font-mono text-[11px] text-gray-600">
                          <div>{product.sku}</div>
                          <div className="text-[10px] text-gray-400">{product.barcode}</div>
                        </td>
                        <td className="py-3 px-3 text-center font-mono text-gray-600">{product.hsn}</td>
                        <td className="py-3 px-3 text-right text-gray-400 line-through">₹{product.mrp}</td>
                        <td className="py-3 px-3 text-right font-black text-[#064E3B]">₹{product.price}</td>
                        <td className="py-3 px-3 text-center font-bold text-sm">
                          {product.stock}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {product.stock >= 15 ? (
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-[10px] font-bold">
                              In Stock
                            </span>
                          ) : product.stock > 0 ? (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full text-[10px] font-bold">
                              Low Stock
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 bg-rose-100 text-rose-800 rounded-full text-[10px] font-bold">
                              Out of Stock
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <div className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleStockAdjust(product.id, -1)}
                              className="px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded text-xs font-bold text-gray-700"
                              title="Decrease 1"
                            >
                              -1
                            </button>
                            <button
                              onClick={() => handleStockAdjust(product.id, 5)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 rounded text-xs font-bold text-[#064E3B] border border-emerald-300"
                              title="Add 5"
                            >
                              +5
                            </button>
                            <button
                              onClick={() => handleStockAdjust(product.id, 20)}
                              className="px-2.5 py-1 bg-[#064E3B] hover:bg-[#043828] rounded text-xs font-bold text-white shadow-xs"
                              title="Stock In Bulk (+20)"
                            >
                              +20
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 3. CUSTOMER CRM & KHATA LEDGER VIEW                           */}
        {/* ============================================================== */}
        {activeTab === 'customers' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl border border-[#E8DFC8]">
              <div>
                <h2 className="text-lg font-black text-gray-900 font-serif">Customer CRM &amp; Khata Udhar Register</h2>
                <p className="text-xs text-gray-500">Manage regular Sikar customers, credit balances &amp; loyalty reward points</p>
              </div>
              <div className="text-xs font-bold text-[#064E3B]">
                Total Registered: {customersList.length} Customers
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {customersList.map((cust) => (
                <div key={cust.id} className="bg-white p-4 rounded-2xl border border-[#E8DFC8] space-y-3 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-gray-900">{cust.name}</h4>
                      <p className="text-xs font-mono text-gray-500">{cust.phone}</p>
                    </div>
                    <span className="px-2 py-0.5 bg-amber-100 text-[#D95305] text-[10px] font-black rounded-full">
                      {cust.loyaltyPoints} Points
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 line-clamp-1">{cust.address}</p>

                  <div className="p-3 bg-[#FAF7F2] rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Lifetime Spend:</span>
                      <span className="font-bold text-gray-900">₹{cust.lifetimeSpend.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Total Visits/Orders:</span>
                      <span className="font-bold text-gray-900">{cust.totalOrders}</span>
                    </div>
                    <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                      <span className="text-gray-700 font-semibold">Khata / Udhar Balance:</span>
                      <span className={`font-black ${cust.creditBalance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                        ₹{cust.creditBalance}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => {
                        const newBal = prompt(`Enter new Khata balance for ${cust.name}:`, cust.creditBalance);
                        if (newBal !== null) {
                          setCustomersList(prev =>
                            prev.map(c => c.id === cust.id ? { ...c, creditBalance: Number(newBal) || 0 } : c)
                          );
                        }
                      }}
                      className="flex-1 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg transition-colors"
                    >
                      Update Khata
                    </button>
                    <a
                      href={`https://wa.me/91${cust.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Namaste ${cust.name}, greetings from Sikar Season Shop! Your loyalty points balance is ${cust.loyaltyPoints} points. Visit us at Station Road, Sikar for festive offers.`)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                    >
                      WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. DAILY SALES & Z-REPORT (DAY END CLOSING / CASH RECON)       */}
        {/* ============================================================== */}
        {activeTab === 'reports' && (
          <div className="flex-1 p-6 overflow-y-auto space-y-5">
            {/* Report Header */}
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFC8] flex flex-wrap justify-between items-center gap-4">
              <div>
                <h2 className="text-xl font-black text-gray-900 font-serif">
                  Daily Franchise Z-Report &amp; Sales Summary
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  End-of-day cash drawer reconciliation &amp; GST tax summary for Sikar Season Shop
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#064E3B] hover:bg-[#043828] text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-md transition-colors"
              >
                <Printer className="w-4 h-4 text-[#FF7722]" />
                Print Daily Z-Report
              </button>
            </div>

            {/* Sales KPIs Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs">
                <p className="text-xs text-gray-500 font-bold uppercase">Total Net Revenue</p>
                <h3 className="text-2xl font-black text-[#064E3B] mt-1">₹{totalSalesRevenue.toLocaleString('en-IN')}</h3>
                <p className="text-[11px] text-emerald-700 font-semibold">{totalInvoicesCount} Invoices generated</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs">
                <p className="text-xs text-gray-500 font-bold uppercase">Cash in Register Drawer</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">₹{totalCashCollected.toLocaleString('en-IN')}</h3>
                <p className="text-[11px] text-gray-500">Physical currency to tally</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs">
                <p className="text-xs text-gray-500 font-bold uppercase">UPI / QR Digital Intake</p>
                <h3 className="text-2xl font-black text-[#FF7722] mt-1">₹{totalUpiCollected.toLocaleString('en-IN')}</h3>
                <p className="text-[11px] text-gray-500">Direct {storeInfo.upiId}</p>
              </div>

              <div className="p-4 bg-white rounded-2xl border border-[#E8DFC8] shadow-xs">
                <p className="text-xs text-gray-500 font-bold uppercase">Total GST Output Tax</p>
                <h3 className="text-2xl font-black text-gray-900 mt-1">₹{totalGstCollected.toFixed(2)}</h3>
                <p className="text-[11px] text-gray-500">CGST + SGST (GSTR-1 Ready)</p>
              </div>
            </div>

            {/* Invoices Audit Trail Table */}
            <div className="bg-white rounded-2xl border border-[#E8DFC8] overflow-hidden shadow-xs">
              <div className="p-4 border-b border-[#E8DFC8] font-bold text-sm text-gray-900 font-serif">
                Recent Invoices Generated Today
              </div>
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF7F2] text-gray-600 font-bold uppercase text-[11px] border-b border-[#E8DFC8]">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    <th className="py-2.5 px-3">Date &amp; Time</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-2 text-center">Items</th>
                    <th className="py-2.5 px-3 text-center">Tender</th>
                    <th className="py-2.5 px-3 text-right">Discount</th>
                    <th className="py-2.5 px-4 text-right">Total Amount</th>
                    <th className="py-2.5 px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {salesHistory.map(invoice => (
                    <tr key={invoice.id} className="hover:bg-amber-50/40">
                      <td className="py-3 px-4 font-mono font-bold text-[#064E3B]">{invoice.id}</td>
                      <td className="py-3 px-3 text-gray-600">{invoice.timestamp}</td>
                      <td className="py-3 px-3 font-semibold text-gray-900">{invoice.customerName}</td>
                      <td className="py-3 px-2 text-center">{invoice.items.length} items</td>
                      <td className="py-3 px-3 text-center">
                        <span className="px-2 py-0.5 bg-gray-100 text-gray-800 rounded font-bold text-[10px]">
                          {invoice.paymentMode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right text-emerald-800 font-medium">₹{invoice.discount}</td>
                      <td className="py-3 px-4 text-right font-black text-gray-950 text-sm">₹{invoice.grandTotal}</td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setCurrentReceipt(invoice)}
                          className="px-2.5 py-1 bg-[#064E3B] text-white rounded text-[11px] font-bold hover:bg-[#043828]"
                        >
                          View Bill
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL 1: THERMAL RECEIPT / GST TAX INVOICE POPUP */}
      {currentReceipt && (
        <ThermalReceipt
          bill={currentReceipt}
          onClose={() => setCurrentReceipt(null)}
        />
      )}

      {/* MODAL 2: BARCODE STICKER LABEL GENERATOR */}
      <BarcodeStickerModal
        products={products}
        isOpen={showBarcodeModal}
        onClose={() => setShowBarcodeModal(false)}
      />

      {/* MODAL 3: ADD NEW PRODUCT MODAL */}
      {showAddProductModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-amber-200">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="font-bold text-base text-[#064E3B] font-serif">Add New Product to Store Catalog</h3>
              <button onClick={() => setShowAddProductModal(false)} className="text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={newProductForm.name}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Royal Kashmiri Woollen Shawl"
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#064E3B]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => {
                      const cat = e.target.value;
                      const labels = {
                        cosmetics: 'Ladies Cosmetics',
                        bangles: 'Royal Bangles',
                        socks: 'Socks & Footwear',
                        undergarments: 'Undergarments (Unisex)',
                        showpieces: 'Showpieces & Gifts',
                        shawls: 'Shawls & Stoles'
                      };
                      setNewProductForm(prev => ({ ...prev, category: cat, categoryLabel: labels[cat] }));
                    }}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  >
                    <option value="cosmetics">Ladies Cosmetics</option>
                    <option value="bangles">Bangles</option>
                    <option value="socks">Socks</option>
                    <option value="undergarments">Undergarments (Unisex)</option>
                    <option value="showpieces">Showpieces</option>
                    <option value="shawls">Shawls (Shall)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Stock Units *</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.stock}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, stock: e.target.value }))}
                    placeholder="25"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Selling Price (₹) *</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, price: e.target.value }))}
                    placeholder="499"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    value={newProductForm.mrp}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, mrp: e.target.value }))}
                    placeholder="799"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">HSN Code</label>
                  <input
                    type="text"
                    value={newProductForm.hsn}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, hsn: e.target.value }))}
                    placeholder="3304"
                    className="w-full px-3 py-2 border rounded-lg font-mono focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">GST Rate (%)</label>
                  <input
                    type="number"
                    value={newProductForm.gstRate}
                    onChange={(e) => setNewProductForm(prev => ({ ...prev, gstRate: e.target.value }))}
                    placeholder="18"
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Custom Barcode (Optional)</label>
                <input
                  type="text"
                  value={newProductForm.barcode}
                  onChange={(e) => setNewProductForm(prev => ({ ...prev, barcode: e.target.value }))}
                  placeholder="Auto-generated if left blank"
                  className="w-full px-3 py-2 border rounded-lg font-mono focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddProductModal(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#064E3B] hover:bg-[#043828] text-white rounded-lg font-bold shadow-md"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
