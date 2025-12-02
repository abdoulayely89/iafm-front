// src/pages/admin/AdminDashboard.jsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  Card,
  Col,
  Row,
  Statistic,
  Typography,
  Space,
  Button,
  List,
  Tag,
  Badge,
} from 'antd'
import {
  UserOutlined,
  BookOutlined,
  TeamOutlined,
  VideoCameraOutlined,
  FileTextOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import PageLoader from '../../components/common/PageLoader'

const { Title, Paragraph, Text } = Typography

function formatDateTime(value) {
  if (!value) return '-'
  const d = typeof value === 'string' ? new Date(value) : value
  return d.toLocaleString('fr-FR', {
    timeZone: 'Africa/Dakar',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    users: 0,
    courses: 0,
    enrollments: 0,
    books: 0,
    bookRequestsPending: 0,
  })
  const [liveSessions, setLiveSessions] = useState([])

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const [
          usersRes,
          coursesRes,
          enrollmentsRes,
          sessionsRes,
          booksRes,
          bookRequestsRes,
        ] = await Promise.all([
          api.get('/admin/users'),
          api.get('/admin/courses'),
          api.get('/admin/enrollments'),
          api.get('/admin/live-sessions/me').catch(() => ({
            data: { sessions: [] },
          })), // si jamais vide / non implémenté
          api.get('/admin/books').catch(() => ({ data: { books: [] } })),
          api
            .get('/admin/book-requests')
            .catch(() => ({ data: { requests: [] } })),
        ])

        const users = usersRes.data.users || []
        const courses = coursesRes.data.courses || []
        const enrollments = enrollmentsRes.data.enrollments || []
        const sessions = sessionsRes.data.sessions || []
        const books = booksRes.data.books || []
        const bookRequests = bookRequestsRes.data.requests || []

        const pendingBookRequests = bookRequests.filter(
          (r) => r.status === 'pending'
        ).length

        setStats({
          users: users.length,
          courses: courses.length,
          enrollments: enrollments.length,
          books: books.length,
          bookRequestsPending: pendingBookRequests,
        })

        setLiveSessions(sessions)
      } catch (e) {
        console.error(e)
        setStats({
          users: 0,
          courses: 0,
          enrollments: 0,
          books: 0,
          bookRequestsPending: 0,
        })
        setLiveSessions([])
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const nextSessions = useMemo(() => {
    if (!Array.isArray(liveSessions)) return []
    const now = new Date()
    return liveSessions
      .filter((s) => s.startAt && new Date(s.startAt) >= now)
      .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
      .slice(0, 4)
  }, [liveSessions])

  if (loading) return <PageLoader />

  return (
    <div className="page admin-dashboard-page">
      {/* HERO */}
      <Card bordered={false} className="admin-dashboard-hero">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Space direction="vertical" size={4}>
              <Text className="admin-dashboard-badge">
                Panneau de contrôle • IAFM
              </Text>
              <Title level={2} style={{ marginBottom: 0, color: '#0f172a' }}>
                Bienvenue sur le dashboard admin
              </Title>
              <Paragraph style={{ marginTop: 4, marginBottom: 0 }}>
                Pilote les cours, les utilisateurs, les inscriptions, les
                classes virtuelles et les packs PDF en un coup d’œil.
              </Paragraph>
            </Space>
          </Col>
          <Col
            xs={24}
            md={8}
            style={{
              textAlign: 'right',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Space
              direction="vertical"
              align="end"
              size={8}
              style={{ width: '100%', textAlign: 'right' }}
            >
              <Text type="secondary" style={{ fontSize: 12 }}>
                Actions rapides
              </Text>
              <Space wrap>
                <Link to="/admin/live-sessions">
                  <Button type="primary" icon={<VideoCameraOutlined />}>
                    Planifier une classe live
                  </Button>
                </Link>
                <Link to="/admin/courses">
                  <Button>Créer / gérer un cours</Button>
                </Link>
              </Space>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* STATS PRINCIPALES */}
      <Row gutter={[24, 24]} style={{ marginTop: 16 }}>
        <Col xs={24} md={6}>
          <Card bordered={false} className="stat-card stat-card-users">
            <Space align="start">
              <div className="stat-card-icon stat-card-icon-users">
                <UserOutlined />
              </div>
              <div className="stat-card-content">
                <Text type="secondary">Utilisateurs</Text>
                <Statistic
                  value={stats.users}
                  valueStyle={{ fontSize: 28, fontWeight: 600 }}
                />
                <Text className="stat-card-subtitle">
                  Étudiants, formateurs, admins
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card bordered={false} className="stat-card stat-card-courses">
            <Space align="start">
              <div className="stat-card-icon stat-card-icon-courses">
                <BookOutlined />
              </div>
              <div className="stat-card-content">
                <Text type="secondary">Cours</Text>
                <Statistic
                  value={stats.courses}
                  valueStyle={{ fontSize: 28, fontWeight: 600 }}
                />
                <Text className="stat-card-subtitle">
                  Programmes disponibles
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card
            bordered={false}
            className="stat-card stat-card-enrollments"
          >
            <Space align="start">
              <div className="stat-card-icon stat-card-icon-enrollments">
                <TeamOutlined />
              </div>
              <div className="stat-card-content">
                <Text type="secondary">Inscriptions</Text>
                <Statistic
                  value={stats.enrollments}
                  valueStyle={{ fontSize: 28, fontWeight: 600 }}
                />
                <Text className="stat-card-subtitle">
                  Accès actifs aux cours
                </Text>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={6}>
          <Card bordered={false} className="stat-card stat-card-books">
            <Space align="start">
              <div className="stat-card-icon stat-card-icon-books">
                <FileTextOutlined />
              </div>
              <div className="stat-card-content">
                <Text type="secondary">Packs PDF / Livres</Text>
                <Statistic
                  value={stats.books}
                  valueStyle={{ fontSize: 28, fontWeight: 600 }}
                />
                <Text className="stat-card-subtitle">
                  Packs publiés sur la plateforme
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* BLOC DU BAS : classes virtuelles + actions */}
      <Row gutter={[24, 24]} style={{ marginTop: 8 }}>
        {/* Prochaines classes virtuelles */}
        <Col xs={24} md={14}>
          <Card
            bordered={false}
            className="admin-dashboard-card"
            title={
              <Space>
                <VideoCameraOutlined />
                <span>Prochaines classes virtuelles</span>
              </Space>
            }
            extra={
              <Link to="/admin/live-sessions">
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Voir toutes <ArrowRightOutlined />
                </Text>
              </Link>
            }
          >
            {nextSessions.length === 0 ? (
              <Paragraph type="secondary" style={{ marginBottom: 0 }}>
                Aucune session live à venir pour le moment. Tu peux en créer
                une depuis la page{' '}
                <Link to="/admin/live-sessions">Classes virtuelles</Link>.
              </Paragraph>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={nextSessions}
                renderItem={(session) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <Space direction="vertical" size={0}>
                          <Text strong>{session.title}</Text>
                          {session.course && (
                            <Text
                              type="secondary"
                              style={{ fontSize: 12 }}
                            >
                              Cours : {session.course.title}
                            </Text>
                          )}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" size={2}>
                          <Text type="secondary">
                            {formatDateTime(session.startAt)} —{' '}
                            {formatDateTime(session.endAt)}
                          </Text>
                          <Space wrap size={6}>
                            {session.teacher && (
                              <Tag>
                                Formateur : {session.teacher.firstName}{' '}
                                {session.teacher.lastName}
                              </Tag>
                            )}
                            <Tag color="blue">
                              {Array.isArray(session.students)
                                ? `${session.students.length} participant(s)`
                                : '0 participant'}
                            </Tag>
                            <Tag color="purple">Jitsi</Tag>
                          </Space>
                        </Space>
                      }
                    />
                    {session.meetingUrl && (
                      <div>
                        <a
                          href={session.meetingUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Rejoindre
                        </a>
                      </div>
                    )}
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>

        {/* Actions rapides */}
        <Col xs={24} md={10}>
          <Card
            bordered={false}
            className="admin-dashboard-card"
            title="Actions rapides"
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Link to="/admin/courses">
                <Button block icon={<BookOutlined />}>
                  Gérer les cours
                </Button>
              </Link>

              <Link to="/admin/users">
                <Button block icon={<UserOutlined />}>
                  Gérer les utilisateurs
                </Button>
              </Link>

              <Link to="/admin/enrollments">
                <Button block icon={<TeamOutlined />}>
                  Voir les inscriptions
                </Button>
              </Link>

              <Link to="/admin/books">
                <Button block icon={<FileTextOutlined />}>
                  Gérer les packs PDF / livres
                </Button>
              </Link>

              <Link to="/admin/book-requests">
                <Button
                  block
                  icon={<FileTextOutlined />}
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  <span style={{ flex: 1 }}>Demandes de packs PDF</span>
                  {stats.bookRequestsPending > 0 && (
                    <Badge
                      count={stats.bookRequestsPending}
                      style={{ backgroundColor: '#faad14' }}
                    />
                  )}
                </Button>
              </Link>

              <Link to="/admin/media">
                <Button block>Gérer les médias</Button>
              </Link>

              <Link to="/admin/live-sessions">
                <Button block type="primary" icon={<VideoCameraOutlined />}>
                  Planifier une classe virtuelle
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default AdminDashboard
