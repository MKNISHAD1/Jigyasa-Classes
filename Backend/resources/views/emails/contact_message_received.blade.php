<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Message Received - Jigyasa Classes</title>
</head>
<body style="margin:0; padding:0; background-color:#f0f6ff; font-family:Arial,Helvetica,sans-serif; color:#263445;">

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f0f6ff; padding:24px 12px;">
        <tr>
            <td align="center">

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px; background-color:#ffffff; border:1px solid #dce7f5; border-radius:10px; overflow:hidden;">

                    <tr>
                        <td style="background-color:#1769c2; padding:24px 28px; text-align:center;">
                            <h1 style="margin:0; color:#ffffff; font-size:24px;">Jigyasa Classes</h1>
                            <p style="margin:8px 0 0; color:#e8f2ff; font-size:14px;">Learn • Grow • Succeed</p>
                        </td>
                    </tr>

                    <tr>
                        <td style="padding:28px;">

                            <h2 style="margin:0 0 20px; color:#1769c2; font-size:22px;">
                                We've Received Your Message
                            </h2>

                            <p style="font-size:16px; line-height:1.7;">
                                Hello {{ $contactMessage->name }},
                            </p>

                            <p style="font-size:15px; line-height:1.8;">
                                Thank you for contacting <strong>Jigyasa Classes</strong>.
                                Your message has been received successfully, and our team
                                will review your query.
                            </p>

                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0; background-color:#f5f9ff; border:1px solid #dce7f5; border-radius:8px;">
                                <tr>
                                    <td style="padding:18px;">

                                        <p style="margin:0 0 16px; font-size:15px;">
                                            <strong>Reference Number</strong><br>
                                            <span style="color:#1769c2; font-size:20px; font-weight:bold;">#{{ $contactMessage->id }}</span>
                                        </p>

                                        <p style="margin:0 0 12px; font-size:15px; line-height:1.6;">
                                            <strong>Subject:</strong><br>
                                            {{ $contactMessage->subject }}
                                        </p>

                                        <p style="margin:0; font-size:15px; line-height:1.6;">
                                            <strong>Category:</strong><br>
                                            {{ $contactMessage->category }}
                                        </p>

                                    </td>
                                </tr>
                            </table>

                            <p style="font-size:15px; line-height:1.8;">
                                Please keep your reference number for future communication.
                                We'll notify you by email when your query has been resolved.
                            </p>

                            <p style="font-size:15px; line-height:1.7; margin-top:28px;">
                                Thanks,<br>
                                <strong>Jigyasa Classes Support Team</strong>
                            </p>

                        </td>
                    </tr>

                    <tr>
                        <td style="padding:18px 24px; background-color:#f5f8fc; border-top:1px solid #e1e8f0; text-align:center;">
                            <p style="margin:0; color:#68788b; font-size:12px; line-height:1.6;">
                                This is an automated email. Please do not reply to this message.
                            </p>
                            <p style="margin:6px 0 0; color:#68788b; font-size:12px;">
                                © {{ date('Y') }} Jigyasa Classes
                            </p>
                        </td>
                    </tr>

                </table>

            </td>
        </tr>
    </table>

</body>
</html>