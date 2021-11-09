import { ChangeStream, Db } from 'mongodb'
import { Destroyable } from '../utils/destroyable'
import { DatabaseConnection } from './db'

interface WatcherOptions {
    watchCollection: string
    pipeline?: any[]
    log?: boolean
}

export class Watcher implements Destroyable {
    #db: Db
    #watchCollection: string
    #pipeline: any[] = []
    #log: boolean = false
    #changeStream: ChangeStream | undefined

    onChange: Function | undefined
    onError: Function | undefined

    constructor(connection: DatabaseConnection, options: WatcherOptions) {
        this.#db = connection.db
        this.#watchCollection = options.watchCollection
        this.#pipeline = options.pipeline || []
        this.#log = options.log || false
    }

    /**
     * Initiates the watching of the collection and configuring the listening of events
     */
    init(): void {
        console.log(`Initializing watcher for ${this.#watchCollection} collection`)
        try {
            this.#changeStream = this.#db.collection(this.#watchCollection).watch(this.#pipeline)
            this.#changeStream.on('change', (next) => {
                if (this.#log) {
                    console.log(`Watcher (${this.#watchCollection}): change`, next)
                }
                if (this.onChange) {
                    this.onChange(next)
                }
            })
            this.#changeStream.on('error', (error) => {
                if (this.#log) {
                    console.error(`Watcher (${this.#watchCollection}): change`, error)
                }
                if (this.onError) {
                    this.onError(error)
                }
            })
        } catch (error) {
            console.error(`Error watching from ${this.#watchCollection} collection`, error)
        }
    }

    destroy(): void {
        if (this.#changeStream) {
            this.#changeStream.close()
        }
    }

}
