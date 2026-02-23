import apiClient from './client';

export const postApi = {
    getApproved: (params?: Record<string, unknown>) =>
        apiClient.get('/posts/approved', { params }),

    getPending: () =>
        apiClient.get('/posts/pending'),

    getAll: () =>
        apiClient.get('/posts/all'),

    getMyPosts: () =>
        apiClient.get('/posts/my-posts'),

    getById: (id: number) =>
        apiClient.get(`/posts/${id}`),

    create: (data: FormData) =>
        apiClient.post('/posts', data, {
            headers: { 'Content-Type': 'multipart/form-data' },
        }),

    approve: (id: number) =>
        apiClient.put(`/posts/${id}/approve`),

    reject: (id: number) =>
        apiClient.put(`/posts/${id}/reject`),

    delete: (id: number) =>
        apiClient.delete(`/posts/${id}`),
};
