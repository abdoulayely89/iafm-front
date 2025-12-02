import React from 'react'
import { Layout } from 'antd'
import { Outlet } from 'react-router-dom'
import AppHeader from '../components/layout/AppHeader'
import AppFooter from '../components/layout/AppFooter'

const { Content } = Layout

function PublicLayout() {
  return (
    <Layout className="app-layout">
      <AppHeader />
      <Content className="app-content">
        <Outlet />
      </Content>
      <AppFooter />
    </Layout>
  )
}

export default PublicLayout
