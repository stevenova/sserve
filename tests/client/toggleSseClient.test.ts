import assert from 'assert'
import { ToggleSseClient } from '../../src/client/toggleSseClient'

const apiKey = '170c14630ff88f2d819ff543a377257303f718f7b6ac6c8df3c6d4b35194c919'
const eventsUrl = 'http://localhost:1337/events'

/**
 * For this test you would need to run the server locally on port 1337
 */
describe('ToggleSseClient', function() {
    it('should connect to event source', function(done) {
        this.timeout(5000)
        const sseClient = new ToggleSseClient({
            clientSecret: 'test',
            apiKey: apiKey,
            eventsUrl: eventsUrl,
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
        const sseClient = new ToggleSseClient({
            clientSecret: 'test',
            apiKey: 'invalidKey',
            eventsUrl: eventsUrl,
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

    it('should receive a snapshot type message and the client should have cached value', function(done) {
        this.timeout(5000)
        const sseClient = new ToggleSseClient({
            clientSecret: 'test',
            apiKey: apiKey,
            eventsUrl: eventsUrl,
            environment: 'test'
        })
        sseClient.onConnect = function(e: any) {
            assert.ok(e)
        }
        sseClient.onData = function(e: any) {
            const cachedValue = sseClient.getCachedValue()
            assert.ok(cachedValue.environments)
            sseClient.close()
            done()
        }
        sseClient.connect()
    })

    it('should get toggle value from cache', function(done) {
        this.timeout(5000)
        const sseClient = new ToggleSseClient({
            clientSecret: 'test',
            apiKey: apiKey,
            eventsUrl: eventsUrl,
            environment: 'test'
        })
        sseClient.onConnect = function(e: any) {
            assert.ok(e)
        }
        sseClient.onData = function(e: any) {
            const cachedValue = sseClient.getCachedValue()
            assert.ok(cachedValue.environments)
            assert.equal(sseClient.getToggleValue('testToggle'), cachedValue.environments.test.testToggle)
            sseClient.close()
            done()
        }
        sseClient.connect()
    })

    /** Make sure the server is running with --test flag so this test can pass */
    it('should update correctly the cached value from a toggle update', function(done) {
        this.timeout(10000)
        const sseClient = new ToggleSseClient({
            clientSecret: 'test',
            apiKey: apiKey,
            eventsUrl: eventsUrl,
            environment: 'test'
        })
        sseClient.onConnect = function(e: any) {
            assert.ok(e)
        }
        let counter = 0;
        sseClient.onData = function(e: any) {
            counter++;
            if (counter > 2) {
                const cachedValue = sseClient.getCachedValue()
                assert.equal(sseClient.getToggleValue('testToggle'), cachedValue.environments.test.testToggle)
                assert.equal(e.data.toggleName, 'testToggle')
                assert.equal(sseClient.getToggleValue('testToggle'), e.data.toggleValue)
                sseClient.close()
                done()
            }
        }
        sseClient.connect()
    })
})
