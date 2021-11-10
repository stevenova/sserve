// import EventSource from 'eventsource'
import { SseClient, SseClientOptions } from './sseClient'

interface ToggleUpdate {
    toggleName: string
    toggleValue: any
}

const SNAPSHOT: string = 'snapshot'
const ENVIRONMENTS: string = 'environments'

export class ToggleSseClient extends SseClient {

    /** Cached values/toggles */
    #cachedValues: any

    constructor(options: SseClientOptions) {
        super(options)
    }

    #updateCachedValue(data: ToggleUpdate) {
        if (this.#cachedValues[ENVIRONMENTS][this.environment][data.toggleName]) {
            console.log('Updating cached value', data)
            this.#cachedValues[ENVIRONMENTS][this.environment][data.toggleName] = data.toggleValue
        }
    }

    getCachedValue(): any {
        return this.#cachedValues
    }

    getToggleValue(name: string): any {
        try {
            return this.#cachedValues[ENVIRONMENTS][this.environment][name]
        } catch {
            return null
        }
    }

    /** Decodes the encoded message with client secret */
    #decodeMessage(message: string) {
        // Needs implementation
        return JSON.parse(message)
    }

    /** Overrides parent's _onMessage to support decoding and caching of snapshot */
    _onMessage(event: MessageEvent): void {
        if (this.onData) {
            const messageObject = this.#decodeMessage(event.data)
            // If it is a snapshot, then store it in cache
            if (messageObject.type && messageObject.type === SNAPSHOT) {
                this.#cachedValues = messageObject.data
            } else {
                this.#updateCachedValue(messageObject.data)
            }
            this.onData(messageObject)
        }
    }

}
