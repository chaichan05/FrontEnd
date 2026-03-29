import { useEffect, useState, useCallback } from "react";
import { departmentService } from "../../../service/departmentService";
import { userService } from "../../../service/userService";
// ─── Helper: แสดงค่า null/undefined เป็น "–" ───────────────────────────────
const Display = ({ value }) =>
    value !== null && value !== undefined && value !== "" ? (
        <span>{value}</span>
    ) : (
        <span className="text-slate-400">–</span>
    );

// ─── Helper: Badge เพศ ──────────────────────────────────────────────────────
const GenderBadge = ({ gender }) => {
    const styles =
        gender === "male"
            ? "bg-blue-700 text-white"
            : gender === "female"
            ? "bg-pink-400 text-white"
            : "bg-gray-400 text-white";
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>
            {gender || "–"}
        </span>
    );
};

// ─── Helper: Address Block ──────────────────────────────────────────────────
const AddressBlock = ({ address }) => {
    if (!address) return <span className="text-slate-400">–</span>;
    const { house_no, street, district, province, postal_code } = address;
    const isEmpty = !house_no && !street && !district && !province && !postal_code;
    if (isEmpty) return <span className="text-slate-400">–</span>;

    return (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-sm space-y-1 w-full">
            {(house_no || street) && (
                <p className="text-slate-700">{[house_no, street].filter(Boolean).join(" ")}</p>
            )}
            {district && <p className="text-slate-600">อำเภอ {district}</p>}
            {province && <p className="text-slate-600">จังหวัด {province}</p>}
            {postal_code && <p className="text-slate-500">รหัสไปรษณีย์ {postal_code}</p>}
        </div>
    );
};

// ─── Loading Spinner ────────────────────────────────────────────────────────
const LoadingState = ({ message = "กำลังโหลดข้อมูล..." }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="w-10 h-10 border-4 border-[#6ebfd5] border-t-transparent rounded-full animate-spin mb-4" />
        <p>{message}</p>
    </div>
);

// ─── Empty State ────────────────────────────────────────────────────────────
const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
        </svg>
        <p>{message}</p>
    </div>
);

// ─── Error State ────────────────────────────────────────────────────────────
const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-16 text-red-400">
        <svg className="w-12 h-12 mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="mb-3">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
            >
                ลองใหม่
            </button>
        )}
    </div>
);

// ─── Main Component ─────────────────────────────────────────────────────────
const DepartmentComponent = () => {
    const [departments, setDepartments] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [selectedDept, setSelectedDept] = useState(null);
    const [deptUsers, setDeptUsers] = useState([]);
    const [deptUserCountMap, setDeptUserCountMap] = useState({});
    const [selectedUser, setSelectedUser] = useState(null);
    const [isUserOpen, setIsUserOpen] = useState(false);

    // Loading states
    const [loadingDepts, setLoadingDepts] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);

    // Error states
    const [errorDepts, setErrorDepts] = useState(null);
    const [errorUsers, setErrorUsers] = useState(null);

    // ── Sync query params ──────────────────────────────────────────────────
    const getQueryDeptId = () => {
        const params = new URLSearchParams(window.location.search);
        return params.get("dept") ? Number(params.get("dept")) : null;
    };

    const setQueryDeptId = (id) => {
        const params = new URLSearchParams(window.location.search);
        if (id) params.set("dept", id);
        else params.delete("dept");
        window.history.replaceState(null, "", `?${params.toString()}`);
    };

    // ── Fetch users ของแผนก ────────────────────────────────────────────────
    const fetchDeptUsers = useCallback(async (deptId) => {
        setLoadingUsers(true);
        setErrorUsers(null);
        try {
            const data = await departmentService.getById(deptId);
            setDeptUsers(data.users || []);
        } catch (err) {
            setErrorUsers(err.message || "โหลดรายชื่อพนักงานล้มเหลว");
            setDeptUsers([]);
        } finally {
            setLoadingUsers(false);
        }
    }, []);

    // ── Fetch departments ──────────────────────────────────────────────────
    const fetchDepartments = useCallback(async () => {
        setLoadingDepts(true);
        setErrorDepts(null);
        try {
            const depts = await departmentService.getAll();
            setDepartments(depts);

            const countMap = await departmentService.getAllUserCounts(depts);
            setDeptUserCountMap(countMap);

            const queryId = getQueryDeptId();
            const defaultDept = depts.find((d) => d.id === queryId) || depts[0];
            if (defaultDept) {
                setSelectedDept(defaultDept);
                setQueryDeptId(defaultDept.id);
                fetchDeptUsers(defaultDept.id);
            }
        } catch (err) {
            setErrorDepts(err.message || "โหลดข้อมูลแผนกล้มเหลว");
        } finally {
            setLoadingDepts(false);
        }
    }, [fetchDeptUsers]);

    // ── Fetch addresses ────────────────────────────────────────────────────
    useEffect(() => {
        userService.getAllAddresses().then(setAddresses).catch(() => setAddresses([]));
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // ── Handle popstate (back/forward browser) ─────────────────────────────
    useEffect(() => {
        const handlePop = () => {
            const id = getQueryDeptId();
            if (id && departments.length > 0) {
                const dept = departments.find((d) => d.id === id);
                if (dept) {
                    setSelectedDept(dept);
                    fetchDeptUsers(dept.id);
                }
            }
        };
        window.addEventListener("popstate", handlePop);
        return () => window.removeEventListener("popstate", handlePop);
    }, [departments, fetchDeptUsers]);

    // ── Click handlers ─────────────────────────────────────────────────────
    const handleDeptClick = (dept) => {
        setSelectedDept(dept);
        setQueryDeptId(dept.id);
        fetchDeptUsers(dept.id);
    };

    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsUserOpen(true);
    };

    // ── Render ─────────────────────────────────────────────────────────────
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
                                    const deptUserCount = deptUserCountMap[dept.id] ?? "–";
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
                                                    {deptUserCount} คน
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

            {/* ── Department Details ── */}
            {selectedDept && !loadingDepts && !errorDepts && (
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border-l-4 border-[#6ebfd5]">
                        <h2 className="text-3xl font-bold text-slate-800 mb-4">
                            แผนก {selectedDept.name}
                        </h2>
                        <div className="flex items-center gap-3">
                            <span className="text-slate-700 font-semibold">จำนวนพนักงานทั้งหมด:</span>
                            <span className="bg-[#6ebfd5] text-white px-6 py-3 rounded-full font-bold text-2xl">
                                {loadingUsers ? "..." : deptUsers.length} คน
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-8">
                        <h3 className="text-2xl font-bold text-slate-800 mb-6 border-b pb-3">
                            รายชื่อพนักงาน แผนก {selectedDept.name}
                        </h3>

                        {loadingUsers ? (
                            <LoadingState message="กำลังโหลดรายชื่อพนักงาน..." />
                        ) : errorUsers ? (
                            <ErrorState message={errorUsers} onRetry={() => fetchDeptUsers(selectedDept.id)} />
                        ) : deptUsers.length === 0 ? (
                            <EmptyState message={`ไม่มีพนักงานในแผนก ${selectedDept.name}`} />
                        ) : (
                            <div className="space-y-3">
                                {deptUsers.map((user) => (
                                    <div
                                        key={user.id}
                                        onClick={() => handleUserClick(user)}
                                        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#6ebfd5] hover:bg-blue-50 cursor-pointer transition-all duration-200 flex justify-between items-center"
                                    >
                                        <div>
                                            <p className="font-semibold text-slate-800">
                                                {user.first_name} {user.last_name}
                                            </p>
                                            <p className="text-sm text-slate-600"><Display value={user.email} /></p>
                                            <p className="text-sm text-slate-500 mt-1"><Display value={user.phone} /></p>
                                        </div>
                                        <GenderBadge gender={user.gender} />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── User Details Modal ── */}
            {isUserOpen && selectedUser && (() => {
                const userAddress = addresses.find((a) => a.user_id === selectedUser.id);
                return (
                    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/20 z-50">
                        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                            <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">
                                รายละเอียด Users
                            </h2>
                            <div className="space-y-3 text-sm">
                                {[
                                    { label: "ชื่อ", value: `${selectedUser.first_name ?? ""} ${selectedUser.last_name ?? ""}`.trim() },
                                    { label: "อีเมล", value: selectedUser.email },
                                    { label: "เบอร์โทร", value: selectedUser.phone },
                                    { label: "อายุ", value: selectedUser.age },
                                ].map(({ label, value }) => (
                                    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                                        <strong className="text-slate-600">{label}:</strong>
                                        <Display value={value} />
                                    </div>
                                ))}

                                {/* Gender Badge */}
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <strong className="text-slate-600">เพศ:</strong>
                                    <GenderBadge gender={selectedUser.gender} />
                                </div>

                                {/* Address Block */}
                                <div className="py-2">
                                    <strong className="text-slate-600 block mb-2">ที่อยู่:</strong>
                                    <AddressBlock address={userAddress} />
                                </div>
                            </div>

                            <button
                                onClick={() => setIsUserOpen(false)}
                                className="w-full mt-6 px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 duration-200 font-semibold"
                            >
                                ปิด
                            </button>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
};

export default DepartmentComponent;