/// <reference types="cypress" />

describe('Test with backend', () => {
    beforeEach('login to the app', () => {
        // listen for GET request with 'tag' in the path name of the URL
        cy.intercept({method: 'Get', path:'tags'}, {fixture: 'tags.json'})
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

    it('intercepting and modyfing the req and resp', () => {
        // intercept the api call when the publish article button is selected.
        // cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) =>{
        //     req.body.article.description = "Breezing through the course 2"
        // }).as('postArticles')

        // intercept response from the server
        cy.intercept('POST', 'https://api.realworld.io/api/articles/', (req) =>{
            req.reply( res => {
                expect(res.body.article.description).to.equal('Breezing through the course')
                // modify res and send back to the browser
                res.body.article.description = "Breezing through the course 2"
            })
        }).as('postArticles')
       
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
            expect(xhr.response.body.article.description).to.equal('Breezing through the course 2')
        })

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
    it('verify global feed likes count', () => {
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

    // Delete a new article
    it.only('delete a new article in a global feed', () => {

        const userCredentials = {
            "user": {
                "email": "artem.bondar16@gmail.com",
                "password": "CypressTest1"
            }
        }

        const bodyRequest = {
            "article": {
                "tagList": [],
                "title": "Api request 0.21",
                "description": "Hackathon 2022",
                "body": "Angular is awesome"
            }
        }

        // get access token using api request
        cy.request('POST', 'https://api.realworld.io/api/users/login', userCredentials)
        .its('body').then(body => {

            const token = body.user.token


            // post request to create a new article
            // provide the obj as a param for the cy request
            cy.request({
                url: 'https://api.realworld.io/api/articles/?',
                headers: {'Authorization': 'Token '+token}, // grab the access token from the 1st request
                method: 'POST',
                body: bodyRequest
            }).then( response => {
                expect(response.status).to.equal(200)
            })


            cy.contains('Global Feed').click()
            cy.get('.article-preview').first().click()
            cy.get('.article-actions').contains('Delete Article').click()

            // verify article was successfully deleted

            // need to provide auth token again, use onj again 
            cy.request({
                url: 'https://api.realworld.io/api/articles?limit=10&offset=0',
                headers: { 'Authorization': 'Token '+token},
                method: 'GET'
            }).its('body').then( body => {
                expect(body.articles[0].title).not.to.equal('Api request 0.21')
            })
        })

    }) 
    

})


