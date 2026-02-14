<template>
    <div class="home-page">
        <h2>Welcome to Microfrontends with Nuxt</h2>
        <p class="intro">This is a demonstration of Module Federation with Nuxt 3 in a Turborepo monorepo.</p>

        <div class="features">
            <div class="feature-card">
                <h3>🏠 Host App</h3>
                <p>This is the main application that orchestrates the microfrontends</p>
            </div>

            <div class="feature-card">
                <h3>🛍️ Products Remote</h3>
                <p>A separate application exposing product catalog functionality</p>
            </div>

            <div class="feature-card">
                <h3>🛒 Cart Remote</h3>
                <p>A separate application managing shopping cart features</p>
            </div>
        </div>

        <div class="tech-stack">
            <h3>Tech Stack</h3>
            <ul>
                <li>Nuxt 3 - Vue.js framework</li>
                <li>Module Federation - Runtime code sharing</li>
                <li>Turborepo - Monorepo build system</li>
                <li>TypeScript - Type safety</li>
            </ul>
        </div>
    </div>
</template>

<style scoped>
.home-page {
    animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

h2 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 2.5rem;
}

.intro {
    font-size: 1.2rem;
    color: #666;
    margin-bottom: 3rem;
}

.features {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
}

.feature-card {
    background: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
}

.feature-card h3 {
    margin-top: 0;
    color: #667eea;
    font-size: 1.5rem;
}

.tech-stack {
    background: #f8f9fa;
    padding: 2rem;
    border-radius: 8px;
    border-left: 4px solid #667eea;
}

.tech-stack h3 {
    margin-top: 0;
    color: #333;
}

.tech-stack ul {
    list-style: none;
    padding: 0;
}

.tech-stack li {
    padding: 0.5rem 0;
    color: #555;
    font-size: 1.1rem;
}

.tech-stack li::before {
    content: '✓ ';
    color: #667eea;
    font-weight: bold;
    margin-right: 0.5rem;
}
</style>
