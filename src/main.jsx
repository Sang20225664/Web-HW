// ==========================================
// BƯỚC 1: THIẾT LẬP CẤU TRÚC REACT CƠ BẢN
// ==========================================
// - Tạo component gốc App và render vào thẻ <div id="root">
// - Dùng React, ReactDOM, Babel qua CDN (đã thêm trong index.html)

// ==========================================
// BƯỚC 2: TỔ CHỨC COMPONENT VÀ STATE TẬP TRUNG
// ==========================================
// Ứng dụng gồm 4 component: App, SearchForm, AddUser, ResultTable
// Dữ liệu và hàm setState được quản lý tại App (component cha)
// Các component con chỉ nhận props và gọi callback để báo ngược lên
// ==========================================
// BƯỚC 3: CHỨC NĂNG TÌM KIẾM (SEARCHFORM)
// ==========================================
// Mục tiêu: truyền dữ liệu tìm kiếm từ component con → cha → ResultTable
// - SearchForm nhận props onChangeValue (hàm setKeyword từ App)
// - Khi người dùng gõ vào input, gọi callback để cập nhật kw trong App
// - ResultTable nhận keyword qua props (chưa lọc dữ liệu ở bước này, chỉ hiển thị)

// Input -> SearchForm -> gọi onChangeValue -> App cập nhật kw -> truyền xuống ResultTable

// ---- Component 1: SearchForm ----
// Nhận hàm onChangeValue (tức là setKeyword từ App)
// Khi người dùng nhập từ khóa, kích hoạt callback để cập nhật kw trong App
function SearchForm({ onChangeValue }) {
    return (
        <input
            type="text"
            placeholder="Tìm theo name, username"
            onChange={(e) => onChangeValue(e.target.value)}
        />
    );
}
// ---- Component 2: AddUser ----
// BƯỚC 5: Form thêm người dùng
// - Controlled input
// - Tạo newUser object rồi gửi lên App bằng onAdd()

function AddUser({ onAdd }) {
    const [show, setShow] = React.useState(false);
    const [form, setForm] = React.useState({
        name: "", username: "", email: "", city: ""
    });

    const handleChange = (field, value) => {
        setForm(prev => ({ ...prev, [field]: value }));
    };

    const handleAdd = () => {
        onAdd({
            id: Date.now(),
            name: form.name,
            username: form.username,
            email: form.email,
            address: { city: form.city }
        });

        setForm({ name: "", username: "", email: "", city: "" });
        setShow(false);
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

                        <button onClick={handleAdd}>Lưu</button>
                        <button onClick={() => setShow(false)}>Hủy</button>
                    </div>
                </div>
            )}
        </>
    );
}


// ---- Component 3: ResultTable ----
// BƯỚC 4: Hiển thị danh sách người dùng
// - Fetch dữ liệu API 1 lần bằng useEffect
// - Lưu vào state users
// - Lọc theo keyword từ props
// - Render bảng bằng map()

function ResultTable({ keyword, user, onAdded }) {
    const [users, setUsers] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const [editing, setEditing] = React.useState(null);


    // 1. Tải dữ liệu 1 lần khi mount
    React.useEffect(() => {
        fetch("https://jsonplaceholder.typicode.com/users")
            .then(res => res.json())
            .then(data => {
                setUsers(data);
                setLoading(false);
            });
    }, []);
    // Khi có user mới từ App → thêm vào danh sách
    React.useEffect(() => {
        if (user) {
            setUsers(prev => [...prev, user]);
        }
    }, [user]);

    // 2. Lọc danh sách theo keyword
    const filteredUsers = users.filter(
        (u) =>
            u.name.toLowerCase().includes(keyword.toLowerCase()) ||
            u.username.toLowerCase().includes(keyword.toLowerCase())
    );
    function editUser(user) {
        setEditing({ ...user, address: { ...user.address } });
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
    function saveUser() {
        setUsers(prev => prev.map(u => u.id === editing.id ? editing : u));
        setEditing(null);
    }
    function removeUser(id) {
        setUsers(prev => prev.filter(u => u.id !== id));
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

                        <button onClick={saveUser}>Lưu</button>
                        <button onClick={() => setEditing(null)}>Hủy</button>
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
                            <td>{u.address.city}</td>
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

// ---- Component gốc: App ----
// Quản lý toàn bộ state và truyền props xuống các component con
function App() {
    const [kw, setKeyword] = React.useState("");
    // lưu user mới thêm
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
// ---- Render toàn bộ ứng dụng ----
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
