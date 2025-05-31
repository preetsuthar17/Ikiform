// Form Builder Types
export interface Form {
  [x: string]: any;
  id: string;
  user_id: string;
  title: string;
  description?: string;
  settings: FormSettings;
  is_published: boolean;
  share_url?: string;
  password_protected: boolean;
  password_hash?: string;
  created_at: string;
  updated_at: string;
  fields?: FormField[];
  analytics?: FormAnalytics;
}

// Extended interface for public forms with fields
export interface PublicForm extends Omit<Form, "fields"> {
  form_fields: FormField[];
}

export interface FormSettings {
  theme?: {
    primaryColor?: string;
    backgroundColor?: string;
    fontFamily?: string;
    spacing?: "compact" | "normal" | "spacious";
  };
  notifications?: {
    email?: string;
    webhook?: string;
  };
  behavior?: {
    showProgressBar?: boolean;
    allowMultipleSubmissions?: boolean;
    redirectUrl?: string;
    customSuccessMessage?: string;
  };
  security?: {
    captcha?: boolean;
    ipLimiting?: boolean;
    timeLimit?: number; // in minutes
  };
}

export interface FormField {
  id: string;
  form_id: string;
  field_type: FormFieldType;
  label: string;
  placeholder?: string;
  options: FormFieldOption[];
  required: boolean;
  field_order: number;
  validation_rules: ValidationRules;
  conditional_logic: ConditionalLogic;
  created_at: string;
}

export type FormFieldType =
  | "text"
  | "email"
  | "number"
  | "phone"
  | "textarea"
  | "select"
  | "radio"
  | "checkbox"
  | "date"
  | "time"
  | "datetime"
  | "file"
  | "url"
  | "rating"
  | "slider"
  | "matrix"
  | "signature"
  | "payment"
  | "section"
  | "divider";

export interface FormFieldOption {
  id: string;
  label: string;
  value: string;
  color?: string;
  image?: string;
}

export interface ValidationRules {
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
  pattern?: string;
  patternError?: string;
  customValidation?: string;
  fileTypes?: string[];
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  maxSize?: number; // in bytes
  maxFiles?: number;
}

export interface ConditionalLogic {
  show?: boolean;
  conditions?: {
    field_id: string;
    operator:
      | "equals"
      | "not_equals"
      | "contains"
      | "greater_than"
      | "less_than"
      | "is_empty"
      | "is_not_empty";
    value: any;
    logic?: "and" | "or";
  }[];
}

export interface FormResponse {
  id: string;
  form_id: string;
  respondent_email?: string;
  response_data: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  completion_time?: number;
  submitted_at: string;
}

export interface FormAnalytics {
  id: string;
  form_id: string;
  views: number;
  submissions: number;
  average_completion_time: number;
  bounce_rate: number;
  conversion_rate: number;
  updated_at: string;
}

// Form Builder UI Types
export interface DraggedField {
  type: FormFieldType;
  id?: string;
  isNew: boolean;
}

export interface FormBuilderState {
  currentForm: Form | null;
  selectedField: string | null;
  isDragging: boolean;
  previewMode: boolean;
  isSaving: boolean;
}

// Field Templates for the Form Builder
export interface FieldTemplate {
  type: FormFieldType;
  label: string;
  icon: string;
  description: string;
  category: "basic" | "advanced" | "layout" | "payment";
  defaultConfig: Partial<FormField>;
}

export const FIELD_TEMPLATES: FieldTemplate[] = [
  {
    type: "text",
    label: "Text Input",
    icon: "Type",
    description: "Single line text input",
    category: "basic",
    defaultConfig: {
      field_type: "text",
      label: "Text Input",
      placeholder: "Enter text...",
      required: false,
      validation_rules: { maxLength: 255 },
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "email",
    label: "Email",
    icon: "Mail",
    description: "Email address input with validation",
    category: "basic",
    defaultConfig: {
      field_type: "email",
      label: "Email Address",
      placeholder: "Enter your email...",
      required: true,
      validation_rules: { pattern: "^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$" },
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "textarea",
    label: "Textarea",
    icon: "AlignLeft",
    description: "Multi-line text input",
    category: "basic",
    defaultConfig: {
      field_type: "textarea",
      label: "Description",
      placeholder: "Enter detailed information...",
      required: false,
      validation_rules: { maxLength: 1000 },
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "number",
    label: "Number",
    icon: "Hash",
    description: "Numeric input with validation",
    category: "basic",
    defaultConfig: {
      field_type: "number",
      label: "Number",
      placeholder: "Enter a number...",
      required: false,
      validation_rules: {},
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "select",
    label: "Dropdown",
    icon: "ChevronDown",
    description: "Single selection dropdown",
    category: "basic",
    defaultConfig: {
      field_type: "select",
      label: "Select Option",
      placeholder: "Choose an option...",
      required: false,
      validation_rules: {},
      conditional_logic: {},
      options: [
        { id: "1", label: "Option 1", value: "option1" },
        { id: "2", label: "Option 2", value: "option2" },
      ],
    },
  },
  {
    type: "radio",
    label: "Radio Buttons",
    icon: "Circle",
    description: "Single selection radio buttons",
    category: "basic",
    defaultConfig: {
      field_type: "radio",
      label: "Choose One",
      required: false,
      validation_rules: {},
      conditional_logic: {},
      options: [
        { id: "1", label: "Option 1", value: "option1" },
        { id: "2", label: "Option 2", value: "option2" },
      ],
    },
  },
  {
    type: "checkbox",
    label: "Checkboxes",
    icon: "Square",
    description: "Multiple selection checkboxes",
    category: "basic",
    defaultConfig: {
      field_type: "checkbox",
      label: "Select All That Apply",
      required: false,
      validation_rules: {},
      conditional_logic: {},
      options: [
        { id: "1", label: "Option 1", value: "option1" },
        { id: "2", label: "Option 2", value: "option2" },
      ],
    },
  },
  {
    type: "date",
    label: "Date",
    icon: "Calendar",
    description: "Date picker input",
    category: "basic",
    defaultConfig: {
      field_type: "date",
      label: "Select Date",
      required: false,
      validation_rules: {},
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "file",
    label: "File Upload",
    icon: "Upload",
    description: "File upload with progress",
    category: "advanced",
    defaultConfig: {
      field_type: "file",
      label: "Upload File",
      required: false,
      validation_rules: {
        fileTypes: ["image/*", ".pdf", ".doc", ".docx"],
        maxFileSize: 10,
        maxFiles: 1,
      },
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "rating",
    label: "Rating",
    icon: "Star",
    description: "Star rating input",
    category: "advanced",
    defaultConfig: {
      field_type: "rating",
      label: "Rate Your Experience",
      required: false,
      validation_rules: { min: 1, max: 5 },
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "phone",
    label: "Phone Number",
    icon: "Phone",
    description: "Phone number with formatting",
    category: "basic",
    defaultConfig: {
      field_type: "phone",
      label: "Phone Number",
      placeholder: "+1 (555) 123-4567",
      required: false,
      validation_rules: {},
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "url",
    label: "Website URL",
    icon: "Link",
    description: "URL input with validation",
    category: "basic",
    defaultConfig: {
      field_type: "url",
      label: "Website URL",
      placeholder: "https://example.com",
      required: false,
      validation_rules: { pattern: "^https?:\\/\\/.+" },
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "section",
    label: "Section Header",
    icon: "Heading",
    description: "Organize form into sections",
    category: "layout",
    defaultConfig: {
      field_type: "section",
      label: "Section Title",
      required: false,
      validation_rules: {},
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "divider",
    label: "Divider",
    icon: "Minus",
    description: "Visual separator line",
    category: "layout",
    defaultConfig: {
      field_type: "divider",
      label: "",
      required: false,
      validation_rules: {},
      conditional_logic: {},
      options: [],
    },
  },
  {
    type: "slider",
    label: "Slider",
    icon: "Sliders",
    description: "Range slider input",
    category: "advanced",
    defaultConfig: {
      field_type: "slider",
      label: "Select Value",
      required: false,
      validation_rules: { min: 0, max: 100 },
      conditional_logic: {},
      options: [],
    },
  },
];

// Export utility type for form validation
export type FormErrors = Record<string, string[]>;
