import { createBrowserRouter } from 'react-router-dom';
import { AdminLayout, PublicLayout } from '@/components/layouts';
import { ProtectedRoute } from '@/components/common';

// Public pages
import HomePage from '@/pages/public/HomePage';
import HouseListPage from '@/pages/public/HouseListPage';
import HouseDetailPage from '@/pages/public/HouseDetailPage';
import LandListPage from '@/pages/public/LandListPage';
import LandDetailPage from '@/pages/public/LandDetailPage';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';

// Admin pages
import DashboardPage from '@/pages/admin/DashboardPage';
import HouseManagementPage from '@/pages/admin/HouseManagementPage';
import HouseFormPage from '@/pages/admin/HouseFormPage';
import LandManagementPage from '@/pages/admin/LandManagementPage';
import LandFormPage from '@/pages/admin/LandFormPage';
import PostManagementPage from '@/pages/admin/PostManagementPage';
import AppointmentManagementPage from '@/pages/admin/AppointmentManagementPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import CustomerManagementPage from '@/pages/admin/CustomerManagementPage';
import EmployeeManagementPage from '@/pages/admin/EmployeeManagementPage';
import RoleManagementPage from '@/pages/admin/RoleManagementPage';
import CategoryManagementPage from '@/pages/admin/CategoryManagementPage';
import FavoriteManagementPage from '@/pages/admin/FavoriteManagementPage';
import ProfilePage from '@/pages/admin/ProfilePage';

const router = createBrowserRouter([
    // Auth routes
    {
        path: '/login',
        element: <LoginPage />,
    },
    {
        path: '/register',
        element: <RegisterPage />,
    },
    {
        path: '/forgot-password',
        element: <ForgotPasswordPage />,
    },

    // Public routes
    {
        path: '/',
        element: <PublicLayout />,
        children: [
            { index: true, element: <HomePage /> },
            { path: 'houses', element: <HouseListPage /> },
            { path: 'houses/:id', element: <HouseDetailPage /> },
            { path: 'lands', element: <LandListPage /> },
            { path: 'lands/:id', element: <LandDetailPage /> },
        ],
    },

    // Admin routes (protected)
    {
        path: '/admin',
        element: (
            <ProtectedRoute>
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <DashboardPage /> },

            // Houses
            { path: 'houses', element: <HouseManagementPage /> },
            { path: 'houses/create', element: <HouseFormPage /> },
            { path: 'houses/:id/edit', element: <HouseFormPage /> },

            // Lands
            { path: 'lands', element: <LandManagementPage /> },
            { path: 'lands/create', element: <LandFormPage /> },
            { path: 'lands/:id/edit', element: <LandFormPage /> },

            // Posts
            { path: 'posts', element: <PostManagementPage /> },

            // Appointments
            { path: 'appointments', element: <AppointmentManagementPage /> },

            // Users
            { path: 'users', element: <UserManagementPage /> },
            { path: 'customers', element: <CustomerManagementPage /> },
            { path: 'employees', element: <EmployeeManagementPage /> },

            // Roles & Categories
            { path: 'roles', element: <RoleManagementPage /> },
            { path: 'categories', element: <CategoryManagementPage /> },

            // Favorites & Profile
            { path: 'favorites', element: <FavoriteManagementPage /> },
            { path: 'profile', element: <ProfilePage /> },
        ],
    },
]);

export default router;
