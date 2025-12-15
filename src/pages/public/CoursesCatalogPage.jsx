import React, { useEffect, useState, useMemo } from 'react'
import { Typography, Input, Select, Row, Col, Tag, Card, Space, Button } from 'antd'
import { CrownOutlined, MessageOutlined } from '@ant-design/icons'
import api from '../../services/api'
import CourseGrid from '../../components/courses/CourseGrid'
import PageLoader from '../../components/common/PageLoader'

const { Title, Paragraph, Text } = Typography
const { Search } = Input
const { Option } = Select

function CoursesCatalogPage() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [level, setLevel] = useState('')

  // ✅ Abonnement (UI uniquement pour l’instant)
  const SUB_PRICE = 5000
  const whatsappMessage = useMemo(
    () =>
      `Bonjour, je souhaite m’abonner à IAFM (abonnement mensuel ${SUB_PRICE} FCFA) pour accéder à toutes les formations.`,
    [SUB_PRICE]
  )
  const whatsappUrl = `https://wa.me/221779110404?text=${encodeURIComponent(whatsappMessage)}`

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      try {
        const params = {}
        if (search) params.search = search
        if (level) params.level = level
        const { data } = await api.get('/courses', { params })

        const rawCourses = data.courses || []
        setCourses(rawCourses)
      } catch (e) {
        setCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetchCourses()
  }, [search, level])

  const total = courses.length

  return (
    <div className="page">
      {/* ✅ Bandeau abonnement */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          marginBottom: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        }}
        bodyStyle={{ padding: 18 }}
      >
        <Row gutter={[16, 12]} align="middle" justify="space-between">
          <Col xs={24} md={16}>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Space align="center">
                <CrownOutlined />
                <Text strong>Abonnement IAFM</Text>
                <Tag color="green">{SUB_PRICE.toLocaleString('fr-FR')} FCFA / mois</Tag>
              </Space>
              <Text type="secondary" style={{ lineHeight: 1.5 }}>
                Accédez à <b>toutes les formations</b> avec un abonnement mensuel. Idéal si vous
                suivez plusieurs parcours en même temps.
              </Text>
            </Space>
          </Col>

          <Col xs={24} md={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Space wrap>
              <Button
                type="primary"
                icon={<MessageOutlined />}
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                S’abonner via WhatsApp
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Row
        justify="space-between"
        align="middle"
        style={{ marginBottom: 24, rowGap: 16 }}
      >
        <Col xs={24} md={12}>
          <Title level={2} style={{ marginBottom: 4 }}>
            Toutes les formations
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            Explorez les parcours IAFM selon votre niveau et vos objectifs.
          </Paragraph>
          <Text type="secondary">
            <Tag style={{ marginTop: 8 }}>
              {total === 0
                ? 'Aucune formation'
                : total === 1
                ? '1 formation'
                : `${total} formations`}
            </Tag>
          </Text>
        </Col>

        <Col xs={24} md={12}>
          <Row gutter={12} justify="end">
            <Col xs={24} sm="auto">
              <Search
                placeholder="Rechercher une formation"
                allowClear
                onSearch={(value) => setSearch(value)}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: 260, maxWidth: '100%' }}
              />
            </Col>
            <Col xs={24} sm="auto">
              <Select
                allowClear
                placeholder="Niveau"
                style={{ width: 160, maxWidth: '100%' }}
                value={level || undefined}
                onChange={(value) => setLevel(value || '')}
              >
                <Option value="debutant">Débutant</Option>
                <Option value="intermediaire">Intermédiaire</Option>
                <Option value="avance">Avancé</Option>
              </Select>
            </Col>
          </Row>
        </Col>
      </Row>

      {loading ? <PageLoader /> : <CourseGrid courses={courses} />}
    </div>
  )
}

export default CoursesCatalogPage
