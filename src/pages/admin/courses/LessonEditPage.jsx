// src/pages/admin/lessons/LessonEditPage.jsx
import React, { useEffect, useState, useRef } from 'react'
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom'
import {
  Form,
  Input,
  Button,
  Typography,
  message,
  InputNumber,
  Switch,
  Card,
  Space,
  Divider,
  Select,
  Tag,
} from 'antd'
import {
  UploadOutlined,
  FileOutlined,
  VideoCameraAddOutlined,
} from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Paragraph, Text } = Typography
const { TextArea } = Input
const { Option } = Select

function LessonEditPage() {
  const params = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const courseId = params.courseId || searchParams.get('courseId') || null
  const lessonId = params.lessonId || params.id || 'new'
  const isNew = lessonId === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  // vidéos
  const [videos, setVideos] = useState([])
  const [loadingVideos, setLoadingVideos] = useState(false)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const videoFileInputRef = useRef(null)

  // upload ressources
  const [uploadingResource, setUploadingResource] = useState(false)
  const [resourceIndexToUpload, setResourceIndexToUpload] = useState(null)
  const resourceFileInputRef = useRef(null)

  async function fetchVideos() {
    try {
      setLoadingVideos(true)
      const { data } = await api.get('/admin/media/videos')
      setVideos(data.files || [])
    } catch (e) {
      console.error('Erreur chargement vidéos :', e?.response?.data || e)
      setVideos([])
    } finally {
      setLoadingVideos(false)
    }
  }

  useEffect(() => {
    fetchVideos()
  }, [])

  useEffect(() => {
    if (!isNew) {
      async function fetchLesson() {
        setLoading(true)
        try {
          const { data } = await api.get(`/admin/lessons/${lessonId}`)
          const lesson = data.lesson

          form.setFieldsValue({
            moduleTitle: lesson.moduleTitle,
            title: lesson.title,
            order: lesson.order ?? 0,
            videoUrl: lesson.videoUrl || undefined,
            content: lesson.content || '',
            resources:
              lesson.resources && lesson.resources.length
                ? lesson.resources
                : [{ label: '', fileUrl: '' }],
            hasQuiz: !!lesson.hasQuiz,
            isFreePreview: !!lesson.isFreePreview,
            durationMinutes: lesson.durationMinutes ?? 0,
          })
        } catch (e) {
          message.error('Leçon introuvable.')
          if (courseId) {
            navigate(`/admin/courses/${courseId}/lessons`)
          } else {
            navigate('/admin/courses')
          }
        } finally {
          setLoading(false)
        }
      }
      fetchLesson()
    } else {
      form.setFieldsValue({
        moduleTitle: '',
        title: '',
        order: 0,
        videoUrl: undefined,
        content: '',
        resources: [{ label: '', fileUrl: '' }],
        hasQuiz: false,
        isFreePreview: false,
        durationMinutes: 0,
      })
    }
  }, [isNew, lessonId, courseId, form, navigate])

  const onFinish = async (values) => {
    setSaving(true)
    try {
      const cleanedResources = Array.isArray(values.resources)
        ? values.resources.filter((r) => r && r.label && r.fileUrl)
        : []

      const payload = {
        moduleTitle: values.moduleTitle,
        title: values.title,
        order: values.order ?? 0,
        videoUrl: values.videoUrl || null,
        content: values.content || '',
        resources: cleanedResources,
        hasQuiz: !!values.hasQuiz,
        isFreePreview: !!values.isFreePreview,
        durationMinutes: values.durationMinutes ?? 0,
      }

      if (isNew) {
        if (!courseId) {
          message.error("CourseId manquant pour la création de la leçon.")
          setSaving(false)
          return
        }
        await api.post(`/admin/courses/${courseId}/lessons`, payload)
        message.success('Leçon créée.')
      } else {
        await api.put(`/admin/lessons/${lessonId}`, payload)
        message.success('Leçon mise à jour.')
      }

      if (courseId) {
        navigate(`/admin/courses/${courseId}/lessons`)
      } else {
        navigate('/admin/courses')
      }
    } catch (e) {
      message.error(
        e?.response?.data?.message ||
          'Erreur lors de la sauvegarde de la leçon.'
      )
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (courseId) {
      navigate(`/admin/courses/${courseId}/lessons`)
    } else {
      navigate('/admin/courses')
    }
  }

  // --- upload resource file ---
  const handleClickUploadResource = (index) => {
    setResourceIndexToUpload(index)
    if (resourceFileInputRef.current) {
      resourceFileInputRef.current.click()
    }
  }

  const handleResourceFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file || resourceIndexToUpload === null) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'docs/resources')

    try {
      setUploadingResource(true)
      const { data } = await api.post('/admin/upload/document', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const url = data?.file?.url
      if (!url) {
        message.error("Réponse d'upload invalide pour le document.")
        return
      }

      const currentResources = form.getFieldValue('resources') || []
      if (currentResources[resourceIndexToUpload]) {
        currentResources[resourceIndexToUpload].fileUrl = url
      }
      form.setFieldsValue({ resources: currentResources })

      message.success('Document de ressource uploadé.')
    } catch (e) {
      console.error(e)
      message.error(
        e?.response?.data?.message ||
          "Impossible d'uploader le document de ressource."
      )
    } finally {
      setUploadingResource(false)
      setResourceIndexToUpload(null)
      if (resourceFileInputRef.current) resourceFileInputRef.current.value = ''
    }
  }

  // --- upload direct vidéo ---
  const handleClickUploadVideo = () => {
    if (videoFileInputRef.current) {
      videoFileInputRef.current.click()
    }
  }

  const handleVideoFileChange = async (event) => {
    const file = event.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append('file', file)
    formData.append('folder', 'videos/lessons')

    try {
      setUploadingVideo(true)
      const { data } = await api.post('/admin/upload/video', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      const url = data?.file?.url
      if (!url) {
        message.error("Réponse d'upload invalide pour la vidéo.")
        return
      }

      // on met à jour le champ videoUrl du formulaire
      form.setFieldsValue({ videoUrl: url })

      // on ajoute aussi à la liste des vidéos pour le Select
      setVideos((prev) => [
        ...(prev || []),
        {
          url,
          originalName: data.file?.originalName || file.name,
          path: data.file?.path || '',
          size: data.file?.size || file.size,
          mimeType: data.file?.mimeType || file.type,
        },
      ])

      message.success('Vidéo uploadée pour cette leçon.')
    } catch (e) {
      console.error(e)
      message.error(
        e?.response?.data?.message ||
          "Impossible d'uploader la vidéo."
      )
    } finally {
      setUploadingVideo(false)
      if (videoFileInputRef.current) videoFileInputRef.current.value = ''
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="page">
      <Title level={2}>{isNew ? 'Nouvelle leçon' : 'Éditer la leçon'}</Title>

      {courseId && (
        <Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Leçon rattachée au cours : <Text code>{courseId}</Text>
        </Paragraph>
      )}

      <Form
        layout="vertical"
        form={form}
        onFinish={onFinish}
        style={{ maxWidth: 900 }}
      >
        <Card title="Informations générales" style={{ marginBottom: 24 }}>
          <Form.Item
            label="Module / Chapitre"
            name="moduleTitle"
            rules={[{ required: true, message: 'Le module est obligatoire.' }]}
          >
            <Input placeholder="Ex : Module 1 – Introduction" />
          </Form.Item>

          <Form.Item
            label="Titre de la leçon"
            name="title"
            rules={[{ required: true, message: 'Le titre est obligatoire.' }]}
          >
            <Input placeholder="Ex : Découvrir la stack MERN" />
          </Form.Item>

          <Space size="large" style={{ width: '100%' }}>
            <Form.Item
              label="Ordre d’affichage"
              name="order"
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="0, 1, 2..."
              />
            </Form.Item>

            <Form.Item
              label="Durée (minutes)"
              name="durationMinutes"
              style={{ flex: 1 }}
            >
              <InputNumber
                min={0}
                style={{ width: '100%' }}
                placeholder="Ex : 15"
              />
            </Form.Item>
          </Space>
        </Card>

        <Card title="Vidéo & contenu" style={{ marginBottom: 24 }}>
          {/* input file vidéo caché */}
          <input
            ref={videoFileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept="video/*"
            onChange={handleVideoFileChange}
          />

          <Space
            align="start"
            style={{ width: '100%', justifyContent: 'space-between' }}
          >
            <div style={{ flex: 1 }}>
              <Form.Item
                label="Vidéo de la leçon"
                name="videoUrl"
                extra="Sélectionnez une vidéo déjà uploadée ou uploadez-en une nouvelle."
              >
                <Select
                  allowClear
                  placeholder={
                    loadingVideos
                      ? 'Chargement des vidéos...'
                      : 'Choisir une vidéo'
                  }
                  loading={loadingVideos}
                  showSearch
                  optionFilterProp="children"
                >
                  {videos.map((file) => (
                    <Option key={file.url} value={file.url}>
                      <Space size={8}>
                        <Tag color="blue">Vidéo</Tag>
                        <span>
                          {file.originalName || file.path || file.url}
                        </span>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </div>

            <div style={{ marginLeft: 16 }}>
              <Space direction="vertical">
                <Button
                  icon={<VideoCameraAddOutlined />}
                  onClick={handleClickUploadVideo}
                  loading={uploadingVideo}
                >
                  Uploader une vidéo
                </Button>
                <Button type="default">
                  <Link
                    to="/admin/media"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Gérer les vidéos
                  </Link>
                </Button>
              </Space>
            </div>
          </Space>

          <Form.Item
            label="Contenu texte (optionnel)"
            name="content"
            extra="Texte complémentaire, résumé de la leçon, consignes, etc."
          >
            <TextArea rows={6} />
          </Form.Item>

          <Space size="large">
            <Form.Item
              label="Leçon avec quiz ?"
              name="hasQuiz"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>

            <Form.Item
              label="Leçon accessible en preview gratuite ?"
              name="isFreePreview"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          </Space>
        </Card>

        <Card
          title="Ressources à télécharger (PDF, docs, etc.)"
          style={{ marginBottom: 24 }}
        >
          {/* input file caché pour ressources */}
          <input
            ref={resourceFileInputRef}
            type="file"
            style={{ display: 'none' }}
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip"
            onChange={handleResourceFileChange}
          />

          <Form.List name="resources">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }, index) => {
                  const resources = form.getFieldValue('resources') || []
                  const current = resources[index] || {}
                  const hasFile = !!current.fileUrl

                  return (
                    <Card
                      key={key}
                      size="small"
                      style={{ marginBottom: 12 }}
                      type="inner"
                      title={`Ressource ${index + 1}`}
                      extra={
                        <Button
                          type="link"
                          danger
                          onClick={() => remove(name)}
                        >
                          Supprimer
                        </Button>
                      }
                    >
                      <Form.Item
                        {...restField}
                        label="Libellé"
                        name={[name, 'label']}
                        rules={[
                          {
                            required: true,
                            message: 'Le libellé est obligatoire.',
                          },
                        ]}
                      >
                        <Input placeholder="Ex : Support PDF, Fiche pratique, etc." />
                      </Form.Item>

                      <Form.Item
                        {...restField}
                        label="URL du fichier"
                        name={[name, 'fileUrl']}
                      >
                        <Input
                          placeholder="Laisser vide puis utiliser le bouton d’upload, ou coller une URL."
                          suffix={
                            hasFile ? (
                              <a
                                href={current.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <FileOutlined />
                              </a>
                            ) : null
                          }
                        />
                      </Form.Item>

                      <Button
                        icon={<UploadOutlined />}
                        onClick={() => handleClickUploadResource(index)}
                        loading={
                          uploadingResource &&
                          resourceIndexToUpload === index
                        }
                      >
                        Uploader un fichier pour cette ressource
                      </Button>
                    </Card>
                  )
                })}

                <Button type="dashed" onClick={() => add()}>
                  Ajouter une ressource
                </Button>
              </>
            )}
          </Form.List>
        </Card>

        <Divider />

        <Form.Item>
          <Button onClick={handleCancel} style={{ marginRight: 8 }}>
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

export default LessonEditPage
