<script setup lang="ts">
import { computed } from 'vue'

interface Props {
    variant?: 'primary' | 'secondary' | 'danger'
    size?: 'small' | 'medium' | 'large'
    disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
    variant: 'primary',
    size: 'medium',
    disabled: false
})

const buttonClass = computed(() => {
    return [
        'shared-button',
        `shared-button--${props.variant}`,
        `shared-button--${props.size}`,
        { 'shared-button--disabled': props.disabled }
    ]
})
</script>

<template>
    <button :class="buttonClass" :disabled="disabled">
        <slot />
    </button>
</template>

<style scoped>
.shared-button {
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: inherit;
}

.shared-button--small {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.shared-button--medium {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
}

.shared-button--large {
    padding: 1rem 2rem;
    font-size: 1.125rem;
}

.shared-button--primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    box-shadow: 0 4px 6px rgba(102, 126, 234, 0.3);
}

.shared-button--primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(102, 126, 234, 0.4);
}

.shared-button--secondary {
    background: white;
    color: #667eea;
    border: 2px solid #667eea;
}

.shared-button--secondary:hover:not(:disabled) {
    background: #667eea;
    color: white;
}

.shared-button--danger {
    background: #c62828;
    color: white;
    box-shadow: 0 4px 6px rgba(198, 40, 40, 0.3);
}

.shared-button--danger:hover:not(:disabled) {
    background: #b71c1c;
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(198, 40, 40, 0.4);
}

.shared-button--disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.shared-button:active:not(:disabled) {
    transform: translateY(0);
}
</style>
