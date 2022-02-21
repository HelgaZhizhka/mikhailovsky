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
                                    <th>published</th>
                                    <th>short_text</th>
                                    <th>created_at</th>
                                    <th>updated_at</th>
                                    <th>Presentation_Poster</th>
                                    <th>submenu</th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="article in articles">
                                        <td>{{article.id}}</td>
                                        <td><strong class="link text-green" @click="getArticle(article)">{{article.title}}</strong></td>
                                        <td>{{article.content}}</td>
                                        <td>{{article.published}}</td>
                                        <td>{{article.short_text}}</td>
                                        <td>{{ (new Date(article.created_at).toLocaleString())}}</td>
                                        <td>{{ (new Date(article.updated_at).toLocaleString())}}</td>
                                        <td v-if="article.posters && article.posters.length">
                                            <img :src="getPosterSrc(article)">
                                        </td>
                                        <td v-else></td>
                                        <td>{{article.submenu.title}}</td>
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
            <div class="col-md-12">
                <div class="card">
                    <div class="card-header">
                        <h3 class="card-title">Редактор статей</h3>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <ul>
                                <li>
                                    <span>Title:</span><input v-model="newArticle.title" type="text">
                                </li>
                                <li>
                                    <span>Content:</span><textarea v-model="newArticle.content" name="content" cols="30" rows="5"></textarea>
                                </li>
                                <li>
                                    <span>Short_text:</span><textarea v-model="newArticle.short_text" name="short_text" cols="30" rows="3"></textarea>
                                </li>
                                <li>
                                    <span>Submenu:</span>
                                    <select id="submenu" v-model="newArticle.submenu">
                                        <option v-for="submenu in submenus">{{submenu.title}}</option>
                                    </select>
                                </li>
                                <button @click="createArticle">Create article</button>
                            </ul>
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
    props: ['url'],
    data: function () {
        return {
            articles: [],
            submenus:[],
            newArticle:{
                title:null,
                content: null,
                short_text: null,
                submenu: null,
                published: 0
            }
        }
    },
    created() {
        this.getArticles();
    },
    methods:{
        clearNewArticleFields(){
            this.newArticle.title = null;
            this.newArticle.content = null;
            this.newArticle.short_text = null;
            this.newArticle.submenu = null;
        },

        createArticle(){
            console.log('create new article')
            console.log(this.newArticle.title)

            axios.post('/admin/create-new-article', {article: this.newArticle}).then(response => {
                if (response.data.status === 'ok'){
                    console.log("созлана новая статья")
                    this.articles.push(response.data.article)
                    this.clearNewArticleFields();
                }else{
                    alert('Ошибка при создании статьи')
                }
            }).catch(e => {
                console.log(e);
            })
        },
        getArticle(article){
            this.$router.push({
                name: 'article',
                params: {id: article.id, article: article }
            });
        },
        getPosterSrc(article){
            let poster = article.posters.filter(poster => {
                return poster.isPresentation
            })[0];
            if (poster) return this.url+'storage/'+poster.src
            else return null
        },
        deleteArticle(article){
            console.log('deleteArticle')
            console.log(article)
            let conf = confirm('Вы уверены что хотите удалить?')
            if (conf){
                axios.post('/admin/delete-article', {article_id: article.id}).then(response => {
                    if (response.data.status === 'ok'){
                        console.log("статья удалена")
                        this.articles= this.articles.filter(art => {
                            return +art.id !== +article.id
                        })
                    }else{
                        alert('Ошибка при удалении статьи')
                    }
                }).catch(e => {
                    console.log(e);
                })
            }
        },
        getArticles(){
            axios.get('/admin/get-articles').then(response=>{
                if (response.data.status === 'ok'){
                    console.log('успешно получили articles')
                    this.articles = response.data.articles;
                    this.submenus = response.data.submenus;
                }
            });
        }
    }
}
</script>

<style scoped>

</style>
