// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Login via UI
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('/auth/signin')
  cy.get('[data-testid="email-input"]').type(email)
  cy.get('[data-testid="password-input"]').type(password)
  cy.get('[data-testid="login-button"]').click()
  cy.url().should('not.include', '/auth/signin')
})

// Login via API (faster for tests)
Cypress.Commands.add('loginWithAPI', (email: string, password: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/login/`,
    body: {
      email,
      password
    }
  }).then((response) => {
    expect(response.status).to.eq(200)
    
    // Set the access token in localStorage
    window.localStorage.setItem('auth-token', response.body.access_token)
    
    // Set the auth state in localStorage
    const authState = {
      user: response.body.user,
      token: response.body.access_token,
      isAuthenticated: true
    }
    window.localStorage.setItem('auth-storage', JSON.stringify(authState))
  })
})

// Logout
Cypress.Commands.add('logout', () => {
  cy.window().then((win) => {
    win.localStorage.removeItem('auth-token')
    win.localStorage.removeItem('auth-storage')
  })
  cy.visit('/auth/signin')
})

// Create test user via API
Cypress.Commands.add('createTestUser', () => {
  const email = `test-${Date.now()}@example.com`
  const password = 'testpass123'
  const name = `Test User ${Date.now()}`
  
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/auth/register/`,
    body: {
      email,
      password,
      name
    }
  }).then((response) => {
    expect(response.status).to.eq(201)
    return { email, password, name, user: response.body.user }
  })
})

// Create test chat via API
Cypress.Commands.add('createTestChat', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/chats/`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('auth-token')}`
    },
    body: {
      email: 'test@example.com' // Create chat with test user
    }
  }).then((response) => {
    expect(response.status).to.eq(201)
    return response.body
  })
})

// Send test message via API
Cypress.Commands.add('sendTestMessage', (chatId: string, message: string) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('API_URL')}/chats/${chatId}/messages/`,
    headers: {
      'Authorization': `Bearer ${window.localStorage.getItem('auth-token')}`
    },
    body: {
      body: message
    }
  }).then((response) => {
    expect(response.status).to.eq(201)
    return response.body
  })
})

// Wait for WebSocket connection
Cypress.Commands.add('waitForWebSocket', () => {
  cy.window().its('WebSocket').should('exist')
  cy.wait(1000) // Give time for connection to establish
})

// Mock API responses
Cypress.Commands.add('mockAPI', (method: string, url: string, response: any) => {
  cy.intercept(method as any, url, response).as('mockedAPI')
})