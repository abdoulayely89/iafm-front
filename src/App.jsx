import React from 'react'
import { ConfigProvider, theme } from 'antd'
import AppRouter from './router/AppRouter'

/**
 * Palette inspirée du logo IAFM
 * Bleu:  #0050a0
 * Orange: #f8a01f
 */
function App() {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#0050a0',
          colorInfo: '#0050a0',
          borderRadius: 10,
          fontFamily:
            'system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif',
          colorBgLayout: '#f5f7fb',
          colorText: '#111827',
        },
        components: {
          Layout: {
            headerBg: '#ffffff',
            siderBg: '#ffffff',
            bodyBg: '#f5f7fb',
          },
          Card: {
            colorBgContainer: '#ffffff',
          },
        },
      }}
    >
      <AppRouter />
    </ConfigProvider>
  )
}

export default App
