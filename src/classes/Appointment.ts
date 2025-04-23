import { Student } from "./Student";
import { Tutor } from "./Tutor";

export class Appointment {
    private static all: Appointment[] = [];
    private student: Student;
    private tutor: Tutor;
    private date: number;
    private hour: number;
    private area: string;
    private language: string;
    private duration: number;
    private price: number;

    constructor(
        student: Student,
        tutor: Tutor,
        date: number,
        hour: number,
        area: string,
        language: string,
        duration: number,
        price: number
    ) {
        this.student = student;
        this.tutor = tutor;
        this.date = date;
        this.hour = hour;
        this.area = area;
        this.language = language;
        this.duration = duration;
        this.price = price;
        Appointment.all.push(this);
    }

    // Getters
    static getAll(): Appointment[] {
        return Appointment.all;
    }

    getStudent(): Student {
        return this.student;
    }

    getTutor(): Tutor {
        return this.tutor;
    }

    getDate(): number {
        return this.date;
    }

    getHour(): number {
        return this.hour;
    }

    getArea(): string {
        return this.area;
    }

    getLanguage(): string {
        return this.language;
    }

    getDuration(): number {
        return this.duration;
    }

    getPrice(): number {
        return this.price;
    }

    // Setters
    setStudent(student: Student): void {
        this.student = student;
    }

    setTutor(tutor: Tutor): void {
        this.tutor = tutor;
    }

    setDate(date: number): void {
        this.date = date;
    }

    setHour(hour: number): void {
        this.hour = hour;
    }

    setArea(area: string): void {
        this.area = area;
    }

    setLanguage(language: string): void {
        this.language = language;
    }

    setDuration(duration: number): void {
        this.duration = duration;
    }

    setPrice(price: number): void {
        this.price = price;
    }
}
