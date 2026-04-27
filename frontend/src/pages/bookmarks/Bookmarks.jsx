import { useState, useEffect } from "react";
import api from "../../api/axios";
import toast from "react-hot-toast";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  const fetchBookmarks = () => {
    api.get("/bookmarks")
      .then(({ data }) => data.success && setBookmarks(data.data))
      .catch(() => toast.error("Failed to load bookmarks"))
      .finally(() => setLoading(false));
  };

  const removeBookmark = async (id) => {
    try {
      await api.delete(`/bookmarks/${id}`);
      setBookmarks((prev) => prev.filter((b) => b.id !== id));
      toast.success("Bookmark removed!");
    } catch {
      toast.error("Failed to remove bookmark");
    }
  };

  if (loading) return <div className="container"><p>Loading...</p></div>;

  return (
    <div className="container">
      <h1>Bookmarks</h1>
      <p style={{ color: "var(--text-muted)" }}>Your saved questions and materials.</p>

      {bookmarks.length === 0 ? (
        <div className="card">No bookmarks yet. Bookmark questions or materials from Practice/Materials sections.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {bookmarks.map((b) => (
            <li key={b.id} className="card" style={{ marginBottom: "0.75rem", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{
                  background: b.itemType === "question" ? "var(--primary)" : "var(--success)",
                  color: "#fff",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  marginRight: "0.5rem"
                }}>
                  {b.itemType}
                </span>
                <span>{b.item?.title || b.item?.name || `ID: ${b.itemId}`}</span>
              </div>
              <button
                onClick={() => removeBookmark(b.id)}
                style={{
                  padding: "0.3rem 0.8rem",
                  borderRadius: 6,
                  background: "var(--danger)",
                  color: "#fff",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                🗑️ Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}