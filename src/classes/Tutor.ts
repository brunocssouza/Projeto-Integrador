import { Appointment } from "./Appointment";
import { Student } from "./Student";

export class Tutor extends Student {
    protected professionalExperience: string[];
    protected position: string;
    protected description: string;
    protected languages: string[];
    protected comments: string[];

    constructor(
        name: string,
        phone1: number,
        phone2: number | null = null,
        email: string,
        password: string,
        birthDate: number,
        cpf: string,
        availability: string[],
        academicBackground: string[],
        languageProficiency: string[],
        professionalExperience: string[],
        position: string,
        description: string,
        languages: string[],
        comments: string[]
    ) {
        super(name, phone1, phone2, email, password, birthDate, cpf, availability, academicBackground, languageProficiency);
        this.professionalExperience = professionalExperience;
        this.position = position;
        this.description = description;
        this.languages = languages;
        this.comments = comments;
    }

    // Getters
    getProfessionalExperience(): string[] {
        return this.professionalExperience;
    }

    getPosition(): string {
        return this.position;
    }

    getDescription(): string {
        return this.description;
    }

    getLanguages(): string[] {
        return this.languages;
    }

    getComments(): string[] {
        return this.comments;
    }

    // Setters
    setProfessionalExperience(professionalExperience: string[]): void {
        this.professionalExperience = professionalExperience;
    }

    setPosition(position: string): void {
        this.position = position;
    }

    setDescription(description: string): void {
        this.description = description;
    }

    setLanguages(languages: string[]): void {
        this.languages = languages;
    }

    setComments(comments: string[]): void {
        this.comments = comments;
    }

    // Methods
    viewSchedule(): void {
        for (const appointment of Appointment.getAll()) {
            if (appointment.getTutor() === this) {
                console.log("-", appointment.getStudent().getName(), appointment.getDate());
            }
        }
    }
}
