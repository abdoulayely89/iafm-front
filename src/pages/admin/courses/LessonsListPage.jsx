// src/pages/admin/courses/LessonsListPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Table, Button, Tag, Space, Typography, message } from 'antd'
import {
  PlusOutlined,
  EditOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text } = Typography

function LessonsListPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchLessons() {
      setLoading(true)
      try {
        const { data } = await api.get(`/admin/courses/${courseId}/lessons`)
        setLessons(data.lessons || [])
      } catch (e) {
        message.error("Impossible de charger les leçons.")
        setLessons([])
      } finally {
        setLoading(false)
      }
    }
    fetchLessons()
  }, [courseId])

  const columns = [
    {
      title: 'Module',
      dataIndex: 'moduleTitle',
      key: 'moduleTitle',
    },
    {
      title: 'Titre de la leçon',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Ordre',
      dataIndex: 'order',
      key: 'order',
      width: 80,
    },
    {
      title: 'Durée (min)',
      dataIndex: 'durationMinutes',
      key: 'durationMinutes',
      width: 110,
      render: (v) => v || 0,
    },
    {
      title: 'Quiz',
      dataIndex: 'hasQuiz',
      key: 'hasQuiz',
      width: 90,
      render: (hasQuiz) =>
        hasQuiz ? <Tag color="green">Oui</Tag> : <Tag>Non</Tag>,
    },
    {
      title: 'Preview gratuite',
      dataIndex: 'isFreePreview',
      key: 'isFreePreview',
      width: 140,
      render: (val) =>
        val ? <Tag color="blue">Preview</Tag> : <Tag>Privée</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 220,
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() =>
              navigate(
                `/admin/courses/${courseId}/lessons/${record._id}`
              )
            }
          >
            Éditer
          </Button>
          <Button
            icon={<QuestionCircleOutlined />}
            size="small"
            type={record.hasQuiz ? 'primary' : 'default'}
            onClick={() =>
              navigate(`/admin/lessons/${record._id}/quiz`)
            }
          >
            Quiz
          </Button>
        </Space>
      ),
    },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="page">
      <Title level={2}>Leçons du cours</Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        Course ID : <Text code>{courseId}</Text>
      </Text>

      <Button
        type="primary"
        icon={<PlusOutlined />}
        style={{ marginBottom: 16 }}
        onClick={() => navigate(`/admin/courses/${courseId}/lessons/new`)}
      >
        Nouvelle leçon
      </Button>

      <Table
        rowKey="_id"
        dataSource={lessons}
        columns={columns}
      />
    </div>
  )
}

export default LessonsListPage
