// src/pages/public/HomePage.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Col,
  Row,
  Typography,
  Space,
  Card,
  Tag,
  Empty,
} from 'antd'
import api from '../../services/api'
import CmsBlockRenderer from '../../components/cms/CmsBlockRenderer'
import CourseGrid from '../../components/courses/CourseGrid'
import '../../styles/HomePage.css'

const { Title, Paragraph, Text } = Typography
const { Meta } = Card

function HomePage() {
  const [homePage, setHomePage] = useState(null)
  const [featuredCourses, setFeaturedCourses] = useState([])
  const [featuredBooks, setFeaturedBooks] = useState([])
  const [cmsPages, setCmsPages] = useState([])

  useEffect(() => {
    async function fetchHome() {
      try {
        const [pageRes, coursesRes, booksRes, cmsPagesRes] =
          await Promise.all([
            api.get('/cms/pages/home').catch(() => ({
              data: { page: null },
            })),
            api.get('/courses?featured=true'),
            api.get('/books'),
            api.get('/cms/pages'),
          ])

        // Page CMS home
        setHomePage(pageRes.data.page || null)

        // 🎓 FORMATIONS : récupérer, mettre en avant, limiter à 4
        const allCourses =
          coursesRes.data.courses ||
          coursesRes.data.data ||
          coursesRes.data ||
          []

        const highlightedCourses = allCourses.filter(
          (c) => c.isFeatured === true
        )

        const limitedCourses = (highlightedCourses.length > 0
          ? highlightedCourses
          : allCourses
        ).slice(0, 4)

        setFeaturedCourses(limitedCourses)

        // 📚 LIVRES / PACKS PDF : récupérer, filtrer, limiter à 4
        const rawBooks =
          booksRes.data.books ||
          booksRes.data.data ||
          booksRes.data ||
          []

        const booksArray = Array.isArray(rawBooks) ? rawBooks : []
        const featured = booksArray.filter(
          (b) => b.isFeatured === true && b.isPublic !== false
        )

        setFeaturedBooks(featured.slice(0, 4))

        // Autres pages CMS (sauf home)
        const pages = (cmsPagesRes.data.pages || []).filter(
          (p) => p.slug !== 'home'
        )
        setCmsPages(pages)
      } catch (e) {
        console.error('Erreur chargement home:', e)
      }
    }
    fetchHome()
  }, [])

  const getHeroImageFromPage = (page) => {
    if (!page || !Array.isArray(page.contentBlocks)) return null
    const heroBlock = page.contentBlocks.find((b) => b.type === 'hero')
    return heroBlock?.data?.imageUrl || null
  }

  const formatPrice = (price) => {
    if (!price && price !== 0) return '—'
    if (price === 0) return 'Gratuit'
    try {
      return `${Number(price).toLocaleString('fr-FR')} FCFA`
    } catch {
      return `${price} FCFA`
    }
  }

  return (
    <div className="page page-home">
      {/* HERO PRINCIPAL */}
      <section className="hero-section hero-section-main">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} md={14}>
            <div className="hero-main-text">
              <Tag color="blue" style={{ marginBottom: 12 }}>
                L’école des compétences d’avenir
              </Tag>
              <Title level={1} className="hero-title">
                IAFM – Formations concrètes pour accélérer votre carrière
              </Title>
              <Paragraph className="hero-subtitle">
                Des parcours en ligne, structurés et actionnables, pour monter en
                compétence, changer de métier ou lancer vos propres projets.
              </Paragraph>

              <Space size="middle" style={{ marginTop: 24, flexWrap: 'wrap' }}>
                <Button type="primary" size="large">
                  <Link to="/courses">Voir les formations</Link>
                </Button>
                <Button size="large" type="default">
                  <Link to="/register">Créer un compte</Link>
                </Button>
              </Space>

              <Space
                size="large"
                style={{ marginTop: 32, flexWrap: 'wrap' }}
                className="hero-stats"
              >
                <div className="hero-stat-item">
                  <Text strong>100% en ligne</Text>
                  <Paragraph type="secondary">
                    Accédez aux contenus quand vous voulez, où que vous soyez.
                  </Paragraph>
                </div>
                <div className="hero-stat-item">
                  <Text strong>Parcours guidés</Text>
                  <Paragraph type="secondary">
                    Séquences structurées, exercices, cas pratiques et
                    accompagnement.
                  </Paragraph>
                </div>
              </Space>
            </div>
          </Col>

          <Col xs={24} md={10}>
            <div className="hero-visual">
              <Card className="hero-card" bordered={false}>
                <Title level={4}>Reprendre sa carrière en main</Title>
                <Paragraph type="secondary">
                  L’IAFM vous aide à identifier un projet professionnel clair,
                  choisir une trajectoire de formation adaptée et passer à
                  l’action étape par étape.
                </Paragraph>
                <div className="hero-card-highlight">
                  <Text strong>🎯 Objectif :</Text>{' '}
                  <Text>
                    transformer vos compétences en résultats professionnels.
                  </Text>
                </div>
              </Card>
            </div>
          </Col>
        </Row>
      </section>

      {/* BLOCS CMS DE LA PAGE HOME (facultatif) */}
      {homePage?.contentBlocks && (
        <section className="cms-section-wrapper">
          <CmsBlockRenderer blocks={homePage.contentBlocks} />
        </section>
      )}

      {/* PAGES CMS (A PROPOS, etc.) */}
      {cmsPages.length > 0 && (
        <section className="page-section cms-pages-section">
          <Row
            justify="space-between"
            align="middle"
            style={{ marginBottom: 16 }}
          >
            <Col>
              <Title level={3} style={{ marginBottom: 4 }}>
                Découvrir l’IAFM
              </Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                En savoir plus sur notre vision, nos valeurs et notre pédagogie.
              </Paragraph>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {cmsPages.map((page) => {
              const heroImage = getHeroImageFromPage(page)
              const description =
                page.seo?.metaDescription ||
                'Cliquez pour découvrir le contenu de cette page.'

              return (
                <Col key={page.slug} xs={24} sm={12} md={8}>
                  <Link to={`/page/${page.slug}`}>
                    <Card
                      className="cms-page-card"
                      hoverable
                      cover={
                        heroImage ? (
                          <div className="cms-page-card-cover">
                            <img
                              src={heroImage}
                              alt={page.title}
                              className="cms-page-card-image"
                            />
                          </div>
                        ) : null
                      }
                    >
                      <div className="cms-page-card-body">
                        <Tag color="default" className="cms-page-tag">
                          Page IAFM
                        </Tag>
                        <Meta title={page.title} description={description} />
                        <div className="cms-page-card-footer">
                          <Button type="link" size="small">
                            Lire la suite →
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </Link>
                </Col>
              )
            })}
          </Row>
        </section>
      )}

      {/* FORMATIONS EN VEDETTE (limitées à 4) */}
      <section
        className="page-section featured-courses-section"
        style={{ marginTop: 48 }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Title level={3} style={{ marginBottom: 4 }}>
              Formations IAFM en vedette
            </Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              Une sélection de parcours pour démarrer concrètement.
            </Paragraph>
          </Col>
          <Col>
            <Button type="link">
              <Link to="/courses">Voir toutes les formations</Link>
            </Button>
          </Col>
        </Row>

        {featuredCourses.length === 0 ? (
          <Empty
            description="Aucune formation disponible pour le moment."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <div className="featured-courses-grid">
            <CourseGrid courses={featuredCourses} />
          </div>
        )}
      </section>

      {/* PACKS PDF & LIVRES (limités à 4) */}
      <section
        className="page-section featured-books-section"
        style={{ marginTop: 40, marginBottom: 24 }}
      >
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: 16 }}
        >
          <Col>
            <Title level={3} style={{ marginBottom: 4 }}>
              Livres & packs PDF
            </Title>
            <Paragraph type="secondary" style={{ margin: 0 }}>
              Des supports pratiques à télécharger pour aller plus loin.
            </Paragraph>
          </Col>
          <Col>
            <Button type="link">
              <Link to="/books">Voir tous les livres</Link>
            </Button>
          </Col>
        </Row>

        {featuredBooks.length === 0 ? (
          <Empty
            description="Aucun livre ou pack mis en avant pour le moment."
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Row gutter={[24, 24]}>
            {featuredBooks.map((book) => {
              const link = book.slug ? `/books/${book.slug}` : '/books'

              const rawDesc = book.description || ''
              const shortDesc =
                rawDesc.length > 140 ? `${rawDesc.slice(0, 140)}…` : rawDesc

              const coverUrl =
                book.coverUrl ||
                'https://via.placeholder.com/400x550?text=Couverture+IAFM'

              const isFree = book.price === 0

              return (
                <Col key={book._id || book.slug} xs={24} sm={12} md={6}>
                  <Link to={link}>
                    <Card
                      hoverable
                      className="book-card"
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
                        <div
                          style={{
                            padding: 16,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            background:
                              'linear-gradient(135deg, #f0f5ff 0%, #fff7e6 50%, #fff0f6 100%)',
                          }}
                        >
                          <div
                            style={{
                              width: '100%',
                              maxWidth: 240,
                              height: 320,
                              borderRadius: 14,
                              overflow: 'hidden',
                              boxShadow: '0 10px 24px rgba(0,0,0,0.18)',
                              backgroundColor: '#fff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <img
                              src={coverUrl}
                              alt={book.title}
                              style={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                display: 'block',
                              }}
                            />
                          </div>
                        </div>
                      }
                    >
                      <Space
                        size="small"
                        style={{ marginBottom: 8, flexWrap: 'wrap' }}
                      >
                        <Tag color="purple">Pack PDF</Tag>
                        {isFree && <Tag color="green">Gratuit</Tag>}
                      </Space>

                      <Title
                        level={5}
                        style={{
                          marginBottom: 4,
                          lineHeight: 1.3,
                          minHeight: 44,
                        }}
                      >
                        {book.title}
                      </Title>

                      <Paragraph
                        type="secondary"
                        style={{
                          fontSize: 13,
                          marginBottom: 10,
                          minHeight: 40,
                        }}
                      >
                        {shortDesc ||
                          "Pack de ressources PDF pour approfondir vos compétences et passer à l'action."}
                      </Paragraph>

                      <div
                        style={{
                          marginTop: 'auto',
                          paddingTop: 8,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          borderTop: '1px solid #f0f0f0',
                        }}
                      >
                        <div>
                          <Text
                            strong
                            style={{
                              fontSize: 15,
                            }}
                          >
                            {formatPrice(book.price)}
                          </Text>
                        </div>
                        <Text
                          style={{
                            fontSize: 13,
                          }}
                        >
                          Voir le détail →
                        </Text>
                      </div>
                    </Card>
                  </Link>
                </Col>
              )
            })}
          </Row>
        )}
      </section>
    </div>
  )
}

export default HomePage
