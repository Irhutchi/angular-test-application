/// <reference types="cypress" />

describe('Test with backend', () => {
    beforeEach('login to the app', () => {
        cy.loginToApplication()
    })

    it.only('verify correct request and response', () => {
        // intercept the api call when the publish article button is selected.
        cy.intercept('POST', 'https://api.realworld.io/api/articles/').as('postArticles')
       
        // script to create a new article
        cy.contains('New Article').click()
        cy.get('[formcontrolname="title"]').type('User from Ireland')
        cy.get('[formcontrolname="description"]').type('Breezing through the course')
        cy.get('[formcontrolname="body"]').type('in 2022')
        cy.get('[placeholder="Enter tags"]').type('#learning')
        cy.contains('Publish Article').click()
        // force Cypress to wait for the api call to complete before we start looking into it.
        cy.wait('@postArticles').then( xhr => {
            // asert the xhr obj which contains all the info related to the api call which has the request/repsonse obj.
            console.log(xhr)
            expect(xhr.response.statusCode).to.equal(200)
            expect(xhr.request.body.article.body).to.equal('in 2022')
            expect(xhr.response.body.article.description).to.equal('Breezing through the course')
        })

        // Delete the article to allow the user to run this test again without error
        

    })
})


