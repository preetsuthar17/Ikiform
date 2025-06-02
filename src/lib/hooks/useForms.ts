// filepath: src/lib/hooks/useForms.ts
// React hooks for form management
import { useState, useEffect, useCallback } from "react";
import { Form, FormField, FormResponse, PublicForm } from "@/lib/types/forms";
import { formService } from "@/lib/services/formService";

export function useForms() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { forms } = await formService.getAllForms();
      setForms(forms);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch forms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchForms();
  }, [fetchForms]);

  const createForm = useCallback(
    async (formData: { form: Partial<Form>; fields?: FormField[] }) => {
      try {
        const { form } = await formService.createForm(formData);
        setForms((prev) => [form, ...prev]);
        return form;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create form");
        throw err;
      }
    },
    [],
  );

  const updateForm = useCallback(
    async (
      formId: string,
      formData: {
        form: Partial<Form>;
        fields?: FormField[];
      },
    ) => {
      try {
        const { form } = await formService.updateForm(formId, formData);
        setForms((prev) => prev.map((f) => (f.id === formId ? form : f)));
        return form;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update form");
        throw err;
      }
    },
    [],
  );

  const deleteForm = useCallback(async (formId: string) => {
    try {
      await formService.deleteForm(formId);
      setForms((prev) => prev.filter((f) => f.id !== formId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete form");
      throw err;
    }
  }, []);

  return {
    forms,
    loading,
    error,
    fetchForms,
    createForm,
    updateForm,
    deleteForm,
  };
}

export function useForm(formId: string) {
  const [form, setForm] = useState<Form | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForm = useCallback(async () => {
    if (!formId) return;

    try {
      setLoading(true);
      setError(null);
      const { form } = await formService.getForm(formId);
      setForm(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch form");
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const updateForm = useCallback(
    async (formData: { form: Partial<Form>; fields?: FormField[] }) => {
      if (!formId) return;

      try {
        const { form: updatedForm } = await formService.updateForm(
          formId,
          formData,
        );
        setForm(updatedForm);
        return updatedForm;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update form");
        throw err;
      }
    },
    [formId],
  );

  return {
    form,
    loading,
    error,
    fetchForm,
    updateForm,
  };
}

export function useFormFields(formId: string) {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFields = useCallback(async () => {
    if (!formId) return;

    try {
      setLoading(true);
      setError(null);
      const { fields } = await formService.getFormFields(formId);
      setFields(fields);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch form fields",
      );
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchFields();
  }, [fetchFields]);

  const updateFields = useCallback(
    async (newFields: FormField[]) => {
      if (!formId) return;

      try {
        const { fields: updatedFields } = await formService.updateFormFields(
          formId,
          newFields,
        );
        setFields(updatedFields);
        return updatedFields;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update form fields",
        );
        throw err;
      }
    },
    [formId],
  );

  const addField = useCallback(
    async (field: FormField) => {
      if (!formId) return;

      try {
        const { field: newField } = await formService.addFormField(
          formId,
          field,
        );
        setFields((prev) => [...prev, newField]);
        return newField;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to add form field",
        );
        throw err;
      }
    },
    [formId],
  );

  const updateField = useCallback(
    async (fieldId: string, fieldData: Partial<FormField>) => {
      if (!formId) return;

      try {
        const { field: updatedField } = await formService.updateFormField(
          formId,
          fieldId,
          fieldData,
        );
        setFields((prev) =>
          prev.map((f) => (f.id === fieldId ? updatedField : f)),
        );
        return updatedField;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update form field",
        );
        throw err;
      }
    },
    [formId],
  );

  const deleteField = useCallback(
    async (fieldId: string) => {
      if (!formId) return;

      try {
        await formService.deleteFormField(formId, fieldId);
        setFields((prev) => prev.filter((f) => f.id !== fieldId));
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete form field",
        );
        throw err;
      }
    },
    [formId],
  );

  return {
    fields,
    loading,
    error,
    fetchFields,
    updateFields,
    addField,
    updateField,
    deleteField,
  };
}

export function useFormResponses(formId: string) {
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchResponses = useCallback(async () => {
    if (!formId) return;

    try {
      setLoading(true);
      setError(null);

      const { responses } = await formService.getFormResponses(formId);

      setResponses(responses);
    } catch (err) {
      console.error("❌ useFormResponses: Error:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch form responses",
      );
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchResponses();
  }, [fetchResponses]);

  return {
    responses,
    loading,
    error,
    fetchResponses,
  };
}

export function useFormAnalytics(formId: string) {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = useCallback(async () => {
    if (!formId) return;

    try {
      setLoading(true);
      setError(null);
      const { analytics } = await formService.getFormAnalytics(formId);
      setAnalytics(analytics);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch form analytics",
      );
    } finally {
      setLoading(false);
    }
  }, [formId]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const trackEvent = useCallback(
    async (eventType: string, metadata?: any) => {
      if (!formId) return;

      try {
        await formService.trackAnalyticsEvent(formId, eventType, metadata);
      } catch (err) {
        console.error("Failed to track analytics event:", err);
      }
    },
    [formId],
  );

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
    trackEvent,
  };
}

export function usePublicForm(shareUrl: string) {
  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchForm = useCallback(async () => {
    if (!shareUrl) return;

    try {
      setLoading(true);
      setError(null);
      const { form } = await formService.getPublicForm(shareUrl);
      setForm(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch form");
    } finally {
      setLoading(false);
    }
  }, [shareUrl]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  const submitForm = useCallback(
    async (submissionData: {
      responses: { [fieldId: string]: any };
      metadata?: any;
    }) => {
      if (!shareUrl) return;

      try {
        const result = await formService.submitPublicForm(
          shareUrl,
          submissionData,
        );
        return result;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to submit form");
        throw err;
      }
    },
    [shareUrl],
  );

  return {
    form,
    loading,
    error,
    fetchForm,
    submitForm,
  };
}
