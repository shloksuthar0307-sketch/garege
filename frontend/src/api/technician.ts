import { api } from '../lib/api';

export const technicianApi = {
  getDashboardStats: async () => {
    return api.get('/technician/dashboard/').then(res => res.data);
  },
  
  getWorkOrders: async () => {
    return api.get('/technician/work-orders/').then(res => res.data);
  },
  
  getWorkOrder: async (id: string) => {
    return api.get(`/technician/work-orders/${id}/`).then(res => res.data);
  },
  
  updateWorkOrder: async (id: string, data: any) => {
    return api.patch(`/technician/work-orders/${id}/`, data).then(res => res.data);
  },
  
  getInspection: async (id: string) => {
    return api.get(`/technician/work-orders/${id}/inspection/`).then(res => res.data);
  },
  
  startInspection: async (id: string, data: any = {}) => {
    return api.post(`/technician/work-orders/${id}/inspection/`, data).then(res => res.data);
  },
  
  reportIssue: async (id: string, data: any) => {
    return api.post(`/technician/work-orders/${id}/issues/`, data).then(res => res.data);
  },
  
  addEvidence: async (issueId: string, data: any) => {
    return api.post(`/technician/issues/${issueId}/evidence/`, data).then(res => res.data);
  },
  
  getRepairTasks: async (id: string) => {
    return api.get(`/technician/work-orders/${id}/repairs/`).then(res => res.data);
  },
  
  updateRepairProgress: async (taskId: string, data: any) => {
    return api.post(`/technician/repairs/${taskId}/progress/`, data).then(res => res.data);
  },

  logLaborTime: async (jobId: string, durationMs: number) => {
    return api.post(`/technician/labor/`, { job_id: jobId, duration_ms: durationMs }).then(res => res.data);
  },
  
  getParts: async () => {
    return api.get('/technician/parts/').then(res => res.data);
  },

  requestPart: async (data: any) => {
    return api.post('/technician/parts/request/', data).then(res => res.data);
  },
};

