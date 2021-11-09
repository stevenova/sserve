import { DatabaseConnection } from '../db/db'
import { ToggleService } from './toggle'
import { ConnectedClients, SseConnectedClients, SseConnectedClient, EventNames } from '../common/sseConnectedClients'

interface FieldInformation {
    environment: string
    toggleName: string
    toggleField: string
}

export class SseToggleService {
    #toggleService: ToggleService
    #connectedClients: SseConnectedClients

    constructor(connection: DatabaseConnection, connectedClients?: SseConnectedClients) {
        this.#toggleService = new ToggleService(connection)
        this.#connectedClients = connectedClients || ConnectedClients
        this.#connectedClients.addListener(EventNames.CLIENT_ADDED, this.#onConnectedClientAddedEvent.bind(this))
    }

    /** Initializes watching of updates on ToggleService */
    init(): void {
        this.#toggleService.initWatch(this.#onToggleUpdates.bind(this))
    }

    /** Receives clientAdded event from SseConnectedClients instance */
    async #onConnectedClientAddedEvent(client: SseConnectedClient) {
        // If a client has just been added, you would want to send the entire set of toggles
        const environmentToggles = await this.#toggleService.getTogglesFromEnvironment(client.accountId, client.environment)
        this.#sendDataToClient(client, environmentToggles)
    }

    #sendDataToClient(client: SseConnectedClient, data: any) {
        client.response.write(`data: ${JSON.stringify(data)}\n\n`)
    }

    /** Receive SSE events from ToggleService */
    async #onToggleUpdates(event: any) {
        // Will only listen for update fields
        if (event.updateDescription) {
            const toggleInfo = await this.#toggleService.getToggleAccountIdById(event.documentKey._id)
            for (const [key, value] of Object.entries(event.updateDescription.updatedFields)) {
                if (toggleInfo) {
                    this.processUpdatedField(toggleInfo.accountId, key, value)
                }
            }
        }
    }

    getFieldInformation(fieldName: string): FieldInformation {
        const splitted = fieldName.split('.')
        return {
            environment: splitted[1],
            toggleName: splitted[2],
            toggleField: splitted[3]
        }
    }

    processUpdatedField(accountId: string, updateField: string, value: string | number | object | unknown): void {
        // I think updateFields can also be an array
        const fieldInfo = this.getFieldInformation(updateField)
        // Have to check throughly at some point on the field format
        if (accountId && fieldInfo.toggleField === 'value') {
            this.#connectedClients.sendMessageByAccountId(accountId, fieldInfo.environment, JSON.stringify({ [fieldInfo.toggleName]: value }))
        }
    }
}