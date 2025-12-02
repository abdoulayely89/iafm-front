import React from 'react'
import { Row, Col, Typography } from 'antd'
import RegisterForm from '../../components/forms/RegisterForm'

const { Title, Paragraph } = Typography

function RegisterPage() {
  return (
    <div className="page auth-page">
      <Row gutter={48} align="middle">
        <Col xs={24} md={12}>
          <Title>Créer votre espace IAFM</Title>
          <Paragraph type="secondary">
            Inscrivez-vous et commencez votre premier parcours de formation dès aujourd&apos;hui.
          </Paragraph>
        </Col>
        <Col xs={24} md={12}>
          <RegisterForm />
        </Col>
      </Row>
    </div>
  )
}

export default RegisterPage
