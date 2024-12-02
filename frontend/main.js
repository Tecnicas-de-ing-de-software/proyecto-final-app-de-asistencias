import './index.css';
import { LoginPageClass } from './src/pages/LoginPage';
import { createHomePage } from './src/pages/HomePage';
import { initializeTeacherDashboard } from './src/pages/TeacherDashboard';
import { initializeStudentDashboard } from './src/pages/StudentDashboard';

const app = document.querySelector('#app'); // Referencia al contenedor principal
const renderPage = async () => {
  console.log('Rendering page. Current path:', window.location.pathname);
  app.innerHTML = ''; // Limpia el contenido anterior

  const userRole = localStorage.getItem('userRole'); // Obtiene el rol del usuario almacenado
  console.log('User role:', userRole);

  if (userRole) {
    switch (window.location.pathname) {
      case '/':
        // Renderiza la HomePage dependiendo del rol del usuario
        if (userRole === 'admin') {
          console.log('Rendering HomePage for admin');
          const homePageElement = await createHomePage(); // Cargar HomePage
          app.appendChild(homePageElement); // Agregar HomePage al DOM
        } else if (userRole === 'student') {
          console.log('Redirecting student to Student Dashboard');
          window.navigateTo('/student-dashboard'); // Redirigir a Student Dashboard
        } else if (userRole === 'teacher') {
          console.log('Redirecting teacher to Teacher Dashboard');
          window.navigateTo('/teacher-dashboard'); // Redirigir a Teacher Dashboard
        }
        break;1

      case '/student-dashboard':
        if (userRole === 'student') {
          console.log('Rendering StudentDashboard');
          const dashboardElement = await initializeStudentDashboard(); // Cargar Student Dashboard
          app.appendChild(dashboardElement); // Agregar Student Dashboard al DOM
        } else {
          console.log('Unauthorized access to student dashboard, redirecting to home');
          window.navigateTo('/'); // Redirigir a Home si el acceso no es permitido
        }
        break;

      case '/teacher-dashboard':
        if (userRole === 'teacher') {
          console.log('Rendering TeacherDashboard');
          const dashboardElement = await initializeTeacherDashboard(); // Cargar Teacher Dashboard
          app.appendChild(dashboardElement); // Agregar Teacher Dashboard al DOM
        } else {
          console.log('Unauthorized access to teacher dashboard, redirecting to home');
          window.navigateTo('/'); // Redirigir a Home si el acceso no es permitido
        }
        break;

      default:
        console.log('Unknown route, redirecting to home');
        window.navigateTo('/'); // Redirigir a Home si la ruta es desconocida
        break;
    }
  } else {
    // Si no hay un rol definido, renderiza la LoginPage
    console.log('User role not defined, rendering LoginPage');
    const loginPageElement = new LoginPageClass();
    app.appendChild(loginPageElement.render()); // Agregar LoginPage al DOM
  }
};

// Escucha los eventos de retroceso del historial
window.addEventListener('popstate', renderPage);

// Función para manejar la navegación dentro de la aplicación
window.navigateTo = (path) => {
  console.log('Navigating to:', path);
  history.pushState(null, '', path); // Agrega la nueva ruta al historial sin recargar la página
  renderPage(); // Renderiza la página correspondiente
};

renderPage(); // Llama a la función para renderizar la página inicialmente
