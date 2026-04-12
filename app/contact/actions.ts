"use server"

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

/**
 * Server Action – send an email or enqueue it in your provider.
 * Replace the console.log with real email logic (Resend, SendGrid, etc.).
 */
export async function sendEmail(data: ContactFormData) {
  console.log("Form data submitted:", data)

  // Simulate successful response
  return {
    success: true,
    message: "Your message has been sent successfully!",
  }
}

/**
 * Helper consumed by the client component.
 * Converts a browser FormData instance to a typed object and
 * delegates processing to the `sendEmail` Server Action above.
 */
export async function submitContactForm(formData: FormData) {
  const data: ContactFormData = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    subject: String(formData.get("subject") ?? ""),
    message: String(formData.get("message") ?? ""),
  }

  return sendEmail(data)
}
