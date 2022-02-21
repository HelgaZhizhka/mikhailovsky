<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Poster extends Model
{
    protected $table = 'posters';

    protected $fillable = ['title', 'src', 'article_id', 'isPresentation'];
}
