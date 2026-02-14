export default defineEventHandler((event) => {
    // Add CORS headers to all responses
    setResponseHeaders(event, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, HEAD, PUT, PATCH, POST, DELETE',
        'Access-Control-Allow-Headers': '*',
        'Access-Control-Allow-Credentials': 'true'
    })

    // Handle preflight OPTIONS requests
    if (event.method === 'OPTIONS') {
        return ''
    }
})
