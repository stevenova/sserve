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
                    assert.ok(data)
                    watcher.destroy()
                    conn.close()
                    done()
                }
                watcher.init()

                setTimeout(function() {
                    conn.db.collection(COLLECTION.TOGGLE).updateOne({ accountId: 'testAccount' }, {
                        $set: {
                            'environments.test.testToggle.value': Math.random().toString(),
                            'environments.test.testToggle.type': 'string'
                        }
                    }).then(result => {
                        assert.ok(result)
                    })
                }, 1000)
                
            })
            .catch((error) => {
                console.error(error)
                conn.close()
            })
    })
})