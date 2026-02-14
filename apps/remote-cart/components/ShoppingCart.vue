<script setup lang="ts">
import { ref, computed } from 'vue'
import './ShoppingCart.css'

interface CartItem {
    id: number
    name: string
    price: number
    quantity: number
    image: string
}

const cartItems = ref<CartItem[]>([
    {
        id: 1,
        name: 'Wireless Headphones',
        price: 99.99,
        quantity: 1,
        image: '🎧'
    },
    {
        id: 2,
        name: 'Smart Watch',
        price: 249.99,
        quantity: 2,
        image: '⌚'
    },
    {
        id: 3,
        name: 'USB-C Cable',
        price: 19.99,
        quantity: 3,
        image: '🔌'
    }
])

const subtotal = computed(() => {
    return cartItems.value.reduce((sum: number, item: CartItem) => {
        return sum + item.price * item.quantity
    }, 0)
})

const tax = computed(() => subtotal.value * 0.1)
const total = computed(() => subtotal.value + tax.value)

const updateQuantity = (itemId: number, delta: number) => {
    const item = cartItems.value.find((i: CartItem) => i.id === itemId)

    if (item) {
        item.quantity = Math.max(1, item.quantity + delta)
    }
}

const removeItem = (itemId: number) => {
    const index = cartItems.value.findIndex((i: CartItem) => i.id === itemId)
    if (index !== -1) {
        cartItems.value.splice(index, 1)
    }
}

const checkout = () => {
    alert(`Checkout total: $${total.value.toFixed(2)}`)
}
</script>

<template>
    <div class="shopping-cart">
        <div class="remote-badge">🛒 Remote: Cart Microfrontend</div>

        <div v-if="cartItems.length === 0" class="empty-cart">
            <div class="empty-icon">🛒</div>
            <h3>Your cart is empty</h3>
            <p>Add some products to get started!</p>
        </div>

        <div v-else class="cart-content">
            <div class="cart-items">
                <div v-for="item in cartItems" :key="item.id" class="cart-item">
                    <div class="item-image">
                        {{ item.image }}
                    </div>
                    <div class="item-details">
                        <h3 class="item-name">{{ item.name }}</h3>
                        <p class="item-price">${{ item.price.toFixed(2) }}</p>
                    </div>
                    <div class="item-quantity">
                        <button class="qty-btn" @click="updateQuantity(item.id, -1)">-</button>
                        <span class="qty-value">{{ item.quantity }}</span>
                        <button class="qty-btn" @click="updateQuantity(item.id, 1)">+</button>
                    </div>
                    <div class="item-total">${{ (item.price * item.quantity).toFixed(2) }}</div>
                    <button class="remove-btn" @click="removeItem(item.id)" title="Remove item">✕</button>
                </div>
            </div>

            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>${{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="summary-row">
                    <span>Tax (10%):</span>
                    <span>${{ tax.toFixed(2) }}</span>
                </div>
                <div class="summary-row total-row">
                    <span>Total:</span>
                    <span>${{ total.toFixed(2) }}</span>
                </div>
                <button class="checkout-btn" @click="checkout">Proceed to Checkout</button>
            </div>
        </div>
    </div>
</template>
