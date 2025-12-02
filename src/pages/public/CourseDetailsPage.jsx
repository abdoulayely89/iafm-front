// src/pages/courses/CourseDetailsPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Typography,
  Row,
  Col,
  Card,
  Tag,
  Button,
  List,
  message,
  Divider,
} from 'antd'
import api from '../../services/api'
import PageLoader from '../../components/common/PageLoader'
import ErrorState from '../../components/common/ErrorState'
import { useAuth } from '../../context/AuthContext'
import './CourseDetailsPage.css'

const { Title, Paragraph, Text } = Typography

function formatPrice(price) {
  if (!price || Number(price) === 0) return 'Gratuit'
  return `${Number(price).toLocaleString('fr-FR')} FCFA`
}

// 👉 Génère le lien WhatsApp avec un message pré-rempli (compatible Vite)
function buildWhatsAppUrl(course) {
  // Vite : les variables d'env front commencent par VITE_
  const base =
    import.meta.env.VITE_WHATSAPP_CATALOG_URL ||
    'https://wa.me/221779110404'

  const title = course?.title || 'Formation IAFM'
  const slug = course?.slug || ''
  const price = course?.price ? formatPrice(course.price) : '—'

  const text = `Bonjour, je souhaite acheter / m'inscrire au cours : "${title}" (slug: ${slug}, prix: ${price}). Pouvez-vous m'expliquer les modalités d'inscription et de paiement ?`

  const encodedText = encodeURIComponent(text)
  return `${base}?text=${encodedText}`
}

function CourseDetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [enrolling, setEnrolling] = useState(false)

  useEffect(() => {
    async function fetchCourse() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/courses/${slug}`)
        setCourse(data.course)
        setLessons(data.lessons || [])
      } catch (e) {
        setError(e?.response?.data?.message || 'Cours introuvable.')
      } finally {
        setLoading(false)
      }
    }
    fetchCourse()
  }, [slug])

  const handleWhatsAppClick = () => {
    if (!course) return
    const whatsappUrl = buildWhatsAppUrl(course)
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
  }

  const handleEnroll = async () => {
    if (!course) return

    // Si non connecté → on redirige vers login
    if (!isAuthenticated) {
      return navigate('/login', { state: { from: `/courses/${slug}` } })
    }

    setEnrolling(true)
    try {
      const { data } = await api.post('/student/enroll', {
        courseId: course._id,
      })

      message.success(
        data?.message ||
          "Demande d'inscription envoyée. Elle doit être validée par un administrateur."
      )

      // On ouvre aussi WhatsApp pour finaliser côté humain
      const whatsappUrl = buildWhatsAppUrl(course)
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          "Impossible d'envoyer la demande d'inscription en ligne. Vous pouvez finaliser via WhatsApp."
      )

      // 👉 Fallback : même en cas d'erreur backend, on n’abandonne pas le lead
      const whatsappUrl = buildWhatsAppUrl(course)
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer')
    } finally {
      setEnrolling(false)
    }
  }

  if (loading) return <PageLoader />
  if (error || !course)
    return <ErrorState title="Cours introuvable" subTitle={error} />

  const imageUrl = course.thumbnailUrl || course.imageUrl || null

  // Regrouper les leçons par module pour un affichage propre
  const modulesMap = {}
  lessons.forEach((lesson) => {
    const key = lesson.moduleTitle || 'Contenu du cours'
    if (!modulesMap[key]) modulesMap[key] = []
    modulesMap[key].push(lesson)
  })
  const modules = Object.entries(modulesMap)

  const whatsappUrl = buildWhatsAppUrl(course)

  return (
    <div className="course-page">
      <div className="course-page-container">
        <Row gutter={[32, 32]}>
          {/* === SIDEBAR : prix + CTA (en haut sur mobile, à droite sur desktop) === */}
          <Col
            xs={{ span: 24, order: 1 }}
            lg={{ span: 8, order: 2 }}
          >
            <Card bordered={false} className="course-sidebar">
              {imageUrl && (
                <div className="course-sidebar-imageWrapper">
                  <img
                    src={imageUrl}
                    alt={course.title}
                    className="course-sidebar-image"
                  />
                </div>
              )}

              <div className="course-sidebar-header">
                <Title level={3} className="course-price">
                  {formatPrice(course.price)}
                </Title>
                <Paragraph className="course-price-caption">
                  Accès complet au cours, aux leçons et aux futures mises à
                  jour une fois votre inscription validée.
                </Paragraph>
              </div>

              {/* CTA principal : WhatsApp */}
              <Button
                type="primary"
                block
                size="large"
                onClick={handleWhatsAppClick}
                className="course-sidebar-mainButton"
              >
                Discuter sur WhatsApp
              </Button>

              <Paragraph
                type="secondary"
                style={{ fontSize: 12, marginTop: 8, lineHeight: 1.6 }}
              >
                Ce bouton ouvre une conversation WhatsApp pour poser vos
                questions, vérifier les modalités et finaliser votre
                inscription avec un conseiller.
              </Paragraph>

              {/* Option secondaire : inscription en ligne (backend) */}
              <Divider className="course-sidebar-divider" />

              <div className="course-sidebar-section">
                <Text strong style={{ display: 'block', marginBottom: 6 }}>
                  Inscription en ligne (optionnel)
                </Text>
                <Button
                  block
                  size="middle"
                  loading={enrolling}
                  onClick={handleEnroll}
                >
                  Demander l&apos;inscription en ligne
                </Button>
                <Paragraph
                  type="secondary"
                  style={{
                    fontSize: 11,
                    marginTop: 6,
                    lineHeight: 1.5,
                  }}
                >
                  Si vous avez déjà un compte, nous enregistrons votre demande
                  d&apos;inscription côté plateforme. En cas de problème, vous
                  serez automatiquement redirigé vers WhatsApp.
                </Paragraph>
              </div>

              {course.promoVideoUrl && (
                <Button
                  block
                  className="course-sidebar-secondaryButton"
                  onClick={() =>
                    window.open(course.promoVideoUrl, '_blank')
                  }
                  style={{ marginTop: 12 }}
                >
                  Voir la vidéo de présentation
                </Button>
              )}

              <Divider className="course-sidebar-divider" />

              <div className="course-sidebar-section">
                <Text strong>Ce que vous obtenez :</Text>
                <ul className="course-sidebar-list">
                  <li>Accès à vie au contenu du cours</li>
                  <li>Mises à jour incluses</li>
                  <li>Plateforme en ligne sécurisée</li>
                </ul>
              </div>

              {course.instructor && (
                <div className="course-sidebar-section">
                  <Text className="course-sidebar-label" type="secondary">
                    Formateur
                  </Text>
                  <Paragraph className="course-instructor-name">
                    {course.instructor.firstName}{' '}
                    {course.instructor.lastName}
                  </Paragraph>
                  {course.instructor.email && (
                    <Text
                      className="course-instructor-email"
                      type="secondary"
                    >
                      {course.instructor.email}
                    </Text>
                  )}
                </div>
              )}

              {/* Lien direct visible */}
              <Paragraph
                type="secondary"
                style={{ fontSize: 11, marginTop: 8 }}
              >
                Lien direct :{' '}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  ouvrir WhatsApp
                </a>
              </Paragraph>
            </Card>
          </Col>

          {/* === COLONNE PRINCIPALE : hero + public visé + programme === */}
          <Col
            xs={{ span: 24, order: 2 }}
            lg={{ span: 16, order: 1 }}
          >
            {/* HERO */}
            <Card bordered={false} className="course-hero">
              <div className="course-hero-top">
                <div className="course-hero-tags">
                  <Tag color="blue">Cours en ligne</Tag>
                  {lessons.length > 0 && (
                    <Tag color="purple">
                      {lessons.length} leçon
                      {lessons.length > 1 ? 's' : ''}
                    </Tag>
                  )}
                  <Tag color="geekblue">
                    {course.level || 'Tous niveaux'}
                  </Tag>
                  {course.language && (
                    <Tag color="blue">
                      {course.language === 'fr' ? 'FR' : 'EN'}
                    </Tag>
                  )}
                </div>
              </div>

              <div className="course-hero-body">
                <Title level={2} className="course-title">
                  {course.title}
                </Title>

                {course.subtitle && (
                  <Paragraph className="course-subtitle">
                    {course.subtitle}
                  </Paragraph>
                )}

                {/* Texte long du cours — version très lisible */}
                {course.description && (
                  <div className="course-long-text">
                    {course.description}
                  </div>
                )}

                {course.categories?.length > 0 && (
                  <div className="course-categories">
                    {course.categories.map((c) => (
                      <Tag key={c}>{c}</Tag>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* PUBLIC VISÉ / PRÉREQUIS */}
            {(course.targetAudience || course.prerequisites) && (
              <Card bordered={false} className="course-target">
                <Title level={4} className="course-section-title">
                  À qui s’adresse ce cours ?
                </Title>

                {course.targetAudience && (
                  <div className="course-target-block">
                    <Text strong>Public visé</Text>
                    <Paragraph className="course-target-text">
                      {course.targetAudience}
                    </Paragraph>
                  </div>
                )}

                {course.prerequisites && (
                  <div className="course-target-block">
                    <Text strong>Prérequis</Text>
                    <Paragraph className="course-target-text">
                      {course.prerequisites}
                    </Paragraph>
                  </div>
                )}
              </Card>
            )}

            {/* PROGRAMME DU COURS */}
            <Card bordered={false} className="course-outline">
              <Title level={4} className="course-section-title">
                Programme du cours
              </Title>
              <Text type="secondary">
                Explorez les modules et le contenu détaillé du cours.
              </Text>

              <Divider />

              {lessons.length === 0 ? (
                <Paragraph type="secondary">
                  Les leçons de ce cours n’ont pas encore été ajoutées.
                </Paragraph>
              ) : (
                modules.map(([moduleTitle, moduleLessons], index) => (
                  <div key={moduleTitle} className="course-module">
                    <div className="course-module-header">
                      <div className="course-module-index">
                        {index + 1}
                      </div>
                      <div>
                        <Text
                          type="secondary"
                          className="course-module-label"
                        >
                          Module {index + 1}
                        </Text>
                        <Title level={5} className="course-module-title">
                          {moduleTitle}
                        </Title>
                      </div>
                    </div>

                    <List
                      size="small"
                      itemLayout="horizontal"
                      dataSource={moduleLessons}
                      renderItem={(lesson, lessonIndex) => (
                        <List.Item className="course-lesson">
                          <List.Item.Meta
                            title={
                              <div className="course-lesson-titleRow">
                                <Text strong>
                                  {lessonIndex + 1}. {lesson.title}
                                </Text>
                                {lesson.isFreePreview && (
                                  <Tag color="green">Preview</Tag>
                                )}
                              </div>
                            }
                            description={
                              lesson.durationMinutes && (
                                <Text type="secondary">
                                  {lesson.durationMinutes} min
                                </Text>
                              )
                            }
                          />
                        </List.Item>
                      )}
                    />
                  </div>
                ))
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  )
}

export default CourseDetailsPage
