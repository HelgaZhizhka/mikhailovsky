<?php

use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/home', 'HomeController@index')->name('home');

Route::get('/', 'MainController@index')->name('main');
Route::get('/get-data', 'MainController@getData');

Auth::routes();

//admin routes
Route::group(['prefix'=>'admin', 'middleware'=>['auth']], function (){
    Route::get('/', 'Admin\AdminController@index');
    Route::get('/{link}', 'Admin\AdminController@index')->where('link', ('articles|medias|settings'));
    Route::post('/create-new-admin-account', 'Admin\AdminController@createNewAdminAccount');
    Route::post('/delete-admin-account', 'Admin\AdminController@deleteAdminAccount');
    Route::get('/init-admin', 'Admin\AdminController@initAdminPanel');
    Route::get('/init-settings', 'Admin\AdminController@initSettings');
    Route::get('/get-articles', 'Admin\AdminController@getArticles');
});
