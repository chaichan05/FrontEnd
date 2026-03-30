// ─── Helper: แสดงค่า null/undefined เป็น "–" ─────────────────────────────────────
export const Display = ({ value }) =>
    value !== null && value !== undefined && value !== "" ? (
        <span>{value}</span>
    ) : (
        <span className="text-slate-400">–</span>
    );


export const GenderBadge = ({ gender }) => {
    const styles =
        gender === "male"
            ? "bg-blue-700 text-white"
            : gender === "female"
            ? "bg-pink-400 text-white"
            : "bg-gray-400 text-white";
    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles}`}>
            {gender || "–"}
        </span>
    );
};

// ─── Helper: Address Block ───────────────────────────────────────────────
export const AddressBlock = ({ address }) => {
    if (!address) return <span className="text-slate-400">–</span>;
    const { house_no, street, district, province, postal_code } = address;
    const isEmpty = !house_no && !street && !district && !province && !postal_code;
    if (isEmpty) return <span className="text-slate-400">–</span>;

    return (
        <div className="bg-slate-50 rounded-lg p-3 border border-slate-200 text-sm space-y-1 w-full">
            {(house_no || street) && (
                <p className="text-slate-700">{[house_no, street].filter(Boolean).join(" ")}</p>
            )}
            {district    && <p className="text-slate-600">อำเภอ {district}</p>}
            {province    && <p className="text-slate-600">จังหวัด {province}</p>}
            {postal_code && <p className="text-slate-500">รหัสไปรษณีย์ {postal_code}</p>}
        </div>
    );
};

// ─── Loading Spinner ─────────────────────────────────────────────────────
export const LoadingState = ({ message = "กำลังโหลดข้อมูล..." }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <div className="w-10 h-10 border-4 border-[#6ebfd5] border-t-transparent rounded-full animate-spin mb-4" />
        <p>{message}</p>
    </div>
);

// ─── Empty State ─────────────────────────────────────────────────────────
export const EmptyState = ({ message }) => (
    <div className="flex flex-col items-center justify-center py-16 text-slate-400">
        <svg className="w-12 h-12 mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0H4" />
        </svg>
        <p>{message}</p>
    </div>
);

// ─── Error State ─────────────────────────────────────────────────────────
export const ErrorState = ({ message, onRetry }) => (
    <div className="flex flex-col items-center justify-center py-16 text-red-400">
        <svg className="w-12 h-12 mb-3 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
        </svg>
        <p className="mb-3">{message}</p>
        {onRetry && (
            <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm font-semibold"
            >
                ลองใหม่
            </button>
        )}
    </div>
);