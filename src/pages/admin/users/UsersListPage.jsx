// src/pages/admin/users/UsersListPage.jsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  Table,
  Tag,
  Typography,
  Card,
  Row,
  Col,
  Space,
  Button,
  Badge,
  message,
} from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  SafetyCertificateOutlined,
  PlusOutlined,
} from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text } = Typography

function UsersListPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data.users || [])
    } catch (e) {
      console.error(e)
      setUsers([])
      message.error("Impossible de charger les utilisateurs.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  // 📊 Stats rapides
  const stats = useMemo(() => {
    const total = users.length
    const students = users.filter((u) => u.role === 'student').length
    const instructors = users.filter((u) => u.role === 'instructor').length
    const admins = users.filter(
      (u) => u.role === 'admin' || u.role === 'superadmin'
    ).length
    const actives = users.filter((u) => u.isActive).length

    return { total, students, instructors, admins, actives }
  }, [users])

  const renderRoleTag = (role) => {
    switch (role) {
      case 'student':
        return <Tag color="blue">Étudiant</Tag>
      case 'instructor':
        return <Tag color="purple">Formateur</Tag>
      case 'admin':
        return <Tag color="gold">Admin</Tag>
      case 'superadmin':
        return <Tag color="red">Super admin</Tag>
      default:
        return <Tag>{role || '—'}</Tag>
    }
  }

  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'lastName',
      key: 'name',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Link to={`/admin/users/${record._id}`}>
            <Text strong>
              {record.firstName} {record.lastName}
            </Text>
          </Link>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.email}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Rôle',
      dataIndex: 'role',
      key: 'role',
      render: (role) => renderRoleTag(role),
      width: 140,
    },
    {
      title: 'Statut',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) =>
        isActive ? (
          <Tag color="green">Actif</Tag>
        ) : (
          <Tag color="red">Inactif</Tag>
        ),
      width: 110,
    },
    {
      title: 'Créé le',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value) =>
        value ? new Date(value).toLocaleDateString('fr-FR') : '—',
      width: 140,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 140,
      render: (_, record) => (
        <Button
          size="small"
          onClick={() => navigate(`/admin/users/${record._id}`)}
        >
          Modifier
        </Button>
      ),
    },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="page">
      {/* Header */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
        }}
      >
        <Title level={2} style={{ marginBottom: 0 }}>
          Utilisateurs
        </Title>
        <Text type="secondary">
          Gère ici tous les comptes étudiants, formateurs et administrateurs
          de la plateforme.
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Space>
              <Badge
                count={stats.total}
                overflowCount={999}
                style={{ backgroundColor: '#1890ff' }}
              >
                <UserOutlined
                  style={{ fontSize: 22, color: '#1890ff' }}
                />
              </Badge>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Total utilisateurs
                </Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {stats.total}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Space>
              <TeamOutlined style={{ fontSize: 22, color: '#722ed1' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Étudiants
                </Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {stats.students}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Space>
              <SafetyCertificateOutlined
                style={{ fontSize: 22, color: '#fa8c16' }}
              />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Formateurs / Admins
                </Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {stats.instructors + stats.admins}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Space>
              <UserOutlined style={{ fontSize: 22, color: '#52c41a' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Comptes actifs
                </Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {stats.actives}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Liste + bouton ajout */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        }}
        bodyStyle={{ padding: 16 }}
      >
        <div
          style={{
            marginBottom: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}
        >
          <Space direction="vertical" size={0}>
            <Text strong>Liste des utilisateurs</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Clique sur un utilisateur pour voir ou modifier ses
              informations.
            </Text>
          </Space>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/users/new')}
          >
            Nouvel utilisateur
          </Button>
        </div>

        <Table
          rowKey="_id"
          dataSource={users}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default UsersListPage
