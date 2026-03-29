import { useUserStore } from "../../store/userStore";

const Row = ({ label, value }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-100">
        <strong className="text-slate-600">{label}:</strong>
        <span>{value || <span className="text-slate-400">–</span>}</span>
    </div>
);

const GenderBadge = ({ gender }) => {
    const cls =
        gender === "male"   ? "bg-blue-700 text-white" :
        gender === "female" ? "bg-pink-400 text-white" :
                              "bg-gray-400 text-white";
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${cls}`}>
            {gender || "–"}
        </span>
    );
};

const AddressBlock = ({ address }) => {
    const hasData = address && (
        address.house_no || address.street ||
        address.district || address.province || address.postal_code
    );

    if (!hasData) return <span className="text-slate-400">–</span>;

    return (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-sm space-y-1 mt-1">
            {(address.house_no || address.street) && (
                <p className="text-slate-700">
                    {[address.house_no, address.street].filter(Boolean).join(" ")}
                </p>
            )}
            {address.district   && <p className="text-slate-600">อำเภอ {address.district}</p>}
            {address.province   && <p className="text-slate-600">จังหวัด {address.province}</p>}
            {address.postal_code && <p className="text-slate-500">รหัสไปรษณีย์ {address.postal_code}</p>}
        </div>
    );
};

const ViewModal = () => {
    const { isOpen, setIsOpen, selectedUser } = useUserStore();

    if (!isOpen || !selectedUser) return null;

    const u = selectedUser;

    return (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/20 z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">รายละเอียด Users</h2>

                <div className="space-y-3 text-sm">
                    <Row label="Name"       value={`${u.first_name ?? ""} ${u.last_name ?? ""}`.trim()} />
                    <Row label="Email"      value={u.email} />
                    <Row label="Phone"      value={u.phone} />
                    <Row label="Age"        value={u.age} />
                    <Row label="Department" value={u.department_name} />

                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                        <strong className="text-slate-600">Gender:</strong>
                        <GenderBadge gender={u.gender} />
                    </div>

                    <div className="py-2 border-b border-gray-100">
                        <strong className="text-slate-600 block mb-1">Address:</strong>
                        <AddressBlock address={u.address} />
                    </div>

                    <Row label="Created At" value={u.created_at ? new Date(u.created_at).toLocaleDateString("th-TH") : null} />
                    <Row label="Updated At" value={u.updated_at ? new Date(u.updated_at).toLocaleDateString("th-TH") : null} />
                </div>

                <button
                    onClick={() => setIsOpen(false)}
                    className="mt-6 w-full px-4 py-2 bg-slate-500 text-white rounded hover:bg-slate-600 duration-200 font-semibold"
                >Close</button>
            </div>
        </div>
    );
};

export default ViewModal;