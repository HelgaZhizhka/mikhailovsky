<template>
    <div class="app-content">
        <div class="page-header">
            <h4 class="page-title">Статьи</h4>
        </div>
        <div class="row">
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Список статей</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-bordered">
                                <thead>
                                <tr>
                                    <th>id</th>
                                    <th>title</th>
                                    <th>content</th>
                                    <th>media</th>
                                    <th>published</th>
                                    <th>short_text</th>
                                    <th>created_at</th>
                                    <th>updated_at</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr v-for="article in articles">
                                    <td>{{article.id}}</td>
                                    <td><strong class="link text-green" >{{article.title}}</strong></td>
                                    <td>{{article.content}}</td>
                                    <td>{{article.media}}</td>
                                    <td>{{article.published}}</td>
                                    <td>{{article.short_text}}</td>
                                    <td>{{ (new Date(article.created_at).toLocaleString())}}</td>
                                    <td>{{ (new Date(article.updated_at).toLocaleString())}}</td>
                                    <td class="td_center">
                                        <span class="text-red link" @click="deleteArticle(article)"><i class="fe fe-trash"></i></span>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "Articles",
    data: function () {
        return {
            articles: [],
        }
    },
    created() {
        this.getArticles();
    },
    methods:{
        deleteArticle(article){
            console.log('deleteArticle')
            console.log(article)
        },
        getArticles(){
            axios.get('/admin/get-articles').then(response=>{
                if (response.data.status === 'ok'){
                    console.log('успешно получили articles')
                    this.articles = response.data.articles;
                }
            });
        }
    }
}
</script>

<style scoped>

</style>
