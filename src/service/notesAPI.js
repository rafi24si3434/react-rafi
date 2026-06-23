import { supabase } from "../lib/supabase";

export const notesAPI = {
  async fetchNotes() {
    const { data, error } = await supabase
      .from("notes")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data;
  },

  async createNote(data) {
    const { data: newNote, error } = await supabase
      .from("notes")
      .insert([
        {
          title: data.title,
          content: data.content,
          status: data.status,
        },
      ])
      .select()
      .single();

    if (error) throw error;
    return newNote;
  },

  async deleteNote(id) {
    const { error } = await supabase
      .from("notes")
      .delete()
      .eq("id", id);

    if (error) throw error;
    return true;
  },
};