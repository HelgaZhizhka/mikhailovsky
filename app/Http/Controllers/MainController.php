<?php

namespace App\Http\Controllers;

use App\Menu;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class MainController extends Controller
{
    public function index(){
        return view('landing')->with(['url' => config('app.url')]);
    }

    public function getData(){
        Log::info('get-data');
//        Получить данные для лендинга

        $menu = Menu::with('submenu')->where('published', 1)->get();
        return ['status'=>'ok', 'menu'=>$menu];
    }
}
