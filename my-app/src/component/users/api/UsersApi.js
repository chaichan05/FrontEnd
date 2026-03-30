const BASE = "http://localhost:4000";

// API functions สำหรับเรียกใช้งานกับ backend
export const fetchUsers = () => fetch(`${BASE}/users?limit=100`).then(r => r.json());
export const fetchDepartments = () => fetch(`${BASE}/departments`).then(r => r.json());
export const fetchAddresses = () => fetch(`${BASE}/addresses`).then(r => r.json());

// Delete
export const deleteUser = (id) =>
    fetch(`${BASE}/users/${id}`, { method: "DELETE" });
//Update
export const updateUser = (id, data) =>
    fetch(`${BASE}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
//create
export const createUser = (data) =>
    fetch(`${BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).then(r => r.json());
//create address
export const createAddress = (data) =>
    fetch(`${BASE}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });