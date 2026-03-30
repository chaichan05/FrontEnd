const UserTable = ({ currentData, data, itemsPerPage, currentPage, setCurrentPage, setSelectedUser, setIsOpen, handleEdit, handleDelete }) => {
    const totalPages = Math.ceil(data.length / itemsPerPage);

    return (
        <>
            {/* ── Table ── */}
            <div className="overflow-x-auto bg-white shadow-lg rounded-xl">
                <table className="min-w-full text-sm text-left">
                    <thead className="bg-[#6ebfd5] text-white">
                        <tr>
                            {["ID", "First Name", "Last Name", "Age", "Gender", "Email", "Phone", "Department", "Actions"]
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
                                        u.gender === "male"   ? "bg-blue-700 text-white" :
                                        u.gender === "female" ? "bg-pink-400 text-white" :
                                        "bg-gray-400 text-white"}`}>
                                        {u.gender || "–"}
                                    </span>
                                </td>
                                <td className="px-4 py-2">{u.email}</td>
                                <td className="px-4 py-2">{u.phone || "ไม่มีข้อมูล"}</td>
                                <td className="px-4 py-2">{u.department?.name || "ไม่มีข้อมูล"}</td>
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

            {/* ── Pagination ── */}
            <div className="flex justify-center items-center gap-2 mt-6">
                <button
                    onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Previous
                </button>
                <div className="flex gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button key={page} onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 rounded ${currentPage === page ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}>
                            {page}
                        </button>
                    ))}
                </div>
                <button
                    onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed">
                    Next
                </button>
            </div>
        </>
    );
};

export default UserTable;