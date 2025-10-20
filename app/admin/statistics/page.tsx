"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

export default function StatisticsPage() {
  const [startingBalance, setStartingBalance] = useState("")
  const [openingBalance, setOpeningBalance] = useState("")
  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")
  const supabase = createClient()
  const { toast } = useToast()

  useEffect(() => {
    fetchBalances()
  }, [])

  const fetchBalances = async () => {
    const { data, error } = await supabase.from("hunt_settings").select("*").single()

    if (error && error.code !== "PGRST116") {
      console.error("[v0] Error fetching balances:", error)
      return
    }

    if (data) {
      setStartingBalance(data.starting_balance?.toString() || "")
      setOpeningBalance(data.opening_balance?.toString() || "")
    }
  }

  const handleStartingBalanceChange = async (e: React.FormEvent) => {
    e.preventDefault()

    const { error } = await supabase.from("hunt_settings").upsert({
      id: 1,
      starting_balance: Number.parseFloat(startingBalance),
      opening_balance: Number.parseFloat(openingBalance),
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update balances",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Balances updated successfully",
      })
    }
  }

  const handleDeposit = async () => {
    if (!depositAmount) return

    const currentBalance = Number.parseFloat(startingBalance) || 0
    const newBalance = currentBalance + Number.parseFloat(depositAmount)

    const { error } = await supabase.from("hunt_settings").upsert({
      id: 1,
      starting_balance: newBalance,
      opening_balance: Number.parseFloat(openingBalance),
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to add deposit",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Added $${depositAmount} to balance`,
      })
      setStartingBalance(newBalance.toString())
      setDepositAmount("")
    }
  }

  const handleWithdraw = async () => {
    if (!withdrawAmount) return

    const currentBalance = Number.parseFloat(startingBalance) || 0
    const newBalance = currentBalance - Number.parseFloat(withdrawAmount)

    const { error } = await supabase.from("hunt_settings").upsert({
      id: 1,
      starting_balance: newBalance,
      opening_balance: Number.parseFloat(openingBalance),
    })

    if (error) {
      toast({
        title: "Error",
        description: "Failed to withdraw",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: `Withdrew $${withdrawAmount} from balance`,
      })
      setStartingBalance(newBalance.toString())
      setWithdrawAmount("")
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Statistics Settings</h1>
        <p className="text-slate-400">Manage your hunt balances and settings</p>
      </div>

      <div className="max-w-4xl">
        <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Hunt Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleStartingBalanceChange} className="space-y-4">
              <div>
                <Label htmlFor="starting_balance" className="text-slate-300">
                  Starting Balance ($)
                </Label>
                <p className="text-xs text-slate-400 mb-2">The amount of money you started the hunt with.</p>
                <Input
                  id="starting_balance"
                  type="number"
                  step="0.01"
                  value={startingBalance}
                  onChange={(e) => setStartingBalance(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="0.00"
                />
              </div>

              <div>
                <Label htmlFor="opening_balance" className="text-slate-300">
                  Opening Balance ($)
                </Label>
                <p className="text-xs text-slate-400 mb-2">The balance you have when you start opening bonuses.</p>
                <Input
                  id="opening_balance"
                  type="number"
                  step="0.01"
                  value={openingBalance}
                  onChange={(e) => setOpeningBalance(e.target.value)}
                  required
                  className="bg-slate-950 border-slate-700 text-white"
                  placeholder="0.00"
                />
              </div>

              <Button type="submit" className="w-full">
                Update Balances
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white text-lg">Deposit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  type="number"
                  step="0.01"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  placeholder="Amount to deposit"
                  className="bg-slate-950 border-slate-700 text-white"
                />
                <Button onClick={handleDeposit} className="w-full" disabled={!depositAmount}>
                  Add Deposit
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
            <CardHeader>
              <CardTitle className="text-white text-lg">Withdraw</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Input
                  type="number"
                  step="0.01"
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="Amount to withdraw"
                  className="bg-slate-950 border-slate-700 text-white"
                />
                <Button onClick={handleWithdraw} variant="destructive" className="w-full" disabled={!withdrawAmount}>
                  Withdraw
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
