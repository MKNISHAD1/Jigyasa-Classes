<?php

return [

    /*
    |--------------------------------------------------------------------------
    | OTP / 2FA Settings
    |--------------------------------------------------------------------------
    */
    'otp_expiry_minutes' => 5,   // OTP will expire in 5 minutes

    /*
    |--------------------------------------------------------------------------
    | Login Attempt Limits
    |--------------------------------------------------------------------------
    */
    'short_cooldown_attempts' => 5,    // max attempts before cooldown
    'short_cooldown_seconds' => 60,    // cooldown duration (1 min)

    'daily_attempt_limit'     => 10,   // max attempts in 24 hours
    'suspension_time'        => 5,   // suspension time after daily limit is exceeded

];