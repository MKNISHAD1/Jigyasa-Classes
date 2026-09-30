// src/hooks/useCourses.js

import { useEffect, useState } from "react";
import { apiUrl } from "../Component/Common/http";

/**
 * Base hook to fetch & control public courses
 *
 * Used by:
 * - Homepage
 * - All Courses page
 */
export const useCourses = ({
    status,
    categoryId,
    subcategoryId,
    sortBy = "created_at",
    order = "desc",
    limit,
} = {}) => {

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);


    useEffect(() => {

        const fetchCourses = async () => {

            try {
                setLoading(true);
                setError(null);

                const response = await fetch( apiUrl + "public-courses",
                    {
                        headers: {
                            Accept: "application/json",
                        },
                    }
                );


                if (!response.ok) {
                    throw new Error(
                        `Failed to fetch courses: ${response.status}`
                    );
                }

                const data = await response.json();

                if (!data?.status || !Array.isArray(data.courses)) {
                    throw new Error("Invalid course response.");
                }

                let result = [...data.courses];


                /*
                |--------------------------------------------------------------------------
                | FILTERS
                |--------------------------------------------------------------------------
                */

                // Status
                if (status) { result = result.filter(
                        course => course.status === status
                    );
                }


                // Category
                if (categoryId) {
                    result = result.filter(
                        course =>
                            course.category?.id === Number(categoryId)
                    );
                }


                // Subcategory
                if (subcategoryId) {
                    result = result.filter(
                        course =>
                            course.subcategory?.id === Number(subcategoryId)
                    );
                }

                /*
                |--------------------------------------------------------------------------
                | SORTING
                |--------------------------------------------------------------------------
                */

                if (sortBy) {
                    result.sort((a, b) => {

                        let valueA = a?.[sortBy];
                        let valueB = b?.[sortBy];

                        // Date fields
                        if (
                            sortBy === "created_at" ||
                            sortBy === "updated_at" ||
                            sortBy === "published_at"
                        ) {
                            valueA = valueA
                                ? new Date(valueA).getTime()
                                : 0;

                            valueB = valueB
                                ? new Date(valueB).getTime()
                                : 0;
                        }

                        // Price
                        else if (sortBy === "price") {
                            valueA = Number(valueA || 0);
                            valueB = Number(valueB || 0);
                        }

                        // Numeric fields
                        else {
                            valueA = Number(valueA || 0);
                            valueB = Number(valueB || 0);
                        }

                        return order === "asc"
                            ? valueA - valueB
                            : valueB - valueA;
                    });
                }

                /*
                |--------------------------------------------------------------------------
                | LIMIT
                |--------------------------------------------------------------------------
                */

                if (Number.isFinite(Number(limit)) && Number(limit) > 0) {
                    result = result.slice(0, Number(limit));
                }

                setCourses(result);

            } catch (err) {

                console.error(
                    "Failed to fetch courses:",
                    err
                );

                setError(err);
                setCourses([]);

            } finally {

                setLoading(false);
            }
        };


        fetchCourses();

    }, [
        status,
        categoryId,
        subcategoryId,
        sortBy,
        order,
        limit,
    ]);


    return {
        courses,
        loading,
        error,
    };
};