<script setup lang="ts">
import { ref } from 'vue'
import './ProductList.scss'

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
        <div class="product-list__badge">📦 Remote: Products Microfrontend</div>

        <div class="product-list__grid">
            <div v-for="product in products" :key="product.id" class="product-list__card">
                <div class="product-list__card-image">
                    {{ product.image }}
                </div>
                <div class="product-list__card-info">
                    <h3 class="product-list__card-name">{{ product.name }}</h3>
                    <p class="product-list__card-category">{{ product.category }}</p>
                    <div class="product-list__card-footer">
                        <span class="product-list__card-price">${{ product.price.toFixed(2) }}</span>
                        <button class="product-list__add-btn" @click="addToCart(product)">Add to Cart</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
