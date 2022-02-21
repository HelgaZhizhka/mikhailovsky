<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Article extends Model
{
    protected $table = 'articles';

    public function posters(){
        return $this->hasMany('App\Poster', 'article_id');
    }
    protected $fillable = ['title', 'content', 'short_text', 'submenu_id', 'published'];

    public function submenu(){
        return $this->belongsTo('App\Submenu');
    }
}
