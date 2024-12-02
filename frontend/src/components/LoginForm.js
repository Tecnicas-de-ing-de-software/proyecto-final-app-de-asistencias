class LoginFormClass {
  constructor() {
    this.form = this.createForm();
  }

  createForm() {
    const form = document.createElement('form');
    form.className = 'max-w-md mx-auto mt-10 p-8 bg-white shadow-lg rounded-lg';

    form.innerHTML = `
      <h2 class="text-2xl font-semibold text-gray-900 mb-6 text-center">Login</h2>
      <div class="mb-6">
        <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
        <input type="email" id="email" class="mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" required>
      </div>
      <div class="mb-6">
        <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
        <input type="password" id="password" class="mt-1 p-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full" required>
      </div>
      <button type="submit" class="bg-blue-600 text-white p-3 rounded-lg w-full hover:bg-blue-700 transition duration-200">Login</button>
    `;

    return form;
  }

  getFormElement() {
    return this.form;
  }
}

export { LoginFormClass };
