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
    items = [
      { key: `${baseKey}`, icon: <DashboardOutlined />, label: <Link to={baseKey}>Tableau de bord</Link> },
      { key: `${baseKey}/my-courses`, icon: <BookOutlined />, label: <Link to={`${baseKey}/my-courses`}>Mes cours</Link> },
      { key: `${baseKey}/profile`, icon: <FileTextOutlined />, label: <Link to={`${baseKey}/profile`}>Profil</Link> },
    ]
  } else {
    items = [
      { key: `${baseKey}`, icon: <DashboardOutlined />, label: <Link to={baseKey}>Dashboard</Link> },
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

  // Only show for authenticated
  if (!user) return null

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      className="app-sider"
      width={230}
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
