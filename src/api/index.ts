import express from 'express'

// constants
import { API_PORT } from '../constant'

// logger
import { Logger } from '../utils/logger'
import { Color, LogLevel } from '../utils/logger/@type'


const app = express()

// Setup Logger
const apiLog = new Logger({
    name: 'API',
    color: Color.GREEN,
    logLevel: LogLevel.DEBUG
})

// JSON Parser
app.use(express.json());

// User Routers
import { userRouter } from './routers/user'
app.use(`/api/v1/user`, userRouter)
import { channelRouter } from './routers/channel'
app.use(`/api/v1/channel`, channelRouter)
import { campaignRouter } from './routers/campaign'
app.use(`/api/v1/campaign`, campaignRouter)
import { watchRouter } from './routers/watch'
app.use(`/api/v1/watch`, watchRouter)
import { gameRouter } from './routers/game'
app.use(`/api/v1/game`, gameRouter)

// Error Handling
import { errors } from './middleware/error'
app.use(errors)

// Starting Function
const startServer = () => {
    app.listen(API_PORT, () => {
        apiLog.info(`Listening on port: ${API_PORT}!`)
    })
}

export { startServer, apiLog }