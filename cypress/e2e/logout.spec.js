/// <reference types="cypress" />

describe('Test log out functionality', () => {
    beforeEach('login to the app', () => {
        cy.loginToApplication()
    })

    it('verify use can log out successfully', () => {
        cy.contains('Settings').click()
        cy.contains('Or click here to logout').click()
        cy.get(".nav-link").should('contain', 'Sign')
    })
})

