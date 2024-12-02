import { createHeader } from '../components/Header';
import { io } from 'socket.io-client';
import { getCurrentApellidos, getCurrentUsername } from '../services/api';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale/es';
import { Reporte } from './Reporte';


export class StudentDashboard {
  constructor() {
    this.page = null;
    this.sessionList = null;
    this.socket = null;
    this.nombres = getCurrentUsername();
    this.apellidos = getCurrentApellidos();
    
    this.initialize();
  }

  initialize() {
    this.createBasicStructure();
    this.initializeSocket();
    this.fetchSessions();
  }

  

  createBasicStructure() {
    this.page = document.createElement('div');
    this.page.className = 'bg-gradient-to-r from-blue-100 to-purple-100 min-h-screen p-6';

    this.page.appendChild(createHeader());

    const content = document.createElement('div');
    content.className = 'max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-6 mt-6';
    content.innerHTML = `
      <h1 class="text-3xl font-bold text-gray-800 mb-6">Student Dashboard</h1>
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 class="text-xl font-semibold text-blue-800">Welcome, ${this.nombres} ${this.apellidos}!</h2>
        <p class="text-blue-600 mt-2">Here you can mark your attendance for available sessions.</p>
      </div>
    `;

    this.sessionList = document.createElement('div');
    this.sessionList.id = 'session-list';
    this.sessionList.className = 'space-y-4';
    content.appendChild(this.sessionList);

    this.page.appendChild(content);
  }

  initializeSocket() {
    this.socket = io('http://localhost:3000');
    this.socket.on('new_attendance_session', () => {
      this.showNotification('New attendance session available!');
      this.fetchSessions();
    });
  }

  async fetchSessions() {
    try {
      const response = await fetch('http://localhost:3000/api/attendance-sessions');
      const sessions = await response.json();

      sessions.sort((a, b) => {
        const dateA = new Date(a.date + 'T' + a.startTime);
        const dateB = new Date(b.date + 'T' + b.startTime);
        return dateB - dateA;
      });

      this.sessionList.innerHTML = '<div class="text-lg font-semibold mb-4">Available Sessions</div>';

      if (sessions.length === 0) {
        this.renderEmptyState();
      } else {
        for (const session of sessions) {
          await this.addSessionToList(session);
        }
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
      this.showNotification('Failed to fetch sessions', 'error');
    }
  }

  renderEmptyState() {
    this.sessionList.innerHTML += `
      <div class="text-center py-8 text-gray-500">
        <p>No active sessions available at the moment.</p>
        <p class="text-sm mt-2">New sessions will appear here automatically when created.</p>
      </div>
    `;
  }

  

  async addSessionToList(session) {
    const sessionItem = document.createElement('div');
    sessionItem.className = 'bg-white border border-gray-200 rounded-lg p-4 shadow-sm transition duration-300 ease-in-out hover:shadow-md';

    const sessionState = this.getSessionState(session);
    const attendanceStatus = await this.checkAttendanceStatus(session._id);

    sessionItem.innerHTML = this.generateSessionHTML(session, sessionState, attendanceStatus);

    if (sessionState.canMarkAttendance) {
      this.attachMarkAttendanceHandler(sessionItem, session);
    }

    this.sessionList.appendChild(sessionItem);
  }

  getSessionState(session) {
    const now = new Date();
    let sessionDate = parseISO(session.date);
    
    // Sumamos un día a la fecha
    sessionDate.setDate(sessionDate.getDate() + 1);
    
    const startTime = session.startTime.split(':');
    const endTime = session.endTime.split(':');
    
    const sessionStart = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate(), 
      parseInt(startTime[0]), 
      parseInt(startTime[1])
    );
    
    const sessionEnd = new Date(
      sessionDate.getFullYear(),
      sessionDate.getMonth(),
      sessionDate.getDate(), 
      parseInt(endTime[0]), 
      parseInt(endTime[1])
    );
    
    return {
      isSessionActive: now >= sessionStart && now <= sessionEnd,
      isSessionExpired: now > sessionEnd,
      isSessionFuture: now < sessionStart,
      isSameDay: now.toDateString() === sessionDate.toDateString(),
      canMarkAttendance: now >= sessionStart && now <= sessionEnd && now.toDateString() === sessionDate.toDateString()
    };
  }


  

  setupThemeToggle() {
    const themeToggle = document.createElement('button');
    themeToggle.className = 'fixed bottom-4 right-4 p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-300';
    themeToggle.innerHTML = `
      <svg class="w-6 h-6 text-gray-800 dark:text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
      </svg>
    `;
    themeToggle.onclick = () => {
      document.documentElement.classList.toggle('dark');
    };
    this.page.appendChild(themeToggle);
  }

  generateSessionHTML(session, state, attendanceStatus) {
    const sessionDate = parseISO(session.date);
    sessionDate.setDate(sessionDate.getDate() + 1);
    const formattedDate = format(sessionDate, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: es });
    
    return `
      <div class="relative overflow-hidden transition-all duration-300 transform hover:-translate-y-1">
        <div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
          <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex-1">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-lg">
                  <svg class="w-6 h-6 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2"></path>
                  </svg>
                </div>
                <div>
                  <h3 class="text-xl font-semibold text-gray-800 dark:text-white">${session.sessionName}</h3>
                  <p class="text-sm text-gray-500 dark:text-gray-400">${formattedDate}</p>
                </div>
              </div>
              
              <div class="mt-4 grid grid-cols-2 gap-4">
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p class="text-sm text-gray-500 dark:text-gray-400">Start Time</p>
                  <p class="text-lg font-medium text-gray-800 dark:text-white">${this.formatTime(session.startTime)}</p>
                </div>
                <div class="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3">
                  <p class="text-sm text-gray-500 dark:text-gray-400">End Time</p>
                  <p class="text-lg font-medium text-gray-800 dark:text-white">${this.formatTime(session.endTime)}</p>
                </div>
              </div>
            </div>
            
            <div class="flex flex-col items-center space-y-4">
              ${this.getSessionStatusBadge(attendanceStatus, state)}
              ${this.getAttendanceButton(attendanceStatus, state)}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  formatTime(time) {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  }

  getSessionStatusBadge(attendanceStatus, state) {
    if (attendanceStatus) {
      return '<span class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">✓ Marked</span>';
    } else if (state.canMarkAttendance) {
      return '<span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Available</span>';
    } else if (state.isSessionExpired || (!state.isSameDay && !state.isSessionFuture)) {
      return '<span class="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">Expired</span>';
    } else if (state.isSessionFuture) {
      return '<span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">Upcoming</span>';
    }
    return '<span class="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">Not Available</span>';
  }

  getAttendanceButton(attendanceStatus, state) {
    if (attendanceStatus) {
      return `
        <button class="w-full bg-green-500 text-white py-2 px-4 rounded-md cursor-not-allowed" disabled>
          Attendance Marked
        </button>
      `;
    } else if (state.canMarkAttendance) {
      return `
        <button class="mark-attendance w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300 ease-in-out">
          Mark Attendance
        </button>
      `;
    } else if (state.isSessionExpired || (!state.isSameDay && !state.isSessionFuture)) {
      return `
        <button class="w-full bg-red-400 text-white py-2 px-4 rounded-md cursor-not-allowed" disabled>
          Session Expired
        </button>
      `;
    } else if (state.isSessionFuture) {
      return `
        <button class="w-full bg-yellow-400 text-white py-2 px-4 rounded-md cursor-not-allowed" disabled>
          Session Not Started
        </button>
      `;
    }
    return `
      <button class="w-full bg-gray-400 text-white py-2 px-4 rounded-md cursor-not-allowed" disabled>
        Not Available
      </button>
    `;
  }

  async checkAttendanceStatus(sessionId) {
    try {
      const response = await fetch(`http://localhost:3000/api/attendances/session/${sessionId}`);
      const attendances = await response.json();
      return attendances.some(a => 
        a.student.name === this.nombres && 
        a.student.apellido === this.apellidos
      );
    } catch (error) {
      console.error('Error checking attendance status:', error);
      return false;
    }
  }

  attachMarkAttendanceHandler(sessionItem, session) {
    const markButton = sessionItem.querySelector('.mark-attendance');
    if (markButton) {
      markButton.onclick = async () => {
        try {
          const response = await fetch('http://localhost:3000/api/attendances', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              session: session._id,
              student: {
                name: this.nombres,
                apellido: this.apellidos
              },
              present: true
            }),
          });

          if (response.ok) {
            this.showNotification('Attendance marked successfully');
            this.socket.emit('attendance_marked', { 
              sessionId: session._id, 
              studentName: `${this.nombres} ${this.apellidos}`,
              present: true
            });
            this.fetchSessions();
          } else {
            const errorData = await response.json();
            this.showNotification(errorData.message || 'Failed to mark attendance', 'error');
          }
        } catch (error) {
          console.error('Error marking attendance:', error);
          this.showNotification('Failed to mark attendance', 'error');
        }
      };
    }
  }

  showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `fixed bottom-4 right-4 p-4 rounded shadow-md text-white ${
      type === 'success' ? 'bg-green-500' : 'bg-red-500'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  render() {
    return this.page;
  }
}

// Export a function that creates and returns a new instance
export const initializeStudentDashboard = () => {
  const dashboard = new StudentDashboard();
  return dashboard.render();
};