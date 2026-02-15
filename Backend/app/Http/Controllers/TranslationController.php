<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Lesson;
use App\Models\CourseTranslation;
use App\Models\LessonTranslation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class TranslationController extends Controller
{
    protected $types = [
        'course' => [
            'model' => Course::class,
            'translation' => CourseTranslation::class,
            'fields' => ['title', 'description'],
        ],
        'lesson' => [
            'model' => Lesson::class,
            'translation' => LessonTranslation::class,
            'fields' => ['title', 'description'],
        ],
    ];

    protected function resolveType(string $type)
    {
        if (!array_key_exists($type, $this->types)) {
            abort(404, 'Invalid translation type');
        }
        return $this->types[$type];
    }

    /**
     * List translations for admin UI
     * Query params:
     *  - type=course|lesson (optional)
     *  - source=machine|human (optional)
     *  - status=need_review|done (optional)
     *  - q=search string (search english or existing translated text)
     */
    public function index(Request $request)
    {
        $type = $request->query('type'); // optional
        $source = $request->query('source');
        $status = $request->query('status');
        $q = $request->query('q');

        $results = [];

        $processType = function($typeKey) use ($source, $status, $q) {
            $cfg = $this->types[$typeKey];
            $modelClass = $cfg['model'];
            $transClass = $cfg['translation'];
            $fields = $cfg['fields'];

            // start from translations table for easier filtering
            $query = $transClass::query()->with([$typeKey => function($q){ $q->with(['teacher','creator']); }]);

            if ($source) $query->where('source', $source);
            if ($status) $query->where('status', $status);
            if ($q) {
                $query->where(function($qq) use ($q, $fields) {
                    $qq->where('locale', 'hi')
                       ->where(function($r) use ($q, $fields) {
                           foreach ($fields as $f) {
                               $r->orWhere($f, 'like', "%{$q}%");
                           }
                       });
                })
                ->orWhereHas($typeKey, function($qqq) use ($q, $fields) {
                    $qqq->where(function($r2) use ($q, $fields) {
                        foreach ($fields as $f) {
                            $r2->orWhere($f, 'like', "%{$q}%");
                        }
                    });
                });
            }

            // include trashed translations (so admin can see machine/human drafts even if deleted)
            $items = $query->withTrashed()->orderByDesc('updated_at')->paginate(40);

            return [
                'type' => $typeKey,
                'items' => $items
            ];
        };

        if ($type) {
            $cfg = $this->resolveType($type);
            $results[] = $processType($type);
        } else {
            // return both (courses first)
            foreach (array_keys($this->types) as $t) {
                $results[] = $processType($t);
            }
        }

        return response()->json([
            'status' => true,
            'data' => $results
        ]);
    }

    /**
     * Show translation row for specific course/lesson.
     * Returns english snapshot, current translation row (if any), metadata.
     */
    public function show(Request $request, $type, $id)
    {
        $cfg = $this->resolveType($type);
        $modelClass = $cfg['model'];
        $fields = $cfg['fields'];

        $entity = $modelClass::with(['translations' => function($q){ $q->where('locale','hi'); }])->findOrFail($id);

        $translation = $entity->translations()->where('locale', 'hi')->withTrashed()->first();

        $payload = [
            'id' => $id,
            'type' => $type,
            'english' => [],
            'translation' => $translation ? $translation->toArray() : null,
            'fields' => $fields,
        ];

        foreach ($fields as $f) {
            $payload['english'][$f] = $entity->$f;
        }

        return response()->json(['status' => true, 'data' => $payload]);
    }

    /**
     * Save human translation from central UI
     * Expects payload: { fields: { title: "...", description: "..." } }
     */
    public function update(Request $request, $type, $id)
    {
        $cfg = $this->resolveType($type);
        $modelClass = $cfg['model'];
        $fields = $cfg['fields'];

        $validated = $request->validate([
            'fields' => 'required|array',
            'fields.*' => 'nullable|string',
        ]);

        $entity = $modelClass::findOrFail($id);

        // permission — only teacher/creator/admin allowed to edit translations (you can customize)
        $user = Auth::user();
        if (!$user->hasAnyRole(['admin','super_admin','moderator','teacher'])) {
            return response()->json(['status'=>false,'message'=>'Unauthorized'],403);
        }

        // call trait helper to save human translation
        $translation = $entity->saveHumanTranslation('hi', $validated['fields']);

        return response()->json([
            'status' => true,
            'message' => 'Translation saved',
            'translation' => $translation
        ]);
    }

    /**
     * Regenerate machine translation for fields — use when english changed and you want fresh machine translation.
     * This will set source=machine and status=need_review, and update snapshot.
     */
    public function regenerate(Request $request, $type, $id)
    {
        $cfg = $this->resolveType($type);
        $modelClass = $cfg['model'];
        $fields = $cfg['fields'];

        $entity = $modelClass::findOrFail($id);
        $user = Auth::user();
        if (!$user->hasAnyRole(['admin','super_admin','moderator','teacher'])) {
            return response()->json(['status'=>false,'message'=>'Unauthorized'],403);
        }

        $translation = $entity->generateOrUpdateTranslation($fields, 'hi');

        return response()->json(['status'=>true,'message'=>'Machine translation regenerated','translation'=>$translation]);
    }

    /**
     * Mark translation as reviewed/done by human (without changing text).
     * Useful if admin just reviews and marks done.
     */
    public function markDone(Request $request, $type, $id)
    {
        $cfg = $this->resolveType($type);
        $modelClass = $cfg['model'];

        $entity = $modelClass::findOrFail($id);
        $user = Auth::user();

        if (!$user->hasAnyRole(['admin','super_admin','moderator','teacher'])) {
            return response()->json(['status'=>false,'message'=>'Unauthorized'],403);
        }

        $translation = $entity->translations()->where('locale','hi')->first();
        if (!$translation) {
            return response()->json(['status'=>false,'message'=>'No translation found to mark done'], 404);
        }

        $translation->update([
            'source' => 'human',
            'status' => 'done',
            'reviewed_by' => $user->id,
            'reviewed_at' => now(),
        ]);

        return response()->json(['status'=>true,'message'=>'Marked as done','translation'=>$translation]);
    }
}
