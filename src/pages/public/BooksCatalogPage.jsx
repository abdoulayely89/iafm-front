// src/pages/public/BooksCatalogPage.jsx
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Button,
  Empty,
  Input,
  Space,
} from 'antd'
import {
  BookOutlined,
  SearchOutlined,
  FilePdfOutlined,
} from '@ant-design/icons'
import api from '../../services/api'
import PageLoader from '../../components/common/PageLoader'
import './BooksCatalogPage.css' // 👈 tu pourras créer ce fichier pour peaufiner le style

const { Title, Paragraph, Text } = Typography
const { Meta } = Card
const { Search } = Input

function BooksCatalogPage() {
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function fetchBooks() {
      try {
        const { data } = await api.get('/books')
        const raw = data.books || data.data || data || []
        const arr = Array.isArray(raw) ? raw : []
        setBooks(arr)
        setFiltered(arr)
      } catch (e) {
        console.error('Erreur chargement livres:', e)
        setBooks([])
        setFiltered([])
      } finally {
        setLoading(false)
      }
    }
    fetchBooks()
  }, [])

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Gratuit'
    try {
      return `${Number(price).toLocaleString('fr-FR')} FCFA`
    } catch {
      return `${price} FCFA`
    }
  }

  const handleSearch = (value) => {
    const term = (value || '').toLowerCase().trim()
    setSearch(value)

    if (!term) {
      setFiltered(books)
      return
    }

    const res = books.filter((b) => {
      const haystack = [
        b.title,
        b.subtitle,
        b.description,
        b.longDescription,
        b.authorName,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return haystack.includes(term)
    })

    setFiltered(res)
  }

  if (loading) return <PageLoader />

  return (
    <div className="page books-page">
      {/* HEADER / HERO */}
      <div className="books-hero">
        <div className="books-hero-left">
          <Space align="center" size="large">
            <div className="books-hero-icon">
              <BookOutlined />
            </div>
            <div>
              <Title level={2} style={{ marginBottom: 4 }}>
                Bibliothèque & packs PDF
              </Title>
              <Paragraph
                type="secondary"
                style={{ marginBottom: 0, maxWidth: 720 }}
              >
                Découvre des packs PDF complets : ateliers pas-à-pas, guides
                pratiques, fiches outils et supports de formation que tu peux
                lire tranquillement et commander via WhatsApp.
              </Paragraph>
            </div>
          </Space>
        </div>

        <div className="books-hero-right">
          <Search
            allowClear
            placeholder="Rechercher un pack (titre, description...)"
            prefix={<SearchOutlined />}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            onSearch={handleSearch}
          />
        </div>
      </div>

      {/* CONTENU */}
      {filtered.length === 0 ? (
        <Empty
          description="Aucun pack PDF disponible pour le moment."
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          style={{ marginTop: 40 }}
        />
      ) : (
        <Row gutter={[24, 24]}>
          {filtered.map((book) => {
            const link = book.slug ? `/books/${book.slug}` : undefined
            const description =
              (book.description || '').slice(0, 140) +
              (book.description && book.description.length > 140 ? '…' : '')

            const files = Array.isArray(book.files) ? book.files : []
            const fileCount = files.length
            const Wrapper = link ? Link : 'div'

            return (
              <Col
                key={book._id || book.slug || Math.random()}
                xs={24}
                sm={12}
                md={8}
                lg={6}
              >
                <Wrapper to={link}>
                  <Card
                    hoverable
                    className="book-card"
                    bodyStyle={{
                      display: 'flex',
                      flexDirection: 'column',
                      padding: 14,
                    }}
                  >
                    {/* Couverture */}
                    <div className="book-card-coverWrapper">
                      {book.coverUrl ? (
                        <img
                          src={book.coverUrl}
                          alt={book.title}
                          className="book-card-cover"
                        />
                      ) : (
                        <div className="book-card-cover placeholder">
                          <BookOutlined className="book-card-cover-icon" />
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="book-card-tags">
                      <Tag color="purple">Pack PDF</Tag>
                      {book.isFeatured && <Tag color="gold">À la une</Tag>}
                      {book.price === 0 && <Tag color="green">Gratuit</Tag>}
                    </div>

                    {/* Titre + description */}
                    <Meta
                      title={
                        <div className="book-card-title">
                          {book.title}
                        </div>
                      }
                      description={
                        description ||
                        'Pack de ressources PDF pour aller plus loin.'
                      }
                    />

                    {/* Auteur */}
                    {book.authorName && (
                      <Text
                        type="secondary"
                        style={{
                          marginTop: 6,
                          fontSize: 12,
                          display: 'block',
                        }}
                      >
                        par {book.authorName}
                      </Text>
                    )}

                    {/* Bas de carte : prix + info PDF */}
                    <div className="book-card-footer">
                      <Space
                        direction="vertical"
                        size={4}
                        style={{ width: '100%' }}
                      >
                        <Text strong className="book-card-price">
                          {formatPrice(book.price)}
                        </Text>
                        <Space size="small">
                          <FilePdfOutlined />
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            {fileCount > 0
                              ? `${fileCount} fichier${
                                  fileCount > 1 ? 's' : ''
                                } PDF`
                              : 'PDF à télécharger'}
                          </Text>
                        </Space>
                      </Space>
                    </div>
                  </Card>
                </Wrapper>
              </Col>
            )
          })}
        </Row>
      )}

      {/* CTA bas de page */}
      <div className="books-footer-cta">
        <Paragraph type="secondary" style={{ marginBottom: 8 }}>
          Tu ne trouves pas encore le pack dont tu as besoin ?
        </Paragraph>
        <Button type="link">
          <Link to="/register">
            Créer un compte et rester informé des prochains packs
          </Link>
        </Button>
      </div>
    </div>
  )
}

export default BooksCatalogPage
