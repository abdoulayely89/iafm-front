import React from 'react'
import { Result, Button } from 'antd'

function ErrorState({ title = 'Une erreur est survenue', subTitle, onRetry }) {
  return (
    <Result
      status="error"
      title={title}
      subTitle={subTitle}
      extra={
        onRetry && (
          <Button type="primary" onClick={onRetry}>
            Réessayer
          </Button>
        )
      }
    />
  )
}

export default ErrorState
