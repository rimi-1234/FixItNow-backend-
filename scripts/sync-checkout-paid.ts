import prisma from '../src/lib/prisma.js';

const bookingIds = [
  'ef247a95-307b-4eb9-8e53-dd4f2ca9dafd',
  '030a4097-5a11-4980-b8c6-7df256cd4e8b',
  '49a2aa91-3003-46d3-847e-97178dac08af',
];

async function main() {
  for (const bookingId of bookingIds) {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: { payment: true },
    });

    if (!booking?.payment) {
      console.log(bookingId, 'SKIP no payment');
      continue;
    }

    if (booking.payment.status === 'COMPLETED' && booking.status === 'PAID') {
      console.log(bookingId, 'already PAID');
      continue;
    }

    await prisma.payment.update({
      where: { bookingId },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'PAID' },
    });

    console.log(bookingId, 'synced -> PAID / COMPLETED');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
