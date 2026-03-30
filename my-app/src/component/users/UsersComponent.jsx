import { useUsers } from "../../component/users/hook/UserUsers";
import UserTable from "../users/UserTable";

const UsersComponent = () => {
    const {
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
        inputValue, genderFilter, setGenderFilter,
        departmentFilter, setDepartmentFilter,
        sortBy, setSortBy,
        currentData, totalPages, itemsPerPage,
        handleSearchChange,
        handleDelete,
        handleEdit, handleFormChange, handleSaveEdit,
        handleCreateFormChange, handleCreateUser,
        resetCreateForm, resetEditForm,
    } = useUsers();

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <h1 className="text-3xl font-bold text-slate-700 text-center mb-6">Users</h1>

            {/* แบบฟอร์มค้นหาและกรอง */}
            <div className="flex flex-wrap gap-3 mb-6">

                {/* Search */}
                <input
                    type="text"
                    placeholder="ค้นหา ชื่อ/นามสกุล/อีเมล..."
                    value={inputValue}
                    onChange={handleSearchChange}
                    className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                {/* Filter: Gender */}
                <select
                    value={genderFilter}
                    onChange={e => { setGenderFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">ทั้งหมด (เพศ)</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="unspecified">Unspecified</option>
                </select>

                {/* Filter: Department */}
                <select
                    value={departmentFilter}
                    onChange={e => { setDepartmentFilter(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="">ทั้งหมด (แผนก)</option>
                    {departments.map(d => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                    ))}
                </select>

                {/* Sort เรียง */}
                <select
                    value={sortBy}
                    onChange={e => { setSortBy(e.target.value); setCurrentPage(1); }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="u.id">ID</option>
                    <option value="u.first_name">First Name</option>
                    <option value="u.last_name">Last Name</option>
                    <option value="u.age">Age</option>
                    <option value="u.created_at">Created At</option>
                    <option value="d.name">Department</option>
                </select>

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 duration-200 font-semibold"
                >
                    + เพิ่มข้อมูล
                </button>
            </div>

            {/* ── Table + Pagination ── ใช้ Navigation ดึงข้อมูล */}
            <UserTable
                currentData={currentData}
                data={data}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                setSelectedUser={setSelectedUser}
                setIsOpen={setIsOpen}
                handleEdit={handleEdit}
                handleDelete={handleDelete}
            />

            {/* ── View Modal ── ดูข้อมูลรายละเอียด */}
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
                                { label: "Department", value: selectedUser.department?.name || "ไม่มีข้อมูล" },
                            ].map(({ label, value }) => (
                                <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <strong className="text-slate-600">{label}:</strong>
                                    <span>{value || <span className="text-slate-400">–</span>}</span>
                                </div>
                            ))}
                            <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                <strong className="text-slate-600">Gender:</strong>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${selectedUser.gender === "male" ? "bg-blue-700 text-white" :
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
                                    <span className="text-slate-400">ไม่มีข้อมูล</span>
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

            {/* ── Edit Modal ── แก้ไขข้อมูล */}
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

            {/* ── Create Modal ── สร้างข้อมูลใหม่ */}
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