import { DatabaseConnection } from '../db/db'
import { Account } from '../db/account'
import { Db } from 'mongodb'
import { COLLECTION } from '../db/constants'

export class AccountService {
    #databaseConnection: DatabaseConnection
    #db: Db

    constructor(connection: DatabaseConnection) {
        this.#databaseConnection = connection
        this.#db = connection.db
    }

    async saveAccount(account: Account) {
        try {
            const result = await this.#db.collection(COLLECTION.ACCOUNT)
                .updateOne({
                    apiKey: account.apiKey
                }, { $set: {
                    ...account
                }}, { upsert: true })
            console.log('Result in saving account', result)
            return result
        } catch (error) {
            console.error('Error saving account', error)
        }
    }

    async getAccountByApiKey(apiKey: string) {
        try {
            const result = await this.#db.collection(COLLECTION.ACCOUNT).findOne({ apiKey: apiKey })
            return result
        } catch(error) {
            console.error('Error getting account by API key', error)
        }
    }
}
