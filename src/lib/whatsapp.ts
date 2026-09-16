import type { Order } from '../types'

function fmt(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`
}

function itemLines(order: Order) {
  return order.items.map((i) => `  • ${i.productName} × ${i.quantity} — ${fmt(i.subtotal)}`).join('\n')
}

export function buildOrderConfirmedMessage(order: Order): string {
  return `Hello ${order.customerName ?? 'there'}

Your order *#${order.id}* has been *confirmed* - thank you for shopping with Nirote!

*Order Summary:*
${itemLines(order)}

*Total: ${fmt(order.finalAmount)}*

We'll notify you once your order is shipped. For any queries, reply here.

- Team Nirote`
}

export function buildOrderShippedMessage(order: Order): string {
  const tracking = order.awbCode ? `\n*Tracking ID:* ${order.awbCode}` : ''
  return `Hello ${order.customerName ?? 'there'}

Great news! Your Nirote order *#${order.id}* has been *shipped* and is on its way to you!${tracking}

*Items:*
${itemLines(order)}

Expected delivery in 5-7 business days. You can track your parcel using the tracking ID above.

For any queries, just reply here. Thank you for choosing Nirote!

- Team Nirote`
}

export function buildOrderDeliveredMessage(order: Order): string {
  return `Hello ${order.customerName ?? 'there'}

Your Nirote order *#${order.id}* has been *delivered*!

We hope you love your new jewellery! If you enjoy it, we'd love a review - it helps us a lot.

For any issues, we're always here to help. Just reply to this message.

Thank you for being a valued Nirote customer!

- Team Nirote`
}

export function buildOrderCancelledMessage(order: Order): string {
  return `Hello ${order.customerName ?? 'there'}

We're sorry to inform you that your Nirote order *#${order.id}* (${fmt(order.finalAmount)}) has been *cancelled*.

If you paid online, a refund will be processed within 5-7 business days.

For any questions, please reply here or contact us at hello.nirote@gmail.com.

We hope to serve you again soon!

- Team Nirote`
}

// Swap this function's internals for an API call (AiSensy / Interakt / etc.) without touching callers
export function openWhatsApp(phone: string, message: string): void {
  const cleaned = phone.replace(/\D/g, '')
  const number = cleaned.startsWith('91') ? cleaned : `91${cleaned}`
  window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
}
