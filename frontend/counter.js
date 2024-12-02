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

import { Header } from '../components/Header';

import { UserList } from '../components/UserList';

import {

 getCurrentApellidos,

 getCurrentUsername,

 getCurrentUserRole,

 isUserLoggedIn

} from '../services/api';

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

 welcomeMessage.textContent = Welcome ${this.userData.names} ${this.userData.apellidos};

this.content.appendChild(welcomeMessage);

 }

async renderAdminDashboard() {

// Renderizar header

const header = Header();

this.page.appendChild(header);

// Crear y configurar el contenido

this.createContent();

this.createWelcomeMessage();

// Cargar y mostrar la lista de usuarios

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

 <span class="block sm:inline"> ${message}</span>

 `;

if (this.content) {

this.content.appendChild(errorElement);

 } else {

this.page.appendChild(errorElement);

 }

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

// Función de exportación para crear y renderizar la página

export const HomePage = async () => {

const homePage = new HomePage();

return await homePage.init();

};

import './index.css';

import { LoginPage } from './src/pages/LoginPage';

import { HomePage } from './src/pages/HomePage';

import { initializeTeacherDashboard } from './src/pages/TeacherDashboard';

import { initializeStudentDashboard } from './src/pages/StudentDashboard';

const app = document.querySelector('#app');

const renderPage = async () => {

console.log('Rendering page. Current path:', window.location.pathname);

app.innerHTML = ''; // Limpia el contenido anterior

const userRole = localStorage.getItem('userRole');

console.log('User role:', userRole);

if (userRole) {

switch (window.location.pathname) {

case '/':

// Renderiza la HomePage dependiendo del rol del usuario

if (userRole === 'admin') {

console.log('Rendering HomePage for admin');

app.appendChild(await HomePage());

 } else if (userRole === 'student') {

console.log('Redirecting student to Student Dashboard');

window.location.href = '/student-dashboard'; // Redirige al dashboard del estudiante

 } else if (userRole === 'teacher') {

console.log('Redirecting teacher to Teacher Dashboard');

window.location.href = '/teacher-dashboard'; // Redirige al dashboard del profesor

 }

break;

case '/student-dashboard':

// Verifica si el usuario tiene acceso al Student Dashboard

if (userRole === 'student') {

console.log('Rendering StudentDashboard');

const dashboardElement = initializeStudentDashboard();

document.getElementById('app').appendChild(dashboardElement);

 } else {

console.log('Unauthorized access to student dashboard, redirecting to home');

window.location.href = '/'; // Redirige a la Home si el acceso no es permitido

 }

break;

case '/teacher-dashboard':

// Verifica si el usuario tiene acceso al Teacher Dashboard

if (userRole === 'teacher') {

console.log('Rendering TeacherDashboard');

const dashboardElement = initializeTeacherDashboard();

document.getElementById('app').appendChild(dashboardElement);

 } else {

console.log('Unauthorized access to teacher dashboard, redirecting to home');

window.location.href = '/'; // Redirige a la Home si el acceso no es permitido

 }

break;

default:

console.log('Unknown route, redirecting to home');

window.location.href = '/'; // Redirige a la Home si la ruta es desconocida

 }

 } else {

// Si no hay un rol definido, renderiza la LoginPage

console.log('User role not defined, rendering LoginPage');

app.appendChild(await LoginPage());

 }

};

renderPage(); // Llama a la función para renderizar la página inicialmente

// Escucha los eventos de retroceso del historial

window.addEventListener('popstate', renderPage);

// Función para manejar la navegación dentro de la aplicación

window.navigateTo = (path) => {

console.log('Navigating to:', path);

history.pushState(null, '', path); // Agrega la nueva ruta al historial

renderPage(); // Renderiza la página correspondiente

};

export { renderPage };

esos 3 deben ser tipo clase y asi ajustarlos para que funcionen bien