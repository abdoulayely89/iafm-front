// src/pages/admin/books/BookRequestsPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
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
  Grid,
  Empty,
  Divider,
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
import './BookRequestsPage.css'

const { Title, Text } = Typography
const { Option } = Select
const { useBreakpoint } = Grid

function BookRequestsPage() {
  const screens = useBreakpoint()

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
    const rejected = requests.filter(
      (r) => r.status === 'rejected' || r.status === 'cancelled'
    ).length
    return { total, pending, approved, rejected }
  }, [requests])

  const filteredRequests = useMemo(() => {
    if (statusFilter === 'all') return requests
    return requests.filter((r) => r.status === statusFilter)
  }, [requests, statusFilter])

  const formatDate = (dt) => {
    if (!dt) return '—'
    try {
      return new Date(dt).toLocaleString('fr-FR')
    } catch {
      return '—'
    }
  }

  // ✅ Desktop table columns (lisibles, avec ellipsis, pas de vertical “cassé”)
  const columns = [
    {
      title: 'Étudiant',
      key: 'student',
      width: 260,
      render: (_, record) => {
        const name = `${record.student?.firstName || ''} ${record.student?.lastName || ''}`.trim() || '—'
        const email = record.student?.email || '—'
        return (
          <div className="br-cell">
            <Text strong className="br-ellipsis-1">{name}</Text>
            <Text type="secondary" className="br-ellipsis-1 br-muted">{email}</Text>
          </div>
        )
      },
    },
    {
      title: 'Pack PDF',
      key: 'book',
      render: (_, record) => {
        const title = record.book?.title || '—'
        const slug = record.book?.slug || ''
        return (
          <div className="br-cell">
            <div className="br-inline">
              <FilePdfOutlined />
              <Text className="br-ellipsis-2">{title}</Text>
            </div>
            {slug ? (
              <Tag color="geekblue" className="br-tag-slug">
                {slug}
              </Tag>
            ) : null}
          </div>
        )
      },
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      width: 240,
      render: (status, record) => (
        <div className="br-cell">
          <div className="br-inline">{renderStatusTag(status)}</div>
          <Select
            value={status}
            onChange={(value) => handleStatusChange(record._id, value)}
            size="middle"
            className="br-select"
          >
            <Option value="pending">En attente</Option>
            <Option value="approved">Approuvée</Option>
            <Option value="rejected">Refusée</Option>
            <Option value="cancelled">Annulée</Option>
          </Select>
        </div>
      ),
    },
    {
      title: 'Dates',
      key: 'dates',
      width: 260,
      render: (_, record) => (
        <div className="br-cell">
          <Text type="secondary" className="br-muted br-ellipsis-1">
            Demandé : {formatDate(record.createdAt)}
          </Text>
          {record.approvedAt ? (
            <Text type="secondary" className="br-muted br-ellipsis-1">
              Approuvé : {formatDate(record.approvedAt)}
            </Text>
          ) : null}
        </div>
      ),
    },
  ]

  if (loading) return <PageLoader />

  const isMobile = !screens.md

  return (
    <div className="page br-page">
      {/* Header */}
      <div className="br-header">
        <Title level={2} className="br-title">
          Demandes de packs PDF
        </Title>
        <Text type="secondary" className="br-subtitle">
          Valide manuellement les accès aux packs PDF après paiement (WhatsApp, virement, etc.).
        </Text>
      </div>

      {/* Stats */}
      <Row gutter={[12, 12]} className="br-stats">
        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="br-stat-card">
            <div className="br-stat">
              <UserOutlined className="br-stat-icon br-blue" />
              <div className="br-stat-content">
                <Text type="secondary" className="br-muted">Total demandes</Text>
                <Text strong className="br-stat-value">{stats.total}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="br-stat-card">
            <div className="br-stat">
              <ClockCircleOutlined className="br-stat-icon br-orange" />
              <div className="br-stat-content">
                <Text type="secondary" className="br-muted">En attente</Text>
                <Text strong className="br-stat-value">{stats.pending}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="br-stat-card">
            <div className="br-stat">
              <CheckCircleOutlined className="br-stat-icon br-green" />
              <div className="br-stat-content">
                <Text type="secondary" className="br-muted">Approuvées</Text>
                <Text strong className="br-stat-value">{stats.approved}</Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card size="small" className="br-stat-card">
            <div className="br-stat">
              <CloseCircleOutlined className="br-stat-icon br-red" />
              <div className="br-stat-content">
                <Text type="secondary" className="br-muted">Refusées / Annulées</Text>
                <Text strong className="br-stat-value">{stats.rejected}</Text>
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Liste */}
      <Card
        bordered={false}
        className="br-list-card"
        bodyStyle={{ padding: 16 }}
      >
        <div className="br-list-top">
          <div className="br-list-left">
            <Text strong className="br-list-title">Liste des demandes</Text>
            <Text type="secondary" className="br-muted br-list-hint">
              Filtre par statut pour traiter rapidement les demandes.
            </Text>
          </div>

          <div className="br-filter">
            <Text type="secondary" className="br-muted br-filter-label">Statut</Text>
            <Select
              value={statusFilter}
              onChange={setStatusFilter}
              size="middle"
              className="br-filter-select"
            >
              <Option value="all">Tous</Option>
              <Option value="pending">En attente</Option>
              <Option value="approved">Approuvées</Option>
              <Option value="rejected">Refusées</Option>
              <Option value="cancelled">Annulées</Option>
            </Select>
          </div>
        </div>

        <Divider className="br-divider" />

        {filteredRequests.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Aucune demande pour ce filtre."
          />
        ) : isMobile ? (
          // ✅ MOBILE: Cards propres (pas de table)
          <div className="br-cards">
            {filteredRequests.map((r) => {
              const studentName = `${r.student?.firstName || ''} ${r.student?.lastName || ''}`.trim() || '—'
              const studentEmail = r.student?.email || '—'
              const bookTitle = r.book?.title || '—'
              const bookSlug = r.book?.slug || ''
              const status = r.status

              return (
                <Card key={r._id} className="br-request-card" bordered={false}>
                  <div className="br-card-row">
                    <div className="br-card-col">
                      <Text strong className="br-ellipsis-1">{studentName}</Text>
                      <Text type="secondary" className="br-muted br-ellipsis-1">{studentEmail}</Text>
                    </div>
                    <div className="br-card-col-right">
                      {renderStatusTag(status)}
                    </div>
                  </div>

                  <div className="br-card-book">
                    <FilePdfOutlined />
                    <Text className="br-ellipsis-2">{bookTitle}</Text>
                  </div>

                  {bookSlug ? (
                    <Tag color="geekblue" className="br-tag-slug">
                      {bookSlug}
                    </Tag>
                  ) : null}

                  <div className="br-card-dates">
                    <Text type="secondary" className="br-muted br-ellipsis-1">
                      Demandé : {formatDate(r.createdAt)}
                    </Text>
                    {r.approvedAt ? (
                      <Text type="secondary" className="br-muted br-ellipsis-1">
                        Approuvé : {formatDate(r.approvedAt)}
                      </Text>
                    ) : null}
                  </div>

                  <div className="br-card-actions">
                    <Text type="secondary" className="br-muted br-filter-label">Changer statut</Text>
                    <Select
                      value={status}
                      onChange={(value) => handleStatusChange(r._id, value)}
                      size="middle"
                      className="br-select"
                    >
                      <Option value="pending">En attente</Option>
                      <Option value="approved">Approuvée</Option>
                      <Option value="rejected">Refusée</Option>
                      <Option value="cancelled">Annulée</Option>
                    </Select>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          // ✅ DESKTOP: Table
          <Table
            rowKey="_id"
            dataSource={filteredRequests}
            columns={columns}
            pagination={{ pageSize: 10, showSizeChanger: false }}
            className="br-table"
            scroll={{ x: 900 }}
          />
        )}
      </Card>
    </div>
  )
}

export default BookRequestsPage
