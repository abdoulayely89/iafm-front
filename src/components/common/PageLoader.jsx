import React from 'react'
import { Spin } from 'antd'

function PageLoader() {
  return (
    <div className="page-loader">
      <Spin size="large" />
    </div>
  )
}

export default PageLoader
