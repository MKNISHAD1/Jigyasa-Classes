

// Debounce Validator

import { apiUrl } from "../Component/Common/http";

let timers = {};

export const debounceValidator = (
    key,
    Callback,
    delay=500
) => {

    return (...args) => {
        clearTimeout(timers[key]);

        return new Promise((resolve) => {
            timers[key] = setTimeout( async () => {

                resolve(await Callback(...args));
                }, delay
            );
        });
    };
};


// Check  Avilability

export const availabilityValidator = (
    model,
    field,
    id,
    currentValue,
    label
) => debounceValidator (
    `${model}-${field}`,

    async(value) => {
        
        if(!value) return `${label} is required`;

        if(value===currentValue) return true ;

        const res =  await fetch(
            `${apiUrl}check-availability?model=${model}&field=${field}&value=${encodeURIComponent(value)}&id=${id}`
        );

        const result = await res.json();

        if (result.trashed) {
            return `This ${label} belongs to a previously deleted account. Contact support to restore it.`;
        }

        if (result.exists) {
            return `This ${label} is already taken`;
        }

        return true;
    }
);



// Check Username Validator

// export const usernameValidator = (userId,currentUsername) => debounceValidator(
//     "username",
//     async (value) => {

//         if (!value) return "Username is required";

//         if (value === currentUsername) return true;

//         const res = await fetch ( `${apiUrl}check-username?username=${encodeURIComponent(value)}&id=${userId}`);

//         const result = await res.json();

//         return result.exists ? "This Username is already taken" : true ;
//     }
// );

// Check Email Validator

// export const emailValidator = (userId,currentEmail) => debounceValidator(
//     "email",
//     async (value) => {

//         if (!value) return "Email is required";

//         if (value === currentEmail) return true;

//         const res = await fetch ( `${apiUrl}check-email?email=${encodeURIComponent(value)}&id=${userId}`);

//         const result = await res.json();

//         return result.exists ? "This Email is already taken" : true ;
//     }
// );



