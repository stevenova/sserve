import { Request, Response, NextFunction } from 'express'
import { config } from '../../configs/main'

export interface SseConnectedClient {
    id: number,
    response: Response
}

/** Creates a SseConnectedClient with the given client Response instance */
function createSseClient(res: Response): SseConnectedClient {
    return {
        id: Date.now(),
        response: res
    }
}

/** Array of SseConnectedClient subscribed */
export let sseConnectedClients: SseConnectedClient[] = []

/** SSE Handler for ExpressJS */
export function sseHandler(req: Request, res: Response, next: NextFunction) {
    res.set({
      'Cache-Control': 'no-cache',
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive'
    });
    res.flushHeaders();

    console.log('Client query', req.query)

    // Retry every 60 (default) seconds (or based on config) if connection is lost
    res.write(`retry: ${config.sse.client.retry}\n\n`);

    const client = createSseClient(res)
    sseConnectedClients.push(client)
    console.log('Client connected', client.id)

    // If client closes connection, do something
    req.on('close', () => {
        console.log(`${client.id} Connection closed`);
        // Remove the disconnected client
        sseConnectedClients = sseConnectedClients.filter(c => c.id !== client.id);
    })
}
