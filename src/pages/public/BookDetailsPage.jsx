// src/pages/public/BookDetailsPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Typography,
  Card,
  Tag,
  Space,
  Button,
  Row,
  Col,
  message,
  Modal,
} from 'antd'
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  MessageOutlined,
  ZoomInOutlined,
} from '@ant-design/icons'
import api from '../../services/api'
import PageLoader from '../../components/common/PageLoader'

const { Title, Paragraph, Text } = Typography

function BookDetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState(null)

  // Modal de prévisualisation en grand
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewTitle, setPreviewTitle] = useState('')

  useEffect(() => {
    async function fetchBook() {
      try {
        const { data } = await api.get(`/books/${slug}`)
        setBook(data.book || data)
      } catch (e) {
        console.error('Erreur chargement livre:', e)
        message.error('Livre introuvable.')
        navigate('/books')
      } finally {
        setLoading(false)
      }
    }
    fetchBook()
  }, [slug, navigate])

  const formatPrice = (price) => {
    if (!price || price === 0) return 'Gratuit'
    try {
      return `${Number(price).toLocaleString('fr-FR')} FCFA`
    } catch {
      return `${price} FCFA`
    }
  }

  if (loading) return <PageLoader />
  if (!book) return null

  const files = Array.isArray(book.files) ? book.files : []
  const totalFiles = files.length
  const previewClickableCount = 2 // Pages 1 et 2 en vraie prévisualisation
  const remainingCount = Math.max(totalFiles - previewClickableCount, 0)

  // 📝 Description formatée (multi paragraphes)
  const rawDescription =
    (book.longDescription && String(book.longDescription)) ||
    (book.description && String(book.description)) ||
    ''

  const descriptionBlocks = rawDescription
    .split(/\n{2,}/) // on coupe sur double saut de ligne
    .map((t) => t.trim())
    .filter(Boolean)

  // 🔗 Lien WhatsApp vers ton numéro
  const whatsappMessage = `Bonjour, je souhaite acheter le livre "${book.title}" sur IAFM.`
  const whatsappUrl = `https://wa.me/221779110404?text=${encodeURIComponent(
    whatsappMessage
  )}`

  const openPreviewModal = (url, title) => {
    setPreviewUrl(url)
    setPreviewTitle(title)
    setPreviewModalOpen(true)
  }

  const closePreviewModal = () => {
    setPreviewModalOpen(false)
    setPreviewUrl(null)
    setPreviewTitle('')
  }

  return (
    <div className="page">
      {/* Header + retour */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/books')}
        >
          Retour aux packs
        </Button>
      </div>

      {/* Bloc principal : infos livre + bouton WhatsApp */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          marginBottom: 24,
        }}
      >
        <Row gutter={[24, 16]} align="top">
          <Col xs={24} md={16}>
            <Space
              direction="vertical"
              size="small"
              style={{ width: '100%' }}
            >
              <Space size="small">
                <Tag color="purple">Pack PDF</Tag>
                {book.isFeatured && <Tag color="gold">À la une</Tag>}
              </Space>

              <Title level={2} style={{ marginBottom: 4 }}>
                {book.title}
              </Title>

              {/* DESCRIPTION MIEUX STRUCTURÉE */}
              {descriptionBlocks.length > 0 && (
                <div
                  style={{
                    marginTop: 8,
                    marginBottom: 12,
                    maxWidth: 900,
                  }}
                >
                  <Title
                    level={4}
                    style={{
                      marginBottom: 8,
                      fontSize: 18,
                    }}
                  >
                    À propos de ce pack
                  </Title>
                  {descriptionBlocks.map((block, idx) => (
                    <Paragraph
                      key={idx}
                      style={{
                        marginBottom: 8,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line', // respecte les \n à l'intérieur du paragraphe
                      }}
                    >
                      {block}
                    </Paragraph>
                  ))}
                </div>
              )}

              <Text strong style={{ fontSize: 16 }}>
                {formatPrice(book.price)}
              </Text>
            </Space>
          </Col>

          <Col
            xs={24}
            md={8}
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <div
              style={{
                textAlign: 'right',
                width: '100%',
                maxWidth: 260,
              }}
            >
              <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                Prêt à commander ce livre ?
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<MessageOutlined />}
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                style={{ width: '100%' }}
              >
                Commander via WhatsApp
              </Button>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Pages du livre : aperçu direct pour les 2 premières */}
      {files.length > 0 && (
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
            marginBottom: 24,
          }}
          title={
            <Space>
              <FilePdfOutlined />
              <span>Pages du livre</span>
            </Space>
          }
        >
          <Row gutter={[24, 24]}>
            {files.map((f, idx) => {
              const pageNumber = idx + 1
              const isPreview = idx < previewClickableCount
              const label = f.label || `Page ${pageNumber}`

              return (
                <Col xs={24} md={12} key={idx}>
                  <Card
                    hoverable={isPreview}
                    style={{
                      height: '100%',
                      borderRadius: 12,
                      background: '#fafafa',
                      border: '1px solid rgba(0, 0, 0, 0.03)',
                    }}
                    bodyStyle={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text strong>Page {pageNumber}</Text>
                      <FilePdfOutlined style={{ fontSize: 18 }} />
                    </div>

                    <Paragraph
                      type="secondary"
                      style={{ fontSize: 12, marginBottom: 0 }}
                    >
                      {isPreview
                        ? "Aperçu direct de la page. Cliquez pour l’agrandir."
                        : "Page disponible après achat du livre."}
                    </Paragraph>

                    {/* Zone "page" stylisée */}
                    <div
                      style={{
                        marginTop: 8,
                        borderRadius: 8,
                        border: '1px solid #e0e0e0',
                        background: '#fff',
                        height: 230,
                        overflow: 'hidden',
                        position: 'relative',
                      }}
                    >
                      {isPreview && f.fileUrl ? (
                        <>
                          {/* Aperçu visible immédiatement (iframe) */}
                          <iframe
                            src={f.fileUrl}
                            title={label}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none',
                              transform: 'scale(1)',
                              transformOrigin: 'top left',
                            }}
                          />
                          {/* Overlay bouton agrandir */}
                          <div
                            style={{
                              position: 'absolute',
                              bottom: 8,
                              right: 8,
                              background: 'rgba(0, 0, 0, 0.55)',
                              borderRadius: 16,
                              padding: '4px 10px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              cursor: 'pointer',
                            }}
                            onClick={() =>
                              openPreviewModal(
                                f.fileUrl,
                                `Page ${pageNumber}`
                              )
                            }
                          >
                            <ZoomInOutlined
                              style={{
                                color: '#fff',
                                fontSize: 14,
                              }}
                            />
                            <Text
                              style={{
                                color: '#fff',
                                fontSize: 12,
                              }}
                            >
                              Voir en grand
                            </Text>
                          </div>
                        </>
                      ) : (
                        <div
                          style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background:
                              'repeating-linear-gradient(45deg,#fafafa,#fafafa 10px,#f0f0f0 10px,#f0f0f0 20px)',
                          }}
                        >
                          <Text type="secondary">
                            Réservé aux acheteurs
                          </Text>
                        </div>
                      )}
                    </div>

                    {label && (
                      <Text
                        type="secondary"
                        style={{ fontSize: 12 }}
                      >
                        {label}
                      </Text>
                    )}
                  </Card>
                </Col>
              )
            })}
          </Row>
        </Card>
      )}

      {/* Rappel achat */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.03)',
        }}
      >
        <Space
          direction="vertical"
          size="small"
          style={{ width: '100%' }}
        >
          <Title level={4} style={{ marginBottom: 4 }}>
            Acheter ce livre
          </Title>

          {totalFiles > 0 && (
            <Paragraph type="secondary">
              Ce pack complet contient{' '}
              <Text strong>{totalFiles}</Text>{' '}
              fichier{totalFiles > 1 ? 's' : ''} PDF
              {remainingCount > 0 && (
                <>
                  , dont <Text strong>{remainingCount}</Text>{' '}
                  pages supplémentaires non visibles en entier
                  dans l’aperçu.
                </>
              )}
            </Paragraph>
          )}

          <Paragraph>
            Pour accéder à toutes les pages, exercices et contenus,
            passez votre commande directement sur WhatsApp.
          </Paragraph>

          <Button
            type="primary"
            size="large"
            icon={<MessageOutlined />}
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            style={{ maxWidth: 260 }}
          >
            Commander via WhatsApp
          </Button>
        </Space>
      </Card>

      {/* Modal de prévisualisation en grand */}
      <Modal
        open={previewModalOpen}
        onCancel={closePreviewModal}
        footer={null}
        width="80vw"
        title={previewTitle}
        centered
        bodyStyle={{ padding: 0, height: '80vh' }}
      >
        {previewUrl && (
          <iframe
            src={previewUrl}
            title={previewTitle}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            }}
          />
        )}
      </Modal>
    </div>
  )
}

export default BookDetailsPage
