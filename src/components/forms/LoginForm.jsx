import React, { useState } from 'react'
import { Form, Input, Button, Typography, Alert } from 'antd'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const { Title } = Typography

function LoginForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const onFinish = async (values) => {
    setError(null)
    setLoading(true)
    try {
      await login(values)
      navigate(from, { replace: true })
    } catch (e) {
      setError(e?.response?.data?.message || 'Échec de la connexion.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-card">
      <Title level={3} className="auth-title">Connexion</Title>
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
          rules={[{ required: true, message: 'Veuillez saisir votre mot de passe.' }]}
        >
          <Input.Password autoComplete="current-password" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block loading={loading}>
            Se connecter
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default LoginForm
