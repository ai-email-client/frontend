<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

const props = defineProps<{
  content: string
}>()

const host = ref<HTMLElement | null>(null)

const updateShadowDom = () => {
  if (!host.value || !props.content) return

  const shadow = host.value.shadowRoot || host.value.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>
      :host {
        display: block;
        all: initial;
        font-family: sans-serif;
        overflow-x: auto;
        background-color: white;
        color: black;
      }
      img { max-width: 100%; height: auto; }
      a { color: #0000EE; text-decoration: underline; cursor: pointer; }
    </style>
    ${props.content}
  `
}

onMounted(() => {
  updateShadowDom()
})

watch(() => props.content, () => {
  updateShadowDom()
})
</script>

<template>
  <div ref="host" class="email-shadow-host w-full"></div>
</template>