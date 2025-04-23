import { Appointment } from "./Appointment";
import { Tutor } from "./Tutor";
import { User } from "./User";

export class Student extends User {
    protected academicBackground: string[];
    protected languageProficiency: string[];

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
        languageProficiency: string[]
    ) {
        super(name, phone1, phone2, email, password, birthDate, cpf, availability);
        this.academicBackground = academicBackground;
        this.languageProficiency = languageProficiency;
    }

    // Getters
    getAcademicBackground(): string[] {
        return this.academicBackground;
    }

    getLanguageProficiency(): string[] {
        return this.languageProficiency;
    }

    // Setters
    setAcademicBackground(academicBackground: string[]): void {
        this.academicBackground = academicBackground;
    }

    setLanguageProficiency(languageProficiency: string[]): void {
        this.languageProficiency = languageProficiency;
    }

    // Methods
    schedule(
        tutor: Tutor,
        date: number,
        hour: number,
        area: string,
        language: string,
        duration: number,
        price: number
    ): void {
        const appointment = new Appointment(this, tutor, date, hour, area, language, duration, price);
        console.log("Scheduled successfully!");
    }
}
