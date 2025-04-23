export abstract class User {
    protected name: string;
    protected phone1: number;
    protected phone2: number | null;
    protected email: string;
    protected password: string;
    protected birthDate: number;
    protected cpf: string;
    protected availability: string[];

    constructor(
        name: string,
        phone1: number,
        phone2: number | null = null,
        email: string,
        password: string,
        birthDate: number,
        cpf: string,
        availability: string[]
    ) {
        this.name = name;
        this.phone1 = phone1;
        this.phone2 = phone2;
        this.email = email;
        this.password = password;
        this.birthDate = birthDate;
        this.cpf = cpf;
        this.availability = availability;
    }

    // Getters
    getName(): string {
        return this.name;
    }

    getPhone1(): number {
        return this.phone1;
    }

    getPhone2(): number | null {
        return this.phone2;
    }

    getEmail(): string {
        return this.email;
    }

    getPassword(): string {
        return this.password;
    }

    getBirthDate(): number {
        return this.birthDate;
    }

    getCPF(): string {
        return this.cpf;
    }

    getAvailability(): string[] {
        return this.availability;
    }

    // Setters
    setName(name: string): void {
        this.name = name;
    }

    setPhone1(phone1: number): void {
        this.phone1 = phone1;
    }

    setPhone2(phone2: number | null): void {
        this.phone2 = phone2;
    }

    setEmail(email: string): void {
        this.email = email;
    }

    setPassword(password: string): void {
        this.password = password;
    }

    setBirthDate(birthDate: number): void {
        this.birthDate = birthDate;
    }

    setCPF(cpf: string): void {
        this.cpf = cpf;
    }

    setAvailability(availability: string[]): void {
        this.availability = availability;
    }
}
