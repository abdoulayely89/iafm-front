import React, { useState } from 'react'
import { Button, Card, Upload, Typography, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import api from '../../../services/api'

const { Title, Paragraph } = Typography
const { Dragger } = Upload

function MediaUploadPage() {
  const [uploading, setUploading] = useState(false)
  const [uploaded, setUploaded] = useState([])

  const props = {
    name: 'file',
    multiple: false,
    customRequest: async ({ file, onSuccess, onError }) => {
      setUploading(true)
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'videos/courses')
      try {
        const { data } = await api.post('/admin/upload/video', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })
        setUploaded((prev) => [...prev, data.file])
        message.success('Vidéo uploadée.')
        onSuccess(data, file)
      } catch (e) {
        message.error("Erreur lors de l'upload.")
        onError(e)
      } finally {
        setUploading(false)
      }
    },
    showUploadList: false,
    disabled: uploading,
  }

  return (
    <div className="page">
      <Title level={2}>Vidéos</Title>
      <Card>
        <Paragraph type="secondary">
          Uploadez ici les vidéos de vos cours. Collez ensuite l&apos;URL dans la leçon correspondante.
        </Paragraph>
        <Dragger {...props} style={{ marginTop: 16 }}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Cliquez ou déposez une vidéo ici</p>
          <p className="ant-upload-hint">Formats vidéo standard. La taille maximale est définie côté backend.</p>
        </Dragger>
      </Card>
      {uploaded.length > 0 && (
        <Card style={{ marginTop: 24 }} title="Vidéos uploadées">
          <ul>
            {uploaded.map((file) => (
              <li key={file.path}>
                <a href={file.url} target="_blank" rel="noreferrer">
                  {file.originalName || file.path}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  )
}

export default MediaUploadPage
