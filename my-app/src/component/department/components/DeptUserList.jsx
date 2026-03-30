import { Display, GenderBadge, AddressBlock, LoadingState, EmptyState, ErrorState } from "../components/DeptUIHelpers";

// ─── User Card ───────────────────────────────────────────────────────────
const UserCard = ({ user, onClick }) => (
    <div
        onClick={() => onClick(user)}
        className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#6ebfd5] hover:bg-blue-50 cursor-pointer transition-all duration-200 flex justify-between items-center"
    >
        <div>
            <p className="font-semibold text-slate-800">{user.first_name} {user.last_name}</p>
            <p className="text-sm text-slate-600"><Display value={user.email} /></p>
            <p className="text-sm text-slate-500 mt-1"><Display value={user.phone} /></p>
        </div>
        <GenderBadge gender={user.gender} />
    </div>
);

// ─── User Detail Modal ───────────────────────────────────────────────────
const UserDetailModal = ({ user, address, onClose }) => (
    <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/20 z-50">
        <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">รายละเอียด Users</h2>
            <div className="space-y-3 text-sm">
                {[
                    { label: "ชื่อ",     value: `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() },
                    { label: "อีเมล",    value: user.email },
                    { label: "เบอร์โทร", value: user.phone },
                    { label: "อายุ",     value: user.age },
                ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between items-center py-2 border-b border-gray-100">
                        <strong className="text-slate-600">{label}:</strong>
                        <Display value={value} />
                    </div>
                ))}
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <strong className="text-slate-600">เพศ:</strong>
                    <GenderBadge gender={user.gender} />
                </div>
                <div className="py-2">
                    <strong className="text-slate-600 block mb-2">ที่อยู่:</strong>
                    <AddressBlock address={address} />
                </div>
            </div>
            <button
                onClick={onClose}
                className="w-full mt-6 px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 duration-200 font-semibold"
            >
                ปิด
            </button>
        </div>
    </div>
);

// ─── DeptUserList ────────────────────────────────────────────────────────
const DeptUserList = ({
    selectedDept,
    deptUsers,
    loadingUsers,
    errorUsers,
    fetchDeptUsers,
    addresses,
    selectedUser,
    isUserOpen,
    setIsUserOpen,
    handleUserClick,
}) => {
    const userAddress = selectedUser
        ? addresses.find((a) => a.user_id === selectedUser.id)
        : null;

    return (
        <>
            {/* ── Department Detail Card ── */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-6 border-l-4 border-[#6ebfd5]">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">แผนก {selectedDept.name}</h2>
                <div className="flex items-center gap-3">
                    <span className="text-slate-700 font-semibold">จำนวนพนักงานทั้งหมด:</span>
                    <span className="bg-[#6ebfd5] text-white px-6 py-3 rounded-full font-bold text-2xl">
                        {loadingUsers ? "..." : deptUsers.length} คน
                    </span>
                </div>
            </div>

            {/* ── User List ── */}
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
                            <UserCard key={user.id} user={user} onClick={handleUserClick} />
                        ))}
                    </div>
                )}
            </div>

            {/* ── User Detail Modal ── */}
            {isUserOpen && selectedUser && (
                <UserDetailModal
                    user={selectedUser}
                    address={userAddress}
                    onClose={() => setIsUserOpen(false)}
                />
            )}
        </>
    );
};

export default DeptUserList;