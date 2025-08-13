<script setup lang="ts">
import BookmarkSettings from '@/components/bookmarks/BookmarkSettings.vue'

const optionsStore = useOptionsStore()
// const { toggleDark } = optionsStore
const { isDark, profile, others } = storeToRefs(optionsStore)

// Form state for the options form
const formState = {
  isDark: isDark.value,
  profile: {
    name: profile.value.name,
    age: profile.value.age
  },
  others: {
    awesome: others.value.awesome,
    counter: others.value.counter
  }
}
</script>

<template>
  <div
    class="max-w-3xl w-full mx-auto rounded-xl md:my-12 p-4 md:p-8 md:border border-base-200 md:shadow-lg bg-base-100"
  >
    <RouterLinkUp />

    <h1>Options</h1>
    <p>
      You can configure various options related to this extension here. These
      options/ settings are peristent, available in all contexts, implemented
      using Pinia and useBrowserStorage composable.
    </p>

    <h3>User Interface</h3>
    <p>Change application interface settings.</p>

    <UForm :state="formState" class="space-y-4">
      <UFormField label="Theme">
        <USwitch v-model="isDark" />
      </UFormField>

      <h3>Profile</h3>
      <p>Change your name and age.</p>

      <UFormField label="Name">
        <UInput v-model="profile.name"></UInput>
      </UFormField>

      <UFormField label="Age">
        <UInput v-model="profile.age"></UInput>
      </UFormField>

      <h3>Others</h3>
      <p>Some other settings related to extension usage.</p>

      <UFormField label="Awesome Feature">
        <USwitch v-model="others.awesome" />
      </UFormField>

      <UFormField label="Counter">
        <UInput
          v-model="others.counter"
          type="number"
        ></UInput>
      </UFormField>
    </UForm>
    
    <div class="mt-8">
      <h3>书签同步</h3>
      <p>管理书签同步设置</p>
      <BookmarkSettings />
    </div>

    <p class="mt-8">
      * You can also make this a compoenent and then able to use this in any
      context like Popup, Developer Tools UI etc
    </p>
    <p>Feel free to change groups or options as per your requirements.</p>
  </div>
</template>
