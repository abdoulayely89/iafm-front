import React from 'react'
import { Row, Col, Typography, Card, App } from 'antd'
import RegisterForm from '../../components/forms/RegisterForm'

const { Title, Paragraph, Text } = Typography

function RegisterPage() {
  return (
    <App>
      <div
        className="page auth-page"
        style={{
          minHeight: 'calc(100vh - 72px)',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Row
          gutter={[32, 32]}
          align="middle"
          style={{ width: '100%', margin: 0 }}
        >
          {/* Colonne gauche : texte */}
          <Col xs={24} md={12}>
            <div style={{ maxWidth: 520 }}>
              <Title style={{ marginBottom: 8 }}>Créer votre espace IAFM</Title>
              <Paragraph type="secondary" style={{ fontSize: 16, marginBottom: 16 }}>
                Inscrivez-vous et commencez votre parcours de formation dès aujourd&apos;hui.
              </Paragraph>

              <Card
                bordered={false}
                style={{
                  borderRadius: 16,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
                  background: '#ffffff',
                }}
                bodyStyle={{ padding: 18 }}
              >
                <Text strong>Après inscription, vous pourrez :</Text>
                <ul style={{ marginTop: 10, marginBottom: 0, paddingLeft: 18 }}>
                  <li>Accéder à votre tableau de bord étudiant</li>
                  <li>Suivre vos cours et vos ressources</li>
                  <li>Faire les quiz et suivre votre progression</li>
                  <li>Demander l’accès aux packs PDF</li>
                </ul>
              </Card>
            </div>
          </Col>

          {/* Colonne droite : formulaire */}
          <Col xs={24} md={12}>
            <Card
              bordered={false}
              style={{
                borderRadius: 16,
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
              }}
              bodyStyle={{ padding: 24 }}
            >
              <RegisterForm />
            </Card>
          </Col>
        </Row>
      </div>
    </App>
  )
}

export default RegisterPage
