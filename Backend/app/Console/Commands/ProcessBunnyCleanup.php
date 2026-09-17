<?php

namespace App\Console\Commands;

use App\Jobs\CleanupBunnyStorage;
use App\Models\BunnyCleanupTask;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;;

class ProcessBunnyCleanup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     * 
     */
    protected $signature = 'bunny:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Dispatch due Bunny cleanup tasks to the queue';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $tasks = BunnyCleanupTask::due()
            ->orderBy('id')
            ->get();

        if($tasks->isEmpty()) {
            $this->info('No Bunny cleanup tasks are due.');

            return self::SUCCESS;
        }

        foreach ($tasks as $task) {
            //Prevent Immidiate re-dispatch

            $task->update([
                'next_attempt_at' => now()->addMinutes(5),
            ]);

            CleanupBunnyStorage::dispatch($task->id);

            Log::info(
                'Bunny cleanupp  task dispatched by schedular.',
                [
                    'cleanup_task_id' => $task->id,
                    'type' => $task->type,
                    'storage_path' => $task->storage_path,
                ]
            );

            $this -> info("Dispatched cleanup task #{$task->id}");
        }

        return self::SUCCESS;
    }
}
