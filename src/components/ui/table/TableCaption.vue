<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <caption :class="cn('mt-4 text-sm text-zinc-500 dark:text-zinc-400', props.class)">
    <slot />
  </caption>
</template>
