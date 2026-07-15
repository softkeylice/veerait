/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Search, Ship, MapPin, Truck, Calendar, Clock, AlertTriangle, ShieldCheck, CheckCircle2, Clipboard, Download, FileText } from 'lucide-react';
import { Order } from '../types';

interface OrderTrackingProps {
  orders: Order[];
  addNotification: (title: string, message: string, type: 'success' | 'info' | 'warning' | 'error') => void;
}

export default function OrderTracking({ orders, addNotification }: OrderTrackingProps) {
  const [searchId, setSearchId] = useState('');
  const [foundOrder, setFoundOrder] = useState<Order | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchId.trim()) return;

    const match = orders.find(o => o.id.toUpperCase() === searchId.trim().toUpperCase());
    setFoundOrder(match || null);
    setHasSearched(true);
    
    if (match) {
      addNotification('Order Located', `Found order details for ${match.id}`, 'success');
    } else {
      addNotification('Not Found', 'No records found matching this Order ID.', 'error');
    }
  };

  // Shipping progress timeline maps
  const stages = ['pending', 'processing', 'shipped', 'out_for_delivery', 'delivered'] as const;
  
  const stageDetails = {
    pending: { label: 'Pending', desc: 'Secure payment captured. Order queued.', icon: Calendar },
    processing: { label: 'Processing', desc: 'Supabase ledger verifying product inventory state.', icon: Clock },
    shipped: { label: 'Shipped', desc: 'Handed over to carrier for distribution.', icon: Ship },
    out_for_delivery: { label: 'Out For Delivery', desc: 'Local hub courier dispatched for address delivery.', icon: MapPin },
    delivered: { label: 'Delivered', desc: 'Receipt confirmed by recipient.', icon: CheckCircle2 }
  };

  const getActiveIndex = (status: string) => {
    return stages.indexOf(status as any);
  };

  return (
    <div className="bg-slate-50 text-slate-800 min-h-screen pb-16" id="order-tracking-panel">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        
        {/* Tracking Header */}
        <div className="text-center space-y-3 max-w-xl mx-auto">
          <div className="p-3 bg-blue-50 text-blue-600 border border-blue-100/50 w-fit rounded-full mx-auto shadow-sm">
            <Truck className="w-6 h-6 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">E-Commerce Universal Order Tracker</h2>
          <p className="text-xs text-slate-500">Enter your unique Order Reference ID (e.g. ORD-123456) to audit payment validations, shipping statuses, and download digital licensing invoices instantly.</p>
        </div>

        {/* Search Input bar */}
        <form onSubmit={handleSearch} className="mt-8 max-w-lg mx-auto flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 w-5 h-5 my-auto pointer-events-none" />
            <input
              type="text"
              required
              value={searchId}
              onChange={(e) => setSearchId(e.target.value.toUpperCase())}
              placeholder="ENTER ORDER ID (e.g. ORD-XXXXXX)"
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-250 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-2xl text-sm text-slate-800 placeholder-slate-400 outline-none font-mono uppercase tracking-widest transition-all shadow-sm"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl text-xs transition-all shadow-md shadow-blue-200"
          >
            Audit Progress
          </button>
        </form>

        {/* Search Results Display block */}
        {hasSearched && (
          <div className="mt-12 animate-in zoom-in-95 duration-200">
            {foundOrder ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-8 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
                
                {/* 1. Order Summary metadata */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-150 pb-5 gap-4">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 tracking-widest uppercase font-bold">Transaction Confirmed</span>
                    <h3 className="text-lg font-bold text-slate-900 mt-0.5">{foundOrder.id}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Logged: {new Date(foundOrder.createdAt).toLocaleString()}</p>
                  </div>
                  
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400 block font-bold uppercase">Grand Total Invoice</span>
                    <span className="text-lg font-mono font-bold text-blue-600">₹{foundOrder.total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    <span className="block text-[10px] text-emerald-600 font-semibold mt-0.5 uppercase">● Simulated via Razorpay API</span>
                  </div>
                </div>

                {/* 2. Interactive vertical / horizontal progress timeline */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Real-time Delivery Itinerary</h4>
                  
                  {/* Interactive timeline progress list */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-4">
                    {stages.map((stageName, idx) => {
                      const isActive = idx <= getActiveIndex(foundOrder.shippingStatus);
                      const isCurrent = idx === getActiveIndex(foundOrder.shippingStatus);
                      const stageInfo = stageDetails[stageName];
                      const IconComponent = stageInfo.icon;
                      
                      return (
                        <div
                          key={stageName}
                          className={`p-4 border rounded-2xl flex flex-col justify-between h-36 transition-all ${
                            isCurrent
                              ? 'bg-blue-50/50 border-blue-500 shadow-sm shadow-blue-50 text-slate-900 ring-1 ring-blue-500/20'
                              : isActive
                                ? 'bg-slate-50/80 border-slate-200 text-slate-800'
                                : 'bg-white/40 border-slate-100 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`p-2 rounded-lg ${
                              isActive ? 'bg-blue-100/50 text-blue-600' : 'bg-slate-100 text-slate-400'
                            }`}>
                              <IconComponent className="w-4 h-4" />
                            </div>
                            {isCurrent && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
                            )}
                          </div>
                          
                          <div>
                            <p className={`text-[11px] font-bold ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                              {stageInfo.label}
                            </p>
                            <p className="text-[9px] text-slate-500 line-clamp-2 mt-1 leading-normal">
                              {stageInfo.desc}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Package Courier tracking waybills (hardware only) */}
                {foundOrder.items.some(it => it.product.category === 'hardware') && (
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono text-slate-700">
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Logistics Courier Carrier</span>
                      <strong className="text-slate-800">{foundOrder.courierName || 'BlueDart Logistics'}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Waybill Tracking Number</span>
                      <strong className="text-blue-600 select-all">{foundOrder.trackingId || 'Allocating...'}</strong>
                    </div>
                    <div>
                      <span className="block text-[9px] text-slate-400 font-bold uppercase">Shipping Dispatch Stage</span>
                      <strong className="text-emerald-600 uppercase">{foundOrder.shippingStatus}</strong>
                    </div>
                  </div>
                )}

                {/* 4. Digital Invoice & software downloader shortcut */}
                <div className="border-t border-slate-150 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5 text-xs text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Invoiced recipient: <strong>{foundOrder.customerName}</strong> ({foundOrder.customerEmail})</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(JSON.stringify(foundOrder, null, 2));
                      addNotification('Copied', 'JSON Invoice metadata copied to clipboard!', 'success');
                    }}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-250 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold flex items-center gap-1.5 w-fit transition-colors"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    Copy Order JSON Receipt
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-12 text-center bg-white border border-slate-200 rounded-3xl space-y-4 max-w-lg mx-auto shadow-sm">
                <AlertTriangle className="w-10 h-10 text-red-500 mx-auto" />
                <div>
                  <h3 className="text-base font-bold text-slate-850">Tracking Reference Unmatched</h3>
                  <p className="text-xs text-slate-500 mt-1">Please double check your Order Reference ID. It should be formatted as ORD-XXXXXX (with 6 digits).</p>
                </div>
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-[11px] font-mono text-slate-600 text-left">
                  <p className="font-bold text-slate-800">Available Demo IDs for lookup:</p>
                  <p className="mt-1">● ORD-618491 (pre-configured order trace)</p>
                  <p>● Try checking out inside the Browse Products cart to generate your own!</p>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
