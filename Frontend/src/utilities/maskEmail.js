const maskEmail = (email) => {
    if (!email) return "";

    const [username, domain] = email.split("@");

    if (!domain) return email;

    // Very short usernames
    if (username.length <= 2) {
        return `${username}***@${domain}`;
    }

    if (username.length <= 4) {
        return `${username.slice(0, 2)}***@${domain}`;
    }

    const first = username.slice(0, 2);
    const last = username.slice(-2);

    return `${first}***${last}@${domain}`;
};

export default maskEmail;