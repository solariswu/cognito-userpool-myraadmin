export const getProfileFromToken = (tokenStr) => {
    // const token = JSON.parse(tokenJson);
    const jwt = JSON.parse(atob(tokenStr.split(".")[1]));
    // const jwt = atob(tokenStr.split(".")[1]);

    return jwt;
}