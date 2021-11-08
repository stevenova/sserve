import { DatabaseConnection } from '../db/db'
import { Db } from'mongodb'
import { COLLECTION } from '../db/constants'

export enum ToggleType {
    BOOLEAN = 'boolean',
    OBJECT = 'object',
    STRING = 'string'
}

export interface Toggle {
    value: string | boolean | object
    type?: ToggleType
    description?: string
}

/**
 * {
 *      accountId: uuid,
 *      environments: {
 *          development: {
 *              something: value
 *          },
 *          staging: {
 *          },
 *          production: {
 *          }
 *      }
 * }
 */

const ENVIRONMENTS: string = 'environments'

export class ToggleService {
    #databaseConnection: DatabaseConnection
    #db: Db

    constructor(connection: DatabaseConnection) {
        this.#databaseConnection = connection
        this.#db = connection.db
    }

    validateToggle(toggle: Toggle) {
        // Validate if type is given only
        if (toggle.type) {
            switch (typeof toggle.value) {
                case 'boolean':
                    if (toggle.type === ToggleType.BOOLEAN)
                        return true
                    break
                case 'object':
                    if (toggle.type === ToggleType.OBJECT)
                        return true
                    break
                case 'string':
                    if (toggle.type === ToggleType.STRING)
                        return true
                    break
            }
            throw Error('Toggle value is different from the given toggle type')
        }
        // Ignore type when not given
        return true
    }

    getFieldName(environment: string, name: string): string {
        return `${ENVIRONMENTS}.${environment}.${name}`
    }

    async saveToggle(accountId: string, environment: string, name: string, value: Toggle) {
        try {
            if (this.validateToggle(value)) {
                const fieldName = this.getFieldName(environment, name)
                console.log(`Saving ${fieldName} with value ${value}`)
                const result = await this.#db.collection(COLLECTION.TOGGLE)
                    .updateOne({
                        accountId: accountId
                    }, {
                        $set: {
                            // This might replace description if you don't provide it sometimes, have to FIX it later
                            [fieldName]: { ...value }
                        }
                    }, { upsert: true })
                return result
            }
        } catch (error) {
            console.error('Error saving toggle', error)
            throw error
        }
    }

    async getToggleValue(accountId: string, environment: string, name: string) {
        try {
            // const fieldName = this.#getFieldName(environment, name)
            const result = await this.#db.collection(COLLECTION.TOGGLE)
                .findOne({
                    accountId: accountId
                }, { projection: { accountId: false, /*[fieldName]: true*/ } })
            return result
        } catch (error) {
            console.error('Error getting toggle', error)
            throw error
        }
    }
}
