<template>
    <div class="remote-app">
        <header class="remote-header">
            <h1>🛒 Cart Microfrontend</h1>
            <p>This is a standalone remote application</p>
        </header>

        <main class="remote-main">
            <ShoppingCart />
        </main>
    </div>
</template>

<style scoped>
.remote-app {
    min-height: 100vh;
    background: #f8f9fa;
}

.remote-header {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    color: white;
    padding: 2rem;
    text-align: center;
}

.remote-header h1 {
    margin: 0 0 0.5rem 0;
    font-size: 2rem;
}

.remote-header p {
    margin: 0;
    opacity: 0.9;
}

.remote-main {
    padding: 2rem;
    max-width: 1200px;
    margin: 0 auto;
}
</style>
