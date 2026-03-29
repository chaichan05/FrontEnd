import { useEffect } from "react";
import { useUserStore } from "../../store/userStore";

const UsersComponent = () => {
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

    const filteredData = data.filter(u =>
        (u.first_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.last_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLast = currentPage * itemsPerPage;
    const indexOfFirst = indexOfLast - itemsPerPage;
    const currentData = filteredData.slice(indexOfFirst, indexOfLast);

const handleDelete = async (user) => {
    const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim();

    if (!window.confirm(`คุณต้องการลบ ${fullName || "user นี้"} ใช่ไหม?`)) return;

    const oldData = data;
    removeUserFromData(user.id);

    try {
        const res = await fetch(`http://localhost:4000/users/${user.id}`, {
            method: "DELETE"
        });

        if (!res.ok) throw new Error("Delete failed");

        alert(`ลบ ${fullName} สำเร็จ`);
    } catch (err) {
        setData(oldData);
        alert(`ลบ ${fullName} ไม่สำเร็จ`);
        console.error(err);
    }
};

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

    const handleCreateFormChange = (e) => {
        const { name, value } = e.target;
        updateNewUserData({ [name]: value });
    };

    const handleCreateUser = async () => {
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
                const addressData = {
                    user_id: userId,
                    house_no: newUserData.house_no || null,
                    street: newUserData.street || null,
                    district: newUserData.district || null,
                    province: newUserData.province || null,
                    postal_code: newUserData.postal_code || null,
                };
                await fetch("http://localhost:4000/addresses", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(addressData),
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

    useEffect(() => {
        const fetchData = async () => {
            const [userRes, deptRes, addRes] = await Promise.all([
                fetch("http://localhost:4000/users?limit=100"),
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

            const usersWithDept = userJson.data.users.map(u => ({
                ...u,
                department_name: depts.find(d => d.id === Number(u.department_id))?.name || null, // ✅ Number() fix
                address: addressMap[u.id] || null,
            }));

            setData(usersWithDept.sort((a, b) => a.id - b.id));
            setDepartments(depts);
        };
        fetchData();
    }, [setData, setDepartments]);

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <h1 className="text-3xl font-bold text-slate-700 text-center mb-6">Users</h1>

            <div className="flex gap-4 mb-6">
                <input
                    type="text"
                    placeholder="ค้นหา ชื่อ/นามสกุล/อีเมล..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button onClick={() => setIsCreateOpen(true)}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 duration-200 font-semibold">
                    + เพิ่มข้อมูล
                </button>
            </div>

            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-[#6ebfd5] text-white">
                        <tr>
                            {["ID","First Name","Last Name","Age","Gender","Email","Phone","Department","Created","Updated","Actions"]
                                .map(h => <th key={h} className="px-4 py-3 text-center">{h}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {currentData.map(u => (
                            <tr key={u.id} className="border-b bg-white hover:bg-slate-50 duration-200 text-slate-700">
                                <td className="px-4 py-2">{u.id}</td>
                                <td className="px-4 py-2">{u.first_name}</td>
                                <td className="px-4 py-2">{u.last_name}</td>
                                <td className="px-4 py-2">{u.age}</td>
                                <td className="px-4 py-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                        u.gender === "male" ? "bg-blue-700 text-white" :
                                        u.gender === "female" ? "bg-pink-400 text-white" :
                                        "bg-gray-400 text-white"}`}>
                                        {u.gender || "–"}
                                    </span>
                                </td>
                                <td className="px-4 py-2">{u.email}</td>
                                <td className="px-4 py-2">{u.phone || "ไม่มีข้อมูล"}</td>
                                <td className="px-4 py-2">{u.department?.name || "ไม่มีข้อมูล"}</td> {/* ✅ แก้แล้ว */}
                                <td className="px-4 py-2">{new Date(u.created_at).toLocaleDateString("th-TH")}</td>
                                <td className="px-4 py-2">{new Date(u.updated_at).toLocaleDateString("th-TH")}</td>
                                <td className="px-4 py-2 space-x-2">
                                    <button className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 duration-200"
                                        onClick={() => { setSelectedUser(u); setIsOpen(true); }}>View</button>
                                    <button className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 duration-200"
                                        onClick={() => handleEdit(u)}>Edit</button>
                                    <button className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 duration-200"
                                        onClick={() => handleDelete(u)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center items-center gap-2 mt-6">
                <button onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Previous
                </button>
                <div className="flex gap-1">
                    {Array.from({ length: Math.ceil(filteredData.length / itemsPerPage) }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded ${currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                            {page}
                        </button>
                    ))}
                </div>
                <button onClick={() => setCurrentPage(p => Math.min(p + 1, Math.ceil(filteredData.length / itemsPerPage)))}
                    disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Next
                </button>
            </div>

            {/* ── View Modal ── */}
            {isOpen && selectedUser && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/20 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">รายละเอียด Users</h2>
                        <div className="space-y-3 text-sm">
                            {[
                                { label: "Name", value: `${selectedUser.first_name ?? ""} ${selectedUser.last_name ?? ""}`.trim() },
                                { label: "Email", value: selectedUser.email },
                                { label: "Phone", value: selectedUser.phone },
                                { label: "Age", value: selectedUser.age },
                                { label: "Department", value: selectedUser.department?.name },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <strong className="text-slate-600">{label}:</strong>
                                    <span>{value || <span className="text-slate-400">–</span>}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <strong className="text-slate-600">Gender:</strong>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    selectedUser.gender === "male" ? "bg-blue-700 text-white" :
                                    selectedUser.gender === "female" ? "bg-pink-400 text-white" :
                                    "bg-gray-400 text-white"}`}>
                                    {selectedUser.gender || "–"}
                                </span>
                            </div>
                            <div className="py-2 border-b border-gray-100">
                                <strong className="text-slate-600 block mb-1">Address:</strong>
                                {selectedUser.address &&
                                 (selectedUser.address.house_no || selectedUser.address.street ||
                                  selectedUser.address.district || selectedUser.address.province ||
                                  selectedUser.address.postal_code) ? (
                                    <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-sm space-y-1 mt-1">
                                        {(selectedUser.address.house_no || selectedUser.address.street) && (
                                            <p className="text-slate-700">
                                                {[selectedUser.address.house_no, selectedUser.address.street].filter(Boolean).join(" ")}
                                            </p>
                                        )}
                                        {selectedUser.address.district && <p className="text-slate-600">อำเภอ {selectedUser.address.district}</p>}
                                        {selectedUser.address.province && <p className="text-slate-600">จังหวัด {selectedUser.address.province}</p>}
                                        {selectedUser.address.postal_code && <p className="text-slate-500">รหัสไปรษณีย์ {selectedUser.address.postal_code}</p>}
                                    </div>
                                ) : (
                                    <span className="text-slate-400">–</span>
                                )}
                            </div>
                            {[
                                { label: "Created At", value: selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString("th-TH") : null },
                                { label: "Updated At", value: selectedUser.updated_at ? new Date(selectedUser.updated_at).toLocaleDateString("th-TH") : null },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <strong className="text-slate-600">{label}:</strong>
                                    <span>{value || <span className="text-slate-400">–</span>}</span>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setIsOpen(false)}
                            className="mt-6 w-full px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 duration-200 font-semibold">
                            Close
                        </button>
                    </div>
                </div>
            )}

            {/* ── Edit Modal ── */}
            {isEditOpen && editingUser && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/20 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">แก้ไข User</h2>
                        <div className="space-y-4">
                            {[
                                { label: "First Name", name: "first_name", type: "text" },
                                { label: "Last Name", name: "last_name", type: "text" },
                                { label: "Email", name: "email", type: "email" },
                                { label: "Phone", name: "phone", type: "text" },
                                { label: "Age", name: "age", type: "number" },
                            ].map(({ label, name, type }) => (
                                <div key={name}>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">{label}</label>
                                    <input type={type} name={name} value={formData[name] || ""}
                                        onChange={handleFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Gender</label>
                                <select name="gender" value={formData.gender || ""} onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="unspecified">Unspecified</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Department</label>
                                <select name="department_id" value={formData.department_id || ""} onChange={handleFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleSaveEdit}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 duration-200 font-semibold">Save</button>
                            <button onClick={() => setIsEditOpen(false)}
                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 duration-200 font-semibold">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Create Modal ── */}
            {isCreateOpen && (
                <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/20 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">เพิ่มข้อมูล User</h2>
                        <div className="space-y-4">
                            {[
                                { label: "First Name *", name: "first_name", type: "text" },
                                { label: "Last Name *", name: "last_name", type: "text" },
                                { label: "Email *", name: "email", type: "email" },
                                { label: "Phone", name: "phone", type: "text" },
                                { label: "Age", name: "age", type: "number" },
                            ].map(({ label, name, type }) => (
                                <div key={name}>
                                    <label className="block text-sm font-semibold text-slate-600 mb-1">{label}</label>
                                    <input type={type} name={name} value={newUserData[name] || ""}
                                        onChange={handleCreateFormChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Gender</label>
                                <select name="gender" value={newUserData.gender || ""} onChange={handleCreateFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="unspecified">Unspecified</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">Department</label>
                                <select name="department_id" value={newUserData.department_id || ""} onChange={handleCreateFormChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="">Select Department</option>
                                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                </select>
                            </div>
                            <div className="border-t pt-4">
                                <button type="button" onClick={() => setIsAddressOpen(!isAddressOpen)}
                                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 duration-200 font-semibold">
                                    {isAddressOpen ? "ซ่อน Address" : "เพิ่ม Address (optional)"}
                                </button>
                            </div>
                            {isAddressOpen && (
                                <div className="space-y-3 border border-gray-200 p-4 rounded bg-gray-50">
                                    <label className="block text-sm font-semibold text-slate-700">Address Information</label>
                                    {[
                                        { label: "House No", name: "house_no" },
                                        { label: "Street", name: "street" },
                                        { label: "District", name: "district" },
                                        { label: "Province", name: "province" },
                                        { label: "Postal Code", name: "postal_code" },
                                    ].map(({ label, name }) => (
                                        <div key={name}>
                                            <label className="block text-sm font-semibold text-slate-600 mb-1">{label}</label>
                                            <input type="text" name={name} value={newUserData[name] || ""}
                                                onChange={handleCreateFormChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="flex gap-3 mt-6">
                            <button onClick={handleCreateUser}
                                className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 duration-200 font-semibold">Create</button>
                            <button onClick={() => { setIsCreateOpen(false); setIsAddressOpen(false); resetCreateForm(); }}
                                className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 duration-200 font-semibold">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UsersComponent;