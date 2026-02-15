import { useEffect, useState } from "react";
import { apiUrl, token } from "../Component/Common/http";

export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [subcategories, setSubcategories] = useState({}); // keyed by categoryId
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(apiUrl + "categories", {
          headers: { Authorization: `Bearer ${token()}` },
        });
        const data = await res.json();

        if (data.status) {
          setCategories(data.categories);

          // fetch subcategories in parallel
          data.categories.forEach(async (cat) => {
            const subRes = await fetch(
              `${apiUrl}categories/${cat.id}/subcategories`,
              {
                headers: { Authorization: `Bearer ${token()}` },
              }
            );
            const subData = await subRes.json();
            if (subData.status) {
              setSubcategories((prev) => ({
                ...prev,
                [cat.id]: subData.subcategories,
              }));
            }
          });
        }
      } catch (err) {
        console.error("Category fetch failed", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, subcategories, loading };
};