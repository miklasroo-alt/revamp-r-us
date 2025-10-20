"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  DollarSign,
  TrendingUp,
  Target,
  ShuffleIcon,
  Copy,
  GripVertical,
  Home,
  LogOut,
  BarChart3,
  ChevronRight,
  ArrowLeft,
  Save,
  Edit,
  ChevronUp,
  ChevronDown,
  ShoppingCart,
} from "lucide-react"
import { Sparkles } from "lucide-react" // Import Sparkles
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Package } from "lucide-react" // Import Package
import { Gift } from "lucide-react" // Import Gift
import { UsersIcon } from "lucide-react" // Import UsersIcon

type BonusHunt = {
  id: string
  game_name: string
  provider: string | null
  bet_size: number
  result: number | null
  starting_balance?: number
  opening_balance?: number
  created_at: string
}

type Slot = {
  id: string
  game_name: string
  provider: string | null
}

type PastHunt = {
  id: string
  hunt_id: string
  hunt_name: string
  starting_balance: number
  opening_balance: number
  total_bonuses: number
  total_bet_size: number
  total_result: number
  profit_loss: number
  bonuses: any
  created_at: string
  status?: string
}

// Adding Store Management types
type StoreItem = {
  id: string
  name: string
  description: string
  cost: number
  type: string
  quantity: number | null
  icon: string
  created_at: string
}

type Redemption = {
  id: string
  user_id: string
  item_id: string
  item_name: string
  cost: number
  status: string
  created_at: string
  username?: string
}

type StoreUser = {
  id: string
  kick_id: string
  username: string
  points_balance: number
  created_at: string
}

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [bonusHunts, setBonusHunts] = useState<BonusHunt[]>([])
  const [slots, setSlots] = useState<Slot[]>([])
  const [filteredSlots, setFilteredSlots] = useState<Slot[]>([])
  const [formData, setFormData] = useState({
    game_name: "",
    provider: "",
    bet_size: "",
    result: "",
  })
  const [startingBalance, setStartingBalance] = useState("")
  const [openingBalance, setOpeningBalance] = useState("")
  const [editingField, setEditingField] = useState<{ id: string; field: "bet_size" | "result" } | null>(null)
  const [editValue, setEditValue] = useState("")
  const router = useRouter()
  const supabase = createClient()
  const { toast } = useToast()

  const [isOpeningMode, setIsOpeningMode] = useState(false)
  const [currentOpeningIndex, setCurrentOpeningIndex] = useState(0)
  const [openingBonuses, setOpeningBonuses] = useState<BonusHunt[]>([])
  const [newSlotName, setNewSlotName] = useState("")
  const [newSlotProvider, setNewSlotProvider] = useState("")

  const [depositAmount, setDepositAmount] = useState("")
  const [withdrawAmount, setWithdrawAmount] = useState("")

  const [payout, setPayout] = useState("")
  const [multiplier, setMultiplier] = useState("")
  const [spinsUsed, setSpinsUsed] = useState("")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isResetting, setIsResetting] = useState(false)
  const [isRandomizing, setIsRandomizing] = useState(false)

  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [huntName, setHuntName] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [pastHunts, setPastHunts] = useState<PastHunt[]>([])
  const [expandedHuntId, setExpandedHuntId] = useState<string | null>(null)
  const [editingPastHunt, setEditingPastHunt] = useState<string | null>(null)
  const [editPastHuntData, setEditPastHuntData] = useState<{
    hunt_name: string
    status: string
  }>({ hunt_name: "", status: "Active" })

  const [editingPastBonus, setEditingPastBonus] = useState<{
    huntId: string
    bonusIndex: number
    field: "bet_size" | "result"
  } | null>(null)
  const [editPastBonusValue, setEditPastBonusValue] = useState("")

  const [allSlots, setAllSlots] = useState<Slot[]>([])
  const [providers, setProviders] = useState<string[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>("All") // Updated to use single provider selection for dropdown
  const [isRolling, setIsRolling] = useState(false)
  const [currentSlot, setCurrentSlot] = useState<Slot | null>(null)
  const [finalSlot, setFinalSlot] = useState<Slot | null>(null)

  const [selectedProviders, setSelectedProviders] = useState<string[]>(["All"])
  const [showProviderDropdown, setShowProviderDropdown] = useState(false)

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const [storeItems, setStoreItems] = useState<StoreItem[]>([])
  const [redemptions, setRedemptions] = useState<Redemption[]>([])
  const [storeUsers, setStoreUsers] = useState<StoreUser[]>([])
  const [storeSubTab, setStoreSubTab] = useState<"items" | "redemptions" | "users">("items")
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [newItem, setNewItem] = useState({
    name: "",
    description: "",
    cost: "",
    type: "reward",
    quantity: "",
    icon: "gift",
  })
  const [editItemData, setEditItemData] = useState<StoreItem | null>(null)
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [pointsToAdd, setPointsToAdd] = useState("")

  // State for managing active tab
  const [activeTab, setActiveTab] = useState<
    "current" | "statistics" | "edit-slots" | "previous-hunts" | "random-slot" | "store-management"
  >("current")

  const slotsByProvider = slots.reduce((acc: Record<string, Slot[]>, slot) => {
    const provider = slot.provider || "Uncategorized"
    if (!acc[provider]) {
      acc[provider] = []
    }
    acc[provider].push(slot)
    return acc
  }, {})

  useEffect(() => {
    checkUser()
    fetchBonusHunts()
    fetchSlots()
    fetchOpeningState()
    fetchPastHunts()
    fetchDepositsWithdrawals()
    fetchAllSlots()
    fetchRandomSlotState()
    fetchStoreItems()
    fetchRedemptions()
    fetchStoreUsers()
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

  async function fetchOpeningState() {
    const { data, error } = await supabase.from("opening_state").select("is_opening").single()

    if (!error && data) {
      if (data.is_opening) {
        await startOpeningMode()
      }
    }
  }

  const fetchBonusHunts = async () => {
    const { data, error } = await supabase.from("bonus_hunts").select("*").order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching bonus hunts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch bonus hunts",
        variant: "destructive",
      })
      return
    }

    // Filter out temp holder from display but keep it for balance tracking
    const filteredData = (data || []).filter((hunt) => hunt.game_name !== "_temp_balance_holder")
    const tempHolder = (data || []).find((hunt) => hunt.game_name === "_temp_balance_holder")

    setBonusHunts(filteredData)

    if (tempHolder) {
      setStartingBalance(tempHolder.starting_balance?.toString() || "0")
      setOpeningBalance(tempHolder.opening_balance?.toString() || "0")
    } else if (filteredData.length > 0) {
      const firstHunt = filteredData[0]
      setStartingBalance(firstHunt.starting_balance?.toString() || "0")
      setOpeningBalance(firstHunt.opening_balance?.toString() || "0")
    } else {
      // If no hunts and no temp holder, reset to defaults
      setStartingBalance("0")
      setOpeningBalance("0")
    }
  }

  async function fetchSlots() {
    try {
      let allSlots: Slot[] = []
      let from = 0
      const batchSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from("slots")
          .select("*")
          .order("provider", { ascending: true })
          .range(from, from + batchSize - 1)

        if (error) {
          console.error("[v0] Error fetching slots batch:", error)
          break
        }

        if (data && data.length > 0) {
          allSlots = [...allSlots, ...data]
          from += batchSize

          if (data.length < batchSize) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }

      console.log("[v0] Total slots fetched:", allSlots.length)
      setSlots(allSlots)
      setFilteredSlots(allSlots) // Initially set filteredSlots to all slots
    } catch (err) {
      console.error("[v0] Error in fetchSlots:", err)
    }
  }

  async function fetchPastHunts() {
    const { data, error } = await supabase.from("past_bonushunts").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching past hunts:", error)
    } else {
      setPastHunts(data || [])
    }
  }

  async function fetchDepositsWithdrawals() {
    const { data, error } = await supabase.from("deposits_withdrawals").select("*").limit(1)

    if (error) {
      console.error("[v0] Error fetching deposits/withdrawals:", error)
    } else if (data && data.length > 0) {
      setDepositAmount(data[0].deposit_amount?.toString() || "0")
      setWithdrawAmount(data[0].withdraw_amount?.toString() || "0")
    } else {
      // No data exists yet, use defaults
      setDepositAmount("0")
      setWithdrawAmount("0")
    }
  }

  async function fetchAllSlots() {
    try {
      let allSlotsData: Slot[] = []
      let from = 0
      const batchSize = 1000
      let hasMore = true

      while (hasMore) {
        const { data, error } = await supabase
          .from("slots")
          .select("*")
          .order("provider", { ascending: true })
          .range(from, from + batchSize - 1)

        if (error) {
          console.error("[v0] Error fetching all slots batch:", error)
          break
        }

        if (data && data.length > 0) {
          allSlotsData = [...allSlotsData, ...data]
          from += batchSize
          if (data.length < batchSize) {
            hasMore = false
          }
        } else {
          hasMore = false
        }
      }
      setAllSlots(allSlotsData)
      // Ensure 'All' is always the first provider, and filter out any potential null/empty providers
      const uniqueProviders = ["All", ...new Set(allSlotsData.map((s) => s.provider).filter(Boolean) as string[])]
      setProviders(uniqueProviders)
    } catch (err) {
      console.error("[v0] Error in fetchAllSlots:", err)
    }
  }

  async function fetchRandomSlotState() {
    const { data, error } = await supabase.from("random_slot_state").select("*").single()

    if (error && error.message !== "Result must contain exactly one row") {
      console.error("[v0] Error fetching random slot state:", error)
      return
    }

    if (data) {
      setIsRolling(data.is_rolling)
      setCurrentSlot(
        data.current_slot_name
          ? { id: "", game_name: data.current_slot_name, provider: data.current_slot_provider }
          : null,
      )
      setFinalSlot(
        data.final_slot_name ? { id: "", game_name: data.final_slot_name, provider: data.final_slot_provider } : null,
      )
    }
  }

  async function fetchStoreItems() {
    const { data, error } = await supabase.from("store_items").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching store items:", error)
      return
    }

    setStoreItems(data || [])
  }

  async function fetchRedemptions() {
    const { data, error } = await supabase
      .from("redemptions")
      .select("*, users(username)")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching redemptions:", error)
      return
    }

    const redemptionsWithUsername = (data || []).map((r: any) => ({
      ...r,
      username: r.users?.username || "Unknown",
    }))

    setRedemptions(redemptionsWithUsername)
  }

  async function fetchStoreUsers() {
    const { data, error } = await supabase.from("users").select("*").order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching users:", error)
      return
    }

    setStoreUsers(data || [])
  }

  function handleSlotSearch(search: string) {
    if (!search) {
      setFilteredSlots(slots)
    } else {
      const filtered = slots.filter(
        (slot) =>
          slot.game_name.toLowerCase().includes(search.toLowerCase()) ||
          (slot.provider && slot.provider.toLowerCase().includes(search.toLowerCase())),
      )
      setFilteredSlots(filtered)
    }
  }

  function handleSlotSelect(slot: Slot) {
    setFormData({ ...formData, game_name: slot.game_name, provider: slot.provider || "" })
    setFilteredSlots([]) // Clear filtered slots after selection
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const huntData = {
        game_name: formData.game_name,
        provider: formData.provider || null, // Ensure provider is null if empty string
        bet_size: Number.parseFloat(formData.bet_size),
        result: formData.result ? Number.parseFloat(formData.result) : null,
      }

      // Basic validation
      if (isNaN(huntData.bet_size)) {
        toast({ description: "Invalid bet size.", variant: "destructive" })
        setIsSubmitting(false)
        return
      }
      if (formData.result && isNaN(huntData.result!)) {
        toast({ description: "Invalid result amount.", variant: "destructive" })
        setIsSubmitting(false)
        return
      }

      const { error } = await supabase.from("bonus_hunts").insert([huntData])

      if (error) {
        console.error("[v0] Error creating bonus hunt:", error)
        toast({
          title: "Error",
          description: "Failed to create bonus hunt",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Bonus hunt added successfully",
          className: "bg-green-600 text-white",
        })
        resetForm()
        await fetchBonusHunts()
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleStartingBalanceChange = async (e: React.FormEvent) => {
    e.preventDefault()

    const startBalance = Number.parseFloat(startingBalance)
    const openBalance = Number.parseFloat(openingBalance)

    if (Number.isNaN(startBalance) || Number.isNaN(openBalance)) {
      toast({ description: "Please enter valid numbers for balances", variant: "destructive" })
      return
    }

    try {
      // Check if the temp holder exists, if not, create it
      const { data: existingHolder } = await supabase
        .from("bonus_hunts")
        .select("*")
        .eq("game_name", "_temp_balance_holder")
        .single()

      if (existingHolder) {
        // Update existing temp holder
        const { error } = await supabase
          .from("bonus_hunts")
          .update({ starting_balance: startBalance, opening_balance: openBalance })
          .eq("game_name", "_temp_balance_holder")

        if (error) throw error
      } else {
        // Insert new temp holder
        await supabase.from("bonus_hunts").insert([
          {
            game_name: "_temp_balance_holder",
            provider: null,
            bet_size: 0,
            result: 0,
            starting_balance: startBalance,
            opening_balance: openBalance,
            // created_at will be automatically set
          },
        ])
      }

      // Update existing non-temp hunts to reflect these new balances if needed for calculation consistency
      // This part might need careful consideration based on exact logic. For now, we update the temp holder.
      // If other hunts should inherit these, a separate update logic might be needed.
      // For simplicity, let's assume the temp holder is the source of truth for these values.

      await fetchBonusHunts() // Re-fetch to update UI
      toast({ description: "Balances updated successfully" })
    } catch (error) {
      console.error("Error updating balances:", error)
      toast({ description: "Failed to update balances", variant: "destructive" })
    }
  }

  async function handleUpdateDepositsWithdrawals(e: React.FormEvent) {
    e.preventDefault()

    const deposit = Number.parseFloat(depositAmount)
    const withdraw = Number.parseFloat(withdrawAmount)

    if (isNaN(deposit) || isNaN(withdraw)) {
      toast({ description: "Please enter valid numbers for deposits and withdrawals", variant: "destructive" })
      return
    }

    const { data: existing } = await supabase.from("deposits_withdrawals").select("*").limit(1)

    if (existing && existing.length > 0) {
      const { error } = await supabase
        .from("deposits_withdrawals")
        .update({
          deposit_amount: deposit,
          withdraw_amount: withdraw,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing[0].id)

      if (error) {
        console.error("[v0] Error updating deposits/withdrawals:", error)
        toast({
          title: "Error",
          description: "Failed to update deposits/withdrawals",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Deposits/Withdrawals updated successfully",
          className: "bg-green-600 text-white",
        })
      }
    } else {
      const { error } = await supabase.from("deposits_withdrawals").insert([
        {
          deposit_amount: deposit,
          withdraw_amount: withdraw,
        },
      ])

      if (error) {
        console.error("[v0] Error creating deposits/withdrawals:", error)
        toast({
          title: "Error",
          description: "Failed to update deposits/withdrawals",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Deposits/Withdrawals updated successfully",
          className: "bg-green-600 text-white",
        })
      }
    }
  }

  async function handleDeleteBonusHunt(id: string) {
    try {
      const huntToDelete = bonusHunts.find((h) => h.id === id)
      if (!huntToDelete) return // Should not happen if id is valid

      setIsDeleting(id) // Set state to indicate deletion is in progress for this item

      const { error } = await supabase.from("bonus_hunts").delete().eq("id", id)

      if (error) {
        console.error("Error deleting bonus hunt:", error)
        toast({
          description: "Failed to delete bonus hunt",
          variant: "destructive",
        })
      } else {
        toast({ description: "Bonus hunt deleted successfully" })

        // If this was the last hunt (excluding temp holder), we might need to ensure a temp holder exists
        // for balance tracking.
        const currentBonusHunts = await supabase
          .from("bonus_hunts")
          .select("id")
          .neq("game_name", "_temp_balance_holder")
        if (currentBonusHunts.data && currentBonusHunts.data.length === 0) {
          // No other hunts left, check for temp holder
          const { data: existingHolder } = await supabase
            .from("bonus_hunts")
            .select("*")
            .eq("game_name", "_temp_balance_holder")
            .single()

          if (!existingHolder) {
            // If no temp holder exists, create one using the deleted hunt's balances as initial values if possible
            // Or just reset to 0 if that's the desired behavior
            await supabase.from("bonus_hunts").insert([
              {
                game_name: "_temp_balance_holder",
                provider: null,
                bet_size: 0,
                result: 0,
                starting_balance: huntToDelete.starting_balance || 0, // Use deleted hunt's starting balance if available
                opening_balance: huntToDelete.opening_balance || 0, // Use deleted hunt's opening balance if available
              },
            ])
          }
        }
      }
      await fetchBonusHunts() // Re-fetch to update the list
    } catch (error) {
      console.error("Error in handleDeleteBonusHunt:", error)
      toast({
        description: "An error occurred while deleting",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(null) // Reset deletion state
    }
  }

  function startEditing(id: string, field: "bet_size" | "result", currentValue: number | null) {
    setEditingField({ id, field })
    setEditValue(currentValue?.toString() || "")
  }

  async function saveEdit() {
    if (!editingField) return

    const value = Number.parseFloat(editValue)
    if (isNaN(value)) {
      toast({
        title: "Error",
        description: "Please enter a valid number",
        variant: "destructive",
      })
      return
    }

    const { error } = await supabase
      .from("bonus_hunts")
      .update({ [editingField.field]: value })
      .eq("id", editingField.id)

    if (error) {
      console.error("[v0] Error updating bonus hunt:", error)
      toast({
        title: "Error",
        description: "Failed to update bonus hunt",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Bonus hunt updated successfully",
        className: "bg-green-600 text-white",
      })
      setEditingField(null)
      setEditValue("")
      await fetchBonusHunts()
    }
  }

  function cancelEdit() {
    setEditingField(null)
    setEditValue("")
  }

  function resetForm() {
    setFormData({
      game_name: "",
      provider: "",
      bet_size: "",
      result: "",
    })
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  async function handleSaveHunt() {
    if (!huntName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a hunt name",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      if (bonusHunts.length > 0) {
        const totalBetSize = bonusHunts.reduce((sum, h) => sum + Number(h.bet_size), 0)
        const totalResult = bonusHunts.reduce((sum, h) => sum + (Number(h.result) || 0), 0)
        // Use the starting balance from the temp holder or the first bonus hunt if temp holder doesn't exist
        const currentStartingBalance =
          bonusHunts.find((h) => h.game_name === "_temp_balance_holder")?.starting_balance ??
          bonusHunts[0]?.starting_balance ??
          0
        const profitLoss = totalResult - currentStartingBalance

        const { error } = await supabase.from("past_bonushunts").insert([
          {
            hunt_id: `hunt_${Date.now()}`,
            hunt_name: huntName.trim(),
            starting_balance: currentStartingBalance,
            opening_balance:
              bonusHunts.find((h) => h.game_name === "_temp_balance_holder")?.opening_balance ??
              bonusHunts[0]?.opening_balance ??
              0,
            total_bonuses: bonusHunts.length,
            total_bet_size: totalBetSize,
            total_result: totalResult,
            profit_loss: profitLoss,
            bonuses: JSON.stringify(bonusHunts),
            status: "Completed",
          },
        ])

        if (error) {
          console.error("[v0] Error saving hunt:", error)
          toast({
            title: "Error",
            description: "Failed to save hunt",
            variant: "destructive",
          })
        } else {
          toast({
            title: "Success",
            description: `Hunt "${huntName}" saved successfully!`,
            className: "bg-green-600 text-white",
          })
          setShowSaveDialog(false)
          setHuntName("")
          // After saving, should we reset the current hunt? The prompt implies this.
          await handleReset()
        }
      } else {
        toast({
          title: "Info",
          description: "No bonuses to save.",
        })
        setShowSaveDialog(false)
        setHuntName("")
      }
    } finally {
      setIsSaving(false)
    }
  }

  async function handleReset() {
    setIsResetting(true)
    try {
      // Delete all current bonus hunts except the temporary balance holder
      const { error: deleteError } = await supabase
        .from("bonus_hunts")
        .delete()
        .neq("game_name", "_temp_balance_holder")

      if (deleteError) {
        console.error("[v0] Error deleting bonus hunts:", deleteError)
        toast({
          title: "Error",
          description: "Failed to reset bonus hunt",
          variant: "destructive",
        })
        return
      }

      // Reset starting and opening balances in the temp holder
      const { error: updateError } = await supabase
        .from("bonus_hunts")
        .update({ starting_balance: 0, opening_balance: 0 })
        .eq("game_name", "_temp_balance_holder")

      if (updateError) {
        console.error("[v0] Error resetting balances in temp holder:", updateError)
        toast({
          title: "Error",
          description: "Failed to reset balances",
          variant: "destructive",
        })
        // Even if balance reset fails, proceed with fetching hunts to clear the UI
      }

      toast({
        title: "Success",
        description: "Bonus hunt reset successfully",
        className: "bg-green-600 text-white",
      })
      await fetchBonusHunts() // Re-fetch to clear the list and show default balances
    } finally {
      setIsResetting(false)
    }
  }

  async function handleRandomize() {
    setIsRandomizing(true)
    try {
      const shuffled = [...bonusHunts].sort(() => Math.random() - 0.5)

      const updates = shuffled.map((bonus, i) => ({
        ...bonus,
        // Update created_at to maintain order after randomization, if order matters
        created_at: new Date(Date.now() + i * 1000).toISOString(),
      }))

      // Use upsert to update existing rows with the new order
      const { error } = await supabase.from("bonus_hunts").upsert(updates)

      if (error) {
        console.error("[v0] Error randomizing:", error)
        toast({
          title: "Error",
          description: "Failed to randomize bonuses",
          variant: "destructive",
        })
      } else {
        await fetchBonusHunts()
        toast({
          title: "Success",
          description: "Bonuses randomized successfully",
          className: "bg-green-600 text-white",
        })
      }
    } finally {
      setIsRandomizing(false)
    }
  }

  async function startOpeningMode() {
    const { data, error } = await supabase.from("bonus_hunts").select("*").order("created_at", { ascending: true })

    if (error || !data) {
      console.error("[v0] Error fetching bonus hunts:", error)
      toast({
        title: "Error",
        description: "Failed to fetch bonus hunts",
        variant: "destructive",
      })
      return
    }

    const allBonuses = data.filter((hunt) => hunt.game_name !== "_temp_balance_holder")

    if (allBonuses.length === 0) {
      toast({
        title: "Info",
        description: "No bonuses available to open",
      })
      return
    }

    setOpeningBonuses(allBonuses)
    setCurrentOpeningIndex(0)

    const firstBonus = allBonuses[0]
    setPayout(firstBonus?.result?.toString() || "")
    setMultiplier(
      firstBonus?.result && firstBonus?.bet_size && firstBonus.bet_size !== 0
        ? (firstBonus.result / firstBonus.bet_size).toFixed(2)
        : "0.00",
    )
    setSpinsUsed("")

    setIsOpeningMode(true)

    await supabase.from("opening_state").upsert({
      id: 1, // Assuming a single row for opening state
      is_opening: true,
    })

    // Focus the payout input after a short delay to ensure it's rendered
    setTimeout(() => {
      const input = document.getElementById("payout_input")
      if (input) input.focus()
    }, 100)
  }

  async function saveAndNextOpening() {
    if (!payout) {
      toast({ title: "Error", description: "Please enter payout", variant: "destructive" })
      return
    }

    const currentBonus = openingBonuses[currentOpeningIndex]
    const result = Number.parseFloat(payout)

    if (isNaN(result)) {
      toast({ title: "Error", description: "Please enter a valid number for payout", variant: "destructive" })
      return
    }

    // Update the result in the database for the current bonus hunt
    const { error } = await supabase.from("bonus_hunts").update({ result }).eq("id", currentBonus.id)
    if (error) {
      toast({ title: "Error", description: "Failed to update bonus hunt result", variant: "destructive" })
      return
    }

    // Update the state with the new result
    const updatedBonuses = [...openingBonuses]
    updatedBonuses[currentOpeningIndex] = { ...currentBonus, result }
    setOpeningBonuses(updatedBonuses)

    const nextIndex = currentOpeningIndex + 1
    if (nextIndex < updatedBonuses.length) {
      // Move to the next bonus
      setCurrentOpeningIndex(nextIndex)
      const nextBonus = updatedBonuses[nextIndex]
      setPayout(nextBonus?.result?.toString() || "")
      setMultiplier(
        nextBonus?.result && nextBonus?.bet_size && nextBonus.bet_size !== 0
          ? (nextBonus.result / nextBonus.bet_size).toFixed(2)
          : "0.00",
      )
      setSpinsUsed("")

      // Focus the payout input for the next bonus
      setTimeout(() => {
        const input = document.getElementById("payout_input")
        if (input) input.focus()
      }, 50)
    } else {
      // All bonuses opened, exit opening mode
      await exitOpeningMode()
      toast({ title: "Success", description: "All bonuses opened!", className: "bg-green-600 text-white" })
    }
  }

  async function goBackBonus() {
    if (currentOpeningIndex > 0) {
      const prevIndex = currentOpeningIndex - 1
      setCurrentOpeningIndex(prevIndex)
      const prevBonus = openingBonuses[prevIndex]
      setPayout(prevBonus?.result?.toString() || "")
      setMultiplier(
        prevBonus?.result && prevBonus?.bet_size && prevBonus.bet_size !== 0
          ? (prevBonus.result / prevBonus.bet_size).toFixed(2)
          : "0.00",
      )
      setSpinsUsed("")

      setTimeout(() => {
        const input = document.getElementById("payout_input")
        if (input) input.focus()
      }, 50)
    }
  }

  async function exitOpeningMode() {
    setIsOpeningMode(false)
    setCurrentOpeningIndex(0)
    setPayout("")
    setMultiplier("")
    setSpinsUsed("")
    setOpeningBonuses([])

    // Update the opening state in the database
    await supabase.from("opening_state").upsert({
      id: 1,
      is_opening: false,
    })

    await fetchBonusHunts() // Refresh bonus hunts to reflect saved results
  }

  async function handleAddSlot(e: React.FormEvent) {
    e.preventDefault()

    if (!newSlotName || !newSlotProvider) {
      toast({
        title: "Error",
        description: "Please enter both slot name and provider",
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
      console.error("[v0] Error adding slot:", error)
      toast({
        title: "Error",
        description: "Failed to add slot",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Slot added successfully",
        className: "bg-green-600 text-white",
      })
      setNewSlotName("")
      setNewSlotProvider("")
      fetchSlots() // Refresh the main slots list
      fetchAllSlots() // Refresh the provider list and all slots for randomizer
    }
  }

  function selectBonusInOpening(index: number) {
    setCurrentOpeningIndex(index)
    const bonus = openingBonuses[index]
    setPayout(bonus.result?.toString() || "")
    setMultiplier(
      bonus.result && bonus.bet_size && bonus.bet_size !== 0 ? (bonus.result / bonus.bet_size).toFixed(2) : "0.00",
    )
    setSpinsUsed("")

    setTimeout(() => {
      const input = document.getElementById("payout_input")
      if (input) input.focus()
    }, 50)
  }

  async function copySlotName() {
    if (finalSlot) {
      navigator.clipboard.writeText(finalSlot.game_name)
      toast({
        title: "Copied!",
        description: `"${finalSlot.game_name}" copied to clipboard`,
        className: "bg-green-600 text-white",
      })
    }
  }

  async function loadPastHunt(hunt: PastHunt) {
    try {
      const bonuses = typeof hunt.bonuses === "string" ? JSON.parse(hunt.bonuses) : hunt.bonuses

      // Clear existing hunts (excluding the temp holder) before loading
      await supabase.from("bonus_hunts").delete().neq("game_name", "_temp_balance_holder")

      // Ensure temp holder exists or create it with the hunt's balances
      const { data: existingHolder } = await supabase
        .from("bonus_hunts")
        .select("*")
        .eq("game_name", "_temp_balance_holder")
        .single()

      if (existingHolder) {
        await supabase
          .from("bonus_hunts")
          .update({
            starting_balance: hunt.starting_balance,
            opening_balance: hunt.opening_balance,
          })
          .eq("id", existingHolder.id)
      } else {
        await supabase.from("bonus_hunts").insert([
          {
            game_name: "_temp_balance_holder",
            provider: null,
            bet_size: 0,
            result: 0,
            starting_balance: hunt.starting_balance,
            opening_balance: hunt.opening_balance,
          },
        ])
      }

      // Insert the loaded bonuses
      const { error } = await supabase.from("bonus_hunts").insert([
        ...bonuses.map((b: any) => ({ ...b, id: undefined })), // Remove id to let DB generate new ones
      ])

      if (error) {
        console.error("[v0] Error loading past hunt:", error)
        toast({
          title: "Error",
          description: "Failed to load hunt",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: `Hunt "${hunt.hunt_name}" loaded successfully`,
          className: "bg-green-600 text-white",
        })
        await fetchBonusHunts()
        setActiveTab("current") // Switch back to current hunt view
      }
    } catch (err) {
      console.error("[v0] Error processing past hunt data:", err)
      toast({
        title: "Error",
        description: "Failed to process hunt data",
        variant: "destructive",
      })
    }
  }

  async function deletePastHunt(huntId: string) {
    const { error } = await supabase.from("past_bonushunts").delete().eq("id", huntId)

    if (error) {
      console.error("[v0] Error deleting past hunt:", error)
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
      fetchPastHunts()
    }
  }

  function startEditingPastHunt(hunt: PastHunt) {
    setEditingPastHunt(hunt.id)
    setEditPastHuntData({
      hunt_name: hunt.hunt_name,
      status: hunt.status || "Active",
    })
  }

  async function saveEditedPastHunt(huntId: string) {
    const { error } = await supabase
      .from("past_bonushunts")
      .update({
        hunt_name: editPastHuntData.hunt_name,
        status: editPastHuntData.status,
      })
      .eq("id", huntId)

    if (error) {
      console.error("[v0] Error updating past hunt:", error)
      toast({
        title: "Error",
        description: "Failed to update hunt",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Hunt updated successfully",
        className: "bg-green-600 text-white",
      })
      setEditingPastHunt(null)
      setEditPastHuntData({ hunt_name: "", status: "Active" })
      fetchPastHunts()
    }
  }

  function cancelEditingPastHunt() {
    setEditingPastHunt(null)
    setEditPastHuntData({ hunt_name: "", status: "Active" })
  }

  function startEditingPastBonus(
    huntId: string,
    bonusIndex: number,
    field: "bet_size" | "result",
    currentValue: number | null,
  ) {
    setEditingPastBonus({ huntId, bonusIndex, field })
    setEditPastBonusValue(currentValue?.toString() || "")
  }

  async function saveEditedPastBonus() {
    if (!editingPastBonus) return

    const value = Number.parseFloat(editPastBonusValue)
    if (isNaN(value)) {
      toast({
        title: "Error",
        description: "Please enter a valid number",
        variant: "destructive",
      })
      return
    }

    const hunt = pastHunts.find((h) => h.id === editingPastBonus.huntId)
    if (!hunt) return

    const bonuses = typeof hunt.bonuses === "string" ? JSON.parse(hunt.bonuses) : hunt.bonuses
    bonuses[editingPastBonus.bonusIndex][editingPastBonus.field] = value

    const totalBetSize = bonuses.reduce((sum: number, b: any) => sum + Number(b.bet_size), 0)
    const totalResult = bonuses.reduce((sum: number, b: any) => sum + (Number(b.result) || 0), 0)
    const profitLoss = totalResult - hunt.starting_balance

    const { error } = await supabase
      .from("past_bonushunts")
      .update({
        bonuses: JSON.stringify(bonuses),
        total_bet_size: totalBetSize,
        total_result: totalResult,
        profit_loss: profitLoss,
      })
      .eq("id", editingPastBonus.huntId)

    if (error) {
      console.error("[v0] Error updating past hunt bonus:", error)
      toast({
        title: "Error",
        description: "Failed to update bonus",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Bonus updated successfully",
        className: "bg-green-600 text-white",
      })
      setEditingPastBonus(null)
      setEditPastBonusValue("")
      fetchPastHunts()
    }
  }

  function cancelEditingPastBonus() {
    setEditingPastBonus(null)
    setEditPastBonusValue("")
  }

  function handleProviderToggle(provider: string) {
    if (provider === "All") {
      // If 'All' is selected, set only 'All'
      setSelectedProviders(["All"])
    } else {
      // If a specific provider is selected
      const newProviders = selectedProviders.includes(provider)
        ? selectedProviders.filter((p) => p !== provider) // Remove if already selected
        : [...selectedProviders.filter((p) => p !== "All"), provider] // Add, and remove 'All' if present

      // If the selection becomes empty after removal, default back to 'All'
      setSelectedProviders(newProviders.length === 0 ? ["All"] : newProviders)
    }
  }

  async function generateRandomSlot() {
    if (isRolling) return

    setIsRolling(true)
    setFinalSlot(null)
    setCurrentSlot(null)

    // Filter slots based on selected providers
    const filteredSlotsForRandomizer = selectedProviders.includes("All")
      ? allSlots
      : allSlots.filter((s) => s.provider && selectedProviders.includes(s.provider))

    if (filteredSlotsForRandomizer.length === 0) {
      toast({
        title: "No slots found",
        description: "No slots available for the selected providers",
        variant: "destructive",
      })
      setIsRolling(false)
      return
    }

    // Update database to indicate rolling state
    const { error: startError } = await supabase.from("random_slot_state").upsert(
      {
        id: 1,
        is_rolling: true,
        current_slot_name: null,
        current_slot_provider: null,
        final_slot_name: null,
        final_slot_provider: null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }, // Ensure it updates if row exists
    )

    if (startError) {
      console.error("[v0] Error starting random slot roll in DB:", startError)
      // Continue rolling locally even if DB update fails, but log the error
    }

    // Animation logic
    const maxIterations = 60
    const totalDuration = 8000 // Total time for animation in ms

    function getDelay(iteration: number): number {
      const progress = iteration / maxIterations
      // Use an easing function (e.g., cubic ease-out) for a smoother animation
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      return 20 + easedProgress * 580 // Base delay + easing effect
    }

    const delays: number[] = []
    let totalCalculated = 0
    for (let i = 0; i < maxIterations; i++) {
      const delay = getDelay(i)
      delays.push(delay)
      totalCalculated += delay
    }

    // Scale delays to fit the totalDuration precisely
    const scaleFactor = totalDuration / totalCalculated
    const scaledDelays = delays.map((d) => d * scaleFactor)

    let iterations = 0

    async function runIteration() {
      if (iterations >= maxIterations) {
        // Animation finished
        setCurrentSlot(null) // Clear current slot display
        setFinalSlot(filteredSlotsForRandomizer[Math.floor(Math.random() * filteredSlotsForRandomizer.length)]) // Pick a final random slot
        setIsRolling(false)

        // Update database with the final slot
        const { error: finalError } = await supabase.from("random_slot_state").upsert(
          {
            id: 1,
            is_rolling: false,
            current_slot_name: null,
            current_slot_provider: null,
            final_slot_name: finalSlot.game_name,
            final_slot_provider: finalSlot.provider,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        )

        if (finalError) {
          console.error("[v0] Error setting final slot in DB:", finalError)
        }
        return
      }

      const randomSlot = filteredSlotsForRandomizer[Math.floor(Math.random() * filteredSlotsForRandomizer.length)]
      setCurrentSlot(randomSlot)

      // Update database with current rolling slot
      await supabase.from("random_slot_state").upsert(
        {
          id: 1,
          is_rolling: true,
          current_slot_name: randomSlot.game_name,
          current_slot_provider: randomSlot.provider,
          final_slot_name: null, // Keep final slot null while rolling
          final_slot_provider: null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      )

      iterations++
      const nextDelay = scaledDelays[iterations - 1] || 100 // Use calculated delay, fallback to 100ms
      setTimeout(runIteration, nextDelay)
    }

    runIteration() // Start the animation loop
  }

  function handleDragStart(index: number) {
    setDraggedIndex(index)
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newBonusHunts = [...bonusHunts]
    const draggedItem = newBonusHunts[draggedIndex]
    newBonusHunts.splice(draggedIndex, 1)
    newBonusHunts.splice(index, 0, draggedItem)

    setBonusHunts(newBonusHunts)
    setDraggedIndex(index) // Update the index of the dragged item
  }

  async function handleDragEnd() {
    if (draggedIndex === null) return // No drag operation happened

    // Save the new order to the database
    const updates = bonusHunts.map((bonus, i) => ({
      ...bonus,
      // Update created_at to reflect the new order. This is important for maintaining sort order.
      created_at: new Date(Date.now() + i * 1000).toISOString(),
    }))

    const { error } = await supabase.from("bonus_hunts").upsert(updates)

    if (error) {
      console.error("[v0] Error saving order:", error)
      toast({
        title: "Error",
        description: "Failed to save bonus order",
        variant: "destructive",
      })
      // Optionally re-fetch to restore original order if save fails
      await fetchBonusHunts()
    } else {
      toast({
        title: "Success",
        description: "Bonus order saved",
        className: "bg-green-600 text-white",
      })
    }
    setDraggedIndex(null) // Reset drag index
  }

  // Store Management handlers
  async function handleCreateItem(e: React.FormEvent) {
    e.preventDefault()

    const costValue = Number.parseFloat(newItem.cost)
    const quantityValue = newItem.quantity ? Number.parseInt(newItem.quantity) : null

    if (isNaN(costValue) || (newItem.quantity && isNaN(quantityValue!))) {
      toast({ description: "Please enter valid numbers for cost and quantity.", variant: "destructive" })
      return
    }

    const { error } = await supabase.from("store_items").insert({
      name: newItem.name,
      description: newItem.description,
      cost: costValue,
      type: newItem.type,
      quantity: quantityValue,
      icon: newItem.icon,
    })

    if (error) {
      console.error("[v0] Error creating store item:", error)
      toast({
        title: "Error",
        description: "Failed to create item",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Item created successfully",
    })

    // Reset form fields
    setNewItem({
      name: "",
      description: "",
      cost: "",
      type: "reward",
      quantity: "",
      icon: "gift",
    })

    fetchStoreItems() // Refresh the list of items
  }

  async function handleUpdateItem(itemId: string) {
    if (!editItemData) return

    const costValue = Number.parseFloat(editItemData.cost.toString()) // Ensure cost is a number
    const quantityValue = editItemData.quantity !== null ? Number.parseInt(editItemData.quantity.toString()) : null

    if (isNaN(costValue) || (editItemData.quantity !== null && isNaN(quantityValue!))) {
      toast({ description: "Please enter valid numbers for cost and quantity.", variant: "destructive" })
      return
    }

    const { error } = await supabase
      .from("store_items")
      .update({
        name: editItemData.name,
        description: editItemData.description,
        cost: costValue,
        type: editItemData.type,
        quantity: quantityValue,
        icon: editItemData.icon,
      })
      .eq("id", itemId)

    if (error) {
      console.error("[v0] Error updating store item:", error)
      toast({
        title: "Error",
        description: "Failed to update item",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Item updated successfully",
    })

    setEditingItem(null) // Exit editing mode
    setEditItemData(null) // Clear edit data
    fetchStoreItems() // Refresh the list
  }

  async function handleDeleteItem(itemId: string) {
    const { error } = await supabase.from("store_items").delete().eq("id", itemId)

    if (error) {
      console.error("[v0] Error deleting store item:", error)
      toast({
        title: "Error",
        description: "Failed to delete item",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Item deleted successfully",
    })

    fetchStoreItems() // Refresh the list
  }

  async function handleUpdateRedemptionStatus(redemptionId: string, newStatus: string) {
    const { error } = await supabase.from("redemptions").update({ status: newStatus }).eq("id", redemptionId)

    if (error) {
      console.error("[v0] Error updating redemption status:", error)
      toast({
        title: "Error",
        description: "Failed to update redemption status",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Redemption status updated",
    })

    fetchRedemptions() // Refresh the list
  }

  async function handleAddRemovePoints(e: React.FormEvent) {
    e.preventDefault()

    if (!selectedUser || !pointsToAdd) {
      toast({
        title: "Error",
        description: "Please select a user and enter points amount",
        variant: "destructive",
      })
      return
    }

    const pointsValue = Number.parseFloat(pointsToAdd)
    const user = storeUsers.find((u) => u.id === selectedUser)

    if (!user) {
      toast({ title: "Error", description: "Selected user not found", variant: "destructive" })
      return
    }

    const newBalance = user.points_balance + pointsValue

    // Prevent points from going below zero if removing
    if (newBalance < 0) {
      toast({ title: "Error", description: "Cannot remove more points than the user has", variant: "destructive" })
      return
    }

    const { error } = await supabase.from("users").update({ points_balance: newBalance }).eq("id", selectedUser)

    if (error) {
      console.error("[v0] Error updating user points:", error)
      toast({
        title: "Error",
        description: "Failed to update user points",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: `${pointsValue >= 0 ? "Added" : "Removed"} ${Math.abs(pointsValue)} points ${pointsValue >= 0 ? "to" : "from"} ${user.username}`,
    })

    setSelectedUser("") // Reset selections
    setPointsToAdd("")
    fetchStoreUsers() // Refresh user list
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    )
  }

  if (!user) {
    // If user is not logged in, redirect to login page (handled by checkUser effect)
    return null
  }

  // Derived state for opening mode display
  const openedBonuses = openingBonuses.filter((b) => b.result !== null)
  const totalBonusesInOpening = openingBonuses.length
  const openedCount = openedBonuses.length

  // Use the starting balance from the temp holder or fetched startingBalance
  const currentStartingBalanceForCalc =
    bonusHunts.find((h) => h.game_name === "_temp_balance_holder")?.starting_balance ?? (Number(startingBalance) || 0)
  const totalWonInOpening = openedBonuses.reduce((sum, b) => sum + (Number(b.result) || 0), 0)
  const profitLossInOpening = totalWonInOpening - currentStartingBalanceForCalc

  const winRateInOpening =
    currentStartingBalanceForCalc > 0 ? (totalWonInOpening / currentStartingBalanceForCalc) * 100 : 0

  const remainingToOpen = openingBonuses.filter((b) => b.result === null)
  const remainingBetSize = remainingToOpen.reduce((sum, b) => sum + Number(b.bet_size), 0)
  const breakEvenX = remainingBetSize > 0 ? (currentStartingBalanceForCalc - totalWonInOpening) / remainingBetSize : 0

  let highestMultiplier = { amount: 0, game: "", multiplier: 0 }
  let highestWin = { amount: 0, game: "", multiplier: 0 }

  openedBonuses.forEach((bonus) => {
    const result = bonus.result ?? 0
    const betSize = bonus.bet_size ?? 0
    const mult = betSize > 0 ? result / betSize : 0

    if (mult > highestMultiplier.multiplier) {
      highestMultiplier = {
        amount: result,
        multiplier: mult,
        game: bonus.game_name,
      }
    }
    if (result > highestWin.amount) {
      highestWin = {
        amount: result,
        game: bonus.game_name,
        multiplier: mult,
      }
    }
  })

  // Statistics for Past Hunts Tab
  const totalHunts = pastHunts.length
  const profitableHunts = pastHunts.filter((h) => h.profit_loss > 0).length
  const pastHuntWinRate = totalHunts > 0 ? (profitableHunts / totalHunts) * 100 : 0
  const averageProfit = totalHunts > 0 ? pastHunts.reduce((sum, h) => sum + h.profit_loss, 0) / totalHunts : 0
  const biggestWin = pastHunts.length > 0 ? Math.max(...pastHunts.map((h) => h.profit_loss)) : 0

  // </CHANGE> Completely redesigned opening mode with compact, modern layout
  if (isOpeningMode && openingBonuses.length > 0) {
    const currentBonus = openingBonuses[currentOpeningIndex]

    if (!currentBonus) {
      // This state should ideally not be reached if openingBonuses has items
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
          <p className="text-white">Loading bonus...</p>
        </div>
      )
    }

    const progress = currentOpeningIndex + 1
    const total = openingBonuses.length

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3">
        <div className="container mx-auto max-w-7xl">
          {/* Compact Stats Bar */}
          <div className="bg-slate-900/60 backdrop-blur border border-slate-700/50 rounded-lg p-3 mb-4">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Start</p>
                <p className="text-white text-base font-bold">${currentStartingBalanceForCalc.toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-cyan-500 text-[10px] uppercase tracking-wider mb-0.5">Win</p>
                <p className="text-cyan-400 text-base font-bold">${totalWonInOpening.toFixed(0)}</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">P/L</p>
                <p className={`text-base font-bold ${profitLossInOpening >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {profitLossInOpening >= 0 ? "+" : ""}${profitLossInOpening.toFixed(0)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Bonuses</p>
                <p className="text-white text-base font-bold">
                  {openedCount}
                  <span className="text-slate-600 text-xs">/{totalBonusesInOpening}</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Win Rate</p>
                <p className="text-white text-base font-bold">{winRateInOpening.toFixed(1)}%</p>
              </div>
              <div className="text-center">
                <p className="text-slate-500 text-[10px] uppercase tracking-wider mb-0.5">Break Even</p>
                <p className="text-white text-base font-bold">{breakEvenX > 0 ? breakEvenX.toFixed(1) : "0.0"}x</p>
              </div>
            </div>
          </div>

          {/* Highest Stats Bar */}
          <div className="bg-gradient-to-r from-amber-900/20 to-purple-900/20 backdrop-blur border border-amber-700/30 rounded-lg p-2.5 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <div className="bg-amber-500/20 rounded p-1.5">
                  <TrendingUp className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <p className="text-amber-400/70 text-[10px] uppercase tracking-wider">Highest Multi</p>
                  <p className="text-amber-400 text-xs font-medium truncate">{highestMultiplier.game || "N/A"}</p>
                  <p className="text-amber-300 text-sm font-bold">
                    {highestMultiplier.multiplier.toFixed(2)}x
                    {highestWin.multiplier > 0 && (
                      <span className="text-xs ml-1">(${highestMultiplier.amount.toFixed(2)})</span>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-purple-500/20 rounded p-1.5">
                  <Sparkles className="w-4 h-4 text-purple-400" /> {/* Sparkles is now imported */}
                </div>
                <div>
                  <p className="text-purple-400/70 text-[10px] uppercase tracking-wider">Highest Win</p>
                  <p className="text-purple-400 text-xs font-medium truncate">{highestWin.game || "N/A"}</p>
                  <p className="text-purple-300 text-sm font-bold">
                    ${highestWin.amount.toFixed(2)}
                    {highestWin.multiplier > 0 && (
                      <span className="text-xs ml-1">({highestWin.multiplier.toFixed(0)}x)</span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Input Panel - Compact Left Side */}
            <div className="lg:col-span-2">
              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg font-bold">
                    Bonus {progress} of {total}
                  </CardTitle>
                  <p className="text-slate-400 text-sm mt-1 truncate">{currentBonus.game_name}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={() => {
                      navigator.clipboard.writeText(currentBonus.game_name)
                      toast({
                        title: "Copied!",
                        description: `"${currentBonus.game_name}" copied to clipboard`,
                        className: "bg-green-600 text-white",
                      })
                    }}
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent h-8"
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy Slot Name
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="payout_input" className="text-slate-400 text-xs">
                        Payout
                      </Label>
                      <Input
                        id="payout_input"
                        type="number"
                        step="0.01"
                        value={payout}
                        onChange={(e) => {
                          setPayout(e.target.value)
                          const payoutVal = Number.parseFloat(e.target.value)
                          if (!isNaN(payoutVal) && currentBonus.bet_size && currentBonus.bet_size !== 0) {
                            setMultiplier((payoutVal / currentBonus.bet_size).toFixed(2))
                          } else if (!isNaN(payoutVal)) {
                            setMultiplier("0.00") // Handle division by zero or no bet size
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveAndNextOpening()
                          if (e.key === "Escape") exitOpeningMode()
                        }}
                        className="bg-slate-950 border-slate-700 text-white h-9 text-sm"
                        placeholder="0.00"
                        autoFocus
                      />
                    </div>

                    <div>
                      <Label htmlFor="multiplier_input" className="text-slate-400 text-xs">
                        Multiplier
                      </Label>
                      <Input
                        id="multiplier_input"
                        type="number"
                        step="0.01"
                        value={multiplier}
                        disabled
                        className="bg-slate-950 border-slate-700 text-white h-9 text-sm"
                        placeholder="0.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="betsize_input" className="text-slate-400 text-xs">
                        Bet Size
                      </Label>
                      <Input
                        id="betsize_input"
                        type="number"
                        step="0.01"
                        value={currentBonus.bet_size}
                        disabled
                        className="bg-slate-950 border-slate-700 text-slate-400 h-9 text-sm"
                      />
                    </div>
                  </div>

                  <div className="pt-2 space-y-2">
                    <Button
                      onClick={saveAndNextOpening}
                      className="w-full h-9 bg-green-600 hover:bg-green-700 text-white text-sm font-medium"
                    >
                      Save & Continue <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>

                    <div className="grid grid-cols-2 gap-2">
                      {currentOpeningIndex > 0 && (
                        <Button
                          onClick={goBackBonus}
                          variant="outline"
                          size="sm"
                          className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent h-8"
                        >
                          <ArrowLeft className="w-3 h-3 mr-1" />
                          Back
                        </Button>
                      )}
                      <Button
                        onClick={exitOpeningMode}
                        variant="outline"
                        size="sm"
                        className={`border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white bg-transparent h-8 ${currentOpeningIndex === 0 ? "col-span-2" : ""}`}
                      >
                        Exit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Bonus Grid - Right Side */}
            <div className="lg:col-span-3">
              <div className="bg-slate-900/40 backdrop-blur border border-slate-700/50 rounded-lg p-3">
                <h2 className="text-white text-sm font-semibold mb-3 flex items-center gap-2">
                  <div className="w-1 h-4 bg-amber-500 rounded"></div>
                  All Bonuses
                </h2>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 gap-2">
                  {openingBonuses.map((bonus, index) => {
                    const isOpened = bonus.result !== null
                    const isCurrent = index === currentOpeningIndex

                    return (
                      <button
                        key={bonus.id}
                        onClick={() => selectBonusInOpening(index)}
                        className={`
                          relative aspect-square rounded border transition-all
                          ${
                            isCurrent
                              ? "border-2 border-amber-500 bg-amber-500/10 shadow-lg shadow-amber-500/20"
                              : isOpened
                                ? "border border-green-600/50 bg-green-900/20"
                                : "border border-slate-700 bg-slate-900/50"
                          }
                          hover:border-slate-500 hover:bg-slate-800/50
                        `}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center p-1">
                          <p className="text-white text-[9px] font-medium text-center line-clamp-2">
                            {bonus.game_name}
                          </p>
                          {isOpened && (
                            <div className="absolute top-0.5 right-0.5 bg-green-600 rounded-full p-0.5">
                              <Check className="w-2 h-2 text-white" />
                            </div>
                          )}
                          {isCurrent && (
                            <div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1 animate-pulse">
                              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-3">
      <div className="container mx-auto max-w-7xl">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Admin Panel</h1>
            <p className="text-slate-400 text-sm">Manage your bonus hunts</p>
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

        <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Save Bonus Hunt</DialogTitle>
              <DialogDescription className="text-slate-400">
                Enter a name for this bonus hunt to save it to your history.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="hunt_name" className="text-slate-300">
                Hunt Name
              </Label>
              <Input
                id="hunt_name"
                value={huntName}
                onChange={(e) => setHuntName(e.target.value)}
                placeholder="e.g., Epic Win Session"
                className="bg-slate-900 border-slate-700 text-white mt-2"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveHunt()
                }}
              />
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowSaveDialog(false)}
                className="border-slate-600 text-slate-300 hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button onClick={handleSaveHunt} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700">
                {isSaving ? "Saving..." : "Save Hunt"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="flex gap-2 mb-4 flex-wrap">
          <Button
            onClick={() => setActiveTab("current")}
            variant={activeTab === "current" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1.5 h-8 text-xs"
          >
            <Plus className="w-3 h-3" />
            Current Bonushunt
          </Button>
          <Button
            onClick={() => setActiveTab("statistics")}
            variant={activeTab === "statistics" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1.5 h-8 text-xs"
          >
            <BarChart3 className="w-3 h-3" />
            Statistics Settings
          </Button>
          <Button
            onClick={() => setActiveTab("edit-slots")}
            variant={activeTab === "edit-slots" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1.5 h-8 text-xs"
          >
            Edit Slots Database
          </Button>
          <Button
            onClick={() => setActiveTab("previous-hunts")}
            variant={activeTab === "previous-hunts" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1.5 h-8 text-xs"
          >
            <BarChart3 className="w-3 h-3" />
            Previous Hunts
          </Button>
          <Button
            onClick={() => setActiveTab("random-slot")}
            variant={activeTab === "random-slot" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1.5 h-8 text-xs"
          >
            <ShuffleIcon className="w-3 h-3" />
            Random Slot
          </Button>
          <Button
            onClick={() => setActiveTab("store-management")}
            variant={activeTab === "store-management" ? "default" : "outline"}
            size="sm"
            className="flex items-center gap-1.5 h-8 text-xs"
          >
            <ShoppingCart className="w-3 h-3" /> {/* ShoppingCart is now imported */}
            Store Management
          </Button>
        </div>

        {activeTab === "current" && (
          <div key="current">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Current Hunt</CardTitle>
                </CardHeader>
                <CardContent>
                  {bonusHunts.length === 0 ||
                  (bonusHunts.length === 1 && bonusHunts[0]?.game_name === "_temp_balance_holder") ? (
                    <p className="text-slate-400 text-center py-8 text-sm">No bonus hunts yet. Add one above.</p>
                  ) : (
                    <div className="space-y-2 max-h-[650px] overflow-y-auto">
                      {bonusHunts
                        .filter((h) => h.game_name !== "_temp_balance_holder")
                        .map((hunt, index) => (
                          <BonusItem
                            key={hunt.id}
                            hunt={hunt}
                            index={index}
                            editingField={editingField}
                            editValue={editValue}
                            isDeleting={isDeleting}
                            startEditing={startEditing}
                            saveEdit={saveEdit}
                            cancelEdit={cancelEdit}
                            setEditValue={setEditValue}
                            handleDelete={handleDeleteBonusHunt}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedIndex === index}
                          />
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "statistics" && (
          <div>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-white text-2xl font-bold mb-4">Statistics Settings</h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-base">Hunt Settings</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleStartingBalanceChange} className="space-y-3">
                        <div>
                          <Label htmlFor="starting_balance" className="text-slate-300 text-xs">
                            Starting Balance ($)
                          </Label>
                          <p className="text-[10px] text-slate-400 mb-1.5">
                            The amount of money you started the hunt with. This affects P/L calculations.
                          </p>
                          <Input
                            id="starting_balance"
                            type="number"
                            step="0.01"
                            value={startingBalance}
                            onChange={(e) => setStartingBalance(e.target.value)}
                            required
                            className="bg-slate-950 border-slate-700 text-white h-9 text-sm"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor="opening_balance" className="text-slate-300 text-xs">
                            Opening Balance ($)
                          </Label>
                          <p className="text-[10px] text-slate-400 mb-1.5">
                            The balance when you start opening bonuses. Affects break-even calculations.
                          </p>
                          <Input
                            id="opening_balance"
                            type="number"
                            step="0.01"
                            value={openingBalance}
                            onChange={(e) => setOpeningBalance(e.target.value)}
                            required
                            className="bg-slate-950 border-slate-700 text-white h-9 text-sm"
                            placeholder="0.00"
                          />
                        </div>

                        <Button type="submit" className="w-full h-9 text-sm">
                          Update Balances
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-base">Current Statistics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">Total Bonuses Added:</span>
                          <span className="text-white font-medium text-sm">
                            {bonusHunts.filter((h) => h.game_name !== "_temp_balance_holder").length}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">Starting Balance:</span>
                          <span className="text-white font-medium text-sm">
                            ${Number(startingBalance || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">Opening Balance:</span>
                          <span className="text-white font-medium text-sm">
                            ${Number(openingBalance || 0).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-base">Deposits & Withdrawals</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleUpdateDepositsWithdrawals} className="space-y-3">
                        <div>
                          <Label htmlFor="deposit_amount" className="text-slate-300 text-xs">
                            Deposit Amount ($)
                          </Label>
                          <p className="text-[10px] text-slate-400 mb-1.5">
                            Amount deposited (will be shown as negative in net calculation).
                          </p>
                          <Input
                            id="deposit_amount"
                            type="number"
                            step="0.01"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            required
                            className="bg-slate-950 border-slate-700 text-white h-9 text-sm"
                            placeholder="0.00"
                          />
                        </div>

                        <div>
                          <Label htmlFor="withdraw_amount" className="text-slate-300 text-xs">
                            Withdraw Amount ($)
                          </Label>
                          <p className="text-[10px] text-slate-400 mb-1.5">
                            Amount withdrawn (will be shown as positive in net calculation).
                          </p>
                          <Input
                            id="withdraw_amount"
                            type="number"
                            step="0.01"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            required
                            className="bg-slate-950 border-slate-700 text-white h-9 text-sm"
                            placeholder="0.00"
                          />
                        </div>

                        <Button type="submit" className="w-full h-9 text-sm">
                          Update Deposits/Withdrawals
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-base">Current Transactions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">Deposits:</span>
                          <span className="text-red-400 font-medium text-sm">
                            -${Number(depositAmount || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400 text-xs">Withdrawals:</span>
                          <span className="text-green-400 font-medium text-sm">
                            +${Number(withdrawAmount || 0).toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-slate-700">
                          <span className="text-slate-400 font-semibold text-xs">Net Balance Change:</span>
                          <span
                            className={`font-semibold text-sm ${
                              Number(withdrawAmount || 0) - Number(depositAmount || 0) >= 0
                                ? "text-green-400"
                                : "text-red-400"
                            }`}
                          >
                            {Number(withdrawAmount || 0) - Number(depositAmount || 0) >= 0 ? "+" : ""}$
                            {(Number(withdrawAmount || 0) - Number(depositAmount || 0)).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "edit-slots" && (
          <div>
            <div className="max-w-6xl mx-auto">
              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Edit Slots Database</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleAddSlot} className="space-y-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="new_slot_name" className="text-slate-300 text-xs">
                          Slot Name
                        </Label>
                        <Input
                          id="new_slot_name"
                          value={newSlotName}
                          onChange={(e) => setNewSlotName(e.target.value)}
                          className="bg-slate-950 border-slate-700 text-white h-9 text-sm mt-1"
                          placeholder="Enter slot name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new_slot_provider" className="text-slate-300 text-xs">
                          Provider
                        </Label>
                        <Input
                          id="new_slot_provider"
                          value={newSlotProvider}
                          onChange={(e) => setNewSlotProvider(e.target.value)}
                          className="bg-slate-950 border-slate-700 text-white h-9 text-sm mt-1"
                          placeholder="Enter provider"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-9 text-sm">
                      Add Slot to Database
                    </Button>
                  </form>

                  <div className="space-y-1.5 max-h-[500px] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 font-semibold text-slate-300 pb-2 border-b border-slate-700 text-xs">
                      <div>Slot</div>
                      <div>Provider</div>
                    </div>
                    {slots.map((slot) => (
                      <div
                        key={slot.id}
                        className="grid grid-cols-2 gap-4 text-white py-1.5 border-b border-slate-700/50 text-xs"
                      >
                        <div>{slot.game_name}</div>
                        <div className="text-slate-400">{slot.provider}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "previous-hunts" && (
          <div>
            <div className="max-w-6xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <Card className="bg-slate-800/80 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-slate-700 rounded-lg">
                        <BarChart3 className="w-6 h-6 text-slate-300" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Total Hunts</p>
                        <p className="text-white text-3xl font-bold">{totalHunts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/80 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-900/50 rounded-lg">
                        <Target className="w-6 h-6 text-green-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Win Rate</p>
                        <p className="text-green-400 text-3xl font-bold">{pastHuntWinRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/80 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-red-900/50 rounded-lg">
                        <DollarSign className="w-6 h-6 text-red-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Average Profit</p>
                        <p className={`text-3xl font-bold ${averageProfit >= 0 ? "text-green-400" : "text-red-400"}`}>
                          ${Math.abs(averageProfit).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-slate-800/80 border-slate-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-cyan-900/50 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-slate-400 text-sm font-medium">Biggest Win</p>
                        <p className="text-cyan-400 text-3xl font-bold">${biggestWin.toFixed(2)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                {pastHunts.length === 0 ? (
                  <Card className="bg-slate-800/50 border-slate-700">
                    <CardContent className="p-8 text-center">
                      <p className="text-slate-400">No past hunts saved yet</p>
                    </CardContent>
                  </Card>
                ) : (
                  pastHunts.map((hunt) => {
                    const isExpanded = expandedHuntId === hunt.id
                    const isEditing = editingPastHunt === hunt.id
                    const huntDate = new Date(hunt.created_at)
                    const bonuses = typeof hunt.bonuses === "string" ? JSON.parse(hunt.bonuses) : hunt.bonuses
                    const averageBetsize = hunt.total_bonuses > 0 ? hunt.total_bet_size / hunt.total_bonuses : 0

                    return (
                      <Card key={hunt.id} className="bg-slate-800/50 border-slate-700">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {isEditing ? (
                                  <div className="flex items-center gap-2">
                                    <Input
                                      value={editPastHuntData.hunt_name}
                                      onChange={(e) =>
                                        setEditPastHuntData({ ...editPastHuntData, hunt_name: e.target.value })
                                      }
                                      className="bg-slate-900 border-slate-700 text-white h-8"
                                    />
                                    <select
                                      value={editPastHuntData.status}
                                      onChange={(e) =>
                                        setEditPastHuntData({ ...editPastHuntData, status: e.target.value })
                                      }
                                      className="bg-slate-900 border border-slate-700 text-white rounded px-2 py-1 h-8"
                                    >
                                      <option value="Active">Active</option>
                                      <option value="Completed">Completed</option>
                                      <option value="Archived">Archived</option>
                                    </select>
                                    <Button
                                      size="sm"
                                      onClick={() => saveEditedPastHunt(hunt.id)}
                                      className="h-8 bg-green-600 hover:bg-green-700"
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={cancelEditingPastHunt}
                                      className="h-8 text-slate-400"
                                    >
                                      ✕
                                    </Button>
                                  </div>
                                ) : (
                                  <>
                                    <h3 className="text-white text-lg font-semibold">{hunt.hunt_name}</h3>
                                    <span
                                      className={`px-2 py-1 text-white text-xs rounded-full ${
                                        hunt.status === "Active"
                                          ? "bg-blue-600"
                                          : hunt.status === "Completed"
                                            ? "bg-green-600"
                                            : hunt.status === "Archived"
                                              ? "bg-slate-600"
                                              : "bg-green-600" // Default to green if status is unexpected
                                      }`}
                                    >
                                      {hunt.status || "Completed"}
                                    </span>
                                  </>
                                )}
                              </div>
                              <p className="text-slate-400 text-sm">
                                {huntDate.toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                                {" - "}
                                {huntDate.toLocaleTimeString("en-US", {
                                  hour: "numeric",
                                  minute: "2-digit",
                                  hour12: true,
                                })}
                              </p>
                            </div>

                            <div className="flex items-center gap-4">
                              <div className="text-center px-4 py-2 bg-slate-900/50 rounded-lg">
                                <p className="text-slate-400 text-xs mb-1">Starting</p>
                                <p className="text-white font-semibold">${hunt.starting_balance.toFixed(2)}</p>
                              </div>

                              <div className="text-center px-4 py-2 bg-slate-900/50 rounded-lg">
                                <p className="text-slate-400 text-xs mb-1">Ending</p>
                                <p className="text-white font-semibold">${hunt.total_result.toFixed(2)}</p>
                              </div>

                              <div className="text-center px-4 py-2 bg-slate-900/50 rounded-lg">
                                <p className="text-slate-400 text-xs mb-1">Profit</p>
                                <p
                                  className={`font-semibold ${hunt.profit_loss >= 0 ? "text-green-400" : "text-red-400"}`}
                                >
                                  ${Math.abs(hunt.profit_loss).toFixed(2)}
                                </p>
                              </div>

                              {!isEditing && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => startEditingPastHunt(hunt)}
                                  className="text-blue-400 hover:text-blue-300"
                                  title="Edit hunt name and status"
                                >
                                  <Edit className="w-4 h-4" /> {/* Edit is now imported */}
                                </Button>
                              )}

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setExpandedHuntId(isExpanded ? null : hunt.id)}
                                className="text-slate-400 hover:text-white"
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}{" "}
                                {/*ChevronUp and ChevronDown are now imported */}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deletePastHunt(hunt.id)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>

                          <div
                            className={`overflow-hidden transition-all duration-300 ease-in-out ${
                              isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
                            }`}
                          >
                            <div className="mt-4 pt-4 border-t border-slate-700">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                <div>
                                  <p className="text-slate-400 text-xs mb-1">Total Bonuses</p>
                                  <p className="text-white font-semibold">{hunt.total_bonuses}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 text-xs mb-1">Average Betsize</p>
                                  <p className="text-white font-semibold">${averageBetsize.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 text-xs mb-1">Total Result</p>
                                  <p className="text-white font-semibold">${hunt.total_result.toFixed(2)}</p>
                                </div>
                                <div>
                                  <p className="text-slate-400 text-xs mb-1">Opening Balance</p>
                                  <p className="text-white font-semibold">${hunt.opening_balance.toFixed(2)}</p>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h4 className="text-white font-medium mb-2">Bonuses</h4>
                                {bonuses.map((bonus: any, index: number) => {
                                  const multiplier =
                                    bonus.result && bonus.bet_size && bonus.bet_size !== 0
                                      ? bonus.result / bonus.bet_size
                                      : 0
                                  const isEditingBet =
                                    editingPastBonus?.huntId === hunt.id &&
                                    editingPastBonus?.bonusIndex === index &&
                                    editingPastBonus?.field === "bet_size"
                                  const isEditingResult =
                                    editingPastBonus?.huntId === hunt.id &&
                                    editingPastBonus?.bonusIndex === index &&
                                    editingPastBonus?.field === "result"

                                  return (
                                    <div
                                      key={index}
                                      className="bg-slate-900/50 p-3 rounded-lg grid grid-cols-[1fr_auto] gap-4 items-center"
                                    >
                                      <div>
                                        <p className="text-white font-medium">{bonus.game_name}</p>
                                        {bonus.provider && <p className="text-slate-400 text-xs">{bonus.provider}</p>}
                                      </div>
                                      <div className="grid grid-cols-3 gap-4 text-center">
                                        <div className="w-20">
                                          <p className="text-slate-400 text-xs mb-1">Bet</p>
                                          {isEditingBet ? (
                                            <div className="flex flex-col gap-1">
                                              <Input
                                                type="number"
                                                step="0.01"
                                                value={editPastBonusValue}
                                                onChange={(e) => setEditPastBonusValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") saveEditedPastBonus()
                                                  if (e.key === "Escape") cancelEditingPastBonus()
                                                }}
                                                className="h-6 text-xs bg-slate-800 border-slate-600 text-white"
                                                autoFocus
                                              />
                                              <div className="flex gap-1">
                                                <Button
                                                  size="sm"
                                                  onClick={saveEditedPastBonus}
                                                  className="h-5 px-1 text-xs"
                                                >
                                                  ✓
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={cancelEditingPastBonus}
                                                  className="h-5 px-1 text-xs"
                                                >
                                                  ✕
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            <p
                                              className="text-red-400 font-medium cursor-pointer hover:underline text-xs"
                                              onClick={() =>
                                                startEditingPastBonus(hunt.id, index, "bet_size", bonus.bet_size)
                                              }
                                            >
                                              ${Number(bonus.bet_size).toFixed(2)}
                                            </p>
                                          )}
                                        </div>
                                        <div className="w-20">
                                          <p className="text-slate-400 text-xs mb-1">Result</p>
                                          {isEditingResult ? (
                                            <div className="flex flex-col gap-1">
                                              <Input
                                                type="number"
                                                step="0.01"
                                                value={editPastBonusValue}
                                                onChange={(e) => setEditPastBonusValue(e.target.value)}
                                                onKeyDown={(e) => {
                                                  if (e.key === "Enter") saveEditedPastBonus()
                                                  if (e.key === "Escape") cancelEditingPastBonus()
                                                }}
                                                className="h-6 text-xs bg-slate-800 border-slate-600 text-white"
                                                autoFocus
                                              />
                                              <div className="flex gap-1">
                                                <Button
                                                  size="sm"
                                                  onClick={saveEditedPastBonus}
                                                  className="h-5 px-1 text-xs"
                                                >
                                                  ✓
                                                </Button>
                                                <Button
                                                  size="sm"
                                                  variant="ghost"
                                                  onClick={cancelEditingPastBonus}
                                                  className="h-5 px-1 text-xs"
                                                >
                                                  ✕
                                                </Button>
                                              </div>
                                            </div>
                                          ) : (
                                            <p
                                              className="text-green-400 font-medium cursor-pointer hover:underline text-xs"
                                              onClick={() =>
                                                startEditingPastBonus(hunt.id, index, "result", bonus.result)
                                              }
                                            >
                                              {bonus.result !== null ? `$${Number(bonus.result).toFixed(2)}` : "-"}
                                            </p>
                                          )}
                                        </div>
                                        <div className="w-24">
                                          <p className="text-slate-400 text-xs mb-1">Multi</p>
                                          <p className="text-amber-400 font-medium">
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
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "random-slot" && (
          <div>
            <div className="max-w-6xl mx-auto">
              <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-lg">Random Slot Generator</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-4">
                    <Label className="text-slate-300 text-xs mb-2 block">Select Providers</Label>
                    <div className="flex flex-wrap gap-2">
                      {providers.map((provider) => (
                        <Button
                          key={provider}
                          variant={selectedProviders.includes(provider) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleProviderToggle(provider)}
                          className="h-8 text-xs"
                        >
                          {provider}
                        </Button>
                      ))}
                    </div>
                  </div>
                  <Button onClick={generateRandomSlot} disabled={isRolling} className="w-full h-10 text-sm">
                    {isRolling ? "Generating..." : "Generate Random Slot"}
                  </Button>

                  {(currentSlot || finalSlot) && (
                    <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                      <h3 className="text-white font-semibold mb-3 text-sm">Result</h3>
                      <div className="flex flex-col items-center justify-center gap-6">
                        {currentSlot && isRolling && (
                          <div className="text-center">
                            <p className="text-slate-400 text-sm mb-1">Rolling...</p>
                            <p className="text-white font-bold text-xl">{currentSlot.game_name}</p>
                            <p className="text-slate-400 text-xs">{currentSlot.provider || ""}</p>
                          </div>
                        )}
                        {finalSlot && !isRolling && (
                          <div className="text-center">
                            <p className="text-slate-400 text-sm mb-1">Final Slot</p>
                            <p className="text-amber-400 font-bold text-2xl">{finalSlot.game_name}</p>
                            <p className="text-amber-400 text-xs">{finalSlot.provider || ""}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={copySlotName}
                              className="mt-2 h-7 border-amber-600 text-amber-400 hover:bg-amber-900/30 bg-transparent"
                            >
                              <Copy className="w-3 h-3 mr-1" /> Copy
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
        )}

        {activeTab === "store-management" && (
          <div>
            <div className="max-w-6xl mx-auto">
              <h2 className="text-white text-2xl font-bold mb-4">Store Management</h2>

              <div className="flex gap-2 mb-4">
                <Button
                  onClick={() => setStoreSubTab("items")}
                  variant={storeSubTab === "items" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1.5 h-8 text-xs"
                >
                  <Package className="w-3 h-3" />
                  Items
                </Button>
                <Button
                  onClick={() => setStoreSubTab("redemptions")}
                  variant={storeSubTab === "redemptions" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1.5 h-8 text-xs"
                >
                  <Gift className="w-3 h-3" />
                  Redemptions
                </Button>
                <Button
                  onClick={() => setStoreSubTab("users")}
                  variant={storeSubTab === "users" ? "default" : "outline"}
                  size="sm"
                  className="flex items-center gap-1.5 h-8 text-xs"
                >
                  <UsersIcon className="w-3 h-3" />
                  Users
                </Button>
              </div>

              {storeSubTab === "items" && (
                <div className="space-y-4">
                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg">Create New Item</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleCreateItem} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="item_name" className="text-slate-300 text-xs">
                              Item Name
                            </Label>
                            <Input
                              id="item_name"
                              value={newItem.name}
                              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                              required
                              className="bg-slate-950 border-slate-700 text-white h-9 text-sm mt-1"
                              placeholder="Enter item name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="item_cost" className="text-slate-300 text-xs">
                              Cost (Points)
                            </Label>
                            <Input
                              id="item_cost"
                              type="number"
                              step="1"
                              value={newItem.cost}
                              onChange={(e) => setNewItem({ ...newItem, cost: e.target.value })}
                              required
                              className="bg-slate-950 border-slate-700 text-white h-9 text-sm mt-1"
                              placeholder="0"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="item_description" className="text-slate-300 text-xs">
                            Description
                          </Label>
                          <Textarea
                            id="item_description"
                            value={newItem.description}
                            onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                            required
                            className="bg-slate-950 border-slate-700 text-white text-sm mt-1"
                            placeholder="Enter item description"
                            rows={3}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <div>
                            <Label htmlFor="item_type" className="text-slate-300 text-xs">
                              Type
                            </Label>
                            <Select
                              value={newItem.type}
                              onValueChange={(value) => setNewItem({ ...newItem, type: value })}
                            >
                              <SelectTrigger className="bg-slate-950 border-slate-700 text-white h-9 text-sm mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="reward">Reward</SelectItem>
                                <SelectItem value="physical">Physical</SelectItem>
                                <SelectItem value="digital">Digital</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="item_quantity" className="text-slate-300 text-xs">
                              Quantity (Optional)
                            </Label>
                            <Input
                              id="item_quantity"
                              type="number"
                              step="1"
                              value={newItem.quantity}
                              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                              className="bg-slate-950 border-slate-700 text-white h-9 text-sm mt-1"
                              placeholder="Unlimited"
                            />
                          </div>
                          <div>
                            <Label htmlFor="item_icon" className="text-slate-300 text-xs">
                              Icon
                            </Label>
                            <Input
                              id="item_icon"
                              value={newItem.icon}
                              onChange={(e) => setNewItem({ ...newItem, icon: e.target.value })}
                              className="bg-slate-950 border-slate-700 text-white h-9 text-sm mt-1"
                              placeholder="gift"
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full h-9 text-sm">
                          Create Item
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg">Store Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {storeItems.length === 0 ? (
                        <p className="text-slate-400 text-center py-6 text-sm">No items yet</p>
                      ) : (
                        <div className="space-y-2">
                          {storeItems.map((item) => (
                            <div key={item.id} className="bg-slate-800/50 p-3 rounded-lg">
                              {editingItem === item.id ? (
                                <div className="space-y-2">
                                  <Input
                                    value={editItemData?.name || ""}
                                    onChange={(e) =>
                                      setEditItemData(editItemData ? { ...editItemData, name: e.target.value } : null)
                                    }
                                    className="bg-slate-950 border-slate-700 text-white h-8 text-sm"
                                  />
                                  <Textarea
                                    value={editItemData?.description || ""}
                                    onChange={(e) =>
                                      setEditItemData(
                                        editItemData ? { ...editItemData, description: e.target.value } : null,
                                      )
                                    }
                                    className="bg-slate-950 border-slate-700 text-white text-sm"
                                    rows={2}
                                  />
                                  <div className="grid grid-cols-3 gap-2">
                                    <Input
                                      type="number"
                                      value={editItemData?.cost || 0}
                                      onChange={(e) =>
                                        setEditItemData(
                                          editItemData
                                            ? { ...editItemData, cost: Number.parseFloat(e.target.value) }
                                            : null,
                                        )
                                      }
                                      className="bg-slate-950 border-slate-700 text-white h-8 text-sm"
                                    />
                                    <Input
                                      type="number"
                                      value={editItemData?.quantity === null ? "" : editItemData?.quantity || ""}
                                      onChange={(e) =>
                                        setEditItemData(
                                          editItemData
                                            ? {
                                                ...editItemData,
                                                quantity:
                                                  e.target.value === "" ? null : Number.parseInt(e.target.value),
                                              }
                                            : null,
                                        )
                                      }
                                      className="bg-slate-950 border-slate-700 text-white h-8 text-sm"
                                      placeholder="Qty"
                                    />
                                    <Input
                                      value={editItemData?.icon || ""}
                                      onChange={(e) =>
                                        setEditItemData(editItemData ? { ...editItemData, icon: e.target.value } : null)
                                      }
                                      className="bg-slate-950 border-slate-700 text-white h-8 text-sm"
                                      placeholder="Icon"
                                    />
                                  </div>
                                  <div className="flex gap-2">
                                    <Button
                                      onClick={() => handleUpdateItem(item.id)}
                                      size="sm"
                                      className="flex-1 h-8 text-xs"
                                    >
                                      <Save className="w-3 h-3 mr-1" />
                                      Save
                                    </Button>
                                    <Button
                                      onClick={() => {
                                        setEditingItem(null)
                                        setEditItemData(null)
                                      }}
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 h-8 text-xs"
                                    >
                                      <X className="w-3 h-3 mr-1" />
                                      Cancel
                                    </Button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <h3 className="text-white font-medium text-sm">{item.name}</h3>
                                      <p className="text-slate-400 text-xs mt-1">{item.description}</p>
                                    </div>
                                    <div className="flex gap-1">
                                      <Button
                                        onClick={() => {
                                          setEditingItem(item.id)
                                          setEditItemData(item)
                                        }}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-cyan-400 hover:text-cyan-300"
                                      >
                                        <Edit2 className="w-3 h-3" />
                                      </Button>
                                      <Button
                                        onClick={() => handleDeleteItem(item.id)}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="flex gap-4 text-xs">
                                    <div>
                                      <span className="text-slate-400">Cost:</span>
                                      <span className="text-amber-400 font-medium ml-1">{item.cost} pts</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">Type:</span>
                                      <span className="text-white ml-1">{item.type}</span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">Qty:</span>
                                      <span className="text-white ml-1">
                                        {item.quantity === null ? "∞" : item.quantity}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {storeSubTab === "redemptions" && (
                <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-white text-lg">Redemptions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {redemptions.length === 0 ? (
                      <p className="text-slate-400 text-center py-6 text-sm">No redemptions yet</p>
                    ) : (
                      <div className="space-y-2">
                        {redemptions.map((redemption) => (
                          <div key={redemption.id} className="bg-slate-800/50 p-3 rounded-lg">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1">
                                <h3 className="text-white font-medium text-sm">{redemption.item_name}</h3>
                                <p className="text-slate-400 text-xs mt-1">
                                  User: {redemption.username} • Cost: {redemption.cost} pts
                                </p>
                                <p className="text-slate-500 text-[10px] mt-1">
                                  {new Date(redemption.created_at).toLocaleString()}
                                </p>
                              </div>
                              <div>
                                <Select
                                  value={redemption.status}
                                  onValueChange={(value) => handleUpdateRedemptionStatus(redemption.id, value)}
                                >
                                  <SelectTrigger className="bg-slate-950 border-slate-700 text-white h-8 text-xs w-32">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="processing">Processing</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="cancelled">Cancelled</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`px-2 py-1 rounded text-[10px] font-medium ${
                                  redemption.status === "completed"
                                    ? "bg-green-900/30 text-green-400"
                                    : redemption.status === "processing"
                                      ? "bg-blue-900/30 text-blue-400"
                                      : redemption.status === "cancelled"
                                        ? "bg-red-900/30 text-red-400"
                                        : "bg-amber-900/30 text-amber-400"
                                }`}
                              >
                                {redemption.status.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {storeSubTab === "users" && (
                <div className="space-y-4">
                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg">Add/Remove Points</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleAddRemovePoints} className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label htmlFor="select_user" className="text-slate-300 text-xs">
                              Select User
                            </Label>
                            <Select value={selectedUser} onValueChange={setSelectedUser}>
                              <SelectTrigger className="bg-slate-950 border-slate-700 text-white h-9 text-sm mt-1">
                                <SelectValue placeholder="Choose a user" />
                              </SelectTrigger>
                              <SelectContent>
                                {storeUsers.map((user) => (
                                  <SelectItem key={user.id} value={user.id}>
                                    {user.username} ({user.points_balance} pts)
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="points_amount" className="text-slate-300 text-xs">
                              Points Amount
                            </Label>
                            <Input
                              id="points_amount"
                              type="number"
                              step="1"
                              value={pointsToAdd}
                              onChange={(e) => setPointsToAdd(e.target.value)}
                              required
                              className="bg-slate-950 border-slate-700 text-white h-9 text-sm mt-1"
                              placeholder="Use negative to remove"
                            />
                          </div>
                        </div>
                        <Button type="submit" className="w-full h-9 text-sm">
                          <DollarSign className="w-3 h-3 mr-1" />
                          Update Points
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="bg-slate-900/60 border-slate-700/50 backdrop-blur">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-white text-lg">All Users</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {storeUsers.length === 0 ? (
                        <p className="text-slate-400 text-center py-6 text-sm">No users yet</p>
                      ) : (
                        <div className="space-y-2">
                          {storeUsers.map((user) => (
                            <div
                              key={user.id}
                              className="bg-slate-800/50 p-3 rounded-lg flex items-center justify-between"
                            >
                              <div>
                                <h3 className="text-white font-medium text-sm">{user.username}</h3>
                                <p className="text-slate-400 text-xs mt-1">Kick ID: {user.kick_id}</p>
                                <p className="text-slate-500 text-[10px] mt-1">
                                  Joined: {new Date(user.created_at).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-amber-400 font-bold text-lg">{user.points_balance}</p>
                                <p className="text-slate-400 text-[10px]">points</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function BonusItem({
  hunt,
  index,
  editingField,
  editValue,
  isDeleting,
  startEditing,
  saveEdit,
  cancelEdit,
  setEditValue,
  handleDelete,
  onDragStart,
  onDragOver,
  onDragEnd,
  isDragging,
}: any) {
  // Calculate multiplier, handle division by zero or null bet_size/result
  const multiplier =
    hunt.result && hunt.bet_size && hunt.bet_size !== 0
      ? (Number(hunt.result) / Number(hunt.bet_size)).toFixed(2)
      : null

  return (
    <div
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={(e) => onDragOver(e, index)}
      onDragEnd={onDragEnd}
      className={`bg-slate-900/50 p-3 rounded-lg border border-slate-700 hover:border-slate-600 transition-all ${
        isDragging ? "opacity-50 scale-95" : ""
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 flex-1">
          <button className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing">
            <GripVertical className="w-4 h-4" />
          </button>
          <div className="flex-1">
            <h3 className="text-white font-medium text-sm">
              {hunt.game_name} {hunt.provider && <span className="text-slate-400 text-xs">({hunt.provider})</span>}
            </h3>
          </div>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => handleDelete(hunt.id)}
          disabled={isDeleting === hunt.id}
          className="text-red-400 hover:text-red-300 h-7"
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
      <div className="flex gap-3 text-sm">
        <div className="flex-1">
          <p className="text-slate-400 text-xs mb-1">Bet</p>
          {editingField?.id === hunt.id && editingField.field === "bet_size" ? (
            <div className="flex gap-1">
              <Input
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit()
                  if (e.key === "Escape") cancelEdit()
                }}
                className="h-6 text-xs bg-slate-800 border-slate-600 text-white"
                autoFocus
              />
              <Button size="sm" onClick={saveEdit} className="h-6 px-2 text-xs">
                <Check className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-6 px-2 text-xs">
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <p
              className="text-red-400 font-medium cursor-pointer hover:underline text-xs"
              onClick={() => startEditing(hunt.id, "bet_size", hunt.bet_size)}
            >
              ${Number(hunt.bet_size).toFixed(2)}
            </p>
          )}
        </div>
        <div className="flex-1">
          <p className="text-slate-400 text-xs mb-1">Result</p>
          {editingField?.id === hunt.id && editingField.field === "result" ? (
            <div className="flex gap-1">
              <Input
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit()
                  if (e.key === "Escape") cancelEdit()
                }}
                className="h-6 text-xs bg-slate-800 border-slate-600 text-white"
                autoFocus
              />
              <Button size="sm" onClick={saveEdit} className="h-6 px-2 text-xs">
                <Check className="w-3 h-3" />
              </Button>
              <Button size="sm" variant="ghost" onClick={cancelEdit} className="h-6 px-2 text-xs">
                <X className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <p
              className="text-green-400 font-medium cursor-pointer hover:underline text-xs"
              onClick={() => startEditing(hunt.id, "result", hunt.result)}
            >
              {hunt.result !== null ? `$${Number(hunt.result).toFixed(2)}` : "-"}
            </p>
          )}
        </div>
        {multiplier !== null && (
          <div className="flex-1">
            <p className="text-slate-400 text-xs mb-1">Multi</p>
            <p className="text-amber-400 font-medium text-xs">{multiplier}x</p>
          </div>
        )}
      </div>
    </div>
  )
}
