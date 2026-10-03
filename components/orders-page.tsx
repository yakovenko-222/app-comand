'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { Shell } from '@/components/company-app'
import {
  Search, Filter, SlidersHorizontal, ChevronDown, Package, Sparkles, PackageCheck, 
  Truck, MapPin, CircleCheck, CheckCircle2, XCircle, Ban, User, Phone, MapPinned,
  Calendar, Clock, Hash, Plus, Edit3, Copy, ExternalLink, X, Check, Minus, Mail,
  FileText, ShoppingBag, ChevronRight, Layers, AlertTriangle, Archive, CreditCard,
  Receipt, Banknote, Wallet, Scale, Ruler, Box, FileCheck, ToggleLeft, ToggleRight,
  ChevronLeft, Circle, Printer, Trash2, Navigation, Globe, UserPlus, Download, Upload,
  MoreVertical, MessageSquare, Loader2, Info, RotateCcw, Gift, CopyX, GitMerge,
  Database, RefreshCw, AlertCircle, CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { collectionGroup, collection, onSnapshot, query, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'

const statusConfig = {
  new: { label: "Новий", bg: "bg-blue-100 dark:bg-blue-950/50", text: "text-blue-700 dark:text-blue-300", icon: Sparkles },
  packed: { label: "Упаковано", bg: "bg-amber-100 dark:bg-amber-950/50", text: "text-amber-700 dark:text-amber-300", icon: PackageCheck },
  shipped: { label: "Відправлено", bg: "bg-violet-100 dark:bg-violet-950/50", text: "text-violet-700 dark:text-violet-300", icon: Truck },
  delivering: { label: "Доставляється", bg: "bg-indigo-100 dark:bg-indigo-950/50", text: "text-indigo-700 dark:text-indigo-300", icon: MapPin },
  arrived: { label: "У відділенні", bg: "bg-cyan-100 dark:bg-cyan-950/50", text: "text-cyan-700 dark:text-cyan-300", icon: CircleCheck },
  completed: { label: "Виконано", bg: "bg-emerald-100 dark:bg-emerald-950/50", text: "text-emerald-700 dark:text-emerald-300", icon: CheckCircle2 },
  cancelled: { label: "Скасовано", bg: "bg-red-100 dark:bg-red-950/50", text: "text-red-700 dark:text-red-300", icon: XCircle },
};

// Fallback demo orders for testing interface when Firebase has permission restrictions or is empty
const demoOrders = [
  {
    id: 'demo-1',
    orderNumber: '#ORD-9421',
    clientName: 'Олександр Коваленко',
    status: 'new',
    amount: 3450,
    date: 'Сьогодні, 11:20',
    deliveryService: 'Нова Пошта',
    trackingNumber: '20450891234567',
    details: {
      customer: { phone: '+380 67 123 45 67', email: 'o.kovalenko@example.com' },
      delivery: { service: 'Нова Пошта', address: 'Київ, Відділення №24 (вул. Хрещатик, 12)' },
      notes: 'Клієнт просив відправити до 15:00',
      items: [
        { id: 1, name: 'Бездротова механічна клавіатура Atlas Pro RGB', quantity: 1, price: 2850 },
        { id: 2, name: 'Килимок для миші XL (900x400мм)', quantity: 1, price: 600 }
      ]
    }
  },
  {
    id: 'demo-2',
    orderNumber: '#ORD-9420',
    clientName: 'Катерина Васильєва',
    status: 'delivering',
    amount: 1820,
    date: 'Вчора, 16:45',
    deliveryService: 'Нова Пошта',
    trackingNumber: '20450890123456',
    details: {
      customer: { phone: '+380 50 987 65 43', email: 'k.vas@example.com' },
      delivery: { service: 'Нова Пошта', address: 'Львів, Відділення №5' },
      notes: 'Оплата при отриманні (накладений платіж)',
      items: [
        { id: 3, name: 'Ергономічна вертикальна миша Wireless', quantity: 1, price: 1450 },
        { id: 4, name: 'Кабель Type-C to Type-C 100W 2m', quantity: 1, price: 370 }
      ]
    }
  },
  {
    id: 'demo-3',
    orderNumber: '#ORD-9419',
    clientName: 'Дмитро Мельничук',
    status: 'completed',
    amount: 7200,
    date: '02 жовтня 2026',
    deliveryService: 'Укрпошта',
    trackingNumber: '0500123456789',
    details: {
      customer: { phone: '+380 63 555 44 33', email: 'd.meln@example.com' },
      delivery: { service: 'Укрпошта', address: 'Одеса, Відділення 65000' },
      notes: 'Корпоративне замовлення',
      items: [
        { id: 5, name: 'USB-C Док-станція 12-в-1 Dual HDMI 4K', quantity: 2, price: 3600 }
      ]
    }
  },
  {
    id: 'demo-4',
    orderNumber: '#ORD-9418',
    clientName: 'Тетяна Шевченко',
    status: 'packed',
    amount: 980,
    date: '02 жовтня 2026',
    deliveryService: 'Нова Пошта',
    trackingNumber: '20450889911223',
    details: {
      customer: { phone: '+380 97 777 88 99', email: 't.shev@example.com' },
      delivery: { service: 'Нова Пошта', address: 'Дніпро, Поштомат №1142' },
      notes: '',
      items: [
        { id: 6, name: 'Підставка для ноутбука алюмінієва регульована', quantity: 1, price: 980 }
      ]
    }
  }
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<'connecting' | 'connected' | 'permission_error' | 'empty'>('connecting');
  const [copySuccess, setCopySuccess] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: () => void = () => {};

    const setupListener = () => {
      try {
        // Try collectionGroup first
        const q = query(collectionGroup(db, 'orders'));
        unsubscribe = onSnapshot(q, (snapshot) => {
          if (!snapshot.empty) {
            const loadedOrders = snapshot.docs.map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                ...data,
                orderNumber: data.orderNumber || `#${doc.id.slice(0, 6)}`,
                amount: data.amount ?? data.total ?? 0,
                status: data.status || 'new',
                clientName: data.clientName || data.customer?.name || data.customerName || 'Клієнт',
                deliveryService: data.deliveryService || data.delivery?.service || 'Нова Пошта',
                trackingNumber: data.trackingNumber || data.ttn || '',
                date: data.date || (data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('uk-UA') : 'Нещодавно'),
                details: {
                  customer: {
                    phone: data.details?.customer?.phone || data.phone || data.customer?.phone || 'Не вказано',
                    email: data.details?.customer?.email || data.email || ''
                  },
                  delivery: {
                    service: data.details?.delivery?.service || data.deliveryService || 'Нова Пошта',
                    address: data.details?.delivery?.address || data.address || data.deliveryAddress || 'Не вказано'
                  },
                  notes: data.details?.notes || data.notes || '',
                  items: data.details?.items || data.items || []
                }
              };
            });
            setOrders(loadedOrders);
            setDbStatus('connected');
          } else {
            // Collection group returned 0 docs, try root collection
            const rootQ = query(collection(db, 'orders'));
            unsubscribe = onSnapshot(rootQ, (rootSnap) => {
              if (!rootSnap.empty) {
                const loadedOrders = rootSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setOrders(loadedOrders);
                setDbStatus('connected');
              } else {
                setOrders(demoOrders);
                setDbStatus('empty');
              }
              setLoading(false);
            }, (rootErr) => {
              console.warn("Firestore root query error:", rootErr);
              setOrders(demoOrders);
              setDbStatus('permission_error');
              setLoading(false);
            });
            return;
          }
          setLoading(false);
        }, (error) => {
          console.warn("Firebase collectionGroup error:", error);
          // If permission error or other error, fallback to root or show demo with notification
          setOrders(demoOrders);
          setDbStatus('permission_error');
          setLoading(false);
        });
      } catch (err) {
        console.error("Firestore setup error:", err);
        setOrders(demoOrders);
        setDbStatus('permission_error');
        setLoading(false);
      }
    };

    setupListener();
    return () => unsubscribe();
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard?.writeText(text);
    setCopySuccess(id);
    setTimeout(() => setCopySuccess(null), 2000);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const q = search.toLowerCase();
      const orderNumber = String(o.orderNumber || '').toLowerCase();
      const clientName = String(o.clientName || '').toLowerCase();
      const phone = String(o.details?.customer?.phone || o.phone || '').toLowerCase();
      const matchesSearch = !q || orderNumber.includes(q) || clientName.includes(q) || phone.includes(q);

      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'in_progress' ? ['packed','shipped','delivering','arrived'].includes(o.status) : o.status === statusFilter);

      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  if (loading) {
    return (
      <Shell title="Замовлення">
        <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <Loader2 className="animate-spin text-primary h-8 w-8" />
          <p className="text-sm text-muted-foreground">Підключення до бази даних та завантаження замовлень...</p>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      title="Замовлення"
      headerAction={
        <Button size="sm" className="h-9 rounded-xl gap-1.5 shadow-sm">
          <Plus className="h-4 w-4" />
          <span>Створити замовлення</span>
        </Button>
      }
    >
      <div className="flex-1 space-y-5">
        {/* Firebase Connection Status Banner */}
        {dbStatus === 'permission_error' && (
          <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-300/60 bg-amber-50/70 dark:bg-amber-950/30 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
            <AlertCircle className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-amber-950 dark:text-amber-100">
                База даних Firebase (crm-ka-fe376) підключена
              </p>
              <p className="mt-0.5 text-xs opacity-90">
                Потрібно увімкнути права доступу у Firebase Console (Firestore Security Rules). Для тестування можна встановити <code className="bg-amber-200/50 dark:bg-amber-900/60 px-1 py-0.5 rounded font-mono">allow read, write: if true;</code>. 
                Наразі відображаються демонстраційні замовлення для перевірки інтерфейсу.
              </p>
            </div>
          </div>
        )}

        {dbStatus === 'connected' && (
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl border border-emerald-300/50 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 text-xs">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-medium">База даних Firebase (crm-ka-fe376) синхронізована у реальному часі</span>
            </div>
            <span className="text-[11px] opacity-80">{orders.length} замовлень у базі</span>
          </div>
        )}

        {/* Top Controls: Search + Filter tabs */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Пошук за номером, клієнтом, тел..."
              className="pl-9 h-10 rounded-xl bg-card border-border"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Quick status tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'all', label: 'Усі' },
              { id: 'new', label: 'Нові' },
              { id: 'in_progress', label: 'В процесі' },
              { id: 'completed', label: 'Виконано' },
              { id: 'cancelled', label: 'Скасовано' }
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={statusFilter === tab.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(tab.id)}
                className="h-8 rounded-lg text-xs shrink-0"
              >
                {tab.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="rounded-xl border border-border bg-card shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">Всього замовлень</p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">{orders.length}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Package className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-card shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Нові</p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">{orders.filter(o => o.status === 'new').length}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Sparkles className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-card shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-amber-600 dark:text-amber-400 font-medium">В процесі</p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">{orders.filter(o => ['packed','shipped','delivering','arrived'].includes(o.status)).length}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
                <Truck className="size-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border bg-card shadow-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Виконано</p>
                <p className="text-2xl font-bold tracking-tight text-foreground mt-0.5">{orders.filter(o => o.status === 'completed').length}</p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <div className="space-y-3">
          {filteredOrders.length === 0 ? (
            <Card className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
              <Package className="size-10 mx-auto text-muted-foreground/60 mb-3" />
              <p className="text-sm font-semibold text-foreground">Замовлень не знайдено</p>
              <p className="text-xs text-muted-foreground mt-1">Спробуйте змінити пошуковий запит або обрати інший фільтр</p>
            </Card>
          ) : (
            filteredOrders.map(order => {
              const cfg = statusConfig[order.status as keyof typeof statusConfig] || statusConfig.new;
              const StatusIcon = cfg.icon;
              const isExpanded = expandedId === order.id;
              const rawAmount = typeof order.amount === 'number' ? order.amount : parseFloat(order.amount) || 0;
              const formattedAmount = rawAmount.toLocaleString('uk-UA');
              const customerPhone = order.details?.customer?.phone || order.phone || '';
              const customerAddress = order.details?.delivery?.address || order.address || '';
              const itemsList = order.details?.items || order.items || [];
              const orderDate = order.date || 'Нещодавно';

              return (
                <Card 
                  key={order.id} 
                  className={cn(
                    "rounded-xl transition-all cursor-pointer overflow-hidden border-border bg-card",
                    isExpanded ? "ring-2 ring-primary/20 shadow-md" : "hover:border-primary/30 hover:shadow-sm"
                  )} 
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                >
                  <div className="p-4 flex flex-col md:flex-row md:items-center gap-4">
                    {/* Header info (Always visible) */}
                    <div className="flex items-start justify-between w-full md:w-auto md:flex-1">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-sm text-foreground">{order.orderNumber}</span>
                          <Badge variant="outline" className={cn("text-[10px] border-none font-semibold", cfg.bg, cfg.text)}>
                            <StatusIcon className="size-3 mr-1 inline" />
                            {cfg.label}
                          </Badge>
                        </div>
                        <p className="text-sm font-semibold text-foreground">{order.clientName}</p>
                        {customerPhone && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                            <Phone className="size-3 text-muted-foreground" />
                            <a 
                              href={`tel:${customerPhone}`} 
                              onClick={(e) => e.stopPropagation()} 
                              className="hover:underline hover:text-primary"
                            >
                              {customerPhone}
                            </a>
                          </p>
                        )}
                      </div>
                      <div className="text-right md:hidden">
                        <p className="font-bold text-base text-foreground">{formattedAmount} ₴</p>
                        <p className="text-xs text-muted-foreground">{orderDate}</p>
                      </div>
                    </div>

                    {/* Desktop columns */}
                    <div className="hidden md:flex items-center justify-between flex-1 gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Truck className="size-3.5" />
                          <span>{order.deliveryService || 'Служба доставки'}</span>
                        </p>
                        <p className="text-xs font-medium text-foreground mt-0.5">
                          {order.trackingNumber ? `ТТН: ${order.trackingNumber}` : "ТТН ще не створено"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-base text-foreground">{formattedAmount} ₴</p>
                        <p className="text-xs text-muted-foreground">{orderDate}</p>
                      </div>
                    </div>

                    {/* Mobile summary info (when collapsed) */}
                    {!isExpanded && (
                      <div className="flex md:hidden items-center justify-between pt-2 border-t border-border/60 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Truck className="size-3" /> {order.deliveryService || 'Доставка'}
                        </span>
                        <span className="font-medium text-foreground truncate max-w-[180px]">
                          {order.trackingNumber || "—"}
                        </span>
                      </div>
                    )}
                    
                    <div className="hidden md:flex shrink-0">
                      <ChevronDown className={cn("size-5 text-muted-foreground transition-transform duration-200", isExpanded && "rotate-180")} />
                    </div>
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border bg-muted/20 px-4 py-4 space-y-4 cursor-default" onClick={e => e.stopPropagation()}>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Delivery & Notes */}
                        <div className="space-y-3 rounded-xl bg-card border border-border p-3.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <MapPin className="size-3.5" /> Доставка та коментарі
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">Служба:</span>
                              <span className="font-medium text-xs text-foreground">{order.deliveryService}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-xs text-muted-foreground">ТТН:</span>
                              {order.trackingNumber ? (
                                <button
                                  onClick={() => handleCopy(order.trackingNumber, `ttn-${order.id}`)}
                                  className="font-medium text-xs text-primary flex items-center gap-1.5 hover:underline"
                                  title="Натисніть для копіювання"
                                >
                                  <span>{order.trackingNumber}</span>
                                  {copySuccess === `ttn-${order.id}` ? (
                                    <Check className="size-3 text-emerald-500" />
                                  ) : (
                                    <Copy className="size-3 text-muted-foreground" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-xs text-muted-foreground">—</span>
                              )}
                            </div>
                            <div className="flex justify-between items-start gap-2">
                              <span className="text-xs text-muted-foreground shrink-0">Адреса:</span>
                              <span className="font-medium text-xs text-right text-foreground max-w-[70%]">
                                {customerAddress || "Не вказана"}
                              </span>
                            </div>
                            {order.details?.notes && (
                              <div className="mt-2 pt-2 border-t border-border">
                                <span className="text-[11px] font-semibold text-muted-foreground">Примітка менеджера:</span>
                                <p className="text-xs bg-amber-500/10 text-amber-900 dark:text-amber-200 border border-amber-500/20 p-2 rounded-lg mt-1">
                                  {order.details.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Products list */}
                        <div className="space-y-3 rounded-xl bg-card border border-border p-3.5">
                          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                            <ShoppingBag className="size-3.5" /> Товари ({itemsList.length})
                          </h4>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {itemsList.length === 0 ? (
                              <p className="text-xs text-muted-foreground italic py-2">Список товарів порожній або не заповнений</p>
                            ) : (
                              itemsList.map((item: any, idx: number) => {
                                const itemQty = item.quantity || 1;
                                const itemPrice = item.price || 0;
                                const totalItemPrice = (itemQty * itemPrice).toLocaleString('uk-UA');
                                return (
                                  <div key={item.id || idx} className="flex justify-between items-center text-xs border-b border-border/50 pb-2 last:border-0 last:pb-0">
                                    <div className="min-w-0 flex-1 mr-2">
                                      <p className="font-medium text-foreground truncate">{item.name || 'Товар'}</p>
                                      <p className="text-[11px] text-muted-foreground">{itemQty} шт. × {itemPrice.toLocaleString('uk-UA')} ₴</p>
                                    </div>
                                    <span className="font-bold text-foreground whitespace-nowrap">{totalItemPrice} ₴</span>
                                  </div>
                                );
                              })
                            )}
                          </div>
                          <div className="pt-2.5 border-t border-border flex justify-between items-center">
                            <span className="text-xs font-medium text-muted-foreground">Всього до сплати:</span>
                            <span className="font-bold text-base text-foreground">{formattedAmount} ₴</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {order.trackingNumber && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="rounded-lg h-9 gap-1.5 text-xs"
                            onClick={() => window.open(`https://novaposhta.ua/tracking/?cargo_number=${order.trackingNumber}`, '_blank')}
                          >
                            <Truck className="size-3.5" /> Відстежити ТТН
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="rounded-lg h-9 gap-1.5 text-xs"
                          onClick={() => alert(`Редагування замовлення ${order.orderNumber}`)}
                        >
                          <Edit3 className="size-3.5" /> Редагувати
                        </Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </Shell>
  );
}
