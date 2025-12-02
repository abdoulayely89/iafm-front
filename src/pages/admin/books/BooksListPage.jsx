// src/pages/admin/books/BooksListPage.jsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  Button,
  Table,
  Typography,
  Tag,
  Card,
  Space,
  Popconfirm,
  message,
  Row,
  Col,
} from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOutlined,
  PlusOutlined,
  FilePdfOutlined,
  StarFilled,
} from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'
import './BooksListPage.css'

const { Title, Text } = Typography

function BooksListPage() {
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const navigate = useNavigate()

  const fetchBooks = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/books')
      setBooks(data.books || [])
    } catch (e) {
      console.error(e)
      setBooks([])
      message.error("Impossible de charger les livres.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBooks()
  }, [])

  const handleDelete = async (id) => {
    try {
      await api.delete(`/admin/books/${id}`)
      message.success('Pack PDF supprimé.')
      fetchBooks()
    } catch (e) {
      console.error(e)
      message.error('Erreur lors de la suppression du pack.')
    }
  }

  const stats = useMemo(() => {
    const total = books.length
    const publicCount = books.filter((b) => b.isPublic).length
    const featured = books.filter((b) => b.isFeatured).length
    const withFiles = books.filter((b) => (b.files || []).length > 0).length
    return { total, publicCount, featured, withFiles }
  }, [books])

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      fixed: 'left',
      width: 260,
      render: (text, record) => (
        <Space align="center">
          <div className="admin-books-title-icon">
            <BookOutlined />
          </div>
          <div className="admin-books-title-cell">
            <Link
              to={`/admin/books/${record._id}`}
              className="admin-books-title-link"
            >
              {text}
            </Link>
            <div className="admin-books-title-meta">
              {record.isFeatured && (
                <Tag
                  color="gold"
                  icon={<StarFilled />}
                  style={{ marginRight: 4 }}
                >
                  En avant
                </Tag>
              )}
              {!record.isPublic && (
                <Tag color="default" style={{ fontSize: 11 }}>
                  Masqué
                </Tag>
              )}
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      width: 180,
      responsive: ['md'],
      render: (slug) =>
        slug ? (
          <Tag color="geekblue" className="admin-books-slug-tag">
            {slug}
          </Tag>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: 'Prix',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      render: (price) =>
        !price || Number(price) === 0 ? (
          <Tag color="green">Gratuit</Tag>
        ) : (
          <Text strong>
            {Number(price).toLocaleString('fr-FR')} FCFA
          </Text>
        ),
    },
    {
      title: 'Fichiers',
      dataIndex: 'files',
      key: 'files',
      width: 140,
      responsive: ['sm'],
      render: (files = []) => (
        <Space size={4}>
          <FilePdfOutlined />
          <Text>{files.length} PDF</Text>
        </Space>
      ),
    },
    {
      title: 'Visibilité',
      key: 'visibility',
      width: 140,
      responsive: ['md'],
      render: (_, record) => (
        <Space direction="vertical" size={2}>
          <Tag color={record.isPublic ? 'blue' : 'default'}>
            {record.isPublic ? 'Visible' : 'Masqué'}
          </Tag>
          {record.isFeatured && (
            <Tag color="gold" style={{ fontSize: 11 }}>
              Mis en avant
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      fixed: 'right',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            onClick={() => navigate(`/admin/books/${record._id}`)}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Supprimer ce pack ?"
            description="Cette action est définitive."
            okText="Oui"
            cancelText="Non"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button size="small" danger>
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="page admin-books-page">
      {/* HERO / HEADER */}
      <Card
        className="admin-books-hero"
        bordered={false}
        bodyStyle={{ padding: 20 }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Space align="start" size="large">
              <div className="admin-books-hero-icon">
                <BookOutlined />
              </div>
              <div>
                <Title level={3} style={{ marginBottom: 4 }}>
                  Packs PDF & Livres
                </Title>
                <Text type="secondary">
                  Gère les packs PDF, leur visibilité sur le site, les fichiers
                  attachés et les éléments mis en avant sur la page d’accueil.
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate('/admin/books/new')}
              className="admin-books-new-btn"
            >
              Nouveau pack PDF
            </Button>
          </Col>
        </Row>
      </Card>

      {/* STATS */}
      <Row gutter={[16, 16]} className="admin-books-stats-row">
        <Col xs={12} md={6}>
          <Card className="admin-books-stat-card" size="small">
            <Text className="admin-books-stat-label">Total packs</Text>
            <div className="admin-books-stat-value">{stats.total}</div>
            <Text type="secondary" className="admin-books-stat-sub">
              Tous les packs créés
            </Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="admin-books-stat-card" size="small">
            <Text className="admin-books-stat-label">Visibles</Text>
            <div className="admin-books-stat-value">
              {stats.publicCount}
            </div>
            <Text type="secondary" className="admin-books-stat-sub">
              Affichés sur le site
            </Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="admin-books-stat-card" size="small">
            <Text className="admin-books-stat-label">Mis en avant</Text>
            <div className="admin-books-stat-value">
              {stats.featured}
            </div>
            <Text type="secondary" className="admin-books-stat-sub">
              Apparition en home
            </Text>
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="admin-books-stat-card" size="small">
            <Text className="admin-books-stat-label">
              Avec fichiers PDF
            </Text>
            <div className="admin-books-stat-value">
              {stats.withFiles}
            </div>
            <Text type="secondary" className="admin-books-stat-sub">
              Prêts à être vendus
            </Text>
          </Card>
        </Col>
      </Row>

      {/* TABLE */}
      <Card
        bordered={false}
        className="admin-books-table-card"
        bodyStyle={{ padding: 0 }}
      >
        <Table
          rowKey="_id"
          dataSource={books}
          columns={columns}
          size="middle"
          className="admin-books-table"
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

export default BooksListPage
