export interface CartItem {
    productId: string;
    productName: string;
    productBarcode: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    taxCode: string;
}

export class Cart {
    private items: CartItem[] = [];

    addItem(item: CartItem): void {
        const existingIndex = this.items.findIndex(i => i.productId === item.productId);
        if (existingIndex !== -1) {
            this.items[existingIndex].quantity += item.quantity;
            this.items[existingIndex].subtotal = this.items[existingIndex].quantity * this.items[existingIndex].unitPrice;
        } else {
            this.items.push(item);
        }
    }

    removeItem(index: number): void {
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 1);
        }
    }

    updateQuantity(index: number, quantity: number): void {
        if (index >= 0 && index < this.items.length && quantity > 0) {
            this.items[index].quantity = quantity;
            this.items[index].subtotal = quantity * this.items[index].unitPrice;
        }
    }

    getItems(): CartItem[] {
        return [...this.items];
    }

    clear(): void {
        this.items = [];
    }

    getSubtotal(): number {
        return this.items.reduce((sum, item) => sum + item.subtotal, 0);
    }

    getTotal(): number {
        return this.getSubtotal();
    }
}