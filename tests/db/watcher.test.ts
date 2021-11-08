import assert from 'assert'
import { DatabaseConnection } from '../../src/db/db'
import { COLLECTION } from '../../src/db/constants'
import { Watcher } from '../../src/db/watcher'

describe('Watcher test', function() {
    it('Should watch for a change event in a collection', function(done) {
        this.timeout(5000)
        const conn = new DatabaseConnection()
        conn.connect()
            .then(() => {
                const watcher = new Watcher(conn, {
                    watchCollection: COLLECTION.TOGGLE
                })

                watcher.onChange = function(data: any) {
                    console.log('watcher.onChage', data)
                    assert.ok(data)
                    watcher.destroy()
                    done()
                }
                watcher.init()

                setTimeout(function() {
                    console.log('Updating one')
                    conn.db.collection(COLLECTION.TOGGLE).updateOne({ accountId: 'testAccount' }, {
                        $set: {
                            'environments.test.testToggle.value': Math.random().toString(),
                            'environments.test.testToggle.type': 'string'
                        }
                    }).then(result => {
                        console.log('Updating one: complete', result)
                    })
                }, 1000)
                
            })
            .catch((error) => {
                console.error(error)
                conn.close()
            })
    })
})