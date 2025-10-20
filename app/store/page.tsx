"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Sparkles, ShoppingCart, Coins, Gift, Star, Crown, Zap } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { PageTransition } from "@/components/page-transition"

type User = {
  id: string
  kick_id: string
  username: string
  points_balance: number
}

type Reward = {
  id: string
  name: string
  description: string
  cost: number
  type: string
  quantity: number | null
  icon: string
}

export default function StorePage() {
  const [user, setUser] = useState<User | null>(null)
  const [rewards, setRewards] = useState<Reward[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchUserAndRewards()
  }, [])

  async function fetchUserAndRewards() {
    const { data: userData, error: userError } = await supabase.from("users").select("*").limit(1).single()

    if (userError) {
      console.log("[v0] No user found, using guest mode")
      // Use guest user if no user found
      const guestUser: User = {
        id: "guest",
        kick_id: "guest",
        username: "Guest",
        points_balance: 0,
      }
      setUser(guestUser)
    } else {
      setUser(userData)
    }

    const { data: rewardsData, error: rewardsError } = await supabase
      .from("store_items")
      .select("*")
      .order("created_at", { ascending: false })

    if (rewardsError) {
      console.error("[v0] Error fetching rewards:", rewardsError)
      setRewards([])
    } else {
      setRewards(rewardsData || [])
    }

    setLoading(false)
  }

  async function handleRedeem(reward: Reward) {
    if (!user) {
      toast({
        title: "Error",
        description: "Please log in to redeem rewards",
        variant: "destructive",
      })
      return
    }

    if (user.points_balance < reward.cost) {
      toast({
        title: "Insufficient Points",
        description: `You need ${reward.cost - user.points_balance} more points to redeem this reward`,
        variant: "destructive",
      })
      return
    }

    if (reward.quantity !== null && reward.quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: "This reward is currently out of stock",
        variant: "destructive",
      })
      return
    }

    const newBalance = user.points_balance - reward.cost

    const { error: updateError } = await supabase.from("users").update({ points_balance: newBalance }).eq("id", user.id)

    if (updateError) {
      toast({
        title: "Error",
        description: "Failed to process redemption",
        variant: "destructive",
      })
      return
    }

    const { error: redemptionError } = await supabase.from("redemptions").insert({
      user_id: user.id,
      item_id: reward.id,
      item_name: reward.name,
      cost: reward.cost,
      status: "pending",
    })

    if (redemptionError) {
      console.error("[v0] Error creating redemption:", redemptionError)
    }

    // Update quantity if applicable
    if (reward.quantity !== null) {
      await supabase
        .from("store_items")
        .update({ quantity: reward.quantity - 1 })
        .eq("id", reward.id)
    }

    setUser({ ...user, points_balance: newBalance })

    toast({
      title: "Success!",
      description: `You've redeemed ${reward.name}!`,
      className: "bg-green-600 text-white",
    })

    // Refresh rewards to update quantities
    fetchUserAndRewards()
  }

  function getRewardIcon(iconName: string) {
    switch (iconName) {
      case "sparkles":
        return <Sparkles className="w-5 h-5" />
      case "crown":
        return <Crown className="w-5 h-5" />
      case "star":
        return <Star className="w-5 h-5" />
      case "zap":
        return <Zap className="w-5 h-5" />
      case "gift":
        return <Gift className="w-5 h-5" />
      case "coins":
        return <Coins className="w-5 h-5" />
      default:
        return <ShoppingCart className="w-5 h-5" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-xs"
              >
                <ArrowLeft className="w-3 h-3" />
                Back
              </Link>
              <div>
                <h1 className="text-xl font-bold text-white">Rewards Store</h1>
                <p className="text-slate-400 text-xs">Redeem your points for exclusive rewards</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-amber-900/20 to-purple-900/20 backdrop-blur border border-amber-700/30 rounded-lg p-3 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-amber-500/20 rounded-full p-2">
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-400/70 text-[10px] uppercase tracking-wider">Your Balance</p>
                  <p className="text-amber-300 text-2xl font-bold">{user?.points_balance || 0}</p>
                  <p className="text-amber-400/50 text-[9px]">points available</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-purple-400/70 text-[10px] uppercase tracking-wider mb-1">Earn More Points</p>
                <div className="space-y-0.5">
                  <p className="text-purple-300 text-[9px]">• Watch streams: 10 pts/10min</p>
                  <p className="text-purple-300 text-[9px]">• Chat messages: 5 pts/message</p>
                  <p className="text-purple-300 text-[9px]">• Participate in events: Bonus pts</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {rewards.map((reward) => {
              const canAfford = user && user.points_balance >= reward.cost
              const isOutOfStock = reward.quantity !== null && reward.quantity <= 0

              return (
                <Card key={reward.id} className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between mb-2">
                      <div className="bg-slate-800/50 rounded-lg p-2">
                        <div className="text-cyan-400">{getRewardIcon(reward.icon)}</div>
                      </div>
                      <div className="text-right">
                        <p className="text-amber-400 text-sm font-bold">{reward.cost}</p>
                        <p className="text-amber-400/50 text-[9px]">points</p>
                      </div>
                    </div>

                    <h3 className="text-white text-sm font-semibold mb-1">{reward.name}</h3>
                    <p className="text-slate-400 text-[10px] mb-2 line-clamp-2">{reward.description}</p>

                    {reward.quantity !== null && (
                      <p className="text-slate-500 text-[9px] mb-2">
                        {reward.quantity > 0 ? `${reward.quantity} available` : "Out of stock"}
                      </p>
                    )}

                    <Button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford || isOutOfStock}
                      className={`w-full h-8 text-xs ${
                        canAfford && !isOutOfStock
                          ? "bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                          : "bg-slate-700 cursor-not-allowed"
                      }`}
                    >
                      {isOutOfStock ? (
                        "Out of Stock"
                      ) : canAfford ? (
                        <>
                          <ShoppingCart className="w-3 h-3 mr-1.5" />
                          Redeem
                        </>
                      ) : (
                        `Need ${reward.cost - (user?.points_balance || 0)} more`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur mt-4">
            <CardContent className="p-3">
              <h2 className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                <div className="w-1 h-4 bg-cyan-500 rounded"></div>
                How It Works
              </h2>
              <div className="space-y-1.5 text-slate-400 text-[10px]">
                <p>
                  <strong className="text-white">1. Earn Points:</strong> Watch streams, participate in chat, and join
                  events to earn points
                </p>
                <p>
                  <strong className="text-white">2. Browse Rewards:</strong> Check out available rewards and their point
                  costs
                </p>
                <p>
                  <strong className="text-white">3. Redeem:</strong> Click "Redeem" on any reward you can afford
                </p>
                <p>
                  <strong className="text-white">4. Enjoy:</strong> Your reward will be processed and delivered during
                  the next stream
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageTransition>
  )
}
