import { getBookingPricing, isAdminRequest, saveBookingPricing, unauthorized, validBookingPricing } from "../../../../db/booking";

export async function GET(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  return Response.json(await getBookingPricing());
}

export async function PUT(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  const pricing = await request.json() as Record<string, unknown>;
  if (!validBookingPricing(pricing)) {
    return Response.json({ error: "Die Preis-, Saal- oder Calendly-Einstellungen sind ungültig oder unvollständig." }, { status: 400 });
  }
  return Response.json(await saveBookingPricing(pricing));
}
