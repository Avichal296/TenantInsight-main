"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import DashboardNav from "@/components/dashboard-nav"
import DashboardSidebar from "@/components/dashboard-sidebar"
import DashboardStats from "@/components/dashboard-stats"
import DashboardRecentActivity from "@/components/dashboard-recent-activity"
import { ExpandableTabs } from "@/components/ui/expandable-tabs"
import { Home, Users, FileText, Wrench, BarChart3, Settings, Bell, Search, Plus } from "lucide-react"

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState(0)
  const router = useRouter()

  const tabs = [
    { title: "Overview", icon: Home },
    { title: "Tenants", icon: Users },
    { title: "Leases", icon: FileText },
    { title: "Maintenance", icon: Wrench },
    { title: "Analytics", icon: BarChart3 },
    { type: "separator" as const },
    { title: "Settings", icon: Settings },
  ]

  const handleTabChange = (index: number | null) => {
    if (index === null) return
    setActiveTab(index)
    console.log("Selected tab:", index)
  }

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'tenant':
        router.push('/tenants')
        break
      case 'lease':
        router.push('/leases')
        break
      case 'maintenance':
        router.push('/maintenance')
        break
      default:
        break
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
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-cyan-50/30 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900"></div>
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-cyan-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
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
                  Dashboard
                </motion.h1>
                <motion.div
                  className="flex items-center gap-4"
                  variants={fadeInUp}
                >
                  <div className="relative group">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4 group-hover:text-primary transition-colors" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="pl-10 pr-4 py-2 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200 hover:border-primary/50"
                    />
                  </div>
                  <motion.button
                    className="relative p-2 border border-border rounded-lg bg-background hover:bg-muted transition-all duration-200 hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Bell className="w-4 h-4 text-foreground" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                  </motion.button>
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
                <motion.div variants={fadeInUp}>
                  <DashboardStats />
                </motion.div>
                <motion.div
                  className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                  variants={fadeInUp}
                >
                  <div className="lg:col-span-2">
                    <DashboardRecentActivity />
                  </div>
                  <div className="space-y-6">
                    <motion.div
                      className="bg-card border border-border rounded-lg p-6 hover:shadow-lg transition-all duration-300"
                      whileHover={{ y: -2 }}
                      variants={fadeInUp}
                    >
                      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>
                      <div className="space-y-2">
                        <motion.button
                          onClick={() => handleQuickAction('tenant')}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-muted rounded transition-all duration-200 text-foreground flex items-center gap-2 group"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Plus className="w-4 h-4 group-hover:text-primary transition-colors" />
                          Add New Tenant
                        </motion.button>
                        <motion.button
                          onClick={() => handleQuickAction('lease')}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-muted rounded transition-all duration-200 text-foreground flex items-center gap-2 group"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Plus className="w-4 h-4 group-hover:text-primary transition-colors" />
                          Create New Lease
                        </motion.button>
                        <motion.button
                          onClick={() => handleQuickAction('maintenance')}
                          className="w-full px-4 py-3 text-left text-sm hover:bg-muted rounded transition-all duration-200 text-foreground flex items-center gap-2 group"
                          whileHover={{ x: 4 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Plus className="w-4 h-4 group-hover:text-primary transition-colors" />
                          Log Maintenance Issue
                        </motion.button>
                      </div>
                    </motion.div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </main>
        </div>
      </motion.div>
    </div>
  )
}
