import { isAuthenticated } from '../services/api';

// Obtener el rol del usuario almacenado en el localStorage
export const getUserRole = () => {
  return localStorage.getItem('userRole');
};

// Redirigir al login si no está autenticado
export const requireAuth = () => {
  if (!isAuthenticated()) {
    window.location.href = '/login';
  }
};

// Verifica si el usuario tiene permisos basados en su rol
export const hasPermission = (requiredRole) => {
  const userRole = getUserRole();
  return userRole === requiredRole;
};
