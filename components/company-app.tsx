'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock,
  Download,
  FileText,
  Filter,
  LayoutGrid,
  Menu,
  MessageCircle,
  Package,
  Plus,
  Search,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRound,
  Users,
  Wallet,
  X,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  collection,
  collectionGroup,
  onSnapshot,
  query,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import OrdersPage from './orders-page'

// Navigation links config
const nav = [
  { href: '/tasks', label: 'Задачі', icon: LayoutGrid },
  { href: '/plans', label: 'Плани', icon: CalendarDays },
  { href: '/orders', label: 'Замовлення', icon: Package },
  { href: '/finance', label: 'Фінанси', icon: CircleDollarSign },
  { href: '/payments', label: 'Виплати', icon: Wallet },
  { href: '/chats', label: 'Чати', icon: MessageCircle },
]

const initialPayments = [
  { id: 1, name: 'Олена Коваль', role: 'Проєктна менеджерка', amount: '48 500', rawAmount: 48500, date: '01 жовтня', status: 'Виплачено', iban: 'UA443052990000026001234567890' },
  { id: 2, name: 'Андрій Мельник', role: 'Менеджер з продажів', amount: '42 000', rawAmount: 42000, date: '01 жовтня', status: 'Виплачено', iban: 'UA213052990000026009876543210' },
  { id: 3, name: 'Ірина Бондар', role: 'Фінансова менеджерка', amount: '39 500', rawAmount: 39500, date: '02 жовтня', status: 'Очікує', iban: 'UA773052990000026005544332211' },
  { id: 4, name: 'Максим Литвин', role: 'Розробник', amount: '56 000', rawAmount: 56000, date: '02 жовтня', status: 'Виплачено', iban: 'UA883052990000026009988776655' },
  { id: 5, name: 'Тарас Шевчук', role: 'Дизайнер', amount: '37 000', rawAmount: 37000, date: '03 жовтня', status: 'Очікує', iban: 'UA123052990000026001122334455' },
  { id: 6, name: 'Марія Романюк', role: 'HR-менеджерка', amount: '35 500', rawAmount: 35500, date: '03 жовтня', status: 'Виплачено', iban: 'UA653052990000026006677889900' },
  { id: 7, name: 'Денис Гнатюк', role: 'Аналітик', amount: '44 000', rawAmount: 44000, date: '04 жовтня', status: 'Очікує', iban: 'UA993052990000026003344556677' },
  { id: 8, name: 'Софія Левченко', role: 'Копірайтерка', amount: '31 500', rawAmount: 31500, date: '04 жовтня', status: 'Виплачено', iban: 'UA333052990000026004455667788' },
]

const chartData = [
  { month: 'Трав', доходи: 92, витрати: 54 },
  { month: 'Чер', доходи: 108, витрати: 61 },
  { month: 'Лип', доходи: 96, витрати: 58 },
  { month: 'Сер', доходи: 124, витрати: 73 },
  { month: 'Вер', доходи: 117, витрати: 69 },
  { month: 'Жов', доходи: 132, витрати: 76 },
]

function StatusBadge({ status }: { status: string }) {
  const isDone = status === 'Виконано' || status === 'Виплачено'
  return (
    <Badge
      variant={isDone ? 'default' : 'outline'}
      className={isDone ? 'bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-700' : 'text-amber-600 border-amber-300 dark:text-amber-400 dark:border-amber-700'}
    >
      {status}
    </Badge>
  )
}

function SectionTitle({ title }: { title: string }) {
  return <h2 className="text-base lg:text-lg font-bold tracking-tight text-foreground">{title}</h2>
}

// Desktop Sidebar component
function DesktopSidebar() {
  const pathname = usePathname()
  const cleanPath = (pathname || '/').replace(/\/$/, '') || '/'

  return (
    <aside className="hidden md:flex w-64 flex-col border-r border-border bg-card shrink-0 select-none">
      {/* Brand Header */}
      <div className="flex h-16 items-center gap-3 border-b border-border px-5">
        <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
          <Building2 className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold tracking-tight text-foreground">Робочий простір</p>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="truncate text-xs text-muted-foreground">Команда Atlas</p>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4">
        <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Головне меню
        </div>
        <nav className="flex flex-col gap-1">
          {nav.map(({ href, label, icon: Icon, countBadge }) => {
            const active = cleanPath === href || (href === '/tasks' && cleanPath === '/')
            return (
              <Link
                key={href}
                href={href}
                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`size-4.5 transition-transform group-hover:scale-110 ${active ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                  <span>{label}</span>
                </div>
                {countBadge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      active
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {countBadge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Team Section */}
        <div className="mt-8">
          <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Команда онлайн (8)
          </div>
          <div className="flex flex-col gap-1">
            {[
              { name: 'Олена Коваль', role: 'PM', initials: 'ОК' },
              { name: 'Максим Литвин', role: 'Dev', initials: 'МЛ' },
              { name: 'Тарас Шевчук', role: 'UI/UX', initials: 'ТШ' },
            ].map((member) => (
              <div key={member.name} className="flex items-center gap-2.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:bg-accent">
                <span className="relative flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-[10px] text-foreground">
                  {member.initials}
                  <span className="absolute bottom-0 right-0 size-1.5 rounded-full bg-emerald-500 ring-1 ring-background" />
                </span>
                <span className="truncate font-medium text-foreground">{member.name}</span>
                <span className="ml-auto text-[10px] text-muted-foreground">{member.role}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* User Profile Footer */}
      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/30 p-2.5">
          <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
            ОК
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-foreground">Олена Коваль</p>
            <p className="truncate text-[11px] text-muted-foreground">Керівник проєкту</p>
          </div>
        </div>
      </div>
    </aside>
  )
}

// Unified Shell Component (Mobile + PC)
export function Shell({
  children,
  title,
  headerAction,
}: {
  children: React.ReactNode
  title: string
  headerAction?: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()
  const cleanPath = (pathname || '/').replace(/\/$/, '') || '/'

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar (PC) */}
      <DesktopSidebar />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top Header */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border bg-background/95 px-4 sm:px-6 backdrop-blur">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger - Opens left sidebar */}
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 size-10 text-foreground hover:bg-muted"
              onClick={() => setMenuOpen(true)}
              aria-label="Відкрити меню"
            >
              <Menu className="size-5" />
            </Button>

            {/* Breadcrumb / Title */}
            <div>
              <div className="hidden md:flex items-center gap-2 text-xs text-muted-foreground mb-0.5">
                <span>Робочий простір</span>
                <span>/</span>
                <span className="text-foreground font-medium">{title}</span>
              </div>
              <h1 className="text-lg md:text-xl font-bold tracking-tight text-foreground">{title}</h1>
            </div>
          </div>

          {/* Right Header Section */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Header action (e.g. Add button on PC) */}
            {headerAction && <div className="hidden sm:block">{headerAction}</div>}

            {/* Desktop date info */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground border border-border rounded-lg px-3 py-1.5 bg-muted/30">
              <CalendarDays className="size-3.5" />
              <span>03 жовтня 2026</span>
            </div>

            {/* User avatar indicator */}
            <div className="flex size-9 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-sm">
              ОК
            </div>
          </div>
        </header>

        {/* Main Body: full width container on desktop, no bottom nav space needed */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 pb-8 md:pb-12">
          {children}
        </main>
      </div>

      {/* Mobile Left-Sliding Navigation Sidebar */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-300"
            onClick={() => setMenuOpen(false)}
          />

          {/* Left Sidebar drawer */}
          <div className="relative z-50 w-72 max-w-[80vw] h-full bg-card border-r border-border shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Header with Close */}
            <div className="flex h-16 items-center justify-between border-b border-border px-4">
              <div className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">Робочий простір</p>
                  <p className="text-[11px] text-muted-foreground">Команда Atlas</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-8 rounded-lg text-muted-foreground hover:text-foreground"
                onClick={() => setMenuOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>

            {/* Links */}
            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
              <div className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Розділи системи
              </div>
              {nav.map(({ href, label, icon: Icon }) => {
                const active = cleanPath === href || (href === '/tasks' && cleanPath === '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary text-primary-foreground shadow-xs font-semibold"
                        : "text-foreground hover:bg-muted/70"
                    )}
                  >
                    <Icon className={cn("size-5", active ? "text-primary-foreground" : "text-muted-foreground")} />
                    <span>{label}</span>
                    <ChevronRight className={cn("ml-auto size-4", active ? "opacity-90" : "opacity-30")} />
                  </Link>
                )
              })}

              <div className="my-3 border-t border-border/60" />

              <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                Користувач
              </div>
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-muted/40 border border-border/50">
                <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  ОК
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-foreground">Олена Коваль</p>
                  <p className="truncate text-[10px] text-muted-foreground">Адміністратор</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-border">
              <Button 
                variant="outline" 
                className="w-full h-10 text-xs rounded-xl gap-2"
                onClick={() => setMenuOpen(false)}
              >
                <X className="size-4" />
                <span>Закрити меню</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// -------------------------------------------------------------
// 1. TASKS PAGE (Connected to Firebase Firestore)
// -------------------------------------------------------------
function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Усі')
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [assignee, setAssignee] = useState('')
  const [deadline, setDeadline] = useState('')
  const [priority, setPriority] = useState('Середній')

  useEffect(() => {
    let unsubscribe: () => void = () => {}

    const setupTasksListener = () => {
      try {
        // First try collectionGroup 'tasks'
        const q = query(collectionGroup(db, 'tasks'))
        unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            if (!snapshot.empty) {
              const loaded = snapshot.docs.map((docSnap) => {
                const data = docSnap.data()
                return {
                  id: docSnap.id,
                  title: data.title || data.name || 'Задача без назви',
                  assignee: data.assignee || data.assignedTo || data.user || 'Не призначено',
                  deadline: data.deadline || data.dueDate || (data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('uk-UA') : 'Не вказано'),
                  status: data.status === 'done' || data.status === 'Виконано' || data.completed ? 'Виконано' : 'В роботі',
                  priority: data.priority || 'Середній',
                  ...data,
                }
              })
              setTasks(loaded)
              setLoading(false)
            } else {
              // Try root collection 'tasks'
              const rootQ = query(collection(db, 'tasks'))
              unsubscribe = onSnapshot(
                rootQ,
                (rootSnap) => {
                  const loaded = rootSnap.docs.map((docSnap) => {
                    const data = docSnap.data()
                    return {
                      id: docSnap.id,
                      title: data.title || data.name || 'Задача без назви',
                      assignee: data.assignee || data.assignedTo || data.user || 'Не призначено',
                      deadline: data.deadline || data.dueDate || (data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('uk-UA') : 'Не вказано'),
                      status: data.status === 'done' || data.status === 'Виконано' || data.completed ? 'Виконано' : 'В роботі',
                      priority: data.priority || 'Середній',
                      ...data,
                    }
                  })
                  setTasks(loaded)
                  setLoading(false)
                },
                (rootErr) => {
                  console.warn('Firestore tasks root error:', rootErr)
                  setTasks([])
                  setLoading(false)
                }
              )
            }
          },
          (err) => {
            console.warn('Firestore tasks collectionGroup error:', err)
            // Fallback to root query
            const rootQ = query(collection(db, 'tasks'))
            unsubscribe = onSnapshot(
              rootQ,
              (rootSnap) => {
                const loaded = rootSnap.docs.map((docSnap) => {
                  const data = docSnap.data()
                  return {
                    id: docSnap.id,
                    title: data.title || data.name || 'Задача без назви',
                    assignee: data.assignee || data.assignedTo || data.user || 'Не призначено',
                    deadline: data.deadline || data.dueDate || 'Не вказано',
                    status: data.status === 'done' || data.status === 'Виконано' || data.completed ? 'Виконано' : 'В роботі',
                    priority: data.priority || 'Середній',
                    ...data,
                  }
                })
                setTasks(loaded)
                setLoading(false)
              },
              () => {
                setTasks([])
                setLoading(false)
              }
            )
          }
        )
      } catch (err) {
        console.error('Failed to setup tasks listener:', err)
        setTasks([])
        setLoading(false)
      }
    }

    setupTasksListener()
    return () => unsubscribe()
  }, [])

  // Statistics
  const totalTasks = tasks.length
  const inProgressCount = tasks.filter((t) => t.status === 'В роботі').length
  const completedCount = tasks.filter((t) => t.status === 'Виконано').length

  const shown = useMemo(() => {
    return tasks.filter((task) => {
      const matchesFilter =
        filter === 'Усі' ||
        (filter === 'Виконано' ? task.status === 'Виконано' : task.status === 'В роботі')
      const matchesSearch =
        String(task.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(task.assignee || '').toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [tasks, filter, searchQuery])

  const handleToggleTaskStatus = async (task: any, newChecked: boolean) => {
    const newStatus = newChecked ? 'Виконано' : 'В роботі'
    // Optimistic UI update
    setTasks((current) =>
      current.map((item) => (item.id === task.id ? { ...item, status: newStatus } : item))
    )
    try {
      await updateDoc(doc(db, 'tasks', task.id), {
        status: newStatus,
        completed: newChecked,
        updatedAt: serverTimestamp(),
      })
    } catch (err) {
      console.warn('Could not update task in root tasks, trying local update:', err)
    }
  }

  const handleAddTask = async () => {
    if (title.trim()) {
      const newTaskData = {
        title: title.trim(),
        assignee: assignee.trim() || 'Не призначено',
        deadline: deadline.trim() || 'Сьогодні',
        status: 'В роботі',
        priority: priority || 'Середній',
        completed: false,
        createdAt: serverTimestamp(),
      }

      try {
        await addDoc(collection(db, 'tasks'), newTaskData)
      } catch (err) {
        console.error('Error adding task to Firestore:', err)
        // Local fallback if offline
        setTasks((prev) => [{ id: String(Date.now()), ...newTaskData }, ...prev])
      }

      setTitle('')
      setAssignee('')
      setDeadline('')
      setOpen(false)
    }
  }

  return (
    <Shell
      title="Задачі"
      headerAction={
        <Button onClick={() => setOpen(true)} className="gap-2 shadow-sm">
          <Plus className="size-4" />
          <span>Нова задача</span>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* KPI Stat Cards (Responsive: 3 cols on mobile, 4 on desktop) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Всього задач</p>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-2xl font-bold tracking-tight text-foreground">{totalTasks}</p>
                <span className="text-xs text-muted-foreground">з бази Firebase</span>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">В роботі</p>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-2xl font-bold tracking-tight text-foreground">{inProgressCount}</p>
                <span className="text-xs text-amber-600 dark:text-amber-400">активні</span>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Виконано</p>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-2xl font-bold tracking-tight text-foreground">{completedCount}</p>
                <span className="text-xs text-emerald-600 dark:text-emerald-400">
                  {Math.round((completedCount / (totalTasks || 1)) * 100)}%
                </span>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-border shadow-sm col-span-2 md:col-span-1">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Статус бази</p>
              <div className="mt-1 flex items-baseline justify-between">
                <p className="text-base font-bold tracking-tight text-emerald-600 dark:text-emerald-400 truncate">Синхронізовано</p>
                <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search & Tabs Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Пошук задач чи виконавця..."
              className="pl-9 h-10 rounded-lg bg-card"
            />
          </div>

          <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
            <TabsList className="grid w-full grid-cols-3 sm:w-auto">
              <TabsTrigger value="Усі">Усі ({totalTasks})</TabsTrigger>
              <TabsTrigger value="В роботі">В роботі ({inProgressCount})</TabsTrigger>
              <TabsTrigger value="Виконано">Виконано ({completedCount})</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Tasks List / Grid (Responsive: 1 col on mobile, 2 cols on PC) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-primary" />
            <p className="text-xs text-muted-foreground">Завантаження задач з Firebase...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {shown.map((task) => (
              <Card
                key={task.id}
                className="group rounded-xl border border-border transition-all duration-150 hover:border-primary/40 hover:shadow-sm"
              >
                <CardContent className="flex items-start gap-3.5 p-4">
                  <Checkbox
                    checked={task.status === 'Виконано'}
                    onCheckedChange={(checked) => handleToggleTaskStatus(task, Boolean(checked))}
                    className="mt-0.5 cursor-pointer"
                    aria-label={`Позначити: ${task.title}`}
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-sm font-semibold transition-all ${
                        task.status === 'Виконано' ? 'line-through text-muted-foreground' : 'text-foreground'
                      }`}
                    >
                      {task.title}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1 font-medium text-foreground">
                        <span className="size-4.5 rounded-full bg-muted flex items-center justify-center text-[10px] font-bold">
                          {String(task.assignee || 'К')
                            .split(' ')
                            .map((n: string) => n[0])
                            .join('')}
                        </span>
                        {task.assignee}
                      </span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        до {task.deadline}
                      </span>
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </CardContent>
              </Card>
            ))}
            {shown.length === 0 && (
              <div className="col-span-full py-12 text-center text-sm text-muted-foreground">
                Задач у базі даних не знайдено. Натисніть «Нова задача», щоб додати першу.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Mobile Floating Action Button (Phones only) */}
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-24 right-5 z-10 size-14 rounded-full shadow-lg sm:hidden"
        aria-label="Додати задачу"
      >
        <Plus className="size-6" />
      </Button>

      {/* Task Creation Modal / Drawer */}
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent className="max-w-lg mx-auto">
          <DrawerHeader>
            <DrawerTitle>Нова задача</DrawerTitle>
            <DrawerDescription>Додайте нову задачу безпосередньо у базу Firebase</DrawerDescription>
          </DrawerHeader>
          <div className="flex flex-col gap-4 px-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-title">Назва задачі</Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Наприклад: Підготувати звіт за місяць"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-assignee">Виконавець</Label>
              <Input
                id="task-assignee"
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Імʼя співробітника"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="task-deadline">Дедлайн</Label>
              <Input
                id="task-deadline"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                placeholder="Наприклад: 15 жовтня"
              />
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={handleAddTask}>Зберегти у базу</Button>
            <DrawerClose asChild>
              <Button variant="outline">Скасувати</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Shell>
  )
}

// -------------------------------------------------------------
// 2. PLANS PAGE (Responsive Mobile + PC)
// -------------------------------------------------------------
function PlansPage() {
  const [day, setDay] = useState('Пн')
  const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд']

  const events: Record<string, [string, string, string, string][]> = {
    Пн: [
      ['09:30', 'Планерка команди', 'Переговорна 1', 'Зустріч'],
      ['11:00', 'Дзвінок з клієнтом Atlas', 'Google Meet', 'Онлайн'],
      ['15:30', 'Ревʼю макетів нового релізу', 'Онлайн', 'Дизайн'],
    ],
    Вт: [
      ['10:00', 'Статус проєкту веб-платформи', 'Переговорна 2', 'Зустріч'],
      ['14:00', 'Фокус-час: архітектура бази', 'Коворкінг', 'Розробка'],
    ],
    Ср: [
      ['09:00', 'Синхронізація лідів напрямків', 'Переговорна 1', 'Зустріч'],
      ['13:00', 'Демо продукту замовнику', 'Шоурум', 'Демо'],
    ],
    Чт: [['11:30', 'Дзвінок з партнером', 'Google Meet', 'Онлайн']],
    Пт: [['16:00', 'Підсумки тижня та ретроспектива', 'Переговорна 1', 'Зустріч']],
    Сб: [],
    Нд: [],
  }

  const goals = [
    { title: 'Завершити редизайн веб-додатку', progress: 72, target: '15 жовтня' },
    { title: 'Збільшити продажі за місяць на 15%', progress: 58, target: '31 жовтня' },
    { title: 'Провести навчання для нових менеджерів', progress: 35, target: '20 жовтня' },
    { title: 'Оптимізувати внутрішні процеси виплат', progress: 84, target: '10 жовтня' },
  ]

  return (
    <Shell title="Плани">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Left Column: Weekly Schedule (8 cols on desktop) */}
        <section className="lg:col-span-8 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <SectionTitle title="Розклад на тиждень" />
            <span className="text-xs text-muted-foreground">Жовтень 2026</span>
          </div>

          {/* Weekday Switcher */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((item) => {
              const active = day === item
              const count = events[item]?.length || 0
              return (
                <button
                  key={item}
                  onClick={() => setDay(item)}
                  className={`flex min-w-14 flex-col items-center justify-center rounded-xl border p-2.5 transition-all ${
                    active
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="text-xs font-semibold">{item}</span>
                  <span className={`text-[10px] mt-0.5 ${active ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                    {count} {count === 1 ? 'подія' : 'подій'}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Events Timeline List */}
          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-0 divide-y divide-border">
              {events[day].length ? (
                events[day].map(([time, title, place, tag]) => (
                  <div key={title} className="flex items-start gap-4 p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-1.5 min-w-16 pt-0.5">
                      <Clock className="size-3.5 text-muted-foreground" />
                      <span className="text-xs font-bold text-foreground">{time}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-foreground">{title}</p>
                      <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
                        <span>{place}</span>
                      </p>
                    </div>
                    <Badge variant="outline" className="text-[11px] shrink-0">
                      {tag}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  На цей день подій не заплановано
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Right Column: Strategic Monthly Goals (4 cols on desktop) */}
        <section className="lg:col-span-4 flex flex-col gap-5">
          <SectionTitle title="Цілі команди на місяць" />

          <div className="flex flex-col gap-3.5">
            {goals.map((g) => (
              <Card key={g.title} className="rounded-xl border border-border shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <p className="text-xs font-semibold text-foreground leading-tight">{g.title}</p>
                    <span className="text-xs font-bold text-foreground">{g.progress}%</span>
                  </div>
                  <Progress value={g.progress} className="h-2" />
                  <div className="mt-2.5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>Дедлайн цілі</span>
                    <span className="font-medium text-foreground">{g.target}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </Shell>
  )
}

// -------------------------------------------------------------
// 3. FINANCE PAGE (Responsive Mobile + PC)
// -------------------------------------------------------------
function FinancePage() {
  const [period, setPeriod] = useState('Місяць')

  const transactions = [
    { date: '30 вер', title: 'Ліцензія на сервіси Google Workspace', category: 'Підписки', amount: '− 8 400 ₴', isIncome: false },
    { date: '28 вер', title: 'Оплата етапу проєкту «Atlas Core»', category: 'Продажі', amount: '+ 42 000 ₴', isIncome: true },
    { date: '25 вер', title: 'Оренда офісного простору', category: 'Операційні', amount: '− 18 000 ₴', isIncome: false },
    { date: '21 вер', title: 'Консультаційні послуги по UI/UX', category: 'Продажі', amount: '+ 31 500 ₴', isIncome: true },
    { date: '18 вер', title: 'Придбання техніки для співробітників', category: 'Обладнання', amount: '− 24 500 ₴', isIncome: false },
  ]

  return (
    <Shell
      title="Фінансова звітність"
      headerAction={
        <Button variant="outline" size="sm" className="gap-2 shadow-sm">
          <Download className="size-4" />
          <span>Експорт звіту (Excel)</span>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* KPI Financial Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Доходи</span>
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <ArrowUpRight className="size-3" /> +12.8%
                </span>
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">132 000 ₴</p>
              <p className="mt-1 text-[11px] text-muted-foreground">за поточний місяць</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Витрати</span>
                <span className="flex items-center text-amber-600 dark:text-amber-400 font-semibold text-[11px]">
                  <ArrowDownRight className="size-3" /> +6.4%
                </span>
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">76 000 ₴</p>
              <p className="mt-1 text-[11px] text-muted-foreground">операційні витрати</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Чистий прибуток</span>
                <span className="flex items-center text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                  <ArrowUpRight className="size-3" /> +22.5%
                </span>
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
                56 000 ₴
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">рентабельність 42.4%</p>
            </CardContent>
          </Card>

          <Card className="rounded-xl border border-border shadow-sm col-span-2 lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Залишок на рахунках</span>
                <span className="size-2 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">428 500 ₴</p>
              <p className="mt-1 text-[11px] text-muted-foreground">доступно на IBAN</p>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Section: 2 Columns on Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Chart (7 cols on desktop) */}
          <Card className="lg:col-span-7 rounded-xl border border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Доходи та витрати</CardTitle>
                <CardDescription className="text-xs">Динаміка за останні 6 місяців</CardDescription>
              </div>
              <Tabs value={period} onValueChange={setPeriod}>
                <TabsList className="h-8">
                  <TabsTrigger value="Місяць" className="text-xs px-2.5">Місяць</TabsTrigger>
                  <TabsTrigger value="Квартал" className="text-xs px-2.5">Квартал</TabsTrigger>
                  <TabsTrigger value="Рік" className="text-xs px-2.5">Рік</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent className="pt-2 pb-5">
              <div className="h-64 sm:h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} barGap={6}>
                    <CartesianGrid vertical={false} stroke="#e5e5e5" strokeDasharray="3 3" />
                    <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
                    <Bar dataKey="доходи" fill="#111111" radius={[4, 4, 0, 0]} name="Доходи (тис. ₴)" />
                    <Bar dataKey="витрати" fill="#a3a3a3" radius={[4, 4, 0, 0]} name="Витрати (тис. ₴)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 flex justify-center gap-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <i className="inline-block size-2.5 rounded-full bg-foreground" />
                  <span>Доходи</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <i className="inline-block size-2.5 rounded-full bg-muted-foreground" />
                  <span>Витрати</span>
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Transactions List (5 cols on desktop) */}
          <Card className="lg:col-span-5 rounded-xl border border-border shadow-sm flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-bold">Останні операції</CardTitle>
                <CardDescription className="text-xs">Журнал транзакцій</CardDescription>
              </div>
              <Button variant="ghost" size="sm" className="text-xs h-8">
                Всі операції
              </Button>
            </CardHeader>
            <CardContent className="flex-1 p-0 divide-y divide-border">
              {transactions.map((tx) => (
                <div key={tx.title} className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors">
                  <div className="min-w-0 flex-1 pr-3">
                    <p className="truncate text-xs font-semibold text-foreground">{tx.title}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">
                      {tx.date} · <span className="font-medium">{tx.category}</span>
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs font-bold ${
                      tx.isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-foreground'
                    }`}
                  >
                    {tx.amount}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </Shell>
  )
}

// -------------------------------------------------------------
// 4. PAYMENTS PAGE (Responsive Master-Detail on PC)
// -------------------------------------------------------------
function PaymentsPage() {
  const [payments, setPayments] = useState(initialPayments)
  const [filter, setFilter] = useState('Усі')
  const [searchQuery, setSearchQuery] = useState('')
  const [selected, setSelected] = useState<(typeof initialPayments)[number] | null>(initialPayments[0])
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false)

  const totalFund = 334000
  const paidCount = payments.filter((p) => p.status === 'Виплачено').length
  const pendingCount = payments.filter((p) => p.status === 'Очікує').length

  const shown = useMemo(() => {
    return payments.filter((p) => {
      const matchesFilter = filter === 'Усі' || p.status === filter
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.role.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [payments, filter, searchQuery])

  const toggleStatus = (id: number) => {
    setPayments((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, status: item.status === 'Виплачено' ? 'Очікує' : 'Виплачено' }
          : item
      )
    )
    if (selected?.id === id) {
      setSelected((prev) =>
        prev
          ? { ...prev, status: prev.status === 'Виплачено' ? 'Очікує' : 'Виплачено' }
          : null
      )
    }
  }

  const handleSelectPayment = (payment: (typeof initialPayments)[number]) => {
    setSelected(payment)
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setMobileDrawerOpen(true)
    }
  }

  return (
    <Shell
      title="Виплати"
      headerAction={
        <Button size="sm" className="gap-2 shadow-sm">
          <Plus className="size-4" />
          <span>Нова виплата</span>
        </Button>
      }
    >
      <div className="flex flex-col gap-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Фонд виплат (місяць)</p>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">334 000 ₴</p>
              <p className="mt-1 text-[11px] text-muted-foreground">8 співробітників</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Виплачено</p>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">217 000 ₴</p>
              <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400">{paidCount} виплат проведено</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-border shadow-sm">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-amber-600 dark:text-amber-400">Очікує підтвердження</p>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">117 000 ₴</p>
              <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">{pendingCount} очікують</p>
            </CardContent>
          </Card>
          <Card className="rounded-xl border border-border shadow-sm col-span-2 lg:col-span-1">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground">Середня ставка</p>
              <p className="mt-1.5 text-2xl font-bold tracking-tight text-foreground">41 750 ₴</p>
              <p className="mt-1 text-[11px] text-muted-foreground">за посаду</p>
            </CardContent>
          </Card>
        </div>

        {/* Master-Detail Layout on PC: 7 cols list, 5 cols detail */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Payments List */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Пошук співробітника чи посади..."
                  className="pl-9 h-10 rounded-lg bg-card"
                />
              </div>

              <Tabs value={filter} onValueChange={setFilter}>
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="Усі">Усі</TabsTrigger>
                  <TabsTrigger value="Очікує">Очікують</TabsTrigger>
                  <TabsTrigger value="Виплачено">Виплачено</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            <div className="flex flex-col gap-2.5">
              {shown.map((payment) => {
                const isSelected = selected?.id === payment.id
                return (
                  <button
                    key={payment.id}
                    onClick={() => handleSelectPayment(payment)}
                    className={`flex items-center gap-3.5 rounded-xl border p-4 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border bg-card hover:border-border/80 hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold text-xs text-foreground">
                      {payment.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">{payment.name}</p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {payment.role} · {payment.date}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <span className="text-sm font-bold text-foreground">{payment.amount} ₴</span>
                      <StatusBadge status={payment.status} />
                    </div>
                    <ChevronRight className={`size-4 transition-transform ${isSelected ? 'text-primary' : 'text-muted-foreground'}`} />
                  </button>
                )
              })}
            </div>
          </div>

          {/* Right Column: Selected Payment Inspector (Desktop view) */}
          <div className="hidden lg:block lg:col-span-5">
            {selected ? (
              <Card className="sticky top-20 rounded-xl border border-border shadow-sm">
                <CardHeader className="border-b border-border pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Картка виплати
                    </span>
                    <StatusBadge status={selected.status} />
                  </div>
                  <CardTitle className="text-lg font-bold text-foreground mt-2">{selected.name}</CardTitle>
                  <CardDescription className="text-xs">{selected.role}</CardDescription>
                </CardHeader>
                <CardContent className="p-5 flex flex-col gap-4 text-sm">
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Сума до виплати</span>
                    <strong className="text-base text-foreground font-bold">{selected.amount} ₴</strong>
                  </div>
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Розрахунковий період</span>
                    <span className="text-foreground font-medium">01–31 жовтня 2026</span>
                  </div>
                  <div className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted-foreground">Метод виплати</span>
                    <span className="text-foreground font-medium">Безготівковий розрахунок</span>
                  </div>
                  <div className="flex flex-col gap-1 border-b border-border pb-3">
                    <span className="text-xs text-muted-foreground">Реквізити IBAN</span>
                    <span className="font-mono text-xs text-foreground bg-muted p-2 rounded">
                      {selected.iban}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Коментар</span>
                    <span className="text-foreground font-medium">Щомісячна виплата винагороди</span>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 pt-2">
                    <Button
                      onClick={() => toggleStatus(selected.id)}
                      variant={selected.status === 'Виплачено' ? 'outline' : 'default'}
                      className="w-full"
                    >
                      {selected.status === 'Виплачено' ? 'Позначити як «Очікує»' : 'Позначити як «Виплачено»'}
                    </Button>
                    <Button variant="ghost" size="sm" className="gap-2 text-xs">
                      <FileText className="size-3.5" />
                      <span>Завантажити платіжне доручення (PDF)</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-xl border border-dashed border-border p-12 text-center text-sm text-muted-foreground">
                Оберіть співробітника зі списку для перегляду деталей виплати
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Payment Drawer (Phones only) */}
      <Drawer open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{selected?.name}</DrawerTitle>
            <DrawerDescription>{selected?.role}</DrawerDescription>
          </DrawerHeader>
          {selected && (
            <div className="flex flex-col gap-4 px-4 text-sm">
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Сума</span>
                <strong className="text-foreground">{selected.amount} ₴</strong>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Період</span>
                <span>01–31 жовтня 2026</span>
              </div>
              <div className="flex justify-between border-b border-border pb-3">
                <span className="text-muted-foreground">Метод</span>
                <span>Безготівковий розрахунок</span>
              </div>
              <div className="flex flex-col gap-1 border-b border-border pb-3">
                <span className="text-xs text-muted-foreground">IBAN</span>
                <span className="font-mono text-xs bg-muted p-2 rounded">{selected.iban}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Статус</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          )}
          <DrawerFooter>
            {selected && (
              <Button onClick={() => toggleStatus(selected.id)} className="w-full">
                {selected.status === 'Виплачено' ? 'Позначити як «Очікує»' : 'Позначити як «Виплачено»'}
              </Button>
            )}
            <DrawerClose asChild>
              <Button variant="outline">Закрити</Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Shell>
  )
}

// Sound synthesizer helper using Web Audio API
function playStartupSound() {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioCtx) return
    const ctx = new AudioCtx()
    if (ctx.state === 'suspended') {
      ctx.resume()
    }

    const now = ctx.currentTime

    // 1. Crystal chord notes: F4, A4, C5, F5
    const freqs = [349.23, 440.0, 523.25, 698.46]
    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.08)

      gain.gain.setValueAtTime(0, now + idx * 0.08)
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.08 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.9)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.08)
      osc.stop(now + idx * 0.08 + 0.95)
    })
  } catch (err) {
    console.log('Audio autoplay prevented or unsupported:', err)
  }
}

// Main Page Switcher
export default function CompanyApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [authChecking, setAuthChecking] = useState(true)
  const [showSplash, setShowSplash] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is already logged in
    const savedLogin = localStorage.getItem('isLoggedIn')
    if (savedLogin === 'true') {
      setIsLoggedIn(true)
    }
    setAuthChecking(false)

    // Play welcome sound and hide splash screen after animation
    playStartupSound()
    const timer = setTimeout(() => {
      setShowSplash(false)
    }, 1800)

    if (Capacitor.isNativePlatform()) {
      PushNotifications.requestPermissions().then(result => {
        if (result.receive === 'granted') {
          PushNotifications.register();
        }
      });

      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success, token: ' + token.value);
      });

      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        alert('Пуш-сповіщення: ' + notification.title + '\n' + notification.body);
      });
    }

    return () => clearTimeout(timer)
  }, []);

  if (showSplash) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background text-foreground select-none overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute size-80 rounded-full bg-primary/15 blur-3xl animate-pulse" />

        {/* Animated Brand Emblem */}
        <div className="relative z-10 flex flex-col items-center gap-5 animate-splash-logo">
          <div className="relative flex size-20 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl animate-splash-glow">
            <Building2 className="size-10" />
            <Sparkles className="absolute -top-2 -right-2 size-6 text-amber-400 animate-bounce" />
          </div>

          <div className="text-center space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Робочий простір
            </h1>
            <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
              Atlas Команда & CRM
            </p>
          </div>

          {/* Glowing loading bar */}
          <div className="w-36 h-1 rounded-full bg-muted overflow-hidden mt-3">
            <div className="h-full bg-primary rounded-full animate-pulse w-full duration-1000" />
          </div>
        </div>
      </div>
    )
  }

  if (authChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4 animate-in fade-in duration-500">
        <Card className="w-full max-w-sm rounded-2xl shadow-lg border-border">
          <CardHeader className="text-center space-y-2 pb-6">
            <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm mb-2">
              <Building2 className="size-6" />
            </div>
            <CardTitle className="text-2xl font-bold">Вхід у систему</CardTitle>
            <CardDescription>Введіть логін та пароль для доступу</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault()
              if (username === 'admin' && password === 'admin') {
                setIsLoggedIn(true)
                localStorage.setItem('isLoggedIn', 'true')
                setError('')
              } else {
                setError('Невірний логін або пароль')
              }
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Логін</Label>
                <Input 
                  id="username" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)} 
                  placeholder="admin" 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input 
                  id="password" 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                  required
                />
              </div>
              {error && <p className="text-sm font-medium text-red-500 dark:text-red-400 text-center">{error}</p>}
              <Button type="submit" className="w-full h-11 text-base font-semibold mt-2">Увійти</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  const cleanPath = (pathname || '/').replace(/\/$/, '') || '/'

  if (cleanPath === '/plans') return <PlansPage />
  if (cleanPath === '/finance') return <FinancePage />
  if (cleanPath === '/payments') return <PaymentsPage />
  if (cleanPath === '/chats') return <ChatsPage />
  if (cleanPath === '/orders') return <OrdersPage />
  return <TasksPage />
}
