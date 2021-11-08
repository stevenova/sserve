import dotenv from 'dotenv'
dotenv.config()

interface MainConfig {
    server: {
        port: string
    },
    db: {
        url: string,
        dbname: string
    },
    sse: {
        client: {
            retry: string
        }
    },
    // auth: {
    //     apiKeySecret: string
    // }
}

export const config: MainConfig = {
    server: {
        port: process.env.SERVER_PORT || '1337'
    },
    db: {
        url: process.env.MONGO_URL || 'mongodb://localhost:27017',
        dbname: process.env.MONGO_DBNAME || 'sserve'
    },
    sse: {
        client: {
            retry: process.env.SSE_CLIENT_RETRY || '120000'
        }
    },
    // auth: {
    //     apiKeySecret: process.env.SSE_CLIENT_SECRET || 'broccolicorn'
    // }
}
