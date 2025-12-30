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
  Grid,
  Popconfirm,
} from 'antd'
import {
  UserOutlined,
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text } = Typography
const { Option } = Select
const { useBreakpoint } = Grid

function EnrollmentsListPage() {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [selectedStudentId, setSelectedStudentId] = useState(null)
  const [grantAllLoading, setGrantAllLoading] = useState(false)

  const navigate = useNavigate()

  const screens = useBreakpoint()
  const isMobile = !screens.sm

  const fetchEnrollments = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/enrollments')
      const list = data.enrollments || []
      setEnrollments(list)

      if (list.length > 0) {
        // si déjà sélectionné et toujours présent, ne pas écraser
        const stillExists = selectedStudentId
          ? list.some((e) => e.student?._id === selectedStudentId)
          : false

        if (!stillExists) {
          const first = list[0].student?._id
          if (first) setSelectedStudentId(first)
        }
      } else {
        setSelectedStudentId(null)
      }
    } catch (e) {
      console.error(e)
      setEnrollments([])
      setSelectedStudentId(null)
      message.error('Impossible de charger les inscriptions.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEnrollments()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleStatusChange = async (enrollmentId, status) => {
    try {
      await api.put(`/admin/enrollments/${enrollmentId}`, { status })
      message.success('Statut mis à jour.')
      fetchEnrollments()
    } catch (e) {
      console.error(e)
      message.error('Impossible de mettre à jour le statut.')
    }
  }

  const handleGrantAllCourses = async (studentId) => {
    if (!studentId) return
    setGrantAllLoading(true)
    try {
      const { data } = await api.post('/admin/enrollments/grant-all', { studentId })
      message.success(
        `Accès global activé. Créés: ${data?.created ?? 0}, mis à jour: ${data?.updated ?? 0}, ignorés: ${data?.skipped ?? 0}.`
      )
      fetchEnrollments()
    } catch (e) {
      console.error(e)
      message.error("Impossible d'activer l'accès global.")
    } finally {
      setGrantAllLoading(false)
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

    return (
      <Tag style={{ marginInlineEnd: 0, maxWidth: '100%' }} color={color}>
        {label}
      </Tag>
    )
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
    <div
      className="page admin-enrollments-page"
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
          Inscriptions aux cours
        </Title>
        <Text type="secondary" style={{ maxWidth: '100%' }}>
          Choisis un étudiant pour voir tous les cours auxquels il est inscrit et gérer ses accès.
        </Text>
      </div>

      {/* Stats globales */}
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
            <Space align="center" size={12} style={{ width: '100%' }}>
              <ClockCircleOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
              <div style={{ minWidth: 0 }}>
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
            <Space align="center" size={12} style={{ width: '100%' }}>
              <CheckCircleOutlined style={{ fontSize: 22, color: '#1890ff' }} />
              <div style={{ minWidth: 0 }}>
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
            <Space align="center" size={12} style={{ width: '100%' }}>
              <BookOutlined style={{ fontSize: 22, color: '#52c41a' }} />
              <div style={{ minWidth: 0 }}>
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

      {/* Layout 2 colonnes */}
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
              maxWidth: '100%',
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
                  const isSelected = item.student._id === selectedStudentId
                  const count = item.enrollments.length
                  const pendingCount = item.enrollments.filter((e) => e.status === 'pending').length

                  return (
                    <List.Item
                      style={{
                        cursor: 'pointer',
                        borderRadius: 10,
                        padding: isMobile ? '10px 10px' : '8px 10px',
                        backgroundColor: isSelected ? 'rgba(24, 144, 255, 0.06)' : 'transparent',
                        maxWidth: '100%',
                      }}
                      onClick={() => setSelectedStudentId(item.student._id)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          gap: 12,
                          width: '100%',
                          minWidth: 0,
                          alignItems: 'flex-start',
                        }}
                      >
                        <Badge count={count} size="small" style={{ backgroundColor: '#1890ff' }}>
                          <UserOutlined
                            style={{
                              fontSize: 20,
                              color: isSelected ? '#1890ff' : '#888',
                            }}
                          />
                        </Badge>

                        <div style={{ minWidth: 0, flex: 1 }}>
                          <Text strong style={{ display: 'block' }} ellipsis={{ tooltip: true }}>
                            {item.student.firstName} {item.student.lastName}
                          </Text>

                          <Text
                            type="secondary"
                            style={{ fontSize: 12, display: 'block' }}
                            ellipsis={{ tooltip: item.student.email }}
                          >
                            {item.student.email}
                          </Text>

                          <div style={{ marginTop: 6 }}>
                            <Space size={[6, 6]} wrap style={{ width: '100%' }}>
                              <Tag color="blue" style={{ fontSize: 11, marginInlineEnd: 0 }}>
                                {count} cours
                              </Tag>
                              {pendingCount > 0 && (
                                <Tag color="orange" style={{ fontSize: 11, marginInlineEnd: 0 }}>
                                  {pendingCount} en attente
                                </Tag>
                              )}
                            </Space>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )
                }}
              />
            )}
          </Card>
        </Col>

        {/* Colonne droite : détails */}
        <Col xs={24} md={16}>
          <Card
            bordered={false}
            style={{
              borderRadius: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
              maxWidth: '100%',
            }}
            bodyStyle={{ padding: isMobile ? 12 : 16 }}
          >
            {selectedStudentBlock ? (
              <>
                {/* Header étudiant + filtre + accès global */}
                <Row gutter={[12, 12]} align="middle" style={{ marginBottom: 16 }}>
                  <Col xs={24} sm={10}>
                    <div style={{ minWidth: 0 }}>
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        Étudiant sélectionné
                      </Text>

                      <Text strong style={{ fontSize: 16, display: 'block' }} ellipsis={{ tooltip: true }}>
                        {selectedStudentBlock.student.firstName}{' '}
                        {selectedStudentBlock.student.lastName}
                      </Text>

                      <Text
                        type="secondary"
                        style={{ fontSize: 12, display: 'block' }}
                        ellipsis={{ tooltip: selectedStudentBlock.student.email }}
                      >
                        {selectedStudentBlock.student.email}
                      </Text>
                    </div>
                  </Col>

                  <Col xs={24} sm={8}>
                    <div style={{ width: '100%' }}>
                      <Text
                        type="secondary"
                        style={{ fontSize: 12, display: 'block', marginBottom: 6 }}
                      >
                        Filtrer ses cours par statut :
                      </Text>
                      <Select
                        value={statusFilter}
                        onChange={setStatusFilter}
                        size="middle"
                        style={{ width: '100%' }}
                      >
                        <Option value="all">Tous les statuts</Option>
                        <Option value="pending">En attente</Option>
                        <Option value="active">Actives</Option>
                        <Option value="completed">Terminées</Option>
                        <Option value="cancelled">Annulées</Option>
                      </Select>
                    </div>
                  </Col>

                  <Col xs={24} sm={6}>
                    <Popconfirm
                      title="Accès global ?"
                      description="Cela va activer l'accès à toutes les formations pour cet étudiant."
                      okText="Oui, activer"
                      cancelText="Annuler"
                      onConfirm={() =>
                        handleGrantAllCourses(selectedStudentBlock.student._id)
                      }
                      disabled={grantAllLoading}
                    >
                      <Button
                        type="primary"
                        icon={<BookOutlined />}
                        loading={grantAllLoading}
                        block={isMobile}
                        style={{ width: '100%' }}
                      >
                        Accès global
                      </Button>
                    </Popconfirm>
                  </Col>
                </Row>

                {filteredEnrollmentsForStudent.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Aucune inscription ne correspond à ce filtre pour cet étudiant."
                  />
                ) : (
                  <Space direction="vertical" size={12} style={{ width: '100%' }}>
                    {filteredEnrollmentsForStudent.map((enr) => (
                      <Card
                        key={enr._id}
                        size="small"
                        style={{ borderRadius: 12, maxWidth: '100%' }}
                        bodyStyle={{ padding: isMobile ? 12 : 16 }}
                      >
                        <Row gutter={[12, 12]} align="top">
                          {/* Bloc infos cours */}
                          <Col xs={24} md={14}>
                            <div style={{ minWidth: 0 }}>
                              <Text strong style={{ display: 'block' }} ellipsis={{ tooltip: true }}>
                                {enr.course?.title || 'Cours inconnu'}
                              </Text>

                              {enr.course?.slug && (
                                <Tag
                                  color="geekblue"
                                  style={{
                                    marginTop: 6,
                                    fontSize: 11,
                                    display: 'inline-block',
                                    maxWidth: '100%',
                                  }}
                                >
                                  <span
                                    style={{
                                      display: 'inline-block',
                                      maxWidth: '100%',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap',
                                      verticalAlign: 'bottom',
                                    }}
                                    title={enr.course.slug}
                                  >
                                    {enr.course.slug}
                                  </span>
                                </Tag>
                              )}

                              <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 6 }}>
                                Demandé le :{' '}
                                {enr.createdAt ? new Date(enr.createdAt).toLocaleString('fr-FR') : '—'}
                              </Text>

                              {enr.startedAt && (
                                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                                  Activé le : {new Date(enr.startedAt).toLocaleDateString('fr-FR')}
                                </Text>
                              )}
                            </div>
                          </Col>

                          {/* Bloc actions / statut */}
                          <Col xs={24} md={10}>
                            <div style={{ width: '100%' }}>
                              <Space direction="vertical" size={10} style={{ width: '100%' }}>
                                <Row gutter={[8, 8]} align="middle">
                                  <Col xs={24} sm={10} style={{ minWidth: 0 }}>
                                    <div style={{ width: '100%' }}>
                                      {renderStatusTag(enr.status)}
                                    </div>
                                  </Col>

                                  <Col xs={24} sm={14} style={{ minWidth: 0 }}>
                                    <Select
                                      value={enr.status}
                                      onChange={(value) =>
                                        handleStatusChange(enr._id, value)
                                      }
                                      size="middle"
                                      style={{ width: '100%' }}
                                    >
                                      <Option value="pending">En attente</Option>
                                      <Option value="active">Active (acceptée)</Option>
                                      <Option value="completed">Terminée</Option>
                                      <Option value="cancelled">Annulée</Option>
                                    </Select>
                                  </Col>
                                </Row>

                                <Space
                                  direction={isMobile ? 'vertical' : 'horizontal'}
                                  size={8}
                                  style={{
                                    width: '100%',
                                    justifyContent: isMobile ? 'stretch' : 'flex-end',
                                  }}
                                >
                                  {enr.status === 'pending' && (
                                    <Button
                                      size="middle"
                                      type="primary"
                                      block={isMobile}
                                      onClick={() =>
                                        handleStatusChange(enr._id, 'active')
                                      }
                                    >
                                      Accepter
                                    </Button>
                                  )}

                                  {enr.course?._id && (
                                    <Button
                                      size="middle"
                                      block={isMobile}
                                      onClick={() =>
                                        navigate(`/admin/courses/${enr.course._id}`)
                                      }
                                    >
                                      Ouvrir le cours
                                    </Button>
                                  )}
                                </Space>
                              </Space>
                            </div>
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
