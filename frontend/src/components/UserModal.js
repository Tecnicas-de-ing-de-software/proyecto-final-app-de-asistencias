import { addUser, updateUser, getCurrentUserRole } from '../services/api';

export const UserModal = (mode = 'add', user = {}, onClose) => {
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center backdrop-blur-sm';

  const currentUserRole = getCurrentUserRole();

  modal.innerHTML = `
    <div class="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
      <button class="absolute top-2 right-2 text-white bg-red-400 hover:text-gray-700" id="closeModal">Close</button>
      <h2 class="text-2xl mb-4 text-gray-800">${mode === 'add' ? 'Add' : 'Edit'} User</h2>
      <form id="userForm" class="space-y-4">
        <div>
          <label class="block text-gray-700">Username</label>
          <input type="text" id="username" value="${user.username || ''}" class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required>
        </div>
        <div>
          <label class="block text-gray-700">First Name</label>
          <input type="text" id="firstName" value="${user.firstName || ''}" class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required>
        </div>
        <div>
          <label class="block text-gray-700">Last Name</label>
          <input type="text" id="lastName" value="${user.lastName || ''}" class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required>
        </div>
        <div>
          <label class="block text-gray-700">Email</label>
          <input type="email" id="email" value="${user.email || ''}" class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required>
        </div>
        ${mode === 'add' ? `
          <div>
            <label class="block text-gray-700">Password</label>
            <input type="password" id="password" class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required>
          </div>
        ` : ''}
        <div>
          <label class="block text-gray-700">Age</label>
          <input type="number" id="age" value="${user.age || ''}" class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required>
        </div>
        ${currentUserRole === 'admin' ? `
          <div>
            <label class="block text-gray-700">Role</label>
            <select id="role" class="w-full p-2 border rounded-lg focus:ring focus:ring-blue-300" required>
              <option value="admin" ${user.role === 'admin' ? 'selected' : ''}>Admin</option>
              <option value="teacher" ${user.role === 'teacher' ? 'selected' : ''}>Teacher</option>
              <option value="student" ${user.role === 'student' ? 'selected' : ''}>Student</option>
            </select>
          </div>
        ` : ''}
        <button type="submit" class="bg-blue-600 text-white p-2 rounded-lg w-full hover:bg-blue-700 transition">${mode === 'add' ? 'Add' : 'Update'}</button>
      </form>
    </div>
  `;

  modal.querySelector('#closeModal').addEventListener('click', () => {
    document.body.removeChild(modal);
    if (onClose) onClose();
  });

  modal.querySelector('#userForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      username: modal.querySelector('#username').value,
      firstName: modal.querySelector('#firstName').value,
      lastName: modal.querySelector('#lastName').value,
      email: modal.querySelector('#email').value,
      age: parseInt(modal.querySelector('#age').value, 10),
    };

    if (mode === 'add') {
      data.password = modal.querySelector('#password').value;
    }

    if (currentUserRole === 'admin') {
      data.role = modal.querySelector('#role').value;
    }

    try {
      if (mode === 'add') {
        await addUser(data);
      } else {
        await updateUser(user._id, data);
      }
      onClose();
      window.location.reload();
    } catch (error) {
      alert('Something went wrong: ' + error.message);
    }
  });

  return modal;
};