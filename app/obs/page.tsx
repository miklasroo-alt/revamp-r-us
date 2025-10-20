"use client"

import { createClient } from "@/lib/supabase/client"
import { Coins, ChevronRight, ChevronLeft, Receipt } from "lucide-react"
import { useEffect, useState, useRef } from "react"

type BonusHunt = {
  id: string
  game_name: string
  provider: string | null
  bet_size: number
  result: number | null
  starting_balance: number | null
  opening_balance: number | null
  created_at: string
}

export default function OBSWidget() {
  const [hunts, setHunts] = useState<BonusHunt[]>([])
  const [loading, setLoading] = useState(true)
  const [isOpening, setIsOpening] = useState(false)
  const supabase = createClient()
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  async function fetchBonusHunts() {
    const { data, error } = await supabase
      .from("bonus_hunts")
      .select("*")
      .order("created_at", { ascending: true })
    
    if (error) {
      console.error("Error fetching bonus hunts:", error)
      return
    }

    const filteredData = (data || []).filter((hunt) => hunt.game_name !== "_temp_balance_holder")
    setHunts(filteredData as BonusHunt[])
    setLoading(false)
  }

  async function fetchOpeningState() {
    const { data, error } = await supabase
      .from("opening_state")
      .select("is_opening")
      .limit(1)
      .single()
    
    if (error) {
      console.error("Error fetching opening state:", error)
      return
    }

    setIsOpening(data?.is_opening ?? false)
  }

  useEffect(() => {
    fetchBonusHunts()
    fetchOpeningState()

    const pollInterval = setInterval(() => {
      fetchBonusHunts()
      fetchOpeningState()
    }, 1000)

    const bonusChannel = supabase
      .channel("bonus_hunts_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "bonus_hunts" }, () => fetchBonusHunts())
      .subscribe()

    const stateChannel = supabase
      .channel("opening_state_realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "opening_state" }, () => fetchOpeningState())
      .subscribe()

    return () => {
      clearInterval(pollInterval)
      supabase.removeChannel(bonusChannel)
      supabase.removeChannel(stateChannel)
    }
  }, [])

  useEffect(() => {
    if (isOpening || hunts.length <= 6) return

    const container = scrollContainerRef.current
    if (!container) return

    let scrollPosition = 0
    let isPaused = false
    let isScrollingUp = false
    let scrollUpStartTime = 0
    let scrollUpStartPosition = 0
    let animationId: number

    const animate = (timestamp: number) => {
      if (!container) return

      if (isPaused) {
        animationId = requestAnimationFrame(animate)
        return
      }

      if (isScrollingUp) {
        if (scrollUpStartTime === 0) {
          scrollUpStartTime = timestamp
          scrollUpStartPosition = scrollPosition
        }

        const elapsed = timestamp - scrollUpStartTime
        const duration = 800
        const progress = Math.min(elapsed / duration, 1)

        const easeOutCubic = 1 - Math.pow(1 - progress, 3)

        scrollPosition = scrollUpStartPosition * (1 - easeOutCubic)
        container.scrollTop = scrollPosition

        if (progress >= 1) {
          scrollPosition = 0
          container.scrollTop = 0
          isScrollingUp = false
          scrollUpStartTime = 0

          isPaused = true
          setTimeout(() => {
            isPaused = false
          }, 1000)
        }

        animationId = requestAnimationFrame(animate)
        return
      }

      scrollPosition += 0.4

      const totalHeight = container.scrollHeight
      const singleListHeight = totalHeight / 5
      const maxScroll = singleListHeight * 4 + 20

      if (scrollPosition >= maxScroll) {
        isPaused = true
        setTimeout(() => {
          isScrollingUp = true
          isPaused = false
        }, 3000)
      } else {
        container.scrollTop = scrollPosition
      }

      animationId = requestAnimationFrame(animate)
    }

    animationId = requestAnimationFrame(animate)

    return () => {
      if (animationId) cancelAnimationFrame(animationId)
    }
  }, [isOpening, hunts.length])

  useEffect(() => {
    if (!isOpening) return

    const container = scrollContainerRef.current
    if (!container) return

    const firstUnopened = hunts.find((h) => !h.result || h.result === 0)
    if (!firstUnopened) return

    const bonusElement = document.getElementById(`bonus-${firstUnopened.id}`)
    if (bonusElement) {
      bonusElement.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }, [isOpening, hunts])

  if (loading) {
    return <div className="min-h-screen bg-transparent flex items-center justify-center text-white">Loading...</div>
  }

  const totalBonuses = hunts.length
  const completedHunts = hunts.filter((h) => h.result && h.result > 0)
  const unopenedBonuses = hunts.filter((h) => !h.result || h.result === 0)

  const startingBalance = hunts[0]?.starting_balance ? Number(hunts[0].starting_balance) : 0
  const totalWinsSoFar = hunts.reduce((sum, h) => sum + (Number(h.result) || 0), 0)
  const totalRemainingStakes = unopenedBonuses.reduce((sum, h) => sum + Number(h.bet_size), 0)
  const breakEvenX =
    totalRemainingStakes > 0 ? Math.max(0, (startingBalance - totalWinsSoFar) / totalRemainingStakes) : 0

  const totalMultiplier = completedHunts.reduce((sum, h) => {
    if (h.result && h.bet_size) {
      return sum + Number(h.result) / Number(h.bet_size)
    }
    return sum
  }, 0)
  const averageMultiplier = completedHunts.length > 0 ? totalMultiplier / completedHunts.length : 0

  const highestWin = hunts.reduce(
    (max, h) => {
      if (h.result && Number(h.result) > max.amount) {
        return {
          game: h.game_name,
          amount: Number(h.result),
          betSize: Number(h.bet_size),
        }
      }
      return max
    },
    { game: "", amount: 0, betSize: 0 },
  )
  const highestWinMultiplier = highestWin.betSize > 0 ? highestWin.amount / highestWin.betSize : 0

  const firstUnopenedId = unopenedBonuses[0]?.id

  const displayBonuses = isOpening 
    ? hunts 
    : hunts.length > 6 
      ? [...hunts, ...hunts, ...hunts, ...hunts, ...hunts] 
      : hunts

  return (
    <div className="min-h-screen bg-transparent p-4">
      <div className="w-[320px] bg-gradient-to-b from-[#1A1F2B]/95 to-[#0B0E13]/95 backdrop-blur-sm rounded-xl shadow-2xl border border-[#4D84FF]/30 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#4D84FF]/20 to-[#7FB3FF]/20 px-5 py-3 border-b border-[#4D84FF]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-[#7FB3FF]" />
            <h1 className="text-white font-bold text-xl">BONUS HUNT</h1>
          </div>
          <span className="italic text-gray-400 text-sm">
            {new Date().toLocaleDateString("en-GB")}
          </span>
        </div>

        {/* Statistics */}
        <div className="px-5 py-3 space-y-2 text-base border-b border-[#4D84FF]/20">
          <div className="flex justify-between">
            <span className="text-[#7FB3FF]">Start:</span>
            <span className="text-white font-semibold">${startingBalance.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7FB3FF]">Bonuses:</span>
            <span className="text-white font-semibold">
              {completedHunts.length} / {totalBonuses}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7FB3FF]">Average:</span>
            <span className="text-white font-semibold">{averageMultiplier.toFixed(0)}x</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#7FB3FF]">Break Even:</span>
            <span className="text-white font-semibold">{breakEvenX.toFixed(0)}x</span>
          </div>
        </div>

        {/* Highest Win */}
        {highestWin.amount > 0 && (
          <div className="px-5 py-3 border-b border-[#4D84FF]/20 bg-gradient-to-r from-[#4D84FF]/5 to-transparent">
            <div className="text-[#7FB3FF] text-sm mb-1">Highest Win:</div>
            <div className="flex justify-between items-center gap-2 mb-1">
              <div className="text-white font-bold text-base truncate flex-1 min-w-0">{highestWin.game}</div>
              <span className="text-white text-base flex-shrink-0">(${highestWin.betSize.toFixed(2)})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-400 font-bold text-xl">${highestWin.amount.toFixed(2)}</span>
              <span className="text-base text-amber-400">({highestWinMultiplier.toFixed(0)}x)</span>
            </div>
          </div>
        )}

        {/* Bonus List */}
        <div
          ref={scrollContainerRef}
          className="h-[200px] overflow-hidden"
          style={{ scrollBehavior: isOpening ? "smooth" : "auto" }}
        >
          <div className="px-2 py-2">
            {displayBonuses.map((hunt, index) => {
              const isOpened = hunt.result && hunt.result > 0
              const isCurrent = isOpening && hunt.id === firstUnopenedId
              const isPreviousCurrent = isOpening && index > 0 && displayBonuses[index - 1]?.id === firstUnopenedId
              const displayIndex = isOpening ? index + 1 : (index % hunts.length) + 1

              return (
                <div
                  key={`${hunt.id}-${index}`}
                  id={isOpening || index < hunts.length ? `bonus-${hunt.id}` : undefined}
                  className={`rounded-lg transition-all ${
                    isCurrent ? 'bg-[#4D84FF]/20 border border-[#4D84FF]/50 px-2 py-1 my-1' : isPreviousCurrent ? 'px-1 py-0.5 mt-1' : isOpening ? 'px-1 py-0.5' : 'px-2'
                  }`}
                  style={{
                    marginBottom: isOpening 
                      ? "0px"
                      : (index + 1) % hunts.length === 0 
                        ? "20px" 
                        : "0px",
                  }}
                >
                  {isCurrent ? (
                    // Current bonus with arrows at the edges
                    <div className="relative flex items-center justify-between text-sm min-h-[30px]">
                      <ChevronRight className="absolute left-0 w-4 h-4 text-[#7FB3FF] flex-shrink-0 animate-pulse" />
                      <div className="flex items-center gap-1 flex-1 min-w-0 pl-6 pr-6">
                        <span className="text-[#4D84FF] font-semibold flex-shrink-0 -ml-0.5">{displayIndex}</span>
                        <span className="text-white font-medium truncate text-sm">{hunt.game_name}</span>
                        <span className="text-gray-400 text-sm whitespace-nowrap ml-auto -m-1">(${hunt.bet_size.toFixed(2)})</span>
                      </div>
                      <ChevronLeft className="absolute right-0 w-4 h-4 text-[#7FB3FF] animate-pulse" />
                    </div>
                  ) : (
                    // Normal bonus
                    <div className="flex items-center justify-between gap-1 text-sm min-h-[24px]">
                      <div className="flex items-center gap-1 flex-1 min-w-0">
                        <span className="text-[#4D84FF] font-semibold flex-shrink-0 ">{displayIndex}</span>
                        <span className="text-white font-medium truncate text-sm pr-2">{hunt.game_name}</span>
                      </div>
                      <div className="flex items-center flex-shrink-0">
                        <span className="text-gray-400 text-sm whitespace-nowrap ">(${hunt.bet_size.toFixed(2)})</span>
                      </div>
                    </div>
                  )}
                  {isOpened && (
                    <div className="text-emerald-400 text-sm -mt-0.5 font-semibold ml-4.5">
                      ${hunt.result?.toFixed(2)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}