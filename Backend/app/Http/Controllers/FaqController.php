<?php

namespace App\Http\Controllers;

use App\Models\Faq;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class FaqController extends Controller
{
    /**
     * List all FAQs
     */
    public function index(Request $request)
    {
        $locale = $request->query('locale', app()->getLocale());

        $faqs = Faq::where('status', true)
            ->latest()
            ->get()
            ->map(fn ($faq) => $this->formatFaqResponse($faq, $locale));

        return response()->json([
            'status' => true,
            'faqs'   => $faqs,
        ]);
    }

    /**
     * Store new FAQ
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'question' => 'required|string|max:255',
            'answer'   => 'required|string',
            'type'     => 'required|in:general,payment,course,other',
            'status'   => 'boolean',
        ]);

        $faq = Faq::create([
            'question' => $validated['question'],
            'answer'   => $validated['answer'],
            'type'     => $validated['type'],
            'status'   => $validated['status'] ?? true,
        ]);

        // Auto-generate Hindi translations (same as CourseController)
        $faq->translateFields(['question', 'answer'], 'hi');

        return response()->json([
            'status'  => true,
            'message' => 'FAQ created successfully',
            'faq'     => $this->formatFaqResponse($faq, $request->query('locale', 'en')),
        ], 201);
    }

    /**
     * Update FAQ
     */
    public function update(Request $request, $id)
    {
        $faq = Faq::findOrFail($id);

        $validated = $request->validate([
            'question' => 'sometimes|string|max:255',
            'answer'   => 'sometimes|string',
            'type'     => 'sometimes|in:general,payment,course,other',
            'status'   => 'boolean',
        ]);

        $faq->update($validated);

        // Auto-update Hindi translations if fields were changed
        $fieldsToTranslate = [];
        if ($request->filled('question')) $fieldsToTranslate[] = 'question';
        if ($request->filled('answer')) $fieldsToTranslate[] = 'answer';

        if (!empty($fieldsToTranslate)) {
            // force refresh translation (ignore existing one)
            $faq->translations()->where('locale', 'hi')->delete();
            $faq->translateFields($fieldsToTranslate, 'hi');
        }

        return response()->json([
            'status'  => true,
            'message' => 'FAQ updated successfully',
            'faq'     => $this->formatFaqResponse($faq, $request->query('locale', 'en')),
        ]);
    }

    /**
     * Delete FAQ (hard delete since no softDeletes)
     */
    public function destroy($id)
    {
        $faq = Faq::findOrFail($id);
        $faq->delete();

        return response()->json([
            'status'  => true,
            'message' => 'FAQ deleted successfully',
        ]);
    }

    /**
     * Helper: format response with English + Hindi fields
     */
    private function formatFaqResponse(Faq $faq, $locale = 'en')
    {
        return [
            'id'       => $faq->id,
            'type'     => $faq->type,
            'status'   => $faq->status,
            'question' => [
                'en' => $faq->question,
                'hi' => $faq->translateField('question', 'hi') ?? $faq->question,
            ],
            'answer' => [
                'en' => $faq->answer,
                'hi' => $faq->translateField('answer', 'hi') ?? $faq->answer,
            ],
        ];
    }
}
