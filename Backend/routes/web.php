<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Response;

Route::get('/hls-test/{filename}', function ($filename) {

    $basePath = base_path('../hls-test/output');

    $filePath = $basePath . DIRECTORY_SEPARATOR . basename($filename);

    if (!File::exists($filePath)) {
        abort(404);
    }

    $extension = strtolower(pathinfo($filePath, PATHINFO_EXTENSION));

    $mimeTypes = [
        'm3u8' => 'application/vnd.apple.mpegurl',
        'ts'   => 'video/mp2t',
    ];

    return Response::file($filePath, [
        'Content-Type' => $mimeTypes[$extension] ?? 'application/octet-stream',
        'Access-Control-Allow-Origin' => '*',
        'Cache-Control' => 'no-cache',
    ]);
});

Route::get('/', function () {
    return view('welcome');
});