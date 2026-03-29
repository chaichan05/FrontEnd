const FIELDS = [
    { label: "First Name", name: "first_name", type: "text" },
    { label: "Last Name",  name: "last_name",  type: "text" },
    { label: "Email",      name: "email",      type: "email" },
    { label: "Phone",      name: "phone",      type: "text" },
    { label: "Age",        name: "age",        type: "number" },
];

const GENDER_OPTIONS = [
    { value: "",            label: "Select Gender" },
    { value: "male",        label: "Male" },
    { value: "female",      label: "Female" },
    { value: "unspecified", label: "Unspecified" },
];

const UserFormFields = ({ data, departments, onChange, requiredMark = false }) => (
    <div className="space-y-4">
        {FIELDS.map(({ label, name, type }) => (
            <div key={name}>
                <label className="block text-sm font-semibold text-slate-600 mb-1">
                    {label}{requiredMark && ["first_name","last_name","email"].includes(name) ? " *" : ""}
                </label>
                <input
                    type={type}
                    name={name}
                    value={data[name] || ""}
                    onChange={onChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        ))}

        <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Gender</label>
            <select
                name="gender"
                value={data.gender || ""}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                {GENDER_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                ))}
            </select>
        </div>

        <div>
            <label className="block text-sm font-semibold text-slate-600 mb-1">Department</label>
            <select
                name="department_id"
                value={data.department_id || ""}
                onChange={onChange}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
                <option value="">Select Department</option>
                {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                ))}
            </select>
        </div>
    </div>
);

export default UserFormFields;