import { createHeader } from '../components/Header';
import { io } from 'socket.io-client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { getCurrentApellidos, getCurrentUsername } from '../services/api';
import { Reporte } from './Reporte';

export class TeacherDashboard {
  constructor() {
    this.page = null;
    this.sessionList = null;
    this.socket = null;
    this.nombres = getCurrentUsername();
    this.apellidos = getCurrentApellidos();
    this.reporte = new Reporte();
    
    this.initialize();
  }

  initialize() {
    this.createBasicStructure();
    this.initializeSocket();
    this.setupAutoRefresh();
    this.fetchSessions();
  }

  initializeSocket() {
    this.socket = io('http://localhost:3000');
    this.socket.on('attendance_marked', (data) => {
      this.showNotification(`${data.studentName} marked attendance for session ${data.sessionId}`);
      this.fetchSessions();
    });
  }
  

  setupAutoRefresh() {
    setInterval(() => this.fetchSessions(), 30000);
  }

  createBasicStructure() {
    this.page = document.createElement('div');
    this.page.className = 'bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 min-h-screen p-6';

    this.page.appendChild(createHeader());
    let modo = localStorage.getItem("modeDark")

    switch (modo) {
      case "true":
        this.page.className = 'bg-gradient-to-r from-black via-gray to-purple-800 min-h-screen p-6'
        break;
      case "false":
        this.page.className = 'bg-gradient-to-r from-emerald-100 via-teal-100 to-cyan-100 min-h-screen p-6'
        break;
      default:
        break;
    }

    const content = document.createElement('div');
    content.className = 'max-w-6xl mx-auto space-y-8';
    
    // Welcome Section con botón de reporte mensual
    const welcomeSection = document.createElement('div');
    welcomeSection.className = 'bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20';
    welcomeSection.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-4">
          <div class="p-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 6.41L8.7 16.71a1 1 0 1 1-1.4-1.42L17.58 5H14a1 1 0 0 1 0-2h6a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0V6.41z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-4xl font-bold text-gray-800">Welcome back, ${this.nombres} ${this.apellidos}!</h1>
            <p class="text-gray-600 mt-2">Manage your classroom attendance sessions and track student participation.</p>
          </div>
        </div>
        <button id="generate-monthly-report" class="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
          </svg>
          <span>Generate Monthly Report</span>
        </button>
      </div>
    `;

    content.appendChild(welcomeSection);

    // Resto de las secciones...
    const formSection = this.createSessionForm();
    content.appendChild(formSection);

    this.sessionList = document.createElement('div');
    this.sessionList.className = 'space-y-6';
    
    const sessionListWrapper = document.createElement('div');
    sessionListWrapper.className = 'bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20';
    sessionListWrapper.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Active Sessions</h2>
        <button id="refresh-sessions" class="flex items-center space-x-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
          </svg>
          <span>Refresh</span>
        </button>
      </div>
    `;
    sessionListWrapper.appendChild(this.sessionList);
    content.appendChild(sessionListWrapper);

    this.page.appendChild(content);

    // Añadir el event listener para el reporte mensual
    const reportButton = this.page.querySelector('#generate-monthly-report');
    reportButton.onclick = () => this.showMonthSelector();
  }

  showMonthSelector() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
    
    const currentYear = new Date().getFullYear();
    const months = Array.from({length: 12}, (_, i) => {
      const date = new Date(currentYear, i, 1);
      return format(date, 'MMMM', { locale: es });
    });

    modal.innerHTML = `
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl">
        <h3 class="text-2xl font-bold text-gray-800 mb-4">Select Month for Report</h3>
        <div class="grid grid-cols-2 gap-4 mb-6">
          ${months.map((month, index) => `
            <button class="month-btn text-left px-4 py-3 rounded-lg hover:bg-blue-50 transition-colors
              border border-gray-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              data-month="${index}">
              ${month}
            </button>
          `).join('')}
        </div>
        <div class="flex justify-end space-x-3">
          <button class="cancel-btn px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
            Cancel
          </button>
          <button class="generate-btn px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled>
            Generate Report
          </button>
        </div>
      </div>
    `;

    let selectedMonth = null;

    // Event listeners
    const monthButtons = modal.querySelectorAll('.month-btn');
    const generateBtn = modal.querySelector('.generate-btn');
    const cancelBtn = modal.querySelector('.cancel-btn');

    monthButtons.forEach(btn => {
      btn.onclick = () => {
        monthButtons.forEach(b => b.classList.remove('bg-blue-50', 'border-blue-500'));
        btn.classList.add('bg-blue-50', 'border-blue-500');
        selectedMonth = parseInt(btn.dataset.month);
        generateBtn.disabled = false;
      };
    });

    generateBtn.onclick = async () => {
      if (selectedMonth !== null) {
        modal.remove();
        this.generateMonthlyReport(selectedMonth);
      }
    };

    cancelBtn.onclick = () => modal.remove();
    modal.onclick = (e) => {
      if (e.target === modal) modal.remove();
    };

    document.body.appendChild(modal);
  }

  async generateMonthlyReport(month) {
    try {
      this.showNotification('Generating monthly report...');
      
      // Obtener todas las sesiones del mes
      const startDate = new Date(new Date().getFullYear(), month, 1);
      const endDate = new Date(new Date().getFullYear(), month + 1, 0);
      
      const response = await fetch('http://localhost:3000/api/attendance-sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const allSessions = await response.json();
      
      // Filtrar sesiones del mes seleccionado
      const monthlySessions = allSessions.filter(session => {
        const sessionDate = new Date(session.date);
        return sessionDate >= startDate && sessionDate <= endDate;
      });

      // Obtener todas las asistencias de las sesiones del mes
      const monthlyAttendances = [];
      for (const session of monthlySessions) {
        const attendances = await fetch(`http://localhost:3000/api/attendances/session/${session._id}`);
        if (attendances.ok) {
          const sessionAttendances = await attendances.json();
          monthlyAttendances.push(...sessionAttendances);
        }
      }

      // Generar el reporte con todas las asistencias del mes
      const success = await this.reporte.generateReport(monthlyAttendances);
      
      if (success) {
        this.showNotification('Monthly report generated successfully');
      } else {
        this.showNotification('Failed to generate monthly report', 'error');
      }
    } catch (error) {
      console.error('Error generating monthly report:', error);
      this.showNotification('Failed to generate monthly report', 'error');
    }
  }

  createSessionForm() {
    const formSection = document.createElement('div');
    formSection.className = 'bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20';
    
    const form = document.createElement('form');
    form.className = 'space-y-6';
    form.innerHTML = `
      <div class="flex items-center justify-between mb-6">
        <div>
          <h2 class="text-2xl font-bold text-gray-800">Create New Session</h2>
          <p class="text-gray-600 mt-1">Set up a new attendance tracking session</p>
        </div>
        <div class="p-3 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl">
          <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="space-y-2">
          <label for="sessionName" class="block text-sm font-medium text-gray-700">Session Name</label>
          <input type="text" id="sessionName" name="sessionName" 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors" 
            required placeholder="Enter session name" />
        </div>
        
        <div class="space-y-2">
          <label for="date" class="block text-sm font-medium text-gray-700">Date</label>
          <input type="date" id="date" name="date" 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors" 
            required />
        </div>
        
        <div class="space-y-2">
          <label for="startTime" class="block text-sm font-medium text-gray-700">Start Time</label>
          <input type="time" id="startTime" name="startTime" 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors" 
            required />
        </div>
        
        <div class="space-y-2">
          <label for="endTime" class="block text-sm font-medium text-gray-700">End Time</label>
          <input type="time" id="endTime" name="endTime" 
            class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-colors" 
            required />
        </div>
      </div>

      <input type="hidden" id="createdBy" name="createdBy" value="${this.nombres} ${this.apellidos}" />
      
      <button type="submit" 
        class="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 px-6 rounded-lg font-medium
        hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-opacity-50 
        transition-all duration-300 ease-in-out transform hover:-translate-y-0.5">
        Create Attendance Session
      </button>
    `;

    form.onsubmit = this.handleFormSubmit.bind(this);
    formSection.appendChild(form);
    return formSection;
  }

  async handleFormSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    try {
      const response = await fetch('http://localhost:3000/api/attendance-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        this.showNotification('Attendance session created successfully');
        this.socket.emit('new_attendance_session', data);
        this.fetchSessions();
        e.target.reset();
      }
    } catch (error) {
      console.error('Error creating attendance session:', error);
      this.showNotification('Failed to create attendance session', 'error');
    }
  }

  async fetchSessions() {
    try {
      const response = await fetch('http://localhost:3000/api/attendance-sessions');
      if (!response.ok) throw new Error('Failed to fetch sessions');
      
      const sessions = await response.json();
      this.sessionList.innerHTML = '';
      
      if (sessions.length === 0) {
        this.renderEmptyState();
      } else {
        sessions.forEach(session => this.renderSessionCard(session));
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      this.showNotification('Failed to fetch sessions', 'error');
    }
  }

  renderEmptyState() {
    this.sessionList.innerHTML = `
      <div class="text-center py-12">
        <div class="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-900">No sessions yet</h3>
        <p class="mt-2 text-gray-500">Create your first attendance session using the form above.</p>
      </div>
    `;
  }

  renderSessionCard(session) {
    const sessionCard = document.createElement('div');
    sessionCard.className = 'bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-100 overflow-hidden';
    
    const sessionDate = new Date(session.date);
    sessionDate.setDate(sessionDate.getDate() + 1); // Mantener la lógica de fecha existente
    const formattedDate = format(sessionDate, 'dd/MM/yyyy', { locale: es });

    sessionCard.innerHTML = `
      <div class="p-6">
        <div class="flex justify-between items-start">
          <div class="space-y-1">
            <h3 class="text-xl font-bold text-gray-900">${session.sessionName}</h3>
            <p class="text-gray-500 text-sm">${formattedDate}</p>
          </div>
          <span class="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm font-medium rounded-full">
            ${session.startTime} - ${session.endTime}
          </span>
        </div>
        
        <div class="mt-4 flex items-center justify-between">
          <div class="flex items-center space-x-2 text-gray-500">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            <span class="text-sm">${session.createdBy}</span>
          </div>
          
          <button class="view-attendances px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 
            transition-colors duration-300 flex items-center space-x-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
            </svg>
            <span>View Attendances</span>
          </button>
        </div>
      </div>
    `;

    const viewButton = sessionCard.querySelector('.view-attendances');
    viewButton.onclick = () => this.showAttendances(session._id, session.sessionName);

    this.sessionList.appendChild(sessionCard);
  }

  async showAttendances(sessionId, sessionName) {
    try {
      const response = await fetch(`http://localhost:3000/api/attendances/session/${sessionId}`);
      if (!response.ok) throw new Error('Failed to fetch attendances');
      
      const attendances = await response.json();
      
      const modal = document.createElement('div');
      modal.className = 'fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50';
      
      modal.innerHTML = `
        <div class="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-xl transform transition-all">
          <div class="px-6 py-4 bg-gradient-to-r from-emerald-500 to-teal-500">
            <h2 class="text-2xl font-bold text-white">Attendance Record</h2>
            <p class="text-emerald-100 mt-1">${sessionName}</p>
          </div>
          
          <div class="p-6 overflow-y-auto max-h-[60vh]">
            ${attendances.length > 0 ? `
              <div class="space-y-3">
                ${attendances.map(attendance => `
                  <div class="flex items-center justify-between p-4 rounded-lg ${
                    attendance.present ? 'bg-emerald-50' : 'bg-red-50'
                  }">
                    <div class="flex items-center space-x-3">
                      <div class="flex-shrink-0">
                        <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg class="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                            </path>
                          </svg>
                        </div>
                      </div>
                      <div>
                        <h4 class="font-medium text-gray-900">${attendance.student.name} ${attendance.student.apellido}</h4>
                        <p class="text-sm text-gray-500">
                          ${new Date(attendance.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${
                      attendance.present 
                        ? 'bg-emerald-100 text-emerald-800' 
                        : 'bg-red-100 text-red-800'
                    }">
                      ${attendance.present ? 'Present' : 'Absent'}
                    </span>
                  </div>
                `).join('')}
              </div>
            ` : `
              <div class="text-center py-8">
                <div class="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6">
                    </path>
                  </svg>
                </div>
                <h3 class="text-lg font-medium text-gray-900">No attendances yet</h3>
                <p class="mt-2 text-gray-500">Waiting for students to mark their attendance.</p>
              </div>
            `}
          </div>
          
          <div class="px-6 py-4 bg-gray-50 border-t">
            <button class="close-modal w-full bg-gray-800 text-white py-2 px-4 rounded-lg 
              hover:bg-gray-700 transition-colors duration-200">
              Close
            </button>
          </div>
        </div>
      `;

      document.body.appendChild(modal);

      // Manejadores de eventos para cerrar el modal
      const closeModal = () => modal.remove();
      
      modal.querySelector('.close-modal').onclick = closeModal;
      
      modal.onclick = (e) => {
        if (e.target === modal) closeModal();
      };

      // Cerrar con la tecla Escape
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          closeModal();
          document.removeEventListener('keydown', handleEscape);
        }
      };
      document.addEventListener('keydown', handleEscape);

    } catch (error) {
      console.error('Error fetching attendances:', error);
      this.showNotification('Failed to fetch attendances', 'error');
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded-lg text-white ${
      type === 'success' ? 'bg-emerald-500' : 'bg-red-500'
    } shadow-lg transform transition-all duration-300 z-50`;
    
    notification.innerHTML = `
      <div class="flex items-center space-x-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          ${type === 'success' 
            ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>'
            : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>'
          }
        </svg>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Animación de entrada
    requestAnimationFrame(() => {
      notification.style.transform = 'translateY(0)';
      notification.style.opacity = '1';
    });

    // Eliminar después de 3 segundos
    setTimeout(() => {
      notification.style.transform = 'translateY(20px)';
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  
    

  }

  render() {
    return this.page;

}
  
}

// Export a function that creates and returns a new instance
export const initializeTeacherDashboard = () => {
  const dashboard = new TeacherDashboard();
  return dashboard.render();
};