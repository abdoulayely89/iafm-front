import React, { useEffect, useState } from 'react'
import { Typography, Input, Select, Row, Col, Tag } from 'antd'
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

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true)
      try {
        const params = {}
        if (search) params.search = search
        if (level) params.level = level
        const { data } = await api.get('/courses', { params })

        const rawCourses = data.courses || []
        // on ne fait que passer les données, CourseGrid gère thumbnailUrl
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
                ? "Aucune formation"
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
