// filepath: src/lib/services/formService.ts
// Service layer for form operations
import { Form, FormField, FormResponse, PublicForm } from "@/lib/types/forms";

export class FormService {
  private baseUrl: string;

  constructor() {
    // In browser environment, use relative URLs (empty string)
    // In server environment (like SSR), use the full URL
    if (typeof window !== "undefined") {
      this.baseUrl = "";
    } else {
      this.baseUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        process.env.NEXT_PUBLIC_SITE_URL ||
        "http://localhost:3000";
    }
  }

  // Form CRUD operations
  async getAllForms(): Promise<{ forms: Form[] }> {
    const response = await fetch(`${this.baseUrl}/api/forms`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch forms");
    }

    return response.json();
  }

  async getForm(formId: string): Promise<{ form: Form }> {
    const response = await fetch(`${this.baseUrl}/api/forms/${formId}`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch form");
    }

    return response.json();
  }

  async createForm(formData: {
    form: Partial<Form>;
    fields?: FormField[];
  }): Promise<{ form: Form }> {
    const response = await fetch(`${this.baseUrl}/api/forms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Failed to create form");
    }

    return response.json();
  }

  async updateForm(
    formId: string,
    formData: {
      form: Partial<Form>;
      fields?: FormField[];
    }
  ): Promise<{ form: Form }> {
    const response = await fetch(`${this.baseUrl}/api/forms/${formId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(formData),
    });

    if (!response.ok) {
      throw new Error("Failed to update form");
    }

    return response.json();
  }

  async deleteForm(formId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/api/forms/${formId}`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to delete form");
    }

    return response.json();
  }

  // Field operations
  async getFormFields(formId: string): Promise<{ fields: FormField[] }> {
    const response = await fetch(`${this.baseUrl}/api/forms/${formId}/fields`, {
      credentials: "include",
    });

    if (!response.ok) {
      throw new Error("Failed to fetch form fields");
    }

    return response.json();
  }

  async updateFormFields(
    formId: string,
    fields: FormField[]
  ): Promise<{ fields: FormField[] }> {
    const response = await fetch(`${this.baseUrl}/api/forms/${formId}/fields`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(fields),
    });

    if (!response.ok) {
      throw new Error("Failed to update form fields");
    }

    return response.json();
  }

  async addFormField(
    formId: string,
    field: FormField
  ): Promise<{ field: FormField }> {
    const response = await fetch(`${this.baseUrl}/api/forms/${formId}/fields`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(field),
    });

    if (!response.ok) {
      throw new Error("Failed to add form field");
    }

    return response.json();
  }

  async updateFormField(
    formId: string,
    fieldId: string,
    fieldData: Partial<FormField>
  ): Promise<{ field: FormField }> {
    const response = await fetch(
      `${this.baseUrl}/api/forms/${formId}/fields/${fieldId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(fieldData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update form field");
    }

    return response.json();
  }

  async deleteFormField(
    formId: string,
    fieldId: string
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${this.baseUrl}/api/forms/${formId}/fields/${fieldId}`,
      {
        method: "DELETE",
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to delete form field");
    }

    return response.json();
  }
  // Public form access
  async getPublicForm(shareUrl: string): Promise<{ form: PublicForm }> {
    const response = await fetch(
      `${this.baseUrl}/api/forms/public/${shareUrl}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch public form");
    }

    return response.json();
  }

  // Form submission
  async submitForm(
    formId: string,
    submissionData: {
      responses: { [fieldId: string]: any };
      metadata?: any;
    }
  ): Promise<{ message: string; responseId: string }> {
    const response = await fetch(`${this.baseUrl}/api/forms/${formId}/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(submissionData),
    });

    if (!response.ok) {
      throw new Error("Failed to submit form");
    }

    return response.json();
  }

  async submitPublicForm(
    shareUrl: string,
    submissionData: {
      responses: { [fieldId: string]: any };
      metadata?: any;
    }
  ): Promise<{ message: string; responseId: string }> {
    const response = await fetch(
      `${this.baseUrl}/api/forms/public/${shareUrl}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to submit form");
    }

    return response.json();
  }
  // Response management
  async getFormResponses(
    formId: string
  ): Promise<{ responses: FormResponse[] }> {
    const response = await fetch(
      `${this.baseUrl}/api/forms/${formId}/submissions`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch form responses");
    }
    const result = await response.json();

    return result;
  }

  // Analytics
  async getFormAnalytics(formId: string): Promise<{ analytics: any }> {
    const response = await fetch(
      `${this.baseUrl}/api/forms/${formId}/analytics`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch form analytics");
    }

    return response.json();
  }

  async trackAnalyticsEvent(
    formId: string,
    eventType: string,
    metadata?: any
  ): Promise<{ message: string }> {
    const response = await fetch(
      `${this.baseUrl}/api/forms/${formId}/analytics`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          event_type: eventType,
          metadata,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Analytics tracking failed:", {
        status: response.status,
        statusText: response.statusText,
        error: errorText,
        formId,
        eventType,
      });
      throw new Error(
        `Failed to track analytics event: ${response.status} ${response.statusText}`
      );
    }

    return response.json();
  }

  // Export
  async exportFormData(
    formId: string,
    format: "csv" | "json" = "csv"
  ): Promise<Blob> {
    const response = await fetch(
      `${this.baseUrl}/api/forms/${formId}/export?format=${format}`,
      {
        credentials: "include",
      }
    );

    if (!response.ok) {
      throw new Error("Failed to export form data");
    }

    return response.blob();
  }

  async initiateExport(
    formId: string,
    options: {
      format: "csv" | "json";
      filters?: any;
    }
  ): Promise<{ exportId: string; totalRecords: number }> {
    const response = await fetch(`${this.baseUrl}/api/forms/${formId}/export`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(options),
    });

    if (!response.ok) {
      throw new Error("Failed to initiate export");
    }

    return response.json();
  }
}

// Create singleton instance
export const formService = new FormService();
