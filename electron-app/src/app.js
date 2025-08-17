let currentEditingClient = null;
let clients = [];
let cases = [];

// Navigation
function showSection(sectionName) {
  document.querySelectorAll('.content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.nav button').forEach(el => el.classList.remove('active'));
  
  document.getElementById(sectionName).classList.add('active');
  event.target.classList.add('active');
  
  // Load data when switching sections
  switch(sectionName) {
    case 'clients':
      loadClients();
      break;
    case 'cases':
      loadCases();
      loadClientsForSelect();
      break;
    case 'time':
      loadTimeEntries();
      loadClientsForSelect();
      break;
    case 'documents':
      loadDocuments();
      loadClientsForDocuments();
      break;
    case 'invoices':
      loadInvoices();
      loadClientsForInvoices();
      break;
  }
}

// Clients
async function loadClients() {
  try {
    clients = await api.getClients();
    renderClientsTable();
  } catch (error) {
    alert('Failed to load clients: ' + error.message);
  }
}

function renderClientsTable() {
  const tbody = document.querySelector('#clients-table tbody');
  tbody.innerHTML = '';
  
  clients.forEach(client => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${client.name}</td>
      <td>${client.email || ''}</td>
      <td>${client.phone || ''}</td>
      <td>$${client.billing_rate || 0}</td>
      <td>
        <button class="btn" onclick="editClient(${client.id})">Edit</button>
        <button class="btn btn-danger" onclick="deleteClient(${client.id})">Delete</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showClientForm() {
  document.getElementById('client-form').style.display = 'block';
  clearClientForm();
}

function cancelClientForm() {
  document.getElementById('client-form').style.display = 'none';
  currentEditingClient = null;
}

function clearClientForm() {
  document.getElementById('client-name').value = '';
  document.getElementById('client-email').value = '';
  document.getElementById('client-phone').value = '';
  document.getElementById('client-address').value = '';
  document.getElementById('client-rate').value = '';
}

function editClient(id) {
  const client = clients.find(c => c.id === id);
  if (client) {
    currentEditingClient = id;
    document.getElementById('client-name').value = client.name;
    document.getElementById('client-email').value = client.email || '';
    document.getElementById('client-phone').value = client.phone || '';
    document.getElementById('client-address').value = client.address || '';
    document.getElementById('client-rate').value = client.billing_rate || '';
    showClientForm();
  }
}

async function saveClient() {
  const clientData = {
    name: document.getElementById('client-name').value,
    email: document.getElementById('client-email').value,
    phone: document.getElementById('client-phone').value,
    address: document.getElementById('client-address').value,
    billing_rate: parseFloat(document.getElementById('client-rate').value) || 0
  };

  try {
    if (currentEditingClient) {
      await api.updateClient(currentEditingClient, clientData);
    } else {
      await api.createClient(clientData);
    }
    cancelClientForm();
    loadClients();
  } catch (error) {
    alert('Failed to save client: ' + error.message);
  }
}

async function deleteClient(id) {
  if (confirm('Are you sure you want to delete this client?')) {
    try {
      await api.deleteClient(id);
      loadClients();
    } catch (error) {
      alert('Failed to delete client: ' + error.message);
    }
  }
}

// Cases
async function loadCases() {
  try {
    cases = await api.getCases();
    renderCasesTable();
  } catch (error) {
    alert('Failed to load cases: ' + error.message);
  }
}

function renderCasesTable() {
  const tbody = document.querySelector('#cases-table tbody');
  tbody.innerHTML = '';
  
  cases.forEach(case_ => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${case_.case_number || ''}</td>
      <td>${case_.title}</td>
      <td>${case_.client_name}</td>
      <td>${case_.status}</td>
      <td>${new Date(case_.created_at).toLocaleDateString()}</td>
    `;
    tbody.appendChild(row);
  });
}

async function loadClientsForSelect() {
  if (clients.length === 0) {
    clients = await api.getClients();
  }
  
  const selects = ['case-client', 'time-client'];
  selects.forEach(selectId => {
    const select = document.getElementById(selectId);
    if (select) {
      select.innerHTML = '<option value="">Select Client</option>';
      clients.forEach(client => {
        select.innerHTML += `<option value="${client.id}">${client.name}</option>`;
      });
    }
  });
}

function showCaseForm() {
  document.getElementById('case-form').style.display = 'block';
  clearCaseForm();
}

function cancelCaseForm() {
  document.getElementById('case-form').style.display = 'none';
}

function clearCaseForm() {
  document.getElementById('case-client').value = '';
  document.getElementById('case-number').value = '';
  document.getElementById('case-title').value = '';
  document.getElementById('case-description').value = '';
}

async function saveCase() {
  const caseData = {
    client_id: parseInt(document.getElementById('case-client').value),
    case_number: document.getElementById('case-number').value,
    title: document.getElementById('case-title').value,
    description: document.getElementById('case-description').value
  };

  try {
    await api.createCase(caseData);
    cancelCaseForm();
    loadCases();
  } catch (error) {
    alert('Failed to save case: ' + error.message);
  }
}

// Time Tracking
async function loadTimeEntries() {
  try {
    const timeEntries = await api.getTimeEntries();
    renderTimeTable(timeEntries);
  } catch (error) {
    alert('Failed to load time entries: ' + error.message);
  }
}

function renderTimeTable(timeEntries) {
  const tbody = document.querySelector('#time-table tbody');
  tbody.innerHTML = '';
  
  timeEntries.forEach(entry => {
    const row = document.createElement('tr');
    const total = (entry.hours * entry.rate).toFixed(2);
    row.innerHTML = `
      <td>${new Date(entry.date).toLocaleDateString()}</td>
      <td>${entry.client_name}</td>
      <td>${entry.case_title || 'N/A'}</td>
      <td>${entry.description}</td>
      <td>${entry.hours}</td>
      <td>$${entry.rate}</td>
      <td>$${total}</td>
    `;
    tbody.appendChild(row);
  });
}

function showTimeForm() {
  document.getElementById('time-form').style.display = 'block';
  clearTimeForm();
  document.getElementById('time-date').value = new Date().toISOString().split('T')[0];
}

function cancelTimeForm() {
  document.getElementById('time-form').style.display = 'none';
}

function clearTimeForm() {
  document.getElementById('time-client').value = '';
  document.getElementById('time-case').value = '';
  document.getElementById('time-description').value = '';
  document.getElementById('time-hours').value = '';
  document.getElementById('time-rate').value = '';
  document.getElementById('time-date').value = '';
}

// Update case dropdown when client changes
document.getElementById('time-client').addEventListener('change', async function() {
  const clientId = this.value;
  const caseSelect = document.getElementById('time-case');
  caseSelect.innerHTML = '<option value="">Select Case (Optional)</option>';
  
  if (clientId) {
    try {
      const clientCases = await api.getCasesByClient(clientId);
      clientCases.forEach(case_ => {
        caseSelect.innerHTML += `<option value="${case_.id}">${case_.title}</option>`;
      });
      
      // Set default rate from client
      const client = clients.find(c => c.id == clientId);
      if (client && client.billing_rate) {
        document.getElementById('time-rate').value = client.billing_rate;
      }
    } catch (error) {
      console.error('Failed to load cases for client:', error);
    }
  }
});

async function saveTimeEntry() {
  const timeData = {
    client_id: parseInt(document.getElementById('time-client').value),
    case_id: document.getElementById('time-case').value ? parseInt(document.getElementById('time-case').value) : null,
    description: document.getElementById('time-description').value,
    hours: parseFloat(document.getElementById('time-hours').value),
    rate: parseFloat(document.getElementById('time-rate').value),
    date: document.getElementById('time-date').value
  };

  try {
    await api.createTimeEntry(timeData);
    cancelTimeForm();
    loadTimeEntries();
  } catch (error) {
    alert('Failed to save time entry: ' + error.message);
  }
}

// Documents
let currentEditingDocument = null;
let documents = [];

async function loadDocuments() {
  try {
    documents = await api.getDocuments();
    renderDocumentsTable();
  } catch (error) {
    alert('Failed to load documents: ' + error.message);
  }
}

function renderDocumentsTable() {
  const tbody = document.querySelector('#documents-table tbody');
  tbody.innerHTML = '';
  
  documents.forEach(doc => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${doc.title}</td>
      <td>${doc.client_name || 'N/A'}</td>
      <td>${doc.case_title || 'N/A'}</td>
      <td>${doc.type}</td>
      <td>${new Date(doc.updated_at).toLocaleDateString()}</td>
      <td>
        <button class="btn" onclick="editDocument(${doc.id})">Edit</button>
        <button class="btn" onclick="generateDocumentPDF(${doc.id})">PDF</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showDocumentForm() {
  document.getElementById('document-form').style.display = 'block';
  document.getElementById('document-form-title').textContent = 'Create Document';
  clearDocumentForm();
  loadClientsForDocuments();
  loadTemplatesForDocuments();
}

function cancelDocumentForm() {
  document.getElementById('document-form').style.display = 'none';
  document.getElementById('doc-preview').style.display = 'none';
  currentEditingDocument = null;
}

function clearDocumentForm() {
  document.getElementById('doc-client').value = '';
  document.getElementById('doc-case').value = '';
  document.getElementById('doc-title').value = '';
  document.getElementById('doc-template').value = '';
  document.getElementById('doc-content').value = '';
  document.getElementById('pdf-btn').style.display = 'none';
}

async function loadClientsForDocuments() {
  if (clients.length === 0) {
    clients = await api.getClients();
  }
  
  const select = document.getElementById('doc-client');
  select.innerHTML = '<option value="">Select Client</option>';
  clients.forEach(client => {
    select.innerHTML += `<option value="${client.id}">${client.name}</option>`;
  });
}

async function loadTemplatesForDocuments() {
  try {
    const templates = await api.getTemplates();
    const select = document.getElementById('doc-template');
    select.innerHTML = '<option value="">Start from scratch</option>';
    templates.forEach(template => {
      select.innerHTML += `<option value="${template.id}">${template.name}</option>`;
    });
  } catch (error) {
    console.error('Failed to load templates:', error);
  }
}

async function loadTemplate() {
  const templateId = document.getElementById('doc-template').value;
  if (!templateId) {
    return;
  }
  
  try {
    const template = await api.getTemplate(templateId);
    document.getElementById('doc-content').value = template.content;
    
    // Auto-populate title if empty
    const titleField = document.getElementById('doc-title');
    if (!titleField.value) {
      const templateName = document.getElementById('doc-template').selectedOptions[0].text;
      titleField.value = templateName;
    }
  } catch (error) {
    alert('Failed to load template: ' + error.message);
  }
}

// Update case dropdown when client changes for documents
document.getElementById('doc-client').addEventListener('change', async function() {
  const clientId = this.value;
  const caseSelect = document.getElementById('doc-case');
  caseSelect.innerHTML = '<option value="">Select Case (Optional)</option>';
  
  if (clientId) {
    try {
      const clientCases = await api.getCasesByClient(clientId);
      clientCases.forEach(case_ => {
        caseSelect.innerHTML += `<option value="${case_.id}">${case_.title}</option>`;
      });
    } catch (error) {
      console.error('Failed to load cases for client:', error);
    }
  }
});

async function editDocument(id) {
  try {
    const doc = await api.getDocumentContent(id);
    currentEditingDocument = id;
    
    document.getElementById('document-form-title').textContent = 'Edit Document';
    document.getElementById('doc-title').value = doc.title;
    document.getElementById('doc-content').value = doc.content;
    document.getElementById('pdf-btn').style.display = 'inline-block';
    
    await loadClientsForDocuments();
    await loadTemplatesForDocuments();
    document.getElementById('doc-client').value = doc.client_id;
    
    // Load cases for selected client
    if (doc.client_id) {
      const clientCases = await api.getCasesByClient(doc.client_id);
      const caseSelect = document.getElementById('doc-case');
      caseSelect.innerHTML = '<option value="">Select Case (Optional)</option>';
      clientCases.forEach(case_ => {
        caseSelect.innerHTML += `<option value="${case_.id}">${case_.title}</option>`;
      });
      if (doc.case_id) {
        caseSelect.value = doc.case_id;
      }
    }
    
    showDocumentForm();
  } catch (error) {
    alert('Failed to load document: ' + error.message);
  }
}

async function saveDocument() {
  const docData = {
    client_id: parseInt(document.getElementById('doc-client').value),
    case_id: document.getElementById('doc-case').value ? parseInt(document.getElementById('doc-case').value) : null,
    title: document.getElementById('doc-title').value,
    content: document.getElementById('doc-content').value
  };

  try {
    if (currentEditingDocument) {
      await api.updateDocument(currentEditingDocument, docData);
    } else {
      await api.createDocument(docData);
    }
    cancelDocumentForm();
    loadDocuments();
  } catch (error) {
    alert('Failed to save document: ' + error.message);
  }
}

function previewDocument() {
  const content = document.getElementById('doc-content').value;
  const preview = document.getElementById('doc-preview');
  
  // Simple markdown to HTML conversion
  let html = content
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/\n/gim, '<br>');
  
  preview.innerHTML = html;
  preview.style.display = 'block';
}

async function generateDocumentPDF(docId = null) {
  const id = docId || currentEditingDocument;
  if (!id) {
    alert('Please save the document first');
    return;
  }
  
  try {
    const result = await api.generatePDF(id);
    alert('PDF generated successfully: ' + result.pdf_path);
  } catch (error) {
    alert('Failed to generate PDF: ' + error.message);
  }
}

// Invoices
let invoices = [];
let unbilledTimeEntries = [];

async function loadInvoices() {
  try {
    invoices = await api.getInvoices();
    renderInvoicesTable();
  } catch (error) {
    alert('Failed to load invoices: ' + error.message);
  }
}

function renderInvoicesTable() {
  const tbody = document.querySelector('#invoices-table tbody');
  tbody.innerHTML = '';
  
  invoices.forEach(invoice => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${invoice.invoice_number}</td>
      <td>${invoice.client_name}</td>
      <td>$${invoice.total.toFixed(2)}</td>
      <td>
        <select onchange="updateInvoiceStatus(${invoice.id}, this.value)">
          <option value="draft" ${invoice.status === 'draft' ? 'selected' : ''}>Draft</option>
          <option value="sent" ${invoice.status === 'sent' ? 'selected' : ''}>Sent</option>
          <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''}>Paid</option>
        </select>
      </td>
      <td>${new Date(invoice.created_at).toLocaleDateString()}</td>
      <td>${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</td>
      <td>
        <button class="btn" onclick="viewInvoiceDetails(${invoice.id})">View</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

function showInvoiceGenerator() {
  document.getElementById('invoice-generator').style.display = 'block';
  loadClientsForInvoices();
  
  // Set default due date to 30 days from now
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30);
  document.getElementById('invoice-due-date').value = dueDate.toISOString().split('T')[0];
}

function cancelInvoiceGenerator() {
  document.getElementById('invoice-generator').style.display = 'none';
  document.getElementById('unbilled-time').style.display = 'none';
  clearInvoiceForm();
}

function clearInvoiceForm() {
  document.getElementById('invoice-client').value = '';
  document.getElementById('invoice-due-date').value = '';
  document.querySelector('#unbilled-table tbody').innerHTML = '';
  document.getElementById('selected-total').textContent = '0.00';
}

async function loadClientsForInvoices() {
  if (clients.length === 0) {
    clients = await api.getClients();
  }
  
  const select = document.getElementById('invoice-client');
  select.innerHTML = '<option value="">Select Client</option>';
  clients.forEach(client => {
    select.innerHTML += `<option value="${client.id}">${client.name}</option>`;
  });
}

async function loadUnbilledTime() {
  const clientId = document.getElementById('invoice-client').value;
  if (!clientId) {
    document.getElementById('unbilled-time').style.display = 'none';
    return;
  }
  
  try {
    unbilledTimeEntries = await api.getUnbilledTime(clientId);
    renderUnbilledTimeTable();
    document.getElementById('unbilled-time').style.display = 'block';
  } catch (error) {
    alert('Failed to load unbilled time: ' + error.message);
  }
}

function renderUnbilledTimeTable() {
  const tbody = document.querySelector('#unbilled-table tbody');
  tbody.innerHTML = '';
  
  unbilledTimeEntries.forEach(entry => {
    const amount = (entry.hours * entry.rate).toFixed(2);
    const row = document.createElement('tr');
    row.innerHTML = `
      <td><input type="checkbox" value="${entry.id}" onchange="updateSelectedTotal()"></td>
      <td>${new Date(entry.date).toLocaleDateString()}</td>
      <td>${entry.description}</td>
      <td>${entry.hours}</td>
      <td>$${entry.rate}</td>
      <td>$${amount}</td>
    `;
    tbody.appendChild(row);
  });
}

function toggleAllTimeEntries(checkbox) {
  const checkboxes = document.querySelectorAll('#unbilled-table tbody input[type="checkbox"]');
  checkboxes.forEach(cb => {
    cb.checked = checkbox.checked;
  });
  updateSelectedTotal();
}

function updateSelectedTotal() {
  const checkboxes = document.querySelectorAll('#unbilled-table tbody input[type="checkbox"]:checked');
  let total = 0;
  
  checkboxes.forEach(cb => {
    const entry = unbilledTimeEntries.find(e => e.id == cb.value);
    if (entry) {
      total += entry.hours * entry.rate;
    }
  });
  
  document.getElementById('selected-total').textContent = total.toFixed(2);
}

async function generateInvoice() {
  const clientId = document.getElementById('invoice-client').value;
  const dueDate = document.getElementById('invoice-due-date').value;
  const selectedCheckboxes = document.querySelectorAll('#unbilled-table tbody input[type="checkbox"]:checked');
  
  if (!clientId || selectedCheckboxes.length === 0) {
    alert('Please select a client and at least one time entry');
    return;
  }
  
  const timeEntryIds = Array.from(selectedCheckboxes).map(cb => parseInt(cb.value));
  
  try {
    const result = await api.generateInvoice({
      client_id: parseInt(clientId),
      time_entry_ids: timeEntryIds,
      due_date: dueDate
    });
    
    alert(`Invoice ${result.invoice_number} generated successfully!`);
    cancelInvoiceGenerator();
    loadInvoices();
  } catch (error) {
    alert('Failed to generate invoice: ' + error.message);
  }
}

async function updateInvoiceStatus(invoiceId, status) {
  try {
    await api.updateInvoiceStatus(invoiceId, status);
    loadInvoices();
  } catch (error) {
    alert('Failed to update invoice status: ' + error.message);
  }
}

async function viewInvoiceDetails(invoiceId) {
  try {
    const invoice = await api.getInvoiceDetails(invoiceId);
    renderInvoiceDetails(invoice);
    document.getElementById('invoice-modal').style.display = 'block';
  } catch (error) {
    alert('Failed to load invoice details: ' + error.message);
  }
}

function renderInvoiceDetails(invoice) {
  const detailsDiv = document.getElementById('invoice-details');
  
  let itemsHtml = '';
  let total = 0;
  
  invoice.items.forEach(item => {
    itemsHtml += `
      <tr>
        <td>${item.description}</td>
        <td>${item.hours}</td>
        <td>$${item.rate}</td>
        <td>$${item.amount.toFixed(2)}</td>
      </tr>
    `;
    total += item.amount;
  });
  
  detailsDiv.innerHTML = `
    <div style="margin-bottom: 20px;">
      <h4>Invoice: ${invoice.invoice_number}</h4>
      <p><strong>Client:</strong> ${invoice.client_name}</p>
      <p><strong>Status:</strong> ${invoice.status}</p>
      <p><strong>Created:</strong> ${new Date(invoice.created_at).toLocaleDateString()}</p>
      <p><strong>Due Date:</strong> ${invoice.due_date ? new Date(invoice.due_date).toLocaleDateString() : 'N/A'}</p>
    </div>
    
    <table style="width: 100%; border-collapse: collapse;">
      <thead>
        <tr style="background: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px;">Description</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Hours</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Rate</th>
          <th style="border: 1px solid #ddd; padding: 8px;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
      <tfoot>
        <tr style="font-weight: bold;">
          <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total:</td>
          <td style="border: 1px solid #ddd; padding: 8px;">$${total.toFixed(2)}</td>
        </tr>
      </tfoot>
    </table>
  `;
}

function closeInvoiceModal() {
  document.getElementById('invoice-modal').style.display = 'none';
}

// Current user state
let currentUser = null;

// Authentication functions
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('login-username').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const user = await api.login({ username, password });
    currentUser = user;
    showMainApp();
  } catch (error) {
    alert('Login failed: ' + error.message);
  }
}

function quickLogin(username, password) {
  document.getElementById('login-username').value = username;
  document.getElementById('login-password').value = password;
  document.querySelector('#login-screen form').dispatchEvent(new Event('submit'));
}

function showMainApp() {
  document.getElementById('login-screen').style.display = 'none';
  document.getElementById('main-app').style.display = 'block';
  
  // Update user info
  document.getElementById('current-user').textContent = 
    `${currentUser.full_name} (${currentUser.role})`;
  
  // Load initial data
  loadClients();
  
  // Apply role-based restrictions
  applyRoleRestrictions();
}

function applyRoleRestrictions() {
  // For demo purposes, show different access levels
  if (currentUser.role === 'paralegal') {
    // Hide some buttons for paralegal role
    const restrictedButtons = document.querySelectorAll('.btn-danger');
    restrictedButtons.forEach(btn => {
      if (btn.textContent.includes('Delete')) {
        btn.style.display = 'none';
      }
    });
    
    // Add visual indicator
    document.querySelector('.user-info').innerHTML += 
      '<span style="color: orange; font-size: 12px;">(Limited Access)</span>';
  }
}

async function handleLogout() {
  try {
    await api.logout();
  } catch (error) {
    console.error('Logout error:', error);
  }
  
  currentUser = null;
  document.getElementById('login-screen').style.display = 'block';
  document.getElementById('main-app').style.display = 'none';
  
  // Clear form
  document.getElementById('login-username').value = '';
  document.getElementById('login-password').value = '';
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  // Show login screen first
  document.getElementById('login-screen').style.display = 'block';
  document.getElementById('main-app').style.display = 'none';
});