import { DatabaseConnection } from '../db/db'
import { ToggleService } from './toggle'
import { ConnectedClients, SseConnectedClients } from '../common/sseConnectedClients'

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
    }

    init(): void {
        this.#toggleService.initWatch(this.#onToggleUpdates.bind(this))
    }

    async #onToggleUpdates(event: any) {
        // Will only listen for update fields
        if (event.updateDescription) {
            const toggleInfo = await this.#toggleService.getToggleAccountIdById(event.documentKey._id)
            for (const [key, value] of Object.entries(event.updateDescription.updatedFields)) {
                if (toggleInfo) {
                    this.processField(toggleInfo.accountId, key, value)
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

    processField(accountId: string, updateField: string, value: string | number | object | unknown): void {
        // I think updateFields can also be an array
        const fieldInfo = this.getFieldInformation(updateField)
        // Have to check throughly at some point on the field format
        if (accountId && fieldInfo.toggleField === 'value') {
            this.#connectedClients.sendMessageByAccountId(accountId, fieldInfo.environment, JSON.stringify({ [fieldInfo.toggleName]: value }))
        }
    }
}