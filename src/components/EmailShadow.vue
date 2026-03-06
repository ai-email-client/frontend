<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue'
import { Attachment } from '../interface/email';
import { resolveCidImages, sanitizeHtml } from '../utils';

const props = defineProps<{
  content?: string
  attachments: Attachment[]
}>()

const host = ref<HTMLElement | null>(null)

const updateShadowDom = () => {
  if (!host.value || !props.content) return

  const withImages = resolveCidImages(props.content, props.attachments)
  const cleanHtml = sanitizeHtml(withImages)

  const shadow = host.value.shadowRoot || host.value.attachShadow({ mode: 'open' })
  shadow.innerHTML = `
    <style>
      :host { 
        display: block; 
        all: initial; 
        font-family: sans-serif; 
        color: black; 
        background-color: #ffffff;
        line-height: 1.6;
      }
      .email-wrapper { overflow-x: auto; width: 100%; padding: 10px; box-sizing: border-box; }
      a { color: #0000EE; text-decoration: underline; }
    </style>
    <div class="email-wrapper">
      ${cleanHtml}
    </div>
  `
}

onMounted(() => {
  updateShadowDom()
})

watch(
  [() => props.content, () => props.attachments], 
  () => {
    nextTick(() => {
      updateShadowDom()
    })
  }, 
  { deep: true }
)
</script>

<template>
  <div ref="host" class="email-shadow-host w-full"></div>
</template>