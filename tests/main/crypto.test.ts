import assert from 'assert'
import crypto from 'crypto'

describe('Auth crypto tests', function() {
    it('should create API key', function() {
        const hmac = crypto.createHmac('sha256', 'do i need this?')
        const hash = hmac.update('accountName').digest('hex')
        assert.ok(hash)
    })

})
