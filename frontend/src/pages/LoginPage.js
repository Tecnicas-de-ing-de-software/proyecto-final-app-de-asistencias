import { LoginFormClass } from '../components/LoginForm';
import { loginUser } from '../services/api';

class LoginPageClass {
  constructor() {
    this.page = this.createPage();
    this.loginForm = new LoginFormClass();
    this.attachForm();
  }

  createPage() {
    const page = document.createElement('div');
    page.className = 'flex items-center justify-center min-h-screen bg-gray-100';
    return page;
  }

  attachForm() {
    const formElement = this.loginForm.getFormElement();
    this.page.appendChild(formElement);

    formElement.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = formElement.querySelector('#email').value;
      const password = formElement.querySelector('#password').value;

      try {
        const userData = await loginUser({ email, password });
        if (userData.role === 'student') {
          window.location.href = '/student-dashboard';
        } else if (userData.role === 'teacher') {
          window.location.href = '/teacher-dashboard';
        } else if (userData.role === 'admin') {
          window.location.href = '/';
        }
      } catch (error) {
        alert('Login failed. Please try again.');
      }
    });
  }

  render() {
    return this.page;
  }
}

export { LoginPageClass };
