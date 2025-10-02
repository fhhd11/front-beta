import express from 'express'

const app = express()
const port = process.env.PORT || 3000

// Health check endpoint
app.get('/health', (req, res) => {
  console.log('Health check requested')
  res.status(200).send('OK')
})

// Simple test endpoint
app.get('/', (req, res) => {
  res.send('Hello from Railway!')
})

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Test server running on port ${port}`)
  console.log(`🏥 Health check: http://0.0.0.0:${port}/health`)
  console.log(`🌐 App: http://0.0.0.0:${port}`)
})
