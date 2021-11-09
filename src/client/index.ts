import { SseClient } from "./sseClient"
import { DatabaseConnection } from '../db/db'
import { COLLECTION } from '../db/constants'

let wait = true

const sseClient = new SseClient({
    clientSecret: 'test',
    apiKey: '170c14630ff88f2d819ff543a377257303f718f7b6ac6c8df3c6d4b35194c919',
    eventsUrl: 'http://localhost:1337/events',
    environment: 'test'
})
sseClient.onConnect = function(e: any) {
    console.log('onConnect', e)
}
sseClient.onData = function(e: any) {
    console.log('onData', e)
    wait = false
    sseClient.close()
}
console.log('Connecting to SSE Server')
sseClient.connect()

setTimeout(function() {
    const conn = new DatabaseConnection()
        conn.connect()
            .then(() => {
                console.log('Updating one')
                conn.db.collection(COLLECTION.TOGGLE).updateOne({ accountId: 'testAccount' }, {
                    $set: {
                        'environments.test.testToggle.value': Math.random().toString(),
                        'environments.test.testToggle.type': 'string'
                    }
                }).then(result => {
                    console.log('Updating one: complete', result)
                })
            })
}, 1000)
