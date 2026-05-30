<?php

namespace App\Http\Controllers;

use App\Models\CourseModule;
use App\Models\Lesson;
use App\Models\User;
use App\Models\Course;

use App\Traits\HasTranslations;

use Illuminate\Http\Request;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Auth;

class CourseModuleController extends Controller
{
    use HasTranslations;

    // Helper for General Name Check

    private function isGeneralModule($title)
    {
        return strtolower(trim($title)) === 'general';
    }


    // List Module  

    public function listModules($courseId)
    {
        $modules = CourseModule::with('lessons')
            ->where('course_id', $courseId)
            ->orderBy('order')
            ->get();

        return response()->json([
            'status' => true,
            'modules' => $modules
        ]);
    }

    // Create Module

    public function createModule(Request $request)
    {
        $user = Auth::user();

        $validated = $request->validate([
            'course_id' => 'required|exists:courses,id',
            'title_en'  => 'required|string|max:255',
            'title_hi'  => 'nullable|string|max:255',
            'order'     => 'nullable|integer|min:0',
        ]);

        $course = Course::findOrFail($request->course_id);

        // Prevent creating of General module
        if ($this->isGeneralModule($request->title_en)){
            return response()->json([
                'status' => false,
                'message' => 'General module is created automatically and cannot be created manually.'
            ], 422);
        }

        $module = CourseModule::create([
            'course_id' => $course->id,
            'title'     => $request->title_en,
            'order'     => $request->order ?? 0,
        ]);

        // Manual Hindi
        $module->saveTranslation('title','hi',$request->title_hi);

        // Auto translate
        if (!$request->title_hi) 
            {
                $module->translateFields(['title'],'hi');
            }

        return response()->json([
            'status' => true,
            'message' => 'Module created successfully',
            'module' => [
                'id' => $module->id,
                'title' => [
                    'en' => $module->title,
                    'hi' => $module->translateField('title', 'hi') ?? $module->title,
                ],
                'order' => $module->order,
            ]
        ], 201);
    }

    // Update Module

    public function updateModule(Request $request, $id)
    {
        $module = CourseModule::with('translations')
            ->findOrFail($id);

        $validated = $request->validate([
            'title_en' => 'sometimes|string|max:255',
            'title_hi' => 'nullable|string|max:255',
            'order'    => 'nullable|integer|min:0',
        ]);

        //General module cannot be renamed
        if (
            $this->isGeneralModule($module->title) &&
            $request->filled('title_en') &&
            !$this->isGeneralModule($request->title_en)
        ) {
            return response()->json([
                'status' => false,
                'message' => 'General module cannot be renamed.'
            ], 422);
        }

        //module cannot be renamed to General

        if (
            $request->filled('title_en') &&
            $this->isGeneralModule($request->title_en) &&
            !$this->isGeneralModule($module->title)
        ) {
            return response()->json([
                'status' => false,
                'message' => 'A module cannot be renamed to General.'
            ], 422);
        }


        $oldTitleEn = $module->title;

        $translationHi = $module->translations()
            ->where('locale', 'hi')
            ->first();

        $oldTitleHi = $translationHi?->title ?? null;

        $newTitleEn = $request->title_en;
        $newTitleHi = $request->title_hi;

        $titleEnChanged =
            $request->has('title_en') &&
            $newTitleEn !== $oldTitleEn;

        $titleHiManuallyChanged =
            $request->has('title_hi') &&
            $newTitleHi !== null &&
            $newTitleHi !== '' &&
            $newTitleHi !== $oldTitleHi;

        if ($titleHiManuallyChanged) {
            $module->saveTranslation(
                'title',
                'hi',
                $newTitleHi
            );
        }

        $module->update([
            'title' => $request->title_en ?? $module->title,
            'order' => $request->order ?? $module->order,
        ]);

        if ($titleEnChanged && !$titleHiManuallyChanged) {

            $translationHi = $module->translations()
                ->firstOrCreate([
                    'locale' => 'hi'
                ]);

            $translationHi->title = null;
            $translationHi->save();

            $module->translateFields(
                ['title'],
                'hi'
            );
        }

        return response()->json([
            'status' => true,
            'message' => 'Module updated successfully',
            'module' => $module
        ]);
    }


    // Delete Module

    public function deleteModule($id)
    {
        $module = CourseModule::findOrFail($id);

        // Prevent deleting General
        if ($this->isGeneralModule($module->title)) {
            return response()->json([
                'status' => false,
                'message' => 'General module cannot be deleted'
            ], 422);
        }

        $generalModule = CourseModule::firstOrCreate([
            'course_id' => $module->course_id,
            'title' => 'General'
        ], [
            'order' => 0
        ]);

        // Move lessons into General
        Lesson::where(
            'module_id',
            $module->id
        )->update([
            'module_id' => $generalModule->id
        ]);

        $module->delete();

        return response()->json([
            'status' => true,
            'message' => 'Module deleted successfully'
        ]);
    }

    // Trashed Module 

    public function trashedModules()
    {
        $modules = CourseModule::onlyTrashed()
            ->with('lessons')
            ->get();

        return response()->json([
            'status' => true,
            'modules' => $modules
        ]);
    }

    // Restore Module 

    public function restoreModule($id)
    {
        $module = CourseModule::onlyTrashed()
            ->find($id);

        if (!$module) {
            return response()->json([
                'status' => false,
                'message' => 'Module not found'
            ], 404);
        }

        $module->restore();

        return response()->json([
            'status' => true,
            'message' => 'Module restored successfully',
            'module' => $module
        ]);
    }

    // Permanently delete
    public function forceDeleteModule($id)
    {
        $module = CourseModule::onlyTrashed()
            ->find($id);

        if (!$module) {
            return response()->json([
                'status' => false,
                'message' => 'Module not found'
            ], 404);
        }

        // Prevent deleting General forever
        if ($this->isGeneralModule($module->title)) {
            return response()->json([
                'status' => false,
                'message' => 'General module cannot be permanently deleted'
            ], 422);
        }

        $module->forceDelete();

        return response()->json([
            'status' => true,
            'message' => 'Module permanently deleted'
        ]);
    }

    // Adding lessons in module

    public function assignLessons(Request $request, $moduleId)
    {
        $module = CourseModule::findOrFail($moduleId);

        $request->validate([
            'lesson_ids'   => 'required|array',
            'lesson_ids.*' => 'exists:lessons,id',
        ]);

        Lesson::whereIn(
            'id',
            $request->lesson_ids
        )
        ->where(
            'course_id',
            $module->course_id
        )
        ->update([
            'module_id' => $moduleId
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Lessons assigned successfully'
        ]);
    }

    // Removing Lessons from Module

    public function removeLessons(Request $request,$id)
    {
        $module = CourseModule::findOrFail($id);

        $validated = $request->validate([
            'lesson_ids' => 'required|array|min:1',
            'lesson_ids.*' => 'exists:lessons,id',
        ]);

        // Find General module for same course
        $generalModule = CourseModule::firstOrCreate(
            [
                'course_id' => $module->course_id,
                'title' => 'General',
            ],
            [
                'order' => 0,
            ]
        );

        Lesson::whereIn(
            'id',
            $request->lesson_ids
        )
        ->where(
            'module_id',
            $module->id
        )
        ->where(
            'course_id',
            $module->course_id
        )
        ->update([
            'module_id' => $generalModule->id
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Lessons removed successfully'
        ]);
    }

    // Bulk Soft delete of module

    public function bulkDeleteModules(Request $request)
    {
        $validated = $request->validate([
            'module_ids' => 'required|array|min:1',
            'module_ids.*' => 'exists:course_modules,id',
        ]);

        $modules = CourseModule::whereIn(
            'id',
            $request->module_ids
        )->get();

        foreach ($modules as $module) {

            if ($this->isGeneralModule($module->title)) {
                return response()->json([
                    'status' => false,
                    'message' => 'General module cannot be deleted.'
                ], 422);
            }

            $generalModule = CourseModule::firstOrCreate(
                [
                    'course_id' => $module->course_id,
                    'title' => 'General'
                ],
                [
                    'order' => 0
                ]
            );

            Lesson::where('module_id', $module->id)
                ->update([
                    'module_id' => $generalModule->id
                ]);

            $module->delete();
        }


        return response()->json([
            'status' => true,
            'message' => 'Modules deleted successfully'
        ]);
    }

    // Bulk restore of Module
    public function bulkRestoreModules(Request $request)
    {
        $validated = $request->validate([
            'module_ids' => 'required|array|min:1',
        ]);

        CourseModule::onlyTrashed()
            ->whereIn(
                'id',
                $request->module_ids
            )
            ->restore();

        return response()->json([
            'status' => true,
            'message' => 'Modules restored successfully'
        ]);
    }

    ///bulk force delete of modules
    public function bulkForceDeleteModules(Request $request)
    {
        $validated = $request->validate([
            'module_ids' => 'required|array|min:1',
        ]);
                
        $modules = CourseModule::onlyTrashed()
            ->whereIn(
                'id',
                $request->module_ids
            )
            ->get();

        foreach ($modules as $module) {

            if ($this->isGeneralModule($module->title)) {
                return response()->json([
                    'status' => false,
                    'message' => 'General module cannot be permanently deleted.'
                ], 422);
            }

            $module->forceDelete();
        }

        return response()->json([
            'status' => true,
            'message' => 'Modules permanently deleted'
        ]);
    }

}
