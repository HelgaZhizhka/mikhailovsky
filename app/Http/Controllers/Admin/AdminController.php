<?php

namespace App\Http\Controllers\Admin;

use App\Article;
use App\Http\Controllers\Controller;
use App\Poster;
use App\Submenu;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class AdminController extends Controller
{
    //
    public function __construct()
    {
        $this->middleware('auth');
    }
    //
    public function index()
    {
        return view('admin.admin')->with(['url'=>config('app.url')]);
    }

    public function initAdminPanel(){
        Log::info('initAdminPanel');
        $currentAdmin = Auth::user();
        if ($currentAdmin) {
            return ['status'=>'ok', 'currentAdmin'=>$currentAdmin];
        }
    }

    public function initSettings(){
        Log::info('initSettings');
        $admins = User::all();
        if ($admins) {
            return ['status'=>'ok', 'admins'=>$admins];
        }
    }

    public function createNewAdminAccount(Request $request){
        $admin = User::create([
            'name' => $request['name'],
            'email' => $request['email'],
            'password' => Hash::make('abra_kadabra'),
        ]);
        if ($admin) {
            return ['status'=>'ok', 'admin'=>$admin];
        }
    }

    public function deleteAdminAccount(Request $request){
        Log::info('deleteAdminAccount');
        Log::info($request);
        $admin = $request['admin'];
        $result = User::destroy($admin['id']);
        if ($result) return ['status'=>'ok'];
        else return ['status'=>'false'];
    }
    public function getArticles(){
        Log::info('getArticles');
        $articles = Article::with(['posters', 'submenu'])->get();

        $submenus = Submenu::all();

        return ['status'=>'ok', 'submenus'=>$submenus, 'articles'=>$articles];
    }

    public function createNewArticle(Request $request){
        Log::info('createNewArticle');
        $data = $request->all()['article'];
        Log::info($data);

        $submenu = Submenu::where('title', $data['submenu'])->first();

        Log::info($submenu);

        $article = Article::create([
            'title' => $data['title'],
            'content' => $data['content'],
            'short_text' => $data['short_text'],
            'submenu_id'=>$submenu->id,
            'published'=>$data['published']
        ]);

        $article['submenu'] = $submenu;
        $article['posters'] = [];

        return ['status'=>'ok', 'article'=>$article];
    }

    public function deleteArticle(Request $request){
        Log::info('deleteArticle');
        Log::info($request->all());
        $article_id = $request->all()['article_id'];
        Log::info($article_id);
        $result = Article::destroy([$article_id]);
        if ($result) return ['status'=>'ok'];
        else return ['status'=>'false'];
    }

    public function uploadPhoto(Request $request){
        Log::info('uploadPhoto');
        Log::info($request->all());
        $poster = null;
        if($request->file()) {
            Log::info('пришел файл на сохранение');
            $path = 'articles/'.$request['article_id'];

            Log::info($path);
            $filename = $request->file('photo')->storePublicly($path, 'public');
            Log::info($filename);

            $poster = Poster::create([
                'title' => 'poster',
                'src' => $filename,
                'article_id' => $request['article_id'],
                'isPresentation' => 0
            ]);

        }

        if ($poster) return ['status'=>'ok', 'poster' => $poster];
        else return ['status'=>'false'];
    }

    public function deletePoster(Request $request){
        Log::info('deletePoster');
        Log::info($request->all()['poster']);
        $poster = $request->all()['poster'];
        $result= Poster::destroy([$poster['id']]);
        if ($result){
            $result = Storage::disk('public')->delete($poster['src']);
            if ($result) return ['status'=>'ok'];
            else return ['status'=>'false'];
        }

    }

    public function changePresentationPoster(Request $request){
        Log::info('changePresentationPoster');
        Log::info($request->all());
        $poster = $request->all()['new_presentation_poster'];
        //отменить старое презентационное фото
        $old_presentation_poster = Poster::where([
            ['article_id', $poster['article_id']],
            ['isPresentation', 1]
        ])->first();
        if ($old_presentation_poster){
            $old_presentation_poster['isPresentation'] = 0;
            $old_presentation_poster->save();
        }
//        назначить новое фото презентационным
        Poster::where('id', $poster['id'])->update([
            'isPresentation' => 1
        ]);
        return ['status'=>'ok', 'old_presentation_poster'=>$old_presentation_poster];
    }
}
