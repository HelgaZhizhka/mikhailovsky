<template>
    <div class="section section_intro" :style="`min-height: ${windowHeight}px`">
        <img class="video video_responsive"  :src="poster" alt="">
        <video v-if="show" class="video video_responsive" autoplay playsinline loop muted ref="video">
            <source :src="video" type="video/mp4">
        </video>
        <div class="section__caption">
            <div class="promo">
                <div class="logo">
                    <img src="assets/images/svg/logo.svg" alt="">
                </div>
                <h4 class="promo__subtitle">Украинcкая Православная Церковь Одесская Епархия</h4>
                <h3 class="promo__title">Свято-Архангело-Михайловский женский монастырь</h3>
                <span class="promo__text">Нажмите, чтобы посмотреть полную версию видео о нашем монастыре</span>
                <button class="btn btn_icon btn_play" @click.prevent="openFullVideo">
                    <i class="icon icon-play"></i>
                </button>
            </div>
            <button class="btn btn_scroll">
                <i class="icon icon_mouse"></i>
                <i class="icon icon_scroll"></i>
            </button>
        </div>
    </div>
</template>

<script>


export default {
    name: "LandingVideo",
    data: function () {
        return {
            windowHeight: null,
            windowWidth: null,
            isFullVideo: false,
            show: false,
            video: null,
            poster: null,
            src: {
                tv: 'assets/video/3840.mp4',
                big: 'assets/video/3440.mp4',
                high: 'assets/video/2560.mp4',
                xl: 'assets/video/1920.mp4',
                lg: 'assets/video/1440.mp4',
                md: 'assets/video/1280.mp4',
                smart:'assets/video/434.mp4',
            },
        }
    },
    props: {
        cdnUrl: String,
        url: String
    },
    created() {
        if (this.$mq !=='desktop') {
            window.addEventListener('resize', this.handleResize)
            this.handleResize()
        }
    },
    mounted() {
        this.setVideoSrc()
    },
    beforeDestroy() {
        window.removeEventListener('resize', this.handleResize)
    },
    methods: {
        handleResize() {
            this.windowHeight = window.innerHeight
            this.windowWidth = window.innerWidth
        },
        setVideoSrc() {
            if (this.windowWidth / this.windowHeight < 1) {
                this.video = this.url + this.src.smart
            }
            else if (this.windowWidth >= 3840) {
                this.video = this.url + this.src.tv
            } else if (this.windowWidth >= 3440) {
                this.video = this.url + this.src.big
            } else if (this.windowWidth >= 2560) {
                this.video = this.url + this.src.high
            } else if (this.windowWidth >= 1920) {
                this.video = this.url + this.src.xl
            } else if (this.windowWidth >= 1440) {
                this.video = this.url + this.src.lg
            } else {
                this.video = this.url + this.src.md
            }
        },
        openFullVideo() {

        }
    }
}

</script>

