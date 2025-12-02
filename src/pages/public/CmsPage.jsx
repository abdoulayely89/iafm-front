// src/pages/public/CmsPage.jsx
import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Typography, Breadcrumb } from 'antd'
import api from '../../services/api'
import CmsBlockRenderer from '../../components/cms/CmsBlockRenderer'
import PageLoader from '../../components/common/PageLoader'
import ErrorState from '../../components/common/ErrorState'

import '../../styles/CmsPage.css' // 👈 à créer si pas encore fait

const { Title, Paragraph, Text } = Typography

function CmsPage() {
  const { slug } = useParams()
  const [page, setPage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function fetchPage() {
      setLoading(true)
      setError(null)
      try {
        const { data } = await api.get(`/cms/pages/${slug}`)
        setPage(data.page)
      } catch (e) {
        console.error('Erreur chargement page CMS:', e)
        setError(e?.response?.data?.message || 'Page introuvable.')
      } finally {
        setLoading(false)
      }
    }
    fetchPage()
  }, [slug])

  if (loading) return <PageLoader />

  if (error || !page) {
    return (
      <div className="page page-cms">
        <ErrorState
          title="Page introuvable"
          subTitle={error || "La page demandée n'existe pas ou n'est plus publiée."}
        />
      </div>
    )
  }

  return (
    <div className="page page-cms">
      <div className="page-cms-inner">
        {/* Fil d’Ariane */}
        <div className="page-cms-breadcrumb">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/">Accueil</Link>
            </Breadcrumb.Item>
            <Breadcrumb.Item>
              <Text type="secondary">{page.title}</Text>
            </Breadcrumb.Item>
          </Breadcrumb>
        </div>

        {/* En-tête de la page */}
        <header className="page-cms-header">
          <Title level={1} className="page-cms-title">
            {page.title}
          </Title>
          {page.seo?.metaDescription && (
            <Paragraph type="secondary" className="page-cms-subtitle">
              {page.seo.metaDescription}
            </Paragraph>
          )}
        </header>

        {/* Contenu CMS (hero + richtext + autres) */}
        <main className="page-cms-body">
          <CmsBlockRenderer blocks={page.contentBlocks} />
        </main>
      </div>
    </div>
  )
}

export default CmsPage
