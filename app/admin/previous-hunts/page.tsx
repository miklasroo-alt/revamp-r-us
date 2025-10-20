"use client"

import { createClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { ArrowLeft, ChevronDown, ChevronUp, BarChart3, Target, DollarSign, TrendingUp, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { PageTransition } from "@/components/page-transition"

type PastBonusHunt = {
  id: string
  hunt_id: string
  hunt_name: string
  starting_balance: number
  opening_balance: number
  total_bonuses: number
  total_bet_size: number
  total_result: number
  profit_loss: number
  bonuses: string
  created_at: string
  status?: string
}

type BonusDetail = {
  id: string
  game_name: string
  provider: string | null
  bet_size: number
  result: number | null
  starting_balance: number | null
  opening_balance: number | null
  created_at: string
}

export default function PreviousHuntsPage() {
  const [hunts, setHunts] = useState<PastBonusHunt[]>([])
  const [expandedHunts, setExpandedHunts] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createClient()

  useEffect(() => {
    fetchPastHunts()
  }, [])

  async function fetchPastHunts() {
    const { data: pastHunts, error } = await supabase
      .from("past_bonushunts")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching past hunts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch past hunts",
        variant: "destructive",
      })
    } else {
      setHunts((pastHunts || []) as PastBonusHunt[])
    }
    setLoading(false)
  }

  function toggleHunt(huntId: string) {
    const newExpanded = new Set(expandedHunts)
    if (newExpanded.has(huntId)) {
      newExpanded.delete(huntId)
    } else {
      newExpanded.add(huntId)
    }
    setExpandedHunts(newExpanded)
  }

  async function handleDeleteHunt(huntId: string) {
    const { error } = await supabase.from("past_bonushunts").delete().eq("id", huntId)

    if (error) {
      toast({
        title: "Error",
        description: "Failed to delete hunt",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Hunt deleted successfully",
        className: "bg-green-600 text-white",
      })
      await fetchPastHunts()
    }
  }

  function getStatusBadgeColor(status?: string) {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-blue-600"
      case "completed":
        return "bg-green-600"
      case "archived":
        return "bg-slate-600"
      default:
        return "bg-green-600"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  const totalHunts = hunts.length
  const profitableHunts = hunts.filter((h) => h.profit_loss > 0).length
  const winRate = totalHunts > 0 ? (profitableHunts / totalHunts) * 100 : 0
  const averageProfit = totalHunts > 0 ? hunts.reduce((sum, h) => sum + h.profit_loss, 0) / totalHunts : 0
  const biggestWin = hunts.length > 0 ? Math.max(...hunts.map((h) => h.profit_loss)) : 0

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
                <h1 className="text-xl font-bold text-white">Previous Bonus Hunts</h1>
                <p className="text-slate-400 text-xs">View your past bonus hunt sessions</p>
              </div>
            </div>
            <Link
              href="/store"
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors text-xs"
            >
              <Sparkles className="w-3 h-3" />
              Store
            </Link>
          </div>

          <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="flex items-center gap-2">
                <div className="bg-slate-700/50 rounded p-1.5">
                  <BarChart3 className="w-4 h-4 text-slate-300" />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider">Total Hunts</p>
                  <p className="text-white text-base font-bold">{totalHunts}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-green-900/50 rounded p-1.5">
                  <Target className="w-4 h-4 text-green-400" />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider">Win Rate</p>
                  <p className="text-green-400 text-base font-bold">{winRate.toFixed(1)}%</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-red-900/50 rounded p-1.5">
                  <DollarSign className="w-4 h-4 text-red-400" />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider">Avg Profit</p>
                  <p className={`text-base font-bold ${averageProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                    ${Math.abs(averageProfit).toFixed(0)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-cyan-900/50 rounded p-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-slate-500 text-[10px] uppercase tracking-wider">Biggest Win</p>
                  <p className="text-cyan-400 text-base font-bold">${biggestWin.toFixed(0)}</p>
                </div>
              </div>
            </div>
          </div>

          {hunts.length === 0 ? (
            <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
              <CardContent className="p-6">
                <p className="text-slate-400 text-center text-xs">
                  No previous hunts saved yet. Complete and save a bonus hunt to see it here!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {hunts.map((hunt) => {
                let bonusDetails: BonusDetail[] = []
                try {
                  bonusDetails = JSON.parse(hunt.bonuses)
                } catch (e) {
                  console.error("[v0] Error parsing bonuses:", e)
                }

                const isExpanded = expandedHunts.has(hunt.id)
                const huntDate = new Date(hunt.created_at)
                const averageBetSize = hunt.total_bonuses > 0 ? hunt.total_bet_size / hunt.total_bonuses : 0

                return (
                  <Card key={hunt.id} className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                    <CardContent className="p-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-0.5">
                            <h3 className="text-white text-sm font-semibold">{hunt.hunt_name}</h3>
                            <span
                              className={`px-1.5 py-0.5 ${getStatusBadgeColor(hunt.status)} text-white text-[9px] rounded-full capitalize`}
                            >
                              {hunt.status || "Completed"}
                            </span>
                          </div>
                          <p className="text-slate-400 text-[10px]">
                            {huntDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}{" "}
                            -{" "}
                            {huntDate.toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <div className="text-center px-2.5 py-1 bg-slate-950/50 rounded">
                            <p className="text-slate-500 text-[9px] mb-0.5">Starting</p>
                            <p className="text-white font-semibold text-xs">${hunt.starting_balance.toFixed(0)}</p>
                          </div>

                          <div className="text-center px-2.5 py-1 bg-slate-950/50 rounded">
                            <p className="text-slate-500 text-[9px] mb-0.5">Ending</p>
                            <p className="text-white font-semibold text-xs">${hunt.total_result.toFixed(0)}</p>
                          </div>

                          <div className="text-center px-2.5 py-1 bg-slate-950/50 rounded">
                            <p className="text-slate-500 text-[9px] mb-0.5">Profit</p>
                            <p
                              className={`font-semibold text-xs ${hunt.profit_loss >= 0 ? "text-green-400" : "text-red-400"}`}
                            >
                              {hunt.profit_loss >= 0 ? "+" : ""}${Math.abs(hunt.profit_loss).toFixed(0)}
                            </p>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleHunt(hunt.id)}
                            className="text-slate-400 hover:text-white h-7 w-7 p-0"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </Button>
                        </div>
                      </div>

                      <div
                        className={`overflow-hidden transition-all duration-300 ease-in-out ${
                          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                        }`}
                      >
                        <div className="mt-2.5 pt-2.5 border-t border-slate-700">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-2.5">
                            <div className="bg-slate-950/30 rounded p-1.5">
                              <p className="text-slate-500 text-[9px] mb-0.5">Total Bonuses</p>
                              <p className="text-white font-semibold text-xs">{hunt.total_bonuses}</p>
                            </div>
                            <div className="bg-slate-950/30 rounded p-1.5">
                              <p className="text-slate-500 text-[9px] mb-0.5">Average Betsize</p>
                              <p className="text-white font-semibold text-xs">${averageBetSize.toFixed(2)}</p>
                            </div>
                            <div className="bg-slate-950/30 rounded p-1.5">
                              <p className="text-slate-500 text-[9px] mb-0.5">Total Result</p>
                              <p className="text-white font-semibold text-xs">${hunt.total_result.toFixed(2)}</p>
                            </div>
                            <div className="bg-slate-950/30 rounded p-1.5">
                              <p className="text-slate-500 text-[9px] mb-0.5">Opening Balance</p>
                              <p className="text-white font-semibold text-xs">${hunt.opening_balance.toFixed(2)}</p>
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h4 className="text-white font-medium text-xs mb-1.5 flex items-center gap-2">
                              <div className="w-1 h-3 bg-cyan-500 rounded"></div>
                              Bonuses
                            </h4>
                            {bonusDetails.map((bonus, index) => {
                              const multiplier = bonus.result && bonus.bet_size ? bonus.result / bonus.bet_size : 0

                              return (
                                <div
                                  key={index}
                                  className="bg-slate-950/30 p-1.5 rounded grid grid-cols-[1fr_auto] gap-2 items-center"
                                >
                                  <div>
                                    <p className="text-white font-medium text-xs">{bonus.game_name}</p>
                                    {bonus.provider && <p className="text-slate-400 text-[9px]">{bonus.provider}</p>}
                                  </div>
                                  <div className="grid grid-cols-3 gap-3 text-xs">
                                    <div className="text-center">
                                      <p className="text-slate-500 text-[9px] mb-0.5">Bet</p>
                                      <p className="text-red-400 font-medium text-[10px]">
                                        ${Number(bonus.bet_size).toFixed(2)}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-slate-500 text-[9px] mb-0.5">Result</p>
                                      <p className="text-green-400 font-medium text-[10px]">
                                        {bonus.result !== null ? `$${Number(bonus.result).toFixed(2)}` : "-"}
                                      </p>
                                    </div>
                                    <div className="text-center">
                                      <p className="text-slate-500 text-[9px] mb-0.5">Multi</p>
                                      <p className="text-amber-400 font-medium text-[10px]">
                                        {bonus.result !== null ? `${multiplier.toFixed(2)}x` : "-"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </PageTransition>
  )
}
