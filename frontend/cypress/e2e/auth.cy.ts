describe('Authentication E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/auth/signin')
  })

  it('should display login form correctly', () => {
    // Check if all form elements are present
    cy.get('[data-testid="email-input"]').should('be.visible')
    cy.get('[data-testid="password-input"]').should('be.visible')
    cy.get('[data-testid="login-button"]').should('be.visible')
    
    // Check form labels and placeholders
    cy.get('[data-testid="email-input"]').should('have.attr', 'placeholder')
    cy.get('[data-testid="password-input"]').should('have.attr', 'type', 'password')
  })

  it('should show validation errors for invalid inputs', () => {
    // Try to login with empty fields
    cy.get('[data-testid="login-button"]').click()
    
    // Should show validation errors
    cy.get('[data-testid="email-error"]').should('be.visible')
    cy.get('[data-testid="password-error"]').should('be.visible')
    
    // Try with invalid email format
    cy.get('[data-testid="email-input"]').type('invalid-email')
    cy.get('[data-testid="login-button"]').click()
    cy.get('[data-testid="email-error"]').should('contain', 'Email inválido')
  })

  it('should show error for invalid credentials', () => {
    // Try login with wrong credentials
    cy.get('[data-testid="email-input"]').type('wrong@example.com')
    cy.get('[data-testid="password-input"]').type('wrongpassword')
    cy.get('[data-testid="login-button"]').click()
    
    // Should show error message
    cy.get('[data-testid="login-error"]')
      .should('be.visible')
      .and('contain', 'Credenciais inválidas')
  })

  it('should login successfully with valid credentials', () => {
    cy.fixture('test-data').then((data) => {
      // Enter valid credentials
      cy.get('[data-testid="email-input"]').type(data.testUser.email)
      cy.get('[data-testid="password-input"]').type(data.testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      // Should redirect to chat page
      cy.url().should('include', '/chat')
      
      // Should set auth token in localStorage
      cy.window().its('localStorage')
        .invoke('getItem', 'auth-token')
        .should('not.be.null')
    })
  })

  it('should show loading state during login', () => {
    cy.fixture('test-data').then((data) => {
      // Intercept login request with delay
      cy.intercept('POST', '**/auth/login/', {
        delay: 1000,
        statusCode: 200,
        body: { success: true }
      }).as('loginRequest')
      
      // Enter credentials and submit
      cy.get('[data-testid="email-input"]').type(data.testUser.email)
      cy.get('[data-testid="password-input"]').type(data.testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      // Should show loading state
      cy.get('[data-testid="login-button"]')
        .should('be.disabled')
        .and('contain', 'Entrando...')
      
      // Wait for request to complete
      cy.wait('@loginRequest')
    })
  })

  it('should remember me functionality', () => {
    cy.fixture('test-data').then((data) => {
      // Enable remember me
      cy.get('[data-testid="remember-me-checkbox"]').check()
      
      // Login
      cy.get('[data-testid="email-input"]').type(data.testUser.email)
      cy.get('[data-testid="password-input"]').type(data.testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      // Should set long-term token
      cy.window().its('localStorage')
        .invoke('getItem', 'remember-token')
        .should('not.be.null')
    })
  })

  it('should redirect authenticated users away from login', () => {
    cy.fixture('test-data').then((data) => {
      // Login via API
      cy.loginWithAPI(data.testUser.email, data.testUser.password)
      
      // Try to visit login page
      cy.visit('/auth/signin')
      
      // Should redirect to chat page
      cy.url().should('include', '/chat')
    })
  })

  it('should handle network errors during login', () => {
    // Mock network error
    cy.intercept('POST', '**/auth/login/', { forceNetworkError: true }).as('loginError')
    
    cy.fixture('test-data').then((data) => {
      // Try to login
      cy.get('[data-testid="email-input"]').type(data.testUser.email)
      cy.get('[data-testid="password-input"]').type(data.testUser.password)
      cy.get('[data-testid="login-button"]').click()
      
      // Should show network error
      cy.get('[data-testid="login-error"]')
        .should('be.visible')
        .and('contain', 'Erro de conexão')
    })
  })
})