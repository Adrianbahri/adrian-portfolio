import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with API Key from .env
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { name, email, subject, message } = await request.json();

    // 1. Send Email Notification to you
    const { data, error } = await resend.emails.send({
      from: 'Portfolio Contact <onboarding@resend.dev>', // Update this after verifying your domain in Resend
      to: ['your-email@example.com'], // GANTI DENGAN EMAIL ANDA (contoh: adrian@gmail.com)
      subject: `New Message: ${subject}`,
      html: `
        <div style="font-family: sans-serif; padding: 20px; color: #111;">
          <h2 style="border-bottom: 1px solid #eee; padding-bottom: 10px;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} (${email})</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin-top: 20px;">
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <hr style="margin-top: 30px; border: 0; border-top: 1px solid #eee;" />
          <p style="font-size: 12px; color: #999;">Sent from your portfolio website.</p>
        </div>
      `
    });

    if (error) {
      return NextResponse.json({ error }, { status: 400 });
    }

    return NextResponse.json({ message: 'Notification sent successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
