// src/components/courses/CourseGrid.jsx
import React from 'react'
import { Row, Col, Empty } from 'antd'
import CourseCard from './CourseCard'

function CourseGrid({ courses = [] }) {
  if (!courses || courses.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description="Aucune formation disponible pour le moment."
      />
    )
  }

  return (
    <Row gutter={[24, 24]}>
      {courses.map((course) => (
        <Col
          key={course._id || course.slug}
          xs={24}
          sm={12}
          md={8}
          lg={6}
        >
          <CourseCard course={course} />
        </Col>
      ))}
    </Row>
  )
}

export default CourseGrid
