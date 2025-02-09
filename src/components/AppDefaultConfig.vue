<template>
    <Card>
        <CardHeader class="px-7">
            <CardTitle>SSH config</CardTitle>
            <CardDescription>
                <div class="flex justify-between">
                    <p>
                        Here is your ssh config, link your keys with remote repo or servers
                        and manage your aliases.
                    </p>
                    <Button class="btn-secondary" @click="() => emit('create-entry')">
                        New entry
                    </Button>
                </div>
            </CardDescription>
            <CardContent v-if="sshConfigData.length > 0"
                class="w-full px-0 gap-x-4 mt-1 grid grid-cols-6">
                <template v-for="(item, index) in sshConfigData" :key="index">
                    <div class="items-center justify-center col-span-6 lg:col-span-3 mt-5">
                        <div
                            class="border-white border-[1px] rounded-lg shadow-md p-4 w-full flex flex-col">
                            <p class="text-xs text-gray-400 mb-2">
                                Update Your Git Remote URL with
                                "<code>git@{{ item.Host }}:username/repo.git</code>"
                            </p>
                            <div class="space-y-4">
                                <div>
                                    <label for="host"
                                        class="block text-sm font-medium">Alias</label>
                                    <Input id="host" v-model="item.Host" type="text" required />
                                </div>
                                <div>
                                    <label for="hostname"
                                        class="block text-sm font-medium">Hostname</label>
                                    <Input id="hostname" v-model="item.Hostname" type="text"
                                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                                        required />
                                </div>
                                <div>
                                    <label for="user" class="block text-sm font-medium">User</label>
                                    <Input id="user" v-model="item.User" type="text" required />
                                </div>
                                <div>
                                    <label for="identityFile" class="block text-sm font-medium">SSH
                                        key</label>
                                    <Select v-model="item.IdentityFile">
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select a key" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem v-for="key in keys" :key="key.name"
                                                    :value="key.name">
                                                    {{ key.name }}
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div class="flex">
                                    <Button class="btn-secondary"
                                        @click="() => emit('update-config', item, index)">
                                        Save
                                    </Button>
                                    <Button @click="() => emit('open-ssh-connection', item.Host)"
                                        class="mt-2 ml-auto">
                                        <p class="text-xs text-gray-400">
                                            <code>ssh {{ item.Host }}</code>
                                        </p>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </template>
            </CardContent>
            <CardContent v-else>
                <p>Entries created with SssSH editor will appear here</p>
            </CardContent>
        </CardHeader>
    </Card>
</template>

<script setup>
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent,
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

const props = defineProps({
    sshConfigData: {
        type: Array,
        required: true
    },
    keys: {
        type: Array,
        required: true
    }
});

const emit = defineEmits([
    'create-entry',
    'update-config',
    'open-ssh-connection'
]);
</script>