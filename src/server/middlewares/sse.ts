import { Request, Response, NextFunction } from 'express'
import { config } from '../../configs/main'
import { X_DATA_ACCOUNT } from '../constants/headers'
import { ConnectedClients } from '../../common/sseConnectedClients'

/** Gets the identifier from the request */
function getIdentifierFromHeader(req: Request) {
    // If it has gone through the auth middleware then this header will be populated with data
    return req.headers[X_DATA_ACCOUNT]?.toString()
}

/** SSE Handler for ExpressJS */
export function sseHandler(req: Request, res: Response, next: NextFunction) {
    // Only allow when environment is being set
    if (req.query.environment) {
        res.set({
        'Cache-Control': 'no-cache',
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive'
        });
        res.flushHeaders();

        // Retry every 60 (default) seconds (or based on config) if connection is lost
        res.write(`retry: ${config.sse.client.retry}\n\n`);

        const client = ConnectedClients.addClient(getIdentifierFromHeader(req) || '', res, req.query.environment.toString())
        console.log('Client connected', client.id)

        // If client closes connection, do something
        req.on('close', () => {
            console.log(`${client.id} Connection closed`);
            // Remove the disconnected client
            ConnectedClients.removeClient(client)
        })
    } else {
        next()
    }
}
