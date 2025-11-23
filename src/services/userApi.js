// src/services/userApi.js
const api = axios.create({
    baseURL: 'https://jsonplaceholder.typicode.com',
    timeout: 8000,
    headers: { 'Content-Type': 'application/json' }
});

export async function getUsers() {
    const res = await api.get('/users');
    return res.data;
}

export async function createUser(payload) {
    const res = await api.post('/users', payload);
    return res.data;
}

export async function updateUser(id, payload) {
    const res = await api.patch(`/users/${id}`, payload);
    return res.data;
}

export async function deleteUser(id) {
    const res = await api.delete(`/users/${id}`);
    return res.status;
}
