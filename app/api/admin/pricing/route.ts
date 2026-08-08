import { getBookingPricing, isAdminRequest, saveBookingPricing, unauthorized } from "../../../../db/booking";

export async function GET(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  return Response.json(await getBookingPricing());
}

export async function PUT(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  const pricing = await request.json() as Record<string, unknown>;
  if (!pricing || typeof pricing !== "object" || !pricing.halls || !pricing.locations || !pricing.settings) {
    return Response.json({ error: "Die Preis- und Texteinstellungen sind unvollständig." }, { status: 400 });
  }
  return Response.json(await saveBookingPricing(pricing));
}
