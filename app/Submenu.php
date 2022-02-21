<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Submenu extends Model
{
    protected $table = 'submenu';

    public function articles(){
        return $this->hasMany('App\Article');
    }
}
