import React from 'react'
import { List, Tag } from 'antd'

function LessonList({ lessons, currentLessonId, onSelect }) {
  return (
    <List
      bordered
      dataSource={lessons}
      renderItem={(lesson) => (
        <List.Item
          className={lesson._id === currentLessonId ? 'lesson-item active' : 'lesson-item'}
          onClick={() => onSelect && onSelect(lesson)}
        >
          <div className="lesson-item-main">
            <div className="lesson-title">{lesson.title}</div>
            <div className="lesson-meta">
              {lesson.isFreePreview && <Tag color="green">Preview</Tag>}
              {lesson.durationMinutes ? <span>{lesson.durationMinutes} min</span> : null}
            </div>
          </div>
        </List.Item>
      )}
    />
  )
}

export default LessonList
