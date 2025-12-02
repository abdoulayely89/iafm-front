// src/pages/admin/cms/CmsPageEditPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Form,
  Input,
  Select,
  Typography,
  message,
  Upload,
} from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title } = Typography
const { TextArea } = Input
const { Option } = Select

function CmsPageEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploadingHero, setUploadingHero] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    if (!isNew) {
      async function fetchPage() {
        setLoading(true)
        try {
          const { data } = await api.get(`/admin/cms/pages/${id}`)
          const page = data.page

          let heroBlock = null
          let richBlock = null

          if (Array.isArray(page.contentBlocks)) {
            heroBlock = page.contentBlocks.find((b) => b.type === 'hero') || null
            richBlock =
              page.contentBlocks.find((b) => b.type === 'richtext') || null
          }

          form.setFieldsValue({
            // champs basiques
            title: page.title,
            slug: page.slug,
            status: page.status,
            description: page.seo?.metaDescription || '',

            // hero
            heroTitle: heroBlock?.data?.title || page.title,
            heroSubtitle: heroBlock?.data?.subtitle || '',
            heroImageUrl: heroBlock?.data?.imageUrl || '',
            heroCtaText: heroBlock?.data?.ctaText || '',

            // contenu principal
            bodyTitle: richBlock?.data?.title || '',
            bodyHtml: richBlock?.data?.html || '',
          })
        } catch (e) {
          console.error(e)
          message.error('Page introuvable.')
          navigate('/admin/cms/pages')
        } finally {
          setLoading(false)
        }
      }
      fetchPage()
    } else {
      form.setFieldsValue({
        status: 'draft',
      })
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
      console.error(e)
      message.error(
        e?.response?.data?.message || 'Erreur lors de la sauvegarde.'
      )
    } finally {
      setSaving(false)
    }
  }

  // Upload custom pour l'image du hero
  const handleHeroUpload = async ({ file, onSuccess, onError }) => {
    try {
      setUploadingHero(true)
      const formData = new FormData()
      formData.append('file', file)
      // optionnel : dossier spécifique
      formData.append('folder', 'images/cms/hero')

      // Avec ton routeur, ça donnera /api/admin/upload/image
      const { data } = await api.post('/admin/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (!data || !data.file || !data.file.url) {
        throw new Error('Réponse API invalide: url manquante')
      }

      form.setFieldsValue({
        heroImageUrl: data.file.url,
      })

      message.success("Image du hero uploadée.")
      onSuccess && onSuccess(data)
    } catch (err) {
      console.error(err)
      message.error("Échec de l'upload de l'image du hero.")
      onError && onError(err)
    } finally {
      setUploadingHero(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="page">
      <Title level={2}>{isNew ? 'Nouvelle page' : 'Éditer la page'}</Title>

      <Form
        layout="vertical"
        form={form}
        style={{ maxWidth: 800 }}
        onFinish={onFinish}
      >
        {/* MÉTA / SLUG */}
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
                - Si vous mettez <code>home</code>, la page sera utilisée comme
                contenu de la page d&apos;accueil (<code>/</code>).
              </div>
              <div>
                - Pour toute autre valeur (ex : <code>a-propos</code>), la page
                sera visible sur <code>/page/&lt;slug&gt;</code> (ex :
                <code>/page/a-propos</code>).
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

        {/* HERO SECTION */}
        <Title level={4} style={{ marginTop: 24 }}>
          Hero de la page
        </Title>

        <Form.Item label="Titre du hero" name="heroTitle">
          <Input placeholder="Titre principal en haut de la page" />
        </Form.Item>

        <Form.Item label="Sous-titre du hero" name="heroSubtitle">
          <TextArea rows={2} placeholder="Texte d’introduction" />
        </Form.Item>

        {/* URL remplie automatiquement après upload */}
        <Form.Item
          label="URL de l’image du hero"
          name="heroImageUrl"
          extra="Ce champ est rempli automatiquement après upload. Vous pouvez aussi coller une URL publique si besoin."
        >
          <Input placeholder="https://..." />
        </Form.Item>

        <Form.Item label="Uploader une image pour le hero">
          <Upload
            accept="image/*"
            customRequest={handleHeroUpload}
            showUploadList={false}
          >
            <Button loading={uploadingHero} icon={<UploadOutlined />}>
              Choisir une image…
            </Button>
          </Upload>
        </Form.Item>

        <Form.Item label="Texte du bouton (CTA)" name="heroCtaText">
          <Input placeholder="Ex : Découvrir nos formations" />
        </Form.Item>

        {/* CONTENU PRINCIPAL */}
        <Title level={4} style={{ marginTop: 24 }}>
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
          <TextArea rows={8} />
        </Form.Item>

        <Form.Item style={{ marginTop: 24 }}>
          <Button
            style={{ marginRight: 12 }}
            onClick={() => navigate('/admin/cms/pages')}
          >
            Annuler
          </Button>
          <Button type="primary" htmlType="submit" loading={saving}>
            Enregistrer
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}

export default CmsPageEditPage
