import express from 'express'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const port = process.env.PORT || 3000

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested')
  res.status(200).send('OK')
})

// Serve static files from dist directory
app.use(express.static(join(__dirname, 'dist')))

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'))
})

// Start server
const server = app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`)
  console.log(`🏥 Health check available at http://0.0.0.0:${port}/health`)
  console.log(`🌐 App available at http://0.0.0.0:${port}`)
})

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully')
  server.close(() => {
    console.log('Server closed')
    process.exit(0)
  })
})
