// src/router/AppRouter.jsx
import React from 'react'
import { Routes, Route } from 'react-router-dom'

import PublicLayout from '../layouts/PublicLayout'
import DashboardLayout from '../layouts/DashboardLayout'

// Pages publiques
import HomePage from '../pages/public/HomePage'
import CmsPage from '../pages/public/CmsPage'
import CoursesCatalogPage from '../pages/public/CoursesCatalogPage'
import CourseDetailsPage from '../pages/public/CourseDetailsPage'
import LoginPage from '../pages/public/LoginPage'
import RegisterPage from '../pages/public/RegisterPage'
import NotFoundPage from '../pages/public/NotFoundPage'

// 👉 NEW
import BooksCatalogPage from '../pages/public/BooksCatalogPage'
import BookDetailsPage from '../pages/public/BookDetailsPage'

// Student
import StudentDashboard from '../pages/student/StudentDashboard'
import MyCoursesPage from '../pages/student/MyCoursesPage'
import CoursePlayerPage from '../pages/student/CoursePlayerPage'
import StudentProfilePage from '../pages/student/StudentProfilePage'

// Admin
import AdminDashboard from '../pages/admin/AdminDashboard'
import CmsPagesListPage from '../pages/admin/cms/CmsPagesListPage'
import CmsPageEditPage from '../pages/admin/cms/CmsPageEditPage'
import MenuManagementPage from '../pages/admin/menu/MenuManagementPage'
import CoursesListPage from '../pages/admin/courses/CoursesListPage'
import CourseEditPage from '../pages/admin/courses/CourseEditPage'
import LessonsListPage from '../pages/admin/courses/LessonsListPage'
import LessonEditPage from '../pages/admin/courses/LessonEditPage'
import QuizEditPage from '../pages/admin/quizzes/QuizEditPage'
import UsersListPage from '../pages/admin/users/UsersListPage'
import UserEditPage from '../pages/admin/users/UserEditPage'
import EnrollmentsListPage from '../pages/admin/enrollments/EnrollmentsListPage'
import MediaUploadPage from '../pages/admin/media/MediaUploadPage'
import AdminLiveSessionsPage from '../pages/admin/live/AdminLiveSessionsPage'

// 📚 Livres / packs PDF (admin)
import BooksListPage from '../pages/admin/books/BooksListPage'
import BookEditPage from '../pages/admin/books/BookEditPage'
import BookRequestsPage from '../pages/admin/books/BookRequestsPage'

// Auth guards
import ProtectedRoute from '../components/common/ProtectedRoute'
import AdminRoute from '../components/common/AdminRoute'

function AppRouter() {
  return (
    <Routes>
      {/* === Public === */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/page/:slug" element={<CmsPage />} />
        <Route path="/courses" element={<CoursesCatalogPage />} />
        <Route path="/courses/:slug" element={<CourseDetailsPage />} />

        {/* 👇 NEW : pages publiques pour les livres */}
        <Route path="/books" element={<BooksCatalogPage />} />
        <Route path="/books/:slug" element={<BookDetailsPage />} />

        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* === Student dashboard === */}
      <Route
        path="/student"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="my-courses" element={<MyCoursesPage />} />
        <Route path="courses/:courseId" element={<CoursePlayerPage />} />
        <Route path="profile" element={<StudentProfilePage />} />
      </Route>

      {/* === Admin dashboard === */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <DashboardLayout admin />
          </AdminRoute>
        }
      >
        {/* Dashboard */}
        <Route index element={<AdminDashboard />} />

        {/* CMS */}
        <Route path="cms/pages" element={<CmsPagesListPage />} />
        <Route path="cms/pages/:id" element={<CmsPageEditPage />} />
        <Route path="menu" element={<MenuManagementPage />} />

        {/* Cours */}
        <Route path="courses" element={<CoursesListPage />} />
        <Route path="courses/:id" element={<CourseEditPage />} />

        {/* Leçons imbriquées sous un cours */}
        <Route
          path="courses/:courseId/lessons"
          element={<LessonsListPage />}
        />
        <Route
          path="courses/:courseId/lessons/new"
          element={<LessonEditPage />}
        />
        <Route
          path="courses/:courseId/lessons/:lessonId"
          element={<LessonEditPage />}
        />

        {/* Routes leçon “globales” */}
        <Route path="lessons/:id" element={<LessonEditPage />} />
        <Route path="lessons/:lessonId/quiz" element={<QuizEditPage />} />

        {/* Utilisateurs / inscriptions / média */}
        <Route path="users" element={<UsersListPage />} />
        <Route path="users/:id" element={<UserEditPage />} />
        <Route path="enrollments" element={<EnrollmentsListPage />} />
        <Route path="media" element={<MediaUploadPage />} />

        {/* Live sessions (Jitsi) */}
        <Route path="live-sessions" element={<AdminLiveSessionsPage />} />

        {/* Livres / packs PDF */}
        <Route path="books" element={<BooksListPage />} />
        <Route path="books/:id" element={<BookEditPage />} />
        <Route path="book-requests" element={<BookRequestsPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default AppRouter
