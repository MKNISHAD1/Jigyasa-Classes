<?php

namespace App\Http\Controllers;

use App\Helpers\ActivityLogger;
use App\Models\ContactMessage;
use App\Models\ContactMessageView;
use App\Models\ContactMessageComment;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Mail\ContactMessageReceivedMail;
use App\Mail\ContactMessageResolvedMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class ContactMessageController extends Controller
{
    // Submit a message from the public contact form.
    public function storeMessages(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'required|string|max:20',
            'category' => 'required|string|max:100',
            'subject' => 'required|string|max:255',
            'message' => 'required|string|max:5000',
        ]);

        $message = ContactMessage::create($validated);

        // sending acknowledge mail
        try {
            Mail::to($message->email)
                ->send(new ContactMessageReceivedMail($message));
        } catch (\Throwable $e) {
            Log::error('Contact message acknowledgement email failed.', [
                'contact_message_id' => $message->id,
                'exception' => $e->getMessage(),
            ]);
        }

        ActivityLogger::log('Submitted_Contact_Message', null, [
            'entity_type' => 'contact_message',
            'entity_id' => $message->id,
            'entity_title' => $message->subject,
            'category' => $message->category,
        ], 'GUEST');

        return response()->json([
            'status' => true,
            'message' => 'Message sent successfully',
        ], 201);
    }

    // List messages.
    public function messageList()
    {
        $messages = ContactMessage::withCount('comments')
            ->latest()
            ->get();

        return response()->json([
            'status' => true,
            'messages' => $messages,
            'stats' => [
                    'total' => ContactMessage::count(),
                    'new' => ContactMessage::where('status', 'new')->count(),
                    'read' => ContactMessage::where('status', 'read')->count(),
                    'pending_closure' => ContactMessage::where('status', 'pending_closure')->count(),
                    'closed' => ContactMessage::where('status', 'closed')->count(),
                ],
            ]);
    }

    // View one message and its complete comment history.
    public function showMessage(Request $request, $id)
    {
        $user = $request->user();

        abort_unless(
            $user && $user->hasAnyRole([
                'admin',
                'moderator',
                'super_admin',
            ]),
            403,
            'You are not allowed to view contact messages.'
        );

        $message = ContactMessage::findOrFail($id);

        // Closed messages are historical records.
        // Do not increment views or change their status.
        if ($message->status !== 'closed') {
            $now = now();

            DB::transaction(function () use ($message, $user, $now) {
                // Lock the message row so closure and view recording
                // cannot proceed concurrently without coordination.
                $lockedMessage = ContactMessage::whereKey($message->id)
                    ->lockForUpdate()
                    ->firstOrFail();

                // Recheck after obtaining the lock.
                if ($lockedMessage->status === 'closed') {
                    return;
                }

                $view = $lockedMessage->views()
                    ->where('user_id', $user->id)
                    ->first();

                if ($view) {
                    $view->update([
                        'view_count' => $view->view_count + 1,
                        'last_viewed_at' => $now,
                    ]);
                } else {
                    $lockedMessage->views()->create([
                        'user_id' => $user->id,
                        'first_viewed_at' => $now,
                        'last_viewed_at' => $now,
                        'view_count' => 1,
                    ]);
                }

                if ($lockedMessage->status === 'new') {
                    $lockedMessage->update(['status' => 'read']);

                    ActivityLogger::log('Read_Contact_Message', null, [
                        'entity_type' => 'contact_message',
                        'entity_id' => $lockedMessage->id,
                        'entity_title' => $lockedMessage->subject,
                    ]);
                }
            });
        }

        $message = ContactMessage::findOrFail($id);

        $message->load([
            'comments.user:id,name',
            'closedBy:id,name',
            'views.user:id,name',
        ]);

        return response()->json([
            'status' => true,
            'message' => $message,
            'view_summary' => [
                'total_views' => $message->views->sum('view_count'),
                'unique_viewers' => $message->views->count(),
                'viewers' => $message->views->map(function ($view) {
                    return [
                        'user_id' => $view->user_id,
                        'user_name' => $view->user?->name ?? 'Deleted user',
                        'view_count' => $view->view_count,
                        'first_viewed_at' => $view->first_viewed_at,
                        'last_viewed_at' => $view->last_viewed_at,
                    ];
                })->values(),
            ],
        ]);
    }

    // Add a comment without overwriting earlier comments.
    public function addComment(Request $request, $id)
    {
        $user = $request->user();

        abort_unless(
            $user && $user->hasAnyRole([
                'admin',
                'moderator',
                'super_admin',
            ]),
            403,
            'You are not allowed to comment on contact messages.'
        );

        $validated = $request->validate([
            'comment' => 'required|string|max:5000',
        ]);

        $message = ContactMessage::findOrFail($id);

        if ($message->status === 'closed') {
            return response()->json([
                'status' => false,
                'message' => 'A closed message cannot receive new comments.',
            ], 422);
        }

        $comment = DB::transaction(function () use (
            $message,
            $user,
            $validated
        ) {
            return $message->comments()->create([
                'user_id' => $user->id,
                'comment' => $validated['comment'],
            ]);
        });

        ActivityLogger::log('Added_Contact_Message_Comment', null, [
            'entity_type' => 'contact_message',
            'entity_id' => $message->id,
            'entity_title' => $message->subject,
            'comment_id' => $comment->id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Comment added successfully.',
            'comment' => $comment->load('user:id,name'),
        ], 201);
    }

    // Admin/moderator requests closure, with a required comment.
    public function requestClosure(Request $request, $id)
    {
        $user = $request->user();

        abort_unless(
            $user && $user->hasAnyRole(['admin', 'moderator']),
            403,
            'Only admins and moderators can request closure.'
        );

        $validated = $request->validate([
            'comment' => 'required|string|max:5000',
        ]);

        $result = DB::transaction(function () use (
            $id,
            $user,
            $validated
        ) {
            $message = ContactMessage::whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($message->status === 'closed') {
                return [
                    'error' => 'This message is already closed.',
                    'code' => 422,
                ];
            }

            $comment = $message->comments()->create([
                'user_id' => $user->id,
                'comment' => $validated['comment'],
            ]);

            $message->update([
                'status' => 'pending_closure',
            ]);

            return [
                'message' => $message,
                'comment' => $comment,
            ];
        });

        if (isset($result['error'])) {
            return response()->json([
                'status' => false,
                'message' => $result['error'],
            ], $result['code']);
        }

        ActivityLogger::log(
            'Requested_Contact_Message_Closure',
            null,
            [
                'entity_type' => 'contact_message',
                'entity_id' => $result['message']->id,
                'entity_title' => $result['message']->subject,
                'comment_id' => $result['comment']->id,
            ]
        );

        return response()->json([
            'status' => true,
            'message' => 'Closure requested. Awaiting super admin review.',
            'contact_message' => $result['message']->fresh(),
            'comment' => $result['comment'],
        ]);
    }

    // Only super_admin can perform final closure.
    public function closeMessage(Request $request, $id)
    {
        $user = $request->user();

        abort_unless(
            $user && $user->hasRole('super_admin'),
            403,
            'Only the super admin can close contact messages.'
        );

        $validated = $request->validate([
            'final_resolution' => 'required|string|max:5000',
        ]);

        $message = DB::transaction(function () use (
            $id,
            $user,
            $validated
        ) {
            $message = ContactMessage::whereKey($id)
                ->lockForUpdate()
                ->firstOrFail();

            if ($message->status === 'closed') {
                abort(422, 'This message is already closed.');
            }

            if (!$message->comments()->exists()) {
                abort(
                    422,
                    'An investigation comment is required before closure.'
                );
            }

            $message->update([
                'status' => 'closed',
                'closed_at' => now(),
                'closed_by' => $user->id,
                'final_resolution' => trim($validated['final_resolution']),
            ]);

            return $message;
        });

        ActivityLogger::log('Closed_Contact_Message', null, [
            'entity_type' => 'contact_message',
            'entity_id' => $message->id,
            'entity_title' => $message->subject,
        ]);

        // Sendinf query resolution mail to user 
        try {
            Mail::to($message->email)
                ->send(new ContactMessageResolvedMail($message));
        } catch (\Throwable $e) {
            Log::error('Contact message resolution email failed.', [
                'contact_message_id' => $message->id,
                'exception' => $e->getMessage(),
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => 'Contact message closed successfully.',
            'contact_message' => $message->fresh()->load('closedBy:id,name'),
        ]);
    }
}