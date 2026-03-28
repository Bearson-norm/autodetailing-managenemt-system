import { snakeToCamel, camelToSnake } from './transform';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      credentials: 'include', // Important for session cookies
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(error.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      // Transform snake_case to camelCase for all responses
      return snakeToCamel(data);
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(username: string, password: string) {
    return this.request<{ user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
  }

  async logout() {
    return this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  }

  async getCurrentUser() {
    return this.request<{ user: any }>('/auth/me');
  }

  // User endpoints
  async getUsers() {
    return this.request<{ users: any[] }>('/users');
  }

  async getWorkers() {
    return this.request<{ workers: any[] }>('/users/workers');
  }

  async createWorker(username: string, password: string, name: string, phone?: string) {
    return this.request<{ worker: any }>('/users/workers', {
      method: 'POST',
      body: JSON.stringify({ username, password, name, phone }),
    });
  }

  async getUser(id: string) {
    return this.request<{ user: any }>(`/users/${id}`);
  }

  async updateUser(id: string, data: { name?: string; phone?: string; language?: string }) {
    return this.request<{ user: any }>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Transaction endpoints
  async getTransactions() {
    return this.request<{ transactions: any[] }>('/transactions');
  }

  async getTransactionsPaginated(page: number = 1, limit: number = 10) {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    return this.request<{
      transactions: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/transactions?${params}`);
  }

  async getTransaction(id: string) {
    return this.request<{ transaction: any }>(`/transactions/${id}`);
  }

  async createTransaction(data: any) {
    // Transform camelCase to snake_case for API
    const apiData = camelToSnake(data);
    return this.request<{ transaction: any; orderNumber: string }>('/transactions', {
      method: 'POST',
      body: JSON.stringify(apiData),
    });
  }

  async updateTransactionStatus(id: string, status: string) {
    return this.request<{ transaction: any }>(`/transactions/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Work order endpoints
  async getWorkOrders() {
    return this.request<{ workOrders: any[] }>('/work-orders');
  }

  async getWorkOrder(id: string) {
    return this.request<{ workOrder: any }>(`/work-orders/${id}`);
  }

  async createWorkOrder(transactionId: string, workerId: string) {
    return this.request<{ workOrder: any; workOrderNumber: string }>('/work-orders', {
      method: 'POST',
      body: JSON.stringify({ transactionId, workerId }),
    });
  }

  async uploadWorkOrderDocuments(id: string, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('files', file);
    });

    const response = await fetch(`${this.baseUrl}/work-orders/${id}/documents`, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  }

  async finishWorkOrder(id: string) {
    return this.request<{ workOrder: any }>(`/work-orders/${id}/finish`, {
      method: 'PUT',
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
