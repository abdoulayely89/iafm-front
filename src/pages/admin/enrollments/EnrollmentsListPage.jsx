// src/pages/admin/enrollments/EnrollmentsListPage.jsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  Select,
  Tag,
  Typography,
  message,
  Card,
  Row,
  Col,
  Space,
  Badge,
  List,
  Empty,
  Button,
} from 'antd'
import {
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text } = Typography
const { Option } = Select

function EnrollmentsListPage() {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const navigate = useNavigate()

  const fetchEnrollments = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/enrollments')
      const list = data.enrollments || []
      setEnrollments(list)

      // sélectionner par défaut le premier étudiant
      if (list.length > 0) {
        const first = list[0].student?._id
        if (first) setSelectedStudentId(first)
      }
    } catch (e) {
      console.error(e)
      setEnrollments([])
      message.error("Impossible de charger les inscriptions.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrollments()
  }, [])

  const handleStatusChange = async (enrollmentId, status) => {
    try {
      await api.put(`/admin/enrollments/${enrollmentId}`, { status })
      message.success('Statut mis à jour.')
      fetchEnrollments()
    } catch (e) {
      console.error(e)
      message.error("Impossible de mettre à jour le statut.")
    }
  }

  const renderStatusTag = (status) => {
    let color = 'default'
    let label = status

    switch (status) {
      case 'pending':
        color = 'orange'
        label = 'En attente'
        break
      case 'active':
        color = 'blue'
        label = 'Active'
        break
      case 'completed':
        color = 'green'
        label = 'Terminée'
        break
      case 'cancelled':
        color = 'red'
        label = 'Annulée'
        break
      default:
        color = 'default'
        label = status || '—'
    }

    return <Tag color={color}>{label}</Tag>
  }

  // 📊 Stats globales
  const stats = useMemo(() => {
    const total = enrollments.length
    const pending = enrollments.filter((e) => e.status === 'pending').length
    const active = enrollments.filter((e) => e.status === 'active').length
    const completed = enrollments.filter((e) => e.status === 'completed').length
    const cancelled = enrollments.filter((e) => e.status === 'cancelled').length

    return { total, pending, active, completed, cancelled }
  }, [enrollments])

  // 👥 Regrouper par étudiant
  const students = useMemo(() => {
    const map = new Map()

    enrollments.forEach((enr) => {
      const s = enr.student
      if (!s || !s._id) return

      if (!map.has(s._id)) {
        map.set(s._id, {
          student: s,
          enrollments: [],
        })
      }
      map.get(s._id).enrollments.push(enr)
    })

    return Array.from(map.values())
  }, [enrollments])

  // Étudiant sélectionné
  const selectedStudentBlock = useMemo(() => {
    if (!selectedStudentId) return null
    return students.find((b) => b.student._id === selectedStudentId) || null
  }, [students, selectedStudentId])

  // Filtrage des inscriptions pour l'étudiant sélectionné
  const filteredEnrollmentsForStudent = useMemo(() => {
    if (!selectedStudentBlock) return []
    const list = selectedStudentBlock.enrollments
    if (statusFilter === 'all') return list
    return list.filter((e) => e.status === statusFilter)
  }, [selectedStudentBlock, statusFilter])

  if (loading) return <PageLoader />

  return (
    <div className="page admin-enrollments-page">
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
          Inscriptions aux cours
        </Title>
        <Text type="secondary">
          Choisis un étudiant pour voir tous les cours auxquels il est inscrit
          et gérer ses accès.
        </Text>
      </div>

      {/* Stats globales */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Space>
              <Badge
                count={stats.total}
                overflowCount={999}
                style={{ backgroundColor: '#1890ff' }}
              >
                <UserOutlined style={{ fontSize: 22, color: '#1890ff' }} />
              </Badge>
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Total inscriptions
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
              <ClockCircleOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  En attente
                </Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {stats.pending}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Space>
              <CheckCircleOutlined style={{ fontSize: 22, color: '#1890ff' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Actives
                </Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {stats.active}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Space>
              <BookOutlined style={{ fontSize: 22, color: '#52c41a' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Terminées / Annulées
                </Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {stats.completed + stats.cancelled}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Layout 2 colonnes : gauche = étudiants, droite = cours de l'étudiant */}
      <Row gutter={[16, 16]}>
        {/* Colonne gauche : liste des étudiants */}
        <Col xs={24} md={8}>
          <Card
            title="Étudiants inscrits"
            bordered={false}
            bodyStyle={{ padding: 12 }}
            style={{
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              height: '100%',
            }}
          >
            {students.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Aucune inscription pour le moment."
              />
            ) : (
              <List
                dataSource={students}
                rowKey={(item) => item.student._id}
                renderItem={(item) => {
                  const isSelected =
                    item.student._id === selectedStudentId
                  const count = item.enrollments.length

                  const pendingCount = item.enrollments.filter(
                    (e) => e.status === 'pending'
                  ).length

                  return (
                    <List.Item
                      style={{
                        cursor: 'pointer',
                        borderRadius: 10,
                        padding: '8px 10px',
                        backgroundColor: isSelected
                          ? 'rgba(24, 144, 255, 0.06)'
                          : 'transparent',
                      }}
                      onClick={() =>
                        setSelectedStudentId(item.student._id)
                      }
                    >
                      <Space align="start">
                        <Badge
                          count={count}
                          size="small"
                          style={{ backgroundColor: '#1890ff' }}
                        >
                          <UserOutlined
                            style={{
                              fontSize: 20,
                              color: isSelected
                                ? '#1890ff'
                                : '#888',
                            }}
                          />
                        </Badge>
                        <div>
                          <Text strong>
                            {item.student.firstName}{' '}
                            {item.student.lastName}
                          </Text>
                          <div>
                            <Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              {item.student.email}
                            </Text>
                          </div>
                          <div style={{ marginTop: 4 }}>
                            <Tag color="blue" style={{ fontSize: 11 }}>
                              {count} cours
                            </Tag>
                            {pendingCount > 0 && (
                              <Tag
                                color="orange"
                                style={{ fontSize: 11 }}
                              >
                                {pendingCount} en attente
                              </Tag>
                            )}
                          </div>
                        </div>
                      </Space>
                    </List.Item>
                  )
                }}
              />
            )}
          </Card>
        </Col>

        {/* Colonne droite : détails des inscriptions de l'étudiant */}
        <Col xs={24} md={16}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
            }}
            bodyStyle={{ padding: 16 }}
          >
            {selectedStudentBlock ? (
              <>
                {/* Header étudiant + filtre */}
                <div
                  style={{
                    marginBottom: 16,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Étudiant sélectionné
                    </Text>
                    <div>
                      <Text strong style={{ fontSize: 16 }}>
                        {selectedStudentBlock.student.firstName}{' '}
                        {selectedStudentBlock.student.lastName}
                      </Text>
                    </div>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {selectedStudentBlock.student.email}
                    </Text>
                  </div>

                  <Space align="center">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Filtrer ses cours par statut :
                    </Text>
                    <Select
                      value={statusFilter}
                      onChange={setStatusFilter}
                      size="small"
                      style={{ minWidth: 180 }}
                    >
                      <Option value="all">Tous les statuts</Option>
                      <Option value="pending">En attente</Option>
                      <Option value="active">Actives</Option>
                      <Option value="completed">Terminées</Option>
                      <Option value="cancelled">Annulées</Option>
                    </Select>
                  </Space>
                </div>

                {filteredEnrollmentsForStudent.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Aucune inscription ne correspond à ce filtre pour cet étudiant."
                  />
                ) : (
                  <Space
                    direction="vertical"
                    size={12}
                    style={{ width: '100%' }}
                  >
                    {filteredEnrollmentsForStudent.map((enr) => (
                      <Card
                        key={enr._id}
                        size="small"
                        style={{ borderRadius: 12 }}
                      >
                        <Row gutter={[8, 8]} align="middle">
                          <Col xs={24} md={14}>
                            <Space direction="vertical" size={0}>
                              <Text strong>
                                {enr.course?.title || 'Cours inconnu'}
                              </Text>
                              {enr.course?.slug && (
                                <Tag
                                  color="geekblue"
                                  style={{
                                    marginTop: 2,
                                    fontSize: 11,
                                    width: 'fit-content',
                                  }}
                                >
                                  {enr.course.slug}
                                </Tag>
                              )}
                              <Text
                                type="secondary"
                                style={{ fontSize: 12 }}
                              >
                                Demandé le :{' '}
                                {enr.createdAt
                                  ? new Date(
                                      enr.createdAt
                                    ).toLocaleString('fr-FR')
                                  : '—'}
                              </Text>
                              {enr.startedAt && (
                                <Text
                                  type="secondary"
                                  style={{ fontSize: 12 }}
                                >
                                  Activé le :{' '}
                                  {new Date(
                                    enr.startedAt
                                  ).toLocaleDateString('fr-FR')}
                                </Text>
                              )}
                            </Space>
                          </Col>

                          <Col xs={24} md={10}>
                            <Space
                              direction="vertical"
                              size={6}
                              style={{ width: '100%' }}
                            >
                              <Space
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  width: '100%',
                                }}
                              >
                                {renderStatusTag(enr.status)}
                                <Select
                                  value={enr.status}
                                  onChange={(value) =>
                                    handleStatusChange(
                                      enr._id,
                                      value
                                    )
                                  }
                                  size="small"
                                  style={{ width: 170 }}
                                >
                                  <Option value="pending">
                                    En attente
                                  </Option>
                                  <Option value="active">
                                    Active (acceptée)
                                  </Option>
                                  <Option value="completed">
                                    Terminée
                                  </Option>
                                  <Option value="cancelled">
                                    Annulée
                                  </Option>
                                </Select>
                              </Space>

                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  gap: 8,
                                }}
                              >
                                {enr.status === 'pending' && (
                                  <Button
                                    size="small"
                                    type="primary"
                                    onClick={() =>
                                      handleStatusChange(
                                        enr._id,
                                        'active'
                                      )
                                    }
                                  >
                                    Accepter
                                  </Button>
                                )}
                                {enr.course?._id && (
                                  <Button
                                    size="small"
                                    onClick={() =>
                                      navigate(
                                        `/admin/courses/${enr.course._id}`
                                      )
                                    }
                                  >
                                    Ouvrir le cours
                                  </Button>
                                )}
                              </div>
                            </Space>
                          </Col>
                        </Row>
                      </Card>
                    ))}
                  </Space>
                )}
              </>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Sélectionne un étudiant dans la colonne de gauche."
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default EnrollmentsListPage
