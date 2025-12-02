// src/pages/admin/books/BookRequestsPage.jsx
import React, { useEffect, useState, useMemo } from 'react'
import {
  Card,
  Table,
  Typography,
  Tag,
  Select,
  Space,
  Row,
  Col,
  message,
} from 'antd'
import {
  UserOutlined,
  FilePdfOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text } = Typography
const { Option } = Select

function BookRequestsPage() {
  const [loading, setLoading] = useState(true)
  const [requests, setRequests] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/book-requests')
      setRequests(data.requests || [])
    } catch (e) {
      console.error(e)
      setRequests([])
      message.error("Impossible de charger les demandes de livres.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRequests()
  }, [])

  const handleStatusChange = async (id, status) => {
    try {
      await api.put(`/admin/book-requests/${id}`, { status })
      message.success('Demande mise à jour.')
      fetchRequests()
    } catch (e) {
      console.error(e)
      message.error("Impossible de mettre à jour la demande.")
    }
  }

  const renderStatusTag = (status) => {
    switch (status) {
      case 'pending':
        return <Tag color="orange">En attente</Tag>
      case 'approved':
        return <Tag color="green">Approuvée</Tag>
      case 'rejected':
        return <Tag color="red">Refusée</Tag>
      case 'cancelled':
        return <Tag>Annulée</Tag>
      default:
        return <Tag>{status || '—'}</Tag>
    }
  }

  const stats = useMemo(() => {
    const total = requests.length
    const pending = requests.filter((r) => r.status === 'pending').length
    const approved = requests.filter((r) => r.status === 'approved').length
    const rejected = requests.filter((r) => r.status === 'rejected').length
    return { total, pending, approved, rejected }
  }, [requests])

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests
    return requests.filter((r) => r.status === statusFilter)
  }, [requests, statusFilter])

  const columns = [
    {
      title: 'Étudiant',
      key: 'student',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>
            {record.student?.firstName} {record.student?.lastName}
          </Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.student?.email}
          </Text>
        </Space>
      ),
    },
    {
      title: 'Pack PDF',
      key: 'book',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Space>
            <FilePdfOutlined />
            <Text>{record.book?.title || '—'}</Text>
          </Space>
          {record.book?.slug && (
            <Tag color="geekblue" style={{ fontSize: 11 }}>
              {record.book.slug}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (status, record) => (
        <Space direction="vertical" size={4}>
          {renderStatusTag(status)}
          <Select
            value={status}
            onChange={(value) => handleStatusChange(record._id, value)}
            size="small"
            style={{ minWidth: 150 }}
          >
            <Option value="pending">En attente</Option>
            <Option value="approved">Approuvée</Option>
            <Option value="rejected">Refusée</Option>
            <Option value="cancelled">Annulée</Option>
          </Select>
        </Space>
      ),
    },
    {
      title: 'Dates',
      key: 'dates',
      render: (_, record) => (
        <Space direction="vertical" size={0}>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Demandé le :{' '}
            {record.createdAt
              ? new Date(record.createdAt).toLocaleString('fr-FR')
              : '—'}
          </Text>
          {record.approvedAt && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Approuvé le :{' '}
              {new Date(record.approvedAt).toLocaleString('fr-FR')}
            </Text>
          )}
        </Space>
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
          Demandes de packs PDF
        </Title>
        <Text type="secondary">
          Valide manuellement les accès aux packs PDF après paiement
          (WhatsApp, virement, etc.).
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Space>
              <UserOutlined style={{ fontSize: 22, color: '#1890ff' }} />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Total demandes
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
              <ClockCircleOutlined
                style={{ fontSize: 22, color: '#fa8c16' }}
              />
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
              <CheckCircleOutlined
                style={{ fontSize: 22, color: '#52c41a' }}
              />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Approuvées
                </Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {stats.approved}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={6}>
          <Card size="small" style={{ borderRadius: 12 }}>
            <Space>
              <CloseCircleOutlined
                style={{ fontSize: 22, color: '#ff4d4f' }}
              />
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Refusées / Annulées
                </Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {stats.rejected}
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Liste */}
      <Card
        bordered={false}
        style={{ borderRadius: 16, boxShadow: '0 8px 24px rgba(0,0,0,0.04)' }}
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
            <Text strong>Liste des demandes</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Filtre par statut pour traiter rapidement les demandes en
              attente.
            </Text>
          </Space>

          <Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Filtrer par statut :
            </Text>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              size="small"
              style={{ minWidth: 180 }}
            >
              <Option value="all">Tous les statuts</Option>
              <Option value="pending">En attente</Option>
              <Option value="approved">Approuvées</Option>
              <Option value="rejected">Refusées</Option>
              <Option value="cancelled">Annulées</Option>
            </Select>
          </Space>
        </div>

        <Table
          rowKey="_id"
          dataSource={filteredRequests}
          columns={columns}
          pagination={{ pageSize: 10 }}
        />
      </Card>
    </div>
  )
}

export default BookRequestsPage
