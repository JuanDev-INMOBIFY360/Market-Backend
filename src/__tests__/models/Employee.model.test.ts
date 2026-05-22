import { Employee } from '../../models/Employee.model';
import { describe, it, expect, beforeEach,test } from '@jest/globals';

describe('Employee Model', () => {
    let employee: Employee;

    beforeEach(() => {
        employee = new Employee();
        employee.code = 'EMP001';
        employee.fullName = 'Juan Pérez';
        employee.documentNumber = '12345678';
        employee.role = 'cashier';
        employee.email = 'juan@test.com';
        employee.phone = '3001234567';
    });

    test('debería crear un empleado con valores correctos', () => {
        expect(employee.code).toBe('EMP001');
        expect(employee.fullName).toBe('Juan Pérez');
        expect(employee.documentNumber).toBe('12345678');
        expect(employee.role).toBe('cashier');
        expect(employee.email).toBe('juan@test.com');
        expect(employee.phone).toBe('3001234567');
    });

    test('toJSON no debería incluir passwordHash', () => {
        const json = employee.toJSON();
        expect(json).not.toHaveProperty('passwordHash');
        expect(json).toHaveProperty('code');
        expect(json).toHaveProperty('fullName');
        expect(json).toHaveProperty('role');
    });
});