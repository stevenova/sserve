import { Request, Response, NextFunction } from 'express'
import { singletonDatabaseConnection } from '../../db/db'
import { AccountService } from '../../services/account'
import { X_DATA_ACCOUNT } from '../constants/headers'

/** Gets API Key (token) from Authorization header */
export function getToken(authorizationHeader: string | undefined): string | undefined {
    if (authorizationHeader) {
        return authorizationHeader.split(' ')[1]
    }
}

/** Gets the API Key (token) from cookie */
export function getApiKeyFromCookie(req: Request): string {
    if (req.headers.cookie) {
        const cookie = req.headers.cookie
        const parts = cookie.split(';')
        let apiKey: string = ''
        parts.forEach((keyValue: string) => {
            const crumb = keyValue.split('=')
            if (crumb[0].trim() === 'apiKey') {
                apiKey = crumb[1]
            }
        })
        return apiKey
    }
    return ''
}

/**
 * Middleware that verifies that there's an account entry with the given API Key Token in
 * the Authorization header
 * @param req 
 * @param res 
 * @param next 
 */
export async function auth(req: Request, res: Response, next: NextFunction) {
    // Supports getting the API Key (token) from Authorization header or Cookie
    const apiKey = getToken(req.headers?.authorization) || getApiKeyFromCookie(req)
    let authenticated = false
    if (apiKey) {
        try {
            const service = new AccountService(singletonDatabaseConnection)
            const account = await service.getAccountByApiKey(apiKey)
            if (!account) {
                console.error(`Unauthorized request for apiKey: ${apiKey}`)
            } else {
                authenticated = true
                // Sets the account Id of the connected client so it can be accessible on the next middlewares
                req.headers[X_DATA_ACCOUNT] = account.accountId
            }
        } catch (error) {
            console.error('Error validating api key', error)
        }
    }
    if (!authenticated) {
        res.status(401).json({
            error: new Error('Unauthorized request!')
        })
    } else {
        next()
    }
}
