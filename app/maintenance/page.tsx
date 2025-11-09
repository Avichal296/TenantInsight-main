"use client"

import { motion } from "framer-motion"
import DashboardNav from "@/components/dashboard-nav"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExpandableTabs } from "@/components/ui/expandable-tabs"
import { Plus, Search, Trash2, Edit, Clock, CheckCircle2, Wrench, AlertTriangle, CheckCircle, Bell, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { maintenanceApi } from "@/lib/api"

interface MaintenanceRequest {
  id: string
  property_id: string
  tenant_id?: string
  title: string
  description?: string
  category: string
  priority: string
  status: string
  scheduled_date?: string
  estimated_cost?: number
  actual_cost?: number
  created_at: string
  unit_number?: string
  tenants?: {
    first_name: string
    last_name: string
    email?: string
  }
}

export default function MaintenancePage() {
  const { user } = useAuth()
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtered, setFiltered] = useState<MaintenanceRequest[]>([])
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    { title: "All Issues", icon: Wrench },
    { title: "Pending", icon: Clock },
    { title: "In Progress", icon: AlertTriangle },
    { title: "Completed", icon: CheckCircle },
    { type: "separator" as const },
    { title: "Schedule", icon: Bell },
  ]

  // Fetch maintenance requests from API
  useEffect(() => {
    const fetchMaintenanceRequests = async () => {
      if (!user) return

      try {
        setLoading(true)
        const result = await maintenanceApi.getAll()
        if (result.error) {
          setError(result.error)
        } else {
          setMaintenanceRequests(result.data || [])
          setFiltered(result.data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchMaintenanceRequests()
  }, [user])

  // Handle tab changes
  const handleTabChange = (index: number) => {
    setActiveTab(index)
    let filteredRequests = maintenanceRequests

    if (index === 0) {
      // All Issues
      filteredRequests = maintenanceRequests
    } else if (index === 1) {
      // Pending
      filteredRequests = maintenanceRequests.filter(item => item.status === 'open')
    } else if (index === 2) {
      // In Progress
      filteredRequests = maintenanceRequests.filter(item => item.status === 'in_progress')
    } else if (index === 3) {
      // Completed
      filteredRequests = maintenanceRequests.filter(item => item.status === 'completed')
    }

    setFiltered(filteredRequests)
  }

  // Handle delete maintenance request
  const handleDeleteMaintenance = async (maintenanceId: string) => {
    if (!confirm('Are you sure you want to delete this maintenance request? This action cannot be undone.')) {
      return
    }

    try {
      const result = await maintenanceApi.delete(maintenanceId)
      if (result.error) {
        alert('Failed to delete maintenance request: ' + result.error)
      } else {
        // Refresh the maintenance requests list
        const fetchResult = await maintenanceApi.getAll()
        if (fetchResult.error) {
          setError(fetchResult.error)
        } else {
          setMaintenanceRequests(fetchResult.data || [])
          setFiltered(fetchResult.data || [])
        }
        alert('Maintenance request deleted successfully')
      }
    } catch (err) {
      alert('An error occurred while deleting the maintenance request')
    }
  }

  // Filter maintenance requests based on search term
  const searchFiltered = filtered.filter(
    (item) => {
      const tenantName = item.tenants ? `${item.tenants.first_name} ${item.tenants.last_name}` : 'No Tenant Assigned'
      return item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
             tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.unit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    },
  )

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500/10 text-red-700"
      case "high":
        return "bg-red-500/10 text-red-700"
      case "medium":
        return "bg-yellow-500/10 text-yellow-700"
      case "low":
        return "bg-green-500/10 text-green-700"
      default:
        return "bg-gray-500/10 text-gray-700"
    }
  }

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
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-red-50/30 via-rose-50/20 to-pink-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-red-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-rose-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-pink-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
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
                  Maintenance
                </motion.h1>
                <motion.div
                  className="flex items-center gap-4"
                  variants={fadeInUp}
                >
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-hover:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search maintenance issues..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 hover:border-primary/50"
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="gap-2" onClick={() => {/* TODO: Open create maintenance modal */}}>
                      <Plus className="w-4 h-4" />
                      Report Issue
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
                  Loading maintenance requests...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  Error: {error}
                </div>
              ) : searchFiltered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No maintenance requests found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Issue</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Tenant</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Priority</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Date Reported</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchFiltered.map((item) => (
                        <tr key={item.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 text-foreground">{item.title}</td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {item.tenants ? `${item.tenants.first_name} ${item.tenants.last_name}` : 'N/A'}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityColor(item.priority)}`}
                            >
                              {item.priority}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              {item.status === "completed" ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <Clock className="w-4 h-4 text-blue-600" />
                              )}
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                                  item.status === "completed"
                                    ? "bg-green-500/10 text-green-700"
                                    : item.status === "in_progress"
                                      ? "bg-blue-500/10 text-blue-700"
                                      : "bg-gray-500/10 text-gray-700"
                                }`}
                              >
                                {item.status.replace('_', ' ')}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {new Date(item.created_at).toLocaleDateString()}
                          </td>
                        <td className="py-3 px-4 flex gap-2">
                          <button
                            className="p-2 hover:bg-muted rounded transition-colors"
                            onClick={() => {/* TODO: Open edit maintenance modal */}}
                          >
                            <Edit className="w-4 h-4 text-muted-foreground" />
                          </button>
                          <button
                            className="p-2 hover:bg-muted rounded transition-colors"
                            onClick={() => handleDeleteMaintenance(item.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </button>
                        </td>
                        </tr>
                      ))}
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
