import assert from 'assert'
import { DatabaseConnection } from '../../src/db/db'
import { AccountService } from '../../src/services/account'

const apiKey = '170c14630ff88f2d819ff543a377257303f718f7b6ac6c8df3c6d4b35194c919'

describe('AccountService db tests', function() {
    it('should save or update apiKey in AccountService', function(done) {
        const conn = new DatabaseConnection()
        conn.connect()
            .then(() => {
                const service = new AccountService(conn)
                service.saveAccount({
                    accountId: 'testAccount',
                    apiKey: apiKey,
                    clientSecret: 'test'
                }).then(result => {
                    assert.ok(result)
                    conn.close()
                    done()
                })
            })
            .catch((error) => {
                console.error(error)
            })
        
    })

    it('should get account by ApiKey in AccountService', function(done) {
        const conn = new DatabaseConnection()
        conn.connect()
            .then(() => {
                const service = new AccountService(conn)
                service.getAccountByApiKey(apiKey).then(result => {
                    assert.equal(result?.apiKey, apiKey)
                    conn.close()
                    done()
                })
            })
            .catch((error) => {
                console.error(error)
            })
    })
})
