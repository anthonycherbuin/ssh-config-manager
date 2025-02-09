<template>
    <aside
        class="fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r border-gray-800 bg-background sm:flex">
        <nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger as-child>
                        <a href="#"
                            class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-white transition-colors hover:text-foreground md:h-8 md:w-8">
                            <Home class="h-5 w-5 text-white" />
                            <span class="sr-only">Dashboard</span>
                        </a>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        Dashboard
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </nav>

        <nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
            <AlertDialog>
                <AlertDialogTrigger>
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger as-child>
                                <div
                                    class="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors md:h-8 md:w-8">
                                    <Info class="h-5 w-5 text-gray-400" />
                                    <span class="sr-only">About</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                                About
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader class="flex flex-row justify-between">
                        <AlertDialogTitle class="text-white">Infos</AlertDialogTitle>
                        <img class="w-18" src="../../public/assets/logo.svg" />
                    </AlertDialogHeader>
                    <AlertDialogDescription class="flex flex-col">
                        <p>Version: <strong>v1.0.0</strong></p>

                        <p class="italic mt-1">made with ❤️ by a dev that was once stuck in nano
                        </p>
                        <p class="mt-4">
                            GitHub: <a href="https://github.com/anthonycherbuin" target="_blank"
                                rel="noopener noreferrer">
                                github.com/anthonycherbuin
                            </a>
                        </p>
                        <p class="mt-1">
                            Medium: <a href="https://medium.com/@anthony.cherbuin" target="_blank"
                                rel="noopener noreferrer">
                                medium.com/@anthony.cherbuin
                            </a>
                        </p>
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                        <AlertDialogCancel class="bg-white cursor-pointer">Close
                        </AlertDialogCancel>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </nav>
    </aside>
</template>
<script setup lang="ts">
import { Info } from 'lucide-vue-next';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from '@/components/ui/tooltip'
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
</script>