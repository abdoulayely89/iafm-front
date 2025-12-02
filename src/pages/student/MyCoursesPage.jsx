import React, { useEffect, useState } from 'react'
import { List, Card, Typography, Tag, Button } from 'antd'
import { Link } from 'react-router-dom'
import api from '../../services/api'
import PageLoader from '../../components/common/PageLoader'
import './MyCoursesPage.css'

const { Title, Text, Paragraph } = Typography

function MyCoursesPage() {
  const [loading, setLoading] = useState(true)
  const [enrollments, setEnrollments] = useState([])

  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const { data } = await api.get('/student/my-courses')
        setEnrollments(data.enrollments || [])
      } catch (e) {
        setEnrollments([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <PageLoader />

  const hasCourses = enrollments && enrollments.length > 0

  return (
    <div className="my-courses-page">
      <div className="my-courses-container">
        {/* Header */}
        <div className="my-courses-header">
          <div>
            <Title level={2} className="my-courses-title">
              Mes cours
            </Title>
            <Text type="secondary" className="my-courses-subtitle">
              Retrouve ici tous les cours auxquels tu es inscrit.
            </Text>
          </div>
        </div>

        {/* Contenu */}
        {!hasCourses ? (
          <Card bordered={false} className="my-courses-empty-card">
            <Title level={4} className="my-courses-empty-title">
              Tu n&apos;es inscrit à aucun cours pour l&apos;instant
            </Title>
            <Paragraph type="secondary" className="my-courses-empty-text">
              Dès que tu t&apos;inscris à un cours, il apparaîtra ici pour un
              accès rapide.
            </Paragraph>
            <Button type="primary">
              <Link to="/courses">Voir le catalogue de cours</Link>
            </Button>
          </Card>
        ) : (
          <Card bordered={false} className="my-courses-list-card">
            <List
              className="my-courses-list"
              grid={{
                gutter: 16,
                xs: 1,
                sm: 1,
                md: 2,
                lg: 3,
                xl: 3,
              }}
              dataSource={enrollments}
              renderItem={(enrollment) => {
                const course = enrollment.course || {}
                const progress = enrollment.progress
                const thumbnail =
                  course.thumbnailUrl || course.imageUrl || null

                const rawDesc =
                  course.shortDescription || course.description || ''
                const shortDesc =
                  rawDesc.length > 200
                    ? `${rawDesc.slice(0, 200)}…`
                    : rawDesc

                return (
                  <List.Item className="my-course-list-item">
                    <Card
                      hoverable
                      className="my-course-card"
                      cover={
                        thumbnail ? (
                          <div className="my-course-card-imageWrapper">
                            <img
                              src={thumbnail}
                              alt={course.title}
                              className="my-course-card-image"
                            />
                          </div>
                        ) : null
                      }
                    >
                      <div className="my-course-card-body">
                        <div className="my-course-card-header">
                          {course.level && (
                            <Tag color="geekblue" className="my-course-tag">
                              {course.level}
                            </Tag>
                          )}
                          {course.language && (
                            <Tag color="blue" className="my-course-tag">
                              {course.language === 'fr' ? 'FR' : 'EN'}
                            </Tag>
                          )}
                          {enrollment.status && (
                            <Tag
                              color={
                                enrollment.status === 'completed'
                                  ? 'green'
                                  : 'gold'
                              }
                              className="my-course-tag"
                            >
                              {enrollment.status === 'completed'
                                ? 'Terminé'
                                : 'En cours'}
                            </Tag>
                          )}
                        </div>

                        <Title level={5} className="my-course-card-title">
                          <Link to={`/student/courses/${course._id}`}>
                            {course.title}
                          </Link>
                        </Title>

                        {shortDesc && (
                          <Paragraph className="my-course-card-description">
                            {shortDesc}
                          </Paragraph>
                        )}

                        {typeof progress === 'number' && (
                          <div className="my-course-card-progress">
                            <div className="my-course-card-progress-bar">
                              <div
                                className="my-course-card-progress-fill"
                                style={{
                                  width: `${Math.min(
                                    Math.max(progress, 0),
                                    100
                                  )}%`,
                                }}
                              />
                            </div>
                            <Text
                              type="secondary"
                              className="my-course-card-progress-label"
                            >
                              Progression : {progress}%
                            </Text>
                          </div>
                        )}

                        <div className="my-course-card-footer">
                          <Button type="primary" block>
                            <Link to={`/student/courses/${course._id}`}>
                              Continuer le cours
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )
              }}
            />
          </Card>
        )}
      </div>
    </div>
  )
}

export default MyCoursesPage
