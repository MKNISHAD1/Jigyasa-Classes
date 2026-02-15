<!DOCTYPE html>
<html>
<body>
    <h2>⚠ Account Suspended</h2>
    <p>Dear user,</p>
    <p>Your account has been suspended.</p>
    <p><strong>Reason:</strong> {{ $reason }}</p>
    @if($until)
        <p><strong>Suspended until:</strong> {{ $until }}</p>
    @endif
    <p>If you believe this is a mistake, please contact support.</p>

    <small>This is Computer Generated Mail, Kindly Don't reply to this mail.</small>
    <br>
    <br>

    <strong>
        <p>Thanks, <br>Jigyasa Classes</p>
    </strong>

</body>
</html>
