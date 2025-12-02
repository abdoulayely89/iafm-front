// src/pages/admin/courses/CoursesListPage.jsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  Button,
  Table,
  Typography,
  Tag,
  Card,
  Row,
  Col,
  Space,
  message,
  Modal,
} from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  BookOutlined,
  CheckCircleOutlined,
  EyeInvisibleOutlined,
} from '@ant-design/icons'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'
import './CoursesListPage.css'

const { Title, Text } = Typography
const { confirm } = Modal

function formatPrice(price) {
  if (!price || Number(price) === 0) return 'Gratuit'
  return `${Number(price).toLocaleString('fr-FR')} FCFA`
}

function CoursesListPage() {
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState([])
  const navigate = useNavigate()

  const fetchCourses = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/courses')
      setCourses(data.courses || [])
    } catch (e) {
      console.error(e)
      setCourses([])
      message.error("Impossible de charger les cours.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  const handleDelete = (course) => {
    confirm({
      title: 'Supprimer ce cours ?',
      content: (
        <>
          <p>
            <strong>{course.title}</strong>
          </p>
          <p style={{ margin: 0 }}>
            Cette action est irréversible. Les leçons et inscriptions liées
            pourraient être impactées.
          </p>
        </>
      ),
      okText: 'Supprimer',
      okType: 'danger',
      cancelText: 'Annuler',
      onOk: async () => {
        try {
          await api.delete(`/admin/courses/${course._id}`)
          message.success('Cours supprimé avec succès.')
          fetchCourses()
        } catch (e) {
          console.error(e)
          message.error("Impossible de supprimer ce cours.")
        }
      },
    })
  }

  // 📊 Stats
  const stats = useMemo(() => {
    const total = courses.length
    const published = courses.filter((c) => c.status === 'published').length
    const draft = courses.filter((c) => c.status !== 'published').length
    return { total, published, draft }
  }, [courses])

  const columns = [
    {
      title: 'Cours',
      dataIndex: 'title',
      key: 'title',
      fixed: 'left',
      width: 280,
      render: (_, record) => (
        <Space align="center" className="admin-courses-title-wrapper">
          <div className="admin-courses-title-icon">
            <BookOutlined />
          </div>
          <div className="admin-courses-title-text">
            <Link
              to={`/admin/courses/${record._id}`}
              className="admin-courses-title-link"
            >
              {record.title || 'Sans titre'}
            </Link>
            <div className="admin-courses-title-meta">
              {record.slug && (
                <Tag
                  color="geekblue"
                  className="admin-courses-slug-tag"
                >
                  {record.slug}
                </Tag>
              )}
              {record.status === 'published' && (
                <Tag color="green" className="admin-courses-small-tag">
                  Publié
                </Tag>
              )}
              {record.status !== 'published' && (
                <Tag color="default" className="admin-courses-small-tag">
                  Brouillon
                </Tag>
              )}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Niveau',
      dataIndex: 'level',
      key: 'level',
      width: 130,
      responsive: ['sm'],
      render: (level) =>
        level ? <Tag color="purple">{level}</Tag> : <Tag>—</Tag>,
    },
    {
      title: 'Prix',
      dataIndex: 'price',
      key: 'price',
      width: 140,
      render: (price) => (
        <Text strong>{formatPrice(price)}</Text>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      responsive: ['md'],
      render: (status) => {
        if (status === 'published') {
          return <Tag color="green">Publié</Tag>
        }
        if (status === 'draft') {
          return <Tag color="default">Brouillon</Tag>
        }
        return <Tag color="default">{status || '—'}</Tag>
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/courses/${record._id}`)}
          >
            Modifier
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          >
            Supprimer
          </Button>
        </Space>
      ),
    },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="page admin-courses-page">
      {/* HERO / HEADER */}
      <Card
        className="admin-courses-hero"
        bordered={false}
        bodyStyle={{ padding: 20 }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Space align="start" size="large">
              <div className="admin-courses-hero-icon">
                <BookOutlined />
              </div>
              <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                  Cours & formations
                </Title>
                <Text type="secondary">
                  Gère l’ensemble des formations de la plateforme : création,
                  prix, statut de publication et mise en avant.
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/courses/new')}
              className="admin-courses-new-btn"
            >
              Nouveau cours
            </Button>
          </Col>
        </Row>
      </Card>

      {/* STATS */}
      <Row gutter={[16, 16]} className="admin-courses-stats-row">
        <Col xs={12} md={8}>
          <Card className="admin-courses-stat-card" size="small">
            <Space align="center">
              <BookOutlined
                style={{ fontSize: 22, color: '#1890ff' }}
              />
              <div>
                <Text className="admin-courses-stat-label">
                  Total cours
                </Text>
                <div className="admin-courses-stat-value">
                  {stats.total}
                </div>
                <Text
                  type="secondary"
                  className="admin-courses-stat-sub"
                >
                  Tous les cours créés
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={12} md={8}>
          <Card className="admin-courses-stat-card" size="small">
            <Space align="center">
              <CheckCircleOutlined
                style={{ fontSize: 22, color: '#52c41a' }}
              />
              <div>
                <Text className="admin-courses-stat-label">
                  Publiés
                </Text>
                <div className="admin-courses-stat-value">
                  {stats.published}
                </div>
                <Text
                  type="secondary"
                  className="admin-courses-stat-sub"
                >
                  Visibles côté étudiants
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card className="admin-courses-stat-card" size="small">
            <Space align="center">
              <EyeInvisibleOutlined
                style={{ fontSize: 22, color: '#faad14' }}
              />
              <div>
                <Text className="admin-courses-stat-label">
                  Brouillons
                </Text>
                <div className="admin-courses-stat-value">
                  {stats.draft}
                </div>
                <Text
                  type="secondary"
                  className="admin-courses-stat-sub"
                >
                  À finaliser / non publiés
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
      <Card
        bordered={false}
        className="admin-courses-table-card"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          rowKey="_id"
          dataSource={courses}
          columns={columns}
          size="middle"
          className="admin-courses-table"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showLessItems: true,
            responsive: true,
          }}
          scroll={{ x: 'max-content' }}
        />
      </Card>
    </div>
  )
}

export default CoursesListPage
