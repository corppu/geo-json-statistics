<template>
  <article>
    <my-header :user="user" @login="onLogin" @logout="onLogout" @create-account="onCreateAccount" />
    <geo-j-s-o-n-map-container></geo-j-s-o-n-map-container>
  </article>
</template>

<script lang="ts" setup>
import { ref } from 'vue'

import MyHeader from './Header.vue'
import './page.css'
import GeoJSONMapContainer from '../components/GeoJSONMapContainer.vue'

const user = ref<{ name: string } | null>(null)

const onLogin = () => {
  user.value = { name: 'Jane Doe' }
}
const onLogout = () => {
  user.value = null
}
const onCreateAccount = () => {
  user.value = { name: 'Jane Doe' }
}
</script>
