import { useEffect, useState } from "react";
import { notesAPI } from "../service/notesAPI";

import AlertBox from "../components/AlertBox";
import EmptyState from "../components/EmptyState";
import LoadingSpinner from "../components/LoadingSpinner";
import GenericTable from "../components/GenericTable";

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [dataForm, setDataForm] = useState({
    title: "",
    content: "",
    status: "Active",
  });

  const loadNotes = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await notesAPI.fetchNotes();

      setNotes(data || []);
    } catch (err) {
      console.error(err);
      setError("Gagal memuat data catatan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setDataForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await notesAPI.createNote(dataForm);

      setSuccess("Catatan berhasil ditambahkan");

      setDataForm({
        title: "",
        content: "",
        status: "Active",
      });

      await loadNotes();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal menambahkan catatan"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Yakin ingin menghapus catatan ini?"
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      await notesAPI.deleteNote(id);

      setSuccess("Catatan berhasil dihapus");

      await loadNotes();

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      console.error(err);

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Gagal menghapus catatan"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">

      {(error || success) && (
        <div>
          {error && (
            <AlertBox type="error">
              {error}
            </AlertBox>
          )}

          {success && (
            <AlertBox type="success">
              {success}
            </AlertBox>
          )}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100">

        <div className="px-6 py-5 border-b">
          <h2 className="text-xl font-bold text-gray-800">
            Tambah Catatan Baru
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Kelola data catatan melalui REST API Supabase
          </p>
        </div>

        <div className="p-6">
          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            <input
              type="text"
              name="title"
              placeholder="Masukkan judul catatan"
              value={dataForm.title}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />

            <textarea
              rows="5"
              name="content"
              placeholder="Masukkan isi catatan"
              value={dataForm.content}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 resize-none outline-none focus:ring-2 focus:ring-emerald-500"
              required
            />

            <select
              name="status"
              value={dataForm.status}
              onChange={handleChange}
              disabled={loading}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Active">
                Active
              </option>

              <option value="Draft">
                Draft
              </option>

              <option value="Archived">
                Archived
              </option>
            </select>

            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-medium px-6 py-3 rounded-xl transition"
            >
              {loading
                ? "Mohon Tunggu..."
                : "Tambah Catatan"}
            </button>
          </form>
        </div>

      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">

        <div className="px-6 py-5 border-b flex justify-between items-center">
          <div>
            <h3 className="text-lg font-bold text-gray-800">
              Daftar Catatan
            </h3>

            <p className="text-sm text-gray-500">
              Total {notes.length} catatan
            </p>
          </div>
        </div>

        {loading && (
          <div className="p-10">
            <LoadingSpinner text="Memuat catatan..." />
          </div>
        )}

        {!loading &&
          notes.length === 0 &&
          !error && (
            <EmptyState text="Belum ada catatan. Tambahkan catatan pertama." />
          )}

        {!loading &&
          notes.length > 0 && (
            <GenericTable
              columns={[
                "No",
                "Judul",
                "Isi Catatan",
                "Status",
                "Aksi",
              ]}
              data={notes}
              renderRow={(note, index) => (
                <>
                  <td className="px-6 py-4">
                    {index + 1}
                  </td>

                  <td className="px-6 py-4 font-semibold text-emerald-600">
                    {note.title}
                  </td>

                  <td className="px-6 py-4 max-w-sm">
                    <div className="truncate text-gray-600">
                      {note.content}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span className="bg-emerald-100 text-emerald-700 text-xs px-3 py-1 rounded-full">
                      {note.status}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <button
                      onClick={() =>
                        handleDelete(note.id)
                      }
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm"
                    >
                      Hapus
                    </button>
                  </td>
                </>
              )}
            />
          )}

      </div>

    </div>
  );
}