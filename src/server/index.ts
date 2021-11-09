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

singletonDatabaseConnection.connect()
    .then(() => {
        console.log('Database connected')
        const sseToggleService = new SseToggleService(singletonDatabaseConnection)
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
    <script type="text/javascript">
    var eventSource = new EventSource('http://localhost:1337/events')
    eventSource.onmessage = function(evt) {
      console.log('SSE event', evt.data);
      document.getElementById('lol').innerHtml = event.data;
    }
    </script>
    <html>
    <body>
    <div id="lol"></div>
    </body>
    </html>
    `)
    res.end()
    res.status(200)
})

app.listen(config.server.port, () => {
    console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`)
});