import assert from 'assert'
import { TokenService } from '../../src/services/token'

describe('TokenService tests', function() {
    it('should create API key/token', function() {
        const service = new TokenService()
        const hash = service.createApiToken('anything', 'not being used yet, it was')
        assert.ok(hash)
    })

})
