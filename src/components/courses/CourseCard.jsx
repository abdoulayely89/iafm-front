// src/components/courses/CourseCard.jsx
import React from 'react'
import { Card, Tag, Typography } from 'antd'
import { Link } from 'react-router-dom'

const { Paragraph, Text } = Typography

function formatPrice(price) {
  if (!price || Number(price) === 0) return 'Gratuit'
  return `${Number(price).toLocaleString('fr-FR')} FCFA`
}

function CourseCard({ course }) {
  const thumbnailUrl =
    course.thumbnailUrl ||
    course.imageUrl ||
    'https://via.placeholder.com/400x250?text=Formation+IAFM'

  return (
    <Card
      hoverable
      className="course-card"
      style={{
        height: '100%',
        borderRadius: 18,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
      bodyStyle={{
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
      cover={
        <div className="course-card-coverWrapper">
          <div className="course-card-coverInner">
            <img
              alt={course.title}
              src={thumbnailUrl}
              className="course-card-cover"
            />
          </div>
        </div>
      }
    >
      <div className="course-card-body">
        {/* Titre multi-lignes, jamais tronqué */}
        <Link
          to={`/courses/${course.slug}`}
          className="course-card-titleLink"
        >
          <span className="course-card-titleText">
            {course.title || 'Formation IAFM'}
          </span>
        </Link>

        {/* Description courte (2 lignes max, mais le titre lui n’est pas ellipsis) */}
        {course.description && (
          <Paragraph
            type="secondary"
            className="course-card-description"
            ellipsis={{ rows: 2 }}
          >
            {course.description}
          </Paragraph>
        )}

        <div className="course-card-meta">
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Tag>{course.level || 'Tous niveaux'}</Tag>
            {course.isFeatured && <Tag color="gold">En vedette</Tag>}
          </div>
          <Text strong>{formatPrice(course.price)}</Text>
        </div>
      </div>
    </Card>
  )
}

export default CourseCard
