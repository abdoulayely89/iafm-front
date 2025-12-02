// src/components/layout/AppFooter.jsx
import React, { useEffect, useState } from 'react'
import { Layout, Typography, Space } from 'antd'
import { Link } from 'react-router-dom'
import api from '../../services/api'

const { Footer } = Layout
const { Text } = Typography

function AppFooter() {
  const [footerMenu, setFooterMenu] = useState([])

  useEffect(() => {
    async function fetchMenu() {
      try {
        const { data } = await api.get('/cms/menu?location=footer')
        setFooterMenu(data.items || [])
      } catch (e) {
        // silent
      }
    }
    fetchMenu()
  }, [])

  const year = new Date().getFullYear()

  return (
    <Footer className="app-footer">
      <div className="app-footer-inner">
        <div className="app-footer-left">
          <Text type="secondary">
            © {year} IAFM. Tous droits réservés.
          </Text>
        </div>
        <div className="app-footer-right">
          <Space size="middle">
            {footerMenu.map((item) => (
              <Link
                key={item._id}
                to={item.url || '#'}
                className="app-footer-link"
              >
                {item.label}
              </Link>
            ))}
          </Space>
        </div>
      </div>
    </Footer>
  )
}

export default AppFooter
