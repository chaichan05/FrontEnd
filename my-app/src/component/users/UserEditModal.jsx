import { useUserStore } from "../../store/userStore";
import UserFormFields from "../users/UserFromfields";

const UserEditModal = ({ onSave }) => {
    const {
        isEditOpen, setIsEditOpen,
        editingUser,
        formData, updateFormData,
        departments,
    } = useUserStore();

    if (!isEditOpen || !editingUser) return null;

    const handleChange = e => {
        const { name, value } = e.target;
        updateFormData({ [name]: value });
    };

    return (
        <div className="fixed inset-0 flex justify-center items-center backdrop-blur-sm bg-black/20 z-50">
            <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 border-b pb-3">แก้ไข User</h2>

                <UserFormFields
                    data={formData}
                    departments={departments}
                    onChange={handleChange}
                />

                <div className="flex gap-3 mt-6">
                    <button
                        onClick={onSave}
                        className="flex-1 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 duration-200 font-semibold"
                    >Save</button>
                    <button
                        onClick={() => setIsEditOpen(false)}
                        className="flex-1 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 duration-200 font-semibold"
                    >Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default UserEditModal;