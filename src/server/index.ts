import express from 'express'
import { config } from '../configs/main'
import cors from 'cors'
import { sseHandler } from './middlewares/sse'
import { auth } from './middlewares/auth'
import { singletonDatabaseConnection } from '../db/db'
import { ConnectedClients } from '../common/sseConnectedClients'
import { SseToggleService } from '../services/sseToggle'

const PORT = +config.server.port
const allowedOrigins = ['*'];
// Maybe allowedOrigins should be dynamic, if later we need want to get it from storage
const options: cors.CorsOptions = {
    origin: allowedOrigins
};

// Check if the server has been started in test mode
const isTestMode = !!process.argv.find(arg => arg === '--test')
if (isTestMode) {
    console.log('Test flag provided, will start server in test mode')
}

singletonDatabaseConnection.connect()
    .then(() => {
        console.log('Database connected')
        const sseToggleService = new SseToggleService(singletonDatabaseConnection, { isTestMode: isTestMode })
        sseToggleService.init()
    })
    .catch((error) => {
        console.error(error)
    })

const app = express()
app.use(cors(options))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => res.send('Express SSE + TypeScript Server'))
/** SSE subscription/listening handler */
app.get('/events', auth, sseHandler)
/** Sends SSE data to connected sse clients */
app.get('/test', (req, res) => {
    ConnectedClients.sendMessage(JSON.stringify({ now: new Date() }))
    res.status(200).json({ ok: 'ok' })
})
/** Toggle events */
app.get('/toggleevents', auth, sseHandler)

app.get('/page', (req, res) => {
    res.write(`
    <!-- Example using normal browser's EventSource -->
    <html>
    <header>
    <meta charset="UTF-8" />
    </header>
    <body>
    <div id="lol" width="100%" height="200px"></div>
    </body>
    </html>
    <script type="text/javascript">
    // Setup the cookie with the API Key
    document.cookie = 'apiKey=170c14630ff88f2d819ff543a377257303f718f7b6ac6c8df3c6d4b35194c919'
    // Having withCredentials set to true, will tell EventSource to send also cookies to server
    var eventSource = new EventSource('http://localhost:1337/events?environment=test', { withCredentials: true })
    eventSource.onmessage = function(evt) {
        console.log('SSE event', evt.data);
        document.getElementById('lol').innerHTML = JSON.stringify(evt.data);
    }
    eventSource.onerror = function(error) {
        console.log('Error event', error)
    }
    </script>
    `)
    res.end()
    res.status(200)
})

app.listen(config.server.port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
});