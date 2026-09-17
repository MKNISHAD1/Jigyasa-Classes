<?php

namespace App\Jobs;

use App\Models\LessonUpload;
use App\Models\BunnyCleanupTask;
use App\Services\BunnyStorageService;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Http\Client\ConnectionException;

use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

class ProcessLessonHls implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * No Laravel job timeout.
     *
     * FFmpeg itself also has no artificial timeout below.
     */
    public $timeout = 0;

    public $tries = 1;

    /**
     * Number of HLS files uploaded concurrently per batch.
     */
    private int $uploadBatchSize = 10;

    /**
     * UUID of the LessonUpload being processed.
     */
    private string $uploadUuid;

    /**
     * Create a new job instance.
     */
    public function __construct(string $uploadUuid)
    {
        $this->uploadUuid = $uploadUuid;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {

        Log::info('PROCESS LESSON HLS JOB STARTED', [
            'upload_uuid' => $this->uploadUuid,
            'started_at' => now()->toDateTimeString(),
        ]);

        /*
        |--------------------------------------------------------------------------
        | Load upload
        |--------------------------------------------------------------------------
        */

        $upload = LessonUpload::where(
            'upload_uuid',
            $this->uploadUuid
        )->first();

        if (!$upload) {

            Log::error('HLS UPLOAD NOT FOUND', [
                'upload_uuid' => $this->uploadUuid,
            ]);

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Job should only process an upload already claimed as processing
        |--------------------------------------------------------------------------
        */

        if ($upload->status !== 'processing') {

            Log::info(
                'HLS JOB SKIPPED - UPLOAD STATE CHANGED',
                [
                    'upload_uuid' => $upload->upload_uuid,
                    'status' => $upload->status,
                ]
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Verify temporary source path
        |--------------------------------------------------------------------------
        */

        if (!$upload->temporary_file_path) {

            LessonUpload::where('id', $upload->id)
                ->where('status', 'processing')
                ->update([
                    'status' => 'failed',
                ]);

            Log::error(
                'HLS TEMPORARY SOURCE PATH MISSING',
                [
                    'upload_uuid' => $upload->upload_uuid,
                ]
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Resolve source file
        |--------------------------------------------------------------------------
        */

        $sourcePath = storage_path(
            'app/' . ltrim(
                $upload->temporary_file_path,
                '/'
            )
        );

        if (!is_file($sourcePath)) {

            Log::error(
                'HLS SOURCE VIDEO NOT FOUND',
                [
                    'upload_uuid' => $upload->upload_uuid,
                    'source_path' => $sourcePath,
                ]
            );

            LessonUpload::where('id', $upload->id)
                ->where('status', 'processing')
                ->update([
                    'status' => 'failed',
                ]);

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Create HLS processing directory
        |--------------------------------------------------------------------------
        */

        $processingDirectory = dirname($sourcePath);

        $hlsDirectory = $processingDirectory . '/hls';

        if (!is_dir($hlsDirectory)) {

            if (!mkdir($hlsDirectory, 0755, true)) {

                LessonUpload::where('id', $upload->id)
                    ->where('status', 'processing')
                    ->update([
                        'status' => 'failed',
                    ]);

                Log::error(
                    'HLS PROCESSING DIRECTORY CREATION FAILED',
                    [
                        'upload_uuid' => $upload->upload_uuid,
                        'hls_directory' => $hlsDirectory,
                    ]
                );

                return;
            }
        }

        /*
        |--------------------------------------------------------------------------
        | HLS output paths
        |--------------------------------------------------------------------------
        */

        $playlistPath =
            $hlsDirectory . '/playlist.m3u8';

        $segmentPattern =
            $hlsDirectory . '/segment_%05d.ts';

        /*
        |--------------------------------------------------------------------------
        | FFmpeg HLS Conversion
        |--------------------------------------------------------------------------
        */

        Log::info('HLS FFMPEG STARTED', [
            'upload_uuid' => $upload->upload_uuid,
        ]);

        try {

            $process = new Process([
                'ffmpeg',

                '-y',

                // Input
                '-i',
                $sourcePath,

                // Keep ONLY the first video stream
                '-map',
                '0:v:0',

                // Keep ONLY the first audio stream
                '-map',
                '0:a:0',

                // Do NOT include subtitles
                '-sn',

                // Do NOT include data/attachments
                '-dn',

                // Original video/audio — NO re-encoding
                '-c:v',
                'copy',

                // Normalize audio for browser compatibility
                '-c:a',
                'aac',
                '-b:a',
                '128k',
                '-ac',
                '2',
                '-ar',
                '48000',


                // HLS output
                '-f',
                'hls',

                '-hls_time',
                '12',

                '-hls_playlist_type',
                'vod',

                '-hls_segment_filename',
                $segmentPattern,

                $playlistPath,
            ]);

            /*
            |--------------------------------------------------------------------------
            | No artificial FFmpeg timeout
            |--------------------------------------------------------------------------
            */

            $process->setTimeout(null);

            $ffmpegStartedAt = microtime(true);

            $process->start();

            while ($process->isRunning()) {

                usleep(250000); // 250ms

                $currentStatus = LessonUpload::where(
                    'id',
                    $upload->id
                )->value('status');

                if (
                    $currentStatus === 'cancelling' ||
                    $currentStatus === 'cancelled'
                ) {

                    Log::info(
                        'HLS FFMPEG CANCELLATION REQUESTED',
                        [
                            'upload_uuid' => $upload->upload_uuid,
                        ]
                    );

                    $process->stop(5);

                    Log::info(
                        'HLS FFMPEG PROCESS STOPPED',
                        [
                            'upload_uuid' => $upload->upload_uuid,
                        ]
                    );

                    $this->deleteDirectory(
                        $processingDirectory
                    );

                    LessonUpload::where('id', $upload->id)
                        ->whereIn('status', ['cancelling', 'cancelled'])
                        ->update([
                            'status' => 'cancelled',
                        ]);

                    Log::info(
                        'LESSON UPLOAD CANCELLED DURING HLS PROCESSING',
                        [
                            'upload_uuid' => $upload->upload_uuid,
                        ]
                    );

                    return;
                }
            }

            $ffmpegTime = microtime(true) - $ffmpegStartedAt;

            Log::info('FFMPEG HLS PROCESSING FINISHED', [
                'upload_uuid' => $this->uploadUuid,
                'duration_seconds' => round($ffmpegTime, 2),
            ]);

            if (!$process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }


        } catch (\Throwable $e) {

            Log::error(
                'HLS FFMPEG PROCESSING FAILED',
                [
                    'upload_uuid' =>
                        $upload->upload_uuid,

                    'source_path' =>
                        $sourcePath,

                    'error' =>
                        $e->getMessage(),

                    'ffmpeg_output' =>
                        isset($process)
                            ? $process->getErrorOutput()
                            : null,
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Only processing may become failed
            |--------------------------------------------------------------------------
            */

            $updated = LessonUpload::where(
                'id',
                $upload->id
            )
            ->where('status', 'processing')
            ->update([
                'status' => 'failed',
            ]);

            /*
            |--------------------------------------------------------------------------
            | Cleanup only if processing still owns upload
            |--------------------------------------------------------------------------
            */

            if ($updated === 1) {

                $this->deleteDirectory(
                    $processingDirectory
                );

            } else {

                $upload->refresh();

                Log::info(
                    'HLS FAILURE DID NOT CHANGE UPLOAD STATE',
                    [
                        'upload_uuid' =>
                            $upload->upload_uuid,

                        'status' =>
                            $upload->status,
                    ]
                );
            }

            return;
        }





        /*
        |--------------------------------------------------------------------------
        | Verify HLS playlist
        |--------------------------------------------------------------------------
        */

        if (!is_file($playlistPath)) {

            Log::error(
                'HLS PLAYLIST NOT GENERATED',
                [
                    'upload_uuid' =>
                        $upload->upload_uuid,

                    'playlist_path' =>
                        $playlistPath,
                ]
            );

            $updated = LessonUpload::where(
                'id',
                $upload->id
            )
            ->where('status', 'processing')
            ->update([
                'status' => 'failed',
            ]);

            if ($updated === 1) {

                $this->deleteDirectory(
                    $processingDirectory
                );
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Verify HLS segments
        |--------------------------------------------------------------------------
        */

        $segments = glob(
            $hlsDirectory . '/segment_*.ts'
        );

        if (!$segments || count($segments) === 0) {

            Log::error(
                'HLS SEGMENTS NOT GENERATED',
                [
                    'upload_uuid' =>
                        $upload->upload_uuid,

                    'hls_directory' =>
                        $hlsDirectory,
                ]
            );

            $updated = LessonUpload::where(
                'id',
                $upload->id
            )
            ->where('status', 'processing')
            ->update([
                'status' => 'failed',
            ]);

            if ($updated === 1) {

                $this->deleteDirectory(
                    $processingDirectory
                );
            }

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Check cancellation before Bunny upload
        |--------------------------------------------------------------------------
        */

        $upload->refresh();

        if (
            $upload->status === 'cancelling' ||
            $upload->status === 'cancelled'
        ) {

            $this->deleteDirectory(
                $processingDirectory
            );

            Log::info(
                'HLS PROCESSING CANCELLED BEFORE BUNNY UPLOAD',
                [
                    'upload_uuid' =>
                        $upload->upload_uuid,
                ]
            );

            return;
        }

    /*
    |--------------------------------------------------------------------------
    | Upload HLS files to Bunny
    |--------------------------------------------------------------------------
    */

    $bunnyStartedAt = microtime(true);

    Log::info('HLS BUNNY UPLOAD STARTED', [
        'upload_uuid' => $upload->upload_uuid,
    ]);

    try {

        $this->uploadHlsDirectoryToBunny(
            $hlsDirectory,
            $upload->hls_storage_path
        );

        $bunnyTime = microtime(true) - $bunnyStartedAt;

        $totalHlsBytes = 0;

        foreach ($segments as $segment) {

            if (is_file($segment)) {
                $totalHlsBytes += filesize($segment);
            }
        }

        Log::info('BUNNY HLS UPLOAD FINISHED', [
            'upload_uuid' => $upload->upload_uuid,
            'duration_seconds' => round($bunnyTime, 2),
            'segments' => count($segments),
            'total_hls_mb' => round(
                $totalHlsBytes / 1024 / 1024,
                2
            ),
        ]);

    } catch (\Throwable $e) {

        $upload->refresh();

        /*
        |--------------------------------------------------------------------------
        | Cancellation during Bunny upload
        |--------------------------------------------------------------------------
        */

        if (
            $upload->status === 'cancelling' ||
            $upload->status === 'cancelled' ||
            $e->getMessage() === 'UPLOAD_CANCELLED'
        ) {

            Log::info(
                'HLS BUNNY UPLOAD CANCELLED',
                [
                    'upload_uuid' => $upload->upload_uuid,
                    'status' => $upload->status,
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Delete partial Bunny HLS
            |--------------------------------------------------------------------------
            */

            // try {

            //     if ($upload->hls_storage_path) {

            //         $this->deleteBunnyHlsFolder(
            //             $upload->hls_storage_path
            //         );
            //     }

            // } catch (\Throwable $cleanupException) {

            //     Log::error(
            //         'FAILED TO CLEANUP PARTIAL BUNNY HLS AFTER CANCELLATION',
            //         [
            //             'upload_uuid' => $upload->upload_uuid,
            //             'error' => $cleanupException->getMessage(),
            //         ]
            //     );
            // }

            if ($upload->hls_storage_path) {

                $this->cleanupBunnyHlsWithRetry(
                    $upload->hls_storage_path,
                    $upload->upload_uuid
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Delete local processing directory
            |--------------------------------------------------------------------------
            */

            $this->deleteDirectory(
                $processingDirectory
            );

            /*
            |--------------------------------------------------------------------------
            | Final cancellation state
            |--------------------------------------------------------------------------
            */

            LessonUpload::where(
                'id',
                $upload->id
            )
            ->where('status', 'cancelling')
            ->update([
                'status' => 'cancelled',
            ]);

            Log::info(
                'LESSON UPLOAD CANCELLED DURING BUNNY UPLOAD',
                [
                    'upload_uuid' => $upload->upload_uuid,
                ]
            );

            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Bunny upload failed
        |--------------------------------------------------------------------------
        */

        Log::error(
            'HLS BUNNY UPLOAD FAILED',
            [
                'upload_uuid' => $upload->upload_uuid,
                'hls_storage_path' => $upload->hls_storage_path,
                'error' => $e->getMessage(),
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Delete partially uploaded Bunny HLS
        |--------------------------------------------------------------------------
        */

        // try {

        //     if ($upload->hls_storage_path) {

        //         $this->deleteBunnyHlsFolder(
        //             $upload->hls_storage_path
        //         );
        //     }

        // } catch (\Throwable $cleanupException) {

        //     Log::error(
        //         'FAILED TO CLEANUP PARTIAL BUNNY HLS',
        //         [
        //             'upload_uuid' => $upload->upload_uuid,
        //             'error' => $cleanupException->getMessage(),
        //         ]
        //     );
        // }

        if ($upload->hls_storage_path) {

            $this->cleanupBunnyHlsWithRetry(
                $upload->hls_storage_path,
                $upload->upload_uuid
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Only processing may become failed
        |--------------------------------------------------------------------------
        */

        $updated = LessonUpload::where(
            'id',
            $upload->id
        )
        ->where('status', 'processing')
        ->update([
            'status' => 'failed',
        ]);

        /*
        |--------------------------------------------------------------------------
        | Local cleanup
        |--------------------------------------------------------------------------
        */

        if ($updated === 1) {

            $this->deleteDirectory(
                $processingDirectory
            );

        } else {

            $upload->refresh();

            Log::info(
                'BUNNY FAILURE DID NOT CHANGE UPLOAD STATE',
                [
                    'upload_uuid' => $upload->upload_uuid,
                    'status' => $upload->status,
                ]
            );
        }

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | Final atomic state transition
    |--------------------------------------------------------------------------
    |
    | processing → processed
    |
    | Cancellation wins if it changed the state before this UPDATE.
    |--------------------------------------------------------------------------
    */

    $updated = LessonUpload::where(
        'id',
        $upload->id
    )
    ->where('status', 'processing')
    ->update([
        'status' => 'processed',
    ]);


    /*
    |--------------------------------------------------------------------------
    | Processing lost the race
    |--------------------------------------------------------------------------
    */

    if ($updated !== 1) {

        $upload->refresh();

        Log::info(
            'HLS PROCESSING DID NOT COMPLETE BECAUSE UPLOAD STATE CHANGED',
            [
                'upload_uuid' => $upload->upload_uuid,
                'status' => $upload->status,
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Bunny HLS is no longer wanted
        |--------------------------------------------------------------------------
        */

        // try {

        //     if ($upload->hls_storage_path) {

        //         $this->deleteBunnyHlsFolder(
        //             $upload->hls_storage_path
        //         );
        //     }

        // } catch (\Throwable $cleanupException) {

        //     Log::error(
        //         'FAILED TO CLEANUP BUNNY HLS AFTER STATE CHANGE',
        //         [
        //             'upload_uuid' => $upload->upload_uuid,
        //             'error' => $cleanupException->getMessage(),
        //         ]
        //     );
        // }

        if ($upload->hls_storage_path) {

            $this->cleanupBunnyHlsWithRetry(
                $upload->hls_storage_path,
                $upload->upload_uuid
            );
        }

        $this->deleteDirectory(
            $processingDirectory
        );

        return;
    }


    /*
    |--------------------------------------------------------------------------
    | HLS processing successfully completed
    |--------------------------------------------------------------------------
    */

    Log::info(
        'HLS PROCESSING COMPLETED',
        [
            'upload_uuid' => $upload->upload_uuid,
            'hls_storage_path' => $upload->hls_storage_path,
            'segments' => count($segments),
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | Remove local processing files
    |--------------------------------------------------------------------------
    */

    $this->deleteDirectory(
        $processingDirectory
    );
    }

    /*
    |--------------------------------------------------------------------------
    | Upload HLS directory to Bunny
    |--------------------------------------------------------------------------
    */

    private function uploadHlsDirectoryToBunny(
        string $localDirectory,
        string $bunnyDirectory
    ): void {
        $storageZone = env('BUNNY_STORAGE_ZONE');

        $apiKey = env('BUNNY_API_KEY');

        $regionHost = env(
            'BUNNY_REGION',
            'de.storage.bunnycdn.com'
        );

        /*
        |--------------------------------------------------------------------------
        | Get all HLS files
        |--------------------------------------------------------------------------
        */

        $files = File::allFiles($localDirectory);

        if (empty($files)) {
            throw new \RuntimeException(
                'No HLS files found.'
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Sort files
        |--------------------------------------------------------------------------
        |
        | We upload .ts segments first and playlist.m3u8 last.
        |
        | This prevents Bunny from temporarily having a playlist that
        | references segments which have not been uploaded yet.
        |
        |--------------------------------------------------------------------------
        */

        usort($files, function ($a, $b) {
            $aIsPlaylist = strtolower($a->getExtension()) === 'm3u8';
            $bIsPlaylist = strtolower($b->getExtension()) === 'm3u8';

            if ($aIsPlaylist && !$bIsPlaylist) {
                return 1;
            }

            if (!$aIsPlaylist && $bIsPlaylist) {
                return -1;
            }

            return strcmp(
                $a->getFilename(),
                $b->getFilename()
            );
        });

        /*
        |--------------------------------------------------------------------------
        | Split files into batches
        |--------------------------------------------------------------------------
        */

        $batches = array_chunk(
            $files,
            $this->uploadBatchSize
        );

        foreach ($batches as $batchIndex => $batch) {

            /*
            |--------------------------------------------------------------------------
            | Check cancellation before starting batch
            |--------------------------------------------------------------------------
            */

            $currentStatus = LessonUpload::where(
                'upload_uuid',
                $this->uploadUuid
            )->value('status');

            if (
                $currentStatus === 'cancelling' ||
                $currentStatus === 'cancelled'
            ) {
                throw new \RuntimeException(
                    'UPLOAD_CANCELLED'
                );
            }

            Log::info(
                'HLS BUNNY UPLOAD BATCH STARTED',
                [
                    'upload_uuid' => $this->uploadUuid,
                    'batch' => $batchIndex + 1,
                    'total_batches' => count($batches),
                    'files_in_batch' => count($batch),
                ]
            );

            /*
            |--------------------------------------------------------------------------
            | Prepare parallel requests
            |--------------------------------------------------------------------------
            */

            $streams = [];
            $requestFiles = [];

            foreach ($batch as $file) {

                $filename = $file->getFilename();

                $remotePath =
                    trim($bunnyDirectory, '/') .
                    '/' .
                    $filename;

                $url =
                    "https://{$regionHost}/" .
                    "{$storageZone}/" .
                    "{$remotePath}";

                $mimeType =
                    match (strtolower($file->getExtension())) {
                        'm3u8' =>
                            'application/vnd.apple.mpegurl',

                        'ts' =>
                            'video/mp2t',

                        default =>
                            'application/octet-stream',
                    };

                $stream = fopen(
                    $file->getPathname(),
                    'rb'
                );

                if (!$stream) {
                    throw new \RuntimeException(
                        "Unable to open {$filename}"
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | Keep stream open until the parallel requests finish
                |--------------------------------------------------------------------------
                */

                $streams[$filename] = $stream;

                $requestFiles[] = [
                    'filename' => $filename,
                    'remote_path' => $remotePath,
                    'url' => $url,
                    'mime_type' => $mimeType,
                    'stream' => $stream,
                ];
            }

            try {

                /*
                |--------------------------------------------------------------------------
                | Upload entire batch concurrently
                |--------------------------------------------------------------------------
                */

                $responses = Http::pool(
                    function ($pool) use (
                        $requestFiles,
                        $apiKey
                    ) {

                        $requests = [];

                        foreach ($requestFiles as $requestFile) {

                            $requests[] = $pool
                                ->withHeaders([
                                    'AccessKey' => $apiKey,
                                    'Content-Type' =>
                                        $requestFile['mime_type'],
                                ])
                                ->withBody(
                                    $requestFile['stream'],
                                    $requestFile['mime_type']
                                )
                                ->put(
                                    $requestFile['url']
                                );
                        }

                        return $requests;
                    }
                );

            } finally {

                /*
                |--------------------------------------------------------------------------
                | Always close streams
                |--------------------------------------------------------------------------
                */

                foreach ($streams as $stream) {

                    if (is_resource($stream)) {
                        fclose($stream);
                    }
                }
            }

            /*
            |--------------------------------------------------------------------------
            | Validate every response in this batch
            |--------------------------------------------------------------------------
            */

            foreach ($responses as $index => $response) {

                $requestFile = $requestFiles[$index];

                /*
                |--------------------------------------------------------------------------
                | Network / connection failure
                |--------------------------------------------------------------------------
                */

                if ($response instanceof ConnectionException) {

                    throw new \RuntimeException(
                        "Bunny upload connection failed for " .
                        "{$requestFile['filename']}. " .
                        $response->getMessage(),
                        0,
                        $response
                    );
                }


                /*
                |--------------------------------------------------------------------------
                | Normal HTTP response
                |--------------------------------------------------------------------------
                */

                if (!$response->successful()) {

                    throw new \RuntimeException(
                        "Bunny upload failed for " .
                        "{$requestFile['filename']}. " .
                        "HTTP {$response->status()}"
                    );
                }


                Log::info(
                    'HLS FILE UPLOADED TO BUNNY',
                    [
                        'remote_path' =>
                            $requestFile['remote_path'],

                        'status' =>
                            $response->status(),

                        'batch' =>
                            $batchIndex + 1,
                    ]
                );
            }

            /*
            |--------------------------------------------------------------------------
            | Check cancellation after batch
            |--------------------------------------------------------------------------
            */

            $currentStatus = LessonUpload::where(
                'upload_uuid',
                $this->uploadUuid
            )->value('status');

            if (
                $currentStatus === 'cancelling' ||
                $currentStatus === 'cancelled'
            ) {
                throw new \RuntimeException(
                    'UPLOAD_CANCELLED'
                );
            }

            Log::info(
                'HLS BUNNY UPLOAD BATCH FINISHED',
                [
                    'upload_uuid' => $this->uploadUuid,
                    'batch' => $batchIndex + 1,
                    'total_batches' => count($batches),
                ]
            );
        }
    }


    /*
    
    |--------------------------------------------------------------------------
    | Delete local directory
    |--------------------------------------------------------------------------
    */

    private function deleteDirectory(
        string $directory
    ): void {

        if (!is_dir($directory)) {
            return;
        }

        try {

            File::deleteDirectory(
                $directory
            );

            Log::info(
                'LOCAL HLS PROCESSING DIRECTORY DELETED',
                [
                    'directory' => $directory,
                ]
            );

        } catch (\Throwable $e) {

            Log::error(
                'FAILED TO DELETE LOCAL HLS DIRECTORY',
                [
                    'directory' => $directory,
                    'error' => $e->getMessage(),
                ]
            );
        }
    }


    /*
    |--------------------------------------------------------------------------
    | Delete Bunny HLS folder
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    | Keep your existing deleteBunnyHlsFolder() implementation here
    | if you already have one working in the controller.
    |
    |--------------------------------------------------------------------------
    */

    // private function deleteBunnyHlsFolder(string $folderPath): void
    // {
    //     $storageZone = env('BUNNY_STORAGE_ZONE');

    //     $regionHost = env(
    //         'BUNNY_REGION',
    //         'de.storage.bunnycdn.com'
    //     );

    //     $accessKey = env('BUNNY_API_KEY');

    //     $folderPath = trim($folderPath, '/');

    //     if ($folderPath === '') {
    //         throw new \RuntimeException(
    //             'Bunny HLS folder path cannot be empty.'
    //         );
    //     }

    //     $url =
    //         "https://{$regionHost}/" .
    //         "{$storageZone}/" .
    //         "{$folderPath}/";

    //     $response = Http::withHeaders([
    //         'AccessKey' => $accessKey,
    //     ])->delete($url);

    //     if ($response->successful()) {

    //         Log::info(
    //             'BUNNY HLS FOLDER DELETED',
    //             [
    //                 'folder_path' => $folderPath,
    //                 'status' => $response->status(),
    //             ]
    //         );

    //         return;
    //     }

    //     /*
    //     |--------------------------------------------------------------------------
    //     | Already gone
    //     |--------------------------------------------------------------------------
    //     */

    //     if ($response->status() === 404) {

    //         Log::info(
    //             'BUNNY HLS FOLDER ALREADY GONE',
    //             [
    //                 'folder_path' => $folderPath,
    //             ]
    //         );

    //         return;
    //     }

    //     throw new \RuntimeException(
    //         "Failed to delete Bunny HLS folder. " .
    //         "HTTP: {$response->status()}. " .
    //         "Response: {$response->body()}"
    //     );
    // }

    private function deleteBunnyHlsFolder(string $folderPath): void
    {
        app(BunnyStorageService::class)
            ->deleteHlsFolder($folderPath);
    }

    private function cleanupBunnyHlsWithRetry(
    string $folderPath,
    string $uploadUuid
    ): void {
        $task = BunnyCleanupTask::firstOrCreate(
            [
                'type' => BunnyCleanupTask::TYPE_HLS_FOLDER,
                'storage_path' => $folderPath,
            ],
            [
                'upload_uuid' => $uploadUuid,
                'status' => BunnyCleanupTask::STATUS_PENDING,
                'attempts' => 0,
                'next_attempt_at' => now(),
            ]
        );

        /*
        |--------------------------------------------------------------------------
        | Already cleaned
        |--------------------------------------------------------------------------
        */

        if ($task->status === BunnyCleanupTask::STATUS_COMPLETED) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Make cleanup immediately eligible
        |--------------------------------------------------------------------------
        */

        $task->update([
            'status' => BunnyCleanupTask::STATUS_PENDING,
            'next_attempt_at' => now(),
            'last_error' => null,
        ]);

        /*
        |--------------------------------------------------------------------------
        | Try immediate Bunny cleanup
        |--------------------------------------------------------------------------
        */

        try {

            $this->deleteBunnyHlsFolder($folderPath);

            $task->update([
                'status' => BunnyCleanupTask::STATUS_COMPLETED,
                'completed_at' => now(),
                'last_error' => null,
            ]);

            Log::info(
                'BUNNY HLS CLEANUP COMPLETED IMMEDIATELY',
                [
                    'cleanup_task_id' => $task->id,
                    'upload_uuid' => $uploadUuid,
                    'storage_path' => $folderPath,
                ]
            );

        } catch (\Throwable $e) {

            /*
            |--------------------------------------------------------------------------
            | Bunny unavailable / deletion failed
            |--------------------------------------------------------------------------
            |
            | Keep the task in DB.
            | Scheduler will dispatch CleanupBunnyStorage later.
            |--------------------------------------------------------------------------
            */

            $task->update([
                'status' => BunnyCleanupTask::STATUS_FAILED,
                'next_attempt_at' => now()->addMinutes(10),
                'last_error' => $e->getMessage(),
            ]);

            Log::error(
                'BUNNY HLS CLEANUP DEFERRED TO QUEUE',
                [
                    'cleanup_task_id' => $task->id,
                    'upload_uuid' => $uploadUuid,
                    'storage_path' => $folderPath,
                    'error' => $e->getMessage(),
                ]
            );
        }
    }
}