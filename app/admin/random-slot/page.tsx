"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Copy } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Slot {
  id: string
  game_name: string
  provider: string | null
}

export default function RandomSlotPage() {
  const [allSlots, setAllSlots] = useState<Slot[]>([])
  const [providers, setProviders] = useState<string[]>([])
  const [selectedProviders, setSelectedProviders] = useState<string[]>(["All"])
  const [isRolling, setIsRolling] = useState(false)
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null)
  const [finalSlot, setFinalSlot] = useState<Slot | null>(null)
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchAllSlots()
  }, [])

  const fetchAllSlots = async () => {
    const { data, error } = await supabase.from("slots").select("*")

    if (error) {
      console.error("[v0] Error fetching slots:", error)
      return
    }

    setAllSlots(data || [])

    const uniqueProviders = Array.from(new Set(data?.map((slot) => slot.provider).filter(Boolean) as string[]))
    setProviders(["All", ...uniqueProviders.sort()])
  }

  const handleProviderToggle = (provider: string) => {
    if (provider === "All") {
      setSelectedProviders(["All"])
    } else {
      const newSelected = selectedProviders.includes(provider)
        ? selectedProviders.filter((p) => p !== provider && p !== "All")
        : [...selectedProviders.filter((p) => p !== "All"), provider]

      setSelectedProviders(newSelected.length === 0 ? ["All"] : newSelected)
    }
  }

  const generateRandomSlot = async () => {
    const filteredSlots =
      selectedProviders.includes("All") || selectedProviders.length === 0
        ? allSlots
        : allSlots.filter((slot) => slot.provider && selectedProviders.includes(slot.provider))

    if (filteredSlots.length === 0) {
      toast({
        title: "Error",
        description: "No slots available for selected providers",
        variant: "destructive",
      })
      return
    }

    setIsRolling(true)
    setFinalSlot(null)

    let iterations = 0
    const maxIterations = 20

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * filteredSlots.length)
      setCurrentSlot(filteredSlots[randomIndex])
      iterations++

      if (iterations >= maxIterations) {
        clearInterval(interval)
        const finalIndex = Math.floor(Math.random() * filteredSlots.length)
        const selectedSlot = filteredSlots[finalIndex]
        setFinalSlot(selectedSlot)
        setIsRolling(false)
        setTimeout(() => setCurrentSlot(null), 100)
      }
    }, 100)
  }

  const copySlotName = () => {
    if (finalSlot) {
      navigator.clipboard.writeText(finalSlot.game_name)
      toast({
        title: "Copied!",
        description: "Slot name copied to clipboard",
      })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Random Slot Generator</h1>
        <p className="text-slate-400">Generate a random slot from your collection</p>
      </div>

      <div className="max-w-4xl">
        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Select Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-6">
              <Label className="text-slate-300 mb-3 block">Filter by Provider</Label>
              <div className="flex flex-wrap gap-2">
                {providers.map((provider) => (
                  <Button
                    key={provider}
                    variant={selectedProviders.includes(provider) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleProviderToggle(provider)}
                    className="h-9"
                  >
                    {provider}
                  </Button>
                ))}
              </div>
            </div>

            <Button onClick={generateRandomSlot} disabled={isRolling} className="w-full h-12 text-base">
              {isRolling ? "Generating..." : "Generate Random Slot"}
            </Button>

            {(currentSlot || finalSlot) && (
              <div className="mt-8 p-6 bg-slate-800/50 rounded-lg border border-slate-700">
                <h3 className="text-white font-semibold mb-4 text-center">Result</h3>
                <div className="flex flex-col items-center justify-center gap-6">
                  {currentSlot && isRolling && (
                    <div className="text-center">
                      <p className="text-slate-400 text-sm mb-2">Rolling...</p>
                      <p className="text-white font-bold text-2xl">{currentSlot.game_name}</p>
                      <p className="text-slate-400">{currentSlot.provider || ""}</p>
                    </div>
                  )}
                  {finalSlot && !isRolling && (
                    <div className="text-center">
                      <p className="text-slate-400 mb-2">Final Slot</p>
                      <p className="text-amber-400 font-bold text-3xl mb-1">{finalSlot.game_name}</p>
                      <p className="text-amber-400 mb-4">{finalSlot.provider || ""}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={copySlotName}
                        className="border-amber-600 text-amber-400 hover:bg-amber-900/30 bg-transparent"
                      >
                        <Copy className="w-4 h-4 mr-2" /> Copy Slot Name
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
