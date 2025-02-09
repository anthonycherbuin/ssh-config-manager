<template>
    <template v-for="item, index in sshPermissions">
        <Card :key="index" v-if="item.item !== null">

            <CardContent class="pt-3">
                <div class="text-2xl font-bold"
                    :class="item.valid ? 'text-green-300' : 'text-red-400'">
                    {{ item.actual }}
                </div>
                <p class="text-xs text-muted-foreground text-gray-500">
                    {{ item.item }}
                </p>
                <p v-if="!item.valid" class="text-xs text-muted-foreground text-red-400">
                    {{ item.expected }} advised
                </p>
                <p v-else class="text-xs text-muted-foreground text-gray-300">
                    permissions are safe
                </p>
            </CardContent>
        </Card>
    </template>
</template>
<script setup>
import { Card, CardContent } from '@/components/ui/card'

const props = defineProps({
    sshPermissions: {
        type: Array,
        required: true
    }
})
</script>
