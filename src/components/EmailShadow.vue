<script setup lang="ts">
import { ref, onMounted, watch, computed, nextTick } from 'vue'
import { Attachment } from '../interface/email';
import { resolveCidImages, sanitizeHtml } from '../utils';

const props = defineProps<{
  content?: string
  attachments: Attachment[]
}>()

const host = ref<HTMLElement | null>(null)
// const hasImage = computed(() => 
//   props.attachments?.some(att => att.mimeType?.startsWith('image/'))
// )

const updateShadowDom = () => {
  if (!host.value || !props.content) return

  const withImages = resolveCidImages(props.content, props.attachments)
  const cleanHtml = sanitizeHtml(withImages)

  // const imgStyle = hasImage.value 
  //   ? `img { 
  //       max-width: 100% !important; 
  //       height: auto !important; 
  //       display: block;
  //       margin: 1.5rem auto; /* จัดกึ่งกลางสวยๆ */
  //       box-shadow: 0 4px 12px rgba(0,0,0,0.1); /* เพิ่มเงาให้รูปดูเด่นขึ้น */
  //       border-radius: 8px;
  //     }`
  //   : `img { max-width: 100%; height: auto; }`;

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