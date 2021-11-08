import { MongoClient, Db } from 'mongodb'
import { config } from '../configs/main'

export class DatabaseConnection {
    mongoClient: MongoClient
    dbName: string
    db!: Db

    constructor() {
        this.dbName = config.db.dbname
        this.mongoClient = new MongoClient(config.db.url)
    }

    async connect(): Promise<void> {
        try {
            await this.mongoClient.connect()
            this.db = this.mongoClient.db(this.dbName)
        } catch (error) {
            console.error('Error connecting to Mongo', error)
        }
    }

    close(): void {
        this.mongoClient.close()
    }

    // async saveAccount(account: Account) {
    //     try {
    //         const result = await this.db.collection(ACCOUNT_COLLECTION)
    //             .updateOne({
    //                 apiKey: account.apiKey
    //             }, { $set: {
    //                 ...account
    //             }}, { upsert: true })
    //         console.log('Result in saving account', result)
    //         return result
    //     } catch (error) {
    //         console.error('Error saving account', error)
    //     }
    // }

    // async getAccountByApiKey(apiKey: string) {
    //     try {
    //         const result = await this.db.collection(ACCOUNT_COLLECTION).findOne({ apiKey: apiKey })
    //         return result
    //     } catch(error) {
    //         console.error('Error getting account by API key')
    //     }
    // }
}

export const singletonDatabaseConnection: DatabaseConnection = new DatabaseConnection()
