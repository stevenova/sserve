// import crypto from 'crypto'
// import fetch from 'node-fetch'
import EventSource from 'eventsource'

interface SseClientOptions {
    /** Client secret used for messages */
    clientSecret: string,
    /** API key */
    apiKey: string,
    /** Environment */
    environment: string,
    /** Events subscribing URL */
    eventsUrl: string
    /** Function for receiving data */
    onData?: Function
    /** Function for receiving connection open event */
    onConnect?: Function
    /** Function for receiving errors */
    onError?: Function
}

export class SseClient {
    /** Client secret used for messages */
    clientSecret: string
    /** API key */
    apiKey: string
    /** Environment */
    environment: string
    /** Events subscribing URL */
    eventsUrl: string

    /** Function for receiving data */
    onData: Function | undefined
    /** Function for receiving connection open event */
    onConnect: Function | undefined
    /** Function for receiving errors */
    onError: Function | undefined

    /** Cached values */
    #cachedValues: any
    /** EventSource instance */
    #eventSource: EventSource | undefined

    constructor(options: SseClientOptions) {
        this.clientSecret = options.clientSecret
        this.apiKey = options.apiKey
        this.environment = options.environment
        this.eventsUrl = options.eventsUrl
        this.onData = options.onData
        this.onConnect = options.onConnect
        this.onError = options.onError
    }

    connect() {
        // Should I go to a place first and authenticate with given sdkKey and apiKey, and grab was
        // is returned and use that as authorization thing
        try {
            // When do I use this?
            const eventSourceInitDict = {
                headers: { Authorization: `Bearer ${this.apiKey}` }
            }
            this.#eventSource = new EventSource(`${this.eventsUrl}/?environment=${this.environment}`, eventSourceInitDict)
            // Important to bind to this, because these functions are sent to the EventSource as anonymous
            this.#eventSource.onmessage = this.#onMessage.bind(this)
            this.#eventSource.onerror = this.#onError.bind(this)
            this.#eventSource.onopen = this.#onOpen.bind(this)
        } catch (error) {
            console.log('Error fetching events url', error)
        }
    }

    close(): void {
        if (this.#eventSource) {
            this.#eventSource.close()
        }
    }

    #onOpen(event: Event): void {
        console.log('onOpen', event)
        if (this.onConnect) {
            this.onConnect(event)
        } else {
            console.error('No function for onConnect')
        }
    }

    /** Decodes the encoded message with client secret */
    #decodeMessage(message: string) {
        // Needs implementation
        return message
    }

    #onMessage(event: MessageEvent): void {
        console.log('onMessage', event.data)
        if (this.onData) {
            this.onData(this.#decodeMessage(event.data))
        }
    }

    #onError(error: Event): void {
        console.error(error)
        if (this.onError) {
            this.onError(error)
        }
    }
}
