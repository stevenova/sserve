import assert from 'assert'
import { getToken, getApiKeyFromCookie } from '../../src/server/middlewares/auth'
import { Request } from 'express'

describe('Get API Key functions tests', function() {
    it('should get API Key from Authorization header', function() {
        const testToken = 'testApiKey'
        const apiKey = getToken(`Bearer ${testToken}`)
        assert.equal(apiKey, testToken)
    })

    it('should get API Key from Cookie in header', function() {
        const testToken = 'testApiKey'
        const apiKey = getApiKeyFromCookie({
            headers: { cookie: `apiKey=${testToken}`}
        } as Request)
        assert.equal(apiKey, testToken)
    })
})
