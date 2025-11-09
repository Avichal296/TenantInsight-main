"use client"

import { motion } from "framer-motion"
import DashboardNav from "@/components/dashboard-nav"
import DashboardSidebar from "@/components/dashboard-sidebar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ExpandableTabs } from "@/components/ui/expandable-tabs"
import { Plus, Search, Trash2, Edit, Users, UserCheck, UserX, Bell, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { tenantsApi } from "@/lib/api"

interface Tenant {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
  current_address?: string
  employment_status?: string
  created_at: string
}

export default function TenantsPage() {
  const { user } = useAuth()
  const [tenants, setTenants] = useState<Tenant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtered, setFiltered] = useState<Tenant[]>([])
  const [activeTab, setActiveTab] = useState(0)

  const tabs = [
    { title: "All Tenants", icon: Users },
    { title: "Active", icon: UserCheck },
    { title: "Inactive", icon: UserX },
    { type: "separator" as const },
    { title: "Notifications", icon: Bell },
  ]

  // Fetch tenants from API
  useEffect(() => {
    const fetchTenants = async () => {
      if (!user) return

      try {
        setLoading(true)
        const result = await tenantsApi.getAll()
        if (result.error) {
          setError(result.error)
        } else {
          setTenants(result.data || [])
          setFiltered(result.data || [])
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchTenants()
  }, [user])

  // Handle tab changes
  const handleTabChange = (index: number) => {
    setActiveTab(index)
    let filteredTenants = tenants

    if (index === 0) {
      // All Tenants
      filteredTenants = tenants
    } else if (index === 1) {
      // Active - assuming all tenants from API are active for now
      filteredTenants = tenants
    } else if (index === 2) {
      // Inactive - show tenants without email or phone (placeholder logic)
      filteredTenants = tenants.filter(tenant => !tenant.email && !tenant.phone)
    }

    setFiltered(filteredTenants)
  }

  // Handle delete tenant
  const handleDeleteTenant = async (tenantId: string) => {
    if (!confirm('Are you sure you want to delete this tenant? This action cannot be undone.')) {
      return
    }

    try {
      const result = await tenantsApi.delete(tenantId)
      if (result.error) {
        alert('Failed to delete tenant: ' + result.error)
      } else {
        // Refresh the tenants list
        const fetchResult = await tenantsApi.getAll()
        if (fetchResult.error) {
          setError(fetchResult.error)
        } else {
          setTenants(fetchResult.data || [])
          setFiltered(fetchResult.data || [])
        }
        alert('Tenant deleted successfully')
      }
    } catch (err) {
      alert('An error occurred while deleting the tenant')
    }
  }

  // Filter tenants based on search term
  const searchFiltered = filtered.filter(
    (tenant) =>
      `${tenant.first_name} ${tenant.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tenant.email && tenant.email.toLowerCase().includes(searchTerm.toLowerCase())),
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
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-green-50/30 via-emerald-50/20 to-teal-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-green-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/3 right-1/3 w-64 h-64 bg-teal-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
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
                  Tenants
                </motion.h1>
                <motion.div
                  className="flex items-center gap-4"
                  variants={fadeInUp}
                >
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-hover:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search tenants..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 hover:border-primary/50"
                    />
                  </div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button className="gap-2" onClick={() => {/* TODO: Open create tenant modal */}}>
                      <Plus className="w-4 h-4" />
                      Add Tenant
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
                  Loading tenants...
                </div>
              ) : error ? (
                <div className="text-center py-8 text-destructive">
                  Error: {error}
                </div>
              ) : searchFiltered.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No tenants found
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Name</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Email</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Phone</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Address</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchFiltered.map((tenant) => (
                        <tr key={tenant.id} className="border-b border-border hover:bg-muted/50">
                          <td className="py-3 px-4 text-foreground">
                            {tenant.first_name} {tenant.last_name}
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">{tenant.email || 'N/A'}</td>
                          <td className="py-3 px-4 text-muted-foreground">{tenant.phone || 'N/A'}</td>
                          <td className="py-3 px-4 text-foreground font-medium">{tenant.current_address || 'N/A'}</td>
                          <td className="py-3 px-4">
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/10 text-green-700">
                              Active
                            </span>
                          </td>
                          <td className="py-3 px-4 flex gap-2">
                            <button
                              className="p-2 hover:bg-muted rounded transition-colors"
                              onClick={() => {/* TODO: Open edit tenant modal */}}
                            >
                              <Edit className="w-4 h-4 text-muted-foreground" />
                            </button>
                            <button
                              className="p-2 hover:bg-muted rounded transition-colors"
                              onClick={() => handleDeleteTenant(tenant.id)}
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
