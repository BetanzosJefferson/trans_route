const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
  }

  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token)
    }
  }

  getToken() {
    if (!this.token && typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token')
    }
    return this.token
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token')
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const token = this.getToken()

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Error desconocido' }))
      throw new Error(error.message || `HTTP ${response.status}`)
    }

    return response.json()
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    if (data.access_token) {
      this.setToken(data.access_token)
    }
    return data
  }

  async register(userData: any) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
    if (data.access_token) {
      this.setToken(data.access_token)
    }
    return data
  }

  // Generic CRUD methods
  async get(endpoint: string) {
    return this.request(endpoint)
  }

  async post(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async patch(endpoint: string, data: any) {
    return this.request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    })
  }

  async delete(endpoint: string) {
    return this.request(endpoint, {
      method: 'DELETE',
    })
  }

  // Specific endpoints
  companies = {
    getAll: () => this.get('/companies'),
    getOne: (id: string) => this.get(`/companies/${id}`),
    create: (data: any) => this.post('/companies', data),
    update: (id: string, data: any) => this.patch(`/companies/${id}`, data),
    delete: (id: string) => this.delete(`/companies/${id}`),
  }

  users = {
    getAll: (companyId?: string) => this.get(`/users${companyId ? `?company_id=${companyId}` : ''}`),
    getOne: (id: string) => this.get(`/users/${id}`),
    create: (data: any) => this.post('/users', data),
    update: (id: string, data: any) => this.patch(`/users/${id}`, data),
    delete: (id: string) => this.delete(`/users/${id}`),
  }

  routes = {
    getAll: (companyId: string) => this.get(`/routes?company_id=${companyId}`),
    getOne: (id: string) => this.get(`/routes/${id}`),
    getAllStops: (companyId: string) => this.get(`/routes/stops/all?company_id=${companyId}`),
    create: (data: any) => this.post('/routes', data),
    update: (id: string, data: any) => this.patch(`/routes/${id}`, data),
    delete: (id: string) => this.delete(`/routes/${id}`),
  }

  trips = {
    getAll: (companyId: string, filters?: any) => {
      const params = new URLSearchParams({ company_id: companyId })
      if (filters) {
        Object.keys(filters).forEach((key) => {
          if (filters[key]) params.append(key, filters[key].toString())
        })
      }
      return this.get(`/trips?${params.toString()}`)
    },
    search: (filters: any) => {
      const params = new URLSearchParams()
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString())
        }
      })
      return this.get(`/trips/search?${params.toString()}`)
    },
    getOne: (id: string) => this.get(`/trips/${id}`),
    getSegments: (id: string) => this.get(`/trips/${id}/segments`),
    create: (data: any) => this.post('/trips', data),
    publishMultiple: (data: any) => this.post('/trips/publish-multiple', data),
    update: (id: string, data: any) => this.patch(`/trips/${id}`, data),
    delete: (id: string) => this.delete(`/trips/${id}`),
  }

  reservations = {
    // Listado y búsqueda
    getAll: (filters?: any) => {
      const params = new URLSearchParams()
      if (filters) {
        Object.keys(filters).forEach((key) => {
          const value = filters[key]
          // No adjuntar valores vacíos, undefined o null
          if (value === undefined || value === null) return
          if (typeof value === 'string' && value.trim() === '') return
          params.append(key, value.toString())
        })
      }
      return this.get(`/reservations?${params.toString()}`)
    },
    
    getOne: (id: string) => this.get(`/reservations/${id}`),
    getByTrip: (tripId: string) => this.get(`/reservations/by-trip/${tripId}`),
    
    // Búsqueda de viajes disponibles (Nueva Reserva)
    searchAvailableTrips: (filters: any) => {
      const params = new URLSearchParams()
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params.append(key, filters[key].toString())
        }
      })
      return this.get(`/reservations/search?${params.toString()}`)
    },
    getAvailableOrigins: (companyId: string, dateFrom: string, dateTo: string) => {
      const params = new URLSearchParams({ company_id: companyId, date_from: dateFrom, date_to: dateTo })
      return this.get(`/reservations/origins?${params.toString()}`)
    },
    getAvailableDestinations: (companyId: string, originStopId: string, dateFrom: string, dateTo: string) => {
      const params = new URLSearchParams({ company_id: companyId, origin_stop_id: originStopId, date_from: dateFrom, date_to: dateTo })
      return this.get(`/reservations/destinations?${params.toString()}`)
    },
    
    // CRUD básico
    create: (data: any) => this.post('/reservations', data),
    update: (id: string, data: any) => this.patch(`/reservations/${id}`, data),
    delete: (id: string) => this.delete(`/reservations/${id}`),
    
    // Gestión de caja
    getCashBalance: () => this.get('/reservations/cash-balance'),
    
    // Acciones sobre reservas
    cancelWithRefund: (id: string, data: { refundAmount: number; cancellationReason: string; paymentMethod: string }) => 
      this.post(`/reservations/${id}/cancel`, data),
    addPayment: (id: string, data: { amount: number; paymentMethod: string }) => 
      this.post(`/reservations/${id}/add-payment`, data),
    modifyTrip: (id: string, data: { newTripSegmentId: string }) => 
      this.post(`/reservations/${id}/modify-trip`, data),
    checkIn: (id: string, data?: { notes?: string }) => 
      this.post(`/reservations/${id}/check-in`, data || {}),
    transfer: (id: string, data: { transferredToCompanyId: string; transferNotes?: string }) => 
      this.post(`/reservations/${id}/transfer`, data),
  }

  clients = {
    getAll: (companyId: string) => this.get(`/clients?company_id=${companyId}`),
    getOne: (id: string) => this.get(`/clients/${id}`),
    getByPhone: (phone: string) => this.get(`/clients/phone/${phone}`),
    create: (data: any) => this.post('/clients', data),
    update: (id: string, data: any) => this.patch(`/clients/${id}`, data),
    delete: (id: string) => this.delete(`/clients/${id}`),
  }

  vehicles = {
    getAll: (companyId: string) => this.get(`/vehicles?company_id=${companyId}`),
    getOne: (id: string) => this.get(`/vehicles/${id}`),
    create: (data: any) => this.post('/vehicles', data),
    update: (id: string, data: any) => this.patch(`/vehicles/${id}`, data),
    delete: (id: string) => this.delete(`/vehicles/${id}`),
  }

  transactions = {
    getAll: (companyId: string, filters?: any) => {
      const params = new URLSearchParams({ company_id: companyId, ...filters })
      return this.get(`/transactions?${params}`)
    },
    create: (data: any) => this.post('/transactions', data),
  }

  boxCutoffs = {
    getAll: (companyId: string) => this.get(`/box-cutoffs?company_id=${companyId}`),
    create: (data: any) => this.post('/box-cutoffs', data),
  }

  reports = {
    financial: (companyId: string, fromDate: string, toDate: string) =>
      this.get(`/reports/financial?company_id=${companyId}&from_date=${fromDate}&to_date=${toDate}`),
    sales: (companyId: string, fromDate: string, toDate: string) =>
      this.get(`/reports/sales?company_id=${companyId}&from_date=${fromDate}&to_date=${toDate}`),
  }

  invitations = {
    create: (email?: string) => this.post('/invitations', { email }),
    getAll: () => this.get('/invitations'),
    validate: (token: string) => this.get(`/invitations/validate/${token}`),
    delete: (id: string) => this.delete(`/invitations/${id}`),
  }

  routeTemplates = {
    getAll: (companyId: string) => this.get(`/route-templates?company_id=${companyId}`),
    getByRoute: (routeId: string) => this.get(`/route-templates/by-route/${routeId}`),
    getOne: (id: string) => this.get(`/route-templates/${id}`),
    create: (data: any) => this.post('/route-templates', data),
    update: (id: string, data: any) => this.patch(`/route-templates/${id}`, data),
    delete: (id: string) => this.delete(`/route-templates/${id}`),
    getCombinations: (routeId: string) => this.get(`/route-templates/route/${routeId}/combinations`),
  }

  async registerByInvitation(data: any) {
    const response = await this.request('/auth/register-by-invitation', {
      method: 'POST',
      body: JSON.stringify(data),
    })
    if (response.access_token) {
      this.setToken(response.access_token)
    }
    return response
  }
}

export const api = new ApiClient(API_URL)

