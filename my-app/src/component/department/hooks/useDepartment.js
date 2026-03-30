import { useEffect, useState, useCallback } from "react";
import { departmentService } from "../../../../service/departmentService";
import { userService } from "../../../../service/userService";

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

export const useDepartment = () => {
    const [departments, setDepartments]           = useState([]);
    const [addresses, setAddresses]               = useState([]);
    const [selectedDept, setSelectedDept]         = useState(null);
    const [deptUsers, setDeptUsers]               = useState([]);
    const [deptUserCountMap, setDeptUserCountMap] = useState({});
    const [selectedUser, setSelectedUser]         = useState(null);
    const [isUserOpen, setIsUserOpen]             = useState(false);

    const [loadingDepts, setLoadingDepts] = useState(true);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [errorDepts, setErrorDepts]     = useState(null);
    const [errorUsers, setErrorUsers]     = useState(null);

    // ── Fetch users ใช้โหลดรายชื่อพนักงานในแผนกที่ถูกเลือก โดยรับ deptId เป็นพารามิเตอร์และอัปเดตสถานะการโหลดและข้อผิดพลาดตามผลลัพธ์ของการเรียก API
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

    // ── Fetch departments ใช้โหลดข้อมูลแผนกทั้งหมดและจำนวนพนักงานในแต่ละแผนก โดยจะเรียก fetchDeptUsers สำหรับแผนกที่ถูกเลือกตาม query parameter หรือแผนกแรกในรายการ และอัปเดตสถานะการโหลดและข้อผิดพลาดตามผลลัพธ์ของการเรียก API
    const fetchDepartments = useCallback(async () => {
        setLoadingDepts(true);
        setErrorDepts(null);
        try {
            const depts = await departmentService.getAll();
            setDepartments(depts);

            const countMap = await departmentService.getAllUserCounts(depts);
            setDeptUserCountMap(countMap);

            const queryId    = getQueryDeptId();
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

    // ── Fetch addresses ใช้โหลดข้อมูลที่อยู่ของพนักงานทั้งหมดเมื่อคอมโพเนนต์ถูก mount และจัดเก็บข้อมูลที่อยู่ใน state addresses โดยจะจับข้อผิดพลาดและตั้งค่า addresses เป็นอาร์เรย์ว่างหากการโหลดล้มเหลว
    useEffect(() => {
        userService.getAllAddresses().then(setAddresses).catch(() => setAddresses([]));
    }, []);

    useEffect(() => {
        fetchDepartments();
    }, [fetchDepartments]);

    // ── Handle popstate (back/forward browser) ใช้ตรวจจับการเปลี่ยนแปลงของ URL เมื่อผู้ใช้กดปุ่ม back หรือ forward ในเบราว์เซอร์ และอัปเดต selectedDept และโหลดรายชื่อพนักงานใหม่ตาม query parameter ที่เปลี่ยนแปลง
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

    // ── Click handlers ใช้จัดการเหตุการณ์เมื่อผู้ใช้คลิกที่แผนกหรือพนักงาน โดย handleDeptClick จะอัปเดต selectedDept และโหลดรายชื่อพนักงานใหม่ตามแผนกที่ถูกเลือก ส่วน handleUserClick จะอัปเดต selectedUser และเปิดโมดัลแสดงรายละเอียดของพนักงาน
    const handleDeptClick = (dept) => {
        setSelectedDept(dept);
        setQueryDeptId(dept.id);
        fetchDeptUsers(dept.id);
    };
    //ใช้จัดการเหตุการณ์เมื่อผู้ใช้คลิกที่แผนกหรือพนักงาน โดย handleDeptClick จะอัปเดต selectedDept และโหลดรายชื่อพนักงานใหม่ตามแผนกที่ถูกเลือก ส่วน handleUserClick จะอัปเดต selectedUser และเปิดโมดัลแสดงรายละเอียดของพนักงาน
    const handleUserClick = (user) => {
        setSelectedUser(user);
        setIsUserOpen(true);
    };

    return {
        departments, addresses,
        selectedDept,
        deptUsers, deptUserCountMap,
        selectedUser, setSelectedUser,
        isUserOpen, setIsUserOpen,
        loadingDepts, loadingUsers,
        errorDepts, errorUsers,
        fetchDepartments, fetchDeptUsers,
        handleDeptClick, handleUserClick,
    };
};