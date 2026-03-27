const deptApi = "http://localhost:4000/departments";

window.departmentsMap = {};

// ================= โหลด Departments =================
async function loadDepartments() {
    try {
        const res = await fetch(deptApi);
        const result = await res.json();

        let departments = [];
        if (Array.isArray(result)) departments = result;
        else if (Array.isArray(result.data)) departments = result.data;
        else if (Array.isArray(result.data?.departments)) departments = result.data.departments;
        else if (Array.isArray(result.data?.data)) departments = result.data.data;
        else {
            for (const key of Object.keys(result)) {
                if (Array.isArray(result[key])) { departments = result[key]; break; }
            }
        }

        if (departments.length === 0) {
            console.error("❌ หา departments ไม่เจอ", result);
            return;
        }

        departments.sort((a, b) => a.id - b.id);

        window.departmentsMap = {};
        departments.forEach(d => {
            const id = d.id ?? d.dept_id ?? d.department_id;
            const name = d.name ?? d.dept_name ?? d.department_name;
            if (id !== undefined && name !== undefined) {
                window.departmentsMap[String(id)] = name;
            }
        });

        // populate filter dropdown (users page)
        const filterSelect = document.getElementById("filterDept");
        if (filterSelect) {
            filterSelect.innerHTML = `<option value="">ทั้งหมด</option>`;
            departments.forEach(d => {
                filterSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`;
            });
        }

        // populate form dropdown (users page)
        const formSelect = document.getElementById("formDeptId");
        if (formSelect) {
            formSelect.innerHTML = `<option value="">ไม่มีแผนก</option>`;
            departments.forEach(d => {
                formSelect.innerHTML += `<option value="${d.id}">${d.name}</option>`;
            });
        }

        // render cards (departments page)
        renderDepartmentCards(departments);

        // render table (departments page)
        renderDepartments(departments);

    } catch (err) {
        console.error("❌ โหลด departments ไม่สำเร็จ", err);
    }
}

// ================= Render Cards =================
function renderDepartmentCards(list) {
    const container = document.getElementById("deptCards");
    if (!container) return;

    if (!list || list.length === 0) {
        container.innerHTML = `<p style="color:var(--text-muted)">ไม่พบข้อมูล</p>`;
        return;
    }

    container.innerHTML = list.map(d => `
        <div class="dept-card" onclick="viewDeptUsers(${d.id}, '${d.name}')">
            <div class="dept-card-name">${d.name}</div>
            <span class="dept-card-badge">${d.user_count ?? 0} คน</span>
        </div>
    `).join("");
}

// ================= View Users in Department =================
async function viewDeptUsers(id, name) {
    try {
        const res = await fetch(`${deptApi}/${id}`);
        const result = await res.json();

        // รองรับหลาย structure
        let users = [];
        if (Array.isArray(result.data?.users)) users = result.data.users;
        else if (Array.isArray(result.data)) users = result.data;
        else if (Array.isArray(result.users)) users = result.users;

        const modal = document.getElementById("deptUsersModal");
        const title = document.getElementById("deptUsersTitle");
        const body = document.getElementById("deptUsersBody");

        if (!modal || !title || !body) return;

        title.textContent = `แผนก: ${name}`;

        if (users.length === 0) {
            body.innerHTML = `<p>ไม่มีผู้ใช้ในแผนกนี้</p>`;
        } else {
            let html = `<table border="1" cellpadding="6" cellspacing="0" style="width:100%">
                <thead>
                    <tr><th>ID</th><th>ชื่อ-นามสกุล</th><th>Email</th><th>เพศ</th></tr>
                </thead>
                <tbody>`;
            users.forEach(u => {
                html += `
                <tr style="cursor:pointer" onclick="goToUser(${u.id})">
                    <td>${u.id}</td>
                    <td style="color:#3b82f6; text-decoration:underline">${u.first_name ?? "-"} ${u.last_name ?? ""}</td>
                    <td>${u.email ?? "-"}</td>
                    <td>${u.gender ?? "-"}</td>
                </tr>`;
            });
            html += `</tbody></table>`;
            body.innerHTML = html;
        }

        modal.style.display = "flex";

    } catch (err) {
        console.error(err);
        alert("โหลดข้อมูลไม่สำเร็จ");
    }
}

// ================= Navigate to User =================
function goToUser(id) {
    window.location.href = `users.html?user_id=${id}`;
}

function closeDeptModal() {
    document.getElementById("deptUsersModal").style.display = "none";
}

// ================= Format Date =================
function formatDateDept(dateStr) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleString("th-TH", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit"
    });
}

// ================= Render Table =================
function renderDepartments(list) {
    const table = document.getElementById("deptTable");
    if (!table) return;

    if (!Array.isArray(list) || list.length === 0) {
        table.innerHTML = `<tr><td colspan="5" style="text-align:center">ไม่พบข้อมูล</td></tr>`;
        return;
    }

    table.innerHTML = list.map(d => `
        <tr>
            <td>${d.id ?? "-"}</td>
            <td>${d.name ?? "-"}</td>
            <td><span class="badge badge-blue">${d.user_count ?? 0} คน</span></td>
            <td>${formatDateDept(d.created_at ?? d.createdAt ?? null)}</td>
            <td>
                <button class="btn btn-warning" onclick="openEditDept(${d.id}, '${d.name}')">แก้ไข</button>
                <button class="btn btn-danger"  onclick="deleteDept(${d.id}, '${d.name}')">ลบ</button>
            </td>
        </tr>
    `).join("");
}

// ================= Delete =================
async function deleteDept(id, name) {
    if (!confirm(`ลบแผนก [${name}] ใช่หรือไม่?`)) return;
    try {
        await fetch(`${deptApi}/${id}`, { method: "DELETE" });
        alert("ลบสำเร็จ");
        loadDepartments();
    } catch (err) {
        console.error(err);
        alert("ลบไม่สำเร็จ");
    }
}

// ================= Edit =================
async function openEditDept(id, currentName) {
    const name = prompt("ชื่อแผนกใหม่:", currentName);
    if (!name) return;
    try {
        await fetch(`${deptApi}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name })
        });
        alert("แก้ไขสำเร็จ");
        loadDepartments();
    } catch (err) {
        console.error(err);
        alert("แก้ไขไม่สำเร็จ");
    }
}