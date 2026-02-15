<!DOCTYPE html>
<html>
<head>
    <title>Password Reset</title>
</head>
<body>
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password.</p>

    <p><b>Your OTP:</b> (valid for 10 minutes)</p><br> <strong>{{ $otp }}</strong> <br>

    <p>Or click this link to reset your password:</p>
    <a href="{{ $url }}">Reset Password</a>

    
    <p>If you did not request this, you can safely ignore this email.</p>
    
    <br>
    <small>This mail is computer generated, please don't reply to this mail</small>
    <br>

    <strong>
        <p>Thanks, <br>Jigyasa Classes</p>
    </strong>

</body>
</html>