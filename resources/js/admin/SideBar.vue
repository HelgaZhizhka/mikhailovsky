<template>
        <aside class="app-sidebar left-app" :class="{'is-open' : show}">
            <div class="side-tab-body resp-vtabs">
                <div class="first-sidemenu">
                    <ul class="resp-tabs-list">
                        <li>
                            <router-link :to="{name: 'dashboard'}" exact-active-class="active">
                                <span class="link">
                                    <span class="slider-text">Главная</span>
                                </span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{name: 'articles'}" exact-active-class="active">
                                <span class="link">
                                    <span class="slider-text">Статьи</span>
                                </span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{name: 'medias'}" exact-active-class="active">
                                <span class="link">
                                    <span class="slider-text">Медиа</span>
                                </span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{name: 'settings'}" exact-active-class="active">
                                <span class="link">
                                    <span class="slider-text">Настройки</span>
                                </span>
                            </router-link>
                        </li>
                    </ul>
                </div>
            </div>
            <div class="app-sidebar__overlay" @click.prevent="closeSidebar"></div>
        </aside>
</template>
<script>
export default {
    props:['show'],
    created() {
        console.log('Left Side Bar component created.')
    },
    computed:{

    },
    methods: {
        closeSidebar() {
            this.$emit('close')
        },
    }
}
</script>
