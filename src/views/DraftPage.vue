<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import EmailList from '../components/EmailList.vue'
import Divider from '../components/Divider.vue'
import EmailComposer from '../components/EmailComposer.vue'
import type { UserProfile } from '../interface/user'
import type { Message, Draft } from '../interface/email'
import emailService from '../services/email'
import { useUiStore } from '../stores/uiStore'
import { useComposerStore } from '../stores/composerStore'

const props = defineProps({
  user:      { type: Object as () => UserProfile, default: null },
  darkMode:  { type: Boolean, default: false },
  listWidth: { type: Number, default: 450 }
})

const emit = defineEmits(['update:listWidth'])
const uiStore        = useUiStore()
const composerStore  = useComposerStore()

const containerRef  = ref<HTMLElement | null>(null)
const draftList     = ref<Draft[]>([])
const emailList     = ref<Message[]>([])

const MIN_PX  = 80
const MAX_PX  = 800
const SNAP_PX = 140

const currentWidth = computed({
  get: () => props.listWidth,
  set: (val) => emit('update:listWidth', val)
})
const collapsed = computed(() => currentWidth.value <= MIN_PX + 4)

const labels           = ['DRAFT']
const limit            = 20
const includeSpamTrash = false
const format           = 'full'
const metadataHeaders: string[] = []

const nextPageToken = ref<string | null>(null)
const stackToken    = ref<string[]>([''])
const currentPage   = ref(0)
const totalMessage  = ref(1)

const fetchEmails = async (pageToken = '') => {
  try {
    uiStore.setLoading(true)
    await getTotalMessage()
    const response = await emailService.getDrafts(
      limit, pageToken, '', includeSpamTrash, format, metadataHeaders
    )
    nextPageToken.value = response.nextPageToken
    if (!stackToken.value.includes(response.nextPageToken)) {
      stackToken.value.push(response.nextPageToken)
    }
    draftList.value = response.drafts
    emailList.value = response.drafts.map(draft => draft.message)
    
  } catch (error) {
    console.error('Failed to fetch drafts', error)
  } finally {
    uiStore.setLoading(false)
  }
}

const getTotalMessage = async () => {
  const response = await emailService.getLabelById(labels[0])
  if (response.messagesTotal) totalMessage.value = response.messagesTotal
}

const nextPage = async () => {
  if (!nextPageToken.value && currentPage.value >= stackToken.value.length - 1) return
  currentPage.value++
  draftList.value = []
  await fetchEmails(stackToken.value[currentPage.value])
}

const prevPage = async () => {
  if (currentPage.value === 0) return
  currentPage.value--
  draftList.value = []
  await fetchEmails(stackToken.value[currentPage.value])
}


const handleSelectEmail = async (email: Message) => {
  try {
    uiStore.setLoading(true)
    const draft = draftList.value.find(d => d.message?.id === email.id)
    if (!draft) return

    const fullDraft = await emailService.getDraftById(draft.id)
    composerStore.openComposer('edit', fullDraft.id, fullDraft.message)
  } catch (error) {
    console.error('Failed to fetch draft', error)
  } finally {
    uiStore.setLoading(false)
  }
}

const handleDrag = (clientX: number) => {
  if (!containerRef.value) return
  const { left, width } = containerRef.value.getBoundingClientRect()
  const raw = clientX - left
  const newWidth = raw < SNAP_PX
    ? MIN_PX
    : Math.min(Math.max(raw, MIN_PX), Math.min(MAX_PX, width * 0.75))
  currentWidth.value = newWidth
}

const handleCollapse = () => { currentWidth.value = MIN_PX }
const handleExpand   = () => { currentWidth.value = 450 }

onMounted(() => {
  if (localStorage.getItem('jwt_token')) fetchEmails()
})
</script>

<template>
  <div ref="containerRef" class="flex-1 flex overflow-hidden">

    <div
      :style="{ width: `${currentWidth}px`, minWidth: `${MIN_PX}px`, flexShrink: 0 }"
      class="flex flex-col overflow-hidden transition-none"
    >
      <EmailList
        :emails="emailList"
        :selected-email="null"
        :loading="uiStore.isLoading"
        :current-page="currentPage + 1"
        :total-message="totalMessage"
        :limit="limit"
        :dark-mode="darkMode"
        :collapsed="collapsed"
        @select="handleSelectEmail"
        @refresh="fetchEmails(stackToken[currentPage])"
        @prev-page="prevPage"
        @next-page="nextPage"
        @draft-email="() => composerStore.openComposer('new')"
      />
    </div>

    <div class="hidden md:block">
      <Divider
        :dark-mode="darkMode"
        @drag="handleDrag"
        @collapse="handleCollapse"
        @expand="handleExpand"
      />
    </div>

    <div class="flex-col flex-1 min-w-0 hidden md:flex items-center justify-center">
      <p class="text-gray-400 text-s">Select a draft to edit</p>
    </div>

    <div class="fixed w-[90%] bottom-0 right-10 z-50">
      <EmailComposer />
    </div>

  </div>
</template>