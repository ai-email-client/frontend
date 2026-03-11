<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  watch
} from 'vue'

import EmailList from '../components/EmailList.vue'
import Divider from '../components/Divider.vue'
import EmailComposer from '../components/EmailComposer.vue'
import type { UserProfile } from '../interface/user'

import emailService from '../services/email'
import { Draft, Message } from '../interface/email'
import { useUiStore } from '../stores/uiStore'
import { useComposerStore } from '../stores/composerStore'

const props = defineProps({
  user: {
    type: Object as () => UserProfile,
    default: null
  },
  darkMode: {
    type: Boolean,
    default: false
  },
  listWidth: {
    type: Number,
    default: 450
  }
})

const emit = defineEmits(['update:listWidth'])
const uiStore = useUiStore()
const composerStore = useComposerStore()

// ── State ──
const containerRef = ref<HTMLElement | null>(null)
const draftList = ref<Draft[]>([])
const emailList = ref<Message[]>([])

const selectedEmail = computed(() => composerStore.activeComposer?.message || null)

// ── Layout Control ──
const MIN_PX  = 80
const MAX_PX  = 800
const SNAP_PX = 140

const currentWidth = computed({
  get: () => props.listWidth,
  set: (val) => emit('update:listWidth', val)
})

const collapsed   = computed(() => currentWidth.value <= MIN_PX + 4)
const showViewer  = computed(() => composerStore.activeComposer !== null)

// Params
const labels            = ['DRAFT']
const limit             = 20
const query             = ''
const includeSpamTrash  = false
const format            = 'raw'
const metadataHeaders   : string[] = []

const nextPageToken   = ref<string | null>(null)
const stackToken      = ref<string[]>([""])
const currentPage     = ref(0)
const totalMessage    = ref(1)

const fetchEmails = async (
  maxResults: number,
  pageToken: string,
  query: string,
  includeSpamTrash: boolean,
  format: string,
  metadataHeaders: string[],
  isBackground = false 
) => {
  try {
    if (!isBackground) {
      uiStore.setLoading(true)
      resetPage()
    }
    
    getTotalMessage()
    const response = await emailService.getDrafts(
      maxResults, pageToken, query, includeSpamTrash, format, metadataHeaders
    )
    
    nextPageToken.value = response.nextPageToken || null
    if (response.nextPageToken && !stackToken.value.includes(response.nextPageToken)) {
      stackToken.value.push(response.nextPageToken)
    }

    if (response.drafts) {
      draftList.value = response.drafts
      emailList.value = response.drafts
        .map(draft => draft.message)
        .filter((msg): msg is Message => msg !== undefined && msg !== null)
    } else {
      draftList.value = []
      emailList.value = []
    }

  } catch (error) {
    console.error('Failed to fetch emails', error)
  } finally {
    if (!isBackground) uiStore.setLoading(false)
  }
}

const handleSelectEmail = async (email: Message) => {
  try {
    uiStore.setLoading(true)

    const draftObj = draftList.value.find(draft => draft.message?.id === email.id)
    const draftId = draftObj?.id || null

    composerStore.openComposer('edit', draftId, email)

  } catch (error) {
    console.error('Failed to open draft', error)
  } finally {
    uiStore.setLoading(false)
  }
}

const nextPage = async () => {
  if (!nextPageToken.value && currentPage.value >= stackToken.value.length - 1) return
  currentPage.value++
  emailList.value = []
  await fetchEmails(limit, stackToken.value[currentPage.value], query, includeSpamTrash, format, metadataHeaders)
}

const prevPage = async () => {
  if (currentPage.value === 0) return
  currentPage.value--
  emailList.value = []
  await fetchEmails(limit, stackToken.value[currentPage.value], query, includeSpamTrash, format, metadataHeaders)
}

const resetPage = () => {
  emailList.value = []
  draftList.value = []
}

const getTotalMessage = async () => {
  try {
    const response = await emailService.getLabelById(labels[0])
    if (response.messagesTotal) totalMessage.value = response.messagesTotal
  } catch (error) {
    console.error(error)
  }
}

const handleCompose = () => {
  composerStore.openComposer('new')
}

const handleDrag = (clientX: number) => {
  if (!containerRef.value) return
  const { left, width } = containerRef.value.getBoundingClientRect()
  const raw = clientX - left
  const newWidth = raw < SNAP_PX ? MIN_PX : Math.min(Math.max(raw, MIN_PX), Math.min(MAX_PX, width * 0.75))
  currentWidth.value = newWidth
}

const handleCollapse = () => { currentWidth.value = MIN_PX }
const handleExpand   = () => { currentWidth.value = 450 }

onMounted(() => {
  if (localStorage.getItem('jwt_token')) {
    fetchEmails(limit, stackToken.value[currentPage.value], query, includeSpamTrash, format, metadataHeaders)
  }
})

watch(() => composerStore.lastUpdated, () => {
  fetchEmails(limit, stackToken.value[currentPage.value], query, includeSpamTrash, format, metadataHeaders, true)
})
</script>

<template>
  <div ref="containerRef" class="flex-1 flex overflow-hidden">
    <div
      :style="{ width: `${currentWidth}px`, minWidth: `${MIN_PX}px`, flexShrink: 0 }"
      class="flex-col overflow-hidden transition-none"
      :class="showViewer ? 'hidden md:flex' : 'flex'"
    >
      <EmailList
        :emails="emailList"
        :selectedEmail="selectedEmail"
        :loading="uiStore.isLoading"
        :current-page="currentPage + 1"
        :total-message="totalMessage"
        :limit="limit"
        :dark-mode="darkMode"
        :collapsed="collapsed"
        @select="handleSelectEmail"
        @refresh="() => fetchEmails(limit, stackToken[currentPage], query, includeSpamTrash, format, metadataHeaders)"
        @prevPage="prevPage"
        @nextPage="nextPage"
        @draft-email="handleCompose"
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

    <div
      class="flex-col flex-1 min-w-0 bg-gray-50 relative"
      :class="showViewer ? 'flex' : 'hidden md:flex'"
    >
      <EmailComposer />
    </div>
  </div>
</template>