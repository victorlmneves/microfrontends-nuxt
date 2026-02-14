<script setup lang="ts">
import { ref } from 'vue'

interface Product {
    id: number
    name: string
    price: number
    category: string
    image: string
}

const products = ref<Product[]>([
    {
        id: 1,
        name: 'Wireless Headphones',
        price: 99.99,
        category: 'Electronics',
        image: '🎧'
    },
    {
        id: 2,
        name: 'Smart Watch',
        price: 249.99,
        category: 'Electronics',
        image: '⌚'
    },
    {
        id: 3,
        name: 'Laptop Backpack',
        price: 49.99,
        category: 'Accessories',
        image: '🎒'
    },
    {
        id: 4,
        name: 'USB-C Cable',
        price: 19.99,
        category: 'Accessories',
        image: '🔌'
    },
    {
        id: 5,
        name: 'Mechanical Keyboard',
        price: 129.99,
        category: 'Electronics',
        image: '⌨️'
    },
    {
        id: 6,
        name: 'Wireless Mouse',
        price: 39.99,
        category: 'Electronics',
        image: '🖱️'
    }
])

const addToCart = (product: Product) => {
    alert(`Added "${product.name}" to cart! (This would integrate with the Cart microfrontend)`)
}
</script>

<template>
    <div class="product-list">
        <div class="remote-badge">📦 Remote: Products Microfrontend</div>

        <div class="products-grid">
            <div v-for="product in products" :key="product.id" class="product-card">
                <div class="product-image">
                    {{ product.image }}
                </div>
                <div class="product-info">
                    <h3 class="product-name">{{ product.name }}</h3>
                    <p class="product-category">{{ product.category }}</p>
                    <div class="product-footer">
                        <span class="product-price">${{ product.price.toFixed(2) }}</span>
                        <button class="add-to-cart-btn" @click="addToCart(product)">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-list {
    width: 100%;
}

.remote-badge {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    display: inline-block;
    margin-bottom: 2rem;
    font-weight: 600;
    box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
}

.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
    border: 1px solid #e0e0e0;
}

.product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.15);
}

.product-image {
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    height: 180px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 5rem;
}

.product-info {
    padding: 1.5rem;
}

.product-name {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.25rem;
    font-weight: 600;
}

.product-category {
    margin: 0 0 1rem 0;
    color: #888;
    font-size: 0.9rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.product-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 1rem;
}

.product-price {
    font-size: 1.5rem;
    font-weight: 700;
    color: #667eea;
}

.add-to-cart-btn {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);
}

.add-to-cart-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
}

.add-to-cart-btn:active {
    transform: translateY(0);
}
</style>
