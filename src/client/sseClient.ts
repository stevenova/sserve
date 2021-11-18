import EventSource from 'eventsource'

/**
 * Maybe there is a need for app name or app id? Since the same user might have the same account
 * but have multiple applications
 */
export interface SseClientOptions {
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
    /** Client secret used for messages, not yet implemented */
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

    /** EventSource instance */
    eventSource: EventSource | undefined

    constructor(options: SseClientOptions) {
        this.clientSecret = options.clientSecret
        this.apiKey = options.apiKey
        this.environment = options.environment
        this.eventsUrl = options.eventsUrl
        this.onData = options.onData
        this.onConnect = options.onConnect
        this.onError = options.onError
    }

    /** Connects to the SSE URL */
    connect(): void {
        try {
            const eventSourceInitDict = {
                headers: {
                    // Authentication through authorization
                    Authorization: `Bearer ${this.apiKey}`,
                    // Or through cookie
                    Cookie: `apiKey=${this.apiKey}`
                }
            }
            this.eventSource = new EventSource(`${this.eventsUrl}/?environment=${this.environment}`, eventSourceInitDict)
            // Important to bind to this, because these functions are sent to the EventSource as anonymous
            this.eventSource.onmessage = this._onMessage.bind(this)
            this.eventSource.onerror = this._onError.bind(this)
            this.eventSource.onopen = this._onOpen.bind(this)
        } catch (error) {
            console.log('Error fetching events url', error)
        }
    }

    close(): void {
        if (this.eventSource) {
            this.eventSource.close()
        }
    }

    _onOpen(event: Event): void {
        if (this.onConnect) {
            this.onConnect(event)
        } else {
            console.warn('No function for onConnect')
        }
    }

    _onMessage(event: MessageEvent): void {
        if (this.onData) {
            this.onData(event.data)
        }
    }

    _onError(error: Event): void {
        console.error(error)
        if (this.onError) {
            this.onError(error)
        }
    }
}
