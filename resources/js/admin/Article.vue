<template>
    <div class="app-content">
        <div class="page-header">
            <h3 class="page-title link" @click.prevent="backToTheList">Back</h3>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">{{ article.title }}</h4>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                <tr>
                                    <th>id</th>
                                    <th>title</th>
                                    <th>content</th>
                                    <th>published</th>
                                    <th>short_text</th>
                                    <th>created_at</th>
                                    <th>updated_at</th>
                                    <th>isPresentation</th>
                                    <th>submenu</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td>{{article.id}}</td>
                                    <td><strong class="link text-green">{{article.title}}</strong></td>
                                    <td>{{article.content}}</td>
                                    <td>{{article.published}}</td>
                                    <td>{{article.short_text}}</td>
                                    <td>{{ (new Date(article.created_at).toLocaleString())}}</td>
                                    <td>{{ (new Date(article.updated_at).toLocaleString())}}</td>
                                    <td v-if="article.posters.length">
                                        <img :src="getPosterSrc(article)">
                                    </td>
                                    <td v-else></td>
                                    <td>{{article.submenu.title}}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div class="card-header">
                        <h4 class="card-title">Posters</h4>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered" v-if="article.posters && article.posters.length">
                                <thead>
                                <tr>
                                    <th>id</th>
                                    <th>poster</th>
                                    <th>isPresentation</th>
                                    <th>delete</th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="poster in article.posters">
                                    <td >{{poster.id}}</td>
                                    <td><img :src="$attrs.url+'storage/'+poster.src"></td>
                                    <td>
                                        <input type="checkbox" :checked="poster.isPresentation" @change="changeIsPresentation(poster)">                                    </td>
                                    <td class="td_center">
                                        <span class="text-red link" @click="deletePoster(poster)"><i class="fe fe-trash"></i></span>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h4 class="card-title">Добавить графику</h4>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <form @submit="formSubmit" enctype="multipart/form-data">
                                <input type="file" class="form-control" v-on:change="onChange">
                                <button class="btn btn-primary btn-block">Upload</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Article",
    props:['id', 'article'],
    data: function () {
        return {
            maxsizeImage:10*1024*1024,
            file: null,
        }
    },
    methods:{
        changeIsPresentation(poster){
            console.log('changeIsPresentation')
            console.log(poster)
            axios.post('/admin/change-is-presentation-poster', {new_presentation_poster: poster})
                .then(response => {
                    if (response.data.status === 'ok'){
                        console.log("Изменено презентационное фото")
                        console.log(response.data)
                        this.article.posters.forEach(post => {
                            if (+post.id === +poster.id) post.isPresentation = 1
                            if (response.data.old_presentation_poster && +post.id === +response.data.old_presentation_poster.id) post.isPresentation = 0
                        })
                    }else{
                        alert('Ошибка при удалении постера')
                    }
                }).catch(e => {
                console.log(e);
            })
        },
        deletePoster(poster){
            console.log('deletePoster')
            console.log(poster)
            axios.post('/admin/delete-poster', {poster: poster})
                .then(response => {
                    if (response.data.status === 'ok'){
                        console.log("Постер удален")
                        this.article.posters = this.article.posters.filter(post => {
                            return +post.id !== +poster.id
                        })
                    }else{
                        alert('Ошибка при удалении постера')
                    }
            }).catch(e => {
                console.log(e);
            })
        },
        onChange(e) {
            this.file = e.target.files[0];
        },
        formSubmit(e) {
            e.preventDefault();
            const config = {
                headers: {
                    'content-type': 'multipart/form-data'
                }
            }
            let data = new FormData();
            data.append('photo', this.file);
            data.append('article_id', this.id);
            axios.post('/admin/upload-photo', data, config).then(response => {
                if (response.data.status === 'ok'){
                    this.article.posters.push(response.data.poster)
                    alert('успешно сохранили')
                }
            }).catch(e => {
                console.log(e);
            });
        },

        backToTheList(){
            console.log('back')
            this.$router.push({
                name: 'articles'
            });
        },
        getPosterSrc(article){
            let poster = article.posters.filter(poster => {
                return poster.isPresentation
            });
            if (poster.length) return this.$attrs.url+'storage/'+poster[0].src
            else return null

        },
    },
}
</script>

<style scoped>

</style>
