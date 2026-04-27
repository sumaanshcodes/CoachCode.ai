import toast from "react-hot-toast";
import { useState, useEffect } from "react";
import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";

export default function Materials() {
  const { user } = useAuth();

  const [materials, setMaterials] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [uploadSubjectId, setUploadSubjectId] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    api.get("/subjects")
      .then((r) => r.data.success && setSubjects(r.data.data))
      .catch(console.error);
  }, []);

  const fetchMaterials = () => {
    setLoading(true);
    const params = {};
    if (subjectId) params.subjectId = subjectId;
    if (search) params.search = search;
    api.get("/materials", { params })
      .then((r) => r.data.success && setMaterials(r.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMaterials();
  }, [subjectId, search]);

  const handleBookmark = async (id) => {
    try {
      await api.post("/bookmarks", { itemType: "material", itemId: id });
      toast.success("Bookmarked!");
    } catch {
      toast.error("Already bookmarked!");
    }
  };

  const handleUpload = async () => {
    try {
      if (!title || !uploadSubjectId || !file) {
        alert("Title, Subject and File are required.");
        return;
      }
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("subjectId", uploadSubjectId);
      formData.append("file", file);
      const res = await api.post("/materials", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      console.log("UPLOAD RESPONSE:", res.data);
      alert("Uploaded successfully ✅");
      setOpen(false);
      setTitle("");
      setDescription("");
      setUploadSubjectId("");
      setFile(null);
      fetchMaterials();
    } catch (err) {
      console.error("UPLOAD ERROR:", err.response?.data || err.message);
      alert(err.response?.data?.message || "Upload failed ❌");
    }
  };

  return (
    <div className="container">
      <h1>Materials</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Subject-wise notes, previous year questions, and assignments.
      </p>

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: 6 }}
        >
          <option value="">All subjects</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: 6 }}
        />
      </div>

      {(user?.role === "faculty" || user?.role === "admin") && (
        <button
          onClick={() => setOpen(!open)}
          style={{
            padding: "0.6rem 1rem",
            borderRadius: 6,
            background: "var(--primary)",
            color: "#fff",
            border: "none",
            cursor: "pointer",
            marginBottom: "1rem"
          }}
        >
          {open ? "Cancel Upload" : "+ Upload Material"}
        </button>
      )}

      {open && (
        <div className="card" style={{ marginBottom: "1rem" }}>
          <h3>Upload Material</h3>
          <input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ display: "block", marginBottom: "0.5rem", width: "100%" }}
          />
          <select
            value={uploadSubjectId}
            onChange={(e) => setUploadSubjectId(e.target.value)}
            style={{ marginBottom: "0.5rem", width: "100%" }}
          >
            <option value="">Select Subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input
            type="file"
            accept=".pdf,.ppt,.pptx"
            onChange={(e) => setFile(e.target.files[0])}
            style={{ marginBottom: "0.5rem" }}
          />
          <button onClick={handleUpload}>Submit</button>
        </div>
      )}

      {loading ? (
        <p>Loading...</p>
      ) : materials.length === 0 ? (
        <div className="card">No materials found.</div>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {materials.map((m) => (
            <li key={m.id} className="card" style={{ marginBottom: "0.5rem" }}>
              <strong>{m.title}</strong>
              {m.Subject && (
                <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                  ({m.Subject.name})
                </span>
              )}
              <p style={{ margin: "0.25rem 0 0", fontSize: "0.9rem" }}>
                {m.description}
              </p>
              <div style={{ display: "flex", alignItems: "center", marginTop: "0.5rem", gap: "0.5rem" }}>
                {m.fileUrl && (
                  <a
                    href={`http://localhost:5000${m.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Open file
                  </a>
                )}
                <button
                  onClick={() => handleBookmark(m.id)}
                  style={{
                    padding: "0.3rem 0.8rem",
                    borderRadius: 6,
                    background: "var(--warning)",
                    color: "#fff",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem"
                  }}
                >
                  🔖 Bookmark
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}