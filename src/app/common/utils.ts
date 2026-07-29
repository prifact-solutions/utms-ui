import { UserRoleName, UserRoles } from "../users/models/role.model";

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

    public static getRole(): UserRoleName | null {
        const role = Utils.decodeAuthToken()?.role;
        // console.log("The role is " + role);
        return role ?? null;
    }
    
    public static hasAnyRole(...roles: UserRoleName[]): boolean {
        const role = this.getRole();
        return !!role && roles.includes(role);
    }

    public static isAdmin(): boolean {
        return this.hasAnyRole(UserRoles.ADMIN);
    }

    public static isInstructor(): boolean {
        return this.hasAnyRole(UserRoles.INSTRUCTOR);
    }

    public static isStaff(): boolean {
        return this.hasAnyRole(UserRoles.ADMIN, UserRoles.INSTRUCTOR);
    }

    public static isLearner(): boolean {
        return this.hasAnyRole(UserRoles.LEARNER);
    }

    public static getRoleLabel(): string {
        switch(this.getRole()){
            case UserRoles.ADMIN: return 'Admin';
            case UserRoles.INSTRUCTOR: return 'Instructor';
            case UserRoles.LEARNER: return 'Student';
            default: return 'Unknown';
        }

    }

    /**
     * Preview video must be playable in HTML5 video (MP4/WebM typical).
     * Returns a user-facing message if invalid, or null if accepted.
     */
    public static validateProgramPreviewVideoFile(file: File): string | null {
        if (!file?.name) {
            return null;
        }
        const dot = file.name.lastIndexOf('.');
        const ext = dot >= 0 ? file.name.toLowerCase().slice(dot) : '';
        if (ext === '.avi' || ext === '.wmv') {
            return 'AVI and WMV formats are not supported for preview video. Please use MP4 or WebM formats.';
        }
        const mime = (file.type || '').toLowerCase();
        if (
            mime === 'video/x-msvideo' ||
            mime === 'video/avi' ||
            mime === 'video/msvideo' ||
            mime === 'video/x-ms-wmv' ||
            mime === 'video/wmv'
        ) {
            return 'AVI and WMV are not supported for preview video. Please use MP4 or WebM.';
        }
        return null;
    }
}