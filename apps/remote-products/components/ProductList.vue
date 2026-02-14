<script setup lang="ts">
import { ref } from 'vue'
import './ProductList.css'

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
