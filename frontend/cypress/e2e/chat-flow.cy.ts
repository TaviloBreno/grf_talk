describe('Chat Application E2E Tests', () => {
  beforeEach(() => {
    // Reset database state before each test
    cy.task('db:seed')
    
    // Visit login page
    cy.visit('/auth/signin')
  })

  it('should login successfully with valid credentials', () => {
    // Load test data
    cy.fixture('test-data').then((data) => {
      // Login with test user
      cy.get('[data-testid="email-input"]').type(data.testUser.email)
      cy.get('[data-testid="password-input"]').type(data.testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      // Should redirect to chat page
      cy.url().should('include', '/chat')
      
      // Should display user's name in header
      cy.get('[data-testid="user-menu"]').should('contain', data.testUser.name)
    })
  })

  it('should display chat list after login', () => {
    cy.fixture('test-data').then((data) => {
      // Login
      cy.loginWithAPI(data.testUser.email, data.testUser.password)
      
      // Visit chat page
      cy.visit('/chat')
      
      // Should show chat list
      cy.get('[data-testid="chat-list"]').should('be.visible')
      
      // Should show at least one chat
      cy.get('[data-testid="chat-item"]').should('have.length.at.least', 1)
    })
  })

  it('should send a message in a chat', () => {
    cy.fixture('test-data').then((data) => {
      // Login
      cy.loginWithAPI(data.testUser.email, data.testUser.password)
      
      // Visit chat page
      cy.visit('/chat')
      
      // Wait for chats to load
      cy.get('[data-testid="chat-item"]').first().click()
      
      // Should show chat container
      cy.get('[data-testid="chat-container"]').should('be.visible')
      
      // Type and send message
      const testMessage = `Test message ${Date.now()}`
      cy.get('[data-testid="message-input"]').type(testMessage)
      cy.get('[data-testid="send-button"]').click()
      
      // Should show message in chat
      cy.get('[data-testid="message-item"]')
        .should('contain', testMessage)
        .and('have.attr', 'data-own-message', 'true')
    })
  })

  it('should display real-time messages', () => {
    cy.fixture('test-data').then((data) => {
      // Login
      cy.loginWithAPI(data.testUser.email, data.testUser.password)
      
      // Visit chat page
      cy.visit('/chat')
      
      // Open first chat
      cy.get('[data-testid="chat-item"]').first().click()
      
      // Simulate receiving a message via API
      const testMessage = `Received message ${Date.now()}`
      cy.sendTestMessage('1', testMessage)
      
      // Should show received message
      cy.get('[data-testid="message-item"]')
        .should('contain', testMessage)
        .and('have.attr', 'data-own-message', 'false')
    })
  })

  it('should show user avatar and name in chat header', () => {
    cy.fixture('test-data').then((data) => {
      // Login
      cy.loginWithAPI(data.testUser.email, data.testUser.password)
      
      // Visit chat page  
      cy.visit('/chat')
      
      // Open first chat
      cy.get('[data-testid="chat-item"]').first().click()
      
      // Should show other user's info in header
      cy.get('[data-testid="chat-header"]').within(() => {
        cy.get('[data-testid="participant-avatar"]').should('be.visible')
        cy.get('[data-testid="participant-name"]').should('not.be.empty')
      })
    })
  })

  it('should handle network errors gracefully', () => {
    cy.fixture('test-data').then((data) => {
      // Login
      cy.loginWithAPI(data.testUser.email, data.testUser.password)
      
      // Mock network error
      cy.intercept('GET', '**/api/v1/chats**', { forceNetworkError: true }).as('chatError')
      
      // Visit chat page
      cy.visit('/chat')
      
      // Should show error state
      cy.get('[data-testid="error-message"]')
        .should('be.visible')
        .and('contain', 'Erro ao carregar')
    })
  })

  it('should logout successfully', () => {
    cy.fixture('test-data').then((data) => {
      // Login
      cy.loginWithAPI(data.testUser.email, data.testUser.password)
      
      // Visit chat page
      cy.visit('/chat')
      
      // Click logout
      cy.get('[data-testid="user-menu"]').click()
      cy.get('[data-testid="logout-button"]').click()
      
      // Should redirect to login
      cy.url().should('include', '/auth/signin')
      
      // Should clear local storage
      cy.window().its('localStorage').invoke('getItem', 'auth-token').should('be.null')
    })
  })

  it('should be responsive on mobile devices', () => {
    cy.fixture('test-data').then((data) => {
      // Set mobile viewport
      cy.viewport('iphone-8')
      
      // Login
      cy.loginWithAPI(data.testUser.email, data.testUser.password)
      
      // Visit chat page
      cy.visit('/chat')
      
      // Should show mobile layout
      cy.get('[data-testid="mobile-chat-list"]').should('be.visible')
      
      // Open a chat
      cy.get('[data-testid="chat-item"]').first().click()
      
      // Should show chat container and hide sidebar
      cy.get('[data-testid="chat-container"]').should('be.visible')
      cy.get('[data-testid="chat-list"]').should('not.be.visible')
    })
  })
})