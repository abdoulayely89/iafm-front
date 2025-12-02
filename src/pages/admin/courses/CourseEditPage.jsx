import React, { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  Typography,
  message,
  Card,
  Space,
  Divider,
} from 'antd'
import {
  ArrowLeftOutlined,
  BookOutlined,
  StarOutlined,
  PictureOutlined,
  UploadOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text, Paragraph } = Typography
const { TextArea } = Input
const { Option } = Select

function CourseEditPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [uploadingPromo, setUploadingPromo] = useState(false)
  const [form] = Form.useForm()

  const thumbInputRef = useRef(null)
  const promoInputRef = useRef(null)

  useEffect(() => {
    if (!isNew) {
      async function fetchCourse() {
        setLoading(true)
        try {
          const { data } = await api.get(`/admin/courses/${id}`)
          const course = data.course
          form.setFieldsValue({
            title: course.title,
            slug: course.slug,
            description: course.description,
            level: course.level,
            price: course.price,
            status: course.status,
            featured: course.featured,
            thumbnailUrl: course.thumbnailUrl || '',
            promoVideoUrl: course.promoVideoUrl || '',
          })
        } catch (e) {
          message.error('Cours introuvable.')
          navigate('/admin/courses')
        } finally {
          setLoading(false)
        }
      }
      fetchCourse()
    } else {
      form.setFieldsValue({
        level: 'debutant',
        price: 0,
        status: 'draft',
        featured: false,
        thumbnailUrl: '',
        promoVideoUrl: '',
      })
    }
  }, [id, isNew, form, navigate])

  const onFinish = async (values) => {
    setSaving(true)
    try {
      const payload = {
        ...values,
        thumbnailUrl: values.thumbnailUrl || null,
        promoVideoUrl: values.promoVideoUrl || null,
      }

      if (isNew) {
        await api.post('/admin/courses', payload)
        message.success('Cours créé.')
      } else {
        await api.put(`/admin/courses/${id}`, payload)
        message.success('Cours mis à jour.')
      }
      navigate('/admin/courses')
    } catch (e) {
      message.error(
        e?.response?.data?.message || 'Erreur lors de la sauvegarde.'
      )
    } finally {
      setSaving(false)
    }
  }

  // --- Upload thumbnail image ---
  const handleClickUploadThumb = () => {
    if (thumbInputRef.current) {
      thumbInputRef.current.click()
    }
  }

  const handleThumbFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'images/courses')

    try {
      setUploadingThumb(true)
      const { data } = await api.post('/admin/upload/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const url = data?.file?.url
      if (!url) {
        message.error("Réponse d'upload invalide.")
        return
      }

      form.setFieldsValue({ thumbnailUrl: url })
      message.success('Image du cours uploadée.')
    } catch (e) {
      console.error(e)
      message.error(
        e?.response?.data?.message ||
          "Impossible d'uploader l'image du cours."
      )
    } finally {
      setUploadingThumb(false)
      if (thumbInputRef.current) thumbInputRef.current.value = ''
    }
  }

  // --- Upload promo video ---
  const handleClickUploadPromo = () => {
    if (promoInputRef.current) {
      promoInputRef.current.click()
    }
  }

  const handlePromoFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'videos/courses/promo')

    try {
      setUploadingPromo(true)
      // utilise ton endpoint existant /api/admin/upload/video
      const { data } = await api.post('/admin/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const url = data?.file?.url
      if (!url) {
        message.error("Réponse d'upload invalide pour la vidéo.")
        return
      }

      form.setFieldsValue({ promoVideoUrl: url })
      message.success('Vidéo de présentation uploadée.')
    } catch (e) {
      console.error(e)
      message.error(
        e?.response?.data?.message ||
          "Impossible d'uploader la vidéo de présentation."
      )
    } finally {
      setUploadingPromo(false)
      if (promoInputRef.current) promoInputRef.current.value = ''
    }
  }

  if (loading) {
    return <PageLoader />
  }

  const thumbnailUrl = form.getFieldValue('thumbnailUrl')
  const promoVideoUrl = form.getFieldValue('promoVideoUrl')

  return (
    <div className="page page-course-edit">
      {/* Barre de titre + retour */}
      <div
        style={{
          marginBottom: 16,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/admin/courses')}
        >
          Retour aux cours
        </Button>

        {!isNew && (
          <Text type="secondary">
            ID du cours : <Text code>{id}</Text>
          </Text>
        )}
      </div>

      {/* Titre + sous-titre */}
      <div style={{ marginBottom: 16 }}>
        <Title level={2} style={{ marginBottom: 0 }}>
          {isNew ? 'Nouveau cours' : 'Éditer le cours'}
        </Title>
        <Paragraph type="secondary" style={{ marginTop: 4 }}>
          {isNew
            ? 'Créez la fiche du cours. Vous pourrez ajouter les leçons après enregistrement.'
            : 'Modifiez les informations du cours et accédez à la gestion des leçons.'}
        </Paragraph>
      </div>

      {/* FORMULAIRE PRINCIPAL – PLEINE LARGEUR */}
      <Card
        title={
          <Space>
            <BookOutlined />
            <span>Informations du cours</span>
          </Space>
        }
        style={{
          width: '100%',
          marginBottom: 24,
        }}
      >
        <Form layout="vertical" form={form} onFinish={onFinish}>
          {/* Section infos générales */}
          <Title level={5} style={{ marginTop: 0 }}>
            Infos générales
          </Title>

          <Form.Item
            label="Titre"
            name="title"
            rules={[{ required: true, message: 'Le titre est obligatoire.' }]}
          >
            <Input placeholder="Ex : Devenir développeur MERN en 90 jours" />
          </Form.Item>

          <Form.Item label="Slug" name="slug">
            <Input placeholder="Laisser vide pour générer automatiquement" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[
              { required: true, message: 'La description est obligatoire.' },
            ]}
          >
            <TextArea
              rows={5}
              placeholder="Décrivez le contenu, les objectifs et le public cible du cours."
            />
          </Form.Item>

          <Divider />

          {/* VISUELS */}
          <Title level={5}>Visuels & vidéo</Title>

          {/* Thumbnail */}
          <Space
            align="start"
            style={{ width: '100%', marginBottom: 24 }}
            size={24}
          >
            <div style={{ flex: 1 }}>
              <Form.Item
                label={
                  <Space>
                    <PictureOutlined />
                    <span>Image du cours (thumbnail)</span>
                  </Space>
                }
                name="thumbnailUrl"
                extra="Cette image sera utilisée sur la page d’accueil et dans le catalogue."
              >
                <Input placeholder="Ou collez ici une URL directe de l’image" />
              </Form.Item>

              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleThumbFileChange}
              />

              <Button
                icon={<UploadOutlined />}
                onClick={handleClickUploadThumb}
                loading={uploadingThumb}
              >
                Uploader une image
              </Button>
            </div>

            {thumbnailUrl && (
              <div
                style={{
                  width: 180,
                  height: 110,
                  borderRadius: 8,
                  overflow: 'hidden',
                  border: '1px solid #f0f0f0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#fafafa',
                }}
              >
                <img
                  src={thumbnailUrl}
                  alt="Thumbnail du cours"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'cover',
                  }}
                />
              </div>
            )}
          </Space>

          {/* Vidéo promo */}
          <Space
            align="start"
            style={{ width: '100%', marginBottom: 8 }}
            size={24}
          >
            <div style={{ flex: 1 }}>
              <Form.Item
                label={
                  <Space>
                    <PlayCircleOutlined />
                    <span>Vidéo de présentation (promo)</span>
                  </Space>
                }
                name="promoVideoUrl"
                extra="Courte vidéo de présentation du cours, affichée sur la page de détails."
              >
                <Input placeholder="Ou collez ici une URL directe de la vidéo" />
              </Form.Item>

              <input
                ref={promoInputRef}
                type="file"
                accept="video/*"
                style={{ display: 'none' }}
                onChange={handlePromoFileChange}
              />

              <Space>
                <Button
                  icon={<UploadOutlined />}
                  onClick={handleClickUploadPromo}
                  loading={uploadingPromo}
                >
                  Uploader une vidéo
                </Button>
                {promoVideoUrl && (
                  <Button
                    icon={<PlayCircleOutlined />}
                    type="default"
                    onClick={() => window.open(promoVideoUrl, '_blank')}
                  >
                    Prévisualiser la vidéo
                  </Button>
                )}
              </Space>
            </div>
          </Space>

          <Divider />

          {/* Section niveau / prix / statut */}
          <Title level={5}>Publication & tarification</Title>

          <Form.Item label="Niveau" name="level">
            <Select>
              <Option value="debutant">Débutant</Option>
              <Option value="intermediaire">Intermédiaire</Option>
              <Option value="avance">Avancé</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Prix (FCFA)" name="price">
            <InputNumber
              min={0}
              step={1000}
              style={{ width: '100%' }}
              placeholder="0 pour un cours gratuit"
            />
          </Form.Item>

          <Form.Item label="Statut" name="status">
            <Select>
              <Option value="draft">Brouillon</Option>
              <Option value="published">Publié</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <Space size={4}>
                <StarOutlined />
                <span>Mise en avant</span>
              </Space>
            }
            name="featured"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginTop: 16 }}>
            <Space>
              <Button onClick={() => navigate('/admin/courses')}>
                Annuler
              </Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                Enregistrer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>

      {/* BLOC LEÇONS DU COURS */}
      {!isNew && (
        <Card
          title="Leçons du cours"
          style={{
            width: '100%',
          }}
          extra={
            <Link to={`/admin/courses/${id}/lessons`}>Voir toutes</Link>
          }
        >
          <Text type="secondary">
            Gérer les leçons, leur contenu et l’ordre d’apparition pour ce
            cours.
          </Text>
          <div style={{ marginTop: 16 }}>
            <Button type="primary">
              <Link to={`/admin/courses/${id}/lessons`}>Gérer les leçons</Link>
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default CourseEditPage
