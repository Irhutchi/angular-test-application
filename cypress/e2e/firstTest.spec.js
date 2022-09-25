/// <reference types="cypress" />

describe('Test with backend', () => {
    beforeEach('login to the app', () => {
        //adding the stub 'tags.json' to replace real values in the tags api response
        cy.intercept('GET', 'https://api.realworld.io/api/tags', {fixture: 'tags.json'})
        cy.loginToApplication()
    })

    it('verify correct request and response', () => {
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

    it('verify popular tags are displayed', () => {
        cy.log('we logged in')
        // add assertion to ensure the tags.json file contents have been injected into the api response
        cy.get('.tag-list')
        .should('contain', 'cypress')
        .and('contain', 'automation')
        .and('contain', 'testing')
        .and('contain', 'creative')
        .and('contain', 'production')
        .and('contain', 'staging')
    })

    // validate the like button increases when it is clicked
    it.only('verify global feed likes count', () => {
        cy.intercept('GET', 'https://api.realworld.io/api/articles/feed*', {"articles":[],"articlesCount":0} )
        // add the mock articles.json as a stub response to the api call
        cy.intercept('GET', 'https://api.realworld.io/api/articles*', {fixture: 'articles.json'} )

        // click on the global feed
        cy.contains('Global Feed').click()
        // return a list of buttons
        cy.get('app-article-list button').then(heartList => {
            expect(heartList[0]).to.contain('3')
            expect(heartList[1]).to.contain('5')
        })

        
        cy.fixture('articles.json').then(file => {
            const articleLink = file.articles[1].slug
            file.articles[1].favoritesCount = 6

            // intercept favourite api call to provide our own mock response
            cy.intercept('POST', 'https://api.realworld.io/api/articles/'+articleLink+'/favorite', file)
            cy.get('app-article-list button').eq(1).click().should('contain', '6')

        })
    })

    
    

})


