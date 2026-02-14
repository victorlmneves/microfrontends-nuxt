/**
 * Dynamically load CSS from a remote URL
 * @param url - The URL of the CSS file to load
 * @returns Promise that resolves when the CSS is loaded
 */
export function loadRemoteCSS(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
        // Check if CSS is already loaded
        const existingLink = document.querySelector(`link[href="${url}"]`)

        if (existingLink) {
            resolve()

            return
        }

        // Create a new link element
        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = url

        link.onload = () => resolve()
        link.onerror = () => reject(new Error(`Failed to load CSS: ${url}`))

        // Append to head
        document.head.appendChild(link)
    })
}

/**
 * Load all CSS files from a remote's _nuxt directory
 * @param remoteUrl - The base URL of the remote (e.g., 'http://localhost:3001')
 */
export async function loadRemoteStyles(remoteUrl: string): Promise<void> {
    try {
        console.log(`[CSS Loader] Discovering CSS files from ${remoteUrl}...`)
        
        // Fetch the _nuxt directory listing
        const response = await fetch(`${remoteUrl}/_nuxt/`)
        const html = await response.text()

        // Extract CSS filenames using a simpler pattern that matches style.xxxxx.css
        const cssPattern = /\b(style\.[\w-]+\.css)\b/g
        const matches = html.match(cssPattern) || []
        
        // Build full URLs and remove duplicates
        const cssUrls = [...new Set(matches)].map(
            (filename) => `${remoteUrl}/_nuxt/${filename}`
        )

        if (cssUrls.length === 0) {
            console.warn(`[CSS Loader] No CSS files found at ${remoteUrl}`)
            return
        }

        console.log(`[CSS Loader] Found ${cssUrls.length} CSS file(s):`, cssUrls)

        // Load all CSS files
        await Promise.all(cssUrls.map((url) => loadRemoteCSS(url)))

        console.log(`✅ [CSS Loader] Successfully loaded ${cssUrls.length} CSS file(s) from ${remoteUrl}`)
    } catch (error) {
        console.error(`❌ [CSS Loader] Failed to load styles from ${remoteUrl}:`, error)
    }
}
