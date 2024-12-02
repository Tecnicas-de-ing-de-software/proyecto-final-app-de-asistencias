import { fetchUsers, deleteUser, getCurrentUserRole } from '../services/api';
import { UserModal } from './UserModal';
import Swal from 'sweetalert2';

export const UserList = async () => {
  const container = document.createElement('div');
  container.className = 'container mx-auto mt-8';

  const userRole = getCurrentUserRole();

  if (userRole !== 'admin') {
    container.innerHTML = '<p class="text-red-500">Access denied. Admin privileges required.</p>';
    return container;
  }

  const addUserButton = document.createElement('button');
  addUserButton.textContent = 'Add User';
  addUserButton.className = 'bg-green-600 text-white p-2 mb-4 rounded';
  addUserButton.addEventListener('click', () => {
    const modal = UserModal('add', {}, () => {
      document.body.removeChild(modal);
    });
    document.body.appendChild(modal);
  });
  container.appendChild(addUserButton);

  try {
    const users = await fetchUsers();
    if (!Array.isArray(users)) {
      throw new Error('Expected users to be an array');
    }

    const table = document.createElement('table');
    table.className = 'min-w-full bg-white mx-auto';
    table.style.textAlign = 'center';
    table.innerHTML = `
      <thead>
        <tr>
          <th class="py-2 px-4">Name</th>
          <th class="py-2 px-4">Email</th>
          <th class="py-2 px-4">Age</th>
          <th class="py-2 px-4">Role</th>
          <th class="py-2 px-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        ${users.map(user => `
          <tr class="border-b">
            <td class="py-2 px-4">${user.firstName || ''} ${user.lastName || ''}</td>
            <td class="py-2 px-4">${user.email}</td>
            <td class="py-2 px-4">${user.age || ''}</td>
            <td class="py-2 px-4">${user.role || ''}</td>
            <td class="py-2 px-4">
              <button data-id="${user._id}" class="edit-user bg-blue-600 text-white p-1 rounded mr-2">Edit</button>
              <button data-id="${user._id}" class="delete-user bg-red-600 text-white p-1 rounded">Delete</button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    `;

    container.appendChild(table);

    container.querySelectorAll('.delete-user').forEach(button => {
      button.addEventListener('click', async () => {
        const id = button.getAttribute('data-id');
        const result = await Swal.fire({
          title: 'Are you sure?',
          text: "You won't be able to revert this!",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          confirmButtonText: 'Yes, delete it!'
        });

        if (result.isConfirmed) {
          try {
            await deleteUser(id);
            Swal.fire('Deleted!', 'User has been deleted.', 'success');
            // window.location.reload();
          } catch (error) {
            Swal.fire('Error', 'Failed to delete user', 'error');
          }
        }
      });
    });

    container.querySelectorAll('.edit-user').forEach(button => {
      button.addEventListener('click', () => {
        const id = button.getAttribute('data-id');
        const user = users.find(u => u._id === id);
        if (user) {
          const modal = UserModal('edit', user, () => {
            document.body.removeChild(modal);
          });
          document.body.appendChild(modal);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    container.innerHTML = '<p>Error loading users. Please try again later.</p>';
  }

  return container;
};