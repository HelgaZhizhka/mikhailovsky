<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

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

        if ($result){
            return ['status'=>'ok'];
        }else{
            return ['status'=>'false'];
        }
    }
}
