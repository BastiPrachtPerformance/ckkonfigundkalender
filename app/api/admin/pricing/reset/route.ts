import { isAdminRequest, resetBookingPricing, unauthorized } from "../../../../../db/booking";

export async function POST(request: Request) {
  if (!await isAdminRequest(request)) return unauthorized();
  return Response.json(await resetBookingPricing());
}
