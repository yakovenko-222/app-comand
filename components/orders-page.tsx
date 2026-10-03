'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Shell } from '@/components/company-app' // We will export Shell from company-app
import {
  Search, Filter, SlidersHorizontal, ChevronDown, Package, Sparkles, PackageCheck, 
  Truck, MapPin, CircleCheck, CheckCircle2, XCircle, Ban, User, Phone, MapPinned,
  Calendar, Clock, Hash, Plus, Edit3, Copy, ExternalLink, X, Check, Minus, Mail,
  FileText, ShoppingBag, ChevronRight, Layers, AlertTriangle, Archive, CreditCard,
  Receipt, Banknote, Wallet, Scale, Ruler, Box, FileCheck, ToggleLeft, ToggleRight,
  ChevronLeft, Circle, Printer, Trash2, Navigation, Globe, UserPlus, Download, Upload,
  MoreVertical, MessageSquare, Loader2, Info, RotateCcw, Gift, CopyX, GitMerge
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { collectionGroup, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const statusConfig = {
  new: { label: "Новий", bg: "bg-blue-100", text: "text-blue-700", icon: Sparkles },
  packed: { label: "Упаковано", bg: "bg-amber-100", text: "text-amber-700", icon: PackageCheck },
  shipped: { label: "Відправлено", bg: "bg-violet-100", text: "text-violet-700", icon: Truck },
  delivering: { label: "Доставляється", bg: "bg-indigo-100", text: "text-indigo-700", icon: MapPin },
  arrived: { label: "У відділенні", bg: "bg-cyan-100", text: "text-cyan-700", icon: CircleCheck },
  completed: { label: "Виконано", bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2 },
  cancelled: { label: "Скасовано", bg: "bg-red-100", text: "text-red-700", icon: XCircle },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen to all orders across all users
    const q = query(collectionGroup(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedOrders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOrders(loadedOrders);
      setLoading(false);
    }, (error) => {
      console.error("Firebase fetch error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredOrders = useMemo(() => {
    if (!search) return orders;
    const q = search.toLowerCase();
    return orders.filter(o => {
      const orderNumber = String(o.orderNumber || '').toLowerCase();
      const clientName = String(o.clientName || '').toLowerCase();
      const phone = String(o.details?.customer?.phone || '').toLowerCase();
      return orderNumber.includes(q) || clientName.includes(q) || phone.includes(q);
    });
  }, [orders, search]);

  if (loading) {
    return <div className="flex-1 flex items-center justify-center h-[50vh]"><Loader2 className="animate-spin text-primary h-8 w-8" /></div>
  }

  return (
    <div className="flex-1 space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Замовлення</h1>
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Пошук замовлення..." className="pl-9 h-10 rounded-xl"
            />
          </div>
          <Button className="h-10 rounded-xl shrink-0"><Plus className="h-4 w-4 mr-1" /> Нове</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="rounded-xl shadow-sm"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Всього</p><p className="text-xl font-bold">{orders.length}</p></CardContent></Card>
        <Card className="rounded-xl shadow-sm"><CardContent className="p-4"><p className="text-xs text-blue-600">Нові</p><p className="text-xl font-bold">{orders.filter(o=>o.status==='new').length}</p></CardContent></Card>
        <Card className="rounded-xl shadow-sm"><CardContent className="p-4"><p className="text-xs text-amber-600">В процесі</p><p className="text-xl font-bold">{orders.filter(o=>['packed','shipped','delivering'].includes(o.status)).length}</p></CardContent></Card>
        <Card className="rounded-xl shadow-sm"><CardContent className="p-4"><p className="text-xs text-emerald-600">Виконано</p><p className="text-xl font-bold">{orders.filter(o=>o.status==='completed').length}</p></CardContent></Card>
      </div>

      {/* Mobile & Desktop List View */}
      <div className="space-y-3">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-border">Немає замовлень</div>
        ) : filteredOrders.map(order => {
          const cfg = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.new;
          const StatusIcon = cfg.icon;
          const isExpanded = expandedId === order.id;

          return (
            <Card key={order.id} className={cn("rounded-xl transition-all cursor-pointer overflow-hidden border-border", isExpanded ? "ring-2 ring-primary/20 shadow-md" : "hover:border-primary/30 hover:shadow-sm")} onClick={() => setExpandedId(isExpanded ? null : order.id)}>
              <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                {/* Header info (Always visible) */}
                <div className="flex items-start justify-between w-full md:w-auto md:flex-1">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm">{order.orderNumber}</span>
                      <Badge variant="outline" className={cn("text-[10px] border-none", cfg.bg, cfg.text)}>
                        {cfg.label}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium">{order.clientName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="h-3 w-3"/>{order.details.customer.phone}</p>
                  </div>
                  <div className="text-right md:hidden">
                    <p className="font-bold text-base">{order.amount.toLocaleString()} ₴</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                </div>

                {/* Desktop columns */}
                <div className="hidden md:flex items-center justify-between flex-1 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3"/> {order.deliveryService}</p>
                    <p className="text-xs font-medium mt-0.5">{order.trackingNumber || "—"}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-base">{order.amount.toLocaleString()} ₴</p>
                    <p className="text-xs text-muted-foreground">{order.date}</p>
                  </div>
                </div>

                {/* Mobile Extra info (if not expanded) */}
                {!isExpanded && (
                  <div className="flex md:hidden items-center justify-between pt-2 border-t border-border mt-2">
                     <p className="text-xs text-muted-foreground flex items-center gap-1"><Truck className="h-3 w-3"/> {order.deliveryService}</p>
                     <p className="text-xs font-medium">{order.trackingNumber || "—"}</p>
                  </div>
                )}
                
                <div className="hidden md:flex shrink-0">
                  <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", isExpanded && "rotate-180")} />
                </div>
              </div>

              {/* Expanded details (Adapted for Mobile) */}
              {isExpanded && (
                <div className="border-t border-border bg-secondary/10 px-4 py-4 space-y-4 cursor-default" onClick={e => e.stopPropagation()}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Delivery & Notes */}
                    <div className="space-y-3 rounded-lg bg-card border border-border p-3">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground">Доставка та коментарі</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-muted-foreground">Служба</span><span className="font-medium">{order.deliveryService}</span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">ТТН</span><span className="font-medium text-primary flex items-center gap-1">{order.trackingNumber} <Copy className="h-3 w-3 cursor-pointer" onClick={()=>alert('Скопійовано!')}/></span></div>
                        <div className="flex justify-between"><span className="text-muted-foreground">Адреса</span><span className="font-medium text-right max-w-[60%]">{order.details.delivery.address}</span></div>
                        {order.details.notes && (
                           <div className="mt-2 pt-2 border-t border-border">
                             <span className="text-xs text-muted-foreground">Примітка менеджера:</span>
                             <p className="text-sm bg-amber-50 text-amber-800 p-2 rounded mt-1">{order.details.notes}</p>
                           </div>
                        )}
                      </div>
                    </div>

                    {/* Products */}
                    <div className="space-y-3 rounded-lg bg-card border border-border p-3">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground">Товари ({order.details.items.length})</h4>
                      <div className="space-y-2">
                        {order.details.items.map(item => (
                          <div key={item.id} className="flex justify-between items-center text-sm border-b border-border pb-2 last:border-0 last:pb-0">
                            <div>
                              <p className="font-medium line-clamp-1">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.quantity} шт. × {item.price} ₴</p>
                            </div>
                            <span className="font-bold whitespace-nowrap">{(item.quantity * item.price).toLocaleString()} ₴</span>
                          </div>
                        ))}
                      </div>
                      <div className="pt-2 border-t border-border flex justify-between items-center">
                        <span className="font-medium">До сплати</span>
                        <span className="font-bold text-lg">{order.amount.toLocaleString()} ₴</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1 md:flex-none"><Truck className="h-4 w-4 mr-2"/> Відстежити</Button>
                    <Button variant="outline" className="flex-1 md:flex-none"><Edit3 className="h-4 w-4 mr-2"/> Редагувати</Button>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}
