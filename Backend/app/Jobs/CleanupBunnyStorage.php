<?php

namespace App\Jobs;

use App\Models\BunnyCleanupTask;
use App\Services\BunnyStorageService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class CleanupBunnyStorage implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /*
    |--------------------------------------------------------------------------
    | Queue Retry Settings
    |--------------------------------------------------------------------------
    */

    public $tries = 5;

    // public $backoff = [
    //     60,      // 1 minute
    //     300,     // 5 minutes
    //     900,     // 15 minutes
    //     3600,    // 1 hour
    // ];

    //Test Scenerio
    public $backoff = [
        10,      // 10 sec
        15,     // 15  sec
        25,     // 25 sec
        35,    // 35  sec
    ];


    /*
    |--------------------------------------------------------------------------
    | Cleanup Task
    |--------------------------------------------------------------------------
    */

    public function __construct(
        public int $cleanupTaskId
    ) {
    }


    /*
    |--------------------------------------------------------------------------
    | Handle Job
    |--------------------------------------------------------------------------
    */

    public function handle(BunnyStorageService $bunny): void
    {
        $task = BunnyCleanupTask::find($this->cleanupTaskId);

        /*
        |--------------------------------------------------------------------------
        | Task no longer exists
        |--------------------------------------------------------------------------
        */

        if (!$task) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Already completed
        |--------------------------------------------------------------------------
        */

        if ($task->status === BunnyCleanupTask::STATUS_COMPLETED) {
            return;
        }


        /*
        |--------------------------------------------------------------------------
        | Mark as processing
        |--------------------------------------------------------------------------
        */

        $task->update([
            'status' => BunnyCleanupTask::STATUS_PROCESSING,
            'attempts' => $task->attempts + 1,
            'last_attempt_at' => now(),
            'last_error' => null,
        ]);


        try {

            /*
            |--------------------------------------------------------------------------
            | HLS Folder
            |--------------------------------------------------------------------------
            */

            if ($task->type === BunnyCleanupTask::TYPE_HLS_FOLDER) {

                $bunny->deleteHlsFolder(
                    $task->storage_path
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Material
            |--------------------------------------------------------------------------
            |
            | We are not using this yet, but keeping the type here means
            | the same cleanup system can support materials later.
            |
            */

            elseif ($task->type === BunnyCleanupTask::TYPE_MATERIAL) {

                // Material cleanup will be implemented later.
                throw new \RuntimeException(
                    'Material cleanup is not implemented yet.'
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Unknown cleanup type
            |--------------------------------------------------------------------------
            */

            else {

                throw new \RuntimeException(
                    "Unknown Bunny cleanup type: {$task->type}"
                );
            }


            /*
            |--------------------------------------------------------------------------
            | Cleanup successful
            |--------------------------------------------------------------------------
            */

            $task->update([
                'status' => BunnyCleanupTask::STATUS_COMPLETED,
                'completed_at' => now(),
                'last_error' => null,
            ]);


            Log::info(
                'Bunny cleanup completed successfully.',
                [
                    'cleanup_task_id' => $task->id,
                    'type' => $task->type,
                    'storage_path' => $task->storage_path,
                    'attempts' => $task->attempts,
                ]
            );

        } catch (\Throwable $e) {

            /*
            |--------------------------------------------------------------------------
            | Record failure
            |--------------------------------------------------------------------------
            */

            $task->update([
                'status' => BunnyCleanupTask::STATUS_FAILED,
                'last_error' => $e->getMessage(),
            ]);


            Log::error(
                'Bunny cleanup attempt failed.',
                [
                    'cleanup_task_id' => $task->id,
                    'type' => $task->type,
                    'storage_path' => $task->storage_path,
                    'attempts' => $task->attempts,
                    'error' => $e->getMessage(),
                ]
            );


            /*
            |--------------------------------------------------------------------------
            | Re-throw
            |--------------------------------------------------------------------------
            |
            | IMPORTANT:
            | Laravel needs the exception so the Queue system knows that
            | the job failed and should retry it.
            |
            */

            throw $e;
        }
    }
}