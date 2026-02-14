<script setup lang="ts">
import { ref, computed } from 'vue'
import './ShoppingCart.scss'

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
        <div class="shopping-cart__badge">🛒 Remote: Cart Microfrontend</div>

        <div v-if="cartItems.length === 0" class="shopping-cart__empty">
            <div class="shopping-cart__empty-icon">🛒</div>
            <h3 class="shopping-cart__empty-title">Your cart is empty</h3>
            <p class="shopping-cart__empty-text">Add some products to get started!</p>
        </div>

        <div v-else class="shopping-cart__content">
            <div class="shopping-cart__items">
                <div v-for="item in cartItems" :key="item.id" class="cart-item">
                    <div class="cart-item__image">
                        {{ item.image }}
                    </div>
                    <div class="cart-item__details">
                        <h3 class="cart-item__name">{{ item.name }}</h3>
                        <p class="cart-item__price">${{ item.price.toFixed(2) }}</p>
                    </div>
                    <div class="cart-item__quantity">
                        <button class="cart-item__qty-btn" @click="updateQuantity(item.id, -1)">-</button>
                        <span class="cart-item__qty-value">{{ item.quantity }}</span>
                        <button class="cart-item__qty-btn" @click="updateQuantity(item.id, 1)">+</button>
                    </div>
                    <div class="cart-item__total">${{ (item.price * item.quantity).toFixed(2) }}</div>
                    <button class="cart-item__remove-btn" title="Remove item" @click="removeItem(item.id)">✕</button>
                </div>
            </div>

            <div class="cart-summary">
                <h3 class="cart-summary__title">Order Summary</h3>
                <div class="cart-summary__row">
                    <span>Subtotal:</span>
                    <span>${{ subtotal.toFixed(2) }}</span>
                </div>
                <div class="cart-summary__row">
                    <span>Tax (10%):</span>
                    <span>${{ tax.toFixed(2) }}</span>
                </div>
                <div class="cart-summary__row cart-summary__row--total">
                    <span>Total:</span>
                    <span>${{ total.toFixed(2) }}</span>
                </div>
                <button class="cart-summary__checkout-btn" @click="checkout">Proceed to Checkout</button>
            </div>
        </div>
    </div>
</template>
