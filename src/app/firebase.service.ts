// Migrated to Supabase — see ./supabase.service.ts.
// This file is kept as a thin re-export for backwards compatibility with any
// stale imports. Safe to delete once you've confirmed nothing references it.
export {
  SupabaseService as FirebaseService,
  CvDoc,
  CvFileMeta,
  CvStructured,
  CvExperience,
  CvEducation,
  CvLang
} from './supabase.service';
