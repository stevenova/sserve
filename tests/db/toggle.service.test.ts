import assert from 'assert'
import { ToggleService, ToggleType } from '../../src/services/toggle'
import { DatabaseConnection } from '../../src/db/db'

describe('ToggleService DB tests', function() {
    it('should upsert toggle to db', function(done) {
        this.timeout(5000)
        const conn = new DatabaseConnection()
        conn.connect()
            .then(() => {
                const service = new ToggleService(conn)
                service.saveToggle('testAccount', 'development', 'toggleTest', { type: ToggleType.BOOLEAN, value: true })
                    .then((result) => {
                        console.log(result)
                        assert.ok(result)
                        conn.close()
                        done()
                    })
            })
            .catch((error) => {
                console.error(error)
            })
        
    })

    it('should get toggle from db', function(done) {
        this.timeout(5000)
        const conn = new DatabaseConnection()
        conn.connect()
            .then(() => {
                const service = new ToggleService(conn)
                service.getToggleValue('testAccount', 'development', 'toggleTest')
                    .then((result) => {
                        console.log(result)
                        assert.ok(result)
                        assert.equal(result.environments.development['toggleTest'].value, true)
                        conn.close()
                        done()
                    })
            })
            .catch((error) => {
                console.error(error)
            })
        
    })
})