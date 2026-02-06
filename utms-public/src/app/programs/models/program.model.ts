export class Program {
    id: number;
    title: string;
    description: string;
    thumbnail: string | null;
    duration: number;
    is_active: boolean;
    created_at: string;
    created_by: number;
    categories: number[];
    is_enrolled: boolean = false;
    constructor(
        id: number,
        title: string,
        description: string,
        thumbnail: string | null,
        duration: number,
        is_active: boolean,
        created_at: string,
        created_by: number,
        categories: number[],

    ) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.thumbnail = thumbnail;
        this.duration = duration;
        this.is_active = is_active;
        this.created_at = created_at;
        this.created_by = created_by;
        this.categories = categories;
    }
}