import { Request, Response, NextFunction } from 'express'
import { singletonDatabaseConnection } from '../../db/db'
import { AccountService } from '../../services/account'
import { X_DATA_ACCOUNT } from '../constants/headers'

function getToken(authorizationHeader: string | undefined): string | undefined {
    if (authorizationHeader) {
        return authorizationHeader.split(' ')[1]
    }
}

/**
 * Middleware that verifies that there's an account entry with the given API Key Token in
 * the Authorization header
 * @param req 
 * @param res 
 * @param next 
 */
export async function auth(req: Request, res: Response, next: NextFunction) {
    const apiKey = getToken(req.headers?.authorization)
    let authenticated = false
    if (apiKey) {
        try {
            const service = new AccountService(singletonDatabaseConnection)
            const account = await service.getAccountByApiKey(apiKey)
            if (!account) {
                console.error(`Unauthorized request for apiKey: ${apiKey}`)
            } else {
                authenticated = true
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
