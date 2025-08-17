const API_BASE = 'http://localhost:3001/api';

class ApiService {
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Clients
  async getClients() {
    return this.request('/clients');
  }

  async createClient(client) {
    return this.request('/clients', {
      method: 'POST',
      body: JSON.stringify(client)
    });
  }

  async updateClient(id, client) {
    return this.request(`/clients/${id}`, {
      method: 'PUT',
      body: JSON.stringify(client)
    });
  }

  async deleteClient(id) {
    return this.request(`/clients/${id}`, {
      method: 'DELETE'
    });
  }

  // Cases
  async getCases() {
    return this.request('/cases');
  }

  async getCasesByClient(clientId) {
    return this.request(`/cases/client/${clientId}`);
  }

  async createCase(caseData) {
    return this.request('/cases', {
      method: 'POST',
      body: JSON.stringify(caseData)
    });
  }

  // Documents
  async getDocuments() {
    return this.request('/documents');
  }

  async getDocumentContent(id) {
    return this.request(`/documents/${id}/content`);
  }

  async createDocument(document) {
    return this.request('/documents', {
      method: 'POST',
      body: JSON.stringify(document)
    });
  }

  async updateDocument(id, document) {
    return this.request(`/documents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(document)
    });
  }

  async generatePDF(id) {
    return this.request(`/documents/${id}/pdf`, {
      method: 'POST'
    });
  }

  // Time entries
  async getTimeEntries() {
    return this.request('/time');
  }

  async createTimeEntry(timeEntry) {
    return this.request('/time', {
      method: 'POST',
      body: JSON.stringify(timeEntry)
    });
  }

  // Invoices
  async getInvoices() {
    return this.request('/invoices');
  }

  async getUnbilledTime(clientId) {
    return this.request(`/invoices/unbilled/${clientId}`);
  }

  async generateInvoice(invoiceData) {
    return this.request('/invoices/generate', {
      method: 'POST',
      body: JSON.stringify(invoiceData)
    });
  }

  async getInvoiceDetails(id) {
    return this.request(`/invoices/${id}/details`);
  }

  async updateInvoiceStatus(id, status) {
    return this.request(`/invoices/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    });
  }

  // Templates
  async getTemplates() {
    return this.request('/templates');
  }

  async getTemplate(id) {
    return this.request(`/templates/${id}`);
  }

  // Health check
  async checkHealth() {
    return this.request('/health');
  }
}

const api = new ApiService();