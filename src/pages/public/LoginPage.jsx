import React from 'react'
import { Row, Col, Typography } from 'antd'
import LoginForm from '../../components/forms/LoginForm'

const { Title, Paragraph } = Typography

function LoginPage() {
  return (
    <div className="page auth-page">
      <Row gutter={48} align="middle">
        <Col xs={24} md={12}>
          <Title>Heureux de vous revoir</Title>
          <Paragraph type="secondary">
            Connectez-vous pour reprendre vos formations là où vous vous êtes arrêté.
          </Paragraph>
        </Col>
        <Col xs={24} md={12}>
          <LoginForm />
        </Col>
      </Row>
    </div>
  )
}

export default LoginPage
