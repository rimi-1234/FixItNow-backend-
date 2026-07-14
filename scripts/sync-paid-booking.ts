import prisma from '../src/lib/prisma.js';

const bookingId = '6eb2b17d-22af-4ac9-9e29-f1d3f95502b3';

async function main() {
  let booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  console.log('Before:', {
    bookingStatus: booking?.status,
    paymentStatus: booking?.payment?.status,
  });

  // Stripe payment already succeeded, but webhook may have been missed
  // because stripe listen was on a different account.
  if (booking?.payment && booking.payment.status !== 'COMPLETED') {
    await prisma.payment.update({
      where: { bookingId },
      data: { status: 'COMPLETED', paidAt: new Date() },
    });
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'PAID' },
    });
    console.log('Synced: payment COMPLETED, booking PAID');
  } else {
    console.log('Already synced or no payment found');
  }

  booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  });

  console.log('After:', {
    bookingStatus: booking?.status,
    paymentStatus: booking?.payment?.status,
    paidAt: booking?.payment?.paidAt,
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
