// src/pages/public/BookDetailsPage.jsx
import React, { useEffect, useMemo, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  App,
  Typography,
  Card,
  Tag,
  Space,
  Button,
  Row,
  Col,
  message as staticMessage,
  Modal,
  Input,
  Alert,
  Divider,
  Select,
  Segmented,
  Tooltip,
} from 'antd'
import {
  ArrowLeftOutlined,
  FilePdfOutlined,
  MessageOutlined,
  ZoomInOutlined,
  LockOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  LeftOutlined,
  RightOutlined,
  ReadOutlined,
} from '@ant-design/icons'
import api from '../../services/api'
import PageLoader from '../../components/common/PageLoader'

const { Title, Paragraph, Text } = Typography

function BookDetailsPage() {
  const { slug } = useParams()
  const navigate = useNavigate()

  // ✅ Toujours appelé, mais on ne dépend jamais de sa présence (fallback robuste)
  const antdApp = App.useApp?.()

  // ✅ Wrapper robuste: évite "messageApi.error is not a function"
  const notify = useCallback(
    (type, content) => {
      const ctxMsg = antdApp?.message
      const fn =
        (ctxMsg && typeof ctxMsg[type] === 'function' && ctxMsg[type]) ||
        (staticMessage &&
          typeof staticMessage[type] === 'function' &&
          staticMessage[type])

      if (fn) return fn(content)
      // fallback ultime
      // eslint-disable-next-line no-console
      console[type === 'error' ? 'error' : 'log'](content)
    },
    [antdApp]
  )

  const [loading, setLoading] = useState(true)
  const [book, setBook] = useState(null)

  // Access state
  const [accessLoading, setAccessLoading] = useState(false)
  const [accessGranted, setAccessGranted] = useState(false)
  const [accessRequest, setAccessRequest] = useState(null) // pending/approved/rejected...
  const [enrollLoading, setEnrollLoading] = useState(false)

  // WhatsApp
  const [whatsappNumber, setWhatsappNumber] = useState('')

  // Modal preview (une page en grand)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [previewTitle, setPreviewTitle] = useState('')

  // ✅ Lecteur “pack”
  const [readerOpen, setReaderOpen] = useState(false)
  const [readerMode, setReaderMode] = useState('single') // 'single' | 'all'
  const [readerIndex, setReaderIndex] = useState(0)

  // ✅ Memo dérivés: hooks TOUJOURS évalués (pas après un return)
  const files = useMemo(
    () => (book && Array.isArray(book.files) ? book.files : []),
    [book]
  )

  const totalFiles = files.length
  const previewClickableCountDefault = 2 // pages visibles sans accès
  const unlockedCount = accessGranted ? totalFiles : previewClickableCountDefault
  const lockedCount = Math.max(totalFiles - unlockedCount, 0)

  // ✅ Liste réellement lisible selon l'accès
  const readableFiles = useMemo(() => {
    if (accessGranted) return files
    return files.slice(0, previewClickableCountDefault)
  }, [files, accessGranted])

  const rawDescription =
    (book?.longDescription && String(book.longDescription)) ||
    (book?.description && String(book.description)) ||
    ''

  const descriptionBlocks = useMemo(() => {
    return rawDescription
      .split(/\n{2,}/)
      .map((t) => t.trim())
      .filter(Boolean)
  }, [rawDescription])

  const formatPrice = useCallback((price) => {
    if (!price || price === 0) return 'Gratuit'
    try {
      return `${Number(price).toLocaleString('fr-FR')} FCFA`
    } catch {
      return `${price} FCFA`
    }
  }, [])

  const whatsappMessage = book?.title
    ? `Bonjour, je souhaite acheter le livre "${book.title}" sur IAFM.`
    : `Bonjour, je souhaite acheter un livre sur IAFM.`
  const whatsappUrl = `https://wa.me/221779110404?text=${encodeURIComponent(
    whatsappMessage
  )}`

  const openPreviewModal = useCallback((url, title) => {
    setPreviewUrl(url)
    setPreviewTitle(title)
    setPreviewModalOpen(true)
  }, [])

  const closePreviewModal = useCallback(() => {
    setPreviewModalOpen(false)
    setPreviewUrl(null)
    setPreviewTitle('')
  }, [])

  const openReader = useCallback(
    (mode = 'single', index = 0) => {
      if (!readableFiles.length) {
        notify('warning', "Aucun PDF n'est disponible.")
        return
      }

      // Mode "Tout lire" : seulement si accès complet
      if (mode === 'all' && !accessGranted) {
        notify(
          'warning',
          'Accès limité : débloque le pack pour lire tous les PDFs en continu.'
        )
        return
      }

      setReaderMode(mode)
      setReaderIndex(Math.max(0, Math.min(index, readableFiles.length - 1)))
      setReaderOpen(true)
    },
    [readableFiles.length, accessGranted, notify]
  )

  const closeReader = useCallback(() => {
    setReaderOpen(false)
  }, [])

  /**
   * ✅ Statut d'accès
   * GET /api/student/books/:bookId/access
   */
  const fetchAccessStatus = useCallback(async (bookId) => {
    if (!bookId) return
    setAccessLoading(true)
    try {
      const { data } = await api.get(`/student/books/${bookId}/access`)
      setAccessGranted(!!data?.accessGranted)
      setAccessRequest(data?.request || null)
    } catch (e) {
      const status = e?.response?.status
      if (status === 401) {
        setAccessGranted(false)
        setAccessRequest(null)
        return
      }
      // eslint-disable-next-line no-console
      console.error('Erreur chargement access:', status, e?.response?.data || e)
      setAccessGranted(false)
      setAccessRequest(null)
    } finally {
      setAccessLoading(false)
    }
  }, [])

  /**
   * ✅ Demande d'accès
   * POST /api/student/books/:bookId/enroll
   */
  const handleEnroll = useCallback(async () => {
    if (!book?._id) return

    setEnrollLoading(true)
    try {
      const payload = {}
      if (String(whatsappNumber || '').trim()) {
        payload.whatsappNumber = String(whatsappNumber || '').trim()
      }

      const { data } = await api.post(
        `/student/books/${book._id}/enroll`,
        payload
      )

      if (data?.accessGranted) {
        notify('success', 'Accès déjà actif : toutes les pages sont débloquées.')
        setAccessGranted(true)
        setAccessRequest(null)
        return
      }

      notify(
        'success',
        data?.message ||
          "Demande envoyée. Après validation admin, l’accès sera débloqué."
      )
      setAccessGranted(false)
      setAccessRequest(data?.request || null)
    } catch (e) {
      const status = e?.response?.status
      const serverMsg = e?.response?.data?.message

      // eslint-disable-next-line no-console
      console.error('Erreur enroll:', status, e?.response?.data || e)

      if (status === 401) {
        notify('warning', 'Connecte-toi pour demander l’accès à ce livre.')
        navigate('/login')
        return
      }

      if (status === 403) {
        notify(
          'error',
          serverMsg ||
            "Accès interdit (403). Vérifie le statut du livre (draft/published)."
        )
        return
      }

      notify('error', serverMsg || "Impossible d'envoyer la demande d’accès.")
    } finally {
      setEnrollLoading(false)
    }
  }, [book?._id, whatsappNumber, notify, navigate])

  // Chargement livre public
  useEffect(() => {
    async function fetchBook() {
      setLoading(true)
      try {
        const { data } = await api.get(`/books/${slug}`)
        const b = data?.book || data
        setBook(b)
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Erreur chargement livre:', e)
        notify('error', 'Livre introuvable.')
        navigate('/books')
      } finally {
        setLoading(false)
      }
    }
    fetchBook()
  }, [slug, navigate, notify])

  // Une fois le livre chargé, check l'accès
  useEffect(() => {
    if (!book?._id) return
    fetchAccessStatus(book._id)
  }, [book?._id, fetchAccessStatus])

  const canOpenFile = useCallback(
    (idx) => {
      if (accessGranted) return true
      return idx < previewClickableCountDefault
    },
    [accessGranted]
  )

  // UI statut demande (si existante)
  const requestBanner = useMemo(() => {
    if (!accessRequest) return null

    const status = accessRequest.status
    if (status === 'pending') {
      return (
        <Alert
          type="warning"
          showIcon
          icon={<ClockCircleOutlined />}
          message="Demande en attente"
          description="Ta demande d’accès a été envoyée. Un administrateur la validera après paiement."
        />
      )
    }
    if (status === 'approved') {
      return (
        <Alert
          type="success"
          showIcon
          icon={<CheckCircleOutlined />}
          message="Demande approuvée"
          description="Ta demande a été approuvée. Si les pages ne sont pas encore débloquées, recharge la page."
        />
      )
    }
    if (status === 'rejected') {
      return (
        <Alert
          type="error"
          showIcon
          message="Demande refusée"
          description={
            accessRequest.adminNote
              ? `Note admin : ${accessRequest.adminNote}`
              : "Ta demande a été refusée. Contacte l’équipe si besoin."
          }
        />
      )
    }
    if (status === 'cancelled') {
      return (
        <Alert
          type="info"
          showIcon
          message="Demande annulée"
          description="Ta demande a été annulée."
        />
      )
    }
    return null
  }, [accessRequest])

  if (loading) return <PageLoader />
  if (!book) return null

  const activePdf =
    readableFiles && readableFiles.length ? readableFiles[readerIndex] : null

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
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/books')}>
          Retour aux packs
        </Button>

        <Space>
          <Button
            type="default"
            onClick={() => book?._id && fetchAccessStatus(book._id)}
            loading={accessLoading}
          >
            Rafraîchir l’accès
          </Button>

          {/* ✅ Bouton lecteur pack */}
          {readableFiles.length > 0 && (
            <Tooltip
              title={
                accessGranted
                  ? 'Ouvrir le lecteur du pack (tous les PDFs)'
                  : `Aperçu seulement (${previewClickableCountDefault} PDFs)`
              }
            >
              <Button
                type="primary"
                icon={<ReadOutlined />}
                onClick={() => openReader(accessGranted ? 'all' : 'single', 0)}
              >
                Lecteur du pack
              </Button>
            </Tooltip>
          )}
        </Space>
      </div>

      {/* Bloc principal */}
      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
          marginBottom: 16,
        }}
      >
        <Row gutter={[24, 16]} align="top">
          <Col xs={24} md={16}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Space size="small">
                <Tag color="purple">Pack PDF</Tag>
                {book.isFeatured && <Tag color="gold">À la une</Tag>}
                {accessGranted ? (
                  <Tag color="green" icon={<CheckCircleOutlined />}>
                    Accès autorisé
                  </Tag>
                ) : (
                  <Tag color="default" icon={<LockOutlined />}>
                    Accès limité
                  </Tag>
                )}
              </Space>

              <Title level={2} style={{ marginBottom: 4 }}>
                {book.title}
              </Title>

              {descriptionBlocks.length > 0 && (
                <div style={{ marginTop: 8, marginBottom: 12, maxWidth: 900 }}>
                  <Title level={4} style={{ marginBottom: 8, fontSize: 18 }}>
                    À propos de ce pack
                  </Title>
                  {descriptionBlocks.map((block, idx) => (
                    <Paragraph
                      key={idx}
                      style={{
                        marginBottom: 8,
                        lineHeight: 1.6,
                        whiteSpace: 'pre-line',
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
            style={{ display: 'flex', justifyContent: 'flex-end' }}
          >
            <div style={{ textAlign: 'right', width: '100%', maxWidth: 320 }}>
              <Paragraph type="secondary" style={{ marginBottom: 8 }}>
                {accessGranted
                  ? 'Tu peux accéder à toutes les pages du pack.'
                  : 'Pour débloquer tout le pack, fais une demande d’accès.'}
              </Paragraph>

              {!accessGranted && (
                <>
                  <Input
                    placeholder="Ton numéro WhatsApp (optionnel)"
                    value={whatsappNumber}
                    onChange={(e) => setWhatsappNumber(e.target.value)}
                    style={{ marginBottom: 10 }}
                  />

                  <Button
                    type="primary"
                    size="large"
                    block
                    loading={enrollLoading}
                    onClick={handleEnroll}
                    icon={<LockOutlined />}
                  >
                    Demander l’accès
                  </Button>

                  <div style={{ marginTop: 10 }}>
                    <Button
                      type="default"
                      size="large"
                      block
                      icon={<MessageOutlined />}
                      href={whatsappUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Commander via WhatsApp
                    </Button>
                  </div>
                </>
              )}

              {accessGranted && (
                <Button
                  type="default"
                  size="large"
                  block
                  icon={<MessageOutlined />}
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Contacter WhatsApp
                </Button>
              )}
            </div>
          </Col>
        </Row>

        {requestBanner && (
          <>
            <Divider style={{ margin: '16px 0' }} />
            {requestBanner}
          </>
        )}
      </Card>

      {/* Pages du livre */}
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
              <Text type="secondary" style={{ fontSize: 12 }}>
                {accessGranted
                  ? `(${totalFiles} PDFs débloqués)`
                  : `(Aperçu ${previewClickableCountDefault} PDFs, ${lockedCount} verrouillés)`}
              </Text>
            </Space>
          }
          extra={
            readableFiles.length > 0 ? (
              <Space>
                <Button onClick={() => openReader('single', 0)}>
                  Lire (mode page)
                </Button>
                <Button
                  type="primary"
                  onClick={() => openReader('all', 0)}
                  disabled={!accessGranted}
                >
                  Tout lire (scroll)
                </Button>
              </Space>
            ) : null
          }
        >
          <Row gutter={[24, 24]}>
            {files.map((f, idx) => {
              const pdfNumber = idx + 1
              const unlocked = canOpenFile(idx)
              const label = f.label || `PDF ${pdfNumber}`

              return (
                <Col xs={24} md={12} key={idx}>
                  <Card
                    hoverable={unlocked}
                    onClick={() => {
                      if (!unlocked) return
                      openReader('single', Math.min(idx, readableFiles.length - 1))
                    }}
                    style={{
                      height: '100%',
                      borderRadius: 12,
                      background: unlocked ? '#fafafa' : '#f5f5f5',
                      border: '1px solid rgba(0, 0, 0, 0.03)',
                      opacity: unlocked ? 1 : 0.85,
                      cursor: unlocked ? 'pointer' : 'default',
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
                      <Text strong>PDF {pdfNumber}</Text>
                      {unlocked ? (
                        <FilePdfOutlined style={{ fontSize: 18 }} />
                      ) : (
                        <LockOutlined style={{ fontSize: 18, color: '#999' }} />
                      )}
                    </div>

                    <Paragraph
                      type="secondary"
                      style={{ fontSize: 12, marginBottom: 0 }}
                    >
                      {unlocked
                        ? "Clique pour ouvrir dans le lecteur."
                        : "Disponible après autorisation d’accès."}
                    </Paragraph>

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
                      {unlocked && f.fileUrl ? (
                        <>
                          <iframe
                            src={f.fileUrl}
                            title={label}
                            style={{
                              width: '100%',
                              height: '100%',
                              border: 'none',
                            }}
                          />

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
                            onClick={(e) => {
                              e.stopPropagation()
                              openPreviewModal(f.fileUrl, label)
                            }}
                          >
                            <ZoomInOutlined
                              style={{ color: '#fff', fontSize: 14 }}
                            />
                            <Text style={{ color: '#fff', fontSize: 12 }}>
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
                          <Space direction="vertical" align="center">
                            <LockOutlined style={{ fontSize: 22, color: '#999' }} />
                            <Text type="secondary">Réservé aux acheteurs</Text>
                            {!accessGranted && (
                              <Button
                                size="small"
                                type="primary"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleEnroll()
                                }}
                                loading={enrollLoading}
                              >
                                Demander l’accès
                              </Button>
                            )}
                          </Space>
                        </div>
                      )}
                    </div>

                    {label && (
                      <Text type="secondary" style={{ fontSize: 12 }}>
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
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <Title level={4} style={{ marginBottom: 4 }}>
            Accès complet
          </Title>

          {totalFiles > 0 && (
            <Paragraph type="secondary">
              Ce pack contient <Text strong>{totalFiles}</Text> fichier
              {totalFiles > 1 ? 's' : ''} PDF.
              {!accessGranted && lockedCount > 0 && (
                <>
                  {' '}
                  <Text strong>{lockedCount}</Text> PDF(s) sont verrouillés tant
                  que l’accès n’est pas autorisé.
                </>
              )}
            </Paragraph>
          )}

          {!accessGranted ? (
            <>
              <Paragraph>
                Clique sur <Text strong>“Demander l’accès”</Text> : une demande sera
                créée (statut <Text strong>pending</Text>). Après validation admin,
                toutes les pages se débloquent (au prochain refresh).
              </Paragraph>

              <Space wrap>
                <Button
                  type="primary"
                  size="large"
                  icon={<LockOutlined />}
                  onClick={handleEnroll}
                  loading={enrollLoading}
                >
                  Demander l’accès
                </Button>

                <Button
                  size="large"
                  icon={<MessageOutlined />}
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                >
                  Commander via WhatsApp
                </Button>
              </Space>
            </>
          ) : (
            <>
              <Paragraph>
                Ton accès est <Text strong>actif</Text>. Tous les PDFs sont disponibles.
              </Paragraph>
              {files.length > 0 && (
                <Space wrap>
                  <Button onClick={() => openReader('single', 0)}>
                    Ouvrir lecteur (page)
                  </Button>
                  <Button type="primary" onClick={() => openReader('all', 0)}>
                    Lire tout (scroll)
                  </Button>
                </Space>
              )}
            </>
          )}
        </Space>
      </Card>

      {/* Modal preview (une page) */}
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
            style={{ width: '100%', height: '100%', border: 'none' }}
          />
        )}
      </Modal>

      {/* ✅ Lecteur “pack complet” */}
      <Modal
        open={readerOpen}
        onCancel={closeReader}
        footer={null}
        width="95vw"
        centered
        title={
          <Space style={{ width: '100%', justifyContent: 'space-between' }}>
            <Space>
              <ReadOutlined />
              <span>Lecteur — {book.title}</span>
            </Space>

            <Space>
              <Segmented
                value={readerMode}
                onChange={(v) => setReaderMode(v)}
                options={[
                  { label: 'Page', value: 'single' },
                  { label: 'Tout lire', value: 'all', disabled: !accessGranted },
                ]}
              />
            </Space>
          </Space>
        }
        bodyStyle={{ padding: 0, height: '85vh' }}
      >
        {/* Barre de contrôle (mode single) */}
        {readerMode === 'single' && (
          <div
            style={{
              padding: 12,
              borderBottom: '1px solid #f0f0f0',
              display: 'flex',
              gap: 10,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <Button
              icon={<LeftOutlined />}
              disabled={readerIndex <= 0}
              onClick={() => setReaderIndex((i) => Math.max(0, i - 1))}
            >
              Précédent
            </Button>

            <Button
              icon={<RightOutlined />}
              disabled={readerIndex >= readableFiles.length - 1}
              onClick={() =>
                setReaderIndex((i) => Math.min(readableFiles.length - 1, i + 1))
              }
            >
              Suivant
            </Button>

            <div style={{ minWidth: 260 }}>
              <Select
                style={{ width: '100%' }}
                value={readerIndex}
                onChange={(v) => setReaderIndex(v)}
                options={readableFiles.map((f, i) => ({
                  value: i,
                  label: f.label || `PDF ${i + 1}`,
                }))}
              />
            </div>

            {!accessGranted && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Mode aperçu (accès limité).
              </Text>
            )}
          </div>
        )}

        {/* Contenu lecteur */}
        {readerMode === 'single' ? (
          <div style={{ height: 'calc(85vh - 56px)' }}>
            {activePdf?.fileUrl ? (
              <iframe
                src={activePdf.fileUrl}
                title={activePdf.label || `PDF ${readerIndex + 1}`}
                style={{ width: '100%', height: '100%', border: 'none' }}
              />
            ) : (
              <div style={{ padding: 16 }}>
                <Alert type="warning" message="PDF introuvable." />
              </div>
            )}
          </div>
        ) : (
          <div
            style={{
              height: '85vh',
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            {accessGranted ? (
              readableFiles.map((f, i) => (
                <Card
                  key={`${f.fileUrl || ''}-${i}`}
                  size="small"
                  title={
                    <Space>
                      <FilePdfOutlined />
                      <span>{f.label || `PDF ${i + 1}`}</span>
                    </Space>
                  }
                  style={{ borderRadius: 12 }}
                  bodyStyle={{ padding: 0 }}
                >
                  <iframe
                    src={f.fileUrl}
                    title={f.label || `PDF ${i + 1}`}
                    loading="lazy"
                    style={{
                      width: '100%',
                      height: '80vh',
                      border: 'none',
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12,
                    }}
                  />
                </Card>
              ))
            ) : (
              <Alert
                type="warning"
                showIcon
                message="Accès limité"
                description="Débloque le pack pour lire tous les PDFs en continu."
              />
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

export default BookDetailsPage
