import { useDepartment } from "../department/hooks/useDepartment";
import DeptUserList from "../department/components/DeptUserList";
import { LoadingState, EmptyState, ErrorState } from "../department/components/DeptUIHelpers";

const DepartmentComponent = () => {
    const {
        departments, addresses,
        selectedDept,
        deptUsers, deptUserCountMap,
        selectedUser, setSelectedUser,
        isUserOpen, setIsUserOpen,
        loadingDepts, loadingUsers,
        errorDepts, errorUsers,
        fetchDepartments, fetchDeptUsers,
        handleDeptClick, handleUserClick,
    } = useDepartment();

    return (
        <div className="min-h-screen bg-slate-50 p-6">
            <h1 className="text-4xl font-bold text-slate-800 text-center mb-8">Departments</h1>

            {/* ── Departments Table ── */}
            <div className="max-w-6xl mx-auto mb-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {loadingDepts ? (
                        <LoadingState message="กำลังโหลดข้อมูลแผนก..." />
                    ) : errorDepts ? (
                        <ErrorState message={errorDepts} onRetry={fetchDepartments} />
                    ) : departments.length === 0 ? (
                        <EmptyState message="ไม่มีข้อมูลแผนก" />
                    ) : (
                        <table className="w-full text-sm text-left">
                            <thead className="bg-[#6ebfd5] text-white">
                                <tr>
                                    <th className="px-6 py-4 font-bold">ID</th>
                                    <th className="px-6 py-4 font-bold">Department Name</th>
                                    <th className="px-6 py-4 font-bold">Description</th>
                                    <th className="px-6 py-4 font-bold text-center">User Count</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((dept) => {
                                    const count = deptUserCountMap[dept.id] ?? "–";
                                    return (
                                        <tr
                                            key={dept.id}
                                            onClick={() => handleDeptClick(dept)}
                                            className={`border-b cursor-pointer transition-all duration-200 ${
                                                selectedDept?.id === dept.id
                                                    ? "bg-blue-50 border-l-4 border-[#6ebfd5]"
                                                    : "hover:bg-slate-50"
                                            }`}
                                        >
                                            <td className="px-6 py-4 font-semibold text-slate-800">{dept.id}</td>
                                            <td className="px-6 py-4 font-semibold text-slate-800">{dept.name}</td>
                                            <td className="px-6 py-4 text-slate-600">
                                                {dept.created_at
                                                    ? new Date(dept.created_at).toLocaleDateString("th-TH")
                                                    : <span className="text-slate-400">–</span>}
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="bg-[#6ebfd5] text-white px-4 py-2 rounded-full font-bold">
                                                    {count} คน
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
            {selectedDept && !loadingDepts && !errorDepts && (
                <div className="max-w-6xl mx-auto">
                    <DeptUserList
                        selectedDept={selectedDept}
                        deptUsers={deptUsers}
                        loadingUsers={loadingUsers}
                        errorUsers={errorUsers}
                        fetchDeptUsers={fetchDeptUsers}
                        addresses={addresses}
                        selectedUser={selectedUser}
                        isUserOpen={isUserOpen}
                        setIsUserOpen={setIsUserOpen}
                        handleUserClick={handleUserClick}
                    />
                </div>
            )}
        </div>
    );
};

export default DepartmentComponent;