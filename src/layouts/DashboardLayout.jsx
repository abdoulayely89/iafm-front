import React, { useState } from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import SidebarMenu from '../components/layout/SidebarMenu'
import AppHeader from '../components/layout/AppHeader'

const { Content } = Layout

function DashboardLayout({ admin = false }) {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <Layout className="app-layout">
      <SidebarMenu collapsed={collapsed} setCollapsed={setCollapsed} admin={admin} />
      <Layout>
        <AppHeader dashboard />
        <Content className="app-content app-content-dashboard">
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default DashboardLayout
