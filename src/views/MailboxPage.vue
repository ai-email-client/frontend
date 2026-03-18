<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  watch
} from 'vue'

import EmailList from '../components/EmailList.vue'
import EmailDetail from '../components/EmailDetail.vue'
import Divider from '../components/Divider.vue'
import EmailComposer from '../components/EmailComposer.vue'
import type { UserProfile } from '../interface/user'



import emailService from '../services/email'
import { DifySummary } from '../interface/dify'
import { Message } from '../interface/email'
import { useUiStore } from '../stores/uiStore'
import { useComposerStore } from '../stores/composerStore'
import { useRoute } from 'vue-router'

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
const route = useRoute()
const uiStore = useUiStore()
const composerStore = useComposerStore()

// ── State ──
const containerRef = ref<HTMLElement | null>(null)
const emailList = ref<Message[]>([])
const selectedEmail = ref<Message | null>(null)
// const isLoadingEmail = ref(false)
const summary = ref<DifySummary | null>(null)

// ── Layout Control ──
const MIN_PX  = 80
const MAX_PX  = 800
const SNAP_PX = 140

const currentWidth = computed({
  get: () => props.listWidth,
  set: (val) => emit('update:listWidth', val)
})

const collapsed   = computed(() => currentWidth.value <= MIN_PX + 4)
const showViewer  = computed(() => selectedEmail.value !== null)

// Params
const labels = computed(() => {
    if (route.meta.labels) {
        return route.meta.labels as string[]
    }
    return ['SENT']
})

const limit             = 20
const query             = ''
const includeSpamTrash  = false
const format            = 'full'
const metadataHeaders   : string[] = []

const nextPageToken   = ref<string | null>(null)
const stackToken      = ref<string[]>([""])
const currentPage     = ref(0)
const totalMessage    = ref(1)

const fetchEmails = async (
  labelIds: string[],
  maxResults: number,
  pageToken: string,
  query: string,
  includeSpamTrash: boolean,
  format: string,
  metadataHeaders: string[]
) => {
  try {
    uiStore.setLoading(true)
    selectedEmail.value = null
    getTotalMessage()
    const response = await emailService.fetchEmails(
      labelIds, maxResults, pageToken, query, includeSpamTrash, format, metadataHeaders
    )
    nextPageToken.value = response.nextPageToken
    if (!stackToken.value.includes(response.nextPageToken)) {
      stackToken.value.push(response.nextPageToken)
    }
    emailList.value = response.messages

  } catch (error) {
    console.error('Failed to fetch emails', error)
  } finally {
    uiStore.setLoading(false)
  }
}

const nextPage = async () => {
  if (!nextPageToken.value && currentPage.value >= stackToken.value.length - 1) return
  currentPage.value++
  emailList.value = []
  await fetchEmails(
      labels.value,
      limit,
      stackToken.value[currentPage.value],
      query,
      includeSpamTrash,
      format,
      metadataHeaders
  )
}

const prevPage = async () => {
  if (currentPage.value === 0) return
  currentPage.value--
  emailList.value = []
  await fetchEmails(
      labels.value,
      limit,
      stackToken.value[currentPage.value],
      query,
      includeSpamTrash,
      format,
      metadataHeaders
  )
}

const getTotalMessage = async () => {
  const response = await emailService.getLabelById(labels.value[0])
  if (response.messagesTotal) totalMessage.value = response.messagesTotal
}

const handleOpenReplyComposer = () => {
  composerStore.openComposer('reply', null, selectedEmail.value)
}

const handleOpenForwardComposer = () => {
  composerStore.openComposer('forward', null, selectedEmail.value)
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

const handleSelectEmail = async (email: Message) => {
  try {
    uiStore.setLoading(true)
    selectedEmail.value = email
  } catch (error) {
    console.error('Failed to fetch email', error)
  } finally {
    uiStore.setLoading(false)
  }
}

const handleCollapse = () => { currentWidth.value = MIN_PX }
const handleExpand   = () => { currentWidth.value = 450 }

onMounted(() => {
  if (localStorage.getItem('jwt_token')) {
    fetchEmails(
      labels.value,
      limit,
      stackToken.value[currentPage.value],
      query,
      includeSpamTrash,
      format,
      metadataHeaders
    )
  }
  getTotalMessage()
})

watch(
  () => route.fullPath,
  () => {
    stackToken.value = ['']
    currentPage.value = 0
    totalMessage.value = 1
    emailList.value = []
    selectedEmail.value = null
    getTotalMessage()
    fetchEmails(labels.value, limit, '', query, includeSpamTrash, format, metadataHeaders)
    
  }
)

</script>

<template>
  <div
    ref="containerRef"
    class="flex-1 flex overflow-hidden"
  >
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
        @refresh="() => fetchEmails(
          labels,
          limit,
          stackToken[currentPage],
          query,
          includeSpamTrash,
          format,
          metadataHeaders
        )"
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
      class="flex-col flex-1 min-w-0"
      :class="showViewer ? 'flex' : 'hidden md:flex'"
    >
      <EmailDetail
        :email="selectedEmail"
        :summary="summary"
        :loading="uiStore.isLoading"
        :dark-mode="darkMode"
        @reply-email="handleOpenReplyComposer"
        @forward-email="handleOpenForwardComposer"
      />
      <div class="fixed w-[50%] bottom-0 right-10 z-50">
        <EmailComposer />
      </div>
    </div>
  </div>
</template>
