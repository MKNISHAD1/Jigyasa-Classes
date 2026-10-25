<?php

namespace App\Http\Controllers;


use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use App\Traits\HasTranslations;
use App\Helpers\ActivityLogger;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Validator;

class CategoryCantroller extends Controller
{
    use HasTranslations;

    // Get all categories with translations and course usage counts
    public function getAllCategories()
    {
        $categories = Category::query()
            ->withCount([
                'courses as courses_count' => fn ($query) =>
                    $query->withTrashed(),
            ])
            ->with([
                'subcategories' => function ($query) {
                    $query->withCount([
                        'courses as courses_count' => fn ($courseQuery) =>
                            $courseQuery->withTrashed(),
                    ]);
                },
            ])
            ->get();

        return response()->json([
            'status' => true,

            'categories' => $categories->map(fn ($cat) => [
                'id' => $cat->id,

                'name' => [
                    'en' => $cat->name,
                    'hi' => $cat->translateField('name', 'hi')
                        ?? $cat->name,
                ],

                'courses_count' => $cat->courses_count,
                'subcategories_count' => $cat->subcategories->count(),

                'subcategories' => $cat->subcategories->map(fn ($sub) => [
                    'id' => $sub->id,

                    'name' => [
                        'en' => $sub->name,
                        'hi' => $sub->translateField('name', 'hi')
                            ?? $sub->name,
                    ],

                    'courses_count' => $sub->courses_count,
                ]),
            ]),
        ]);
    }

    // Create new Category
    public function createCategory(Request $request)
    {
        $request->validate([
            'name_en' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name'),
            ],
            'name_hi' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        if ($this->hasDuplicateHindiName(
            Category::class,
            $request->name_hi
        )) {
            return response()->json([
                'status' => false,
                'message' => 'This Hindi category name already exists.',
                'errors' => [
                    'name_hi' => [
                        'This Hindi category name already exists.',
                    ],
                ],
            ], 422);
        }

        // Create base category
        $category = Category::create([
            'name' => $request->name_en,
            'slug' => \Str::slug($request->name_en),
        ]);

        // Save translations
        $category->saveTranslation('name', 'hi', $request->name_hi);

        // Activity Log — Category Controller
        ActivityLogger::log('Created_Category', null, [
            'entity_type' => 'category',
            'entity_id' => $category->id,
            'entity_title' => $category->name,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Category created successfully.',
            'category' => $category
        ]);
    }

    //  Update Category
    public function updateCategory(Request $request, $id)
    {
        $category = Category::findOrFail($id);

        $request->validate([
            'name_en' => [
                'required',
                'string',
                'max:255',
                Rule::unique('categories', 'name')->ignore($id),
            ],
            'name_hi' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        if ($this->hasDuplicateHindiName(
            Category::class,
            $request->name_hi,
            (int) $id
        )) {
            return response()->json([
                'status' => false,
                'message' => 'This Hindi category name already exists.',
                'errors' => [
                    'name_hi' => [
                        'This Hindi category name already exists.',
                    ],
                ],
            ], 422);
        }

        // Update base
        $category->update([
            'name' => $request->name_en,
            'slug' => \Str::slug($request->name_en),
        ]);

        // Update translation
        $category->saveTranslation('name', 'hi', $request->name_hi);

        // Activity Log — Category Controller
        ActivityLogger::log('Updated_Category', null, [
            'entity_type' => 'category',
            'entity_id' => $category->id,
            'entity_title' => $category->name,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Category updated successfully.',
        ]);
    }

    // Delete category safely
    public function deleteCategory($id)
    {
        $user = auth()->user();

        if (!$user || !$user->hasRole('super_admin')) {
            return response()->json([
                'status' => false,
                'message' => 'Only super admins can delete categories.',
            ], 403);
        }

        $category = Category::findOrFail($id);

        // Include soft-deleted courses in usage checks.
        if ($category->courses()->withTrashed()->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'This category is assigned to courses. Reassign those courses before deleting it.',
            ], 422);
        }

        // Do not automatically delete subcategories.
        if ($category->subcategories()->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'This category still contains subcategories. Delete eligible subcategories first.',
            ], 422);
        }

        $categoryId = $category->id;
        $categoryTitle = $category->name;

        DB::transaction(function () use ($category) {
            $category->delete();
        });

        ActivityLogger::log('Deleted_Category', null, [
            'entity_type' => 'category',
            'entity_id' => $categoryId,
            'entity_title' => $categoryTitle,
            'deleted_subcategories_count' => 0,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Category deleted successfully.',
        ]);
    }

    // fetch single category
    public function getCategory($id)
    {
        $cat = Category::findOrFail($id);

        return response()->json([
            'id' => $cat->id,
            'name' => [
                'en' => $cat->name,
                'hi' => $cat->translateField('name','hi') ?? $cat->name
            ]
        ]);
    }

    // Get subcategories for a category with translation
    public function getAllsubcategories($categoryId)
    {
        $subcategories = Subcategory::where('category_id', $categoryId)->get();

        return response()->json([
            'status' => true,
            'subcategories' => $subcategories->map(fn($sub) => [
                'id'   => $sub->id,
                'name' => [
                    'en' => $sub->name,
                    'hi' => $sub->translateField('name','hi') ?? $sub->name, // fallback
                ],
            ])
        ]);
    }

    // Create new sub category
    public function createSubcategory(Request $request)
    {

        $request->validate([
            'category_id' => [
                'required',
                'integer',
                'exists:categories,id',
            ],
            'name_en' => [
                'required',
                'string',
                'max:255',
                Rule::unique('subcategories', 'name')
                    ->where('category_id', $request->category_id),
            ],
            'name_hi' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        if ($this->hasDuplicateHindiName(
            Subcategory::class,
            $request->name_hi,
            null,
            (int) $request->category_id
        )) {
            return response()->json([
                'status' => false,
                'message' => 'This Hindi subcategory name already exists in this category.',
                'errors' => [
                    'name_hi' => [
                        'This Hindi subcategory name already exists in this category.',
                    ],
                ],
            ], 422);
        }

        // Create base subcategory
        $sub = Subcategory::create([
            'category_id'      => $request->category_id,
            'name'             => $request->name_en,
            'slug'             => \Str::slug($request->name_en),
        ]);

        // Save translations
        $sub->saveTranslation('name', 'hi', $request->name_hi);

        // Activity Log — Category Controller
        ActivityLogger::log('Created_Subcategory', null, [
            'entity_type' => 'subcategory',
            'entity_id' => $sub->id,
            'entity_title' => $sub->name,
            'category_id' => $sub->category_id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Subcategory created successfully.',
            'subcategory' => $sub
        ]);
    }

    // update subcategory
    public function updateSubcategory(Request $request, $id)
    {
        $sub = Subcategory::findOrFail($id);

        $request->validate([
            'name_en' => [
                'required',
                'string',
                'max:255',
                Rule::unique('subcategories', 'name')
                    ->where('category_id', $sub->category_id)
                    ->ignore($id),
            ],
            'name_hi' => [
                'required',
                'string',
                'max:255',
            ],
        ]);

        if ($this->hasDuplicateHindiName(
            Subcategory::class,
            $request->name_hi,
            (int) $id,
            (int) $sub->category_id
        )) {
            return response()->json([
                'status' => false,
                'message' => 'This Hindi subcategory name already exists in this category.',
                'errors' => [
                    'name_hi' => [
                        'This Hindi subcategory name already exists in this category.',
                    ],
                ],
            ], 422);
        }
        
        // Update base fields
        $sub->update([
            'name'            => $request->name_en,
            'slug'            => \Str::slug($request->name_en),
        ]);

        // Save translations
        $sub->saveTranslation('name', 'hi', $request->name_hi);

        // Activity Log — Category Controller
        ActivityLogger::log('Updated_Subcategory', null, [
            'entity_type' => 'subcategory',
            'entity_id' => $sub->id,
            'entity_title' => $sub->name,
            'category_id' => $sub->category_id,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Subcategory updated successfully.'
        ]);
    }

    // Delete subcategory safely
    public function deleteSubcategory($id)
    {
        $user = auth()->user();

        if (!$user || !$user->hasRole('super_admin')) {
            return response()->json([
                'status' => false,
                'message' => 'Only super admins can delete subcategories.',
            ], 403);
        }

        $sub = Subcategory::findOrFail($id);

        if ($sub->courses()->withTrashed()->exists()) {
            return response()->json([
                'status' => false,
                'message' => 'This subcategory is assigned to courses. Reassign those courses before deleting it.',
            ], 422);
        }

        $subcategoryId = $sub->id;
        $subcategoryTitle = $sub->name;
        $categoryId = $sub->category_id;

        $sub->delete();

        ActivityLogger::log('Deleted_Subcategory', null, [
            'entity_type' => 'subcategory',
            'entity_id' => $subcategoryId,
            'entity_title' => $subcategoryTitle,
            'category_id' => $categoryId,
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Subcategory deleted successfully.',
        ]);
    }

    // fetch single sub category
    public function getSubcategory($id)
    {
        $sub = Subcategory::findOrFail($id);

        return response()->json([
            'id' => $sub->id,
            'name' => [
                'en' => $sub->name,
                'hi' => $sub->translateField('name','hi') ?? $sub->name,
            ],
            'category_id' => $sub->category_id,
        ]);
    }

    /**
     * Check whether a Hindi name is already used.
     */
    private function hasDuplicateHindiName(
        string $modelClass,
        string $name,
        ?int $excludeId = null,
        ?int $categoryId = null
    ): bool {
        $normalizedName = mb_strtolower(trim($name));

        $query = $modelClass::query();

        if ($excludeId !== null) {
            $query->where('id', '!=', $excludeId);
        }

        if ($categoryId !== null) {
            $query->where('category_id', $categoryId);
        }

        return $query->get()->contains(function ($item) use ($normalizedName) {
            $existingName = $item->translateField('name', 'hi');

            return $existingName !== null
                && mb_strtolower(trim($existingName)) === $normalizedName;
        });
    }

}