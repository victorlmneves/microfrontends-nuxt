<template>
    <div class="app-container">
        <header class="app-header">
            <h1>Microfrontends Demo - Host App</h1>
            <nav class="app-nav">
                <NuxtLink to="/">Home</NuxtLink>
                <NuxtLink to="/products">Products</NuxtLink>
                <NuxtLink to="/cart">Cart</NuxtLink>
            </nav>
        </header>

        <main class="app-main">
            <NuxtPage />
        </main>

        <footer class="app-footer">
            <p>&copy; 2024 Microfrontends Demo</p>
        </footer>
    </div>
</template>

<style scoped>
.app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.app-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 2rem;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
    margin: 0 0 1rem 0;
    font-size: 2rem;
}

.app-nav {
    display: flex;
    gap: 2rem;
}

.app-nav a {
    color: white;
    text-decoration: none;
    font-weight: 500;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    transition: background-color 0.3s ease;
}

.app-nav a:hover,
.app-nav a.router-link-active {
    background-color: rgba(255, 255, 255, 0.2);
}

.app-main {
    flex: 1;
    padding: 2rem;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
}

.app-footer {
    background-color: #f5f5f5;
    padding: 1.5rem;
    text-align: center;
    color: #666;
    border-top: 1px solid #e0e0e0;
}

.app-footer p {
    margin: 0;
}
</style>
