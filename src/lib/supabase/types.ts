export interface Database {
  public: {
    Tables: {
      waitlist: {
        Row: {
          id: string;
          created_at: string;
          email: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          email: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
        };
      };
    };
  };
}
