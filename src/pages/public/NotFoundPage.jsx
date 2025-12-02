import React from 'react'
import { Result, Button } from 'antd'
import { Link } from 'react-router-dom'

function NotFoundPage() {
  return (
    <div className="page">
      <Result
        status="404"
        title="404"
        subTitle="La page que vous recherchez n'existe pas."
        extra={
          <Button type="primary">
            <Link to="/">Retour à l&apos;accueil</Link>
          </Button>
        }
      />
    </div>
  )
}

export default NotFoundPage
