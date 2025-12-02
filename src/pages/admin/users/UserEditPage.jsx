// src/pages/admin/users/UserEditPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Form,
  Input,
  Select,
  Switch,
  Typography,
  Card,
  message,
} from 'antd'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text } = Typography
const { Option } = Select

function UserEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  // 🔹 Chargement des données uniquement en mode édition
  useEffect(() => {
    if (isNew) {
      setLoading(false)
      return
    }

    async function fetch() {
      setLoading(true)
      try {
        const { data } = await api.get(`/admin/users/${id}`)
        const user = data.user

        form.setFieldsValue({
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          role: user.role,
          isActive: user.isActive,
        })
      } catch (e) {
        message.error('Utilisateur introuvable.')
        navigate('/admin/users')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [id, isNew, form, navigate])

  const onFinish = async (values) => {
    setSaving(true)
    try {
      if (isNew) {
        // 🆕 Création d’un nouvel utilisateur
        await api.post('/admin/users', {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: values.role,
          isActive: values.isActive,
          password: values.password, // à gérer côté backend
        })
        message.success('Utilisateur créé avec succès.')
      } else {
        // ✏️ Mise à jour d’un utilisateur existant
        await api.put(`/admin/users/${id}`, {
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          role: values.role,
          isActive: values.isActive,
          // si tu veux gérer le changement de mot de passe, tu peux ajouter:
          // password: values.password || undefined
        })
        message.success('Utilisateur mis à jour.')
      }

      navigate('/admin/users')
    } catch (e) {
      console.error(e)
      message.error('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="page">
      <Title level={2} style={{ marginBottom: 16 }}>
        {isNew ? 'Nouvel utilisateur' : "Éditer l'utilisateur"}
      </Title>

      <Card
        bordered={false}
        style={{
          maxWidth: 600,
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        }}
      >
        {!isNew && (
          <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
            Modifie le rôle et le statut, ou mets à jour les informations si besoin.
          </Text>
        )}

        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          initialValues={{
            role: 'student',
            isActive: true,
          }}
        >
          <Form.Item
            label="Prénom"
            name="firstName"
            rules={[
              { required: true, message: 'Le prénom est requis.' },
              { min: 2, message: 'Minimum 2 caractères.' },
            ]}
          >
            <Input placeholder="Prénom" />
          </Form.Item>

          <Form.Item
            label="Nom"
            name="lastName"
            rules={[
              { required: true, message: 'Le nom est requis.' },
              { min: 2, message: 'Minimum 2 caractères.' },
            ]}
          >
            <Input placeholder="Nom" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "L'email est requis." },
              { type: 'email', message: 'Email invalide.' },
            ]}
          >
            <Input placeholder="email@exemple.com" />
          </Form.Item>

          <Form.Item
            label="Rôle"
            name="role"
            rules={[{ required: true, message: 'Le rôle est requis.' }]}
          >
            <Select>
              <Option value="student">Étudiant</Option>
              <Option value="instructor">Formateur</Option>
              <Option value="admin">Admin</Option>
              <Option value="superadmin">Super admin</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={isNew ? 'Mot de passe' : 'Mot de passe (optionnel)'}
            name="password"
            rules={
              isNew
                ? [
                    {
                      required: true,
                      message: 'Le mot de passe est requis.',
                    },
                    {
                      min: 8,
                      message: 'Minimum 8 caractères.',
                    },
                  ]
                : [{ min: 8, message: 'Minimum 8 caractères.' }]
            }
          >
            <Input.Password
              placeholder={
                isNew
                  ? 'Mot de passe'
                  : 'Laisser vide pour ne pas changer le mot de passe'
              }
            />
          </Form.Item>

          <Form.Item
            label="Compte actif"
            name="isActive"
            valuePropName="checked"
          >
            <Switch checkedChildren="Actif" unCheckedChildren="Inactif" />
          </Form.Item>

          <Form.Item>
            <div
              style={{
                marginTop: 8,
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              <Button onClick={() => navigate('/admin/users')}>
                Annuler
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={saving}
              >
                {isNew ? 'Créer' : 'Enregistrer'}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default UserEditPage
