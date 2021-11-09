import assert from 'assert'
import { SseConnectedClients, EventNames } from '../../src/common/sseConnectedClients'
import { Response } from 'express'

describe('SseConnectedClients', function() {
    it('should add 2 clients', function() {
        const environment = 'test'
        const connectedClients = new SseConnectedClients()
        const client = connectedClients.addClient('testAccount', {} as Response, environment)
        connectedClients.addClient('testAccount', {} as Response, environment)
        const arrayOfClients = connectedClients.getClients()
        assert.equal(arrayOfClients.length, 2)

        const foundClient = arrayOfClients.find(c => c.id === client.id)
        assert.equal(foundClient, client)
    })

    it('should remove 1 specific client', function() {
        const environment = 'test'
        const connectedClients = new SseConnectedClients()
        const client = connectedClients.addClient('testAccount', {} as Response, environment)
        connectedClients.addClient('testAccount', {} as Response, environment)
        let arrayOfClients = connectedClients.getClients()
        assert.equal(arrayOfClients.length, 2)

        connectedClients.removeClient(client)
        arrayOfClients = connectedClients.getClients()
        assert.equal(arrayOfClients.length, 1)
        assert.equal(arrayOfClients.find(c => c.id === client.id), null)
    })

    it('should receive a clientAdded event', function(done) {
        this.timeout(2000)
        const testAccount = 'testAccount'
        const connectedClients = new SseConnectedClients()
        connectedClients.addListener(EventNames.CLIENT_ADDED, function (cclient) {
            assert.equal(cclient.accountId, testAccount)
            assert.equal(cclient.environment, 'test')
            done()
        })
        connectedClients.addClient(testAccount, {} as Response, 'test')
    })
})
