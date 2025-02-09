<template>
    <Card>
        <CardHeader class="pb-3">
            <CardTitle>Your SSH keys</CardTitle>
            <CardDescription class="max-w-lg text-balance leading-relaxed">
                Those are your keys available in .ssh
            </CardDescription>
            <CardContent class="px-1">
                <div v-for="(key, index) in keys" :key="index"
                    class="flex items-center justify-between border-b-[1px] py-2 border-white">
                    <div>
                        <h3 class="flex items-center break-all pr-4">
                            <KeyIcon class="h-4 w-4 mr-2" />{{ key.name }}
                        </h3>
                        <p class="text-sm text-gray-600">
                            Fingerprint: {{ key.fingerprint }}...
                        </p>
                        <p class="text-sm text-gray-600">
                            {{ new Date(key.creationDate).toLocaleDateString('en-CH') }}
                        </p>
                    </div>
                    <div class="flex">
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger as-child>
                                    <Button @click="() => emit('copy-key', key)"
                                        class="cursor-pointer btn-secondary px-3 py-1 rounded flex items-center mr-4">
                                        <FileLock2 class="h-5 w-5" />
                                        Copy public key
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="left">
                                    <p>Copy public key to clipboard</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <TooltipProvider>
                            <Tooltip>
                                <TooltipTrigger as-child>
                                    <Button @click="() => emit('add-passphrase', key)"
                                        class="cursor-pointer text-white px-3 py-1 rounded flex items-center mr-4">
                                        <FileLock2 class="h-5 w-5" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent side="right">
                                    <p>Add passphrase to macbook keychain</p>
                                    <p class="italic">(passphrase won't be asked again)</p>
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        <Button @click="() => emit('delete-key', key)"
                            class="group cursor-pointer hover:!bg-red-400 text-white px-3 py-1 rounded flex items-center">
                            <Trash2Icon class="h-4 w-4 group-hover:text-black" />
                        </Button>
                    </div>
                </div>
            </CardContent>
        </CardHeader>
    </Card>
</template>

<script setup>
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '@/components/ui/button';
import { KeyIcon, Trash2Icon, FileLock2 } from 'lucide-vue-next';

const props = defineProps({
    keys: {
        type: Array,
        required: true
    }
});

const emit = defineEmits(['copy-key', 'add-passphrase', 'delete-key']);
</script>