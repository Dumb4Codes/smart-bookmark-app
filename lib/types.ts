export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  created_at: string;
}

export type Database = {
  public: {
    Tables: {
      bookmarks: {
        Row: Bookmark;
        Insert: {
          user_id: string;
          title: string;
          url: string;
        };
        Update: {
          title?: string;
          url?: string;
        };
      };
    };
  };
};
