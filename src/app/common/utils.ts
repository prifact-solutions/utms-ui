export class Utils {
    public static stringToColor(str: string): string {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = str.charCodeAt(i) + ((hash << 5) - hash);
        }
        const h = Math.abs(hash) % 360;
        return `hsl(${h}, 70%, 45%)`;
    }

    public static getInitials(text: string): string {
        if (!text) return '';
        const words = text.trim().split(/\s+/);
        if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
        return (words[0][0] + words[1][0]).toUpperCase();
    }

    public static decodeAuthToken() {
        let token = localStorage.getItem("auth_token");
        if (!token) {
            return {};
        }
        let parts = token?.split(".");
        return JSON.parse(atob(parts[1]));
    }
}