import crypto from 'crypto'

export class TokenService {
    constructor() {}

    createApiToken(toHash: any, secret: string): string {
        const hmac = crypto.createHmac('sha256', secret)
        const hash = hmac.update(toHash).digest('hex')
        return hash
    }
}
