import { logoutUser, getCurrentUserRole, getCurrentApellidos, getCurrentUsername, isUserLoggedIn } from '../services/api';
import { createHeader } from '../components/Header';

import { UserList } from '../components/UserList';

class HomePage {
  constructor() {
    this.page = document.createElement('div');
    this.page.className = 'min-h-screen bg-gray-100';
    this.content = null;
    this.userRole = null;
    this.userData = {
      names: '',
      apellidos: ''
    };
  }

  async init() {
    if (!this.checkAuth()) {
      return this.page;
    }
    await this.loadUserData();
    await this.renderPageContent();
    return this.page;
  }

  checkAuth() {
    if (!isUserLoggedIn()) {
      window.location.href = '/login';
      return false;
    }
    return true;
  }

  async loadUserData() {
    this.userRole = getCurrentUserRole();
    this.userData.names = getCurrentUsername();
    this.userData.apellidos = getCurrentApellidos();
  }

  createContent() {
    this.content = document.createElement('div');
    this.content.className = 'container mx-auto mt-8 p-4';
  }

  createWelcomeMessage() {
    const welcomeMessage = document.createElement('h2');
    welcomeMessage.className = 'text-2xl font-bold mb-4';
    welcomeMessage.textContent = `Welcome ${this.userData.names} ${this.userData.apellidos}`;
    this.content.appendChild(welcomeMessage);
  }

  async renderAdminDashboard() {
    const headerElement = createHeader();
    document.body.insertBefore(headerElement, document.getElementById('app'));
    

    this.createContent();
    this.createWelcomeMessage();

    try {
      const userList = await UserList();
      this.content.appendChild(userList);
    } catch (error) {
      this.handleError('Error loading user list: ' + error.message);
    }

    this.page.appendChild(this.content);
  }

  redirectToRoleDashboard(role) {
    const dashboardUrls = {
      student: '/student-dashboard',
      teacher: '/teacher-dashboard'
    };

    const url = dashboardUrls[role];
    if (url) {
      window.location.href = url;
    } else {
      this.handleError('Invalid user role');
    }
  }

  handleError(message) {
    const errorElement = document.createElement('div');
    errorElement.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4';
    errorElement.role = 'alert';
    errorElement.innerHTML = `
      <strong class="font-bold">Error!</strong>
      <span class="block sm:inline">${message}</span>
    `;
    this.content ? this.content.appendChild(errorElement) : this.page.appendChild(errorElement);
  }

  async renderPageContent() {
    try {
      switch (this.userRole) {
        case 'admin':
          await this.renderAdminDashboard();
          break;
        case 'student':
        case 'teacher':
          this.redirectToRoleDashboard(this.userRole);
          break;
        default:
          this.handleError('Invalid user role');
      }
    } catch (error) {
      this.handleError('An unexpected error occurred: ' + error.message);
    }
  }
}

// Exportar HomePage
export const createHomePage = async () => {
  const homePage = new HomePage();
  return await homePage.init();
};
