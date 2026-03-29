import { useUserStore } from "../../../store/userStore";
import { deleteUser, updateUser, createUser, createAddress } from "../api/UsersApi";

export const useUserActions = () => {
    const {
        data, setData,
        departments,
        formData,
        editingUser,
        newUserData,
        isAddressOpen,
        addUserToData, updateUserInData, removeUserFromData,
        resetCreateForm, resetEditForm,
    } = useUserStore();

    const handleDelete = async (id) => {
        if (!window.confirm("คุณต้องการลบ user นี้ใช่ไหม?")) return;
        const oldData = data;
        removeUserFromData(id);
        try {
            const res = await deleteUser(id);
            if (!res.ok) throw new Error("Delete failed");
            alert("ลบสำเร็จ");
        } catch (err) {
            setData(oldData);
            alert("ลบไม่สำเร็จ");
            console.error(err);
        }
    };

    const handleSaveEdit = async () => {
        if (!editingUser) return;
        try {
            const res = await updateUser(editingUser.id, formData);
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

    const handleCreateUser = async () => {
        if (!newUserData.first_name || !newUserData.last_name || !newUserData.email) {
            alert("กรุณากรอก first_name, last_name, email");
            return;
        }
        try {
            const userData = {
                first_name:    newUserData.first_name,
                last_name:     newUserData.last_name,
                email:         newUserData.email,
                phone:         newUserData.phone         || null,
                age:           newUserData.age           || null,
                gender:        newUserData.gender        || null,
                department_id: newUserData.department_id || null,
            };

            const result = await createUser(userData);
            const userId = result.data.insertId;

            const hasAddress = isAddressOpen &&
                (newUserData.house_no || newUserData.street ||
                 newUserData.district || newUserData.province);

            if (hasAddress) {
                await createAddress({
                    user_id:     userId,
                    house_no:    newUserData.house_no    || null,
                    street:      newUserData.street      || null,
                    district:    newUserData.district    || null,
                    province:    newUserData.province    || null,
                    postal_code: newUserData.postal_code || null,
                });
            }

            addUserToData({
                ...userData,
                id:            userId,
                created_at:    new Date().toISOString(),
                updated_at:    new Date().toISOString(),
                department_name: departments.find(d => d.id === Number(userData.department_id))?.name || null,
            });

            resetCreateForm();
            alert("เพิ่ม user สำเร็จ");
        } catch (err) {
            alert("เพิ่ม user ไม่สำเร็จ");
            console.error(err);
        }
    };

    return { handleDelete, handleSaveEdit, handleCreateUser };
};