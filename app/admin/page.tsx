"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Home, LogOut, Plus, BarChart3, Edit, ShuffleIcon, ShoppingCart } from "lucide-react"

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  async function checkUser() {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      router.push("/auth/login")
    } else {
      setUser(user)
    }
    setLoading(false)
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const adminPages = [
    {
      title: "Current Bonushunt",
      description: "Manage your current bonus hunt session",
      icon: Plus,
      href: "/admin/current-hunt",
      color: "from-blue-900/20 to-cyan-900/20 border-blue-700/30",
    },
    {
      title: "Statistics Settings",
      description: "Configure balance and transaction settings",
      icon: BarChart3,
      href: "/admin/statistics",
      color: "from-green-900/20 to-emerald-900/20 border-green-700/30",
    },
    {
      title: "Edit Slots Database",
      description: "Add and manage slot games in the database",
      icon: Edit,
      href: "/admin/slots",
      color: "from-purple-900/20 to-pink-900/20 border-purple-700/30",
    },
    {
      title: "Previous Hunts",
      description: "View and manage your past bonus hunt sessions",
      icon: BarChart3,
      href: "/admin/previous-hunts",
      color: "from-amber-900/20 to-orange-900/20 border-amber-700/30",
    },
    {
      title: "Random Slot",
      description: "Generate random slot selections",
      icon: ShuffleIcon,
      href: "/admin/random-slot",
      color: "from-rose-900/20 to-red-900/20 border-rose-700/30",
    },
    {
      title: "Store Management",
      description: "Manage store items, redemptions, and user points",
      icon: ShoppingCart,
      href: "/admin/store",
      color: "from-indigo-900/20 to-violet-900/20 border-indigo-700/30",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-slate-400 text-sm">Manage your bonus hunts and settings</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => router.push("/")}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent h-8"
            >
              <Home className="w-3 h-3" />
              <span className="text-xs">Home</span>
            </Button>
            <Button
              onClick={handleSignOut}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent h-8"
            >
              <LogOut className="w-3 h-3" />
              <span className="text-xs">Sign Out</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adminPages.map((page) => {
            const Icon = page.icon
            return (
              <Card
                key={page.href}
                className={`bg-gradient-to-br ${page.color} backdrop-blur border cursor-pointer hover:scale-105 transition-transform`}
                onClick={() => router.push(page.href)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-slate-800/50 rounded-lg">
                      <Icon className="w-6 h-6 text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg mb-1">{page.title}</h3>
                      <p className="text-slate-400 text-sm">{page.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
