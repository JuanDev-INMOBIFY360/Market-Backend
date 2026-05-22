export interface TaxItem {
    subtotal: number;
    taxCode: string;
}

export function calculateItemTax(subtotal: number, taxCode: string): number {
    switch (taxCode) {
        case 'A':
            return subtotal * 0.19; // 19% IVA
        case 'B':
            return subtotal * 0.05; // 5% IVA
        case 'D':
            return subtotal * 0.04; // 4% Consumo
        default:
            return 0; // C = Exento
    }
}

export function calculateTax(items: TaxItem[]): number {
    return items.reduce((total, item) => {
        return total + calculateItemTax(item.subtotal, item.taxCode);
    }, 0);
}