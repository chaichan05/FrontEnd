const BASE_URL = "http://localhost:4000";

export const userService = {
    // GET /users
    getAll: async (limit = 100) => {
        const res = await fetch(`${BASE_URL}/users?limit=${limit}`);
        if (!res.ok) throw new Error("Failed to fetch users");
        const json = await res.json();
        return (
            json.data?.users ||
            json.data?.data ||
            (Array.isArray(json.data) ? json.data : []) ||
            json.users ||
            []
        );
    },

    // GET /addresses
    getAllAddresses: async () => {
        const res = await fetch(`${BASE_URL}/addresses`);
        if (!res.ok) throw new Error("Failed to fetch addresses");
        const json = await res.json();
        return json.data || [];
    },
};

// Validation rules ตาม Backend
export const validatePostalCode = (value) => {
    if (!value) return "กรุณากรอกรหัสไปรษณีย์";
    if (!/^\d{5}$/.test(value)) return "รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลักเท่านั้น";
    return null;
};

export const validateRequired = (value, fieldName) => {
    if (!value || String(value).trim() === "") return `กรุณากรอก${fieldName}`;
    return null;
};

export const validateEmail = (value) => {
    if (!value) return "กรุณากรอกอีเมล";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "รูปแบบอีเมลไม่ถูกต้อง";
    return null;
};