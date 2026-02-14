<script setup lang="ts">
import { ref, computed } from 'vue'

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

<style scoped>
.shopping-cart {
    width: 100%;
}

.remote-badge {
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    color: white;
    padding: 0.75rem 1.5rem;
    border-radius: 25px;
    display: inline-block;
    margin-bottom: 2rem;
    font-weight: 600;
    box-shadow: 0 4px 6px rgba(118, 75, 162, 0.3);
}

.empty-cart {
    text-align: center;
    padding: 4rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.empty-icon {
    font-size: 5rem;
    margin-bottom: 1rem;
    opacity: 0.3;
}

.empty-cart h3 {
    color: #333;
    margin-bottom: 0.5rem;
}

.empty-cart p {
    color: #666;
}

.cart-content {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
}

.cart-items {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.cart-item {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    display: grid;
    grid-template-columns: auto 1fr auto auto auto;
    gap: 1.5rem;
    align-items: center;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
}

.cart-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.item-image {
    font-size: 3rem;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    border-radius: 8px;
}

.item-details {
    flex: 1;
}

.item-name {
    margin: 0 0 0.5rem 0;
    color: #333;
    font-size: 1.1rem;
}

.item-price {
    margin: 0;
    color: #666;
    font-size: 0.95rem;
}

.item-quantity {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    background: #f5f5f5;
    padding: 0.5rem;
    border-radius: 25px;
}

.qty-btn {
    background: white;
    border: 1px solid #ddd;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    cursor: pointer;
    font-weight: bold;
    transition: all 0.2s ease;
}

.qty-btn:hover {
    background: #764ba2;
    color: white;
    border-color: #764ba2;
}

.qty-value {
    min-width: 30px;
    text-align: center;
    font-weight: 600;
}

.item-total {
    font-weight: 700;
    font-size: 1.2rem;
    color: #764ba2;
    min-width: 100px;
    text-align: right;
}

.remove-btn {
    background: #ffebee;
    color: #c62828;
    border: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.2s ease;
}

.remove-btn:hover {
    background: #c62828;
    color: white;
}

.cart-summary {
    background: white;
    border-radius: 12px;
    padding: 2rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    height: fit-content;
    position: sticky;
    top: 2rem;
}

.cart-summary h3 {
    margin: 0 0 1.5rem 0;
    color: #333;
    font-size: 1.5rem;
}

.summary-row {
    display: flex;
    justify-content: space-between;
    padding: 0.75rem 0;
    border-bottom: 1px solid #eee;
    color: #666;
}

.total-row {
    border-bottom: none;
    padding-top: 1rem;
    margin-top: 0.5rem;
    border-top: 2px solid #333;
    font-weight: 700;
    font-size: 1.3rem;
    color: #333;
}

.checkout-btn {
    width: 100%;
    background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
    color: white;
    border: none;
    padding: 1rem;
    border-radius: 8px;
    font-weight: 600;
    font-size: 1.1rem;
    cursor: pointer;
    margin-top: 1.5rem;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(118, 75, 162, 0.3);
}

.checkout-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(118, 75, 162, 0.4);
}

@media (max-width: 768px) {
    .cart-content {
        grid-template-columns: 1fr;
    }

    .cart-item {
        grid-template-columns: auto 1fr auto;
        gap: 1rem;
    }

    .item-quantity {
        grid-column: 2;
    }

    .item-total {
        grid-column: 2;
        text-align: left;
    }

    .remove-btn {
        grid-column: 3;
        grid-row: 1;
    }
}
</style>
