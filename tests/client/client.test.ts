import assert from 'assert'
import { SseClient } from '../../src/client/sseClient'

/**
 * For this test you would need to run the server locally on port 1337
 */
describe('SseClient', function() {
    it('should connect to event source', function(done) {
        this.timeout(5000)
        const sseClient = new SseClient({
            clientSecret: 'test',
            apiKey: '170c14630ff88f2d819ff543a377257303f718f7b6ac6c8df3c6d4b35194c919',
            eventsUrl: 'http://localhost:1337/events',
            environment: 'test'
        })
        sseClient.onConnect = function(e: any) {
            sseClient.close()
            done()
        }
        sseClient.connect()
    })

    it('should fail to connect to event source due to invalid API key', function(done) {
        this.timeout(5000)
        const sseClient = new SseClient({
            clientSecret: 'test',
            apiKey: 'invalidKey',
            eventsUrl: 'http://localhost:1337/events',
            environment: 'test'
        })
        sseClient.onConnect = function(e: any) {
            sseClient.close()
            throw 'Test fail'
        }
        sseClient.onError = function(e: any) {
            assert.equal(e.type, 'error')
            assert.equal(e.status, 401)
            sseClient.close()
            done()
        }
        sseClient.connect()
    })
})
