import assert from 'assert'
import { SseConnectedClients, EventNames } from '../../src/common/sseConnectedClients'
import { SseToggleService } from '../../src/services/sseToggle'
import { Response } from 'express'
import { DatabaseConnection } from '../../src/db/db'

describe('SseToggleService db', function() {
    it('should receive full environment toggles', function(done) {
        this.timeout(2000)
        const connectedClients = new SseConnectedClients()
        const conn = new DatabaseConnection()
        conn.connect()
            .then(() => {
                // Something is happening inside SseToggleService that listens to clientAdded event
                const service = new SseToggleService(conn, connectedClients)
                const client = connectedClients.addClient(
                    'testAccount', 
                    { write: (data: any) => {
                        assert.ok(data)
                        conn.close()
                        done()
                    } } as Response, 
                    'test')
            })
            .catch((error) => {
                console.error(error)
            })
    })
})
