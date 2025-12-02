import React, { useState } from 'react'
import { Card, Form, Input, Button, Typography, message } from 'antd'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const { Title } = Typography

function StudentProfilePage() {
  const { user, logout } = useAuth()
  const [loading, setLoading] = useState(false)

  const [form] = Form.useForm()

  const onFinish = async (values) => {
    setLoading(true)
    try {
      const { data } = await api.put('/auth/me', values)
      message.success('Profil mis à jour.')
      window.localStorage.setItem('iafm_auth', JSON.stringify({ token: JSON.parse(window.localStorage.getItem('iafm_auth')).token, user: data.user }))
      window.location.reload()
    } catch (e) {
      message.error("Impossible de mettre à jour le profil.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <Title level={2}>Mon profil</Title>
      <Card style={{ maxWidth: 480 }}>
        <Form
          layout="vertical"
          form={form}
          initialValues={{
            firstName: user?.firstName,
            lastName: user?.lastName,
            email: user?.email,
          }}
          onFinish={onFinish}
        >
          <Form.Item label="Prénom" name="firstName">
            <Input />
          </Form.Item>
          <Form.Item label="Nom" name="lastName">
            <Input />
          </Form.Item>
          <Form.Item label="Email">
            <Input value={user?.email} disabled />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Enregistrer
            </Button>
            <Button danger style={{ marginLeft: 12 }} onClick={logout}>
              Se déconnecter
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default StudentProfilePage
