import apiClient from './client';

export const appointmentApi = {
    getAll: () =>
        apiClient.get('/appointments'),

    getByEmployee: (employeeId: number) =>
        apiClient.get(`/appointments/employee/${employeeId}`),

    create: (data: Record<string, unknown>) =>
        apiClient.post('/appointments', data),

    approve: (id: number, data: Record<string, unknown>) =>
        apiClient.put(`/appointments/${id}/approve`, data),

    cancel: (id: number) =>
        apiClient.put(`/appointments/${id}/cancel`),

    updateActualStatus: (id: number, data: Record<string, unknown>) =>
        apiClient.put(`/appointments/${id}/actual-status`, data),
};
