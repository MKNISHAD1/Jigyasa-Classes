// src/hooks/useCourses.js
import { useEffect, useState } from "react";
import { apiUrl } from "../Component/Common/http";


/**
 * Base hook to fetch & control courses
 */
export const useCourses = ({
  status,          // "published"
  categoryId,      // number
  subcategoryId,   // number
  sortBy = "created_at", // "created_at" | "price"
  order = "desc",  // "asc" | "desc"
  limit,           // number
} = {}) => {

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch(apiUrl + "courses", {
          headers: { Accept: "application/json" },
        });

        const data = await res.json();

        if (!data?.status) return;

        let result = [...data.courses];

        /* 🔴 FILTERS 🔴 */

        // Status filter
        if (status) {
          result = result.filter(course => course.status === status);
        }

        // Category filter
        if (categoryId) {
          result = result.filter(
            course => course.category?.id === Number(categoryId)
          );
        }

        // Subcategory filter
        if (subcategoryId) {
          result = result.filter(
            course => course.subcategory?.id === Number(subcategoryId)
          );
        }

        /* 🔵 SORTING 🔵 */
        if (sortBy) {
          result.sort((a, b) => {
            let valA = a[sortBy];
            let valB = b[sortBy];

            // Date sorting
            if (sortBy.includes("at")) {
              valA = new Date(valA);
              valB = new Date(valB);
            }

            // Price sorting
            if (sortBy === "price") {
              valA = parseFloat(valA || 0);
              valB = parseFloat(valB || 0);
            }

            return order === "asc" ? valA - valB : valB - valA;
          });
        }

        /* 🟢 LIMIT / SLICE 🟢 */
        if (limit) {
          result = result.slice(0, limit);
        }

        setCourses(result);

      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [status, categoryId, subcategoryId, sortBy, order, limit]);

  return { courses, loading };
};