import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export default defineEventHandler(async (event) => {
    if (event.path === '/remoteEntry.js') {
        try {
            const file = await readFile(join(process.cwd(), '.output/public/remoteEntry.js'), 'utf-8')
            event.node.res.setHeader('Content-Type', 'application/javascript')
            event.node.res.setHeader('Access-Control-Allow-Origin', '*')
            return file
        } catch (error) {
            console.error('Error loading remoteEntry.js:', error)
        }
    }
})
