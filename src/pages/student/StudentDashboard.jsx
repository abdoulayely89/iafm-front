import React, { useEffect, useState } from 'react'
import { Card, Col, Row, Statistic, Typography, List } from 'antd'
import api from '../../services/api'
import PageLoader from '../../components/common/PageLoader'

const { Title } = Typography

function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [myCourses, setMyCourses] = useState([])

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const { data } = await api.get('/student/my-courses')
        setMyCourses(data.enrollments || [])
      } catch (e) {
        setMyCourses([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <PageLoader />

  return (
    <div className="page">
      <Title level={2}>Mon espace</Title>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic title="Cours suivis" value={myCourses.length} />
          </Card>
        </Col>
      </Row>
      <Card title="Dernières inscriptions">
        <List
          dataSource={myCourses.slice(0, 5)}
          renderItem={(enrollment) => (
            <List.Item>
              {enrollment.course?.title}
            </List.Item>
          )}
        />
      </Card>
    </div>
  )
}

export default StudentDashboard
