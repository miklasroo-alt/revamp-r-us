"use client"

import type React from "react"

import { usePathname, useRouter } from "next/navigation"
import { Home, BarChart3, Database, History, Shuffle, ShoppingCart, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useEffect, useState } from "react"

const navigation = [
  { name: "Current Hunt", href: "/admin", icon: Home },
  { name: "Statistics", href: "/admin/statistics", icon: BarChart3 },
  { name: "Slots Database", href: "/admin/slots", icon: Database },
  { name: "Previous Hunts", href: "/admin/previous-hunts", icon: History },
  { name: "Random Slot", href: "/admin/random-slot", icon: Shuffle },
  { name: "Store", href: "/admin/store", icon: ShoppingCart },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push("/auth/login")
      } else {
        setUser(user)
      }
    }
    checkUser()
  }, [router, supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/")
  }

  if (!user) {
    return null
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Sidebar */}
      <aside className="w-60 bg-slate-900/95 border-r border-slate-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-bold text-lg">BonusHunt</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon
            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? "bg-cyan-500/90 text-white shadow-lg shadow-cyan-500/20"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-3 border-t border-slate-800 space-y-1">
          <Button
            onClick={() => router.push("/")}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <Home className="w-5 h-5 mr-3" />
            Back to Home
          </Button>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800/50"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  )
}
