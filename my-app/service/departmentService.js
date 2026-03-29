const BASE_URL = "http://localhost:4000";

export const departmentService = {
    // GET /departments
    getAll: async () => {
        const res = await fetch(`${BASE_URL}/departments`);
        if (!res.ok) throw new Error("Failed to fetch departments");
        const json = await res.json();
        return (json.data || []).sort((a, b) => a.id - b.id);
    },

    // GET /departments/:id (INNER JOIN with users)
    getById: async (id) => {
        const res = await fetch(`${BASE_URL}/departments/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch department ${id}`);
        const json = await res.json();
        return json.data || {};
    },

    // GET user count for all departments via /departments/:id
    getAllUserCounts: async (depts) => {
        const countMap = {};
        await Promise.all(
            depts.map(async (dept) => {
                try {
                    const res = await fetch(`${BASE_URL}/departments/${dept.id}`);
                    const json = await res.json();
                    countMap[dept.id] = (json.data?.users || []).length;
                } catch {
                    countMap[dept.id] = 0;
                }
            })
        );
        return countMap;
    },
};