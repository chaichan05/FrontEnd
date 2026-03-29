import { useUserStore } from "../../store/userStore";
import UserFormFields from "../users/UserFromfields";

const ADDRESS_FIELDS = [
    { label: "House No",    name: "house_no" },
    { label: "Street",      name: "street" },
    { label: "District",    name: "district" },
    { label: "Province",    name: "province" },
    { label: "Postal Code", name: "postal_code" },
];

const UserCreateModal = ({ onCreate }) => {
    const {
        isCreateOpen, setIsCreateOpen,
        newUserData, updateNewUserData,
        isAddressOpen, setIsAddressOpen,
        departments,
        resetCreateForm,
    } = useUserStore();

    if (!isCreateOpen) return null;

    const handleChange = e => {
        const { name, value } = e.target;
        updateNewUserData({ [name]: value });
    };

    const handleClose = () => {
        setIsCreateOpen(false);
        setIsAddressOpen(false);
        resetCreateForm();
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/20 z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">เพิ่มข้อมูล User</h2>

                <UserFormFields
                    data={newUserData}
                    departments={departments}
                    onChange={handleChange}
                    requiredMark
                />

                {/* Address toggle */}
                <div className="border-t pt-4 mt-4">
                    <button
                        type="button"
                        onClick={() => setIsAddressOpen(!isAddressOpen)}
                        className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 duration-200 font-semibold"
                    >
                        {isAddressOpen ? "ซ่อน Address" : "เพิ่ม Address (optional)"}
                    </button>
                </div>

                {/* Address fields */}
                {isAddressOpen && (
                    <div className="space-y-3 border border-gray-200 p-4 rounded bg-gray-50 mt-4">
                        <label className="block text-sm font-semibold text-slate-700">Address Information</label>
                        {ADDRESS_FIELDS.map(({ label, name }) => (
                            <div key={name}>
                                <label className="block text-sm font-semibold text-slate-600 mb-1">{label}</label>
                                <input
                                    type="text"
                                    name={name}
                                    value={newUserData[name] || ""}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onCreate}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 duration-200 font-semibold"
                    >Create</button>
                    <button
                        onClick={handleClose}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 duration-200 font-semibold"
                    >Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default UserCreateModal;