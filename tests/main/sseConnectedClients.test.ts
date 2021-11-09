import assert from 'assert'
import { SseConnectedClients } from '../../src/common/sseConnectedClients'
import { Response } from 'express'

describe('SseConnectedClients', function() {
    it('should add 2 clients', function() {
        const connectedClients = new SseConnectedClients()
        const client = connectedClients.addClient('testAccount', {} as Response)
        connectedClients.addClient('testAccount', {} as Response)
        const arrayOfClients = connectedClients.getClients()
        assert.equal(arrayOfClients.length, 2)

        const foundClient = arrayOfClients.find(c => c.id === client.id)
        assert.equal(foundClient, client)
    })

    it('should remove 1 specific client', function() {
        const connectedClients = new SseConnectedClients()
        const client = connectedClients.addClient('testAccount', {} as Response)
        connectedClients.addClient('testAccount', {} as Response)
        let arrayOfClients = connectedClients.getClients()
        console.log(arrayOfClients)
        assert.equal(arrayOfClients.length, 2)

        connectedClients.removeClient(client)
        arrayOfClients = connectedClients.getClients()
        assert.equal(arrayOfClients.length, 1)
        assert.equal(arrayOfClients.find(c => c.id === client.id), null)
    })
})
