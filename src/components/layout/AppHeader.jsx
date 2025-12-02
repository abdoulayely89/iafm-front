// src/layouts/public/AppHeader.jsx
import React, { useEffect, useMemo, useState } from 'react'
import {
  Layout,
  Button,
  Dropdown,
  Space,
  Avatar,
  Typography,
  Drawer,
  Menu,
} from 'antd'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { UserOutlined, MenuOutlined } from '@ant-design/icons'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import iafmLogo from '../../assets/iafm-logo.png'

const { Header } = Layout
const { Text } = Typography

function AppHeader({ dashboard = false }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, isAuthenticated, logout } = useAuth()

  const [menuItems, setMenuItems] = useState([])
  const [drawerOpen, setDrawerOpen] = useState(false)

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data } = await api.get('/cms/menu?location=header')
        const items = (data.items || []).map((item) => ({
          key: item.url || item._id,
          label: <Link to={item.url || '#'}>{item.label}</Link>,
        }))
        setMenuItems(items)
      } catch (e) {
        // silent
      }
    }
    if (!dashboard) {
      fetchMenu()
    }
  }, [dashboard])

  const role = user?.role

  // 👇 Liens spécifiques à l'étudiant (affichés dans le burger)
  const studentNavItems = !dashboard && role === 'student'
    ? [
        {
          key: '/student',
          label: <Link to="/student">Mon tableau de bord</Link>,
        },
        {
          key: '/student/my-courses',
          label: <Link to="/student/my-courses">Mes cours</Link>,
        },
        {
          key: '/student/profile',
          label: <Link to="/student/profile">Mon profil</Link>,
        },
      ]
    : []

  // 👇 Optionnel : liens admin dans le burger (pratique en mobile)
  const adminNavItems =
    !dashboard && (role === 'admin' || role === 'superadmin')
      ? [
          {
            key: '/admin',
            label: <Link to="/admin">Dashboard admin</Link>,
          },
        ]
      : []

  const navItems = useMemo(
    () => [
      { key: '/', label: <Link to="/">Accueil</Link> },
      { key: '/courses', label: <Link to="/courses">Formations</Link> },
      ...menuItems,
      ...studentNavItems,
      ...adminNavItems,
    ],
    [menuItems, studentNavItems, adminNavItems]
  )

  const selectedKeys = useMemo(() => {
    const path = location.pathname || '/'
    const match = navItems.find((item) => {
      if (typeof item.key !== 'string') return false
      if (item.key === '/') return path === '/'
      return path.startsWith(item.key)
    })
    return match ? [match.key] : []
  }, [location.pathname, navItems])

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const userMenu = {
    items: [
      {
        key: 'profile',
        label: (
          <Link
            to={
              role === 'admin' || role === 'superadmin'
                ? '/admin'
                : '/student/profile'
            }
          >
            Profil
          </Link>
        ),
      },
      {
        key: 'logout',
        label: 'Se déconnecter',
        onClick: handleLogout,
      },
    ],
  }

  return (
    <>
      <Header
        className="app-header"
        style={{
          padding: '0 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 72,
        }}
      >
        {/* GAUCHE : logo + burger */}
        <div
          className="app-header-left"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            flex: 1,
          }}
        >
          <Link
            to="/"
            className="app-logo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              textDecoration: 'none',
            }}
          >
            <img
              src={iafmLogo}
              alt="IAFM"
              style={{
                height: 48,
                width: 'auto',
                display: 'block',
              }}
            />
            <span
              style={{
                fontWeight: 700,
                fontSize: 24,
                color: '#fff',
                letterSpacing: 0.6,
              }}
            >
              IAFM
            </span>
          </Link>

          {!dashboard && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setDrawerOpen(true)}
              aria-label="Menu"
              style={{
                marginLeft: 4,
                color: '#fff',
              }}
            />
          )}
        </div>

        {/* DROITE : user / auth */}
        <div
          className="app-header-right"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 12,
          }}
        >
          {isAuthenticated ? (
            <Dropdown menu={userMenu} trigger={['click']}>
              <Space
                className="app-user-menu"
                style={{ cursor: 'pointer', color: '#fff' }}
              >
                <Avatar size="small" icon={<UserOutlined />} />
                <Text className="app-user-name" style={{ color: '#fff' }}>
                  {user?.firstName} {user?.lastName}
                </Text>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button type="link">
                <Link to="/login">Se connecter</Link>
              </Button>
              <Button type="primary">
                <Link to="/register">Inscription</Link>
              </Button>
            </Space>
          )}
        </div>
      </Header>

      {/* Drawer du menu burger */}
      {!dashboard && (
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          placement="left"
          title="Navigation"
        >
          <Menu
            mode="inline"
            selectedKeys={selectedKeys}
            items={navItems}
            onClick={() => setDrawerOpen(false)}
          />

          <div style={{ marginTop: 24 }}>
            {isAuthenticated ? (
              <Button danger block onClick={handleLogout}>
                Se déconnecter
              </Button>
            ) : (
              <Space direction="vertical" style={{ width: '100%' }}>
                <Button block>
                  <Link to="/login">Se connecter</Link>
                </Button>
                <Button type="primary" block>
                  <Link to="/register">Inscription</Link>
                </Button>
              </Space>
            )}
          </div>
        </Drawer>
      )}
    </>
  )
}

export default AppHeader
