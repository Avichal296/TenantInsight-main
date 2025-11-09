"use client"

import { motion } from "framer-motion"
import DashboardNav from "@/components/dashboard-nav"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExpandableTabs } from "@/components/ui/expandable-tabs"
import { Plus, Search, Trash2, Edit, AlertCircle, FileText, Clock, CheckCircle, Bell, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { leasesApi } from "@/lib/api"

interface Lease {
  id: string
  tenant_id: string
  property_id: string
  unit_number?: string
  start_date: string
  end_date: string
  monthly_rent: number
  security_deposit: number
  status: string
  created_at: string
  tenants: {
    name?: string
    first_name: string
    last_name: string
    email?: string
  }
}

export default function LeasesPage() {
  const { user } = useAuth()
  const [leases, setLeases] = useState<Lease[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtered, setFiltered] = useState<Lease[]>([])
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    { title: "All Leases", icon: FileText },
    { title: "Active", icon: CheckCircle },
    { title: "Expiring Soon", icon: Clock },
    { type: "separator" as const },
    { title: "Renewals", icon: Bell },
  ]

  // Fetch leases from API
  useEffect(() => {
    const fetchLeases = async () => {
      if (!user) return

      try {
        setLoading(true)
        const result = await leasesApi.getAll()
        if (result.error) {
          setError(result.error)
        } else {
          setLeases(result.data || [])
          setFiltered(result.data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchLeases()
  }, [user])

  // Handle tab changes
  const handleTabChange = (index: number) => {
    setActiveTab(index)
    let filteredLeases = leases

    if (index === 0) {
      // All Leases
      filteredLeases = leases
    } else if (index === 1) {
      // Active
      filteredLeases = leases.filter(lease => lease.status === 'active')
    } else if (index === 2) {
      // Expiring Soon - leases ending within 30 days
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)
      filteredLeases = leases.filter(lease => {
        const endDate = new Date(lease.end_date)
        return endDate <= thirtyDaysFromNow && lease.status === 'active'
      })
    }

    setFiltered(filteredLeases)
  }

  // Calculate days left until lease expires
  const calculateDaysLeft = (endDate: string) => {
    const end = new Date(endDate)
    const today = new Date()
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Handle delete lease
  const handleDeleteLease = async (leaseId: string) => {
    if (!confirm('Are you sure you want to delete this lease? This action cannot be undone.')) {
      return
    }

    try {
      const result = await leasesApi.delete(leaseId)
      if (result.error) {
        alert('Failed to delete lease: ' + result.error)
      } else {
        // Refresh the leases list
        const fetchResult = await leasesApi.getAll()
        if (fetchResult.error) {
          setError(fetchResult.error)
        } else {
          setLeases(fetchResult.data || [])
          setFiltered(fetchResult.data || [])
        }
        alert('Lease deleted successfully')
      }
    } catch (err) {
      alert('An error occurred while deleting the lease')
    }
  }

  // Filter leases based on search term
  const searchFiltered = filtered.filter(
    (lease) => {
      const tenantName = lease.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : 'Unknown Tenant'
      return tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             (lease.unit_number && lease.unit_number.includes(searchTerm))
    },
  )

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  }

  const stagger = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-orange-50/30 via-amber-50/20 to-yellow-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <DashboardNav />
        <div className="flex">
          <DashboardSidebar />
          <main className="flex-1 p-6 md:p-8">
            <div className="max-w-7xl mx-auto">
              <motion.div
                className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <motion.h1
                  className="text-3xl font-bold text-foreground mb-4 md:mb-0"
                  variants={fadeInUp}
                >
                  Leases
                </motion.h1>
                <motion.div
                  className="flex items-center gap-4"
                  variants={fadeInUp}
                >
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-hover:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search leases..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 hover:border-primary/50"
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="gap-2" onClick={() => {/* TODO: Open create lease modal */}}>
                      <Plus className="w-4 h-4" />
                      Create Lease
                    </Button>
                  </motion.div>
                </motion.div>
              </motion.div>

              <motion.div
                className="mb-8"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <ExpandableTabs
                  tabs={tabs}
                  className="w-full md:w-auto"
                  activeColor="text-primary"
                  onChange={handleTabChange}
                />
              </motion.div>

              <motion.div
                variants={stagger}
                initial="initial"
                animate="animate"
              >
                <motion.div
                  variants={fadeInUp}
                  whileHover={{ y: -2 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className="p-6 mb-6 hover:shadow-lg transition-all duration-300">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin mr-2" />
                  Loading leases...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  Error: {error}
                </div>
              ) : searchFiltered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No leases found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Tenant</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Unit</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Start Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">End Date</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Days Left</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchFiltered.map((lease) => {
                        const daysLeft = calculateDaysLeft(lease.end_date)
                        const isExpiringSoon = daysLeft <= 30 && daysLeft > 0 && lease.status === 'active'

                        return (
                          <tr key={lease.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-3 px-4 text-foreground">
                              {lease.tenants ? `${lease.tenants.first_name} ${lease.tenants.last_name}` : 'Unknown Tenant'}
                            </td>
                            <td className="py-3 px-4 text-foreground font-medium">
                              {lease.unit_number || 'N/A'}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(lease.start_date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-muted-foreground">
                              {new Date(lease.end_date).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-4 text-foreground">
                              {daysLeft > 0 ? `${daysLeft} days` : 'Expired'}
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                {isExpiringSoon && <AlertCircle className="w-4 h-4 text-yellow-600" />}
                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    lease.status === 'active'
                                      ? isExpiringSoon
                                        ? "bg-yellow-500/10 text-yellow-700"
                                        : "bg-green-500/10 text-green-700"
                                      : "bg-gray-500/10 text-gray-700"
                                  }`}
                                >
                                  {lease.status === 'active' ? (isExpiringSoon ? 'Expiring Soon' : 'Active') : lease.status}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 flex gap-2">
                              <button
                                className="p-2 hover:bg-muted rounded transition-colors"
                                onClick={() => {/* TODO: Open edit lease modal */}}
                              >
                                <Edit className="w-4 h-4 text-muted-foreground" />
                              </button>
                              <button
                                className="p-2 hover:bg-muted rounded transition-colors"
                                onClick={() => handleDeleteLease(lease.id)}
                              >
                                <Trash2 className="w-4 h-4 text-destructive" />
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
                  </Card>
                </motion.div>
              </motion.div>
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  )
}
