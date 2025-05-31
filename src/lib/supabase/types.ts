export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          provider: string;
          email_verified: boolean;
          premium: boolean | null;
          premium_plan: string | null;
          premium_expires_at: string | null;
          subscription_id: string | null;
          subscription_status: string | null;
          subscription_period_start: string | null;
          subscription_period_end: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          provider: string;
          email_verified?: boolean;
          premium?: boolean | null;
          premium_plan?: string | null;
          premium_expires_at?: string | null;
          subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_period_start?: string | null;
          subscription_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          first_name?: string | null;
          last_name?: string | null;
          provider?: string;
          email_verified?: boolean;
          premium?: boolean | null;
          premium_plan?: string | null;
          premium_expires_at?: string | null;
          subscription_id?: string | null;
          subscription_status?: string | null;
          subscription_period_start?: string | null;
          subscription_period_end?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
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
      forms: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          settings: Record<string, any>;
          is_published: boolean;
          share_url: string | null;
          password_protected: boolean;
          password_hash: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description?: string | null;
          settings?: Record<string, any>;
          is_published?: boolean;
          share_url?: string | null;
          password_protected?: boolean;
          password_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          settings?: Record<string, any>;
          is_published?: boolean;
          share_url?: string | null;
          password_protected?: boolean;
          password_hash?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      form_fields: {
        Row: {
          id: string;
          form_id: string;
          field_type: string;
          label: string;
          placeholder: string | null;
          options: any[];
          required: boolean;
          field_order: number;
          validation_rules: Record<string, any>;
          conditional_logic: Record<string, any>;
          created_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          field_type: string;
          label: string;
          placeholder?: string | null;
          options?: any[];
          required?: boolean;
          field_order: number;
          validation_rules?: Record<string, any>;
          conditional_logic?: Record<string, any>;
          created_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          field_type?: string;
          label?: string;
          placeholder?: string | null;
          options?: any[];
          required?: boolean;
          field_order?: number;
          validation_rules?: Record<string, any>;
          conditional_logic?: Record<string, any>;
          created_at?: string;
        };
      };
      form_responses: {
        Row: {
          id: string;
          form_id: string;
          respondent_email: string | null;
          response_data: Record<string, any>;
          ip_address: string | null;
          user_agent: string | null;
          completion_time: number | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          respondent_email?: string | null;
          response_data: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          completion_time?: number | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          respondent_email?: string | null;
          response_data?: Record<string, any>;
          ip_address?: string | null;
          user_agent?: string | null;
          completion_time?: number | null;
          submitted_at?: string;
        };
      };
      form_analytics: {
        Row: {
          id: string;
          form_id: string;
          views: number;
          submissions: number;
          average_completion_time: number;
          bounce_rate: number;
          conversion_rate: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_id: string;
          views?: number;
          submissions?: number;
          average_completion_time?: number;
          bounce_rate?: number;
          conversion_rate?: number;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_id?: string;
          views?: number;
          submissions?: number;
          average_completion_time?: number;
          bounce_rate?: number;
          conversion_rate?: number;
          updated_at?: string;
        };
      };
    };
  };
}
