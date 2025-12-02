import React, { useState } from 'react'
import { Form, Input, Button, Typography, Alert } from 'antd'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const { Title, Paragraph } = Typography

function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { register } = useAuth()
  const navigate = useNavigate()

  const onFinish = async (values) => {
    setError(null)
    setLoading(true)
    try {
      await register(values)
      navigate('/student', { replace: true })
    } catch (e) {
      setError(e?.response?.data?.message || 'Échec de l’inscription.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <Title level={3} className="auth-title">Créer un compte</Title>
      <Paragraph type="secondary">
        Rejoignez IAFM et suivez vos formations en ligne.
      </Paragraph>
      {error && (
        <Alert
          type="error"
          message={error}
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
      <Form layout="vertical" onFinish={onFinish}>
        <Form.Item
          label="Prénom"
          name="firstName"
          rules={[{ required: true, message: 'Veuillez saisir votre prénom.' }]}
        >
          <Input autoComplete="given-name" />
        </Form.Item>
        <Form.Item
          label="Nom"
          name="lastName"
          rules={[{ required: true, message: 'Veuillez saisir votre nom.' }]}
        >
          <Input autoComplete="family-name" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: 'Veuillez saisir votre email.' },
            { type: 'email', message: 'Email invalide.' },
          ]}
        >
          <Input autoComplete="email" />
        </Form.Item>
        <Form.Item
          label="Mot de passe"
          name="password"
          rules={[
            { required: true, message: 'Veuillez saisir un mot de passe.' },
            { min: 8, message: 'Minimum 8 caractères.' },
          ]}
        >
          <Input.Password autoComplete="new-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            S’inscrire
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default RegisterForm
