import { Response } from 'express'
import crypto from 'crypto'

export interface SseConnectedClient {
    id: string
    accountId: string
    environment?: string
    response: Response
}

export class SseConnectedClients {
    #connectedClients: SseConnectedClient[] = []

    constructor() {}

    /** Creates a SseConnectedClient with the given client Response instance */
    createSseClient(accountId: string, res: Response, environment?: string): SseConnectedClient {
        return {
            id: crypto.randomBytes(32).toString('hex'),
            accountId: accountId,
            response: res,
            environment: environment
        }
    }

    /** Returns a copy of the array of sse connected clients */
    getClients(): SseConnectedClient[] {
        return [...this.#connectedClients]
    }

    /** Adds the given as a connected sse client into the tracking internal array */
    addClient(accountId: string, res: Response, environment?: string): SseConnectedClient {
        const client = this.createSseClient(accountId, res, environment)
        this.#connectedClients.push(client)
        return client
    }

    /** Removes the given client from the tracking array */
    removeClient(client: SseConnectedClient): void {
        this.#connectedClients = this.#connectedClients.filter(c => c.id !== client.id);
    }

    /** Sends a message to all connected clients */
    sendMessage(message: string): void {
        this.#connectedClients.forEach(c => c.response.write(`data: ${message}\n\n`))
    }

    sendMessageByAccountId(accountId: string, environment: string, message: string): void {
        const client = this.#connectedClients.find(c => c.accountId === accountId && c.environment === environment)
        client?.response.write(`data: ${message}\n\n`)
    }
}

export const ConnectedClients = new SseConnectedClients()
