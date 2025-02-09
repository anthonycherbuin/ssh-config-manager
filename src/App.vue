<template>
    <div class="flex min-h-screen w-full flex-col bg-muted/40 !bg-foreground-100">
        <AppAside />
        <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
            <main
                class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
                <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 col-span-4">
                    <AppPermissions :sshPermissions="sshPermissions" />
                </div>
                <div class="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4 col-span-4">
                    <div class="col-span-4 grid gap-4 grid-cols-3">
                        <AppKeysManagement :keys="keys" class="col-span-3 lg:col-span-2"
                            @copy-key="copyPublicKeyToClipboard"
                            @add-passphrase="addPassphraseToKeychain"
                            @delete-key="handleDeleteKey" />
                        <AppGenerateKeys class="col-span-3 lg:col-span-1"
                            @generate-key="handleGenerateKey" />


                        <Tabs class="col-span-3" default-value="default">
                            <div class="flex items-center">
                                <TabsList>
                                    <TabsTrigger value="default">
                                        Default
                                    </TabsTrigger>
                                    <TabsTrigger value="advanced">
                                        advanced
                                    </TabsTrigger>
                                </TabsList>
                            </div>
                            <TabsContent value="default">
                                <AppDefaultConfig :sshConfigData="sshConfigData" :keys="keys"
                                    @create-entry="createEntry" @update-config="updateConfig"
                                    @open-ssh-connection="openSSHConnection" />
                            </TabsContent>
                            <TabsContent value="advanced">
                                <AppAdvancedConfig @save-config="handleSaveConfig"
                                    :configContent="configContent" />
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    </div>
</template>
<script setup lang="ts">
import parseSshConfigManagerSection from './parseSSHConfigFile.js'
import { ref, onMounted } from 'vue'

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs'

import AppAside from './components/AppAside.vue';
import AppPermissions from './components/AppPermissions.vue';
import AppKeysManagement from './components/AppKeysManagement.vue';
import AppGenerateKeys from './components/AppGenerateKeys.vue'
import AppAdvancedConfig from './components/AppAdvancedConfig.vue'
import AppDefaultConfig from './components/AppDefaultConfig.vue'

// CONST 
const SUCCESS_TITLE = 'Success'

// Reactive state
const configContent = ref('')
const keys = ref([])
const sshConfigData = ref([]);
const sshPermissions = ref(null)

// -------------------- CONFIG SECTION -------------------- //
const loadConfigFile = async () => {
    try {
        // Replace with your actual electron API call
        const content = await window.electronAPI.loadConfig()
        configContent.value = content
    } catch (error) {
        console.error('Failed to load config:', error)
    }
}

const handleSaveConfig = async (newConfigContent) => {
    try {
        await window.electronAPI.saveConfig(newConfigContent);
        window.electronAPI.showNotification(SUCCESS_TITLE, 'Config saved successfully!');
        await loadConfigFile();
        sshConfigData.value = parseSshConfigManagerSection(newConfigContent);
    } catch (error) {
        alert('Error saving config: ' + error.message);
    }
}


// -------------------- KEYS SECTION -------------------- //
const renderKeys = async () => {
    keys.value = await window.electronAPI.getKeys()
}

const createEntry = async () => {
    // Create a new empty entry with proper structure
    const newEntry = {
        Host: '',
        Hostname: '',
        User: '',
        IdentityFile: '',
        UseKeychain: '' // Default to using keychain
    };

    // Add the new entry to the array
    sshConfigData.value.push(newEntry);
};

const handleGenerateKey = async (payload) => {
    const trimmedName = payload.keyName.trim();
    if (!trimmedName) {
        alert('Please enter a valid key name.');
        return;
    }
    try {
        // Replace with your actual Electron API call
        await window.electronAPI.generateKey(
            trimmedName,
            payload.passphrase,
            payload.encryptionMethod,
            payload.comment
        );
        await renderKeys();
    } catch (error) {
        alert('Error generating key: ' + error.message);
    }
};


const copyPublicKeyToClipboard = async (key) => {
    if (!key) return;

    try {
        const publicKey = await window.electronAPI.readPublicKeyFile(key.name);
        await navigator.clipboard.writeText(publicKey);
        window.electronAPI.showNotification(SUCCESS_TITLE, `Public key for "${key.name}" has been copied to the clipboard.`);
    } catch (error) {
        alert(`Error copying key to clipboard: ${error.message}`);
    }
};

const addPassphraseToKeychain = async (key) => {
    if (!key) return;

    try {
        // 1. Add key to SSH agent and Keychain
        await window.electronAPI.runCommand(`ssh-add --apple-use-keychain ~/.ssh/${key.name}`);

        // Read current SSH config
        const currentConfig = await window.electronAPI.loadConfig();

        // Parse managed section
        const hosts = parseSshConfigManagerSection(currentConfig);

        // Find hosts using this key and update their config
        const updatedHosts = hosts.map(host => {
            if (host.IdentityFile === key.name) {
                return {
                    ...host,
                    UseKeychain: 'yes' // Add UseKeychain directive
                };
            }
            return host;
        });

        // Regenerate the managed section
        const newSectionContent = generateManagedSection(updatedHosts);

        // Replace the old managed section in config
        const updatedConfig = replaceManagedSection(currentConfig, newSectionContent);

        // Write updated config back to file
        await window.electronAPI.saveConfig(updatedConfig);

        // Update dom config
        configContent.value = updatedConfig

        alert(`Key "${key.name}" configured with Keychain access, Key added to SSH agent and config file updated`);
    } catch (error) {
        alert(`Error configuring keychain access: ${error.message}`);
    }
};

async function updateConfig(item, index) {
    try {
        // Parse managed section
        const hosts = parseSshConfigManagerSection(configContent.value);

        // Read current SSH config
        const currentConfig = await window.electronAPI.loadConfig();

        let updatedHosts;

        if (index === hosts.length) {
            // Add new entry
            updatedHosts = [...hosts, item];
            alert(`Created new host "${item.Host}" successfully`);
        } else if (index >= 0 && index < hosts.length) {
            // Update the specific host entry
            updatedHosts = hosts.map((host, i) => (i === index ? { ...host, ...item } : host));
            alert(`Config "${item.Host}" updated successfully`);
        } else {
            throw new Error(`Invalid index: ${index}.`);
        }

        // Regenerate the managed section
        const newSectionContent = generateManagedSection(updatedHosts);

        // Replace the old managed section in config
        const updatedConfig = replaceManagedSection(currentConfig, newSectionContent);

        // Write updated config back to file
        await window.electronAPI.saveConfig(updatedConfig);

        // Update DOM config
        configContent.value = updatedConfig;

        return true;
    } catch (error) {
        alert(`Error updating config: ${error.message}`);
        return false;
    }
}


// Helper function to regenerate the managed section
function generateManagedSection(hosts) {
    const sectionLines = [];

    hosts.forEach(host => {
        sectionLines.push(`Host ${host.Host}`);
        if (host.Hostname) sectionLines.push(`  HostName ${host.Hostname}`);
        if (host.User) sectionLines.push(`  User ${host.User}`);
        if (host.IdentityFile) sectionLines.push(`  IdentityFile ~/.ssh/${host.IdentityFile}`);
        if (host.UseKeychain) sectionLines.push(`  UseKeychain ${host.UseKeychain}`);
        sectionLines.push(''); // Add empty line between hosts
    });

    return sectionLines.join('\n');
}

// Helper function to replace the managed section
function replaceManagedSection(fullConfig, newSection) {
    const startMarker = '# --------- BEGINNING OF SssSH CONFIG ----------';
    const endMarker = '# --------- END OF SssSH CONFIG MANAGER CONFIG ----------';

    return fullConfig.replace(
        new RegExp(`${startMarker}[\\s\\S]*?${endMarker}`, 'm'),
        `${startMarker}\n${newSection}\n${endMarker}`
    );
}

const openSSHConnection = async (host) => {
    try {
        if (!host) return;
        await window.electronAPI.openSSHConnection(host);
    } catch (error) {
        alert('Error ssh conection: ' + error.message)
    }
}

const handleDeleteKey = async (key) => {
    if (!key) return
    if (!confirm(`Are you sure you want to delete the SSH key "${key.name}"?`)) {
        return
    }
    try {
        // Replace with your actual electron API call
        await window.electronAPI.deleteKey(key.name)
        await renderKeys()
    } catch (error) {
        alert('Error deleting key: ' + error.message)
    }
}

// -------------------- INIT -------------------- //
onMounted(async () => {
    await loadConfigFile()
    await renderKeys()
    sshPermissions.value = await window.electronAPI.checkSshPermissions();
    sshConfigData.value = parseSshConfigManagerSection(configContent.value);
    // Listen for key updates from main process
    window.electronAPI.onUpdateKeys((updatedKeys) => {
        keys.value = updatedKeys
    })
})


</script>
<style>
body {
    --main-bg-color: #ededed;
    --dark-bg-color: #141414;
    background-color: #141414;
}

button {
    @apply hover:bg-[var(--main-bg-color)] hover:text-[var(--dark-bg-color)] cursor-pointer;
}

/* Remove the styles for buttons inside an <aside> */
aside button {
    @apply hover:bg-transparent hover:text-inherit cursor-default;
}

.btn-secondary {
    @apply border-[1px] border-[var(--main-bg-color)] text-[var(--main-bg-color)];
}
</style>