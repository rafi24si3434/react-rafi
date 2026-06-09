import axios from "axios";

const API_URL =
  "https://vfnnqisrkhbmhyjnikkb.supabase.co/rest/v1/note";

const API_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZmbm5xaXNya2hibWh5am5pa2tiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5NDQ3OTUsImV4cCI6MjA5NjUyMDc5NX0.f3egW-BXm0apRBbCXH7gB6PkUi_EYT3D_s5rG-8vHxE";

const headers = {
  apikey: API_KEY,
  Authorization: `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  Prefer: "return=representation",
};

export const notesAPI = {
  async fetchNotes() {
    const response = await axios.get(API_URL, {
      headers,
    });

    return response.data;
  },

  async createNote(data) {
    const response = await axios.post(
      API_URL,
      data,
      { headers }
    );

    return response.data;
  },

  async deleteNote(id) {
    const response = await axios.delete(
      `${API_URL}?id=eq.${id}`,
      {
        headers,
      }
    );

    return response.data;
  },
};