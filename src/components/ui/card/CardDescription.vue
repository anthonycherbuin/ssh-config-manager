<script setup>
import { cn } from '@/lib/utils';

const props = defineProps({
  class: { type: null, required: false },
});
</script>

<template>
  <p :class="cn('text-sm text-zinc-500 dark:text-zinc-400', props.class)">
    <slot />
  </p>
</template>
