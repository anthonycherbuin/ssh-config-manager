<template>
    <Card>
        <CardHeader class="px-7">
            <CardTitle>SSH config Advanced</CardTitle>
            <CardDescription>
                <Textarea class="min-h-[400px] mt-2" id="configEditor"
                    placeholder="SSH config content..." v-model="localConfigContent" />
            </CardDescription>
            <CardFooter class="pl-0">
                <Button class="mt-3 btn-secondary" @click="handleSaveConfig">
                    Save Config
                </Button>
            </CardFooter>
        </CardHeader>
    </Card>
</template>

<script setup>
import { ref, watch } from 'vue';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

// Receive the config content as a prop
const props = defineProps({
    configContent: {
        type: String,
        required: true
    }
});

// Create a local reactive copy of the prop to allow two-way binding
const localConfigContent = ref(props.configContent);

// Update local copy if the prop changes
watch(
    () => props.configContent,
    (newValue) => {
        localConfigContent.value = newValue;
    }
);

// Define the emit for the "save-config" event
const emit = defineEmits(['save-config']);

// Emit the current config content when the Save Config button is clicked
function handleSaveConfig() {
    emit('save-config', localConfigContent.value);
}
</script>