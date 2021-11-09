import assert from 'assert'
import { SseConnectedClients } from '../../src/common/sseConnectedClients'
import { DatabaseConnection } from '../../src/db/db'
import { SseToggleService } from '../../src/services/sseToggle'
import { Response } from 'express'

describe('SseToggleService tests', function() {
    it('should get update field information', function() {
        const testField = 'environments.test.testToggle.value'
        const service = new SseToggleService({} as DatabaseConnection)
        const fieldInfo = service.getFieldInformation(testField)
        assert.equal(fieldInfo.environment, 'test')
        assert.equal(fieldInfo.toggleName, 'testToggle')
        assert.equal(fieldInfo.toggleField, 'value')
    })

    it('should process field and send to client', function(done) {
        const testField = 'environments.test.testToggle.value'
        const testAccount = 'testAccount'
        const connectedClients = new SseConnectedClients()
        const service = new SseToggleService({} as DatabaseConnection, connectedClients)
        const client = connectedClients.addClient(
            testAccount, 
            { write: (data: any) => { console.log(data); assert.ok(data); done() } } as Response, 
            'test')
        assert.equal(client.accountId, testAccount)
        assert.equal(client.environment, 'test')
        service.processField(testAccount, testField, 'something')
    })
})
