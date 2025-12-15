// src/layouts/public/SidebarMenu.jsx
import React from 'react'
import { Layout, Menu } from 'antd'
import {
  DashboardOutlined,
  BookOutlined,
  FileTextOutlined,
  TeamOutlined,
  MenuOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const { Sider } = Layout

function SidebarMenu({ collapsed, setCollapsed, admin = false }) {
  const location = useLocation()
  const { user } = useAuth()

  const baseKey = admin ? '/admin' : '/student'

  let items = []

  if (!admin) {
    // ✅ Menu STUDENT
    items = [
      {
        key: `${baseKey}`,
        icon: <DashboardOutlined />,
        label: <Link to={baseKey}>Tableau de bord</Link>,
      },
      {
        key: `${baseKey}/my-courses`,
        icon: <BookOutlined />,
        label: <Link to={`${baseKey}/my-courses`}>Mes cours</Link>,
      },
      {
        key: `${baseKey}/profile`,
        icon: <FileTextOutlined />,
        label: <Link to={`${baseKey}/profile`}>Profil</Link>,
      },
    ]
  } else {
    // ✅ Menu ADMIN
    items = [
      {
        key: `${baseKey}`,
        icon: <DashboardOutlined />,
        label: <Link to={baseKey}>Dashboard</Link>,
      },
      {
        key: `${baseKey}/cms/pages`,
        icon: <FileTextOutlined />,
        label: <Link to={`${baseKey}/cms/pages`}>Pages CMS</Link>,
      },
      {
        key: `${baseKey}/menu`,
        icon: <MenuOutlined />,
        label: <Link to={`${baseKey}/menu`}>Menus</Link>,
      },
      {
        key: `${baseKey}/courses`,
        icon: <BookOutlined />,
        label: <Link to={`${baseKey}/courses`}>Cours</Link>,
      },
      {
        key: `${baseKey}/enrollments`,
        icon: <DashboardOutlined />,
        label: <Link to={`${baseKey}/enrollments`}>Inscriptions</Link>,
      },
      {
        key: `${baseKey}/users`,
        icon: <TeamOutlined />,
        label: <Link to={`${baseKey}/users`}>Utilisateurs</Link>,
      },
      {
        key: `${baseKey}/media`,
        icon: <VideoCameraOutlined />,
        label: <Link to={`${baseKey}/media`}>Vidéos</Link>,
      },
    ]
  }

  // Si pas connecté, pas de sidebar
  if (!user) return null

  // 🎨 Trigger flottant rond, moderne
  const customTrigger = (
    <div
      onClick={() => setCollapsed(!collapsed)}
      style={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        backgroundColor: '#1f1f1f',
        color: '#fff',
        fontSize: 18,
        margin: '12px auto',
        border: '1px solid rgba(255,255,255,0.2)',
        transition: '0.25s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = '#3a3a3a'
        e.currentTarget.style.transform = 'scale(1.06)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = '#1f1f1f'
        e.currentTarget.style.transform = 'scale(1)'
      }}
    >
      <MenuOutlined />
    </div>
  )

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="app-sider"
      width={230}
      breakpoint="lg"
      collapsedWidth={admin ? 80 : 0}
      trigger={customTrigger} // 👈 trigger custom
    >
      <div className="app-sider-logo">
        <span className="app-logo-mark">IA</span>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[location.pathname]}
        items={items}
      />
    </Sider>
  )
}

export default SidebarMenu
