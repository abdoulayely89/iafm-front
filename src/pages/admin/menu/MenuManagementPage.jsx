import React, { useEffect, useState } from 'react'
import { Button, Card, Form, Input, Select, Switch, Table, Typography, message } from 'antd'
import api from '../../../services/api'

const { Title } = Typography
const { Option } = Select

function MenuManagementPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [form] = Form.useForm()
  const [location, setLocation] = useState('header')

  const fetchItems = async (loc = location) => {
    setLoading(true)
    try {
      const { data } = await api.get('/admin/cms/menu', { params: { location: loc } })
      setItems(data.items || [])
    } catch (e) {
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchItems('header')
  }, [])

  const onFinish = async (values) => {
    try {
      await api.post('/admin/cms/menu', {
        ...values,
        location,
      })
      message.success('Lien ajouté.')
      form.resetFields()
      fetchItems()
    } catch (e) {
      message.error("Impossible d'ajouter le lien.")
    }
  }

  const columns = [
    { title: 'Label', dataIndex: 'label', key: 'label' },
    { title: 'URL', dataIndex: 'url', key: 'url' },
    { title: 'Ordre', dataIndex: 'order', key: 'order' },
    {
      title: 'Visible',
      dataIndex: 'isVisible',
      key: 'isVisible',
      render: (v) => (v ? 'Oui' : 'Non'),
    },
  ]

  return (
    <div className="page">
      <Title level={2}>Menus</Title>
      <Card style={{ marginBottom: 24 }}>
        <Form layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item label="Emplacement">
            <Select value={location} onChange={(value) => { setLocation(value); fetchItems(value) }}>
              <Option value="header">Header</Option>
              <Option value="footer">Footer</Option>
            </Select>
          </Form.Item>
        </Form>

        <Form layout="inline" form={form} onFinish={onFinish}>
          <Form.Item name="label" rules={[{ required: true }]} style={{ minWidth: 160 }}>
            <Input placeholder="Label" />
          </Form.Item>
          <Form.Item name="url" rules={[{ required: true }]} style={{ minWidth: 200 }}>
            <Input placeholder="/chemin" />
          </Form.Item>
          <Form.Item name="order" initialValue={0}>
            <Input type="number" placeholder="Ordre" />
          </Form.Item>
          <Form.Item name="isVisible" valuePropName="checked" initialValue>
            <Switch checkedChildren="Visible" unCheckedChildren="Caché" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Ajouter
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card>
        <Table
          rowKey="_id"
          dataSource={items}
          columns={columns}
          loading={loading}
        />
      </Card>
    </div>
  )
}

export default MenuManagementPage
