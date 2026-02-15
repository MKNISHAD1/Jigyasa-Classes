<!DOCTYPE html>
<html>
<body>
    <h2>✅ Account Unsuspended</h2>
    <p>Dear {{$user->username}},</p>
    <p>Your account suspension has been lifted.</p>
    <p>This was done 
        @if($method === 'auto')
            automatically after your suspension period ended.
        @else
            manually by an administrator.
        @endif
    </p>
    <p>You can now log back in to your account.</p>
</body>
</html>
