import assert from 'assert'
import { DatabaseConnection } from '../../src/db/db'
import { COLLECTION } from '../../src/db/constants'

describe('Database connection', function() {
    it('should connect to database', function(done) {
        const conn = new DatabaseConnection()
        conn.connect()
            .then(() => {
                done()
            })
            .catch((error) => {
                console.error(error)
                conn.close()
            })
            .finally(() => {
                conn.close()
            })
    })

    it('should have the db name set from config', function() {
        const conn = new DatabaseConnection()
        assert.notEqual(conn.dbName, undefined)
        assert.notEqual(conn.dbName, null)
    })

    it('should watch for changes in Toggle collection', function(done) {
        this.timeout(10000)
        const conn = new DatabaseConnection()
        conn.connect()
            .then(() => {
                const options = { fullDocument: "updateLookup" };
                const pipeline: any[] = [];
                // Somehow the documentation mentions a cursor, but this returns a change stream
                let changeStream = conn.db.collection(COLLECTION.TOGGLE).watch(pipeline, options)
                changeStream.on('change', (next) => {
                    assert.ok(next)
                    changeStream.close()
                    conn.close()
                    done()
                })
                changeStream.on('error', (error) => {
                    console.error('changeStream.on.error')
                    console.error(error)
                })
                // Setting up a time out because the documentation says that the registering might take time
                // so we have a delay before inserting
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
