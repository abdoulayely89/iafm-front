import React from 'react'
import { Breadcrumb } from 'antd'
import { Link } from 'react-router-dom'

function Breadcrumbs({ items }) {
  return (
    <Breadcrumb style={{ marginBottom: 16 }}>
      {items?.map((item) => (
        <Breadcrumb.Item key={item.key}>
          {item.to ? <Link to={item.to}>{item.label}</Link> : item.label}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  )
}

export default Breadcrumbs
