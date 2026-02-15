<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Subcategory;


class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $mpsc = Category::create([
            'name' => 'MPSC',
            'slug' => 'mpsc',
        ]);
        
        Subcategory::insert([
            ['name' => 'MPSC Main', 'slug' => 'mpsc_main', 'category_id' => $mpsc->id],
            ['name' => 'MPSC Reapper', 'slug' => 'mpsc_reapper', 'category_id' => $mpsc->id],
        ]);

// ----------------------------------------------------

        $testcat1 = Category::create([
            'name' => 'TestCat1',
            'slug' => 'testcat1',
        ]);
        Subcategory::insert([
            ['name' => 'Sub Cat 1', 'slug' => 'subcat_1', 'category_id' => $testcat1->id],
            ['name' => 'Sub Cat 2', 'slug' => 'sub_cat2', 'category_id' => $testcat1->id],
        ]);
    }
}
