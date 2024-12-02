import { logoutUser, getCurrentUserRole } from '../services/api';

class Header {
  constructor() {
    this.header = null;
    this.userInfo = null;
    this.isDarkMode = localStorage.getItem('modeDark') === 'true';
    this.init();
  }

  init() {
    this.createHeader();
    this.createTitle();
    this.createUserInfo();
    this.attachEventListeners();
  }

  createHeader() {
    this.header = document.createElement('header');
    this.header.className = 'p-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white flex justify-between items-center shadow-lg rounded-lg backdrop-blur-md';
  }

  createTitle() {
    const title = document.createElement('h1');
    title.textContent = 'User Management';
    title.className = 'text-xl font-semibold';
    this.header.appendChild(title);
  }

  createUserInfo() {
    this.userInfo = document.createElement('div');
    this.userInfo.className = 'flex items-center gap-4';
    
    const userRole = getCurrentUserRole();
    
    this.userInfo.innerHTML = `
      <span>Role: ${userRole}</span>
      <button id="toggleMode" class="px-3 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors">
        ${this.isDarkMode ? 'Normal Mode' : 'Dark Mode'}
      </button>
      <button id="logout" class="px-3 py-1 rounded bg-white/20 hover:bg-white/30 transition-colors">
        Logout
      </button>
    `;
    
    this.header.appendChild(this.userInfo);
  }

  attachEventListeners() {
    // Logout handler
    const logoutBtn = this.userInfo.querySelector('#logout');
    logoutBtn.addEventListener('click', this.handleLogout.bind(this));

    // Theme toggle handler
    const toggleModeBtn = this.userInfo.querySelector('#toggleMode');
    toggleModeBtn.addEventListener('click', this.handleThemeToggle.bind(this));
  }

  async handleLogout() {
    try {
      await logoutUser();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
      // Aquí podrías agregar una notificación de error para el usuario
    }
  }

  handleThemeToggle() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem('modeDark', this.isDarkMode.toString());
    
    // Actualizar el texto del botón
    const toggleModeBtn = this.userInfo.querySelector('#toggleMode');
    toggleModeBtn.textContent = this.isDarkMode ? 'Normal Mode' : 'Dark Mode';
    
    // Aquí podrías emitir un evento para que otros componentes 
    // sepan que el tema ha cambiado
    document.dispatchEvent(new CustomEvent('themeChanged', {
      detail: { isDarkMode: this.isDarkMode }
    }));
  }

  render() {
    return this.header;
  }
}

// Uso del componente
export const createHeader = () => {
  const headerComponent = new Header();
  return headerComponent.render();
};