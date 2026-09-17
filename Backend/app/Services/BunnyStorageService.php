<?php

namespace App\Services;

use App\Models\Media;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class BunnyStorageService
{
    public function deleteHlsFolder(string $folderPath): void
    {
        $storageZone = env('BUNNY_STORAGE_ZONE');

        $regionHost = env(
            'BUNNY_REGION',
            'de.storage.bunnycdn.com'
        );

        $accessKey = env('BUNNY_API_KEY');

        $folderPath = trim($folderPath, '/');

        if ($folderPath === '') {
            throw new \RuntimeException(
                'Bunny HLS folder path cannot be empty.'
            );
        }

        $url =
            "https://{$regionHost}/" .
            "{$storageZone}/" .
            "{$folderPath}/";

        $response = Http::withHeaders([
            'AccessKey' => $accessKey,
        ])->delete($url);

        if ($response->successful()) {

            Log::info(
                'BUNNY HLS FOLDER DELETED',
                [
                    'folder_path' => $folderPath,
                    'status' => $response->status(),
                ]
            );

            return;
        }

        // Already gone = success for cleanup
        if ($response->status() === 404) {

            Log::info(
                'BUNNY HLS FOLDER ALREADY GONE',
                [
                    'folder_path' => $folderPath,
                ]
            );

            return;
        }

        throw new \RuntimeException(
            "Failed to delete Bunny HLS folder. " .
            "HTTP: {$response->status()}. " .
            "Response: {$response->body()}"
        );
    }


    public function deleteMaterial(Media $media): bool
    {
        $storageZone = env('BUNNY_STORAGE_ZONE');
        $regionHost  = env(
            'BUNNY_REGION',
            'de.storage.bunnycdn.com'
        );
        $accessKey = env('BUNNY_API_KEY');

        $path = parse_url(
            $media->url,
            PHP_URL_PATH
        );

        if (!$path) {
            throw new \Exception(
                'Invalid Bunny material URL.'
            );
        }

        $path = ltrim($path, '/');

        $deleteUrl =
            "https://{$regionHost}/" .
            "{$storageZone}/{$path}";

        $response = Http::withHeaders([
            'AccessKey' => $accessKey,
        ])->delete($deleteUrl);

        if (
            !$response->successful() &&
            $response->status() !== 404
        ) {
            throw new \Exception(
                "Failed to delete Bunny material. " .
                "Status: {$response->status()}"
            );
        }
        return true;
    }
}