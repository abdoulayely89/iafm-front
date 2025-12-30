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
  Grid,
  List,
  Empty,
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
const { useBreakpoint } = Grid

function UsersListPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState([])
  const navigate = useNavigate()

  const screens = useBreakpoint()
  const isMobile = !screens.sm

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/users')
      setUsers(data.users || [])
    } catch (e) {
      console.error(e)
      setUsers([])
      message.error('Impossible de charger les utilisateurs.')
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
        return <Tag style={{ marginInlineEnd: 0 }} color="blue">Étudiant</Tag>
      case 'instructor':
        return <Tag style={{ marginInlineEnd: 0 }} color="purple">Formateur</Tag>
      case 'admin':
        return <Tag style={{ marginInlineEnd: 0 }} color="gold">Admin</Tag>
      case 'superadmin':
        return <Tag style={{ marginInlineEnd: 0 }} color="red">Super admin</Tag>
      default:
        return <Tag style={{ marginInlineEnd: 0 }}>{role || '—'}</Tag>
    }
  }

  const renderActiveTag = (isActive) =>
    isActive ? (
      <Tag style={{ marginInlineEnd: 0 }} color="green">
        Actif
      </Tag>
    ) : (
      <Tag style={{ marginInlineEnd: 0 }} color="red">
        Inactif
      </Tag>
    )

  const columns = [
    {
      title: 'Utilisateur',
      dataIndex: 'lastName',
      key: 'name',
      ellipsis: true,
      render: (_, record) => (
        <Space direction="vertical" size={0} style={{ minWidth: 0 }}>
          <Link to={`/admin/users/${record._id}`}>
            <Text strong ellipsis={{ tooltip: true }}>
              {record.firstName} {record.lastName}
            </Text>
          </Link>
          <Text
            type="secondary"
            style={{ fontSize: 12 }}
            ellipsis={{ tooltip: record.email }}
          >
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
      render: (isActive) => renderActiveTag(isActive),
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
    <div
      className="page"
      style={{
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 4,
          maxWidth: '100%',
        }}
      >
        <Title level={2} style={{ marginBottom: 0 }}>
          Utilisateurs
        </Title>
        <Text type="secondary" style={{ maxWidth: '100%' }}>
          Gère ici tous les comptes étudiants, formateurs et administrateurs de la plateforme.
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Space align="center" size={12} style={{ width: '100%' }}>
              <Badge
                count={stats.total}
                overflowCount={999}
                style={{ backgroundColor: '#1890ff' }}
              >
                <UserOutlined style={{ fontSize: 22, color: '#1890ff' }} />
              </Badge>
              <div style={{ minWidth: 0 }}>
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
            <Space align="center" size={12} style={{ width: '100%' }}>
              <TeamOutlined style={{ fontSize: 22, color: '#722ed1' }} />
              <div style={{ minWidth: 0 }}>
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
            <Space align="center" size={12} style={{ width: '100%' }}>
              <SafetyCertificateOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
              <div style={{ minWidth: 0 }}>
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
            <Space align="center" size={12} style={{ width: '100%' }}>
              <UserOutlined style={{ fontSize: 22, color: '#52c41a' }} />
              <div style={{ minWidth: 0 }}>
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
          maxWidth: '100%',
        }}
        bodyStyle={{ padding: isMobile ? 12 : 16 }}
      >
        <div
          style={{
            marginBottom: 12,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            flexWrap: 'wrap',
            maxWidth: '100%',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <Text strong style={{ display: 'block' }}>
              Liste des utilisateurs
            </Text>
            <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
              Clique sur un utilisateur pour voir ou modifier ses informations.
            </Text>
          </div>

          <Button
            type="primary"
            icon={<PlusOutlined />}
            block={isMobile}
            onClick={() => navigate('/admin/users/new')}
          >
            Nouvel utilisateur
          </Button>
        </div>

        {/* Desktop/Tablet: Table | Mobile: Cards/List (évite les débordements et scroll horizontal) */}
        {isMobile ? (
          users.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Aucun utilisateur."
            />
          ) : (
            <List
              dataSource={users}
              rowKey={(u) => u._id}
              split={false}
              renderItem={(u) => (
                <List.Item style={{ paddingInline: 0 }}>
                  <Card
                    size="small"
                    style={{ width: '100%', borderRadius: 12 }}
                    bodyStyle={{ padding: 12 }}
                  >
                    <div style={{ display: 'flex', gap: 12, width: '100%' }}>
                      <UserOutlined style={{ fontSize: 18, marginTop: 2, color: '#8c8c8c' }} />

                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Link to={`/admin/users/${u._id}`}>
                          <Text strong style={{ display: 'block' }} ellipsis={{ tooltip: true }}>
                            {u.firstName} {u.lastName}
                          </Text>
                        </Link>

                        <Text
                          type="secondary"
                          style={{ fontSize: 12, display: 'block' }}
                          ellipsis={{ tooltip: u.email }}
                        >
                          {u.email}
                        </Text>

                        <Space
                          size={[8, 8]}
                          wrap
                          style={{ marginTop: 8, width: '100%' }}
                        >
                          {renderRoleTag(u.role)}
                          {renderActiveTag(u.isActive)}
                          <Tag style={{ marginInlineEnd: 0 }}>
                            Créé : {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                          </Tag>
                        </Space>

                        <div style={{ marginTop: 10 }}>
                          <Button
                            size="middle"
                            block
                            onClick={() => navigate(`/admin/users/${u._id}`)}
                          >
                            Modifier
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          )
        ) : (
          <Table
            rowKey="_id"
            dataSource={users}
            columns={columns}
            pagination={{ pageSize: 10 }}
            scroll={{ x: 'max-content' }}
          />
        )}
      </Card>
    </div>
  )
}

export default UsersListPage
