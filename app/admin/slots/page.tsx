"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Slot {
  id: string
  game_name: string
  provider: string | null
}

export default function SlotsPage() {
  const [slots, setSlots] = useState<Slot[]>([])
  const [newSlotName, setNewSlotName] = useState("")
  const [newSlotProvider, setNewSlotProvider] = useState("")
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchSlots()
  }, [])

  const fetchSlots = async () => {
    const { data, error } = await supabase.from("slots").select("*").order("game_name", { ascending: true })

    if (error) {
      console.error("[v0] Error fetching slots:", error)
      return
    }

    setSlots(data || [])
  }

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newSlotName.trim() || !newSlotProvider.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase.from("slots").insert([
      {
        game_name: newSlotName,
        provider: newSlotProvider,
      },
    ])

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add slot",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Slot added successfully",
      })
      setNewSlotName("")
      setNewSlotProvider("")
      fetchSlots()
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Slots Database</h1>
        <p className="text-slate-400">Manage your slots collection</p>
      </div>

      <div className="max-w-6xl">
        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Add New Slot</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddSlot} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="new_slot_name" className="text-slate-300">
                    Slot Name
                  </Label>
                  <Input
                    id="new_slot_name"
                    value={newSlotName}
                    onChange={(e) => setNewSlotName(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white mt-1"
                    placeholder="Enter slot name"
                  />
                </div>
                <div>
                  <Label htmlFor="new_slot_provider" className="text-slate-300">
                    Provider
                  </Label>
                  <Input
                    id="new_slot_provider"
                    value={newSlotProvider}
                    onChange={(e) => setNewSlotProvider(e.target.value)}
                    className="bg-slate-950 border-slate-700 text-white mt-1"
                    placeholder="Enter provider"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full">
                Add Slot to Database
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur mt-6">
          <CardHeader>
            <CardTitle className="text-white">All Slots ({slots.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4 font-semibold text-slate-300 pb-2 border-b border-slate-700">
                <div>Slot</div>
                <div>Provider</div>
              </div>
              {slots.map((slot) => (
                <div key={slot.id} className="grid grid-cols-2 gap-4 text-white py-2 border-b border-slate-700/50">
                  <div>{slot.game_name}</div>
                  <div className="text-slate-400">{slot.provider}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
