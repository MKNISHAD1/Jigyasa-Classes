<?php

namespace App\Traits;

use Stichoza\GoogleTranslate\GoogleTranslate;

trait HasTranslations
{
    private function getTranslationForeignKey()
    {
        return $this->getForeignKey(); 
    }

    /**
     * Auto translate + mark MACHINE + need_review
     */
    public function translateFields(array $fields, string $locale = 'en')
    {
        if ($locale === 'en') {
            return collect($fields)->mapWithKeys(fn($f) => [$f => $this->$f ?? null])->toArray();
        }

        $fk = $this->getTranslationForeignKey();

        // Load existing translation row
        $translation = $this->translations()
            ->where('locale', $locale)
            ->where($fk, $this->id)
            ->first();

        $translatedData = [];

        foreach ($fields as $field) {

            // Keep existing translation if available
            if ($translation && $translation->$field) {
                $translatedData[$field] = $translation->$field;
                continue;
            }

            $value = $this->$field ?? null;

            if (!$value) {
                $translatedData[$field] = null;
                continue;
            }

            // try {
            //     $tr = new GoogleTranslate($locale);
            //     $translatedData[$field] = $tr->translate($value);
            // } catch (\Exception $e) {
            //     $translatedData[$field] = $value;
            // }

            try {

                $tr = new GoogleTranslate($locale);

                // Handle array/json fields like highlights
                if (is_array($value)) {

                    $translatedData[$field] = array_map(
                        fn ($item) => $tr->translate($item),
                        $value
                    );

                } else {

                    $translatedData[$field] = $tr->translate($value);

                }

            } catch (\Exception $e) {

                $translatedData[$field] = $value;

            }
        }

        if (!empty($translatedData)) {
            
            $meta = [
                'source' => 'machine',
                'status' => 'need_review',
                'reviewed_by' => null,
                'reviewed_at' => null,
            ];

            if ($translation) {
                 $translation->fill(array_merge($translatedData, $meta))->save();
            } else {
                $this->translations()->create(array_merge([
                    $fk => $this->id,
                    'locale' => $locale,
                 ], $translatedData, $meta));
            }
        }

        return $translatedData;
    }

    /**
     * Save MANUAL translation + mark HUMAN + need_review
     */
    public function translateField(string $field, string $locale = 'en')
    {
        return $this->translateFields([$field], $locale)[$field] ?? null;
    }

    public function saveTranslation(string $field, string $locale, $value)
    {
        if ($value === null) return;

        $fk = $this->getTranslationForeignKey();

        $this->translations()->updateOrCreate(
            [
                'locale' => $locale,
                $fk      => $this->id,
            ],
            [
                $field => $value,
                'source' => 'human',
                'status' => 'need_review',
                'reviewed_by' => null,
                'reviewed_at' => null
            ]
        );
    }
}