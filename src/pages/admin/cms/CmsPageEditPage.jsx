// src/pages/admin/cms/CmsPageEditPage.jsx
import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Form,
  Input,
  Select,
  Typography,
  message,
  Upload,
  Space,
  Divider,
  Card,
  List,
  Image,
} from 'antd'
import {
  UploadOutlined,
  DeleteOutlined,
  CloudUploadOutlined,
} from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text } = Typography
const { TextArea } = Input
const { Option } = Select

function CmsPageEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)

  // Hero upload (1 image)
  const [uploadingHero, setUploadingHero] = useState(false)

  // Galerie (multi images)
  const [galleryFileList, setGalleryFileList] = useState([]) // Upload fileList
  const [galleryUploading, setGalleryUploading] = useState(false)
  const [galleryImages, setGalleryImages] = useState([]) // [{ url, caption }]

  const [form] = Form.useForm()

  const galleryPendingCount = useMemo(() => {
    return (galleryFileList || []).filter((f) => f.originFileObj && !f.url).length
  }, [galleryFileList])

  useEffect(() => {
    if (!isNew) {
      async function fetchPage() {
        setLoading(true)
        try {
          const { data } = await api.get(`/admin/cms/pages/${id}`)
          const page = data.page

          let heroBlock = null
          let richBlock = null
          let galleryBlock = null

          if (Array.isArray(page.contentBlocks)) {
            heroBlock = page.contentBlocks.find((b) => b.type === 'hero') || null
            richBlock = page.contentBlocks.find((b) => b.type === 'richtext') || null
            galleryBlock = page.contentBlocks.find((b) => b.type === 'imageGallery') || null
          }

          form.setFieldsValue({
            title: page.title,
            slug: page.slug,
            status: page.status,
            description: page.seo?.metaDescription || '',

            heroTitle: heroBlock?.data?.title || page.title,
            heroSubtitle: heroBlock?.data?.subtitle || '',
            heroImageUrl: heroBlock?.data?.imageUrl || '',
            heroCtaText: heroBlock?.data?.ctaText || '',

            bodyTitle: richBlock?.data?.title || '',
            bodyHtml: richBlock?.data?.html || '',

            galleryTitle: galleryBlock?.data?.title || '',
          })

          // Galerie existante
          const existing = Array.isArray(galleryBlock?.data?.images) ? galleryBlock.data.images : []
          const normalizedImages = existing
            .map((it) => {
              if (!it) return null
              if (typeof it === 'string') return { url: it, caption: '' }
              if (it.url) return { url: it.url, caption: it.caption || '' }
              return null
            })
            .filter(Boolean)

          setGalleryImages(normalizedImages)

          setGalleryFileList(
            normalizedImages.map((img, idx) => ({
              uid: `gallery-${idx}`,
              name: img.url.split('/').pop() || `image-${idx + 1}.jpg`,
              status: 'done',
              url: img.url,
            }))
          )
        } catch (e) {
          // eslint-disable-next-line no-console
          console.error(e)
          message.error('Page introuvable.')
          navigate('/admin/cms/pages')
        } finally {
          setLoading(false)
        }
      }
      fetchPage()
    } else {
      form.setFieldsValue({ status: 'draft' })
      setGalleryFileList([])
      setGalleryImages([])
      setLoading(false)
    }
  }, [id, isNew, form, navigate])

  const onFinish = async (values) => {
    setSaving(true)
    try {
      const contentBlocks = []

      // HERO
      if (
        values.heroTitle ||
        values.heroSubtitle ||
        values.heroImageUrl ||
        values.heroCtaText
      ) {
        contentBlocks.push({
          type: 'hero',
          data: {
            title: values.heroTitle || values.title,
            subtitle: values.heroSubtitle || '',
            imageUrl: values.heroImageUrl || '',
            ctaText: values.heroCtaText || '',
          },
        })
      }

      // GALERIE (multi images)
      if ((values.galleryTitle && values.galleryTitle.trim()) || (galleryImages && galleryImages.length > 0)) {
        contentBlocks.push({
          type: 'imageGallery',
          data: {
            title: (values.galleryTitle || '').trim(),
            images: (galleryImages || [])
              .filter((x) => x && x.url)
              .map((x) => ({ url: x.url, caption: x.caption || '' })),
          },
        })
      }

      // CONTENU PRINCIPAL
      if (values.bodyHtml || values.bodyTitle) {
        contentBlocks.push({
          type: 'richtext',
          data: {
            title: values.bodyTitle || '',
            html: values.bodyHtml || '',
          },
        })
      }

      const payload = {
        title: values.title,
        slug: values.slug || undefined,
        status: values.status,
        seo: {
          metaDescription: values.description || '',
        },
        contentBlocks,
      }

      if (isNew) {
        await api.post('/admin/cms/pages', payload)
        message.success('Page créée.')
      } else {
        await api.put(`/admin/cms/pages/${id}`, payload)
        message.success('Page mise à jour.')
      }
      navigate('/admin/cms/pages')
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e)
      message.error(e?.response?.data?.message || 'Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  // Upload custom pour l'image du hero (1 fichier)
  const handleHeroUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploadingHero(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'images/cms/hero')

      const { data } = await api.post('/admin/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const url = data?.file?.url || data?.url || data?.location
      if (!url) throw new Error('Réponse API invalide: url manquante')

      form.setFieldsValue({ heroImageUrl: url })

      message.success('Image du hero uploadée.')
      onSuccess && onSuccess(data)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      message.error("Échec de l'upload de l'image du hero.")
      onError && onError(err)
    } finally {
      setUploadingHero(false)
    }
  }

  /**
   * Galerie: on laisse l’utilisateur sélectionner plusieurs images
   * puis on les upload en une seule requête sur /admin/upload/images
   */
  const beforeGalleryUpload = () => {
    // IMPORTANT: retourne false pour empêcher l’upload auto par fichier
    return false
  }

  const handleGalleryChange = ({ fileList: newList }) => {
    setGalleryFileList(newList || [])
  }

  const uploadSelectedGalleryImages = async () => {
    const pending = (galleryFileList || []).filter((f) => f.originFileObj && !f.url)
    if (!pending.length) {
      message.info("Aucune nouvelle image à uploader.")
      return
    }

    setGalleryUploading(true)
    try {
      const formData = new FormData()
      pending.forEach((f) => {
        formData.append('files', f.originFileObj) // champ array: files
      })
      formData.append('folder', 'images/cms/gallery')

      const { data } = await api.post('/admin/upload/images', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      // Formats acceptés (fallbacks)
      const filesArr =
        (Array.isArray(data?.files) && data.files) ||
        (Array.isArray(data?.items) && data.items) ||
        (data?.file ? [data.file] : [])

      const uploadedUrls = filesArr
        .map((it) => it?.url || it?.location)
        .filter(Boolean)

      if (!uploadedUrls.length) {
        throw new Error("Réponse d'upload invalide (pas d'URLs).")
      }

      // Associer (par ordre) aux pending
      const nextFileList = [...galleryFileList]
      const nextImages = [...galleryImages]

      let urlIdx = 0
      for (let i = 0; i < nextFileList.length && urlIdx < uploadedUrls.length; i++) {
        const f = nextFileList[i]
        if (f.originFileObj && !f.url) {
          const url = uploadedUrls[urlIdx++]
          nextFileList[i] = {
            ...f,
            status: 'done',
            url,
          }
          // pousser dans galleryImages si pas déjà là
          if (!nextImages.some((x) => x.url === url)) {
            nextImages.push({ url, caption: '' })
          }
        }
      }

      setGalleryFileList(nextFileList)
      setGalleryImages(nextImages)

      message.success(`${uploadedUrls.length} image(s) uploadée(s) dans la galerie.`)
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err)
      message.error("Échec de l'upload des images de la galerie.")
    } finally {
      setGalleryUploading(false)
    }
  }

  const removeGalleryItem = (urlOrUid) => {
    setGalleryFileList((prev) =>
      (prev || []).filter((f) => f.uid !== urlOrUid && f.url !== urlOrUid)
    )
    setGalleryImages((prev) =>
      (prev || []).filter((img) => img.url !== urlOrUid)
    )
  }

  const updateCaption = (url, caption) => {
    setGalleryImages((prev) =>
      (prev || []).map((img) => (img.url === url ? { ...img, caption } : img))
    )
  }

  if (loading) return <PageLoader />

  return (
    <div className="page">
      <Title level={2}>{isNew ? 'Nouvelle page' : 'Éditer la page'}</Title>

      <Form layout="vertical" form={form} style={{ maxWidth: 900 }} onFinish={onFinish}>
        {/* MÉTA / SLUG */}
        <Card bordered={false} style={{ borderRadius: 16, marginBottom: 16 }}>
          <Title level={4} style={{ marginTop: 0 }}>
            Informations
          </Title>

          <Form.Item
            label="Titre de la page"
            name="title"
            rules={[{ required: true, message: 'Le titre est obligatoire.' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label="Slug"
            name="slug"
            extra={
              <>
                <div>
                  - Si vous mettez <code>home</code>, la page sera utilisée comme contenu de la page
                  d&apos;accueil (<code>/</code>).
                </div>
                <div>
                  - Pour toute autre valeur (ex : <code>a-propos</code>), la page sera visible sur{' '}
                  <code>/page/&lt;slug&gt;</code> (ex : <code>/page/a-propos</code>).
                </div>
              </>
            }
          >
            <Input placeholder="Laisser vide pour générer automatiquement" />
          </Form.Item>

          <Form.Item label="Meta description (SEO)" name="description">
            <TextArea rows={2} />
          </Form.Item>

          <Form.Item
            label="Statut"
            name="status"
            rules={[{ required: true, message: 'Le statut est obligatoire.' }]}
          >
            <Select>
              <Option value="draft">Brouillon</Option>
              <Option value="published">Publié</Option>
            </Select>
          </Form.Item>
        </Card>

        {/* HERO SECTION */}
        <Card bordered={false} style={{ borderRadius: 16, marginBottom: 16 }}>
          <Title level={4} style={{ marginTop: 0 }}>
            Hero de la page
          </Title>

          <Form.Item label="Titre du hero" name="heroTitle">
            <Input placeholder="Titre principal en haut de la page" />
          </Form.Item>

          <Form.Item label="Sous-titre du hero" name="heroSubtitle">
            <TextArea rows={2} placeholder="Texte d’introduction" />
          </Form.Item>

          <Form.Item
            label="URL de l’image du hero"
            name="heroImageUrl"
            extra="Ce champ est rempli automatiquement après upload. Vous pouvez aussi coller une URL publique si besoin."
          >
            <Input placeholder="https://..." />
          </Form.Item>

          <Form.Item label="Uploader une image pour le hero">
            <Upload accept="image/*" customRequest={handleHeroUpload} showUploadList={false}>
              <Button loading={uploadingHero} icon={<UploadOutlined />}>
                Choisir une image…
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item label="Texte du bouton (CTA)" name="heroCtaText">
            <Input placeholder="Ex : Découvrir nos formations" />
          </Form.Item>
        </Card>

        {/* GALERIE (MULTI IMAGES) */}
        <Card bordered={false} style={{ borderRadius: 16, marginBottom: 16 }}>
          <Title level={4} style={{ marginTop: 0 }}>
            Galerie
          </Title>

          <Text type="secondary">
            Sélectionne plusieurs images d’un coup, puis clique sur “Uploader la sélection”.
            Les URLs seront enregistrées dans un block <code>imageGallery</code> de la page.
          </Text>

          <Divider />

          <Form.Item label="Titre de la galerie (optionnel)" name="galleryTitle">
            <Input placeholder="Ex : Galeries" />
          </Form.Item>

          <Space style={{ marginBottom: 12 }} wrap>
            <Upload
              multiple
              accept="image/*"
              beforeUpload={beforeGalleryUpload}
              onChange={handleGalleryChange}
              fileList={galleryFileList}
              listType="picture-card"
              onRemove={(file) => {
                // retire local + si déjà uploadé, retire aussi de la liste persistée
                if (file?.url) removeGalleryItem(file.url)
                else removeGalleryItem(file?.uid)
                return false
              }}
            >
              <div>
                <UploadOutlined />
                <div style={{ marginTop: 8 }}>Sélectionner</div>
              </div>
            </Upload>

            <Button
              type="primary"
              icon={<CloudUploadOutlined />}
              loading={galleryUploading}
              disabled={galleryPendingCount === 0}
              onClick={uploadSelectedGalleryImages}
            >
              Uploader la sélection ({galleryPendingCount})
            </Button>
          </Space>

          {galleryImages.length > 0 && (
            <Card size="small" style={{ borderRadius: 12, background: '#fafafa' }}>
              <List
                dataSource={galleryImages}
                rowKey={(item) => item.url}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      <Button
                        key="remove"
                        danger
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={() => removeGalleryItem(item.url)}
                      >
                        Retirer
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Image
                          src={item.url}
                          width={64}
                          height={64}
                          style={{ objectFit: 'cover', borderRadius: 8 }}
                          preview={{ mask: 'Aperçu' }}
                        />
                      }
                      title={
                        <Text ellipsis style={{ maxWidth: 520, display: 'inline-block' }}>
                          {item.url}
                        </Text>
                      }
                      description={
                        <Input
                          placeholder="Caption (optionnel)"
                          value={item.caption || ''}
                          onChange={(e) => updateCaption(item.url, e.target.value)}
                          style={{ maxWidth: 520 }}
                        />
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          )}
        </Card>

        {/* CONTENU PRINCIPAL */}
        <Card bordered={false} style={{ borderRadius: 16, marginBottom: 16 }}>
          <Title level={4} style={{ marginTop: 0 }}>
            Contenu principal
          </Title>

          <Form.Item label="Titre de section" name="bodyTitle">
            <Input placeholder="Ex : Qui sommes-nous ?" />
          </Form.Item>

          <Form.Item
            label="Contenu (HTML)"
            name="bodyHtml"
            extra="Vous pouvez coller du HTML simple (paragraphes, titres, listes, etc.)."
          >
            <TextArea rows={10} />
          </Form.Item>
        </Card>

        <Form.Item style={{ marginTop: 12 }}>
          <Space>
            <Button onClick={() => navigate('/admin/cms/pages')}>Annuler</Button>
            <Button type="primary" htmlType="submit" loading={saving}>
              Enregistrer
            </Button>
          </Space>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CmsPageEditPage
