// src/pages/admin/live/AdminLiveSessionsPage.jsx
import React, { useEffect, useState } from 'react'
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  List,
  message,
  Radio,
  Row,
  Select,
  Space,
  Table,
  Tag,
  TimePicker,
  Typography,
  Checkbox,
} from 'antd'
import {
  CalendarOutlined,
  LinkOutlined,
  PlusOutlined,
  UserOutlined,
  TeamOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons'
import api from '../../../services/api'
import PageLoader from '../../../components/common/PageLoader'

const { Title, Text, Paragraph } = Typography
const { Option } = Select

function formatDateTime(dt) {
  if (!dt) return 'À planifier'
  return new Date(dt).toLocaleString('fr-FR', {
    timeZone: 'Africa/Dakar',
    weekday: 'short',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatJustTime(dt) {
  if (!dt) return ''
  return new Date(dt).toLocaleTimeString('fr-FR', {
    timeZone: 'Africa/Dakar',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function statusTag(status) {
  switch (status) {
    case 'scheduled':
      return <Tag color="blue">Planifiée</Tag>
    case 'ongoing':
      return <Tag color="green">En cours</Tag>
    case 'ended':
      return <Tag>Terminée</Tag>
    case 'canceled':
      return <Tag color="red">Annulée</Tag>
    default:
      return <Tag>{status}</Tag>
  }
}

function AdminLiveSessionsPage() {
  const [loading, setLoading] = useState(true)
  const [submittingSimple, setSubmittingSimple] = useState(false)
  const [submittingSeries, setSubmittingSeries] = useState(false)
  const [courses, setCourses] = useState([])
  const [instructors, setInstructors] = useState([])
  const [students, setStudents] = useState([])
  const [selectedCourseId, setSelectedCourseId] = useState(null)
  const [sessions, setSessions] = useState([])

  const [typeSessionSimple, setTypeSessionSimple] = useState('course')
  const [typeSessionSeries, setTypeSessionSeries] = useState('course')

  // Mode série : un seul créneau / semaine OU plusieurs créneaux / semaine
  const [multiSlots, setMultiSlots] = useState(false)

  const [simpleForm] = Form.useForm()
  const [seriesForm] = Form.useForm()

  // --- Chargement initial : cours + users ---
  useEffect(() => {
    async function fetchInitial() {
      setLoading(true)
      try {
        const [coursesRes, usersRes] = await Promise.all([
          api.get('/admin/courses'),
          api.get('/admin/users'),
        ])

        const allCourses = coursesRes.data.courses || []
        setCourses(allCourses)

        const allUsers = usersRes.data.users || []
        setInstructors(allUsers.filter((u) => u.role === 'instructor'))
        setStudents(allUsers.filter((u) => u.role === 'student'))

        if (allCourses.length > 0) {
          const firstCourseId = allCourses[0]._id
          setSelectedCourseId(firstCourseId)
          await fetchSessionsForCourse(firstCourseId)
        }
      } catch (e) {
        console.error(e)
        message.error(
          "Impossible de charger les données initiales (cours / utilisateurs)."
        )
      } finally {
        setLoading(false)
      }
    }

    async function fetchSessionsForCourse(courseId) {
      if (!courseId) {
        setSessions([])
        return
      }
      try {
        const { data } = await api.get(`/admin/live-sessions/course/${courseId}`)
        setSessions(data.sessions || [])
      } catch (e) {
        console.error(e)
        setSessions([])
        message.error("Impossible de charger les sessions live pour ce cours.")
      }
    }

    fetchInitial()
  }, [])

  const handleChangeCourseFilter = async (courseId) => {
    setSelectedCourseId(courseId || null)
    if (!courseId) {
      setSessions([])
      return
    }
    try {
      const { data } = await api.get(`/admin/live-sessions/course/${courseId}`)
      setSessions(data.sessions || [])
    } catch (e) {
      console.error(e)
      setSessions([])
      message.error("Impossible de charger les sessions live pour ce cours.")
    }
  }

  const handleCreateSimpleSession = async (values) => {
    setSubmittingSimple(true)
    try {
      const payload = {
        typeSession: values.typeSession || 'course',
        title: values.title || undefined,
        description: values.description || undefined,
        status: values.status || 'scheduled',
      }

      if (values.startAt) {
        payload.startAt = values.startAt.toISOString()
      }
      if (values.endAt) {
        payload.endAt = values.endAt.toISOString()
      }

      if (values.meetingUrl) {
        payload.meetingUrl = values.meetingUrl.trim()
      }

      if (values.typeSession === 'course') {
        payload.courseId = values.courseId
        payload.instructorId = values.instructorId
        payload.students = values.students || []
      } else {
        payload.newInstructor = values.newInstructor
        payload.newStudents = (values.newStudents || []).filter(
          (s) => s && s.email
        )
      }

      const { data } = await api.post('/admin/live-sessions', payload)
      message.success('Session live créée et invitations envoyées.')

      if (
        data.session &&
        data.session.course &&
        data.session.course.toString &&
        data.session.course.toString() === selectedCourseId
      ) {
        await handleChangeCourseFilter(selectedCourseId)
      }

      simpleForm.resetFields()
      setTypeSessionSimple('course')
    } catch (e) {
      console.error(e)
      message.error(
        e?.response?.data?.message ||
          'Erreur lors de la création de la session live.'
      )
    } finally {
      setSubmittingSimple(false)
    }
  }

  const handleCreateSeries = async (values) => {
    setSubmittingSeries(true)
    try {
      const payload = {
        typeSession: values.typeSession || 'course',
        title: values.title || undefined,
        description: values.description || undefined,
        programName: values.programName || undefined,
        status: values.status || 'scheduled',
        weeksCount: values.weeksCount || 8,
        durationMinutes: values.durationMinutes || 90,
        oneJitsiLinkForAll: values.oneJitsiLinkForAll || false,
      }

      if (values.startDate) {
        payload.startDate = values.startDate.format('YYYY-MM-DD')
      }

      if (values.typeSession === 'course') {
        payload.courseId = values.courseId
        payload.instructorId = values.instructorId
        payload.students = values.students || []
      } else {
        payload.newInstructor = values.newInstructor
        payload.newStudents = (values.newStudents || []).filter(
          (s) => s && s.email
        )
      }

      // === MODE PRO : plusieurs créneaux / semaine ===
      if (multiSlots && Array.isArray(values.slots) && values.slots.length > 0) {
        payload.slots = values.slots
          .filter((slot) => slot && slot.dayOfWeek && slot.time)
          .map((slot) => ({
            dayOfWeek: slot.dayOfWeek,
            time: slot.time ? slot.time.format('HH:mm') : '20:00',
            durationMinutes:
              slot.durationMinutes || values.durationMinutes || 90,
          }))
      } else {
        // === MODE SIMPLE : 1 créneau / semaine (compat) ===
        if (values.time) {
          payload.time = values.time.format('HH:mm')
        }
        if (values.dayOfWeek) {
          payload.dayOfWeek = values.dayOfWeek
        }
        payload.durationMinutes = values.durationMinutes || 90
      }

      const { data } = await api.post(
        '/admin/live-sessions/series',
        payload
      )

      message.success(
        `Série de ${data.sessions?.length || 0} sessions live créée. Emails envoyés.`
      )

      if (values.typeSession === 'course' && values.courseId === selectedCourseId) {
        await handleChangeCourseFilter(selectedCourseId)
      }

      seriesForm.resetFields()
      setTypeSessionSeries('course')
      setMultiSlots(false)
    } catch (e) {
      console.error(e)
      message.error(
        e?.response?.data?.message ||
          'Erreur lors de la création de la série de sessions live.'
      )
    } finally {
      setSubmittingSeries(false)
    }
  }

  const copyMeetingLink = (url) => {
    if (!url) return
    navigator.clipboard
      .writeText(url)
      .then(() => message.success('Lien Jitsi copié dans le presse-papier.'))
      .catch(() => message.error('Impossible de copier le lien.'))
  }

  const openMeetingLink = (url) => {
    if (!url) return
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  const columns = [
    {
      title: 'Séance',
      dataIndex: 'sequenceIndex',
      key: 'sequenceIndex',
      width: 90,
      render: (value, record) =>
        record.programName ? (
          <Badge
            count={value}
            style={{ backgroundColor: '#722ed1' }}
          >
            <span style={{ fontSize: 12 }}>Batch</span>
          </Badge>
        ) : (
          value || '-'
        ),
    },
    {
      title: 'Titre',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.programName && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.programName}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Date & heure',
      key: 'time',
      render: (_, record) => (
        <div>
          <Text>{formatDateTime(record.startAt)}</Text>
          {record.endAt && (
            <div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                Fin : {formatJustTime(record.endAt)}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Formateur',
      key: 'teacher',
      render: (_, record) =>
        record.teacher ? (
          <span>
            {record.teacher.firstName} {record.teacher.lastName}
          </span>
        ) : (
          <Text type="secondary">-</Text>
        ),
    },
    {
      title: 'Élèves',
      key: 'students',
      render: (_, record) => (
        <span>{record.students ? record.students.length : 0}</span>
      ),
    },
    {
      title: 'Statut',
      dataIndex: 'status',
      key: 'status',
      render: (value) => statusTag(value),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<PlayCircleOutlined />}
            onClick={() => openMeetingLink(record.meetingUrl)}
          >
            Rejoindre
          </Button>
          <Button
            size="small"
            onClick={() => copyMeetingLink(record.meetingUrl)}
          >
            Copier lien
          </Button>
        </Space>
      ),
    },
  ]

  if (loading) return <PageLoader />

  return (
    <div className="page">
      <div
        style={{
          marginBottom: 24,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 16,
          alignItems: 'flex-start',
        }}
      >
        <div style={{ flex: 1, minWidth: 260 }}>
          <Title level={2} style={{ marginBottom: 8 }}>
            Classes virtuelles & emplois du temps
          </Title>
          <Paragraph
            type="secondary"
            style={{ maxWidth: 640, lineHeight: 1.6 }}
          >
            Ici, tu peux planifier des sessions live Jitsi pour tes formations :
            soit à partir d’un cours existant du catalogue, soit en sessions
            indépendantes (batch privé) avec des formateurs et élèves créés à
            la volée. Tu peux aussi définir plusieurs créneaux par semaine pour
            un même programme long.
          </Paragraph>
        </div>

        <Card
          size="small"
          style={{
            minWidth: 260,
            maxWidth: 340,
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
          }}
        >
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">
              <CalendarOutlined /> Filtrer par cours
            </Text>
            <Select
              allowClear
              placeholder="Sélectionner un cours"
              value={selectedCourseId || undefined}
              onChange={handleChangeCourseFilter}
              style={{ width: '100%' }}
              showSearch
              optionFilterProp="children"
            >
              {courses.map((c) => (
                <Option key={c._id} value={c._id}>
                  {c.title}
                </Option>
              ))}
            </Select>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Le tableau ci-dessous affiche les sessions live liées au cours
              sélectionné.
            </Text>
          </Space>
        </Card>
      </div>

      <Row gutter={[24, 24]}>
        {/* Colonne gauche : liste des sessions */}
        <Col xs={24} lg={12}>
          <Card
            title="Sessions live programmées"
            bodyStyle={{ paddingTop: 8 }}
          >
            {selectedCourseId ? (
              <>
                {sessions.length === 0 ? (
                  <Alert
                    type="info"
                    showIcon
                    message="Aucune session planifiée pour ce cours."
                    description="Tu peux créer une nouvelle session ou planifier une série de sessions via le panneau de droite."
                  />
                ) : (
                  <Table
                    rowKey="_id"
                    columns={columns}
                    dataSource={sessions}
                    size="small"
                    pagination={false}
                  />
                )}
              </>
            ) : (
              <Alert
                type="info"
                showIcon
                message="Sélectionne un cours pour voir ses sessions live."
              />
            )}
          </Card>
        </Col>

        {/* Colonne droite : création de session / série */}
        <Col xs={24} lg={12}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            {/* Session simple */}
            <Card
              title="Créer une session live simple"
              extra={<Tag color="blue">Cours unique</Tag>}
              bodyStyle={{ paddingTop: 12 }}
            >
              <Form
                form={simpleForm}
                layout="vertical"
                onFinish={handleCreateSimpleSession}
                initialValues={{
                  typeSession: 'course',
                  status: 'scheduled',
                }}
              >
                <Form.Item name="typeSession" label="Type de session">
                  <Radio.Group
                    onChange={(e) =>
                      setTypeSessionSimple(e.target.value)
                    }
                  >
                    <Radio value="course">
                      <UserOutlined /> Cours du catalogue
                    </Radio>
                    <Radio value="standalone">
                      <TeamOutlined /> Session indépendante (batch privé)
                    </Radio>
                  </Radio.Group>
                </Form.Item>

                {typeSessionSimple === 'course' ? (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="courseId"
                          label="Cours"
                          rules={[
                            {
                              required: true,
                              message: 'Sélectionne un cours',
                            },
                          ]}
                        >
                          <Select
                            placeholder="Choisir un cours"
                            showSearch
                            optionFilterProp="children"
                          >
                            {courses.map((c) => (
                              <Option key={c._id} value={c._id}>
                                {c.title}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="instructorId"
                          label="Formateur"
                          rules={[
                            {
                              required: true,
                              message: 'Sélectionne un formateur',
                            },
                          ]}
                        >
                          <Select
                            placeholder="Choisir un formateur"
                            showSearch
                            optionFilterProp="children"
                          >
                            {instructors.map((u) => (
                              <Option key={u._id} value={u._id}>
                                {u.firstName} {u.lastName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="students"
                      label="Élèves de la session"
                    >
                      <Select
                        mode="multiple"
                        placeholder="Sélectionner des élèves"
                        showSearch
                        optionFilterProp="children"
                      >
                        {students.map((u) => (
                          <Option key={u._id} value={u._id}>
                            {u.firstName} {u.lastName} — {u.email}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </>
                ) : (
                  <>
                    <Alert
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                      message="Session indépendante"
                      description="Le formateur et les élèves seront créés (ou retrouvés) à partir de leurs emails, sans passer par le catalogue de cours."
                    />

                    <Title level={5} style={{ marginTop: 4 }}>
                      Formateur
                    </Title>
                    <Row gutter={16}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name={['newInstructor', 'firstName']}
                          label="Prénom"
                          rules={[
                            {
                              required: true,
                              message: 'Prénom requis',
                            },
                          ]}
                        >
                          <Input placeholder="Awa" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name={['newInstructor', 'lastName']}
                          label="Nom"
                          rules={[
                            {
                              required: true,
                              message: 'Nom requis',
                            },
                          ]}
                        >
                          <Input placeholder="Ndiaye" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name={['newInstructor', 'email']}
                          label="Email"
                          rules={[
                            {
                              required: true,
                              type: 'email',
                              message: 'Email valide requis',
                            },
                          ]}
                        >
                          <Input placeholder="awa@example.com" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider style={{ margin: '8px 0 16px' }} />

                    <Title level={5} style={{ marginTop: 0 }}>
                      Élèves
                    </Title>
                    <Form.List name="newStudents">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <Card
                              key={field.key}
                              size="small"
                              style={{ marginBottom: 8 }}
                              bodyStyle={{ paddingBottom: 8 }}
                            >
                              <Row gutter={8} align="middle">
                                <Col xs={24} md={7}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'firstName']}
                                    fieldKey={[field.fieldKey, 'firstName']}
                                    label={
                                      index === 0 ? 'Prénom' : null
                                    }
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Prénom requis',
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Prénom" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={7}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'lastName']}
                                    fieldKey={[field.fieldKey, 'lastName']}
                                    label={index === 0 ? 'Nom' : null}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Nom requis',
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Nom" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'email']}
                                    fieldKey={[field.fieldKey, 'email']}
                                    label={index === 0 ? 'Email' : null}
                                    rules={[
                                      {
                                        required: true,
                                        type: 'email',
                                        message: 'Email valide requis',
                                      },
                                    ]}
                                  >
                                    <Input placeholder="email@exemple.com" />
                                  </Form.Item>
                                </Col>
                                <Col
                                  xs={24}
                                  md={2}
                                  style={{ textAlign: 'right' }}
                                >
                                  <Button
                                    type="text"
                                    danger
                                    onClick={() => remove(field.name)}
                                  >
                                    Suppr.
                                  </Button>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => add()}
                            block
                          >
                            Ajouter un élève
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </>
                )}

                <Divider style={{ margin: '16px 0' }} />

                <Row gutter={16}>
                  <Col xs={24} md={14}>
                    <Form.Item
                      name="title"
                      label="Titre de la session (optionnel)"
                    >
                      <Input placeholder="Par défaut : titre du cours" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={10}>
                    <Form.Item
                      name="status"
                      label="Statut"
                      initialValue="scheduled"
                    >
                      <Select>
                        <Option value="scheduled">Planifiée</Option>
                        <Option value="ongoing">En cours</Option>
                        <Option value="ended">Terminée</Option>
                        <Option value="canceled">Annulée</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="description" label="Description (optionnel)">
                  <Input.TextArea
                    rows={3}
                    placeholder="Infos complémentaires pour toi (non envoyées directement aux élèves)."
                    style={{ lineHeight: 1.6 }}
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="startAt"
                      label="Date & heure de début"
                      rules={[
                        {
                          required: true,
                          message: 'Date de début requise',
                        },
                      ]}
                    >
                      <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        placeholder="Choisir date & heure"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="endAt"
                      label="Date & heure de fin (optionnel)"
                    >
                      <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        placeholder="Choisir date & heure"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="meetingUrl"
                  label="Lien Jitsi (laisser vide pour générer automatiquement)"
                >
                  <Input
                    placeholder="https://meet.jit.si/..."
                    prefix={<LinkOutlined />}
                  />
                </Form.Item>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 8,
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submittingSimple}
                  >
                    Créer la session & envoyer les invitations
                  </Button>
                </div>
              </Form>
            </Card>

            {/* Série de sessions */}
            <Card
              title="Planifier une série de sessions (programme long)"
              extra={<Tag color="purple">Batch / promotion</Tag>}
              bodyStyle={{ paddingTop: 12 }}
            >
              <Form
                form={seriesForm}
                layout="vertical"
                onFinish={handleCreateSeries}
                initialValues={{
                  typeSession: 'course',
                  weeksCount: 8,
                  durationMinutes: 90,
                  oneJitsiLinkForAll: true,
                  status: 'scheduled',
                }}
              >
                <Form.Item name="typeSession" label="Type de série">
                  <Radio.Group
                    onChange={(e) =>
                      setTypeSessionSeries(e.target.value)
                    }
                  >
                    <Radio value="course">
                      <UserOutlined /> Cours du catalogue
                    </Radio>
                    <Radio value="standalone">
                      <TeamOutlined /> Programme indépendant
                    </Radio>
                  </Radio.Group>
                </Form.Item>

                {typeSessionSeries === 'course' ? (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="courseId"
                          label="Cours"
                          rules={[
                            {
                              required: true,
                              message: 'Sélectionne un cours',
                            },
                          ]}
                        >
                          <Select
                            placeholder="Choisir un cours"
                            showSearch
                            optionFilterProp="children"
                          >
                            {courses.map((c) => (
                              <Option key={c._id} value={c._id}>
                                {c.title}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="instructorId"
                          label="Formateur"
                          rules={[
                            {
                              required: true,
                              message: 'Sélectionne un formateur',
                            },
                          ]}
                        >
                          <Select
                            placeholder="Choisir un formateur"
                            showSearch
                            optionFilterProp="children"
                          >
                            {instructors.map((u) => (
                              <Option key={u._id} value={u._id}>
                                {u.firstName} {u.lastName}
                              </Option>
                            ))}
                          </Select>
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name="students"
                      label="Élèves du programme"
                    >
                      <Select
                        mode="multiple"
                        placeholder="Sélectionner des élèves"
                        showSearch
                        optionFilterProp="children"
                      >
                        {students.map((u) => (
                          <Option key={u._id} value={u._id}>
                            {u.firstName} {u.lastName} — {u.email}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </>
                ) : (
                  <>
                    <Alert
                      type="info"
                      showIcon
                      style={{ marginBottom: 16 }}
                      message="Programme long indépendant"
                      description="Le formateur et les élèves seront créés (ou retrouvés) à partir de leurs emails."
                    />

                    <Title level={5} style={{ marginTop: 4 }}>
                      Formateur
                    </Title>
                    <Row gutter={16}>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name={['newInstructor', 'firstName']}
                          label="Prénom"
                          rules={[
                            {
                              required: true,
                              message: 'Prénom requis',
                            },
                          ]}
                        >
                          <Input placeholder="Prénom" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name={['newInstructor', 'lastName']}
                          label="Nom"
                          rules={[
                            {
                              required: true,
                              message: 'Nom requis',
                            },
                          ]}
                        >
                          <Input placeholder="Nom" />
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={8}>
                        <Form.Item
                          name={['newInstructor', 'email']}
                          label="Email"
                          rules={[
                            {
                              required: true,
                              type: 'email',
                              message: 'Email valide requis',
                            },
                          ]}
                        >
                          <Input placeholder="email@exemple.com" />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Divider style={{ margin: '8px 0 16px' }} />

                    <Title level={5} style={{ marginTop: 0 }}>
                      Élèves du programme
                    </Title>
                    <Form.List name="newStudents">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <Card
                              key={field.key}
                              size="small"
                              style={{ marginBottom: 8 }}
                              bodyStyle={{ paddingBottom: 8 }}
                            >
                              <Row gutter={8} align="middle">
                                <Col xs={24} md={7}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'firstName']}
                                    fieldKey={[field.fieldKey, 'firstName']}
                                    label={
                                      index === 0 ? 'Prénom' : null
                                    }
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Prénom requis',
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Prénom" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={7}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'lastName']}
                                    fieldKey={[field.fieldKey, 'lastName']}
                                    label={index === 0 ? 'Nom' : null}
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Nom requis',
                                      },
                                    ]}
                                  >
                                    <Input placeholder="Nom" />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'email']}
                                    fieldKey={[field.fieldKey, 'email']}
                                    label={index === 0 ? 'Email' : null}
                                    rules={[
                                      {
                                        required: true,
                                        type: 'email',
                                        message: 'Email valide requis',
                                      },
                                    ]}
                                  >
                                    <Input placeholder="email@exemple.com" />
                                  </Form.Item>
                                </Col>
                                <Col
                                  xs={24}
                                  md={2}
                                  style={{ textAlign: 'right' }}
                                >
                                  <Button
                                    type="text"
                                    danger
                                    onClick={() => remove(field.name)}
                                  >
                                    Suppr.
                                  </Button>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => add()}
                            block
                          >
                            Ajouter un élève
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </>
                )}

                <Divider style={{ margin: '16px 0' }} />

                <Row gutter={16}>
                  <Col xs={24} md={14}>
                    <Form.Item
                      name="programName"
                      label="Nom du programme / batch"
                      rules={[
                        {
                          required: true,
                          message: 'Nom du programme requis',
                        },
                      ]}
                    >
                      <Input placeholder="Ex : Batch RH & Paie — Mars–Juin 2025" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={10}>
                    <Form.Item name="status" label="Statut des séances">
                      <Select>
                        <Option value="scheduled">Planifiées</Option>
                        <Option value="ongoing">En cours</Option>
                        <Option value="ended">Terminées</Option>
                        <Option value="canceled">Annulées</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item name="title" label="Titre de base (optionnel)">
                  <Input placeholder="Ex : Classe virtuelle RH & Paie" />
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Description interne (optionnel)"
                >
                  <Input.TextArea
                    rows={3}
                    placeholder="Infos sur le batch, niveau, objectifs…"
                    style={{ lineHeight: 1.6 }}
                  />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="startDate"
                      label="Date de la première semaine"
                      rules={[
                        {
                          required: true,
                          message: 'Date requise',
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Choisir une date"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="weeksCount"
                      label="Nombre de semaines"
                      rules={[
                        {
                          required: true,
                          message: 'Nombre de semaines requis',
                        },
                      ]}
                    >
                      <Input type="number" min={1} />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="durationMinutes"
                      label="Durée standard (minutes)"
                      rules={[
                        {
                          required: true,
                          message: 'Durée requise',
                        },
                      ]}
                    >
                      <Input type="number" min={15} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="oneJitsiLinkForAll"
                      valuePropName="checked"
                    >
                      <Checkbox>
                        Utiliser un seul lien Jitsi pour toutes les séances
                      </Checkbox>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item>
                  <Checkbox
                    checked={multiSlots}
                    onChange={(e) => setMultiSlots(e.target.checked)}
                  >
                    Définir plusieurs créneaux par semaine (multi-jours)
                  </Checkbox>
                  <div style={{ fontSize: 12, color: '#888' }}>
                    Si décoché : 1 créneau par semaine (jour + heure).  
                    Si coché : tu ajoutes autant de créneaux (jour/heure) que tu veux.
                  </div>
                </Form.Item>

                {!multiSlots && (
                  <>
                    <Row gutter={16}>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="dayOfWeek"
                          label="Jour de la semaine"
                        >
                          <Select
                            allowClear
                            placeholder="Déduit de la date si vide"
                          >
                            <Option value={1}>Lundi</Option>
                            <Option value={2}>Mardi</Option>
                            <Option value={3}>Mercredi</Option>
                            <Option value={4}>Jeudi</Option>
                            <Option value={5}>Vendredi</Option>
                            <Option value={6}>Samedi</Option>
                            <Option value={7}>Dimanche</Option>
                          </Select>
                        </Form.Item>
                      </Col>
                      <Col xs={24} md={12}>
                        <Form.Item
                          name="time"
                          label="Heure de début"
                          rules={[
                            {
                              required: true,
                              message: 'Heure requise',
                            },
                          ]}
                        >
                          <TimePicker
                            style={{ width: '100%' }}
                            format="HH:mm"
                            placeholder="20:00"
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  </>
                )}

                {multiSlots && (
                  <>
                    <Title level={5} style={{ marginTop: 8 }}>
                      Créneaux hebdomadaires
                    </Title>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      Ex : Lundi 20h–22h + Mercredi 18h–20h + Samedi 10h–12h.  
                      Les créneaux seront répétés sur le nombre de semaines choisi.
                    </Text>

                    <Form.List name="slots">
                      {(fields, { add, remove }) => (
                        <>
                          {fields.map((field, index) => (
                            <Card
                              key={field.key}
                              size="small"
                              style={{ marginTop: 12 }}
                              bodyStyle={{ paddingBottom: 8 }}
                            >
                              <Row gutter={8} align="middle">
                                <Col xs={24} md={7}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'dayOfWeek']}
                                    fieldKey={[field.fieldKey, 'dayOfWeek']}
                                    label={
                                      index === 0
                                        ? 'Jour'
                                        : undefined
                                    }
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Jour requis',
                                      },
                                    ]}
                                  >
                                    <Select placeholder="Jour">
                                      <Option value={1}>Lundi</Option>
                                      <Option value={2}>Mardi</Option>
                                      <Option value={3}>Mercredi</Option>
                                      <Option value={4}>Jeudi</Option>
                                      <Option value={5}>Vendredi</Option>
                                      <Option value={6}>Samedi</Option>
                                      <Option value={7}>Dimanche</Option>
                                    </Select>
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={7}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'time']}
                                    fieldKey={[field.fieldKey, 'time']}
                                    label={
                                      index === 0
                                        ? 'Heure début'
                                        : undefined
                                    }
                                    rules={[
                                      {
                                        required: true,
                                        message: 'Heure requise',
                                      },
                                    ]}
                                  >
                                    <TimePicker
                                      style={{ width: '100%' }}
                                      format="HH:mm"
                                      placeholder="20:00"
                                    />
                                  </Form.Item>
                                </Col>
                                <Col xs={24} md={8}>
                                  <Form.Item
                                    {...field}
                                    name={[field.name, 'durationMinutes']}
                                    fieldKey={[
                                      field.fieldKey,
                                      'durationMinutes',
                                    ]}
                                    label={
                                      index === 0
                                        ? 'Durée (min)'
                                        : undefined
                                    }
                                  >
                                    <Input
                                      type="number"
                                      min={15}
                                      placeholder="Laisser vide pour durée standard"
                                    />
                                  </Form.Item>
                                </Col>
                                <Col
                                  xs={24}
                                  md={2}
                                  style={{ textAlign: 'right' }}
                                >
                                  <Button
                                    type="text"
                                    danger
                                    onClick={() => remove(field.name)}
                                  >
                                    Suppr.
                                  </Button>
                                </Col>
                              </Row>
                            </Card>
                          ))}
                          <Button
                            type="dashed"
                            icon={<PlusOutlined />}
                            onClick={() => add()}
                            block
                            style={{ marginTop: 12 }}
                          >
                            Ajouter un créneau hebdomadaire
                          </Button>
                        </>
                      )}
                    </Form.List>
                  </>
                )}

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    marginTop: 16,
                  }}
                >
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={submittingSeries}
                  >
                    Planifier le programme & envoyer les invitations
                  </Button>
                </div>
              </Form>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  )
}

export default AdminLiveSessionsPage
