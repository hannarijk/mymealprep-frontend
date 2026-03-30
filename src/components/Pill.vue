<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{ tone?: 'default' | 'green' | 'purple' | 'amber' | 'rose' }>(),
  { tone: 'default' },
)

const toneClasses: Record<string, string> = {
  default: 'bg-white/70 text-slate-700 border-slate-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  purple: 'bg-violet-50 text-violet-700 border-violet-200',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  rose: 'bg-rose-50 text-rose-700 border-rose-200',
}

const classes = computed(() => toneClasses[props.tone] ?? toneClasses['default'])
</script>

<template>
  <span
    :class="[
      'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium',
      classes,
    ]"
  >
    <slot />
  </span>
</template>
