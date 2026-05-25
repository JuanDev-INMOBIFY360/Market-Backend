export class HardwareService {
	printTicket(ticketContent: string): void {
		if (process.env.NODE_ENV === "development") {
			console.log("=== TICKET A IMPRIMIR ===");
			console.log(ticketContent);
			console.log("========================");
		} else {
			//hacete la logica aca chaval del la impresora xd
		}
	}

	openCashDrawer(): void {
		if (process.env.NODE_ENV === "development") {
			console.log("🔔 Abriendo cajón de efectivo (simulado)");
		} else {
			//cuando tengamos una cajon xdn
		}
	}
}
