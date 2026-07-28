<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Models\User;
use App\Models\Course;

use Illuminate\Support\Facades\Validator;


class AvailabilityCheckController extends Controller
{
    public function checkAvilability(Request $request)
    {
        $model = $request->query('model');
        $field = $request->query('field');
        $value = $request->query('value');
        $id    = $request->query('id');

        $allowed = [

            // User Table
            'users' => [
                'model' => User::class,
                'fields' => [
                    'username',
                    'email',
                    'mobile_no',
                ]
            ],
            // Course Table

            'courses' => [
                'model' => Course::class,
                'fields' => [
                    'title',
                ]
            ],
        ];
        
        if (!isset($allowed[$model])) {
            return response()->json([
                'exists' => false,
                'message' => 'Invalid model.'
            ],400);
        }

        if (!in_array($field,$allowed[$model]['fields'])) {
            return response()->json([
                'exists' => false,
                'message' => 'Invalid field.'
            ],400);
        }

        $modelClass = $allowed[$model]['model'];

        $query = $modelClass::query();

        if (
            in_array(
                \Illuminate\Database\Eloquent\SoftDeletes::class,
                class_uses_recursive($modelClass)
            )
        ) {
            $query->withTrashed();
        }

        $query->where($field,$value);

        if($id){
            $query->where('id','!=',$id);
        }

        $record = $query->first();

        return response()->json([

                    'exists' => (bool)$record,

                    'trashed' => $record
                        ? method_exists($record,'trashed') && $record->trashed()
                        : false

            ]);        
    }
}