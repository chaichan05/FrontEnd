import { useEffect } from "react";
import { useUserStore } from "../../../store/userStore";
import { fetchUsers, fetchDepartments, fetchAddresses } from "../api/UsersApi";

export const useUsers = () => {
    const { setData, setDepartments } = useUserStore();

    useEffect(() => {
        const loadData = async () => {
            const [userRes, deptRes, addRes] = await Promise.all([
                fetchUsers(),
                fetchDepartments(),
                fetchAddresses(),
            ]);

            const depts     = deptRes.data;
            const addresses = addRes.data;

            const addressMap = {};
            addresses.forEach(a => { addressMap[a.user_id] = a; });

            const users = userRes.data.users.map(u => ({
                ...u,
                department_name: depts.find(d => d.id === Number(u.department_id))?.name || null,
                address: addressMap[u.id] || null,
            }));

            setData(users.sort((a, b) => a.id - b.id));
            setDepartments(depts);
        };

        loadData();
    }, [setData, setDepartments]);
};