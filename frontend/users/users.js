const userApi = "http://localhost:4000/users";

let currentPage = 1;
let debounceTimer = null;

const state = {
    search: "",
    gender: "",
    department_id: "",
    sort: "u.id"
};

// ================= โหลด Users =================
async function loadUsers() {
    try {
        const params = new URLSearchParams();
        params.set("page", currentPage);
        params.set("limit", 20);
        params.set("sort", "u.id");      //  เรียงตาม id
        params.set("order", "asc");      // จากน้อยไปมาก

        if (state.search) params.set("search", state.search);
        if (state.gender) params.set("gender", state.gender);
        if (state.department_id) params.set("department_id", state.department_id);
        if (state.sort) params.set("sort", state.sort); // override ถ้า user เลือก sort เอง

        const res = await fetch(`${userApi}?${params.toString()}`);
        const result = await res.json();

        const users = result?.data?.users || [];
        const pagination = result?.data?.pagination || {};

        // sort ฝั่ง client อีกชั้น
        users.sort((a, b) => a.id - b.id);

        renderUsers(users);
        renderPagination(pagination);

    } catch (error) {
        console.error(error);
        alert("โหลดข้อมูลไม่สำเร็จ");
    }
}
// ================= Format Date =================
function formatDate(dateStr) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("th-TH", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

// ================= Render Users =================
function renderUsers(list) {
    const table = document.getElementById("usersTable");
    if (!table) return;

    if (!Array.isArray(list) || list.length === 0) {
        table.innerHTML = `<tr><td colspan="9" style="text-align:center">ไม่พบข้อมูล</td></tr>`;
        return;
    }

    // 🔥 log ดู field จริงๆ ของ user แรก
    console.log("user sample:", list[0]);
    console.log("user keys:", Object.keys(list[0]));
    console.log("departmentsMap:", window.departmentsMap);

    let html = "";
    list.forEach(u => {
        const deptId = u.department_id ?? u.dept_id ?? u.departmentId ?? u.department?.id;
        const deptName = deptId
            ? (window.departmentsMap?.[String(deptId)] || `id:${deptId}`)
            : null;
        const deptBadge = deptName
            ? `<span class="badge badge-blue">${deptName}</span>`
            : `<span class="badge badge-gray">ไม่มีแผนก</span>`;

        const addr = u.address;
        const addrText = addr
            ? (addr.province || "มีที่อยู่")
            : `<span class="text-gray">ไม่มีที่อยู่</span>`;

        html += `
        <tr>
            <td>${u.id ?? "-"}</td>
            <td>${u.first_name ?? "-"} ${u.last_name ?? ""}</td>
            <td>${u.age ?? "-"}</td>
            <td>${u.gender ?? "-"}</td>
            <td>${u.email ?? "-"}</td>
            <td>${u.phone ?? "-"}</td>
            <td>${deptBadge}</td>
            <td>${addrText}</td>
            <td>
                <button class="btn btn-sm btn-info"    onclick="viewUser(${u.id})">ดู</button>
                <button class="btn btn-sm btn-warning" onclick="openEditUser(${u.id})">แก้ไข</button>
                <button class="btn btn-sm btn-danger"  onclick="deleteUser(${u.id}, '${u.first_name} ${u.last_name}')">ลบ</button>
            </td>
        </tr>`;
    });

    table.innerHTML = html;
}

// ================= Pagination =================
function renderPagination(pagination) {
    const container = document.getElementById("pagination");
    if (!container) return;

    const { currentPage: cp = 1, totalPages = 1 } = pagination;
    let html = "";

    html += `<button onclick="goPage(${cp - 1})" ${cp <= 1 ? "disabled" : ""}>« ก่อนหน้า</button>`;
    for (let i = 1; i <= totalPages; i++) {
        html += `<button onclick="goPage(${i})" class="${i === cp ? 'active' : ''}">${i}</button>`;
    }
    html += `<button onclick="goPage(${cp + 1})" ${cp >= totalPages ? "disabled" : ""}>ถัดไป »</button>`;

    container.innerHTML = html;
}

function goPage(page) {
    currentPage = page;
    loadUsers();
}

// ================= View Detail =================
async function viewUser(id) {
    try {
        const res = await fetch(`${userApi}/${id}`);
        const result = await res.json();
        const u = result?.data?.user ?? result?.data ?? result;

        const addr = u.address;
        const addrHtml = addr ? `
            <p><b>บ้านเลขที่:</b> ${addr.house_no ?? "-"}</p>
            <p><b>ถนน:</b> ${addr.street ?? "-"}</p>
            <p><b>แขวง/ตำบล:</b> ${addr.district ?? "-"}</p>
            <p><b>จังหวัด:</b> ${addr.province ?? "-"}</p>
            <p><b>รหัสไปรษณีย์:</b> ${addr.postal_code ?? "-"}</p>
        ` : "<p>ไม่มีที่อยู่</p>";

        const deptId = u.department_id ?? u.dept_id;
        const deptName = deptId ? (window.departmentsMap?.[String(deptId)] || "-") : "ไม่มีแผนก";

        document.getElementById("modalTitle").textContent = `${u.first_name} ${u.last_name}`;
        document.getElementById("modalBody").innerHTML = `
            <p><b>ID:</b> ${u.id}</p>
            <p><b>ชื่อ-นามสกุล:</b> ${u.first_name} ${u.last_name}</p>
            <p><b>อายุ:</b> ${u.age ?? "-"}</p>
            <p><b>เพศ:</b> ${u.gender ?? "-"}</p>
            <p><b>Email:</b> ${u.email ?? "-"}</p>
            <p><b>Phone:</b> ${u.phone ?? "-"}</p>
            <p><b>แผนก:</b> ${deptName}</p>
            <hr>
            <b>ที่อยู่:</b>${addrHtml}
            <p><b>สร้างเมื่อ:</b> ${formatDate(u.created_at)}</p>
            <p><b>อัปเดตเมื่อ:</b> ${formatDate(u.updated_at)}</p>
        `;
        openModal("viewModal");

    } catch (err) {
        console.error(err);
        alert("โหลดข้อมูลไม่สำเร็จ");
    }
}

// ================= Modal =================
function openModal(id) { document.getElementById(id).style.display = "flex"; }
function closeModal(id) { document.getElementById(id).style.display = "none"; }

// ================= Create / Edit =================
let editingUserId = null;

function openCreateUser() {
    editingUserId = null;
    document.getElementById("formTitle").textContent = "เพิ่มผู้ใช้";
    document.getElementById("fFirstName").value = "";
    document.getElementById("fLastName").value = "";
    document.getElementById("fAge").value = "";
    document.getElementById("fGender").value = "";
    document.getElementById("fEmail").value = "";
    document.getElementById("fPhone").value = "";
    document.getElementById("formDeptId").value = "";
    document.getElementById("addrSection").style.display = "none";
    clearAddrFields();
    openModal("formModal");
}

async function openEditUser(id) {
    try {
        const res = await fetch(`${userApi}/${id}`);
        const result = await res.json();
        const u = result?.data?.user ?? result?.data ?? result;

        editingUserId = id;
        document.getElementById("formTitle").textContent = "แก้ไขผู้ใช้";
        document.getElementById("fFirstName").value = u.first_name ?? "";
        document.getElementById("fLastName").value = u.last_name ?? "";
        document.getElementById("fAge").value = u.age ?? "";
        document.getElementById("fGender").value = u.gender ?? "";
        document.getElementById("fEmail").value = u.email ?? "";
        document.getElementById("fPhone").value = u.phone ?? "";
        document.getElementById("formDeptId").value = u.department_id ?? u.dept_id ?? "";

        const addr = u.address;
        if (addr) {
            document.getElementById("addrSection").style.display = "block";
            document.getElementById("fHouseNo").value = addr.house_no ?? "";
            document.getElementById("fStreet").value = addr.street ?? "";
            document.getElementById("fDistrict").value = addr.district ?? "";
            document.getElementById("fProvince").value = addr.province ?? "";
            document.getElementById("fPostal").value = addr.postal_code ?? "";
        } else {
            document.getElementById("addrSection").style.display = "none";
            clearAddrFields();
        }

        openModal("formModal");

    } catch (err) {
        console.error(err);
        alert("โหลดข้อมูลไม่สำเร็จ");
    }
}

function clearAddrFields() {
    ["fHouseNo", "fStreet", "fDistrict", "fProvince", "fPostal"].forEach(id => {
        document.getElementById(id).value = "";
    });
}

function toggleAddr() {
    const sec = document.getElementById("addrSection");
    sec.style.display = sec.style.display === "none" ? "block" : "none";
}

async function submitUserForm() {
    const first_name = document.getElementById("fFirstName").value.trim();
    const last_name = document.getElementById("fLastName").value.trim();
    const age = document.getElementById("fAge").value;
    const gender = document.getElementById("fGender").value;
    const email = document.getElementById("fEmail").value.trim();
    const phone = document.getElementById("fPhone").value.trim();
    const department_id = document.getElementById("formDeptId").value || null;

    if (!first_name || !last_name || !email) {
        alert("กรุณากรอก ชื่อ, นามสกุล และ Email");
        return;
    }

    const addrVisible = document.getElementById("addrSection").style.display !== "none";
    let address = null;
    if (addrVisible) {
        const house_no = document.getElementById("fHouseNo").value.trim();
        const street = document.getElementById("fStreet").value.trim();
        const district = document.getElementById("fDistrict").value.trim();
        const province = document.getElementById("fProvince").value.trim();
        const postal_code = document.getElementById("fPostal").value.trim();
        if (house_no || street || district || province || postal_code) {
            address = { house_no, street, district, province, postal_code };
        }
    }

    const body = {
        first_name,
        last_name,
        age: age ? Number(age) : undefined,
        gender,
        email,
        phone: phone || undefined,
        department_id: department_id ? Number(department_id) : null,
        address
    };

    try {
        const method = editingUserId ? "PUT" : "POST";
        const url = editingUserId ? `${userApi}/${editingUserId}` : userApi;

        await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });

        alert(editingUserId ? "อัปเดตสำเร็จ" : "เพิ่มผู้ใช้สำเร็จ");
        closeModal("formModal");
        loadUsers();

    } catch (err) {
        console.error(err);
        alert("บันทึกไม่สำเร็จ");
    }
}

// ================= Delete =================
async function deleteUser(id, name) {
    if (!confirm(`ต้องการลบ [${name}] ใช่หรือไม่?`)) return;
    try {
        await fetch(`${userApi}/${id}`, { method: "DELETE" });
        alert("ลบสำเร็จ");
        loadUsers();
    } catch (error) {
        console.error(error);
        alert("ลบไม่สำเร็จ");
    }
}

// ================= Filter / Search / Sort =================
function onSearch(val) {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        state.search = val.trim();
        currentPage = 1;
        loadUsers();
    }, 300);
}


function resetFilters() {
    state.search = "";
    state.gender = "";
    state.department_id = "";
    state.sort = "";
    currentPage = 1;

    document.getElementById("searchInput").value = "";
    document.querySelectorAll(".toolBar select").forEach(s => s.value = "");

    loadUsers();
}
function onGenderChange(val) { state.gender = val; currentPage = 1; loadUsers(); }
function onDeptChange(val) { state.department_id = val; currentPage = 1; loadUsers(); }
function onSortChange(val) { state.sort = val; currentPage = 1; loadUsers(); }