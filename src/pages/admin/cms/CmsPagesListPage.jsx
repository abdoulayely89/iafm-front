// src/pages/admin/cms/CmsPagesListPage.jsx
import React, { useEffect, useState } from 'react'
import {
  Button,
  Table,
  Typography,
  Space,
  Popconfirm,
  Tag,
  message,
} from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text } = Typography

function CmsPagesListPage() {
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState([])
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()

  async function fetchPages() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/cms/pages')
      setPages(data.pages || [])
    } catch (e) {
      console.error(e)
      setPages([])
      message.error("Impossible de charger les pages CMS.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPages()
  }, [])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/admin/cms/pages/${id}`)
      message.success('Page supprimée avec succès.')
      setPages((prev) => prev.filter((p) => p._id !== id))
    } catch (e) {
      console.error(e)
      message.error("Impossible de supprimer cette page.")
    } finally {
      setDeletingId(null)
    }
  }

  const renderStatusTag = (status) => {
    switch (status) {
      case 'published':
        return <Tag color="green">Publié</Tag>
      case 'draft':
        return <Tag color="orange">Brouillon</Tag>
      case 'archived':
        return <Tag>Archivé</Tag>
      default:
        return <Tag>{status || '—'}</Tag>
    }
  }

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Link to={`/admin/cms/pages/${record._id}`}>
          <Text strong>{text}</Text>
        </Link>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => <Text type="secondary">/{slug}</Text>,
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status) => renderStatusTag(status),
      width: 130,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => navigate(`/admin/cms/pages/${record._id}`)}
          >
            Modifier
          </Button>
          <Popconfirm
            title="Supprimer cette page ?"
            description="Cette action est définitive. Confirme la suppression."
            okText="Oui, supprimer"
            cancelText="Annuler"
            onConfirm={() => handleDelete(record._id)}
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
              loading={deletingId === record._id}
            >
              Supprimer
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className="page">
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <Title level={2} style={{ marginBottom: 4 }}>
            Pages CMS
          </Title>
          <Text type="secondary">
            Gère ici les pages de contenu de ton site (Accueil, À propos, FAQ,
            etc.).
          </Text>
        </div>
        <div>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/cms/pages/new')}
          >
            Nouvelle page
          </Button>
        </div>
      </div>

      {loading ? (
        <PageLoader />
      ) : (
        <Table
          rowKey="_id"
          dataSource={pages}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      )}
    </div>
  )
}

export default CmsPagesListPage
