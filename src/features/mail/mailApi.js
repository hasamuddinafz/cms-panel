import { api } from "../../app/api";

export const mailApi = api.injectEndpoints({
  endpoints: (builder) => ({
    sendMail: builder.mutation({
      query: (body) => ({ url: "/api/admin/mail/send", method: "POST", body }),
    }),
    sendBulkMail: builder.mutation({
      query: (body) => ({ url: "/api/admin/mail/send-bulk", method: "POST", body }),
    }),
    // Mail templates
    getMailTemplates: builder.query({
      query: (params) => ({ url: "/api/admin/mail-templates", params }),
      providesTags: ["MailTemplate"],
    }),
    getMailTemplateById: builder.query({
      query: (id) => `/api/admin/mail-templates/${id}`,
      providesTags: (r, e, id) => [{ type: "MailTemplate", id }],
    }),
    createMailTemplate: builder.mutation({
      query: (body) => ({ url: "/api/admin/mail-templates", method: "POST", body }),
      invalidatesTags: ["MailTemplate"],
    }),
    updateMailTemplate: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/api/admin/mail-templates/${id}`, method: "PUT", body }),
      invalidatesTags: ["MailTemplate"],
    }),
    deleteMailTemplate: builder.mutation({
      query: (id) => ({ url: `/api/admin/mail-templates/${id}`, method: "DELETE" }),
      invalidatesTags: ["MailTemplate"],
    }),
  }),
});

export const {
  useSendMailMutation,
  useSendBulkMailMutation,
  useGetMailTemplatesQuery,
  useGetMailTemplateByIdQuery,
  useCreateMailTemplateMutation,
  useUpdateMailTemplateMutation,
  useDeleteMailTemplateMutation,
} = mailApi;
