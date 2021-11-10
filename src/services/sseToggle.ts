import { DatabaseConnection } from '../db/db'
import { ToggleService } from './toggle'
import { ConnectedClients, SseConnectedClients, SseConnectedClient, EventNames, ClientMessage } from '../common/sseConnectedClients'

interface FieldInformation {
    environment: string
    toggleName: string
    toggleField: string
}

enum MessageType {
    SNAPSHOT = 'snapshot',
    UPDATE = 'update'
}

interface SseToggleServiceOptions {
    connectedClients?: SseConnectedClients,
    isTestMode?: boolean
}

/**
 * Service that orchrestates between ToggleService and SseConnectedClients, the one in charge
 * to listens and sends data to clients
 */
export class SseToggleService {
    #toggleService: ToggleService
    #connectedClients: SseConnectedClients
    #isTestMode: boolean

    constructor(connection: DatabaseConnection, options?: SseToggleServiceOptions) {
        this.#toggleService = new ToggleService(connection)
        this.#isTestMode = !!options?.isTestMode || false
        this.#connectedClients = options?.connectedClients || ConnectedClients
        this.#connectedClients.addListener(EventNames.CLIENT_ADDED, this.#onConnectedClientAddedEvent.bind(this))
    }

    /** Initializes watching of updates on ToggleService */
    init(): void {
        this.#toggleService.initWatch(this.#onToggleUpdates.bind(this))
        // Send test updates every 5000 ms
        if (this.#isTestMode) {
            setInterval(this.#testProcess.bind(this), 5000)
        }
    }

    /** Receives clientAdded event from SseConnectedClients instance */
    async #onConnectedClientAddedEvent(client: SseConnectedClient) {
        // If a client has just been added, you would want to send the entire set of toggles
        const environmentToggles = await this.#toggleService.getTogglesFromEnvironment(client.accountId, client.environment)
        this.#sendDataToClient(client, MessageType.SNAPSHOT, environmentToggles)
    }

    /** Wraps the data in a ClientMessage */
    #getClientMessage(type: string, data: any): ClientMessage {
        return {
            type: type,
            data: data
        }
    }

    // Not sure if I should send it straight here, or leave it for SseConnecteClients instance to handle it
    #sendDataToClient(client: SseConnectedClient, type: string, data: any) {
        const wrappedMessage = this.#getClientMessage(type, data)
        client.response.write(`data: ${JSON.stringify(wrappedMessage)}\n\n`)
    }

    /** Receive SSE events from ToggleService */
    async #onToggleUpdates(event: any) {
        // Will only listen for update fields
        // Sample incoming toggle update message
        // {
        //     _id: {
        //         _data: '82618BCCEF000000012B022C0100296E5A10047F1BED3CB3C04FE19F70D170412FE2EF46645F696400646187CB3DA560025BCD6467900004'
        //     },
        //     operationType: 'update',
        //     clusterTime: new Timestamp({ t: 1636551919, i: 1 }),
        //     ns: { db: 'sserve', coll: 'toggle' },
        //     updateDescription: {
        //         updatedFields: { 'environments.development.toggleTest': [Object] },
        //         removedFields: []
        //     }
        // }
        if (event.updateDescription) {
            const toggleInfo = await this.#toggleService.getToggleAccountIdById(event.documentKey._id)
            for (const [key, value] of Object.entries(event.updateDescription.updatedFields)) {
                if (toggleInfo) {
                    this.processUpdatedField(toggleInfo.accountId, key, value)
                }
            }
        }
    }

    /** Gets the information about the toggle field */
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
            this.#connectedClients.sendMessageByAccountId(accountId,
                fieldInfo.environment,
                JSON.stringify(
                    { toggleName: fieldInfo.toggleName, toggleValue: value }
                    )
                ),
                MessageType.UPDATE
        }
    }

    #testProcess(): void {
        this.#connectedClients.sendMessageByAccountId('testAccount',
            'test',
            JSON.stringify(
                { toggleName: 'testToggle', toggleValue: Math.random().toString() }
                ),
            'update'
            )
    }
}