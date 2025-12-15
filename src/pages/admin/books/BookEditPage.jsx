// src/pages/admin/books/BookEditPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Switch,
  Typography,
  message,
  Space,
  Divider,
  Upload,
  List,
  Select,
} from 'antd'
import {
  SaveOutlined,
  ArrowLeftOutlined,
  FilePdfOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

function BookEditPage() {
  const { id } = useParams()
  const isNew = id === 'new'
  const navigate = useNavigate()

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  // PDFs liés à ce pack (données qui partiront au backend)
  const [attachedFiles, setAttachedFiles] = useState([]) // [{ label, description?, fileUrl }]
  const [fileList, setFileList] = useState([]) // pour l'Upload des PDF

  // Couverture
  const [coverUrl, setCoverUrl] = useState(null) // URL finale stockée dans le livre
  const [coverFileList, setCoverFileList] = useState([]) // fileList pour Upload image

  useEffect(() => {
    if (!isNew) {
      async function fetchBook() {
        setLoading(true)
        try {
          const { data } = await api.get(`/admin/books/${id}`)
          const book = data.book

          form.setFieldsValue({
            title: book.title,
            slug: book.slug,
            description: book.description,
            price: book.price,
            isPublic: book.isPublic,
            isFeatured: book.isFeatured,
            status: book.status || 'draft',
          })

          // Couverture existante
          if (book.coverUrl) {
            setCoverUrl(book.coverUrl)
            setCoverFileList([
              {
                uid: 'cover-1',
                name: 'Couverture',
                status: 'done',
                url: book.coverUrl,
              },
            ])
          } else {
            setCoverUrl(null)
            setCoverFileList([])
          }

          const existingFiles = Array.isArray(book.files) ? book.files : []

          setAttachedFiles(
            existingFiles.map((f) => ({
              label: f.label,
              description: f.description || '',
              fileUrl: f.fileUrl,
            }))
          )

          setFileList(
            existingFiles.map((f, idx) => ({
              uid: `existing-${idx}`,
              name: f.label || `PDF ${idx + 1}`,
              status: 'done',
              url: f.fileUrl,
            }))
          )
        } catch (e) {
          console.error(e)
          message.error('Livre introuvable.')
          navigate('/admin/books')
        } finally {
          setLoading(false)
        }
      }
      fetchBook()
    } else {
      form.setFieldsValue({
        isPublic: true,
        isFeatured: false,
        status: 'published', // ✅ défaut recommandé
      })
      setAttachedFiles([])
      setFileList([])
      setCoverUrl(null)
      setCoverFileList([])
      setLoading(false)
    }
  }, [id, isNew, form, navigate])

  const onFinish = async (values) => {
    if (!attachedFiles.length) {
      message.warning('Ajoute au moins un PDF au pack.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        title: values.title,
        slug: values.slug,
        description: values.description,
        price: values.price || 0,
        isPublic: !!values.isPublic,
        isFeatured: !!values.isFeatured,
        status: values.status || 'draft',
        coverUrl: coverUrl || null, // 👈 vient de l’upload d’image
        files: attachedFiles,
      }

      if (isNew) {
        await api.post('/admin/books', payload)
        message.success('Pack PDF créé.')
      } else {
        await api.put(`/admin/books/${id}`, payload)
        message.success('Pack PDF mis à jour.')
      }
      navigate('/admin/books')
    } catch (e) {
      console.error(e)
      message.error("Erreur lors de l'enregistrement du pack.")
    } finally {
      setSaving(false)
    }
  }

  /**
   * Upload PDF vers /admin/upload/document (GCS)
   */
  const handleUploadRequest = async (options) => {
    const { file, onSuccess, onError } = options
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'docs/books')

    try {
      const { data } = await api.post('/admin/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const url = data?.file?.url || data?.url || data?.fileUrl || data?.location

      if (!url) {
        throw new Error("Réponse d'upload invalide (pas d'URL).")
      }

      setAttachedFiles((prev) => [
        ...prev,
        {
          label: file.name,
          description: '',
          fileUrl: url,
        },
      ])

      onSuccess(data, file)
      message.success(`PDF "${file.name}" ajouté au pack.`)
    } catch (err) {
      console.error(err)
      message.error("Erreur lors de l'upload du PDF.")
      onError(err)
    }
  }

  const handleUploadChange = ({ file, fileList: newFileList }) => {
    setFileList(newFileList)

    if (file.status === 'removed') {
      setAttachedFiles((prev) =>
        prev.filter(
          (f) => !(f.label === file.name || (file.url && f.fileUrl === file.url))
        )
      )
    }
  }

  const handleRemoveAttachedFile = (fileUrlOrLabel) => {
    setAttachedFiles((prev) =>
      prev.filter((f) => !(f.fileUrl === fileUrlOrLabel || f.label === fileUrlOrLabel))
    )
    setFileList((prev) =>
      prev.filter((fl) => !(fl.url === fileUrlOrLabel || fl.name === fileUrlOrLabel))
    )
  }

  /**
   * Upload de la couverture vers /admin/upload/image (GCS)
   */
  const handleCoverUpload = async (options) => {
    const { file, onSuccess, onError } = options
    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'images/books')

    try {
      const { data } = await api.post('/admin/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const url = data?.file?.url || data?.url || data?.fileUrl || data?.location

      if (!url) {
        throw new Error("Réponse d'upload invalide (pas d'URL pour la couverture).")
      }

      setCoverUrl(url)
      setCoverFileList([
        {
          uid: 'cover-1',
          name: file.name,
          status: 'done',
          url,
        },
      ])

      onSuccess(data, file)
      message.success('Couverture uploadée avec succès.')
    } catch (err) {
      console.error(err)
      message.error("Erreur lors de l'upload de la couverture.")
      onError(err)
    }
  }

  const handleCoverChange = ({ file, fileList: newList }) => {
    setCoverFileList(newList)
    // si on supprime depuis l'UI
    if (file.status === 'removed') {
      setCoverUrl(null)
    }
  }

  const handleCoverRemove = () => {
    setCoverUrl(null)
    setCoverFileList([])
    return true
  }

  if (loading) return <PageLoader />

  return (
    <div className="page">
      {/* Header */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Space align="center">
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/books')}>
            Retour
          </Button>
          <div>
            <Title level={2} style={{ marginBottom: 0 }}>
              {isNew ? 'Nouveau pack PDF' : 'Éditer le pack PDF'}
            </Title>
            <Text type="secondary">
              Définis le titre, la couverture, la visibilité, le statut et les fichiers PDF associés.
            </Text>
          </div>
        </Space>

        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={() => form.submit()}
          loading={saving}
        >
          Enregistrer
        </Button>
      </div>

      <Card
        bordered={false}
        style={{
          borderRadius: 16,
          boxShadow: '0 8px 24px rgba(0,0,0,0.04)',
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Form layout="vertical" form={form} onFinish={onFinish} style={{ maxWidth: 900 }}>
          {/* Infos générales */}
          <Title level={4} style={{ marginTop: 0 }}>
            Informations générales
          </Title>

          <Form.Item
            label="Titre du pack"
            name="title"
            rules={[{ required: true, message: 'Titre requis.' }]}
          >
            <Input placeholder="Ex. Pack RH — Paie & Reporting" />
          </Form.Item>

          <Form.Item
            label="Slug (URL)"
            name="slug"
            extra="Optionnel : si vide, il peut être généré côté backend."
          >
            <Input placeholder="ex: pack-rh-paie-ia" />
          </Form.Item>

          <Form.Item label="Description" name="description">
            <TextArea
              rows={4}
              placeholder="Description détaillée du contenu du pack, bénéfices, public visé..."
            />
          </Form.Item>

          <Form.Item label="Prix (FCFA)" name="price">
            <InputNumber style={{ width: 200 }} min={0} step={1000} placeholder="0 = Gratuit" />
          </Form.Item>

          {/* Statut */}
          <Form.Item
            label="Statut"
            name="status"
            rules={[{ required: true, message: 'Statut requis.' }]}
          >
            <Select style={{ width: 260 }}>
              <Option value="draft">Brouillon (draft)</Option>
              <Option value="published">Publié (published)</Option>
              <Option value="archived">Archivé (archived)</Option>
            </Select>
          </Form.Item>

          {/* Couverture */}
          <Form.Item label="Couverture (image)">
            <Upload
              accept="image/*"
              listType="picture-card"
              maxCount={1}
              fileList={coverFileList}
              customRequest={handleCoverUpload}
              onChange={handleCoverChange}
              onRemove={handleCoverRemove}
            >
              {coverFileList.length >= 1 ? null : (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Uploader</div>
                </div>
              )}
            </Upload>
            {coverUrl && (
              <Text type="secondary" style={{ display: 'block', marginTop: 4 }}>
                URL enregistrée : {coverUrl}
              </Text>
            )}
          </Form.Item>

          <Form.Item label="Visibilité">
            <Space direction="vertical">
              <Space>
                <Form.Item name="isPublic" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
                <Text type="secondary">Rendre le pack visible dans la liste publique.</Text>
              </Space>

              <Space>
                <Form.Item name="isFeatured" valuePropName="checked" noStyle>
                  <Switch />
                </Form.Item>
                <Text type="secondary">
                  Mettre en avant ce pack (homepage, section “À la une”).
                </Text>
              </Space>
            </Space>
          </Form.Item>

          <Divider />

          {/* Fichiers PDF */}
          <Title level={4}>Fichiers PDF du pack</Title>
          <Text type="secondary">
            Tu peux sélectionner plusieurs PDF en une seule fois. Ils seront uploadés puis rattachés
            automatiquement à ce pack.
          </Text>

          <div style={{ marginTop: 12, marginBottom: 12 }}>
            <Upload
              multiple
              accept="application/pdf"
              fileList={fileList}
              customRequest={handleUploadRequest}
              onChange={handleUploadChange}
              onRemove={() => true}
            >
              <Button icon={<UploadOutlined />}>Uploader un ou plusieurs PDF</Button>
            </Upload>
          </div>

          {/* Liste des PDF déjà attachés */}
          {attachedFiles.length > 0 && (
            <Card
              size="small"
              style={{
                marginTop: 8,
                borderRadius: 12,
                background: '#fafafa',
              }}
              title={
                <Space>
                  <FilePdfOutlined />
                  <span>PDF attachés à ce pack</span>
                </Space>
              }
            >
              <List
                size="small"
                dataSource={attachedFiles}
                renderItem={(f) => (
                  <List.Item
                    actions={[
                      <Button
                        key="remove"
                        size="small"
                        danger
                        onClick={() => handleRemoveAttachedFile(f.fileUrl || f.label)}
                      >
                        Retirer
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={<FilePdfOutlined style={{ color: '#cf1322' }} />}
                      title={f.label}
                      description={f.fileUrl}
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Form>
      </Card>
    </div>
  )
}

export default BookEditPage
