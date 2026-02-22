<script setup lang="ts">
import {
  ref,
  onMounted,
  computed,
  watch
} from 'vue'
import {
  useRoute
} from 'vue-router'

import EmailList from '../components/EmailList.vue'
import EmailDetail from '../components/EmailDetail.vue'
import Divider from '../components/Divider.vue'

import {
  EmailShortResponse,
  EmailDetailResponse
} from '../interface/response'

import { useLabelStore } from '../stores/categoryStore'
import emailService from '../services/email'
import databaseService from '../services/database'
import { DifySummary } from '../interface/dify'

const route = useRoute()
const labelStore = useLabelStore()

const props = defineProps<{
  darkMode: boolean
  listWidth: number
}>()

const emit = defineEmits(['update:listWidth'])

// ── State ──
const containerRef = ref<HTMLElement | null>(null)
const emailList = ref<EmailShortResponse[]>([])
const selectedEmail = ref<EmailDetailResponse | null>(null)
const isLoadingEmail = ref(false)
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

const loading         = ref(false)
const limit           = 5
const nextPageToken   = ref<string | null>(null)
const stackToken      = ref<(string | null)[]>([null])
const currentPage     = ref(0)
const totalMessage    = ref(1)

const getCurrentLabel = () => {
  const currentCategoryName = route.params.category as string
  return [labelStore.getLabelIdByName(currentCategoryName.toLowerCase()) || '']
}

const resetPagination = () => {
  emailList.value = []
  currentPage.value   = 0
  totalMessage.value  = 1
  stackToken.value    = [null]
  nextPageToken.value = null
}

const fetchEmails = async (
  labels: string[],
  limit: number,
  pageToken: string | null,
  q: string | null,
  is_next: boolean = false
) => {
  loading.value = true
  selectedEmail.value = null
  getTotalMessage()
  try {
    const newEmails = await emailService.fetchEmails(labels, limit, pageToken, q, is_next)
    emailList.value = newEmails.messages
    nextPageToken.value = newEmails.page_token
    loading.value = false
  } catch (error) {
    console.error('Failed to fetch emails', error)
  }
}

const getEmailById = async (msgId: string) => {
  if (!msgId) return
  isLoadingEmail.value = true
  selectedEmail.value = null
  summary.value = null
  const response = await emailService.getMessageByID(msgId)
  selectedEmail.value = response
  const summary_exists = await databaseService.get_summary(msgId)
  if (summary_exists) summary.value = summary_exists
  isLoadingEmail.value = false
}

const nextPage = async () => {
  if (!nextPageToken.value && currentPage.value >= stackToken.value.length - 1) return
  currentPage.value++
  emailList.value = []
  const targetPage = currentPage.value
  let tokenToUse: string | null = null
  if (targetPage < stackToken.value.length) {
    tokenToUse = stackToken.value[targetPage]
  } else {
    tokenToUse = nextPageToken.value
  }
  await fetchEmails(getCurrentLabel(), limit, tokenToUse, null, true)
  if (targetPage >= stackToken.value.length) stackToken.value.push(tokenToUse)
}

const prevPage = async () => {
  if (currentPage.value === 0) return
  currentPage.value--
  emailList.value = []
  const tokenToUse = stackToken.value[currentPage.value]
  await fetchEmails(getCurrentLabel(), limit, tokenToUse, null, true)
}

const getTotalMessage = async () => {
  const response = await emailService.getLabelById(getCurrentLabel()[0])
  if (response.messagesTotal) totalMessage.value = response.messagesTotal
}

const handleDrag = (clientX: number) => {
  if (!containerRef.value) return
  const { left, width } = containerRef.value.getBoundingClientRect()
  const raw = clientX - left
  const newWidth = raw < SNAP_PX ? MIN_PX : Math.min(Math.max(raw, MIN_PX), Math.min(MAX_PX, width * 0.75))
  currentWidth.value = newWidth
}

const handleCollapse = () => { currentWidth.value = MIN_PX }
const handleExpand   = () => { currentWidth.value = 350 }

onMounted(() => {
  if (localStorage.getItem('jwt_token')) {
    fetchEmails(getCurrentLabel(), limit, stackToken.value[0], null)
  }
})

watch(() => route.params.category, () => {
  resetPagination()
  fetchEmails(getCurrentLabel(), limit, null, null)
}, { immediate: true })

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
        :selected-email="selectedEmail"
        :loading="loading"
        :current-page="currentPage + 1"
        :total-message="totalMessage"
        :limit="limit"
        :dark-mode="darkMode"
        :collapsed="collapsed"
        @select="(msgId: string) => getEmailById(msgId)"
        @refresh="() => fetchEmails(getCurrentLabel(), limit, stackToken[currentPage], null)"
        @prevPage="prevPage"
        @nextPage="nextPage"
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
        :loading="isLoadingEmail"
        :dark-mode="darkMode"
        @back="selectedEmail = null"
      />
    </div>
  </div>
</template>