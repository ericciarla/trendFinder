import express from 'express'
import cors from 'cors'
import { handleCron } from '../controllers/cron'
import configRouter from '../routes/config'

const app = express()
app.use(cors())
app.use(express.json())

// Mount config routes
app.use('/api', configRouter)

// Original cron endpoint
app.post('/api/cron', async (req, res) => {
  try {
    await handleCron()
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to run cron' })
  }
})

app.listen(3001, () => {
  console.log('API server running on port 3001')
}) 