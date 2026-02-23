import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRoles }) => {
    const { isAuthenticated, hasRole } = useAuthStore();
    const location = useLocation();

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRoles && requiredRoles.length > 0) {
        const hasRequiredRole = requiredRoles.some((role) => hasRole(role));
        if (!hasRequiredRole) {
            return <Navigate to="/" replace />;
        }
    }

    return <>{children}</>;
};

export default ProtectedRoute;
