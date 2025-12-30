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
  Grid,
  List,
  Card,
  Empty,
} from 'antd'
import { Link, useNavigate } from 'react-router-dom'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text } = Typography
const { useBreakpoint } = Grid

function CmsPagesListPage() {
  const [loading, setLoading] = useState(true)
  const [pages, setPages] = useState([])
  const [deletingId, setDeletingId] = useState(null)
  const navigate = useNavigate()

  const screens = useBreakpoint()
  const isMobile = !screens.sm

  async function fetchPages() {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/cms/pages')
      setPages(data.pages || [])
    } catch (e) {
      console.error(e)
      setPages([])
      message.error('Impossible de charger les pages CMS.')
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
      message.error('Impossible de supprimer cette page.')
    } finally {
      setDeletingId(null)
    }
  }

  const renderStatusTag = (status) => {
    switch (status) {
      case 'published':
        return <Tag style={{ marginInlineEnd: 0 }} color="green">Publié</Tag>
      case 'draft':
        return <Tag style={{ marginInlineEnd: 0 }} color="orange">Brouillon</Tag>
      case 'archived':
        return <Tag style={{ marginInlineEnd: 0 }}>Archivé</Tag>
      default:
        return <Tag style={{ marginInlineEnd: 0 }}>{status || '—'}</Tag>
    }
  }

  const columns = [
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text, record) => (
        <Link to={`/admin/cms/pages/${record._id}`}>
          <Text strong ellipsis={{ tooltip: true }}>
            {text}
          </Text>
        </Link>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      key: 'slug',
      ellipsis: true,
      render: (slug) => (
        <Text type="secondary" ellipsis={{ tooltip: `/${slug}` }}>
          /{slug}
        </Text>
      ),
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
        <Space size="small" wrap>
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

  if (loading) return <PageLoader />

  return (
    <div
      className="page"
      style={{
        maxWidth: '100%',
        overflowX: 'hidden',
      }}
    >
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          maxWidth: '100%',
        }}
      >
        <div style={{ minWidth: 0 }}>
          <Title level={2} style={{ marginBottom: 4 }}>
            Pages CMS
          </Title>
          <Text type="secondary" style={{ display: 'block', maxWidth: '100%' }}>
            Gère ici les pages de contenu de ton site (Accueil, À propos, FAQ, etc.).
          </Text>
        </div>

        <div style={{ width: isMobile ? '100%' : 'auto' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            block={isMobile}
            onClick={() => navigate('/admin/cms/pages/new')}
          >
            Nouvelle page
          </Button>
        </div>
      </div>

      {/* Desktop/Tablet: Table | Mobile: Cards/List (évite scroll horizontal + textes qui débordent) */}
      {isMobile ? (
        pages.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Aucune page CMS pour le moment."
          />
        ) : (
          <List
            dataSource={pages}
            rowKey={(p) => p._id}
            split={false}
            renderItem={(p) => (
              <List.Item style={{ paddingInline: 0 }}>
                <Card
                  size="small"
                  style={{ width: '100%', borderRadius: 12 }}
                  bodyStyle={{ padding: 12 }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {/* Titre + statut */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <Link to={`/admin/cms/pages/${p._id}`}>
                          <Text strong style={{ display: 'block' }} ellipsis={{ tooltip: true }}>
                            {p.title || 'Sans titre'}
                          </Text>
                        </Link>
                        <Text
                          type="secondary"
                          style={{ fontSize: 12, display: 'block' }}
                          ellipsis={{ tooltip: `/${p.slug}` }}
                        >
                          /{p.slug}
                        </Text>
                      </div>
                      <div style={{ flexShrink: 0 }}>{renderStatusTag(p.status)}</div>
                    </div>

                    {/* Actions */}
                    <Space direction="vertical" size={8} style={{ width: '100%' }}>
                      <Button
                        icon={<EditOutlined />}
                        block
                        onClick={() => navigate(`/admin/cms/pages/${p._id}`)}
                      >
                        Modifier
                      </Button>

                      <Popconfirm
                        title="Supprimer cette page ?"
                        description="Cette action est définitive. Confirme la suppression."
                        okText="Oui, supprimer"
                        cancelText="Annuler"
                        onConfirm={() => handleDelete(p._id)}
                      >
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          loading={deletingId === p._id}
                          block
                        >
                          Supprimer
                        </Button>
                      </Popconfirm>
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )
      ) : (
        <Table
          rowKey="_id"
          dataSource={pages}
          columns={columns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 'max-content' }}
        />
      )}
    </div>
  )
}

export default CmsPagesListPage
