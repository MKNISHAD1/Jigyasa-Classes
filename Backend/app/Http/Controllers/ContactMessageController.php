<?php

namespace App\Http\Controllers;

use App\Models\ContactMessage;

use Illuminate\Http\Request;

class ContactMessageController extends Controller
{
    // Store Messages from Users

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

        return response()->json([
            'status' => true,
            'message' => 'Message sent successfully'
        ]);
    }

    // Show all messages 

    public function messageList()
    {
        $messages = ContactMessage::latest()->paginate(20);

        return response()->json([
            'status' => true,
            'messages' => $messages
        ]);
    }

    // View Single Message 
    public function showMessage($id)
    {
        $message = ContactMessage::findOrFail($id);

        if ($message->status === 'new') {
            $message->update([
                'status' => 'read'
            ]);
        }

        return response()->json([
            'status' => true,
            'message' => $message
        ]);
    }

    // Close Messages 
    public function closeMessage($id)
    {
        $message = ContactMessage::findOrFail($id);

        $message->update([
            'status' => 'closed',
            'closed_at' => now()
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Message closed successfully'
        ]);
    }

}
