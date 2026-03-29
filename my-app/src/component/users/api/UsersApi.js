const BASE = "http://localhost:4000";

export const fetchUsers       = () => fetch(`${BASE}/users?limit=100`).then(r => r.json());
export const fetchDepartments = () => fetch(`${BASE}/departments`).then(r => r.json());
export const fetchAddresses   = () => fetch(`${BASE}/addresses`).then(r => r.json());

export const deleteUser = (id) =>
    fetch(`${BASE}/users/${id}`, { method: "DELETE" });

export const updateUser = (id, data) =>
    fetch(`${BASE}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });

export const createUser = (data) =>
    fetch(`${BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).then(r => r.json());

export const createAddress = (data) =>
    fetch(`${BASE}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });