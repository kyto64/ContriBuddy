<template>
  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
    {{ text }}
    <button
      @click="$emit('remove')"
      class="ml-2 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-primary-200 transition-colors"
      type="button"
    >
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    </button>
  </span>
</template>

<script setup lang="ts">
interface Props {
  text: string
}

defineProps<Props>()
defineEmits<{
  remove: []
}>()
</script>
