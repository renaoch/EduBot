import { supabase } from '../db/supabase';

export interface ResourceData {
  title: string;
  type: string;
  url?: string;
  content?: string;
  subjectName: string;
  topicName: string;
  tags?: string[];
}

export class ResourceService {
  static async getOrCreateSubject(name: string) {
    const cleanName = name.trim().toLowerCase();
    
    // Check if exists
    const { data: existing } = await supabase
      .from('subjects')
      .select('id')
      .ilike('name', cleanName)
      .single();

    if (existing) return existing.id;

    // Create new
    const { data: created, error } = await supabase
      .from('subjects')
      .insert({ name: cleanName })
      .select('id')
      .single();

    if (error) throw error;
    return created.id;
  }

  static async getOrCreateTopic(name: string, subjectId: string) {
    const cleanName = name.trim().toLowerCase();

    const { data: existing } = await supabase
      .from('topics')
      .select('id')
      .match({ subject_id: subjectId })
      .ilike('name', cleanName)
      .single();

    if (existing) return existing.id;

    const { data: created, error } = await supabase
      .from('topics')
      .insert({ name: cleanName, subject_id: subjectId })
      .select('id')
      .single();

    if (error) throw error;
    return created.id;
  }

  static async addResource(data: ResourceData) {
    const subjectId = await this.getOrCreateSubject(data.subjectName);
    const topicId = await this.getOrCreateTopic(data.topicName, subjectId);

    const { data: resource, error } = await supabase
      .from('resources')
      .insert({
        title: data.title,
        type: data.type,
        url: data.url,
        content: data.content,
        subject_id: subjectId,
        topic_id: topicId,
        tags: data.tags || []
      })
      .select()
      .single();

    if (error) throw error;
    return resource;
  }

  static async searchResources(query: string) {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        subjects(name),
        topics(name)
      `)
      .or(`title.ilike.%${query}%,tags.cs.{${query}}`)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  static async getResourcesBySubject(subjectName: string) {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        subjects(name),
        topics(name)
      `)
      .filter('subjects.name', 'ilike', subjectName);

    if (error) throw error;
    return data;
  }

  static async getResourcesByTopic(topicName: string) {
    const { data, error } = await supabase
      .from('resources')
      .select(`
        *,
        subjects(name),
        topics(name)
      `)
      .filter('topics.name', 'ilike', topicName);

    if (error) throw error;
    return data;
  }
}
