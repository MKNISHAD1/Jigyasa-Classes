<?php

namespace App\Http\Controllers;


use App\Models\Category;
use App\Models\Subcategory;
use Illuminate\Http\Request;
use App\Traits\HasTranslations;

class CategoryCantroller extends Controller
{
    use HasTranslations;

    // Get all categories with translations
    public function getAllCategories()
    {
        $categories = Category::all();

        return response()->json([
            'status' => true,
            'categories' => $categories->map(fn($cat) => [
                'id'   => $cat->id,
                'name' => [
                    'en' => $cat->name,
                    'hi' => $cat->translateField('name','hi') ?? $cat->name, // fallback
                ],
                'subcategories' => $cat->subcategories->map(fn($sub) => [
                    'id'   => $sub->id,
                    'name' => [
                        'en' => $sub->name,
                        'hi' => $sub->translateField('name','hi') ?? $sub->name,
                    ],
                    'who_can_enroll' => [
                        'en' => $sub->who_can_enroll,
                        'hi' => $sub->translateField('who_can_enroll','hi') ?? $sub->who_can_enroll,
                    ]
                ])
            ])
        ]);
    }


    // Create new Category
    public function createCategory(Request $request)
    {
        $request->validate([
            'name_en' => 'required|string|max:255',
            'name_hi' => 'required|string|max:255',
        ]);

        // Create base category
        $category = Category::create([
            'name' => $request->name_en,
            'slug' => \Str::slug($request->name_en),
        ]);

        // Save translations
        $category->saveTranslation('name', 'hi', $request->name_hi);

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
            'name_en' => 'required|string|max:255',
            'name_hi' => 'required|string|max:255',
        ]);

        // Update base
        $category->update([
            'name' => $request->name_en,
            'slug' => \Str::slug($request->name_en),
        ]);

        // Update translation
        $category->saveTranslation('name', 'hi', $request->name_hi);

        return response()->json([
            'status' => true,
            'message' => 'Category updated successfully.',
        ]);
    }



    // Delete existing category
    public function deleteCategory($id)
    {
        $category = Category::findOrFail($id);

        // Delete subcategories
        foreach ($category->subcategories as $sub) {
            $sub->delete();
        }

        $category->delete();

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
                'who_can_enroll' => [
                    'en' => $sub->who_can_enroll,
                    'hi' => $sub->translateField('who_can_enroll', 'hi') ?? $sub->who_can_enroll,
                ]
            ])
        ]);
    }


    // Create new sub category
    public function createSubcategory(Request $request)
    {
        $request->validate([
            'category_id'      => 'required|exists:categories,id',
            'name_en'          => 'required|string|max:255',
            'name_hi'          => 'required|string|max:255',
            'who_enroll_en'    => 'required|string|max:500',
            'who_enroll_hi'    => 'required|string|max:500',
        ]);

        // Create base subcategory
        $sub = Subcategory::create([
            'category_id'      => $request->category_id,
            'name'             => $request->name_en,
            'slug'             => \Str::slug($request->name_en),
            'who_can_enroll'   => $request->who_enroll_en,
        ]);

        // Save translations
        $sub->saveTranslation('name', 'hi', $request->name_hi);
        $sub->saveTranslation('who_can_enroll', 'hi', $request->who_enroll_hi);

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
            'name_en'          => 'required|string|max:255',
            'name_hi'          => 'required|string|max:255',
            'who_enroll_en'    => 'required|string|max:500',
            'who_enroll_hi'    => 'required|string|max:500',
        ]);

        // Update base fields
        $sub->update([
            'name'            => $request->name_en,
            'slug'            => \Str::slug($request->name_en),
            'who_can_enroll'  => $request->who_enroll_en,
        ]);

        // Save translations
        $sub->saveTranslation('name', 'hi', $request->name_hi);
        $sub->saveTranslation('who_can_enroll', 'hi', $request->who_enroll_hi);

        return response()->json([
            'status' => true,
            'message' => 'Subcategory updated successfully.'
        ]);
    }


    // delete subcategory
    public function deleteSubcategory($id)
    {
        $sub = Subcategory::findOrFail($id);
        $sub->delete();

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
            'who_can_enroll' => [
                'en' => $sub->who_can_enroll,
                'hi' => $sub->translateField('who_can_enroll','hi') ?? $sub->who_can_enroll,
            ],
            'category_id' => $sub->category_id,
        ]);
    }

}