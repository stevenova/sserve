import { DatabaseConnection } from '../db/db'
import { Db } from'mongodb'
import { COLLECTION } from '../db/constants'
import { Watcher } from '../db/watcher'
import { Destroyable } from '../utils/destroyable'

export enum ToggleType {
    BOOLEAN = 'boolean',
    OBJECT = 'object',
    STRING = 'string',
    NUMBER = 'number'
}

export interface Toggle {
    value: string | boolean | object
    type?: ToggleType
    description?: string
}

/**
 * Sample document structure
 * {
 *      accountId: uuid, // Or some kind of id
 *      environments: {
 *          development: {
 *              something: {
 *                  type: 'number',
 *                  description: '',
 *                  value: 3
 *              }
 *          },
 *          staging: {
 *          },
 *          production: {
 *          }
 *      }
 * }
 */

const ENVIRONMENTS: string = 'environments'

export class ToggleService implements Destroyable {

    #db: Db
    #watcher: Watcher

    constructor(connection: DatabaseConnection) {
        this.#db = connection.db
        this.#watcher = new Watcher(connection, { watchCollection: COLLECTION.TOGGLE, log: true })
    }

    initWatch(callback: Function): void {
        this.#watcher.onChange = callback
        this.#watcher.init()
    }

    destroy(): void {
        this.#watcher.destroy()
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

    async getToggleValue(accountId: string) {
        try {
            const result = await this.#db.collection(COLLECTION.TOGGLE)
                .findOne({
                    accountId: accountId
                }, { projection: { accountId: false } })
            return result
        } catch (error) {
            console.error('Error getting toggle', error)
            throw error
        }
    }

    /** Get the toggles for the given accountId and environment */
    getTogglesFromEnvironment(accountId: string, environment: string) {
        return this.#db.collection(COLLECTION.TOGGLE).findOne({
            accountId: accountId
        }, {
            projection: { [`${ENVIRONMENTS}.${environment}`]: true, _id: false }
        })
    }

    getToggleAccountIdById(id: string) {
        return this.#db.collection(COLLECTION.TOGGLE).findOne({ _id: id }, { projection: { accountId: true }})
    }
}
