// src/pages/admin/quizzes/QuizEditPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Button,
  Form,
  Input,
  InputNumber,
  Space,
  Typography,
  message,
  Card,
} from 'antd'
import { ArrowLeftOutlined } from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title } = Typography
const { TextArea } = Input

function QuizEditPage() {
  const { lessonId } = useParams()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchQuiz() {
      setLoading(true)
      try {
        const { data } = await api.get(`/admin/lessons/${lessonId}/quiz`)
        const quiz = data.quiz
        form.setFieldsValue({
          title: quiz.title,
          passingScore: quiz.passingScore,
          questions: JSON.stringify(quiz.questions || [], null, 2),
        })
      } catch (e) {
        // pas grave : création si pas de quiz
      } finally {
        setLoading(false)
      }
    }
    fetchQuiz()
  }, [lessonId, form])

  const onFinish = async (values) => {
    setSaving(true)
    try {
      let questions = []
      if (values.questions) {
        try {
          questions = JSON.parse(values.questions)
        } catch (e) {
          message.error('Questions doit être un JSON valide.')
          setSaving(false)
          return
        }
      }
      await api.post(`/admin/lessons/${lessonId}/quiz`, {
        title: values.title,
        passingScore: values.passingScore,
        questions,
      })
      message.success('Quiz enregistré.')
      navigate(-1)
    } catch (e) {
      message.error('Erreur lors de la sauvegarde.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <PageLoader />

  return (
    <div className="page">
      <Space style={{ marginBottom: 16 }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
        >
          Retour
        </Button>
      </Space>

      <Card>
        <Title level={2}>Quiz de la leçon</Title>
        <Form
          layout="vertical"
          form={form}
          onFinish={onFinish}
          style={{ maxWidth: 720, marginTop: 16 }}
        >
          <Form.Item
            label="Titre"
            name="title"
            rules={[{ required: true }]}
          >
            <Input placeholder="Ex : Quiz module 1" />
          </Form.Item>

          <Form.Item
            label="Score de passage (%)"
            name="passingScore"
            initialValue={60}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            label="Questions (JSON)"
            name="questions"
            extra="Coller ici le JSON des questions avec choix et réponses."
          >
            <TextArea rows={10} />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button onClick={() => navigate(-1)}>Annuler</Button>
              <Button type="primary" htmlType="submit" loading={saving}>
                Enregistrer
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  )
}

export default QuizEditPage
