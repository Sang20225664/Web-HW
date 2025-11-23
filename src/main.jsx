// ==========================================
// CRUD Application with API Integration
// ==========================================

// Component 1: SearchForm
function SearchForm({ onChangeValue }) {
    return (
        <input
            type="text"
            placeholder="Tìm theo name, username"
            onChange={(e) => onChangeValue(e.target.value)}
        />
    );
}

// Component 2: AddUser
function AddUser({ onAdd }) {
    const [show, setShow] = React.useState(false);
    const [saving, setSaving] = React.useState(false);
    const [form, setForm] = React.useState({
        name: "", username: "", email: "", city: ""
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAdd = async () => {
        const payload = {
            name: form.name,
            username: form.username,
            email: form.email,
            address: { city: form.city }
        };

        try {
            setSaving(true);
            const created = await window.userApi.createUser(payload);
            onAdd(created);
            setForm({ name: "", username: "", email: "", city: "" });
            setShow(false);
        } catch (err) {
            console.error(err);
            alert('Tạo thất bại');
        } finally {
            setSaving(false);
        }
    };

    return (
        <>
            <button onClick={() => setShow(true)}>Thêm người dùng</button>

            {show && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>Thêm user</h4>

                        <input placeholder="Name"
                            value={form.name}
                            onChange={e => handleChange("name", e.target.value)}
                        />
                        <input placeholder="Username"
                            value={form.username}
                            onChange={e => handleChange("username", e.target.value)}
                        />
                        <input placeholder="Email"
                            value={form.email}
                            onChange={e => handleChange("email", e.target.value)}
                        />
                        <input placeholder="City"
                            value={form.city}
                            onChange={e => handleChange("city", e.target.value)}
                        />

                        <button onClick={handleAdd} disabled={saving}>
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button onClick={() => setShow(false)} disabled={saving}>Hủy</button>
                    </div>
                </div>
            )}
        </>
    );
}

// Component 3: ResultTable
function ResultTable({ keyword, user }) {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [editing, setEditing] = React.useState(null);
    const [saving, setSaving] = React.useState(false);

    // Load data on mount
    React.useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const data = await window.userApi.getUsers();
                setUsers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    // Add new user to list
    React.useEffect(() => {
        if (user) {
            setUsers(prev => [...prev, user]);
        }
    }, [user]);

    // Filter users by keyword
    const q = (keyword || "").toLowerCase();
    const filteredUsers = users.filter(u =>
        (u.name || "").toLowerCase().includes(q) ||
        (u.username || "").toLowerCase().includes(q)
    );

    function editUser(user) {
        setEditing({
            ...user,
            address: { ...(user.address || {}), city: user.address?.city || "" }
        });
    }

    function handleEditChange(field, value) {
        if (field === "city") {
            setEditing(prev => ({
                ...prev,
                address: { ...prev.address, city: value }
            }));
        } else {
            setEditing(prev => ({
                ...prev,
                [field]: value
            }));
        }
    }

    async function saveUser() {
        try {
            setSaving(true);
            const updated = await window.userApi.updateUser(editing.id, editing);
            setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
            setEditing(null);
        } catch (err) {
            console.error(err);
            alert('Cập nhật thất bại');
        } finally {
            setSaving(false);
        }
    }

    async function removeUser(id) {
        const snapshot = [...users];
        setUsers(prev => prev.filter(u => u.id !== id)); // optimistic update

        try {
            const status = await window.userApi.deleteUser(id);
            if (!(status >= 200 && status < 300)) {
                throw new Error('Delete failed');
            }
        } catch (err) {
            console.error(err);
            setUsers(snapshot);
            alert('Xóa thất bại');
        }
    }

    if (loading) return <p>Đang tải dữ liệu...</p>;

    return (
        <div>
            <h3>Danh sách người dùng</h3>
            {editing && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h4>Sửa người dùng</h4>

                        <input
                            type="text"
                            value={editing.name}
                            onChange={(e) => handleEditChange("name", e.target.value)}
                            placeholder="Name"
                        />
                        <input
                            type="text"
                            value={editing.username}
                            onChange={(e) => handleEditChange("username", e.target.value)}
                            placeholder="Username"
                        />
                        <input
                            type="email"
                            value={editing.email}
                            onChange={(e) => handleEditChange("email", e.target.value)}
                            placeholder="Email"
                        />
                        <input
                            type="text"
                            value={editing.address.city}
                            onChange={(e) => handleEditChange("city", e.target.value)}
                            placeholder="City"
                        />

                        <button onClick={saveUser} disabled={saving}>
                            {saving ? 'Đang lưu...' : 'Lưu'}
                        </button>
                        <button onClick={() => setEditing(null)} disabled={saving}>Hủy</button>
                    </div>
                </div>
            )}

            <table border="1" cellPadding="5">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>City</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredUsers.map((u) => (
                        <tr key={u.id}>
                            <td>{u.id}</td>
                            <td>{u.name}</td>
                            <td>{u.username}</td>
                            <td>{u.email}</td>
                            <td>{u.address?.city || '-'}</td>
                            <td>
                                <button onClick={() => editUser(u)}>Sửa</button>
                                <button onClick={() => removeUser(u.id)}>Xóa</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

// Main App Component
function App() {
    const [kw, setKeyword] = React.useState("");
    const [newUser, setNewUser] = React.useState(null);

    const handleAddUser = (user) => {
        setNewUser(user);
    };

    return (
        <div>
            <h1>Quản lý người dùng</h1>
            <SearchForm onChangeValue={setKeyword} />
            <AddUser onAdd={handleAddUser} />
            <ResultTable keyword={kw} user={newUser} />
        </div>
    );
}

// Render App
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
