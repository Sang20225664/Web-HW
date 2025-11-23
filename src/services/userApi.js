// src/services/userApi.js
const api = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 8000,
    headers: { 'Content-Type': 'application/json' }
});

// Tạo object global thay vì export
window.userApi = {
    async getUsers() {
        const res = await api.get('/users');
        return res.data;
    },

    async createUser(payload) {
        const res = await api.post('/users', payload);
        return res.data;
    },

    async updateUser(id, payload) {
        const res = await api.patch(`/users/${id}`, payload);
        return res.data;
    },

    async deleteUser(id) {
        const res = await api.delete(`/users/${id}`);
        return res.status;
    }
};
