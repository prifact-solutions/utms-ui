export class Utils {
    public static decodeAuthToken() {
        let token = localStorage.getItem("auth_token");
        if (!token) {
            return {};
        }
        let parts = token?.split(".");
        return JSON.parse(atob(parts[1]));
    }
}