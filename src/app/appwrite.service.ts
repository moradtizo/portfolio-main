// Migrated to Supabase — see ./supabase.service.ts.
// Kept as a compatibility re-export for stale imports.
export {
  SupabaseService as AppwriteService,
  SupabaseUser as AppwriteUser,
  CvDoc,
  CvFileMeta,
  CvStructured,
  CvExperience,
  CvEducation,
  CvLang
} from './supabase.service';
