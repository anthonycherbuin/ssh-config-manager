<template>
    <Card>
        <CardHeader class="pb-3">
            <CardTitle>Generate SSH keys</CardTitle>
            <CardDescription class="max-w-lg text-balance leading-relaxed">
                This will generate an SSH key in your .ssh folder using the encryption method you
                choose.
            </CardDescription>
        </CardHeader>
        <CardFooter>
            <div class="w-full mt-6">
                <Input type="text" id="keyName" class="w-full" v-model="keyName"
                    placeholder="Key name (no spaces)" />
                <Input type="password" id="passphrase" class="w-full my-2" v-model="passphrase"
                    placeholder="passphrase" />
                <Input type="text" id="comment" class="w-full mb-2" v-model="comment"
                    placeholder="comment (C)" />
                <Select v-model="selectedEncryptionMethod">
                    <SelectTrigger>
                        <SelectValue placeholder="Encryption method" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectGroup>
                            <SelectItem v-for="(method, index) in encryptionList" :key="index"
                                :value="method">
                                {{ method }}
                            </SelectItem>
                        </SelectGroup>
                    </SelectContent>
                </Select>
                <Button class="btn-secondary mt-4" @click="handleGenerateKey">
                    Generate Key
                </Button>
            </div>
        </CardFooter>
    </Card>
</template>

<script setup>
import { ref } from 'vue';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

const keyName = ref('');
const passphrase = ref('');
const comment = ref('');
const selectedEncryptionMethod = ref('ed25519');

// List of available encryption methods
const encryptionList = ref(['ed25519', 'rsa', 'ecdsa-sk']);

const emit = defineEmits(['generate-key']);

function handleGenerateKey() {
    const payload = {
        keyName: keyName.value,
        passphrase: passphrase.value,
        comment: comment.value,
        encryptionMethod: selectedEncryptionMethod.value,
    };

    emit('generate-key', payload);

    // reset the form fields after emitting the event:
    keyName.value = '';
    passphrase.value = '';
    comment.value = '';
}
</script>