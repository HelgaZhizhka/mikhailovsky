<template>
        <aside class="app-sidebar left-app is-open">
            <div class="side-tab-body resp-vtabs">
                <div class="first-sidemenu">
                    <ul class="resp-tabs-list">
                        <li>
                            <router-link :to="{name: 'dashboard'}" exact-active-class="active">
                                <span class="link">
                                    <span class="slider-text">Admin Panel</span>
                                </span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{name: 'first'}" exact-active-class="active">
                                <span class="link">
                                    <span class="slider-text">First</span>
                                </span>
                            </router-link>
                        </li>
                        <li>
                            <router-link :to="{name: 'second'}" exact-active-class="active">
                                <span class="link">
                                    <span class="slider-text">Second</span>
                                </span>
                            </router-link>
                        </li>
                    </ul>
                </div>
            </div>
        </aside>
</template>
<script>
export default {
    props:[],
    created() {
        console.log('Left Side Bar component created.')
    },
    computed:{

    },
    methods: {

    }
}
</script>
