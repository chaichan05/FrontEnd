import { useUserStore } from "../../store/userStore";
import { useUsers } from "../users/hook/UserUsers";
import { useUserActions } from "../users/hook/UserUserActions";
import UserTable from "./UserTable";
import UserViewModal from "../users/UserViewModal";
import UserEditModal from "../users/UserEditModal";
import UserCreateModal from "../users/UserCreatedModal";

const UsersComponent = () => {
    // Load data on mount
    useUsers();

    // CRUD handlers
    const { handleDelete, handleSaveEdit, handleCreateUser } = useUserActions();

    // Edit trigger (sets store state then opens modal)
    const { setEditingUser, updateFormData, setIsEditOpen } = useUserStore();

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

    return (
        <>
            <UserTable onDelete={handleDelete} onEdit={handleEdit} />
            <UserViewModal />
            <UserEditModal onSave={handleSaveEdit} />
            <UserCreateModal onCreate={handleCreateUser} />
        </>
    );
};

export default UsersComponent;