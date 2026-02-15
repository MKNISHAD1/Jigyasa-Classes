<x-mail::message>
# Two-Factor Authentication

Your OTP code is:

# {{ $otp }}

This code will expire in 5 minutes.  
If you did not request this, please ignore this email.

Thanks,  
{{ config('app.name') }}
</x-mail::message>