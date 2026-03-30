import { useEffect, useRef, useState } from "react";
import { useUserStore } from "../../../store/userStore";

export const useUsers = () => {
    const {
        data, setData,
        departments, setDepartments,
        searchTerm, setSearchTerm,
        currentPage, setCurrentPage,
        selectedUser, setSelectedUser,
        isOpen, setIsOpen,
        isEditOpen, setIsEditOpen,
        editingUser, setEditingUser,
        formData, updateFormData,
        isCreateOpen, setIsCreateOpen,
        newUserData, updateNewUserData,
        isAddressOpen, setIsAddressOpen,
        addUserToData, updateUserInData, removeUserFromData,
        resetCreateForm, resetEditForm,
    } = useUserStore();

    const itemsPerPage = 10;

    // ── Filter / Sort state ──
    const [genderFilter, setGenderFilter] = useState("");
    const [departmentFilter, setDepartmentFilter] = useState("");
    const [sortBy, setSortBy] = useState("u.id");

    // ── Debounce search ──
    const [inputValue, setInputValue] = useState(searchTerm);
    const debounceRef = useRef(null);

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setSearchTerm(val);
            setCurrentPage(1);
        }, 300);
    };

    // ── Fetch ── ฟังก์ชัน fetchUsers ใช้โหลดข้อมูลผู้ใช้จาก API โดยรับพารามิเตอร์สำหรับการค้นหา (search), การกรอง
    const fetchUsers = async (search = "", gender = "", deptId = "", sort = "") => {
        const params = new URLSearchParams({ limit: 100 });
        if (search) params.set("search", search);
        if (gender) params.set("gender", gender);
        if (deptId) params.set("department_id", deptId);
        if (sort) params.set("sort", sort);

        const [userRes, deptRes, addRes] = await Promise.all([
            fetch(`http://localhost:4000/users?${params}`),
            fetch("http://localhost:4000/departments"),
            fetch("http://localhost:4000/addresses"),
        ]);
        const [userJson, deptJson, addJson] = await Promise.all([
            userRes.json(), deptRes.json(), addRes.json(),
        ]);

        const depts = deptJson.data;
        const addresses = addJson.data;
        const addressMap = {};
        addresses.forEach(a => { addressMap[a.user_id] = a; });

        const usersWithDept = userJson.data.users.map(u => ({ // เพิ่ม department_name และ address ลงในแต่ละ user
            ...u,
            department_name: depts.find(d => d.id === Number(u.department_id))?.name || null,
            address: addressMap[u.id] || null,
        }));

        const sorted = [...usersWithDept].sort((a, b) => { // เรียงข้อมูลตาม sortBy
            switch (sort) {
                case "u.first_name": return (a.first_name || "").localeCompare(b.first_name || "");
                case "u.last_name": return (a.last_name || "").localeCompare(b.last_name || "");
                case "u.age": return (a.age || 0) - (b.age || 0);
                case "u.created_at": return new Date(a.created_at) - new Date(b.created_at);
                case "d.name": return (a.department_name || "").localeCompare(b.department_name || "");
                default: return a.id - b.id;
            }
        });

        setData(sorted);
        setDepartments(depts);
    };

    useEffect(() => { fetchUsers(); }, []);

    useEffect(() => {
        setCurrentPage(1);
        fetchUsers(searchTerm, genderFilter, departmentFilter, sortBy);
    }, [searchTerm, genderFilter, departmentFilter, sortBy]);

    // ── Pagination ── เลื่อนจอ
    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = data.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(data.length / itemsPerPage);

    // ── Delete ── ลบข้อมูล
    const handleDelete = async (user) => {
        const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();
        if (!window.confirm(`คุณต้องการลบ ${fullName || "user นี้"} ใช่ไหม?`)) return;

        const oldData = data;
        removeUserFromData(user.id);

        try {
            const res = await fetch(`http://localhost:4000/users/${user.id}`, { method: "DELETE" });
            if (!res.ok) throw new Error("Delete failed");
            alert(`ลบ ${fullName} สำเร็จ`);
        } catch (err) {
            setData(oldData);
            alert(`ลบ ${fullName} ไม่สำเร็จ`);
            console.error(err);
        }
    };

    // ── Edit ── แก้ไขข้อมูล
    const handleEdit = (user) => {
        setEditingUser(user);
        updateFormData({
            first_name: user.first_name,
            last_name: user.last_name,
            email: user.email,
            phone: user.phone,
            age: user.age,
            gender: user.gender,
            department_id: user.department_id || "",
        });
        setIsEditOpen(true);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        updateFormData({ [name]: value });
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        try {
            const res = await fetch(`http://localhost:4000/users/${editingUser.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });
            if (!res.ok) throw new Error("Update failed");
            updateUserInData(editingUser.id, {
                ...formData,
                department_name: departments.find(d => d.id === Number(formData.department_id))?.name || null,
            });
            resetEditForm();
            alert("แก้ไขสำเร็จ");
        } catch (err) {
            alert("แก้ไขไม่สำเร็จ");
            console.error(err);
        }
    };

    // ── Create ── สร้างข้อมูลใหม่
    const handleCreateFormChange = (e) => {
        const { name, value } = e.target;
        updateNewUserData({ [name]: value });
    };

    const handleCreateUser = async () => { // ตรวจสอบข้อมูลที่จำเป็นก่อนส่งคำขอสร้างผู้ใช้ใหม่
        if (!newUserData.first_name || !newUserData.last_name || !newUserData.email) {
            alert("กรุณากรอก first_name, last_name, email");
            return;
        }
        try {
            const userData = {
                first_name: newUserData.first_name,
                last_name: newUserData.last_name,
                email: newUserData.email,
                phone: newUserData.phone || null,
                age: newUserData.age || null,
                gender: newUserData.gender || null,
                department_id: newUserData.department_id || null,
            };

            const res = await fetch("http://localhost:4000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            });
            if (!res.ok) throw new Error("Create user failed");
            const result = await res.json();
            const userId = result.data.insertId;

            if (isAddressOpen && (newUserData.house_no || newUserData.street || newUserData.district || newUserData.province)) {
                await fetch("http://localhost:4000/addresses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: userId,
                        house_no: newUserData.house_no || null,
                        street: newUserData.street || null,
                        district: newUserData.district || null,
                        province: newUserData.province || null,
                        postal_code: newUserData.postal_code || null,
                    }),
                });
            }

            addUserToData({
                ...userData,
                id: userId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                department_name: departments.find(d => d.id === Number(userData.department_id))?.name || null,
            });

            resetCreateForm();
            alert("เพิ่ม user สำเร็จ");
        } catch (err) {
            alert("เพิ่ม user ไม่สำเร็จ");
            console.error(err);
        }
    };

    return {
        // store state
        data, departments,
        currentPage, setCurrentPage,
        selectedUser, setSelectedUser,
        isOpen, setIsOpen,
        isEditOpen, setIsEditOpen,
        editingUser,
        formData,
        isCreateOpen, setIsCreateOpen,
        newUserData,
        isAddressOpen, setIsAddressOpen,
        // local state
        inputValue, genderFilter, setGenderFilter,
        departmentFilter, setDepartmentFilter,
        sortBy, setSortBy,
        // computed
        currentData, totalPages, itemsPerPage,
        // handlers
        handleSearchChange,
        handleDelete,
        handleEdit, handleFormChange, handleSaveEdit,
        handleCreateFormChange, handleCreateUser,
        resetCreateForm, resetEditForm,
        setIsEditOpen,
    };
};