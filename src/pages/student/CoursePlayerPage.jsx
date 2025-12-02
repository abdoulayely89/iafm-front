// src/pages/student/CoursePlayerPage.jsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Row,
  Col,
  Typography,
  message,
  Card,
  Space,
  List,
  Tag,
  Empty,
  Radio,
  Button,
  Divider,
  Modal,
} from 'antd'
import { FileOutlined } from '@ant-design/icons'
import api from '../../services/api'
import LessonList from '../../components/courses/LessonList'
import VideoPlayer from '../../components/courses/VideoPlayer'
import PageLoader from '../../components/common/PageLoader'
import './CoursePlayerPage.css'

const { Title, Paragraph, Text } = Typography

/**
 * 🔁 Helper legacy : retourne le texte des options selon le module.
 * 👉 Pour les NOUVEAUX quiz, mets simplement options[].label en base.
 * Le front affichera label sans passer par cette fonction.
 */
function getOptionTextForQuiz(quiz, questionIndex, optionIndex) {
  if (!quiz) return `Option ${optionIndex + 1}`

  const normalizedTitle = (quiz.title || '').toLowerCase().trim()

  // === MODULE : Comptabilité assistée par l'IA ===
  if (normalizedTitle.includes('comptabilit')) {
    const questionsTexts = [
      // Q1 - Objectif du fichier CO_Operations.csv
      [
        'Un fichier d’export contenant toutes les opérations d’achats et de charges sous forme brute (CSV).',
        'Un tableau récapitulatif des graphiques TTC/TVA par catégorie.',
        'Un modèle vierge de rapport mensuel à imprimer.',
      ],
      // Q2 - Pourquoi normaliser les données ?
      [
        'Pour rendre le fichier plus joli à l’impression.',
        'Pour fiabiliser les formules, les filtres et les mappings, en évitant les erreurs de formats (dates, montants, séparateurs).',
        'Pour réduire la taille du fichier sur le disque.',
      ],
      // Q3 - Règle de mapping prioritaire
      [
        'La catégorie choisie manuellement dans le fichier ou la feuille de corrections.',
        'La catégorie proposée automatiquement par l’IA.',
        'La catégorie par défaut basée sur le mode de paiement.',
      ],
      // Q4 - Rôle de la feuille clean_ops
      [
        'Archiver les fichiers CSV originaux sans les modifier.',
        'Stocker uniquement les graphiques pour le reporting.',
        'Centraliser les opérations nettoyées, catégorisées et recalculées (HT, TVA, TTC) avec les contrôles d’incohérences.',
      ],
      // Q5 - Formule pour le rapport mensuel
      ['NB.SI / COUNTIF.', 'SOMME.SI.ENS / SUMIFS avec plusieurs critères.', 'ALEA() pour simuler les montants manquants.'],
      // Q6 - Objectif de la réconciliation bancaire
      [
        'Vérifier que toutes les factures ont été imprimées en PDF.',
        'Comparer les opérations comptables avec les lignes du relevé bancaire pour identifier écarts, doublons ou oublis.',
        'Calculer le salaire des collaborateurs.',
      ],
      // Q7 - Incohérence la plus critique
      [
        'Une dépense catégorisée en « Marketing » au lieu de « Frais généraux ».',
        'Un TTC qui ne correspond pas à HT + TVA selon le taux appliqué.',
        'Une cellule colorée en rouge dans le fichier.',
      ],
      // Q8 - Avantage principal de l’IA dans ce workflow
      [
        'Remplacer totalement l’expert-comptable.',
        'Accélérer la catégorisation, repérer rapidement les anomalies et générer des synthèses intelligentes à partir des données.',
        'Supprimer le besoin d’utiliser Excel ou Google Sheets.',
      ],
      // Q9 - Fichier contenant les graphiques TTC/TVA par catégorie
      ['CO_Operations.csv', 'CO_Dashboard.xlsx', 'CO_Banque.csv'],
      // Q10 - Rôle de l’atelier final
      [
        'Une simple liste de définitions théoriques de comptabilité.',
        'Un exercice guidé en plusieurs étapes qui fait pratiquer tout le workflow : import, nettoyage, catégorisation, TVA, rapport, réconciliation, IA.',
        'Un module pour apprendre à coder en JavaScript.',
      ],
    ]

    const q = questionsTexts[questionIndex]
    if (q && q[optionIndex] != null) return q[optionIndex]
  }

  // === MODULE 1 : Persona / Aminata ===
  if (normalizedTitle.startsWith('quiz module 1')) {
    const questionsTexts = [
      // Question 0
      [
        "Elle n'aime pas porter des sacs lourds entre le marché et sa voiture.",
        "Elle déteste perdre 2 heures précieuses le samedi matin dans la chaleur et la foule du marché Castors, alors qu'elle voudrait profiter de ses enfants.",
        'Elle ne trouve jamais de place pour se garer près du marché.',
      ],
      // Question 1
      [
        'Elle veut juste gagner du temps.',
        'Elle veut faire des économies sur son budget courses.',
        'Elle veut se libérer de la charge mentale et de la culpabilité, pour redevenir une "super maman" organisée qui prend soin de sa famille sans s’épuiser.',
      ],
    ]

    const q = questionsTexts[questionIndex]
    if (q && q[optionIndex] != null) return q[optionIndex]
  }

  // === MODULE 2 : SEO vs SEA / TerangaNet / Tailleur Chic ===
  if (normalizedTitle.startsWith('quiz module 2')) {
    const questionsTexts = [
      // Q1
      [
        'À la location d’un appartement meublé que l’on paie chaque mois.',
        'À être propriétaire de sa maison, que l’on a construite et qui prend de la valeur dans le temps.',
        'À un hôtel où l’on réserve une chambre seulement pour quelques nuits.',
      ],
      // Q2
      [
        'Publier des articles de blog généralistes sur l’histoire de son secteur.',
        'Créer et optimiser sa Fiche d’Établissement Google (Google Maps), avec horaires, photos et avis clients.',
        'Créer un site web très complexe avec 50 pages et animations.',
      ],
      // Q3
      ['Informatique Sénégal', 'Comment réparer mon wifi qui coupe', 'Entreprise maintenance informatique Dakar prix'],
      // Q4
      [
        'Créer un site web complexe avec 50 pages qui présentent tous ses tissus.',
        'Créer et valider sa Fiche d’Établissement Google, ajouter 10 belles photos de ses costumes et demander à ses premiers clients/cousins de laisser un avis 5 étoiles.',
        'Écrire un long article de blog sur l’histoire du Bazin au Mali.',
      ],
      // Q5
      ['Tailleur pas cher Dakar', 'Modèle couture homme 2024', 'Tailleur costume mariage homme Dakar Keur Gorgui'],
    ]

    const q = questionsTexts[questionIndex]
    if (q && q[optionIndex] != null) return q[optionIndex]
  }

  // === MODULE 3 : Contenu persuasif & conversion (10 questions) ===
  if (normalizedTitle.startsWith('quiz module 3')) {
    const questionsTexts = [
      // Q1
      [
        'Un produit bien présenté, avec un logo, un site web et un prix inférieur à la concurrence.',
        'Une promesse claire de transformation pour un Persona précis, qui supprime un obstacle important (temps, stress, argent) et qui est soutenue par des preuves et des bonus.',
        'Une liste détaillée de toutes les caractéristiques du produit et de ses spécifications techniques.',
      ],
      // Q2
      [
        'J’organise des séances de coaching en ligne sur Zoom pour tous ceux qui veulent réussir.',
        'J’aide les jeunes actifs à Dakar à trouver un emploi mieux payé en moins de 90 jours, sans passer des nuits blanches sur les concours, grâce à un accompagnement personnalisé et des simulations d’entretien adaptées au marché sénégalais.',
        'Je propose différentes formules de coaching avec plusieurs modules sur le développement personnel et le mindset.',
      ],
      // Q3
      ['Intérêt → Attention → Désir → Action', 'Attention → Intérêt → Désir → Action', 'Désir → Attention → Action → Intérêt'],
      // Q4
      [
        'Vous aimez manger sainement ? Nous aussi.',
        'Vous rentrez épuisée du travail et vous culpabilisez encore de ne pas avoir cuisiné un vrai repas pour vos enfants ?',
        'Nous proposons une large gamme de plats équilibrés livrés à Dakar.',
      ],
      // Q5
      [
        'Parce que WhatsApp permet de publier des vidéos plus longues que Facebook et Instagram.',
        'Parce que la plupart des décisions se prennent après une vraie conversation, et WhatsApp permet une discussion directe, personnelle et rapide entre le client et le vendeur.',
        'Parce qu’il est plus facile de faire des publicités payantes sur WhatsApp que sur les autres plateformes.',
      ],
      // Q6
      [
        '1) Publication avec lien vers le site web uniquement  2) Page « À propos »  3) Formulaire de contact général.',
        '1) Publication avec hook + douleur + bénéfice  2) Appel à l’action clair vers WhatsApp (message pré-rempli)  3) Questions de qualification  4) Proposition d’offre adaptée.',
        '1) Story avec une image  2) Envoi automatique d’un catalogue PDF à tout le monde  3) Attente que les clients reviennent d’eux-mêmes.',
      ],
      // Q7
      [
        'Envoyer immédiatement tous les tarifs, toutes les offres et tous les PDF dès le premier message.',
        'Comprendre en quelques questions simples si la personne correspond bien au Persona visé et adapter ensuite la proposition.',
        'Demander directement au prospect de faire un virement ou un paiement mobile money sans plus d’échanges.',
      ],
      // Q8
      [
        'Intéressé(e) ? Contactez-nous.',
        'Si tu es jeune actif à Dakar et que tu veux un meilleur job dans les 3 prochains mois, envoie simplement le mot « JOB » sur WhatsApp au 77 XX XX XX, et on te pose 3 questions pour voir si le programme est fait pour toi.',
        'Merci de suivre notre page pour plus de conseils sur le développement personnel.',
      ],
      // Q9
      [
        'Créer plusieurs publications différentes : une pour les mères, une pour les étudiants, une pour les entrepreneurs.',
        'Publier un long post qui s’adresse en même temps aux étudiants, aux mères, aux chefs d’entreprise et aux retraités, sans jamais préciser à qui l’offre s’adresse ni quelle action faire.',
        'Faire une publication courte ciblée pour les mères de famille actives à Dakar, avec un CTA clair vers WhatsApp.',
      ],
      // Q10
      [
        'Parce qu’il ne met pas assez de points d’exclamation et d’emojis dans la publication.',
        'Parce qu’il parle de l’entreprise (« nous ») au lieu de partir des problèmes, émotions et désirs du client. Le client ne voit pas clairement ce qu’il gagne.',
        'Parce qu’il ne mentionne pas le prix exact des services proposés.',
      ],
    ]

    const q = questionsTexts[questionIndex]
    if (q && q[optionIndex] != null) return q[optionIndex]
  }

  // === MODULE 4 : Créatifs & storytelling visuel / mini-funnel WhatsApp ===
  if (normalizedTitle.startsWith('quiz module 4')) {
    const questionsTexts = [
      // Q1
      [
        'Générer un contenu viral sur Facebook ou Instagram pour attirer le regard.',
        'Faire passer le prospect directement à l’achat.',
        'Demander immédiatement les informations personnelles du prospect.',
      ],
      // Q2
      [
        'Découvrez nos services.',
        'Voici comment 87 % des mamans actives de Dakar gagnent 2 heures chaque semaine.',
        'Cliquez ici pour en savoir plus.',
      ],
      // Q3
      [
        'Parce qu’il possède les meilleures vidéos en ligne.',
        'Parce que c’est la plateforme la plus utilisée, directe, personnelle, et qu’elle permet un échange humain rapide.',
        'Parce que toutes les entreprises y vendent automatiquement leurs produits.',
      ],
      // Q4
      [
        'Savoir si le prospect correspond vraiment à l’offre et identifier son besoin précis.',
        'Essayer de vendre le plus vite possible.',
        'Envoyer des vidéos et photos sans poser de questions.',
      ],
      // Q5
      [
        'Contactez-nous pour plus d’informations.',
        'Écris-moi « Je suis prêt » et je t’envoie les détails tout de suite.',
        'Visitez notre site web pour en apprendre davantage.',
      ],
    ]

    const q = questionsTexts[questionIndex]
    if (q && q[optionIndex] != null) return q[optionIndex]
  }

  // === MODULE 5 : Pilotage & optimisation / KPI / WhatsApp ===
  if (normalizedTitle.startsWith('quiz module 5')) {
    const questionsTexts = [
      // Q1
      [
        'Publier un maximum de contenus sur les réseaux sociaux.',
        'Mesurer ce qui fonctionne, optimiser chaque semaine et concentrer les efforts sur les actions rentables.',
        'Avoir un site web très joli et très complet.',
      ],
      // Q2
      [
        'Utiliser 20 indicateurs complexes comme dans les multinationales.',
        'Choisir 3 à 5 indicateurs simples alignés sur les objectifs : prospects, taux de conversion WhatsApp, ventes hebdomadaires.',
        'Se baser uniquement sur les likes et les commentaires.',
      ],
      // Q3
      [
        'Une fois par an, lors du bilan annuel.',
        'Chaque trimestre uniquement.',
        'Hebdomadaire : analyser les messages entrants, taux de réponse, conversions et blocages.',
      ],
      // Q4
      ['LinkedIn uniquement.', 'WhatsApp (CTA directs, messages pré-remplis, mini-funnels).', 'Des vidéos YouTube longues et détaillées.'],
      // Q5
      [
        'Un tableau rempli d’indicateurs techniques (CPC, CTR, ROAS...).',
        'Un tableau simple : nombre de leads, taux de réponse WhatsApp, taux de conversion, chiffre d’affaires hebdomadaire.',
        'Un tableau avec uniquement les likes, partages et abonnés.',
      ],
      // Q6
      [
        'Mettre un lien simple sans contexte.',
        'Ajouter un message pré-rempli cohérent avec le hook et la promesse.',
        'Demander aux gens d’envoyer un long paragraphe pour expliquer leur situation.',
      ],
      // Q7
      [
        'Pour publier plus que les concurrents.',
        'Pour avancer chaque semaine sur les actions qui génèrent des ventes, et éviter la dispersion.',
        'Pour suivre les tendances TikTok.',
      ],
      // Q8
      [
        'Réduire la longueur des messages et envoyer des réponses froides.',
        'Analyser les objections récurrentes et ajuster les scripts pour y répondre plus efficacement.',
        'Envoyer immédiatement le catalogue complet.',
      ],
      // Q9
      [
        'Le nombre de likes sur Instagram.',
        'Le taux de réponse aux messages entrants et le taux de conversion final.',
        'Le nombre de statuts WhatsApp publiés.',
      ],
      // Q10
      [
        'Changer le logo de ton entreprise.',
        'Simplifier ton offre, clarifier la promesse et structurer un mini-script WhatsApp plus court.',
        'Augmenter tes prix sans changer ton funnel.',
      ],
    ]

    const q = questionsTexts[questionIndex]
    if (q && q[optionIndex] != null) return q[optionIndex]
  }

  // === MODULE 6 : Gestion commerciale assistée par l'IA ===
  if (
    normalizedTitle.startsWith('quiz module 6') ||
    normalizedTitle.startsWith('quiz – gestion commerciale') ||
    normalizedTitle.startsWith('quiz - gestion commerciale') ||
    normalizedTitle.startsWith('quiz gestion commerciale')
  ) {
    const questionsTexts = [
      // Q1 - Bénéfice commercial principal de l’IA
      [
        'Réduire le nombre de réunions dans l’entreprise.',
        'Augmenter la performance commerciale en automatisant les tâches et en améliorant la qualité des décisions.',
        'Remplacer complètement les équipes commerciales par des robots.',
      ],
      // Q2 - Aspect le plus amélioré dans la relation client
      [
        'La décoration des bureaux et des points de vente.',
        'La vitesse à laquelle l’entreprise change de logo et de slogan.',
        'La personnalisation de la relation client : messages adaptés, recommandations pertinentes, suivi intelligent.',
      ],
      // Q3 - Avantage différenciant pour les commerciaux
      [
        'Identifier automatiquement les prospects les plus susceptibles d’acheter (lead scoring).',
        'Ajouter plus de champs dans les formulaires CRM.',
        'Augmenter le nombre de réunions internes de reporting.',
      ],
      // Q4 - Fiabilité des prévisions de ventes
      [
        'Parce qu’elle remplace totalement les tableaux Excel.',
        'Parce qu’elle analyse un grand volume de données, repère des tendances invisibles et anticipe mieux les variations du marché.',
        'Parce qu’elle supprime tous les aléas du comportement humain.',
      ],
      // Q5 - Impact direct sur le commercial
      [
        'Elle ajoute plus de tâches administratives à gérer.',
        'Elle automatise les tâches répétitives (devis, relances, facturation, mises à jour) et lui permet de se concentrer sur la vente et la relation humaine.',
        'Elle l’oblige à répondre uniquement par email et plus jamais par téléphone.',
      ],
      // Q6 - Impact sur la rentabilité commerciale
      [
        'Parce qu’elle permet de publier plus de posts sur les réseaux sociaux.',
        'Parce qu’elle supprime totalement les coûts de fonctionnement.',
        'Parce qu’elle optimise les prix, les marges et l’allocation des efforts commerciaux en fonction des données réelles (demande, stock, concurrence, comportement client).',
      ],
    ]

    const q = questionsTexts[questionIndex]
    if (q && q[optionIndex] != null) return q[optionIndex]
  }

  // Fallback générique
  return `Option ${optionIndex + 1}`
}

function CoursePlayerPage() {
  const { courseId } = useParams()
  const navigate = useNavigate()

  const [course, setCourse] = useState(null)
  const [lessons, setLessons] = useState([])
  const [currentLesson, setCurrentLesson] = useState(null)
  const [loading, setLoading] = useState(true)

  // --- Quiz state ---
  const [quizLoading, setQuizLoading] = useState(false)
  const [quiz, setQuiz] = useState(null)
  const [quizAnswers, setQuizAnswers] = useState({})
  const [quizSubmitted, setQuizSubmitted] = useState(false)
  const [quizScore, setQuizScore] = useState(null)

  // --- Preview ressource (PDF & co) ---
  const [previewResource, setPreviewResource] = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)

  // === Chargement cours + leçons ===
  useEffect(() => {
    async function fetch() {
      setLoading(true)
      try {
        const [courseRes, lessonsRes] = await Promise.all([
          api.get(`/courses/${courseId}`).catch(() => null),
          api.get(`/student/courses/${courseId}/lessons`),
        ])

        if (courseRes?.data?.course) {
          setCourse(courseRes.data.course)
        }

        const lessonList = lessonsRes.data.lessons || []
        setLessons(lessonList)

        if (lessonList.length) {
          setCurrentLesson(lessonList[0])
        }
      } catch (e) {
        console.error(e)
        message.error('Impossible de charger ce cours.')
        navigate('/student/my-courses')
      } finally {
        setLoading(false)
      }
    }

    fetch()
  }, [courseId, navigate])

  // === Chargement du quiz de la leçon courante ===
  useEffect(() => {
    async function fetchQuiz() {
      if (!currentLesson || !currentLesson._id) {
        setQuiz(null)
        return
      }

      setQuizLoading(true)
      setQuiz(null)
      setQuizAnswers({})
      setQuizSubmitted(false)
      setQuizScore(null)

      try {
        const { data } = await api.get(
          `/student/lessons/${currentLesson._id}/quiz`
        )

        if (data && data.quiz && Array.isArray(data.quiz.questions)) {
          setQuiz(data.quiz)
        } else {
          setQuiz(null)
        }
      } catch (e) {
        console.error('Erreur chargement quiz:', e)
        setQuiz(null)
      } finally {
        setQuizLoading(false)
      }
    }

    fetchQuiz()
  }, [currentLesson])

  const handleSelectLesson = (lesson) => {
    setCurrentLesson(lesson)
  }

  const handleChangeAnswer = (questionIndex, optionIndex) => {
    setQuizAnswers((prev) => ({
      ...prev,
      [questionIndex]: optionIndex,
    }))
  }

  const handleSubmitQuiz = () => {
    if (!quiz || !quiz.questions || quiz.questions.length === 0) return

    let correctCount = 0

    quiz.questions.forEach((q, questionIndex) => {
      const selectedIndex = quizAnswers[questionIndex]
      const options = q.options || []
      const correctIndex = options.findIndex(
        (opt) => opt && opt.isCorrect
      )

      if (
        typeof selectedIndex === 'number' &&
        correctIndex >= 0 &&
        selectedIndex === correctIndex
      ) {
        correctCount++
      }
    })

    const total = quiz.questions.length
    const score = Math.round((correctCount / total) * 100)
    setQuizScore(score)
    setQuizSubmitted(true)

    if (score >= (quiz.passingScore || 0)) {
      message.success(
        `Bravo ! Vous avez ${score}%. Score minimum requis : ${
          quiz.passingScore || 0
        }%.`
      )
    } else {
      message.warning(
        `Vous avez ${score}%. Score minimum requis : ${
          quiz.passingScore || 0
        }%. Vous pouvez réessayer.`
      )
    }
  }

  const openResourcePreview = (res) => {
    setPreviewResource(res)
    setPreviewOpen(true)
  }

  const closeResourcePreview = () => {
    setPreviewOpen(false)
    setPreviewResource(null)
  }

  if (loading) return <PageLoader />

  if (!currentLesson) {
    return (
      <div className="page page-course-player">
        <div className="course-player-container">
          <Title level={2}>{course?.title || 'Cours'}</Title>
          <Empty description="Aucune leçon n’est disponible pour ce cours pour le moment." />
        </div>
      </div>
    )
  }

  const resources = currentLesson.resources || []

  const isPdf = (url = '') =>
    url.toLowerCase().includes('.pdf')

  return (
    <div className="page page-course-player">
      <div className="course-player-container">
        {/* En-tête du cours */}
        <div className="course-player-header">
          <div>
            <Title level={2} className="course-player-title">
              {course?.title || 'Cours'}
            </Title>
            {course?.description && (
              <div className="course-player-description">
                {course.description}
              </div>
            )}
          </div>
        </div>

        <Row gutter={[24, 24]} align="stretch">
          {/* Colonne gauche : vidéo + notes + ressources + quiz */}
          <Col
            xs={{ span: 24, order: 1 }}
            lg={{ span: 16, order: 1 }}
          >
            {/* Leçon : vidéo + notes */}
            <Card
              className="course-player-main-card"
              bordered={false}
              title={
                <div className="course-player-lesson-header">
                  <div>
                    {currentLesson.moduleTitle && (
                      <Text
                        type="secondary"
                        className="course-player-lesson-module"
                      >
                        {currentLesson.moduleTitle}
                      </Text>
                    )}
                    <div>
                      <Text strong className="course-player-lesson-title">
                        {currentLesson.title}
                      </Text>
                    </div>
                  </div>
                  {currentLesson.durationMinutes && (
                    <Tag color="blue">
                      {currentLesson.durationMinutes} min
                    </Tag>
                  )}
                </div>
              }
            >
              <div className="course-player-video-wrapper">
                <VideoPlayer src={currentLesson.videoUrl} />
              </div>

              {currentLesson.content && (
                <div className="lesson-content">
                  <Title level={4} className="lesson-content-title">
                    Notes de la leçon
                  </Title>
                  <Paragraph className="lesson-content-body">
                    {currentLesson.content}
                  </Paragraph>
                </div>
              )}
            </Card>

            {/* Ressources */}
            <Card
              bordered={false}
              className="lesson-resources-card"
              title="Ressources de la leçon"
            >
              {resources.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Aucune ressource n’est associée à cette leçon."
                />
              ) : (
                <List
                  itemLayout="horizontal"
                  dataSource={resources}
                  renderItem={(res) => (
                    <List.Item className="lesson-resource-item">
                      <Space size="middle">
                        <Tag color="purple">
                          <FileOutlined /> Ressource
                        </Tag>
                        <div className="lesson-resource-info">
                          <div className="lesson-resource-label">
                            {res.label || res.fileUrl}
                          </div>
                          <div className="lesson-resource-actions">
                            <Button
                              size="small"
                              type="link"
                              href={res.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Télécharger / Ouvrir
                            </Button>
                            {isPdf(res.fileUrl) && (
                              <Button
                                size="small"
                                type="link"
                                onClick={() =>
                                  openResourcePreview(res)
                                }
                              >
                                Ouvrir dans le lecteur
                              </Button>
                            )}
                          </div>
                        </div>
                      </Space>
                    </List.Item>
                  )}
                />
              )}
            </Card>

            {/* Quiz de la leçon */}
            <Card
              bordered={false}
              className="lesson-quiz-card"
              title="Quiz de la leçon"
            >
              {quizLoading ? (
                <PageLoader />
              ) : !quiz ||
                !quiz.questions ||
                quiz.questions.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Aucun quiz n’est disponible pour cette leçon."
                />
              ) : (
                <>
                  <div className="lesson-quiz-header">
                    <Text strong>{quiz.title}</Text>
                    {typeof quiz.passingScore === 'number' && (
                      <Text
                        type="secondary"
                        style={{ marginLeft: 8 }}
                      >
                        (Score minimum : {quiz.passingScore}%)
                      </Text>
                    )}
                  </div>

                  <Divider />

                  <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                    size="large"
                  >
                    {quiz.questions.map((q, questionIndex) => {
                      const displayOrder =
                        q.order || questionIndex + 1

                      return (
                        <div
                          key={q._id || q.order || questionIndex}
                          className="lesson-quiz-question"
                        >
                          <Text strong>
                            {displayOrder}. {q.question}
                          </Text>

                          <div className="lesson-quiz-options">
                            <Radio.Group
                              onChange={(e) =>
                                handleChangeAnswer(
                                  questionIndex,
                                  e.target.value
                                )
                              }
                              value={quizAnswers[questionIndex]}
                            >
                              <Space direction="vertical">
                                {(q.options || []).map((opt, idx) => (
                                  <Radio key={idx} value={idx}>
                                    {opt?.label ||
                                      opt?.text ||
                                      getOptionTextForQuiz(
                                        quiz,
                                        questionIndex,
                                        idx
                                      )}
                                  </Radio>
                                ))}
                              </Space>
                            </Radio.Group>
                          </div>

                          {quizSubmitted && (
                            <div className="lesson-quiz-feedback">
                              {(() => {
                                const options = q.options || []
                                const correctIndex =
                                  options.findIndex(
                                    (opt) => opt && opt.isCorrect
                                  )
                                const selectedIndex =
                                  quizAnswers[questionIndex]
                                const isCorrect =
                                  correctIndex >= 0 &&
                                  selectedIndex === correctIndex

                                return isCorrect ? (
                                  <Tag color="green">
                                    Bonne réponse
                                  </Tag>
                                ) : (
                                  <Tag color="red">
                                    Mauvaise réponse
                                  </Tag>
                                )
                              })()}

                              {q.explanation && (
                                <div>
                                  <Text type="secondary">
                                    {q.explanation}
                                  </Text>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </Space>

                  <Divider />

                  <div className="lesson-quiz-footer">
                    <Button
                      type="primary"
                      onClick={handleSubmitQuiz}
                      disabled={
                        quizSubmitted && quizScore !== null
                      }
                    >
                      Soumettre le quiz
                    </Button>

                    {quizSubmitted && quizScore !== null && (
                      <Text strong className="lesson-quiz-score">
                        Score : {quizScore}% / Min. requis :{' '}
                        {quiz.passingScore || 0}%
                      </Text>
                    )}
                  </div>
                </>
              )}
            </Card>
          </Col>

          {/* Colonne droite : plan du cours */}
          <Col
            xs={{ span: 24, order: 2 }}
            lg={{ span: 8, order: 2 }}
          >
            <Card
              bordered={false}
              title="Plan du cours"
              className="course-player-sidebar-card"
              bodyStyle={{ padding: 0 }}
            >
              <LessonList
                lessons={lessons}
                currentLessonId={currentLesson?._id}
                onSelect={handleSelectLesson}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Modal de prévisualisation des ressources (PDF) */}
      <Modal
        open={previewOpen}
        onCancel={closeResourcePreview}
        footer={null}
        width={900}
        className="resource-preview-modal"
        destroyOnClose
        title={
          <span>
            {previewResource?.label || 'Prévisualisation'}
          </span>
        }
      >
        {!previewResource ? null : isPdf(previewResource.fileUrl) ? (
          <div className="resource-preview-frame-wrapper">
            <iframe
              src={previewResource.fileUrl}
              title={previewResource.label || 'PDF'}
              className="resource-preview-frame"
            />
          </div>
        ) : (
          <div style={{ padding: 16 }}>
            <Paragraph>
              Ce type de fichier ne peut pas être prévisualisé ici.
            </Paragraph>
            <Button
              type="primary"
              href={previewResource.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Télécharger / Ouvrir le fichier
            </Button>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default CoursePlayerPage
