import React from 'react'
import { Typography, Row, Col, Button, Collapse } from 'antd'

const { Title, Paragraph } = Typography
const { Panel } = Collapse

function CmsBlockRenderer({ blocks }) {
  if (!blocks || !blocks.length) return null

  return (
    <div className="cms-blocks">
      {blocks.map((block, idx) => {
        // Normalisation : on accepte à la fois block.data et block.props
        const data = block.data || block.props || {}
        const type = (block.type || '').toLowerCase()

        // === HERO ===
        if (type === 'hero') {
          const { title, subtitle, imageUrl, ctaText } = data

          return (
            <div key={idx} className="cms-hero">
              <Row gutter={32} align="middle">
                <Col xs={24} md={14}>
                  {title && <Title>{title}</Title>}
                  {subtitle && (
                    <Paragraph type="secondary">{subtitle}</Paragraph>
                  )}
                  {ctaText && (
                    <Button type="primary" size="large">
                      {ctaText}
                    </Button>
                  )}
                </Col>
                {imageUrl && (
                  <Col xs={24} md={10}>
                    <img
                      src={imageUrl}
                      alt={title || 'Hero'}
                      className="cms-hero-image"
                    />
                  </Col>
                )}
              </Row>
            </div>
          )
        }

        // === RICHTEXT ===
        // on accepte "richtext" (backend) et "richText" (ancien front)
        if (type === 'richtext') {
          const { title, html, text } = data

          return (
            <div key={idx} className="cms-section">
              {title && <Title level={3}>{title}</Title>}
              {html ? (
                <div
                  className="cms-richtext"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              ) : text ? (
                <Paragraph>{text}</Paragraph>
              ) : null}
            </div>
          )
        }

        // === FAQ ===
        if (type === 'faq') {
          const { title, items } = data

          return (
            <div key={idx} className="cms-section">
              <Title level={3}>{title || 'FAQ'}</Title>
              <Collapse accordion>
                {(items || []).map((item, i) => (
                  <Panel header={item.question} key={i}>
                    <Paragraph>{item.answer}</Paragraph>
                  </Panel>
                ))}
              </Collapse>
            </div>
          )
        }

        return null
      })}
    </div>
  )
}

export default CmsBlockRenderer
