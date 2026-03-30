const BASE = "http://localhost:4000";

// API functions สำหรับเรียกใช้งานกับ backend
export const fetchUsers = () => fetch(`${BASE}/users?limit=100`).then(r => r.json());
export const fetchDepartments = () => fetch(`${BASE}/departments`).then(r => r.json());
export const fetchAddresses = () => fetch(`${BASE}/addresses`).then(r => r.json());

// Delete จาก API โดยส่ง ID ของผู้ใช้ที่ต้องการลบไปยัง endpoint ที่กำหนด และใช้ HTTP method DELETE
export const deleteUser = (id) =>
    fetch(`${BASE}/users/${id}`, { method: "DELETE" });
//Update จาก API โดยส่ง ID ของผู้ใช้ที่ต้องการแก้ไขและข้อมูลใหม่ไปยัง endpoint ที่กำหนด และใช้ HTTP method PUT พร้อมกับ body ที่เป็น JSON ของข้อมูลใหม่
export const updateUser = (id, data) =>
    fetch(`${BASE}/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
//create จาก API โดยส่งข้อมูลของผู้ใช้ใหม่ไปยัง endpoint ที่กำหนด และใช้ HTTP method POST พร้อมกับ body ที่เป็น JSON ของข้อมูลผู้ใช้ใหม่
export const createUser = (data) =>
    fetch(`${BASE}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    }).then(r => r.json());
//create address จาก API โดยส่งข้อมูลที่อยู่ใหม่ไปยัง endpoint ที่กำหนด และใช้ HTTP method POST พร้อมกับ body ที่เป็น JSON ของข้อมูลที่อยู่ใหม่
export const createAddress = (data) =>
    fetch(`${BASE}/addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });